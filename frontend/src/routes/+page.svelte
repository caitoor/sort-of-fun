<script>
    import { onMount } from "svelte";
    import { fetchGames } from "$lib/api.js";
    import Header from "$lib/components/Header.svelte";
    import {
        loadGames,
        sortBy,
        getBestPlayerCounts,
        formatBestPlayerCounts,
        formatPlayerCountRange,
    } from "$lib/utils.js";

    let games = [];
    let loading = true;
    let sortColumn = "name";
    let sortAscending = true;

    onMount(async () => {
        games = await loadGames();
        loading = false;
    });

    function updateSort(column) {
        if (sortColumn === column) {
            sortAscending = !sortAscending;
        } else {
            sortColumn = column;
            sortAscending = true;
        }

        games = [...sortBy(games, column, sortAscending)]; // Ensure reactivity
    }
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
                <th on:click={() => updateSort("name")}>Game Name</th>
                <th on:click={() => updateSort("yearPublished")}>Year</th>
                <th>Players</th>
                <th on:click={() => updateSort("playtime")}>Playtime</th>
                <th on:click={() => updateSort("bggRating")}>Rating</th>
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
