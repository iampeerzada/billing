import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import cors from "cors";

// Safe database path for production VPS and local dev
const dbPath = path.join(process.cwd(), "data.db");
const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
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
    itemId TEXT NOT NULL,
    type TEXT NOT NULL, -- 'IN' or 'OUT'
    quantity REAL NOT NULL,
    date TEXT NOT NULL,
    remarks TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

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

  CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    duration INTEGER, -- days
    features TEXT, -- JSON array
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration: Add setupCompleted column if it doesn't exist to existing DB
try {
  db.exec("ALTER TABLE tenants ADD COLUMN setupCompleted INTEGER DEFAULT 0");
} catch (e) {
  // Column already exists
}

// Initial Default Admin Tenant
db.exec(`
  INSERT OR IGNORE INTO tenants (id, name, email, loginId, password, status, setupCompleted) 
  VALUES ('admin', 'Main Admin', 'admin@ifastx.in', 'admin', 'admin123', 'Active', 1);
`);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 6000;

  app.use(cors());
  app.use(express.json());

  // Invoices API
  app.post("/api/invoices", (req, res) => {
    try {
      const inv = req.body;
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO invoices (id, invoiceNumber, date, customerData, itemsData, taxType, subtotal, cgst, sgst, igst, total, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        inv.id, inv.invoiceNumber, inv.date, 
        JSON.stringify(inv.customerData), 
        JSON.stringify(inv.itemsData),
        inv.taxType, inv.subtotal, inv.cgst, inv.sgst, inv.igst, inv.total, inv.status
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/invoices", (req, res) => {
    try {
      const invoices = db.prepare("SELECT * FROM invoices ORDER BY createdAt DESC").all();
      const formatted = invoices.map(inv => ({
        ...inv,
        customerData: JSON.parse(inv.customerData),
        itemsData: JSON.parse(inv.itemsData)
      }));
      res.json(formatted);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Items API
  app.post("/api/items", (req, res) => {
    try {
      const item = req.body;
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO items (id, name, description, hsn, price, gstRate, currentStock, unit)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(item.id, item.name, item.description, item.hsn, item.price, item.gstRate, item.currentStock, item.unit);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/items", (req, res) => {
    try {
      const items = db.prepare("SELECT * FROM items ORDER BY name ASC").all();
      res.json(items);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Vendors API
  app.post("/api/vendors", (req, res) => {
    try {
      const vendor = req.body;
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO vendors (id, name, gstin, state, address, email, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(vendor.id, vendor.name, vendor.gstin, vendor.state, vendor.address, vendor.email, vendor.phone);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/vendors", (req, res) => {
    try {
      const vendors = db.prepare("SELECT * FROM vendors ORDER BY name ASC").all();
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Tenants API
  app.post("/api/tenants", (req, res) => {
    try {
      const tenant = req.body;
      const setupStatus = tenant.setupCompleted !== undefined ? tenant.setupCompleted : 0;
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO tenants (id, name, email, loginId, password, planId, expiryDate, status, setupCompleted)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        tenant.id, 
        tenant.name, 
        tenant.email, 
        tenant.loginId || tenant.email, 
        tenant.password, 
        tenant.planId, 
        tenant.expiryDate, 
        tenant.status,
        setupStatus
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/tenants", (req, res) => {
    try {
      const tenants = db.prepare("SELECT * FROM tenants ORDER BY createdAt DESC").all();
      res.json(tenants);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.delete("/api/tenants/:id", (req, res) => {
    try {
      const { id } = req.params;
      db.prepare("DELETE FROM tenants WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Plans API
  app.post("/api/plans", (req, res) => {
    try {
      const plan = req.body;
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO plans (id, name, price, duration, features)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(plan.id, plan.name, plan.price, plan.duration, JSON.stringify(plan.features));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/plans", (req, res) => {
    try {
      const plans = db.prepare("SELECT * FROM plans ORDER BY price ASC").all();
      const formatted = plans.map(p => ({
        ...p,
        features: JSON.parse(p.features || '[]')
      }));
      res.json(formatted);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Login API
  app.post("/api/login", (req, res) => {
    try {
      const { loginId, password } = req.body;
      const tenant = db.prepare("SELECT * FROM tenants WHERE (loginId = ? OR email = ?) AND password = ?").get(loginId, loginId, password);
      
      if (tenant) {
        res.json({ success: true, tenant });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Stock Movements API
  app.post("/api/movements", (req, res) => {
    try {
      const m = req.body;
      const stmt = db.prepare(`
        INSERT INTO stock_movements (id, itemId, type, quantity, date, remarks)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(m.id || Date.now().toString(), m.itemId || m.item, m.type, m.quantity, m.date, m.remarks);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/movements", (req, res) => {
    try {
      const data = db.prepare("SELECT * FROM stock_movements ORDER BY date DESC").all();
      res.json(data);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Settings API
  app.post("/api/settings", (req, res) => {
    try {
      const settings = req.body;
      const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
      Object.entries(settings).forEach(([k, v]) => {
        stmt.run(k, JSON.stringify(v));
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/settings", (req, res) => {
    try {
      const data = db.prepare("SELECT * FROM settings").all();
      const settings: any = {};
      data.forEach((row: any) => {
        settings[row.key] = JSON.parse(row.value);
      });
      res.json(settings);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serving built files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
