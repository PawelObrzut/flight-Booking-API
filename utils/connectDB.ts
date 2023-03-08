const sqlite3 = require('sqlite3').verbose();

const DBSOURCE = 'db.sqlite';
const db = new sqlite3.Database(DBSOURCE);

export default db;
