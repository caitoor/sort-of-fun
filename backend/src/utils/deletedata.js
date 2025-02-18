// deletes tables inside the SQLite table

import sqlite3 from 'sqlite3';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');
const dbPath = join(__dirname, '../../boardgames.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
});

const tables = ['games', 'game_settings', 'player_ratings'];

const deleteTables = async () => {
    for (const table of tables) {
        await new Promise((resolve, reject) => {
            db.run(`DROP TABLE IF EXISTS ${table};`, function (err) {
                if (err) {
                    console.error(`Error deleting table ${table}:`, err.message);
                    reject(err);
                } else {
                    console.log(`Table ${table} deleted.`);
                    resolve();
                }
            });
        });
    }
    db.close(() => console.log('Database connection closed.'));
};

deleteTables().catch(err => {
    console.error('Error:', err);
    db.close();
    process.exit(1);
});
