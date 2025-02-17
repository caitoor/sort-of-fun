// frontend/src/lib/utils.js - Shared utility functions

import { fetchGames } from "$lib/api.js";

/**
 * Loads games from the API and returns the fetched array.
 */
export async function loadGames() {
    const games = await fetchGames();
    // console.log("📥 Loaded games from backend:", games);
    return games;
}

/**
 * Determines the best player counts based on votes.
 * @param {Array} playerRatings - Array of player count ratings.
 * @returns {Array} - List of player counts where most votes are for "best".
 */
export function getBestPlayerCounts(playerRatings) {
    if (!playerRatings || playerRatings.length === 0) return [];

    return playerRatings
        .filter(r => r.bestVotes >= r.recommendedVotes && r.bestVotes >= r.notRecommendedVotes)
        .map(r => r.numPlayers);
}

/**
 * Formats the best player counts for display.
 */
export function formatBestPlayerCounts(game) {
    const bestCounts = getBestPlayerCounts(game.playerRatings);
    return bestCounts.length > 0 ? bestCounts.join(", ") : "N/A";
}


/**
 * Formats player count as a range or single number.
 * @param {Object} game - The game object.
 * @returns {string} - Formatted player count range.
 */
export function formatPlayerCountRange(game) {
    return game.minPlayers === game.maxPlayers ? `${game.minPlayers}` : `${game.minPlayers}-${game.maxPlayers}`;
}

/**
 * Sorts an array of games based on a column.
 */
export function sortBy(games, column, sortAscending) {
    if (!Array.isArray(games) || games.length === 0) return [];

    return [...games].sort((a, b) => {
        let valueA = a[column] || "";
        let valueB = b[column] || "";

        if (column === "bggRating" || column === "playtime" || column === "yearPublished") {
            valueA = parseFloat(valueA) || 0;
            valueB = parseFloat(valueB) || 0;
        }

        if (column === "bestPlayerCounts") {
            valueA = getBestPlayerCounts(a.playerRatings).length || 0;
            valueB = getBestPlayerCounts(b.playerRatings).length || 0;
        }

        if (column === "playerCount") {
            valueA = a.minPlayers;
            valueB = b.minPlayers;
        }

        if (typeof valueA === "string") valueA = valueA.toLowerCase();
        if (typeof valueB === "string") valueB = valueB.toLowerCase();

        return (valueA > valueB ? 1 : -1) * (sortAscending ? 1 : -1);
    });
}

