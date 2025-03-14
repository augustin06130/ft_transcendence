/*
import { Database, OPEN_READWRITE, OPEN_CREATE } from 'sqlite3';

function connectToDatabase() {
  const dbPath = '/var/www/database.db'; // Change the path if necessary
  const db = new Database(dbPath, OPEN_READWRITE | OPEN_CREATE, (err) => {
    if (err) {
      console.error("Échec de la connexion à la base de données : " + err.message);
    } else {
      console.log("Connexion à la base de données réussie.");
    }
  });

  return db;
}

// Usage
const db = connectToDatabase();
*/