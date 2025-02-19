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
    return bestCounts.length > 0 ? abbreviateNumbers(bestCounts) : "N/A";
}

/**
 * Formats player count as a range or single number.
 * @param {Object} game - The game object.
 * @returns {sstring} - Formatted player count range.
 */
export function formatPlayerCountRange(game) {
    return game.minPlayers === game.maxPlayers ? `${game.minPlayers}` : `${game.minPlayers}-${game.maxPlayers}`;
}

/**
 * Abbreviates an array of numbers into a string.
 * Successive numbers are represented as a range.
 * @param {Array<number>} numbers - Array of numbers to abbreviate.
 * @returns {string} - Abbreviated string.
 */
export function abbreviateNumbers(numbers) {
    if (!numbers || numbers.length === 0) return "";

    numbers.sort((a, b) => a - b);

    let result = [];
    let start = numbers[0];
    let end = numbers[0];

    for (let i = 1; i < numbers.length; i++) {
        if (numbers[i] === end + 1) {
            end = numbers[i];
        } else {
            result.push(start === end ? `${start}` : `${start}-${end}`);
            start = numbers[i];
            end = numbers[i];
        }
    }
    result.push(start === end ? `${start}` : `${start}-${end}`);

    return result.join(", ");
}

// Decodes HTML entities like &#039; to actual characters
export function decodeEntities(text) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
}

export function getEstimatedPlaytime(game, playerCount) {
    const { minPlayers, maxPlayers, minPlaytime, maxPlaytime } = game;

    if (minPlaytime === maxPlaytime) return minPlaytime; // Keine Range

    if (!playerCount || playerCount < minPlayers || playerCount > maxPlayers) {
        return Math.round((minPlaytime + maxPlaytime) / 2); // Mittelwert
    }

    const factor = (playerCount - minPlayers) / (maxPlayers - minPlayers);
    return Math.round(minPlaytime + factor * (maxPlaytime - minPlaytime));
}
