<script>
    import { onMount } from "svelte";

    import { fetchAndLoadGames, games } from "$lib/stores/gameStore.js";

    import GameFilter from "$lib/components/GameFilter.svelte";
    import GameTable from "$lib/components/GameTable.svelte";
    import { calculateFinalScore } from "$lib/gameScorer.js";
    import Header from "$lib/components/Header.svelte";

    let filteredGames = [];
    let loading = true;
    let filters = {
        playerCount: null,
        targetComplexity: null,
        maxComplexityDeviation: null,
        targetPlaytime: null,
        maxPlaytimeDeviation: null,
    };

    async function initialize() {
        await fetchAndLoadGames();
        filterGames();
        loading = false;
    }

    function applyFilters(event) {
        filters = { ...event.detail };
        filterGames();
    }

    function filterGames() {
        filteredGames = $games
            .filter((game) => {
                // Exclude games that are outside the selected player count range
                if (filters.playerCount) {
                    return (
                        game.minPlayers <= filters.playerCount &&
                        game.maxPlayers >= filters.playerCount
                    );
                }
                return true; // If no player count filter is set, include all games
            })
            .map((game) => {
                const score = filters.playerCount
                    ? calculateFinalScore(
                          game,
                          filters,
                          game.playerRatings || [],
                      )
                    : game.bggRating;

                const bestPlayerCounts = (game.playerRatings || [])
                    .filter(
                        (r) =>
                            r.bestVotes >= r.recommendedVotes &&
                            r.bestVotes >= r.notRecommendedVotes,
                    )
                    .map((r) => r.numPlayers);

                return { ...game, score, bestPlayerCounts };
            })
            .sort((a, b) => b.score - a.score);
    }

    onMount(initialize);
</script>

<Header />
<GameFilter on:filterChange={applyFilters} />

{#if loading}
    <p>Loading games...</p>
{:else}
    <GameTable games={filteredGames} showScore={true} />
{/if}
