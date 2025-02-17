// src/lib/api.js
// fetching games from the backend API

export async function fetchGames() {
    try {
        const response = await fetch("http://localhost:3000/api/games");

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const games = await response.json();

        // Fetch best player counts for each game
        for (const game of games) {
            const playerResponse = await fetch(`http://localhost:3000/api/games/${game.bggId}/player-ratings`);
            if (playerResponse.ok) {
                const playerData = await playerResponse.json();
                game.bestPlayerCounts = playerData.bestPlayerCounts;
            } else {
                game.bestPlayerCounts = [];
            }
        }

        return games;
    } catch (error) {
        console.error("Error fetching games:", error);
        return [];
    }
}
export async function fetchPlayerRatings(bggId) {
    if (!bggId) return []; // Avoid unnecessary requests

    try {
        const response = await fetch(`http://localhost:3000/api/games/${bggId}/player-ratings`);
        if (!response.ok) {
            console.warn(`⚠️ No player ratings found for game ${bggId}.`);
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error("❌ Error fetching player ratings:", error);
        return [];
    }
}
