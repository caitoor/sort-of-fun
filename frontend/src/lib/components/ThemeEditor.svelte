<script>
    import { get } from "svelte/store";
    import { themes } from "$lib/stores/themeStore.js";
    import { hoveredGameId } from "$lib/stores/store.js";
    export let allThemes = [];
    export let bggId;
    export let addTheme;
    export let removeTheme;

    let newTheme = "";
    let filteredThemes = [];
    let showDropdown = false;

    $: gameThemes = $themes[bggId] || [];

    // Dynamically filter themes as user types
    $: {
        const input = newTheme.trim().toLowerCase();
        showDropdown = input.length > 0;
        filteredThemes = allThemes.filter((theme) =>
            theme.toLowerCase().startsWith(input),
        );
    }

    // $: console.log("🛠️ allThemes in ThemeEditor:", allThemes);

    function handleSelectTheme(theme) {
        newTheme = "";
        showDropdown = false;
        addTheme(bggId, theme);
    }

    async function handleAddTheme(bggId) {
        if (!newTheme.trim()) return; // Prevent adding empty themes

        let themeToAdd = newTheme.trim();
        newTheme = "";

        await addTheme(bggId, themeToAdd);
    }

    function updateFilteredThemes(inputValue) {
        if (!Array.isArray(allThemes) || allThemes.length === 0) {
            console.warn("⚠️ No available themes for filtering.");
            return;
        }

        filteredThemes = allThemes.filter((theme) =>
            theme.toLowerCase().startsWith(inputValue.toLowerCase()),
        );
    }
</script>

<div class="theme-container">
    {#each gameThemes as theme}
        <span class="theme-tag">
            {theme}
            <button
                class="remove-theme"
                on:click={() => removeTheme(bggId, theme)}>X</button
            >
        </span>
    {/each}
    {#if $hoveredGameId === bggId}
        <div class="theme-input-container">
            <input
                type="text"
                bind:value={newTheme}
                placeholder="Add theme..."
                on:keydown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        addTheme(bggId, newTheme);
                        newTheme = "";
                    }
                }}
                class="theme-input"
            />
            {#if showDropdown && filteredThemes.length > 0}
                <ul class="dropdown">
                    {#each filteredThemes as theme}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                        <li on:click={() => handleSelectTheme(theme)}>
                            {theme}
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    {/if}
</div>

<style>
    .theme-container {
        display: flex;
        flex-wrap: wrap;
    }
    .theme-input-container {
        position: relative;
        display: inline-block;
    }
    .dropdown {
        position: absolute;
        width: 100%;
        background: #333;
        border: 1px solid #555;
        max-height: 150px;
        overflow-y: auto;
        list-style: none;
        padding: 0;
        margin: 0;
        z-index: 10;
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
</style>
