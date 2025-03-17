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

export async function CreateTableUser(db: Database): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )`;
    db.run(sql, (err) => {
      if (err) {
        console.error("Error creating table:", err.message); // Log the error
        reject(err);
      } else {
        console.log("The table 'users' has been created successfully."); // Log success
        resolve();
      }
    });
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

export async function CreateNewUser(
  username: string,
  hashedPassword: string,
  email: string,
  db: Database
): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    const sql = `
      INSERT INTO users (username, password, email)
      VALUES (?, ?, ?)
    `;
    const params = [username, hashedPassword, email];

    db.run(sql, params, function (err) {
      if (err) {
        console.error("Error creating user:", err.message); // Log the error
        reject(new Error(`Failed to create user: ${err.message}`)); // Provide more context
      } else {
        const userId = this.lastID; // Get the ID of the newly inserted user
        console.log(`User '${username}' created successfully with ID: ${userId}.`); // Log success
        resolve(userId); // Return the new user's ID
      }
    });
  });
}
