import { Database, OPEN_READWRITE, OPEN_CREATE } from 'sqlite3';

export async function VerifUser(username: string, db: Database) {
  return new Promise<any>((resolve, reject) => {
    db.get(
      'SELECT id, password FROM users WHERE username = ?',
      [username],
      (err, row) => {
        if (err) {
          reject(err); // Rejeter la promesse en cas d'erreur
        } else {
          resolve(row); // Résoudre la promesse avec le résultat de la requête
        }
      }
    );
  });
}

export async function CreateTableUser(db: Database) {
  return new Promise<void>((resolve, reject) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )`;
    db.run(sql, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
    console.log("la table a bien etait set.");
  });
}

export async function CheckUserExists(username: string, db: Database): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    db.get(
      'SELECT id FROM users WHERE username = ?',
      [username],
      (err, row) => {
        if (err) {
          reject(err); // Rejeter la promesse en cas d'erreur
        } else {
          resolve(!!row); // Renvoie true si l'utilisateur existe, sinon false
        }
      }
    );
  });
}

export async function CreateNewUser(username: string, hashedPassword:string, db: Database) {
  return new Promise<void>((resolve, reject) => {
    db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}
