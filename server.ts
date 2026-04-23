import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import cors from "cors";

const dbPath = path.join(process.cwd(), "data.db");
const db = new Database(dbPath);

// Full Multi-Tenant & Multi-Company Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    loginId TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    planId TEXT,
    expiryDate TEXT,
    status TEXT DEFAULT 'Active',
    setupCompleted INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    name TEXT NOT NULL,
    gstin TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    isDefault INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    companyId TEXT NOT NULL,
    invoiceNumber TEXT NOT NULL,
    date TEXT NOT NULL,
    customerData TEXT NOT NULL,
    itemsData TEXT NOT NULL,
    taxType TEXT NOT NULL,
    subtotal REAL NOT NULL,
    cgst REAL NOT NULL,
    sgst REAL NOT NULL,
    igst REAL NOT NULL,
    total REAL NOT NULL,
    status TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    companyId TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    hsn TEXT,
    price REAL,
    gstRate INTEGER,
    currentStock REAL DEFAULT 0,
    unit TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vendors (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    companyId TEXT NOT NULL,
    name TEXT NOT NULL,
    gstin TEXT,
    state TEXT,
    address TEXT,
    email TEXT,
    phone TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS estimates (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    companyId TEXT NOT NULL,
    estimateNumber TEXT NOT NULL,
    date TEXT NOT NULL,
    customerData TEXT NOT NULL,
    itemsData TEXT NOT NULL,
    taxType TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS purchases (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    companyId TEXT NOT NULL,
    billNumber TEXT NOT NULL,
    date TEXT NOT NULL,
    vendorData TEXT NOT NULL,
    itemsData TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS stock_movements (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    companyId TEXT NOT NULL,
    itemId TEXT NOT NULL,
    type TEXT NOT NULL,
    quantity REAL NOT NULL,
    date TEXT NOT NULL,
    remarks TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    tenantId TEXT NOT NULL,
    companyId TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    PRIMARY KEY(tenantId, companyId, key)
  );

  CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    duration INTEGER,
    features TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration utility
const tables = ['invoices', 'items', 'vendors', 'estimates', 'purchases', 'stock_movements', 'settings', 'companies'];
tables.forEach(t => {
  try { db.exec(`ALTER TABLE ${t} ADD COLUMN tenantId TEXT`); } catch(e) {}
  try { db.exec(`ALTER TABLE ${t} ADD COLUMN companyId TEXT`); } catch(e) {}
});

// Seed default admin
db.exec(`
  INSERT OR IGNORE INTO tenants (id, name, email, loginId, password, status, setupCompleted) 
  VALUES ('admin', 'Main Admin', 'admin@ifastx.in', 'admin', 'admin123', 'Active', 1);
`);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 6000;

  app.use(cors());
  app.use(express.json());

  // Isolation Debug Middleware
  app.use((req, res, next) => {
    const tId = req.headers['x-tenant-id'];
    const cId = req.headers['x-company-id'];
    console.log(`[API] ${req.method} ${req.url} - Tenant: ${tId}, Company: ${cId}`);
    next();
  });

  const getTenantId = (req: express.Request) => req.headers['x-tenant-id'] as string;
  const getCompanyId = (req: express.Request) => req.headers['x-company-id'] as string;

  // --- Plans API ---
  app.get("/api/plans", (req, res) => {
    try {
      const plans = db.prepare("SELECT * FROM plans").all();
      // If no plans exist, return defaults
      if (plans.length === 0) {
        return res.json([
          { id: '1', name: 'Starter', price: 999, duration: 365, features: 'Basic Billing, 1 User' },
          { id: '2', name: 'Pro', price: 2499, duration: 365, features: 'Advanced Billing, 5 Users, Inventory' },
          { id: '3', name: 'Enterprise', price: 4999, duration: 365, features: 'Unlimited Everything, 24/7 Support' }
        ]);
      }
      res.json(plans);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // --- Auth/Login ---
  app.post("/api/login", (req, res) => {
    try {
      const { loginId, password } = req.body;
      const tenant = db.prepare("SELECT * FROM tenants WHERE (loginId = ? OR email = ?) AND password = ?").get(loginId, loginId, password);
      if (tenant) {
        // Ensure at least one company exists for this tenant
        const company = db.prepare("SELECT * FROM companies WHERE tenantId = ? LIMIT 1").get(tenant.id);
        if (!company && tenant.id !== 'admin') {
           const coId = 'c_' + Math.random().toString(36).substr(2, 9);
           db.prepare("INSERT INTO companies (id, tenantId, name, isDefault) VALUES (?, ?, ?, 1)").run(coId, tenant.id, tenant.name + ' Default Company');
        }
        res.json({ success: true, tenant });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // --- Multi-Company API ---
  app.get("/api/companies", (req, res) => {
    const tId = getTenantId(req);
    if (!tId) return res.status(400).json({ error: "Missing Tenant ID" });
    const data = db.prepare("SELECT * FROM companies WHERE tenantId = ?").all(tId);
    res.json(data);
  });

  app.post("/api/companies", (req, res) => {
    const tId = getTenantId(req);
    const co = req.body;
    if (!tId) return res.status(400).json({ error: "Missing Tenant ID" });
    db.prepare("INSERT OR REPLACE INTO companies (id, tenantId, name, gstin, address, phone, email, isDefault) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run(co.id || Date.now().toString(), tId, co.name, co.gstin, co.address, co.phone, co.email, co.isDefault || 0);
    res.json({ success: true });
  });

  // --- Generic Isolated Handler Creator ---
  const createIsolatedRoutes = (pathBase: string, table: string, jsonFields: string[] = []) => {
    app.get(`/api/${pathBase}`, (req, res) => {
      const tId = getTenantId(req), cId = getCompanyId(req);
      if (!tId || !cId) return res.status(400).json({ error: "Missing Isolation Headers" });
      try {
        const rows = db.prepare(`SELECT * FROM ${table} WHERE tenantId = ? AND companyId = ? ORDER BY createdAt DESC`).all(tId, cId);
        const formatted = rows.map((r: any) => {
          const item = { ...r };
          jsonFields.forEach(f => { if (item[f]) item[f] = JSON.parse(item[f]); });
          return item;
        });
        res.json(formatted);
      } catch (e) { res.status(500).json({ error: e.message }); }
    });

    app.post(`/api/${pathBase}`, (req, res) => {
      const tId = getTenantId(req), cId = getCompanyId(req);
      const data = req.body;
      if (!tId || !cId) return res.status(400).json({ error: "Missing Isolation Headers" });
      
      const keys = Object.keys(data).filter(k => k !== 'tenantId' && k !== 'companyId');
      const placeholders = keys.map(() => '?').join(', ');
      const columns = [...keys, 'tenantId', 'companyId'].join(', ');
      const values = keys.map(k => jsonFields.includes(k) ? JSON.stringify(data[k]) : data[k]);
      values.push(tId, cId);

      try {
        db.prepare(`INSERT OR REPLACE INTO ${table} (${columns}) VALUES (${keys.map(() => '?').join(', ')}, ?, ?)`).run(...values);
        res.json({ success: true });
      } catch (e) { res.status(500).json({ error: e.message }); }
    });
  };

  createIsolatedRoutes('invoices', 'invoices', ['customerData', 'itemsData']);
  createIsolatedRoutes('estimates', 'estimates', ['customerData', 'itemsData']);
  createIsolatedRoutes('purchases', 'purchases', ['vendorData', 'itemsData']);
  createIsolatedRoutes('items', 'items');
  createIsolatedRoutes('vendors', 'vendors');
  createIsolatedRoutes('movements', 'stock_movements');

  // --- Settings API (Special Handling) ---
  app.get("/api/settings", (req, res) => {
    const tId = getTenantId(req), cId = getCompanyId(req);
    if (!tId || !cId) return res.status(400).json({ error: "Missing Headers" });
    const data = db.prepare("SELECT * FROM settings WHERE tenantId = ? AND companyId = ?").all(tId, cId);
    const settings: any = {};
    data.forEach((row: any) => { settings[row.key] = JSON.parse(row.value); });
    res.json(settings);
  });

  app.post("/api/settings", (req, res) => {
    const tId = getTenantId(req), cId = getCompanyId(req);
    if (!tId || !cId) return res.status(400).json({ error: "Missing Headers" });
    const entries = Object.entries(req.body);
    const stmt = db.prepare("INSERT OR REPLACE INTO settings (tenantId, companyId, key, value) VALUES (?, ?, ?, ?)");
    entries.forEach(([k, v]) => stmt.run(tId, cId, k, JSON.stringify(v)));
    res.json({ success: true });
  });

  // --- Superadmin Only ---
  app.get("/api/tenants", (req, res) => res.json(db.prepare("SELECT * FROM tenants").all()));
  app.post("/api/tenants", (req, res) => {
    const t = req.body;
    db.prepare("INSERT OR REPLACE INTO tenants (id, name, email, loginId, password, planId, status, setupCompleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run(t.id, t.name, t.email, t.loginId, t.password, t.planId, t.status, t.setupCompleted || 0);
    res.json({ success: true });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
}

startServer();
