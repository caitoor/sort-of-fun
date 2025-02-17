// frontend/src/lib/utils.js - Shared utility functions

import { fetchGames } from "$lib/api.js";

/**
 * Loads games from the API and returns the fetched array.
 */
export async function loadGames() {
    const games = await fetchGames();
    console.log("📥 Loaded games from backend:", games);
    return games;
}

/**
 * Formats the best player counts for display.
 */
export function formatBestPlayerCounts(game) {
    if (!game.bestPlayerCounts || game.bestPlayerCounts.length === 0) return "N/A";
    return game.bestPlayerCounts.join(", ");
}

/**
 * Formats player count as a range or single number.
 */
export function formatPlayerCountRange(game) {
    return game.minPlayers === game.maxPlayers ? `${game.minPlayers}` : `${game.minPlayers}-${game.maxPlayers}`;
}

/**
 * Sorts an array of games based on a column.
 */
export function sortBy(games, column, sortAscending) {
    return [...games].sort((a, b) => {
        let valueA = a[column] || "";
        let valueB = b[column] || "";

        if (column === "bggRating" || column === "playtime" || column === "yearPublished") {
            valueA = parseFloat(valueA) || 0;
            valueB = parseFloat(valueB) || 0;
        }

        if (column === "bestPlayerCounts") {
            valueA = a.bestPlayerCounts?.length || 0;
            valueB = b.bestPlayerCounts?.length || 0;
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
