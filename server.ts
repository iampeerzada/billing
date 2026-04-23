import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite database
const db = new Database("data.db");

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
`);

async function startServer() {
  const app = express();
  const PORT = 6000;

  app.use(cors());
  app.use(express.json());

  // Invoices API
  app.post("/api/invoices", (req, res) => {
    try {
      const invoice = req.body;
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO invoices (
          id, invoiceNumber, date, customerData, itemsData, taxType, 
          subtotal, cgst, sgst, igst, total, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        invoice.id,
        invoice.invoiceNumber,
        invoice.date,
        JSON.stringify(invoice.customer),
        JSON.stringify(invoice.items),
        invoice.taxType,
        invoice.subtotal,
        invoice.cgst,
        invoice.sgst,
        invoice.igst,
        invoice.total,
        invoice.status
      );

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/invoices", (req, res) => {
    try {
      const invoices = db.prepare("SELECT * FROM invoices ORDER BY createdAt DESC").all();
      const formatted = invoices.map((inv: any) => ({
        ...inv,
        customer: JSON.parse(inv.customerData),
        items: JSON.parse(inv.itemsData)
      }));
      res.json(formatted);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Estimates API
  app.post("/api/estimates", (req, res) => {
    try {
      const est = req.body;
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO estimates (id, estimateNumber, date, customerData, itemsData, taxType, total, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(est.id, est.number || est.estimateNumber, est.date, JSON.stringify(est.customer), JSON.stringify(est.items), est.taxType || 'INTRA', est.total || est.totals?.total, est.status);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/estimates", (req, res) => {
    try {
      const data = db.prepare("SELECT * FROM estimates ORDER BY createdAt DESC").all();
      const formatted = data.map((d: any) => ({
        ...d,
        customer: JSON.parse(d.customerData),
        items: JSON.parse(d.itemsData)
      }));
      res.json(formatted);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Purchases API
  app.post("/api/purchases", (req, res) => {
    try {
      const p = req.body;
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO purchases (id, billNumber, date, vendorData, itemsData, total, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(p.id, p.number || p.billNumber, p.date, JSON.stringify(p.customer || p.vendor), JSON.stringify(p.items), p.total || p.totals?.total, p.status);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/purchases", (req, res) => {
    try {
      const data = db.prepare("SELECT * FROM purchases ORDER BY createdAt DESC").all();
      const formatted = data.map((d: any) => ({
        ...d,
        customer: JSON.parse(d.vendorData || d.customerData),
        items: JSON.parse(d.itemsData)
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
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
