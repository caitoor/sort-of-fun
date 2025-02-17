// backend/src/db.js - Database setup
import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const db = knex({
    client: 'sqlite3',
    connection: {
        filename: process.env.DB_FILE || './boardgames.sqlite',
    },
    useNullAsDefault: true
});

// Ensure the tables exist
db.schema.hasTable('games').then((exists) => {
    if (!exists) {
        return db.schema.createTable('games', (table) => {
            table.increments('id').primary();
            table.integer('bggId').unique().notNullable();
            table.string('name').notNullable();
            table.integer('minPlayers');
            table.integer('maxPlayers');
            table.integer('playtime');
            table.float('complexity');
            table.float('bggRating');
            table.string('thumbnail');
            table.string('image');
            table.integer('yearPublished');
            table.float('userRating').nullable();
        });
    }
});

db.schema.hasTable('game_themes').then((exists) => {
    if (!exists) {
        return db.schema.createTable('game_themes', (table) => {
            table.increments('id').primary();
            table.integer('bggId').notNullable().references('bggId').inTable('games').onDelete('CASCADE');
            table.string('theme').notNullable();
        });
    }
});

export default db;
