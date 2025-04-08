import { Database, OPEN_READWRITE, OPEN_CREATE } from 'sqlite3';
import { FastifyReply } from 'fastify';
import fs from 'fs';

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
        password TEXT NOT NULL,
        name TEXT,
        data BLOB
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
                  console.error('Error checking user existence:', err); // Log the error
                  reject(err);
              } else {
                  resolve(!!row);
              }
          }
      );
  });
}

export async function CreateNewUser(
  username: string,
  hashedPassword: string,
  email: string,
  db: Database,
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
              reject(new Error(`Failed to create user: ${err.message}`));
          } else {
              const userId = this.lastID;
              console.log(`User '${username}' created successfully with ID: ${userId}.`); // Log success
              resolve(userId);
          }
      });
  });
}

export async function EditUserInfo(
  userId: number,
  username: string,
  imagePath: string | null,
  db: Database
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let sql = `
      UPDATE users
      SET username = ?, password = ?, email = ?
    `;
    const params: (string | number | Buffer)[] = [username];

    // Ajout de la mise à jour de l'image si un chemin est fourni
    if (imagePath) {
      sql += `, data = ?`;
      insertImage(userId, imagePath, db);
    }

    sql += ` WHERE id = ?`;
    params.push(userId);

    db.run(sql, params, function (err) {
      if (err) {
        console.error("Error updating user:", err.message);
        reject(new Error(`Failed to update user: ${err.message}`));
      } else {
        console.log(`User '${username}' updated successfully.`);
        resolve();
      }
    });
  });
}


export async function insertImage(userId: number, imagePath: string, db: Database): Promise<void> {
  try {
    const binaryData = await fs.promises.readFile(imagePath);
    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE users SET data = ?, name = ? WHERE id = ?`,  // modifier ca pour qu'il soit compatible avec la table sql
        [binaryData, imagePath,userId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    console.log(`Image par défaut ajoutée pour l'utilisateur ID ${userId}`);
  } catch (err) {
    console.error(`Erreur lors de l'insertion de l'image :`, err);
    throw err; // Propage l'erreur pour la gestion dans NewUser
  }
}

async function retrieveImage(userId: number, outputPath: string, db: Database) {
  return new Promise<void>((resolve, reject) => {
      db.get<{ data: Buffer }>(
          `SELECT data FROM users WHERE id = ?`, 
          [userId], 
          (err, row) => {
              if (err) {
                  reject(err);
                  return;
              }
              if (row && row.data) {
                  fs.writeFileSync(outputPath, row.data);
                  console.log(`Image récupérée et sauvegardée sous ${outputPath}`);
                  resolve();
              } else {
                  console.log(`Aucune image trouvée pour l'utilisateur ID ${userId}`);
                  resolve();
              }
          }
      );
  });
}
