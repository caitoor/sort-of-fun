import db from '../db.js';

export async function getAllGames() {
    return db('games').select('*');
}

export async function addGame(game) {
    return db('games').insert(game);
}

export async function findGameById(id) {
    return db('games').where({ id }).first();
}

export async function deleteGame(id) {
    return db('games').where({ id }).del();
}
