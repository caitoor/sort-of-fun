// src/lib/stores.js
// svelte stores for global state management

import { writable } from 'svelte/store';

export const playerCount = writable(2);
export const players = writable([]);
export const maxPlaytime = writable(120);
export const minComplexity = writable(1);
export const maxComplexity = writable(5);
export const alreadyPlayed = writable(false);
