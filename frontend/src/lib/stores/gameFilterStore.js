import { writable, derived } from "svelte/store";
import { games } from "$lib/stores/gameStore.js";
import { calculateFinalScore } from "$lib/gameScorer.js";

// Filter options
export const playerCount = writable(null);
export const minComplexity = writable(1);
export const maxComplexity = writable(5);
export const minPlaytime = writable(10);
export const maxPlaytime = writable(300);

// Derived store: Applies filters reactively
export const filteredGames = derived(
    [games, playerCount, minComplexity, maxComplexity, minPlaytime, maxPlaytime],
    ([$games, $playerCount, $minComplexity, $maxComplexity, $minPlaytime, $maxPlaytime]) => {
        if (!$games.length) return [];

        return $games
            .map(game => {
                let score = game.bggRating || 0; // Basis ist das BGG-Rating
                let factor = 1; // Multiplikationsfaktor für die Anpassung

                // 1️⃣ Player Count Filter (eliminiert Spiele, falls gesetzt)
                if ($playerCount) {
                    if (game.minPlayers > $playerCount || game.maxPlayers < $playerCount) {
                        return null; // Spiel wird aussortiert
                    }
                }

                // 2️⃣ Complexity Faktor (kein Ausschluss, aber Score-Anpassung)
                if (game.complexity) {
                    if (game.complexity < $minComplexity) {
                        factor *= (game.complexity - ($minComplexity - 1)) / $minComplexity;
                    } else if (game.complexity > $maxComplexity) {
                        factor *= ($maxComplexity + 1 - game.complexity) / (6 - $maxComplexity);
                    }
                }

                // 3️⃣ Playtime Faktor (kein Ausschluss, aber Score-Anpassung)
                const estimatedPlaytime = game.estimatedPlaytime || game.maxPlaytime;
                if (estimatedPlaytime < $minPlaytime) {
                    factor *= (estimatedPlaytime - ($minPlaytime - 5)) / $minPlaytime;
                } else if (estimatedPlaytime > $maxPlaytime) {
                    factor *= ($maxPlaytime + 5 - estimatedPlaytime) / (310 - $maxPlaytime);
                }

                // Endgültigen Score berechnen (BGG Rating * Faktor)
                score *= Math.max(factor, 0.1); // Mindestens 10% behalten (Vermeidung von Score = 0)

                return { ...game, score };
            })
            .filter(game => game !== null) // Entfernte Spiele aus dem Array werfen
            .sort((a, b) => b.score - a.score);
    }
);
