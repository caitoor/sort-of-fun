// backend/src/server.js - Starts the Express server and runs setup if needed

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import gameRoutes from './routes/games.js';
import setup from './setup.js';
import fs from 'fs';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api', gameRoutes);

const PORT = process.env.PORT || 3000;

/**
 * Checks if the SQLite database exists and runs setup if missing.
 */
async function checkDatabaseAndSetup() {
    const dbFile = "./boardgames.sqlite";
    if (!fs.existsSync(dbFile)) {
        console.log("📢 Database not found. Running setup...");
        await setup();
    } else {
        console.log("✅ Database already exists. Skipping setup.");
    }
}

// Run database setup before starting the server
checkDatabaseAndSetup().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
});
