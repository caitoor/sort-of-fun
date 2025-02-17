// backend/src/db.js

import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const db = knex({
    client: 'sqlite3',
    connection: { filename: './boardgames.sqlite' },
    useNullAsDefault: true
});

export default db;
