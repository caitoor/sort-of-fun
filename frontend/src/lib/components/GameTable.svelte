<script>
    // src/lib/components/GameTable.svelte
    // table of games
    export let games = [];
    export let showScore = false;
    export let sortColumn = "name";
    export let sortAscending = true;
    export let onSortChange = () => {};

    import {
        formatBestPlayerCounts,
        formatPlayerCountRange,
    } from "$lib/utils.js";

    function handleSort(column) {
        onSortChange(column);
    }
</script>

<table>
    <thead>
        <tr>
            <th on:click={() => handleSort("name")}>Game Name</th>
            <th on:click={() => handleSort("yearPublished")}>Year</th>
            <th on:click={() => handleSort("playerCount")}>Players</th>
            <th on:click={() => handleSort("playtime")}>Playtime</th>
            <th on:click={() => handleSort("bggRating")}>Rating</th>
            <th on:click={() => handleSort("bestPlayerCounts")}
                >Best Player Counts</th
            >
            {#if showScore}
                <th on:click={() => handleSort("score")}>Score</th>
            {/if}
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
                <td>{game.bggRating ? game.bggRating.toFixed(2) : "N/A"}</td>
                <td>{formatBestPlayerCounts(game)}</td>
                {#if showScore}
                    <td>{(game.score ?? 0).toFixed(2)}</td>
                {/if}
                <td>
                    {#if game.thumbnail}
                        <img src={game.thumbnail} alt="{game.name} thumbnail" />
                    {/if}
                </td>
            </tr>
        {/each}
    </tbody>
</table>
