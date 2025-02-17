<script>
    import { onMount } from "svelte";
    import { fetchGames } from "$lib/api.js";
    import Header from "$lib/components/Header.svelte";

    let games = [];
    let loading = true;
    let sortColumn = "name";
    let sortAscending = true;

    async function loadGames() {
        games = await fetchGames();
        console.log("📥 Loaded games from backend:", games);
        filterGames();
        loading = false;
    }

    function formatBestPlayerCounts(game) {
        if (!game.bestPlayerCounts || game.bestPlayerCounts.length === 0)
            return "N/A";
        return game.bestPlayerCounts.join(", ");
    }

    function formatPlayerCountRange(game) {
        if (game.minPlayers === game.maxPlayers) return game.minPlayers;
        return `${game.minPlayers}-${game.maxPlayers}`;
    }

    function sortBy(column) {
        if (sortColumn === column) {
            sortAscending = !sortAscending;
        } else {
            sortColumn = column;
            sortAscending = true;
        }

        games = [...games].sort((a, b) => {
            let valueA = a[column] || "";
            let valueB = b[column] || "";

            if (
                column === "bggRating" ||
                column === "playtime" ||
                column === "yearPublished"
            ) {
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

    onMount(loadGames);
</script>

<Header />

{#if loading}
    <p class="loading">Loading games...</p>
{:else if games.length === 0}
    <p class="empty">No games found.</p>
{:else}
    <table>
        <thead>
            <tr>
                <th on:click={() => sortBy("name")}>Game Name</th>
                <th on:click={() => sortBy("yearPublished")}>Year</th>
                <th>Players</th>
                <th on:click={() => sortBy("playtime")}>Playtime</th>
                <th on:click={() => sortBy("bggRating")}>Rating</th>
                <th>Best Player Counts</th>
                <th>Thumbnail</th>
            </tr>
        </thead>
        <tbody>
            {#each games as game}
                <tr>
                    <td>{game.name}</td>
                    <td>{game.yearPublished || "N/A"}</td>
                    <td>{formatPlayerCountRange(game)}</td>
                    <td>{game.playtime} min</td>
                    <td>{game.bggRating ? game.bggRating.toFixed(2) : "N/A"}</td
                    >
                    <td>{formatBestPlayerCounts(game)}</td>
                    <td>
                        {#if game.thumbnail}
                            <img
                                src={game.thumbnail}
                                alt="{game.name} thumbnail"
                            />
                        {/if}
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
{/if}
