import { writable, derived } from "svelte/store";
import { loadGames } from "$lib/utils.js";

// Store for all games
export const games = writable([]);

// Loading state
export const loading = writable(true);

// Sort state
export const sortColumn = writable("name");
export const sortAscending = writable(true);

// Fetch and load games initially
export async function fetchAndLoadGames() {
    loading.set(true);
    const fetchedGames = await loadGames();
    games.set(fetchedGames);
    loading.set(false);
}

// Sorting function (now inside the store)
export function updateSort(column) {
    sortColumn.update((current) => {
        if (current === column) {
            sortAscending.update((asc) => !asc);
        } else {
            sortAscending.set(true);
        }
        return column;
    });
}

// Derived store for sorted games
export const sortedGames = derived(
    [games, sortColumn, sortAscending],
    ([$games, $sortColumn, $sortAscending]) => {
        if (!$games.length) return [];

        return [...$games].sort((a, b) => {
            let valueA = a[$sortColumn] || "";
            let valueB = b[$sortColumn] || "";

            if (["bggRating", "playtime", "yearPublished"].includes($sortColumn)) {
                valueA = parseFloat(valueA) || 0;
                valueB = parseFloat(valueB) || 0;
            }

            if ($sortColumn === "bestPlayerCounts") {
                valueA = a.bestPlayerCounts?.length || 0;
                valueB = b.bestPlayerCounts?.length || 0;
            }

            if ($sortColumn === "playerCount") {
                valueA = a.minPlayers;
                valueB = b.minPlayers;
            }

            if (typeof valueA === "string") valueA = valueA.toLowerCase();
            if (typeof valueB === "string") valueB = valueB.toLowerCase();

            return ($sortAscending ? 1 : -1) * (valueA > valueB ? 1 : -1);
        });
    }
);
