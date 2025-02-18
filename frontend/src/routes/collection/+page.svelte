<script>
    // IMPORTS
    // =======

    // general
    import { onMount } from "svelte";
    import { get } from "svelte/store";

    // components
    import ThemeEditor from "$lib/components/ThemeEditor.svelte";
    import Loader from "$lib/components/Loader.svelte";

    // utils
    import {
        formatBestPlayerCounts,
        formatPlayerCountRange,
        decodeEntities,
    } from "$lib/utils.js";
    import { hoveredGameId } from "$lib/stores/generalStore.js";

    // games
    import {
        fetchAndLoadGames,
        sortedGames,
        updateSort,
        loading,
    } from "$lib/stores/gameStore.js";

    // themes
    import {
        themes,
        allThemes,
        loadThemesForGames,
        addThemeToGame,
        removeThemeFromGame,
    } from "$lib/stores/themeStore.js";

</script>

{#if $loading}
    <div class="loading-container">
        <Loader />
    </div>
{:else if !$sortedGames.length}
    <p class="empty">No games found.</p>
{:else}
    <table>
        <thead>
            <tr>
                <th on:click={() => updateSort("name")}>Game</th>
                <th on:click={() => updateSort("yearPublished")}>Year</th>
                <th>Players</th>
                <th on:click={() => updateSort("playtime")}>Playtime</th>
                <th on:click={() => updateSort("bggRating")}>Rating</th>
                <th>Best at</th>
                <th>Themes</th>
                <th>Thumbnail</th>
            </tr>
        </thead>
        <tbody>
            {#each $sortedGames as game}
                <tr
                    on:mouseenter={() => {
                        // console.log("🔍 Hovering over:", game.bggId);
                        hoveredGameId.set(game.bggId);
                    }}
                    on:mouseleave={() => hoveredGameId.set(null)}
                >
                    <td>{decodeEntities(game.name)}</td>
                    <td>{game.yearPublished || "N/A"}</td>
                    <td>{formatPlayerCountRange(game)}</td>
                    <td>{game.playtime} min</td>
                    <td>{game.bggRating ? game.bggRating.toFixed(2) : "N/A"}</td
                    >
                    <td>{formatBestPlayerCounts(game)}</td>
                    <td>
                        <ThemeEditor
                            bggId={game.bggId}
                            themes={$themes}
                            allThemes={$allThemes}
                            addTheme={addThemeToGame}
                            removeTheme={removeThemeFromGame}
                        />
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
{/if}