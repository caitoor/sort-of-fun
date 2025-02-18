<script>
    import { onMount } from "svelte";
    import { fetchGames } from "$lib/api.js";
    import Header from "$lib/components/Header.svelte";
    import ThemeEditor from "$lib/components/ThemeEditor.svelte";
    import {
        loadGames,
        sortBy,
        formatBestPlayerCounts,
        formatPlayerCountRange,
    } from "$lib/utils.js";
    import {
        themes,
        allThemes,
        loadThemesForGames,
        addThemeToGame,
        removeThemeFromGame,
    } from "$lib/stores/themeStore.js";

    import { hoveredGameId } from "$lib/stores/store.js";

    let games = [];
    let loading = true;
    let sortColumn = "name";
    let sortAscending = true;

    function updateSort(column) {
        sortColumn =
            column === sortColumn ? (sortAscending ? column : null) : column;
        sortAscending = !sortAscending;
        games = [...sortBy(games, column, sortAscending)];
    }

    onMount(async () => {
        games = await loadGames();
        // console.log("📥 Loaded games:", games);

        await loadThemesForGames(games);
        // console.log("📥 Loaded themes:", $themes, $allThemes);

        loading = false;
    });
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
                <th on:click={() => updateSort("name")}>Game</th>
                <th on:click={() => updateSort("yearPublished")}>Year</th>
                <th>Players</th>
                <th on:click={() => updateSort("playtime")}>Playtime</th>
                <th on:click={() => updateSort("bggRating")}>Rating</th>
                <th>Best Player Counts</th>
                <th>Themes</th>
                <th>Thumbnail</th>
            </tr>
        </thead>
        <tbody>
            {#each games as game}
                <tr
                    on:mouseenter={() => {
                        // console.log("🔍 Hovering over:", game.bggId);
                        hoveredGameId.set(game.bggId);
                    }}
                    on:mouseleave={() => hoveredGameId.set(null)}
                >
                    <td>{game.name}</td>
                    <td>{game.yearPublished || "N/A"}</td>
                    <td>{formatPlayerCountRange(game)}</td>
                    <td>{game.playtime} min</td>
                    <td>{game.bggRating ? game.bggRating.toFixed(2) : "N/A"}</td
                    >
                    <td>{formatBestPlayerCounts(game)}</td>
                    <td>
                        <ThemeEditor
                            bggId={game.bggId}
                            {themes}
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

<style>
    .thumbnail {
        height: 80px;
        width: 80px;
        object-fit: cover;
    }
</style>
