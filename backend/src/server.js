// backend/src/server.js - Starts the Express server and runs setup if needed

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import gamesRouter from './routes/games.js';
import themesRouter from './routes/themes.js';
import setup from './setup.js';
import fs from 'fs';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api', gamesRouter);
app.use('/api/themes', themesRouter);

const PORT = process.env.PORT || 3000;

/**
 * Checks if the required tables exist in the SQLite database and runs setup if missing.
 */
async function checkDatabaseAndSetup() {
    const dbFile = "./boardgames.sqlite";

    // If database file does not exist, setup must be run
    if (!fs.existsSync(dbFile)) {
        console.log("📢 Database not found. Running setup...");
        await setup();
        return;
    }

    // Import database connection dynamically
    const db = (await import("./db.js")).default;

    try {
        const tables = await db.raw("SELECT name FROM sqlite_master WHERE type='table'");
        const tableNames = tables.map(t => t.name);

        // Check if both necessary tables exist
        if (!tableNames.includes("games") || !tableNames.includes("player_ratings")) {
            console.log("📢 Required tables missing. Running setup...");
            await setup();
        } else {
            console.log("✅ Database and tables exist. Skipping setup.");
        }
    } catch (error) {
        console.error("❌ Error checking database tables:", error);
        console.log("📢 Running setup as a precaution...");
        await setup();
    }
}

// Run database setup before starting the server
checkDatabaseAndSetup().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
});
