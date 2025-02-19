// backend/src/routes/themes.js - API routes for game themes

import express from 'express';
import db from '../db.js';

const router = express.Router();

/**
 * Get all themes for a specific game.
 */
router.get('/:bggId', async (req, res) => {
    // console.info("📡 Fetching themes for game:", req.params.bggId);
    try {
        const themes = await db('game_themes')
            .where({ bggId: req.params.bggId })
            .select('theme');

        // Return an empty array instead of 404 if no themes exist
        res.json(themes.length ? themes.map(t => t.theme) : []);
    } catch (error) {
        console.error("❌ Error fetching themes:", error);
        res.status(500).json({ error: 'Error fetching themes' });
    }
});


/**
 * Add a new theme to a game, preventing duplicates and enforcing case consistency.
 */
router.post('/:bggId', async (req, res) => {
    console.log(`📌 Adding theme for game ${req.params.bggId}:`, req.body);

    try {
        let { theme } = req.body;
        if (!theme) {
            return res.status(400).json({ error: "Theme is required." });
        }

        theme = theme.trim(); // Normalize input

        // Check if the game exists
        const gameExists = await db('games').where({ bggId: req.params.bggId }).first();
        if (!gameExists) {
            return res.status(404).json({ error: "Game not found." });
        }

        // Check if the theme already exists for this specific game (case-insensitive)
        const existingTheme = await db('game_themes')
            .where({ bggId: req.params.bggId })
            .andWhereRaw('LOWER(theme) = LOWER(?)', [theme])
            .first();

        if (existingTheme) {
            console.warn(`⚠️ Theme "${theme}" already exists for game ${req.params.bggId}.`);
            return res.status(409).json({ error: "Theme already exists for this game." });
        }

        // Check if the theme exists globally in another game to reuse the correct capitalization
        const globalTheme = await db('game_themes')
            .whereRaw('LOWER(theme) = LOWER(?)', [theme])
            .first();

        if (globalTheme) {
            console.log(`🔄 Using existing capitalization: "${globalTheme.theme}"`);
            theme = globalTheme.theme; // Use the existing theme capitalization
        }

        // Insert the new theme with the correct capitalization
        await db('game_themes').insert({ bggId: req.params.bggId, theme });

        console.log(`✅ Theme "${theme}" added successfully for game ${req.params.bggId}.`);
        res.status(201).json({ success: true, theme });

    } catch (error) {
        console.error("❌ Error adding theme:", error);
        res.status(500).json({ error: 'Error adding theme' });
    }
});


/**
 * Remove a theme from a game.
 */
router.delete('/:bggId/:theme', async (req, res) => {
    try {
        await db('game_themes')
            .where({ bggId: req.params.bggId, theme: req.params.theme })
            .del();
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting theme' });
    }
});

/**
 * Get all distinct themes for auto-completion.
 */
router.get('/', async (req, res) => {
    try {
        const themes = await db('game_themes').distinct('theme');
        res.json(themes.map(t => t.theme));
    } catch (error) {
        console.error("❌ Error fetching themes:", error);
        res.status(500).json({ error: 'Error fetching themes' });
    }
});

export default router;
