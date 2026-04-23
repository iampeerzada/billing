import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import cors from "cors";

const dbPath = path.join(process.cwd(), "data.db");
const db = new Database(dbPath);

// Multi-tenant & Multi-company Schema Overhaul
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
    type TEXT NOT NULL, -- 'IN' or 'OUT'
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

// Migrations to add isolation columns to existing tables if needed
const tablesToMigrate = ['invoices', 'items', 'vendors', 'estimates', 'purchases', 'stock_movements', 'settings'];
tablesToMigrate.forEach(table => {
  try { db.exec(`ALTER TABLE ${table} ADD COLUMN tenantId TEXT`); } catch(e) {}
  try { db.exec(`ALTER TABLE ${table} ADD COLUMN companyId TEXT`); } catch(e) {}
});
try { db.exec("ALTER TABLE tenants ADD COLUMN setupCompleted INTEGER DEFAULT 0"); } catch(e) {}

// Initial Admin
db.exec(`
  INSERT OR IGNORE INTO tenants (id, name, email, loginId, password, status, setupCompleted) 
  VALUES ('admin', 'Main Admin', 'admin@ifastx.in', 'admin', 'admin123', 'Active', 1);
`);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 6000;

  app.use(cors());
  app.use(express.json());

  // Middleware to ensure tenant isolation (simplified check)
  // In production, you'd use JWT/Auth headers
  const getTenantId = (req: express.Request) => req.headers['x-tenant-id'] as string;
  const getCompanyId = (req: express.Request) => req.headers['x-company-id'] as string;

  // Companies API
  app.get("/api/companies", (req, res) => {
    const tId = getTenantId(req);
    if (!tId) return res.status(400).json({ error: "Missing Tenant ID" });
    const companies = db.prepare("SELECT * FROM companies WHERE tenantId = ?").all(tId);
    res.json(companies);
  });

  app.post("/api/companies", (req, res) => {
    const tId = getTenantId(req);
    const co = req.body;
    if (!tId) return res.status(400).json({ error: "Missing Tenant ID" });
    const stmt = db.prepare("INSERT OR REPLACE INTO companies (id, tenantId, name, gstin, address, phone, email, isDefault) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    stmt.run(co.id || Date.now().toString(), tId, co.name, co.gstin, co.address, co.phone, co.email, co.isDefault || 0);
    res.json({ success: true });
  });

  // Invoices API - Isolated
  app.post("/api/invoices", (req, res) => {
    try {
      const tId = getTenantId(req);
      const cId = getCompanyId(req);
      const inv = req.body;
      if (!tId || !cId) return res.status(400).json({ error: "Missing Header IDs" });

      const stmt = db.prepare(`
        INSERT OR REPLACE INTO invoices (id, tenantId, companyId, invoiceNumber, date, customerData, itemsData, taxType, subtotal, cgst, sgst, igst, total, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        inv.id, tId, cId, inv.invoiceNumber, inv.date, 
        JSON.stringify(inv.customerData), JSON.stringify(inv.itemsData),
        inv.taxType, inv.subtotal, inv.cgst, inv.sgst, inv.igst, inv.total, inv.status
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/invoices", (req, res) => {
    try {
      const tId = getTenantId(req);
      const cId = getCompanyId(req);
      if (!tId || !cId) return res.status(400).json({ error: "Missing Header IDs" });

      const invoices = db.prepare("SELECT * FROM invoices WHERE tenantId = ? AND companyId = ? ORDER BY createdAt DESC").all(tId, cId);
      const formatted = invoices.map((inv: any) => ({
        ...inv,
        customerData: JSON.parse(inv.customerData),
        itemsData: JSON.parse(inv.itemsData)
      }));
      res.json(formatted);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Items API - Isolated
  app.post("/api/items", (req, res) => {
    try {
      const tId = getTenantId(req);
      const cId = getCompanyId(req);
      const item = req.body;
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO items (id, tenantId, companyId, name, description, hsn, price, gstRate, currentStock, unit)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(item.id, tId, cId, item.name, item.description, item.hsn, item.price, item.gstRate, item.currentStock, item.unit);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/items", (req, res) => {
    try {
      const tId = getTenantId(req);
      const cId = getCompanyId(req);
      const items = db.prepare("SELECT * FROM items WHERE tenantId = ? AND companyId = ?").all(tId, cId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Login API
  app.post("/api/login", (req, res) => {
    try {
      const { loginId, password } = req.body;
      const tenant = db.prepare("SELECT * FROM tenants WHERE (loginId = ? OR email = ?) AND password = ?").get(loginId, loginId, password);
      if (tenant) res.json({ success: true, tenant });
      else res.status(401).json({ success: false, message: "Invalid credentials" });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Tenants Management (Superadmin)
  app.get("/api/tenants", (req, res) => {
    const tenants = db.prepare("SELECT * FROM tenants ORDER BY createdAt DESC").all();
    res.json(tenants);
  });

  app.post("/api/tenants", (req, res) => {
    const t = req.body;
    const stmt = db.prepare("INSERT OR REPLACE INTO tenants (id, name, email, loginId, password, planId, expiryDate, status, setupCompleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    stmt.run(t.id, t.name, t.email, t.loginId || t.email, t.password, t.planId, t.expiryDate, t.status, t.setupCompleted || 0);
    res.json({ success: true });
  });

  // Vite/Prod Serving logic remains identical...
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`iFastX Backend running on port ${PORT}`));
}

startServer();
