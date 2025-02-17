// backend/src/setup.js - Initializes the database and fetches BGG data if empty

import db from './db.js';
import { fetchCollection, saveGamesToDatabase } from './bggFetcher.js';
import dotenv from 'dotenv';

dotenv.config();

async function setup() {
    const exists = await db.schema.hasTable('games');
    if (!exists) {
        await db.schema.createTable('games', (table) => {
            table.increments('id').primary();
            table.integer('bggId').notNullable().unique();
            table.string('name').notNullable();
            table.integer('minPlayers').notNullable();
            table.integer('maxPlayers').notNullable();
            table.integer('playtime').notNullable();
            table.float('complexity').nullable();
            table.float('bggRating').nullable();
            table.string('thumbnail').nullable();
            table.string('image').nullable();
            table.integer('yearPublished').nullable();
            table.float('userRating').nullable();
        });

        await db.schema.createTable('player_ratings', (table) => {
            table.increments('id').primary();
            table.integer('gameId').notNullable().references('bggId').inTable('games').onDelete('CASCADE');
            table.integer('numPlayers').notNullable();
            table.integer('bestVotes').defaultTo(0);
            table.integer('recommendedVotes').defaultTo(0);
            table.integer('notRecommendedVotes').defaultTo(0);
        });

        console.log("✅ Database setup complete.");
    }

    const gameCount = await db('games').count('id as count').first();
    if (gameCount.count === 0) {
        console.log("📢 Database is empty. Fetching games from BGG...");
        const bggData = await fetchCollection();
        await saveGamesToDatabase(bggData);
    }
}

export default setup;
