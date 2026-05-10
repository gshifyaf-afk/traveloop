const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'traveloop.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    currency TEXT DEFAULT 'INR',
    saved_destinations TEXT
  );

  CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    description TEXT,
    user_id INTEGER NOT NULL,
    public_token TEXT UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS stops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city_name TEXT NOT NULL,
    city_country TEXT,
    arrival_date TEXT,
    departure_date TEXT,
    stop_order INTEGER,
    trip_id INTEGER NOT NULL,
    FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    cost REAL DEFAULT 0,
    activity_time TEXT,
    category TEXT,
    stop_id INTEGER NOT NULL,
    FOREIGN KEY (stop_id) REFERENCES stops (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS checklist_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT NOT NULL,
    is_packed INTEGER DEFAULT 0,
    category TEXT,
    trip_id INTEGER NOT NULL,
    FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS trip_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    note_text TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    trip_id INTEGER NOT NULL,
    FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
  );
`);

module.exports = db;
