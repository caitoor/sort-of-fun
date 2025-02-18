<script>
    // src/lib/components/GameTable.svelte
    // table of games

    import {
        formatBestPlayerCounts,
        formatPlayerCountRange,
        decodeEntities,
    } from "$lib/utils.js";

    import { sortedGames, updateSort } from "$lib/stores/gameStore.js";

    import { themes } from "$lib/stores/themeStore.js";

    // Function to handle sorting when clicking on column headers
    function handleSort(column) {
        updateSort(column);
    }
</script>

<table>
    <thead>
        <tr>
            <th>Game</th>
            <th>Year</th>
            <th>Players</th>
            <th>Playtime</th>
            <th>Rating</th>
            <th>Best at</th>
            <th>Thumbnail</th>
        </tr>
    </thead>
    <tbody>
        {#each $sortedGames as game}
            <tr>
                <td>
                    <a
                        href={"https://boardgamegeek.com/boardgame/" +
                            game.bggId}
                        target="_blank"
                    >
                        {decodeEntities(game.name)}
                    </a>
                    {#if $themes[game.bggId]?.length}
                        <div class="game-themes">
                            {#each $themes[game.bggId] as theme}
                                <span class="theme-tag">{theme}</span>
                            {/each}
                        </div>
                    {/if}
                </td>

                <td>{game.yearPublished || "N/A"}</td>
                <td>{formatPlayerCountRange(game)}</td>
                <td>{game.playtime} min</td>
                <td>{game.bggRating ? game.bggRating.toFixed(2) : "N/A"}</td>
                <td>{formatBestPlayerCounts(game)}</td>
                <td>
                    {#if game.thumbnail}
                        <img
                            src={game.thumbnail}
                            alt="{game.name} thumbnail"
                            class="thumbnail"
                        />
                    {/if}
                </td>
            </tr>
        {/each}
    </tbody>
</table>

<style>
    .game-themes {
        font-size: 12px;
        margin-top: 4px;
    }

    .theme-tag {
        background: #444;
        color: white;
        padding: 2px 6px;
        margin: 2px;
        border-radius: 12px;
        font-size: 0.8em;
        display: inline-block;
    }
</style>
