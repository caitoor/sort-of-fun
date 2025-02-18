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
        // Ensure the tables exist before inserting data
        const tables = await db.raw("SELECT name FROM sqlite_master WHERE type='table'");
        const tableNames = tables.map((t) => t.name);

        if (!tableNames.includes("games")) {
            console.log("⚠️ 'games' table missing. Creating table...");
            await db.schema.createTable("games", (table) => {
                table.increments("id").primary();
                table.integer("bggId").unique().notNullable();
                table.string("name").notNullable();
                table.integer("minPlayers");
                table.integer("maxPlayers");
                table.integer("playtime");
                table.integer("minPlaytime");
                table.integer("maxPlaytime");
                table.float("complexity");
                table.float("bggRating");
                table.float("bayesAverage");
                table.float("stdDeviation");
                table.integer("usersRated");
                table.integer("owned");
                table.integer("trading");
                table.integer("wanting");
                table.integer("wishing");
                table.integer("numComments");
                table.integer("numWeights");
                table.float("averageWeight");
                table.string("thumbnail");
                table.string("image");
                table.integer("yearPublished");
                table.timestamp("fetchedAt").defaultTo(db.fn.now());
            });
        }

        if (!tableNames.includes("player_ratings")) {
            console.log("⚠️ 'player_ratings' table missing. Creating table...");
            await db.schema.createTable("player_ratings", (table) => {
                table.increments("id").primary();
                table.integer("gameId").notNullable().references("bggId").inTable("games").onDelete("CASCADE");
                table.integer("numPlayers");
                table.integer("bestVotes");
                table.integer("recommendedVotes");
                table.integer("notRecommendedVotes");
            });
        }

        for (const game of games) {
            console.log(`Processing game: ${game.name?.["#text"]}`);

            const bggId = parseInt(game["@_objectid"]);
            const name = game.name?.["#text"] || null;
            const minPlayers = parseInt(game.stats?.["@_minplayers"]) || 1;
            const maxPlayers = parseInt(game.stats?.["@_maxplayers"]) || 1;
            const playtime = parseInt(game.stats?.["@_playingtime"]) || 30;
            const minPlaytime = parseInt(game.stats?.["@_minplaytime"]) || playtime;
            const maxPlaytime = parseInt(game.stats?.["@_maxplaytime"]) || playtime;
            const bggRating = game.stats?.rating?.average?.["@_value"] ? parseFloat(game.stats.rating.average["@_value"]) : null;
            const bayesAverage = game.stats?.rating?.bayesaverage?.["@_value"] ? parseFloat(game.stats.rating.bayesaverage["@_value"]) : null;
            const stdDeviation = game.stats?.rating?.stddev?.["@_value"] ? parseFloat(game.stats.rating.stddev["@_value"]) : null;
            const usersRated = game.stats?.rating?.usersrated?.["@_value"] ? parseInt(game.stats.rating.usersrated["@_value"]) : 0;
            const owned = game.stats?.rating?.owned?.["@_value"] ? parseInt(game.stats.rating.owned["@_value"]) : 0;
            const trading = game.stats?.rating?.trading?.["@_value"] ? parseInt(game.stats.rating.trading["@_value"]) : 0;
            const wanting = game.stats?.rating?.wanting?.["@_value"] ? parseInt(game.stats.rating.wanting["@_value"]) : 0;
            const wishing = game.stats?.rating?.wishing?.["@_value"] ? parseInt(game.stats.rating.wishing["@_value"]) : 0;
            const numComments = game.stats?.rating?.numcomments?.["@_value"] ? parseInt(game.stats.rating.numcomments["@_value"]) : 0;
            const numWeights = game.stats?.rating?.numweights?.["@_value"] ? parseInt(game.stats.rating.numweights["@_value"]) : 0;
            const averageWeight = game.stats?.rating?.averageweight?.["@_value"] ? parseFloat(game.stats.rating.averageweight["@_value"]) : null;

            // Fetch additional details with delay to prevent rate limits
            const details = await fetchGameDetails(bggId);
            const complexity = details?.complexity || averageWeight; // Use fetched complexity if available
            const playerRatings = details?.playerRatings || {};

            // Insert into the games table
            await db('games').insert({
                bggId,
                name,
                minPlayers,
                maxPlayers,
                playtime,
                minPlaytime,
                maxPlaytime,
                complexity,
                bggRating,
                bayesAverage,
                stdDeviation,
                usersRated,
                owned,
                trading,
                wanting,
                wishing,
                numComments,
                numWeights,
                averageWeight,
                thumbnail: game.thumbnail || null,
                image: game.image || null,
                yearPublished: game.yearpublished ? parseInt(game.yearpublished) : null,
                fetchedAt: db.fn.now(),
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
