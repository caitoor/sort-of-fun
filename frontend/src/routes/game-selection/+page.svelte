<script>
    import { onMount } from "svelte";
    import { fetchGames } from "$lib/api.js";
    import GameFilter from "$lib/components/GameFilter.svelte";
    import { calculateFinalScore } from "$lib/gameScorer.js";
    import Header from "$lib/components/Header.svelte";

    let games = [];
    let filteredGames = [];
    let loading = true;
    let filters = {
        playerCount: null,
        targetComplexity: null,
        maxComplexityDeviation: null,
        targetPlaytime: null,
        maxPlaytimeDeviation: null,
    };

    async function loadGames() {
        games = await fetchGames();
        // console.log("📥 Loaded games from backend:", games); // Add this line
        filterGames();
        loading = false;
    }

    function applyFilters(event) {
        filters = { ...event.detail }; // Ensure reactivity
        // console.log("🔍 Updated filters:", filters);
        filterGames();
    }

    function filterGames() {
        // console.log("🔍 Running filterGames with playerCount:", filters.playerCount);

        filteredGames = games
            .filter((game) => {
                // Ensure player count filtering works
                const isValid = filters.playerCount
                    ? game.minPlayers <= filters.playerCount &&
                      game.maxPlayers >= filters.playerCount
                    : true;
                // console.log(`🎯 Checking ${game.name}: min=${game.minPlayers}, max=${game.maxPlayers}, valid=${isValid}`);
                return isValid;
            })
            .map((game) => {
                const score = filters.playerCount
                    ? calculateFinalScore(
                          game,
                          filters,
                          game.playerRatings || [],
                      )
                    : game.bggRating;
                // Extract best player counts dynamically
                const bestPlayerCounts = (game.playerRatings || [])
                    .filter(
                        (r) =>
                            r.bestVotes >= r.recommendedVotes &&
                            r.bestVotes >= r.notRecommendedVotes,
                    )
                    .map((r) => r.numPlayers);
                // console.log(`🎲 Calculated score for ${game.name}: ${score}`);
                return { ...game, score, bestPlayerCounts };
            })
            .sort((a, b) => b.score - a.score);
    }

    onMount(loadGames);
</script>

<Header />
<GameFilter on:filterChange={applyFilters} />

{#if loading}
    <p>Loading games...</p>
{:else if filteredGames.length === 0}
    <p>No suitable games found.</p>
{:else}
    <table>
        <thead>
            <tr>
                <th>Game Name</th>
                <th>Year</th>
                <th>Players</th>
                <th>Playtime</th>
                <th>Rating</th>
                <th>Best Player Counts</th>
                <th>Score</th>
                <th>Thumbnail</th>
            </tr>
        </thead>
        <tbody>
            {#each filteredGames as game}
                <tr>
                    <td>{game.name}</td>
                    <td>{game.yearPublished || "N/A"}</td>
                    <td
                        >{game.minPlayers === game.maxPlayers
                            ? game.minPlayers
                            : `${game.minPlayers}-${game.maxPlayers}`}</td
                    >

                    <td>{game.playtime} min</td>
                    <td>{game.bggRating ? game.bggRating.toFixed(2) : "N/A"}</td
                    >
                    <td
                        >{game.bestPlayerCounts &&
                        game.bestPlayerCounts.length > 0
                            ? game.bestPlayerCounts.join(", ")
                            : "N/A"}</td
                    >

                    <td>{(game.score ?? 0).toFixed(2)}</td>
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
