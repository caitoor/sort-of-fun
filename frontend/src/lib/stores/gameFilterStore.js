import { writable, derived } from "svelte/store";
import { games } from "$lib/stores/gameStore.js";
import { calculateFinalScore } from "$lib/gameScorer.js";

// Filter options
export const playerCount = writable(null);
export const targetComplexity = writable(null);
export const maxComplexityDeviation = writable(null);
export const targetPlaytime = writable(null);
export const maxPlaytimeDeviation = writable(null);

// Derived store: Applies filters reactively
export const filteredGames = derived(
    [games, playerCount, targetComplexity, maxComplexityDeviation, targetPlaytime, maxPlaytimeDeviation],
    ([$games, $playerCount, $targetComplexity, $maxComplexityDeviation, $targetPlaytime, $maxPlaytimeDeviation]) => {
        if (!$games.length) return [];

        return $games
            .filter(game => {
                if ($playerCount) {
                    return game.minPlayers <= $playerCount && game.maxPlayers >= $playerCount;
                }
                return true;
            })
            .map(game => {
                const score = $playerCount
                    ? calculateFinalScore(game, { playerCount: $playerCount }, game.playerRatings || [])
                    : game.bggRating;

                return { ...game, score };
            })
            .sort((a, b) => b.score - a.score);
    }
);
