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
  hashedPassword: string,
  email: string,
  imagePath: string | null,
  db: Database
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let sql = `
      UPDATE users
      SET username = ?, password = ?, email = ?
    `;
    const params: (string | number | Buffer)[] = [username, hashedPassword, email];

    // Ajout de la mise à jour de l'image si un chemin est fourni
    if (imagePath) {
      sql += `, data = ?`;
      insertImage(userId, imagePath, db, params);
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

// export async function getUserIdByUsername(username: string, db: Database): Promise<number | null> {
//   return new Promise((resolve, reject) => {
//       db.get(
//           'SELECT id FROM users WHERE username = ?',
//           [username],
//           (err, row: { id: number } | undefined) => {
//               if (err) reject(err);
//               else resolve(row?.id ?? null);
//           }
//       );
//   });
// }

async function getUserIdByUsername(username: string, db: Database): Promise<number | null> {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT id FROM users WHERE username = ?',
      [username],
      (err, row: { id: number } | undefined) => {
        if (err) {
          reject(err);
        } else {
          resolve(row?.id ?? null);
        }
      }
    );
  });
}


async function insertImage(userId: number, imagePath: string, db: Database, params: any) {
  const binaryData = fs.readFileSync(imagePath);
  params.push(binaryData);
  await db.run(`UPDATE users SET data = ? WHERE id = ?`, binaryData, userId);
  console.log(`Image ajoutée pour l'utilisateur ID ${userId}`);
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

export async function saveMessage(
  db: Database,
  senderId: number,
  receiverId: number,
  content: string
): Promise<number> {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO messages (sender_id, receiver_id, content)
      VALUES (?, ?, ?)
    `;
    db.run(sql, [senderId, receiverId, content], function(err) {
      if (err) {
        reject(err);
      } else {
        // 'this' refers to the statement object
        resolve(this.lastID);
      }
    });
  });
}

// export async function saveMessage(
//     db: Database,
//     senderId: number,
//     receiverId: number,
//     content: string
// ): Promise<number> {
//     return new Promise<number>((resolve, reject) => {
//         const sql = `
//             INSERT INTO messages (sender_id, receiver_id, content)
//             VALUES (?, ?, ?)
//         `;
//         const params = [senderId, receiverId, content];

//         db.run(sql, params, function(err) {
//             if (err) {
//                 console.error("Error saving message:", err.message);
//                 reject(err);
//             } else {
//                 resolve(this.lastID);
//             }
//         });
//     });
// }

// export async function getConversationMessages(
//     db: Database,
//     userId1: number,
//     userId2: number,
//     limit: number = 100
// ): Promise<any[]> {
//     return new Promise<any[]>((resolve, reject) => {
//         const sql = `
//             SELECT m.*,
//                    u_sender.username as sender_username,
//                    u_receiver.username as receiver_username
//             FROM messages m
//             JOIN users u_sender ON m.sender_id = u_sender.id
//             JOIN users u_receiver ON m.receiver_id = u_receiver.id
//             WHERE (m.sender_id = ? AND m.receiver_id = ?)
//                OR (m.sender_id = ? AND m.receiver_id = ?)
//             ORDER BY m.timestamp DESC
//             LIMIT ?
//         `;
//         const params = [userId1, userId2, userId2, userId1, limit];

//         db.all(sql, params, (err, rows) => {
//             if (err) {
//                 console.error("Error fetching conversation:", err.message);
//                 reject(err);
//             } else {
//                 resolve(rows.reverse()); // Inverser pour avoir l'ordre chronologique
//             }
//         });
//     });
// }

// N'oubliez pas d'ajouter la création de la table messages lors de l'initialisation de la base de données
export async function CreateTableMessages(db: Database): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(sender_id) REFERENCES users(id),
        FOREIGN KEY(receiver_id) REFERENCES users(id)
      );

      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(
        MIN(sender_id, receiver_id),
        MAX(sender_id, receiver_id),
        timestamp
      );

      CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
    `;

        db.run(sql, (err) => {
            if (err) {
                console.error("Error creating messages table:", err.message);
                reject(err);
            } else {
                console.log("The 'messages' table has been created successfully.");
                resolve();
            }
        });
    });
}

// export async function getConversationMessages(
//   db: Database,
//   userId1: number,
//   userId2: number,
//   limit: number = 100
// ): Promise<any[]> {
//   return new Promise((resolve, reject) => {
//     const sql = `
//       SELECT m.*,
//              u_sender.username as sender_username,
//              u_receiver.username as receiver_username
//       FROM messages m
//       JOIN users u_sender ON m.sender_id = u_sender.id
//       JOIN users u_receiver ON m.receiver_id = u_receiver.id
//       WHERE (m.sender_id = ? AND m.receiver_id = ?)
//          OR (m.sender_id = ? AND m.receiver_id = ?)
//       ORDER BY m.timestamp DESC
//       LIMIT ?
//     `;
//     db.all(sql, [userId1, userId2, userId2, userId1, limit], (err, rows) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(rows?.reverse() || []);
//       }
//     });
//   });
// }

export async function getConversationMessages(
  db: Database,
  userId1: number,
  userId2: number,
  limit: number = 100,
): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      const sql = `
          SELECT m.*,
                u_sender.username as sender_username,
                u_receiver.username as receiver_username
          FROM messages m
          JOIN users u_sender ON m.sender_id = u_sender.id
          JOIN users u_receiver ON m.receiver_id = u_receiver.id
          WHERE (m.sender_id = ? AND m.receiver_id = ?)
            OR (m.sender_id = ? AND m.receiver_id = ?)
          ORDER BY m.timestamp DESC
          LIMIT ?
      `;
      const params = [userId1, userId2, userId2, userId1, limit];

      db.all(sql, params, (err, rows) => {
          if (err) {
              console.error("Error fetching conversation:", err.message);
              reject(err);
          } else {
              resolve(rows.reverse()); // Inverser pour avoir l'ordre chronologique
          }
      });
  });
}
