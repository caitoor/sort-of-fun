// frontend/src/lib/utils.js - Shared utility functions

/**
 * Determines the best player counts based on votes.
 * @param {Array} playerRatings - Array of player count ratings.
 * @returns {Array} - List of player counts where most votes are for "best".
 */
export function getBestPlayerCounts(playerRatings) {
    if (!playerRatings || playerRatings.length === 0) return [];

    return playerRatings
        .filter(r => r.bestVotes >= r.recommendedVotes && r.bestVotes >= r.notRecommendedVotes)
        .map(r => r.numPlayers);
}

/**
 * Formats the best player counts for display.
 */
export function formatBestPlayerCounts(game) {
    const bestCounts = getBestPlayerCounts(game.playerRatings);
    return bestCounts.length > 0 ? bestCounts.join(", ") : "N/A";
}

/**
 * Formats player count as a range or single number.
 * @param {Object} game - The game object.
 * @returns {string} - Formatted player count range.
 */
export function formatPlayerCountRange(game) {
    return game.minPlayers === game.maxPlayers ? `${game.minPlayers}` : `${game.minPlayers}-${game.maxPlayers}`;
}
