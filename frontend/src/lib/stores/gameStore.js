import { writable, derived } from "svelte/store";
import { fetchGames } from "$lib/api.js";

// Stores
export const games = writable([]);
export const loading = writable(true);
export const sortColumn = writable("name");
export const sortAscending = writable(true);

const initialized = writable(false);

// Fetch and load games initially
export async function fetchAndLoadGames() {
    loading.set(true);
    const fetchedGames = await fetchGames();
    games.set(fetchedGames);
    loading.set(false);
}

// Function to update sorting preferences
export function updateSort(column) {
    sortColumn.update((currentColumn) => {
        if (currentColumn === column) {
            sortAscending.update((current) => !current);
        } else {
            sortAscending.set(true);
        }
        return column;
    });
}

// Derived store: Sorted games (reactively updates)
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

            if (typeof valueA === "string") valueA = valueA.toLowerCase();
            if (typeof valueB === "string") valueB = valueB.toLowerCase();

            return (valueA > valueB ? 1 : -1) * ($sortAscending ? 1 : -1);
        });
    },
    []
);