import { Database, OPEN_READWRITE, OPEN_CREATE } from 'sqlite3';

export function connectToDatabase() {
  const dbPath = './database.db'; 
  const db = new Database(dbPath, OPEN_READWRITE | OPEN_CREATE, (err) => {
    if (err) {
      console.error("Échec de la connexion à la base de données : " + err.message);
    } else {
      console.log("Connexion à la base de données réussie.");
    }
  });
  return db;
}

export async function VerifUser(username: string) {
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

export async function CreateTableUser() {
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
  });
}

export async function CheckUserExists(username: string): Promise<boolean> {
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

export async function CreateNewUser(username: string, hashedPassword:string) {
  await CreateTableUser();
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

const db = connectToDatabase();