<script>
    // IMPORTS

    // general
    import { onMount } from "svelte";
    import { get } from "svelte/store";

    // stores
    import { fetchAndLoadGames, loading, sortedGames } from "$lib/stores/gameStore.js";
    import { loadThemesForGames } from "$lib/stores/themeStore";

    // components
    import GameFilter from "$lib/components/GameFilter.svelte";
    import GameTable from "$lib/components/GameTable.svelte";
    import Loader from "$lib/components/Loader.svelte";

    onMount(async () => {
        await fetchAndLoadGames();
        await loadThemesForGames(get(sortedGames));
    });
</script>

<GameFilter />

{#if $loading}
    <div class="loading-container">
        <Loader />
    </div>
{:else}
    <GameTable />
{/if}
