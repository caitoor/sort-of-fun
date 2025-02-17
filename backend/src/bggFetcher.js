// backend/src/bggFetcher.js - Fetches games from BGG and saves them to the database efficiently

import axios from 'axios';
import db from './db.js';
import { XMLParser } from 'fast-xml-parser';
import dotenv from 'dotenv';

dotenv.config();

const BGG_USERNAME = process.env.BGG_USERNAME || "default_user";
const BGG_API_URL = "https://boardgamegeek.com/xmlapi2";
const parser = new XMLParser({ ignoreAttributes: false });

/**
 * Introduces a delay to prevent hitting API rate limits.
 * @param {number} ms - Delay in milliseconds.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetches the BoardGameGeek collection for the configured user.
 * @returns {Array} List of games or an empty array on failure.
 */
export async function fetchCollection() {
    try {
        console.log(`📢 Fetching BGG collection for user: ${BGG_USERNAME}`);
        const response = await axios.get(`${BGG_API_URL}/collection?username=${BGG_USERNAME}&own=1&excludesubtype=boardgameexpansion&stats=1`, {
            timeout: 15000
        });

        if (response.status !== 200) {
            throw new Error(`❌ BGG API error: ${response.status}`);
        }

        const jsonData = parser.parse(response.data);

        if (!jsonData || !jsonData.items || !jsonData.items.item) {
            console.warn("⚠️ BGG response is empty or incorrect.");
            return [];
        }

        return Array.isArray(jsonData.items.item) ? jsonData.items.item : [jsonData.items.item];
    } catch (error) {
        console.error("❌ Error fetching BGG collection:", error);
        return [];
    }
}

/**
 * Fetches detailed game information including complexity and player ratings.
 * @param {number} gameId - The BGG game ID.
 * @returns {object} Detailed game data or null if unavailable.
 */
async function fetchGameDetails(gameId) {
    await sleep(2000); // Prevent API rate limit issues

    try {
        console.log(`📢 Fetching details for game ID: ${gameId}`);
        const response = await axios.get(`${BGG_API_URL}/thing?id=${gameId}&stats=1`, { timeout: 10000 });

        if (response.status !== 200) {
            throw new Error(`❌ BGG API error for thing: ${response.status}`);
        }

        const jsonData = parser.parse(response.data);
        const item = jsonData.items.item;
        const ratings = item.statistics.ratings;

        // Extract player count ratings
        const playerRatings = {};
        if (item.poll) {
            const numPlayerPoll = item.poll.find((poll) => poll["@_name"] === "suggested_numplayers");
            if (numPlayerPoll && numPlayerPoll.results) {
                numPlayerPoll.results.forEach((entry) => {
                    const numPlayers = entry["@_numplayers"];
                    const best = entry.result.find((r) => r["@_value"] === "Best")?.["@_numvotes"] || 0;
                    const recommended = entry.result.find((r) => r["@_value"] === "Recommended")?.["@_numvotes"] || 0;
                    const notRecommended = entry.result.find((r) => r["@_value"] === "Not Recommended")?.["@_numvotes"] || 0;
                    playerRatings[numPlayers] = { best, recommended, notRecommended };
                });
            }
        }

        return {
            complexity: ratings.averageweight ? parseFloat(ratings.averageweight["@_value"]) : null,
            playerRatings
        };
    } catch (error) {
        console.error(`⚠️ Error fetching details for game ID ${gameId}:`, error);
        return null;
    }
}

/**
 * Saves fetched BGG games to the SQLite database.
 * @param {Array} games - List of games.
 */
export async function saveGamesToDatabase(games) {
    if (!games || games.length === 0) {
        console.warn("⚠️ No valid games to save.");
        return;
    }

    let savedCount = 0;

    try {
        for (const game of games) {
            console.log(`Processing game: ${game.name?.["#text"]}`);

            const bggId = parseInt(game["@_objectid"]);
            const name = game.name?.["#text"] || null;
            const minPlayers = parseInt(game.stats?.["@_minplayers"]) || 1;
            const maxPlayers = parseInt(game.stats?.["@_maxplayers"]) || 1;
            const playtime = parseInt(game.stats?.["@_playingtime"]) || 30;
            const bggRating = game.stats?.rating?.average?.["@_value"] ? parseFloat(game.stats.rating.average["@_value"]) : null;

            // Fetch additional details with delay to prevent rate limits
            const details = await fetchGameDetails(bggId);
            const complexity = details?.complexity || null;
            const playerRatings = details?.playerRatings || {};

            // Insert into the games table
            await db('games').insert({
                bggId,
                name,
                minPlayers,
                maxPlayers,
                playtime,
                complexity,
                bggRating,
                thumbnail: game.thumbnail || null,
                image: game.image || null,
                yearPublished: game.yearpublished ? parseInt(game.yearpublished) : null,
                userRating: null
            });

            // Insert player ratings into separate table
            for (const [numPlayers, ratings] of Object.entries(playerRatings)) {
                await db('player_ratings').insert({
                    gameId: bggId,
                    numPlayers: numPlayers,
                    bestVotes: ratings.best,
                    recommendedVotes: ratings.recommended,
                    notRecommendedVotes: ratings.notRecommended
                });
            }

            savedCount++;
        }

        console.log(`✅ Successfully saved ${savedCount} games to the database.`);
    } catch (error) {
        console.error("❌ Error saving games:", error);
    }
}
