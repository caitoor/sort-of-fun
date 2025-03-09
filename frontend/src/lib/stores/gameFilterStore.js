// src/lib/stores/gameFilterStore.js

import { writable, derived } from "svelte/store";
import { MAX_PLAYTIME } from "./generalStore";
import { getEstimatedPlaytime } from "$lib/utils.js";
import { games } from "$lib/stores/gameStore.js";
import {
    getPlaytimeCoefficient,
    getComplexityCoefficient,
    getPlayerCountCoefficient
} from "$lib/gameScorer.js";


// Filter options
export const playerCount = writable(null);
export const minComplexity = writable(1);
export const maxComplexity = writable(5);
export const minPlaytime = writable(10);
export const maxPlaytime = writable(MAX_PLAYTIME);

// Derived store: Applies filters reactively
export const filteredGames = derived(
    [games, playerCount, minComplexity, maxComplexity, minPlaytime, maxPlaytime],
    ([$games, $playerCount, $minComplexity, $maxComplexity, $minPlaytime, $maxPlaytime]) => {
        if (!$games.length) return [];

        return $games
            .filter(game => {
                // ✅ Exclude games that don't match the player count at all
                if ($playerCount && (game.minPlayers > $playerCount || game.maxPlayers < $playerCount)) {
                    return false; // Completely remove game
                }
                return true;
            })
            .map(game => {
                let score = game.bggRating || 0;
                let factor = 1;

                // Get estimated playtime based on selected player count
                const estimatedPlaytime = getEstimatedPlaytime(game, $playerCount);

                // Compute coefficient factors
                const complexityFactor = getComplexityCoefficient(game.complexity, $minComplexity, $maxComplexity);
                const playtimeFactor = getPlaytimeCoefficient(estimatedPlaytime, $minPlaytime, $maxPlaytime);
                const playerCountFactor = getPlayerCountCoefficient(game, game.playerRatings || [], $playerCount);

                // Logging for debugging specific game (e.g., "Ark Nova")
                if (game.name === "Arche Nova") {
                    console.log(
                        `🎲 ${game.name} → Complexity: ${game.complexity} → Playtime: ${estimatedPlaytime} → ` +
                        `Complexity Factor: ${complexityFactor.toFixed(2)} → Playtime Factor: ${playtimeFactor.toFixed(2)} → ` +
                        `Player Count Factor: ${playerCountFactor.toFixed(2)}`
                    );
                }

                // Apply all coefficients multiplicatively
                factor *= complexityFactor * playtimeFactor * playerCountFactor;
                score *= Math.max(factor, 0.1); // Ensure score never drops below 10% of original BGG rating

                return { ...game, score };
            })
            .sort((a, b) => b.score - a.score);
    }
);
