<script>
    // src/lib/components/GameFilter.svelte
    // filter ui for games

    import {
        playerCount,
        targetComplexity,
        maxComplexityDeviation,
        targetPlaytime,
        maxPlaytimeDeviation,
    } from "$lib/stores/gameFilterStore.js";
</script>

<div class="filter-panel">
    <label>
        Player Count:
        <input
            type="number"
            bind:value={$playerCount}
            min="1"
            placeholder="Any"
        />
    </label>
    <label>
        Target Complexity:
        <input
            type="number"
            step="0.1"
            bind:value={$targetComplexity}
            placeholder="Any"
        />
    </label>
    <label>
        Max Complexity Deviation:
        <input
            type="number"
            step="0.1"
            bind:value={$maxComplexityDeviation}
            placeholder="Any"
        />
    </label>
    <label>
        Target Playtime:
        <input type="number" bind:value={$targetPlaytime} placeholder="Any" />
    </label>
    <label>
        Max Playtime Deviation:
        <input
            type="number"
            bind:value={$maxPlaytimeDeviation}
            placeholder="Any"
        />
    </label>
</div>

<style>
    .filter-panel {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        padding: 10px;
        border: 1px solid #555;
        margin-bottom: 20px;
    }
</style>
