import { writable } from "svelte/store";
import { fetchAllThemes, fetchThemes, addTheme, removeTheme } from "$lib/api.js";

export const themes = writable({});
export const allThemes = writable([]);

/**
 * Load themes for all games
 */
export async function loadThemesForGames(games) {
    if (!Array.isArray(games) || games.length === 0) {
        console.warn("⚠️ No valid games array provided to loadThemesForGames.");
        return;
    }

    const themeMap = {};
    for (let game of games) {
        themeMap[game.bggId] = await fetchThemes(game.bggId);
    }
    themes.set(themeMap);

    const themesList = await fetchAllThemes();
    allThemes.set(themesList || []); // Ensure it's always an array
}

/**
 * Add a theme to a game and update the store.
 */
export async function addThemeToGame(bggId, theme) {
    try {
        await addTheme(bggId, theme);
        themes.update((currentThemes) => {
            const updated = { ...currentThemes };
            if (!updated[bggId]) updated[bggId] = [];
            if (!updated[bggId].includes(theme)) { // Prevent duplicates
                updated[bggId].push(theme);
            }
            return updated;
        });

        allThemes.update((currentThemes) => {
            if (!currentThemes.includes(theme)) {
                return [...currentThemes, theme];
            }
            return currentThemes;
        });
    } catch (error) {
        console.error(`❌ Error adding theme to game ${bggId}:`, error);
    }
}


/**
 * Remove a theme from a game and update the store.
 */
export async function removeThemeFromGame(bggId, theme) {
    await removeTheme(bggId, theme); // API call

    themes.update((currentThemes) => {
        const updated = { ...currentThemes };

        // Remove the theme from the list
        if (updated[bggId]) {
            updated[bggId] = updated[bggId].filter((t) => t !== theme);
        }

        return updated; // Ensure reactivity
    });
}

