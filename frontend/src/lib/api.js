// frontend/src/lib/api.js - Handles API requests

const API_BASE = "http://localhost:3000/api";

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

/**
 * Fetch themes for a game.
 */
export async function fetchThemes(bggId) {
    // console.log(`📡 Fetching themes for bggId:`, bggId);

    if (!bggId) {
        console.warn(`⚠️ Invalid bggId: ${bggId}`);
        return [];
    }

    try {
        const response = await fetch(`${API_BASE}/themes/${bggId}`);
        if (!response.ok) {
            console.warn(`⚠️ No themes found for game ${bggId}.`);
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error(`❌ Error fetching themes for game ${bggId}:`, error);
        return [];
    }
}



/**
 * Add a new theme to a game.
 */
export async function addTheme(bggId, theme) {
    try {
        const response = await fetch(`${API_BASE}/themes/${bggId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ theme }),
        });

        if (!response.ok) {
            throw new Error(`Failed to add theme (Status: ${response.status})`);
        }
    } catch (error) {
        console.error(`❌ Error adding theme to game ${bggId}:`, error);
    }
}


/**
 * Remove a theme from a game.
 */
export async function removeTheme(bggId, theme) {
    await fetch(`${API_BASE}/themes/${bggId}/${theme}`, {
        method: "DELETE",
    });
}

/**
 * Fetch all distinct themes for auto-completion.
 */
export async function fetchAllThemes() {
    try {
        const response = await fetch(`${API_BASE}/themes`);
        if (!response.ok) {
            console.warn("⚠️ No global themes found.");
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error("❌ Error fetching all themes:", error);
        return [];
    }
}

