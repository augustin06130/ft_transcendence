import { Database } from 'sqlite3';
import { Match } from './types';

export async function createTableMatches(db: Database): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const sql = `
			CREATE TABLE IF NOT EXISTS matches (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				player1 TEXT,
				player2 TEXT,
				winner TEXT,
				score1 INTEGER,
				score2 INTEGER,
				travel1 INTEGER,
				travel2 INTEGER,
				rally INTEGER,
				date INTEGER,
				duration INTEGER
			)
		`;
        db.run(sql, err => {
            if (err) {
                console.error('Error creating stats table:', err.message); // Log the error
                reject(err);
            } else {
                console.log("The table 'matches' has been created successfully."); // Log success
                resolve();
            }
        });
    });
}

function objectToStr(obj: Object, ...omits: string[]) {
    return Object.keys(obj).reduce((acc, key, i, arr) => {
        if (omits.includes(key)) return acc;
        return `${acc}${key}${i != arr.length - 1 ? ', ' : ''}`;
    }, '');
}

export async function addMatch(db: Database, match: Match) {
    return new Promise<void>((resolve, reject) => {
        const sql = `
			INSERT INTO matches (${objectToStr(match, 'left', 'right')})
			VALUES (${objectToStr(match)});
		`;
        const params = Object.values(match);
        db.run(sql, params, err => {
            if (err) {
                console.error('Error while inserting match', err.message);
                reject(new Error(`Cannot insert match: ${err.message}`));
                return;
            }
            resolve();
        });
    });
}

export async function getMatches(db: Database, count: number) {
    return new Promise<Match[]>((resolve, reject) => {
        const sql = `
			SELECT *
			FROM matches
			LIMIT ${count};
		`;

        const params = [count];
        db.all<Match>(sql, params, (err, rows) => {
            if (err) {
                console.error('Error while retrieving matches', err.message);
                reject(new Error(`Cannot retrieve matches: ${err.message}`));
                return;
            }
            console.log('rows', rows);
            resolve(rows);
        });
    });
}
