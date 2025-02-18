<script>
    // IMPORTS

    // general
    import { onMount } from "svelte";

    // stores
    import { fetchAndLoadGames, loading } from "$lib/stores/gameStore.js";

    // components
    import GameFilter from "$lib/components/GameFilter.svelte";
    import GameTable from "$lib/components/GameTable.svelte";
    import Header from "$lib/components/Header.svelte";
    import Loader from "$lib/components/Loader.svelte";

    onMount(fetchAndLoadGames);
</script>

<Header />
<GameFilter />

{#if $loading}
    <div class="loading-container">
        <Loader />
    </div>
{:else}
    <GameTable />
{/if}
