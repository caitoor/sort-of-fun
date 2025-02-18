<script>
    import { filteredGames, playerCount } from "$lib/stores/gameFilterStore.js";
    import { themes } from "$lib/stores/themeStore.js";
    import {
        formatBestPlayerCounts,
        formatPlayerCountRange,
        decodeEntities,
    } from "$lib/utils.js";

    function estimatePlaytime(game) {
        const { minPlayers, maxPlayers, minPlaytime, maxPlaytime } = game;

        if (minPlaytime === maxPlaytime) {
            return null; // No range, just use max playtime
        }

        if (
            !$playerCount ||
            $playerCount < minPlayers ||
            $playerCount > maxPlayers
        ) {
            return Math.round((minPlaytime + maxPlaytime) / 2); // No specific player count -> return average playtime
        }

        const factor = ($playerCount - minPlayers) / (maxPlayers - minPlayers);
        return Math.round(minPlaytime + factor * (maxPlaytime - minPlaytime));
    }
</script>

<table>
    <thead>
        <tr>
            <th>Game</th>
            <th class="centered">Players</th>
            <th class="centered">Playtime</th>
            <th class="centered">Complexity</th>
            <th class="centered">Score</th>
            <th></th>
        </tr>
    </thead>
    <tbody>
        {#each $filteredGames as game}
            <tr>
                <td>
                    <!-- Game name and year published -->
                    <a
                        href={"https://boardgamegeek.com/boardgame/" +
                            game.bggId}
                        target="_blank"
                    >
                        {decodeEntities(game.name)}
                    </a>
                    <span class="year-published"
                        >({game.yearPublished || ""})</span
                    >
                    {#if $themes[game.bggId]?.length}
                        <div class="game-themes">
                            {#each $themes[game.bggId] as theme}
                                <span class="theme-tag">{theme}</span>
                            {/each}
                        </div>
                    {/if}
                </td>

                <td>
                    <!-- Player count range and best player counts -->
                    <div class="cell-container">
                        <div>{formatPlayerCountRange(game)}</div>
                        <div class="cell-sub">
                            (Best: {formatBestPlayerCounts(game)})
                        </div>
                    </div>
                </td>

                <td>
                    <!-- Playtime range and estimated playtime -->
                    <div class="cell-container">
                        <div>
                            {estimatePlaytime(game) || game.maxPlaytime} min
                        </div>
                        {#if game.minPlaytime !== game.maxPlaytime}
                            <div class="cell-sub">
                                ({game.minPlaytime} - {game.maxPlaytime})
                            </div>
                        {/if}
                    </div>
                </td>

                <td>
                    <!-- Complexity rating -->
                    <div class="cell-container">
                        {game.complexity ? game.complexity.toFixed(2) : ""}
                    </div>
                </td>

                <td>
                    <!-- Scoring based on BGG rating -->
                    <div class="cell-container">
                        <div>
                            {game.score ? game.score.toFixed(2) : "N/A"}
                        </div>
                        {#if game.bggRating && game.bggRating.toFixed(2) !== game.score.toFixed(2)}
                            <div class="cell-sub">
                                ({game.bggRating.toFixed(2)})
                            </div>
                        {/if}
                    </div>
                </td>
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

    .cell-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .cell-sub,
    .year-published {
        font-size: 0.8em;
        color: #888;
    }
</style>
