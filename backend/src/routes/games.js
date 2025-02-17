// backend/src/routes/games.js - Handles API routes for game management
import express from 'express';
import db from '../db.js';

const router = express.Router();

// Fetch all games with player ratings
router.get('/games', async (req, res) => {
    try {
        const games = await db("games").select("*");

        const playerRatings = await db("player_ratings").select("*");

        // Merge player ratings into games array
        const gamesWithRatings = games.map(game => ({
            ...game,
            playerRatings: playerRatings
                .filter(r => r.gameId === game.bggId)
                .map(r => ({
                    numPlayers: r.numPlayers,
                    bestVotes: r.bestVotes,
                    recommendedVotes: r.recommendedVotes,
                    notRecommendedVotes: r.notRecommendedVotes
                }))
        }));

        res.json(gamesWithRatings);
    } catch (error) {
        console.error("Error fetching games:", error);
        res.status(500).json({ error: "Failed to fetch games." });
    }
});

router.get('/games/:bggId/player-ratings', async (req, res) => {
    const { bggId } = req.params;

    try {
        const playerRatings = await db("player_ratings")
            .where({ gameId: bggId })
            .select("numPlayers", "bestVotes", "recommendedVotes", "notRecommendedVotes");

        if (playerRatings.length === 0) {
            return res.status(404).json({ error: "No player ratings found for this game." });
        }

        res.json(playerRatings);
    } catch (error) {
        console.error(`❌ Error fetching player ratings for game ${bggId}:`, error);
        res.status(500).json({ error: "Failed to fetch player ratings." });
    }
});


export default router;
