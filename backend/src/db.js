// backend/src/db.js - Database setup
import knex from "knex";
import dotenv from "dotenv";

dotenv.config();

const db = knex({
    client: "sqlite3",
    connection: {
        filename: process.env.DB_FILE || "./boardgames.sqlite",
    },
    useNullAsDefault: true,
});

// Ensure the games table exists
db.schema.hasTable("games").then((exists) => {
    if (!exists) {
        return db.schema.createTable("games", (table) => {
            table.increments("id").primary();
            table.integer("bggId").unique().notNullable();
            table.string("name").notNullable();
            table.text("description");
            table.integer("minPlayers");
            table.integer("maxPlayers");
            table.integer("playtime");
            table.integer("minPlaytime");
            table.integer("maxPlaytime");
            table.integer("yearPublished");
            table.integer("minAge");
            table.float("complexity").nullable();
            table.float("bggRating").nullable();
            table.float("bayesAverage").nullable();
            table.float("stdDeviation").nullable();
            table.integer("usersRated").nullable();
            table.integer("owned").nullable();
            table.integer("trading").nullable();
            table.integer("wanting").nullable();
            table.integer("wishing").nullable();
            table.integer("numComments").nullable();
            table.integer("numWeights").nullable();
            table.float("averageWeight").nullable();
            table.string("thumbnail");
            table.string("image");
            table.timestamp("fetchedAt").defaultTo(db.fn.now());
        });
    }
});

// Ensure the game_themes table exists
db.schema.hasTable("game_themes").then((exists) => {
    if (!exists) {
        return db.schema.createTable("game_themes", (table) => {
            table.increments("id").primary();
            table.integer("bggId").notNullable().references("bggId").inTable("games").onDelete("CASCADE");
            table.string("theme").notNullable();
        });
    }
});

export default db;
