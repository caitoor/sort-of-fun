// frontend/src/lib/gameScorer.js - Calculates game scores based on user preferences

export function calculateAdjustedRating(game, playerCountRatings, playerCount) {
    const R = game.bggRating;
    if (!R) return 0;

    // Ensure we use the selected player count for filtering
    const ratingData = playerCountRatings.find(r => r.numPlayers === playerCount);
    if (!ratingData) return R; // No data → return base rating

    const { bestVotes, recommendedVotes, notRecommendedVotes } = ratingData;
    const totalVotes = bestVotes + recommendedVotes + notRecommendedVotes;
    if (totalVotes === 0) return R;

    const P_best = bestVotes / totalVotes;
    const P_rec = recommendedVotes / totalVotes;
    const P_not_rec = notRecommendedVotes / totalVotes;

    return 5 + (R - 5) * (P_best * 1.1 + P_rec * 0.9 + P_not_rec * 0.5);
}

export function calculateComplexityScore(game, targetComplexity, maxDeviation) {
    if (!targetComplexity || !maxDeviation || !game.complexity) return 1;
    return 1 - Math.abs(targetComplexity - game.complexity) / maxDeviation;
}

export function calculatePlaytimeScore(game, targetPlaytime, maxDeviation) {
    if (!targetPlaytime || !maxDeviation || !game.playtime) return 1;
    return 1 - Math.abs(targetPlaytime - game.playtime) / maxDeviation;
}

export function calculateAgeScore(game, youngestPlayerAge) {
    if (!youngestPlayerAge || !game.yearPublished) return 1;
    return 1 - Math.max(0, (game.yearPublished - youngestPlayerAge) / 10);
}

export function calculateFinalScore(game, preferences, playerCountRatings = []) {
    // console.log(`🔎 Calculating final score for ${game.name}`);
    // console.log("➡️ Preferences:", preferences);
    // console.log("➡️ Player Count Ratings:", playerCountRatings);
    const adjustedRating = game.minPlayers === game.maxPlayers
        ? game.bggRating // Don't modify score if only one valid player count
        : calculateAdjustedRating(game, playerCountRatings, preferences.playerCount);
    // console.log(`🎯 Adjusted Rating for ${game.name}:`, adjustedRating);
    const complexityScore = preferences.targetComplexity
        ? calculateComplexityScore(game, preferences.targetComplexity, preferences.maxComplexityDeviation)
        : 1; // If no complexity filter, no penalty

    const playtimeScore = preferences.targetPlaytime
        ? calculatePlaytimeScore(game, preferences.targetPlaytime, preferences.maxPlaytimeDeviation)
        : 1; // If no playtime filter, no penalty

    return adjustedRating;
}
