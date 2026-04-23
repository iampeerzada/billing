const Database = require('better-sqlite3');
const db = new Database('data.db');
const tables = db.prepare("SELECT name, type FROM sqlite_master;").all();
console.log(tables);

const invoicesInfo = db.prepare("PRAGMA table_info(invoices)").all();
console.log(invoicesInfo);
