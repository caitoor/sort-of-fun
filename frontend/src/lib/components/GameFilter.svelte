<script>
    // src/lib/components/GameFilter.svelte
    import {
        playerCount,
        minComplexity,
        maxComplexity,
        minPlaytime,
        maxPlaytime,
    } from "$lib/stores/gameFilterStore.js";
    import RangeSlider from "svelte-range-slider-pips";

    // Lokale Werte für Range-Slider (initialisieren)
    let complexityRange = [1, 5];
    let playtimeRange = [10, 180];

    // Funktion: Aktualisiert Complexity-Store
    function updateComplexityRange(value) {
        complexityRange = value.detail.values;
        minComplexity.set(complexityRange[0]);
        maxComplexity.set(complexityRange[1]);
        // console.log(`🔹 Complexity Range: ${$minComplexity} - ${$maxComplexity}`);
    }

    // Funktion: Aktualisiert Playtime-Store
    function updatePlaytimeRange(value) {
        playtimeRange = value.detail.values;
        minPlaytime.set(playtimeRange[0]);
        maxPlaytime.set(playtimeRange[1]);
        // console.log(`🔹 Playtime Range: ${$minPlaytime} - ${$maxPlaytime}`);
    }
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

    <!-- Complexity Range Slider -->
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label>Complexity: {$minComplexity} - {$maxComplexity}</label>
    <RangeSlider
        bind:values={complexityRange}
        min={1}
        max={5}
        step={0.1}
        float
        pips
        pushy
        range
        on:change={updateComplexityRange}
    />

    <!-- Playtime Range Slider -->
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label>Playtime: {$minPlaytime} - {$maxPlaytime} min</label>
    <RangeSlider
        bind:values={playtimeRange}
        min={10}
        max={180}
        step={5}
        pips
        float
        pushy
        range
        on:change={updatePlaytimeRange}
    />
</div>

<style>
    .filter-panel {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 10px;
        border: 1px solid #ccc;
        margin-bottom: 20px;
    }
</style>
