const Database = require('better-sqlite3');
const db = new Database('data.db');
const table = 'invoices';
const data = { type: 'invoice', invoiceNumber: '123' };

const tableInfo = db.prepare(`PRAGMA table_info(${table})`).all();
const validColumns = tableInfo.map(col => col.name);
console.log('validColumns:', validColumns);

let keys = Object.keys(data).filter(k => validColumns.includes(k) && k !== 'tenantId' && k !== 'companyId');
console.log('keys before:', keys);

keys = keys.filter(k => validColumns.includes(k));
console.log('keys after:', keys);
