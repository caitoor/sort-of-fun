// src/lib/gameScorer.js

const PLAYERCOUNT_FACTOR_BEST = 1.1;
const PLAYERCOUNT_FACTOR_RECOMMENDED = .9;
const PLAYERCOUNT_FACTOR_NOT_RECOMMENDED = 0.3;

export function getPlaytimeCoefficient(estimatedPlaytime, minPlaytime, maxPlaytime) {
    maxPlaytime = Math.min(maxPlaytime, 180);
    if (estimatedPlaytime > maxPlaytime) {
        return maxPlaytime / estimatedPlaytime;
    }
    if (estimatedPlaytime < minPlaytime) {
        return estimatedPlaytime / minPlaytime;
    }
    return 1;
}

export function getComplexityCoefficient(gameComplexity, minComplexity, maxComplexity) {
    if (!gameComplexity) return 1;

    if (gameComplexity > maxComplexity) {
        return maxComplexity / gameComplexity;
    }
    if (gameComplexity < minComplexity) {
        return gameComplexity / minComplexity;
    }
    return 1;
}

export function getPlayerCountCoefficient(game, playerCountRatings, selectedPlayerCount) {
    if (!selectedPlayerCount || !playerCountRatings.length) return 1;
    if (game.minPlayers === game.maxPlayers) return 1;

    const ratingData = playerCountRatings.find(r => r.numPlayers === selectedPlayerCount);
    if (!ratingData) return 1; // No specific rating data → No adjustment

    const { bestVotes, recommendedVotes, notRecommendedVotes } = ratingData;
    const totalVotes = bestVotes + recommendedVotes + notRecommendedVotes;
    if (totalVotes === 0) return 1; // No votes → Neutral coefficient

    const P_best = bestVotes / totalVotes;
    const P_rec = recommendedVotes / totalVotes;
    const P_not_rec = notRecommendedVotes / totalVotes;

    return P_best * PLAYERCOUNT_FACTOR_BEST + P_rec * PLAYERCOUNT_FACTOR_RECOMMENDED + P_not_rec * PLAYERCOUNT_FACTOR_NOT_RECOMMENDED;
}
