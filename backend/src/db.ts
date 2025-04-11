import { Database, OPEN_READWRITE, OPEN_CREATE } from 'sqlite3';
import { createTableFriends } from './friends';
import { createTableMatches } from './matches';
import { createTableUser, startUsersCleaning } from './user';
import { runPromise } from './promise';


export function openDatabase() {
    const dbPath = './database.db';
    const db = new Database(dbPath, OPEN_READWRITE | OPEN_CREATE, err => {
        if (err) {
            console.error('Error connection to database: ' + err.message);
        } 
    });
    return db;
}

export async function setupDatabaseTables() {
    await createTableUser();
    await createTableMatches();
    await createTableFriends();
    await runPromise('PRAGMA foreign_keys = ON;');
    startUsersCleaning();
}

