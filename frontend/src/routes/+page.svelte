<script>
    import { onMount } from "svelte";
    import {
        fetchGames,
        fetchThemes,
        addTheme,
        removeTheme,
        fetchAllThemes,
    } from "$lib/api.js";
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

    // Themes management
    let themes = {};
    let allThemes = [];
    let newTheme = {};
    let filteredThemes = {}; // Stores the filtered themes per game
    let hoveredGame = null;
    let showDropdown = {}; // Controls dropdown visibility per game

    function updateSort(column) {
        if (sortColumn === column) {
            sortAscending = !sortAscending;
        } else {
            sortColumn = column;
            sortAscending = true;
        }

        games = [...sortBy(games, column, sortAscending)];
    }

    function updateFilteredThemes(bggId) {
        const inputValue = newTheme[bggId]?.trim().toLowerCase() || "";
        showDropdown[bggId] = inputValue.length > 0;

        if (inputValue.length > 0) {
            // Only show themes that **start** with the typed text
            filteredThemes[bggId] = allThemes.filter((theme) =>
                theme.toLowerCase().startsWith(inputValue),
            );
        } else {
            filteredThemes[bggId] = [];
        }
    }

    function selectTheme(bggId, theme) {
        newTheme[bggId] = theme;
        showDropdown[bggId] = false;
        handleAddTheme(bggId); // Automatically add the theme
    }

    async function handleAddTheme(bggId) {
        if (!newTheme[bggId]) return;

        let themeToAdd = newTheme[bggId].trim();
        newTheme[bggId] = ""; // Reset input field immediately

        // Find existing theme (case-insensitive)
        const existingTheme = allThemes.find(
            (theme) => theme.toLowerCase() === themeToAdd.toLowerCase(),
        );

        if (existingTheme) {
            themeToAdd = existingTheme; // Use correct capitalization
        }

        // Prevent duplicate themes for the same game
        if (
            themes[bggId]?.some(
                (theme) => theme.toLowerCase() === themeToAdd.toLowerCase(),
            )
        ) {
            console.warn(
                `⚠️ Theme "${themeToAdd}" already exists for this game.`,
            );
            return;
        }

        await addTheme(bggId, themeToAdd);

        // Ensure reactivity
        themes = {
            ...themes,
            [bggId]: [...(themes[bggId] || []), themeToAdd],
        };
    }

    async function handleRemoveTheme(bggId, theme) {
        await removeTheme(bggId, theme);
        themes = {
            ...themes,
            [bggId]: themes[bggId].filter((t) => t !== theme),
        };
    }

    onMount(async () => {
        games = await loadGames();
        allThemes = await fetchAllThemes();

        // Fetch themes for each game
        for (let game of games) {
            themes[game.bggId] = await fetchThemes(game.bggId);
        }

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
                <th on:click={() => updateSort("name")}>Game Name</th>
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
                    on:mouseenter={() => (hoveredGame = game.bggId)}
                    on:mouseleave={() => (hoveredGame = null)}
                >
                    <td>{game.name}</td>
                    <td>{game.yearPublished || "N/A"}</td>
                    <td>{formatPlayerCountRange(game)}</td>
                    <td>{game.playtime} min</td>
                    <td>{game.bggRating ? game.bggRating.toFixed(2) : "N/A"}</td
                    >
                    <td>{formatBestPlayerCounts(game)}</td>
                    <td>
                        {#each themes[game.bggId] || [] as theme}
                            <span class="theme-tag">
                                {theme}
                                <button
                                    class="remove-theme"
                                    on:click={() =>
                                        handleRemoveTheme(game.bggId, theme)}
                                    >X</button
                                >
                            </span>
                        {/each}

                        {#if hoveredGame === game.bggId}
                            <div class="theme-input-container">
                                <div class="input-wrapper">
                                    <input
                                        type="text"
                                        bind:value={newTheme[game.bggId]}
                                        placeholder="Add theme..."
                                        on:input={() =>
                                            updateFilteredThemes(game.bggId)}
                                        on:keydown={(event) => {
                                            if (event.key === "Enter") {
                                                event.preventDefault();
                                                handleAddTheme(game.bggId);
                                            }
                                        }}
                                        class="theme-input"
                                    />

                                    {#if showDropdown[game.bggId] && filteredThemes[game.bggId]?.length > 0}
                                        <ul class="dropdown">
                                            {#each filteredThemes[game.bggId] as theme}
                                                <!-- svelte-ignore a11y_click_events_have_key_events -->
                                                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                                                <li
                                                    on:click={() =>
                                                        selectTheme(
                                                            game.bggId,
                                                            theme,
                                                        )}
                                                >
                                                    {theme}
                                                </li>
                                            {/each}
                                        </ul>
                                    {/if}
                                </div>

                                <button
                                    class="add-theme-button"
                                    on:click={() => handleAddTheme(game.bggId)}
                                    >Add</button
                                >
                            </div>
                        {/if}
                    </td>

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

<style>
    .theme-input-container {
        display: flex;
        align-items: center;
        gap: 5px;
        width: 100%;
    }

    .input-wrapper {
        position: relative;
        display: inline-block;
        width: 100%;
    }

    .theme-input {
        padding: 4px 8px;
        font-size: 14px;
    }

    .dropdown {
        position: absolute;
        left: 0;
        top: 100%;
        width: 100%;
        background: #333;
        border: 1px solid #555;
        list-style: none;
        padding: 0;
        margin: 0;
        z-index: 10;
        max-height: 150px;
        overflow-y: auto;
    }

    .dropdown li {
        padding: 6px;
        cursor: pointer;
        color: white;
    }

    .dropdown li:hover {
        background: #444;
    }

    .theme-tag {
        display: inline-flex;
        align-items: center;
        background: #333;
        color: white;
        padding: 2px 0.5em;
        margin: 2px;
        border-radius: 1.5em;
        font-size: 0.75em;
        border: 1px solid white;
    }

    .remove-theme {
        background: none;
        border: none;
        cursor: pointer;
        margin-left: 0.5em;
        color: white;
    }

    .add-theme-button {
        background: #444;
        color: white;
        border: none;
        padding: 6px 12px;
        cursor: pointer;
        flex-shrink: 0;
    }

    .add-theme-button:hover {
        background: #666;
    }
</style>
