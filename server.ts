import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";

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
    validTill TEXT,
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
    category TEXT,
    isDefault INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    companyId TEXT NOT NULL,
    type TEXT DEFAULT 'invoice',
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
    partyName TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    tenantId TEXT NOT NULL,
    companyId TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    PRIMARY KEY(tenantId, companyId, key)
  );

  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    companyId TEXT NOT NULL,
    name TEXT NOT NULL,
    gstin TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    state TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    companyId TEXT NOT NULL,
    userName TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    companyId TEXT NOT NULL,
    name TEXT NOT NULL,
    loginId TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'staff',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
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
const tables = ['invoices', 'items', 'vendors', 'customers', 'estimates', 'purchases', 'stock_movements', 'settings', 'companies'];
tables.forEach(t => {
  try { db.exec(`ALTER TABLE ${t} ADD COLUMN tenantId TEXT`); } catch(e) {}
  try { db.exec(`ALTER TABLE ${t} ADD COLUMN companyId TEXT`); } catch(e) {}
});

try { db.exec("ALTER TABLE tenants ADD COLUMN validTill TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE companies ADD COLUMN category TEXT;"); } catch(e) {}

// Item mapping schema migrations
try { db.exec('ALTER TABLE items ADD COLUMN category TEXT'); } catch(e) {}
try { db.exec('ALTER TABLE items ADD COLUMN minStock REAL DEFAULT 0'); } catch(e) {}
try { db.exec('ALTER TABLE items ADD COLUMN vendorId TEXT'); } catch(e) {}
try { db.exec('ALTER TABLE items ADD COLUMN vendorName TEXT'); } catch(e) {}
try { db.exec('ALTER TABLE items ADD COLUMN purchaseRate REAL'); } catch(e) {}
try { db.exec('ALTER TABLE stock_movements ADD COLUMN partyName TEXT'); } catch(e) {}

// Seed default admin
try { db.exec("UPDATE companies SET id='default' WHERE isDefault=1 AND id LIKE 'c_%'"); } catch (e) {}

db.exec(`
  INSERT OR IGNORE INTO tenants (id, name, email, loginId, password, status, setupCompleted) 
  VALUES ('admin', 'Main Admin', 'admin@ifastx.in', 'admin', 'admin123', 'Active', 1);
`);

async function startServer() {
  const app = express();
  // Use environment port or default to 6000 (User priority)
  // For AI Studio, it will fallback to process.env.PORT which is usually 3000
  const PORT = Number(process.env.PORT) || 6000;

  // --- UNIVERSAL NUCLEAR CORS POLICY ---
  // Catch all Preflight (OPTIONS) and standard requests
  app.use((req, res, next) => {
    const origin = req.headers.origin || '*';
    
    // Explicitly using * and disabling credentials for maximum cross-domain compatibility
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-tenant-id, x-company-id, X-Tenant-Id, X-Company-Id, x-user-name, X-User-Name');
    res.setHeader('Access-Control-Allow-Credentials', 'false');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.setHeader('X-Backend-CORS', 'Nuclear-Applied-v3');

    if (req.method === 'OPTIONS') {
      console.log(`[CORS-PREFLIGHT] Authorized: ${req.url} from ${origin}`);
      return res.status(204).end();
    }
    next();
  });

  app.use(express.json());

  // Isolation Debug & Header Extraction
  app.use((req: any, res, next) => {
    req.tenantId = req.headers['x-tenant-id'];
    req.companyId = req.headers['x-company-id'];
    console.log(`[API] ${req.method} ${req.url} - T:${req.tenantId} C:${req.companyId}`);
    next();
  });

  const getTenantId = (req: any) => req.tenantId || req.headers['x-tenant-id'];
  const getCompanyId = (req: any) => req.companyId || req.headers['x-company-id'];

  // --- Plans API ---
  app.get("/api/plans", (req, res) => {
    try {
      const plans = db.prepare("SELECT * FROM plans").all();
      // If no plans exist, return defaults
      if (plans.length === 0) {
        return res.json([
          { id: '1', name: 'Starter', prices: { monthly: 99, quarterly: 279, halfYearly: 549, yearly: 999 }, features: ['50 Invoices/month', 'Basic Reports', 'Email Support'] },
          { id: '2', name: 'Pro', prices: { monthly: 249, quarterly: 699, halfYearly: 1299, yearly: 2499 }, features: ['Unlimited Invoices', 'GSTR Export', 'WhatsApp Automation', 'Priority Support'] },
          { id: '3', name: 'Enterprise', prices: { monthly: 499, quarterly: 1399, halfYearly: 2599, yearly: 4999 }, features: ['Custom Integrations', 'Multiple Users', 'Dedicated Account Manager'] }
        ]);
      }
      
      const formatted = plans.map((p: any) => ({
        id: p.id,
        name: p.name,
        prices: p.prices ? JSON.parse(p.prices) : { monthly: p.price || 0, quarterly: 0, halfYearly: 0, yearly: 0 },
        features: p.features ? (p.features.startsWith('[') ? JSON.parse(p.features) : p.features.split(',')) : [],
        limits: p.limits ? JSON.parse(p.limits) : {},
        modules: p.modules ? JSON.parse(p.modules) : {}
      }));
      res.json(formatted);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/plans", (req, res) => {
    try {
      const p = req.body;
      const rows = db.prepare("PRAGMA table_info(plans)").all();
      if (!rows.some((r: any) => r.name === 'prices')) db.prepare("ALTER TABLE plans ADD COLUMN prices TEXT").run();
      if (!rows.some((r: any) => r.name === 'limits')) db.prepare("ALTER TABLE plans ADD COLUMN limits TEXT").run();
      if (!rows.some((r: any) => r.name === 'modules')) db.prepare("ALTER TABLE plans ADD COLUMN modules TEXT").run();

      db.prepare("INSERT OR REPLACE INTO plans (id, name, price, prices, features, limits, modules) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(
          p.id, 
          p.name, 
          p.prices?.monthly || 0, 
          JSON.stringify(p.prices || {}), 
          JSON.stringify(p.features || []),
          JSON.stringify(p.limits || {}),
          JSON.stringify(p.modules || {})
        );
      res.json({ success: true });
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
           const coId = 'default';
           db.prepare("INSERT INTO companies (id, tenantId, name, isDefault) VALUES (?, ?, ?, 1)").run(coId, tenant.id, tenant.name + ' Default Company');
        }
        return res.json({ success: true, tenant, role: 'admin' });
      } else {
        const staff = db.prepare("SELECT * FROM staff WHERE loginId = ? AND password = ?").get(loginId, password) as any;
        if (staff) {
          const staffTenant = db.prepare("SELECT * FROM tenants WHERE id = ?").get(staff.tenantId);
          return res.json({ success: true, tenant: staffTenant, staff, role: staff.role });
        }
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
    db.prepare("INSERT OR REPLACE INTO companies (id, tenantId, name, gstin, address, phone, email, category, isDefault) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(co.id || Date.now().toString(), tId, co.name, co.gstin, co.address, co.phone, co.email, co.category || '', co.isDefault || 0);
    res.json({ success: true });
  });

  app.delete("/api/companies/:id", (req, res) => {
    const tId = getTenantId(req);
    const { id } = req.params;
    if (!tId) return res.status(400).json({ error: "Missing Tenant ID" });
    try {
      db.prepare("DELETE FROM companies WHERE id = ? AND tenantId = ?").run(id, tId);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // --- Generic Isolated Handler Creator ---
  const logActivity = (tenantId: string, companyId: string, userName: string, action: string, details: string) => {
    try {
      if (tenantId && companyId) {
        db.prepare("INSERT INTO activity_logs (id, tenantId, companyId, userName, action, details) VALUES (?, ?, ?, ?, ?, ?)")
          .run(Date.now().toString() + Math.random().toString(36).substr(2, 5), tenantId, companyId, userName || 'User', action, details);
      }
    } catch (e) {
      console.error("Log error", e.message);
    }
  };

  const checkLimit = (tenantId: string, limitKey: 'maxInvoices' | 'maxPurchases' | 'maxCustomers', currentCount: number) => {
    const tenant = db.prepare("SELECT planId FROM tenants WHERE id = ?").get(tenantId);
    if (!tenant) return true; // if no tenant, maybe system default? allow
    const plan = db.prepare("SELECT limits FROM plans WHERE id = ?").get(tenant.planId);
    if (!plan || !plan.limits) return true; // no limits set
    const limits = JSON.parse(plan.limits);
    if (limits && typeof limits[limitKey] === 'number') {
      if (currentCount >= limits[limitKey]) {
        return false;
      }
    }
    return true;
  };

  const createIsolatedRoutes = (pathBase: string, table: string, jsonFields: string[] = []) => {
    // GET List
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

    // GET Single
    app.get(`/api/${pathBase}/:id`, (req, res) => {
      const tId = getTenantId(req), cId = getCompanyId(req);
      if (!tId || !cId) return res.status(400).json({ error: "Missing Isolation Headers" });
      try {
        const item = db.prepare(`SELECT * FROM ${table} WHERE id = ? AND tenantId = ? AND companyId = ?`).get(req.params.id, tId, cId) as any;
        if (item) {
          const formatted = { ...item };
          jsonFields.forEach(f => { if (formatted[f]) formatted[f] = JSON.parse(formatted[f]); });
          res.json(formatted);
        } else {
          res.status(404).json({ error: "Not found" });
        }
      } catch (e) { res.status(500).json({ error: e.message }); }
    });

    // POST (Add/Update)
    app.post(`/api/${pathBase}`, (req, res) => {
      const tId = getTenantId(req), cId = getCompanyId(req);
      const data = req.body;
      if (!tId || !cId) return res.status(400).json({ error: "Missing Isolation Headers" });
      
      try {
        const tableInfo = db.prepare(`PRAGMA table_info(${table})`).all();
        const validColumns = tableInfo.map((col: any) => col.name);
        
        let keys = Object.keys(data).filter(k => validColumns.includes(k) && k !== 'tenantId' && k !== 'companyId');
        
        // Manual fallback mappings for common frontend-backend data structure mismatches
        if (table === 'invoices' && !keys.includes('customerData') && data.customer) {
          keys.push('customerData');
          data.customerData = data.customer;
        }
        if (table === 'invoices' && !keys.includes('itemsData') && data.items) {
          keys.push('itemsData');
          data.itemsData = data.items;
        }
        if (table === 'estimates' && !keys.includes('customerData') && data.customer) {
          keys.push('customerData');
          data.customerData = data.customer;
        }
        if (table === 'estimates' && !keys.includes('itemsData') && data.items) {
          keys.push('itemsData');
          data.itemsData = data.items;
        }
        if (table === 'purchases' && !keys.includes('vendorData') && data.customer) {
          keys.push('vendorData');
          data.vendorData = data.customer;
        }
        if (table === 'purchases' && !keys.includes('itemsData') && data.items) {
          keys.push('itemsData');
          data.itemsData = data.items;
        }
        if (table === 'purchases' && !keys.includes('billNumber') && data.number) {
          keys.push('billNumber');
          data.billNumber = data.number;
        }
        if (table === 'estimates' && !keys.includes('estimateNumber') && data.number) {
          keys.push('estimateNumber');
          data.estimateNumber = data.number;
        }
        if (table === 'stock_movements') {
          if (!keys.includes('itemId') && data.itemName) {
             keys.push('itemId');
             data.itemId = data.itemName;
          }
          if (!keys.includes('quantity') && data.qty !== undefined) {
             keys.push('quantity');
             data.quantity = data.qty;
          }
          if (!keys.includes('remarks') && data.notes) {
             keys.push('remarks');
             data.remarks = data.notes;
          }
        }
        
        // Enforce limits for new records
        const existing = db.prepare(`SELECT id FROM ${table} WHERE id = ? AND tenantId = ? AND companyId = ?`).get(data.id, tId, cId);
        if (!existing) {
          if (table === 'invoices') {
            const count = db.prepare("SELECT COUNT(*) as count FROM invoices WHERE tenantId = ?").get(tId) as { count: number };
            if (!checkLimit(tId, 'maxInvoices', count.count)) return res.status(403).json({ error: "Limit Exceeded: Maximum Invoices reached for your plan." });
          } else if (table === 'purchases') {
            const count = db.prepare("SELECT COUNT(*) as count FROM purchases WHERE tenantId = ?").get(tId) as { count: number };
            if (!checkLimit(tId, 'maxPurchases', count.count)) return res.status(403).json({ error: "Limit Exceeded: Maximum Purchases reached for your plan." });
          } else if (table === 'customers') {
             const count = db.prepare("SELECT COUNT(*) as count FROM customers WHERE tenantId = ?").get(tId) as { count: number };
             if (!checkLimit(tId, 'maxCustomers', count.count)) return res.status(403).json({ error: "Limit Exceeded: Maximum Customers reached for your plan." });
          } else if (table === 'vendors') {
             const count = db.prepare("SELECT COUNT(*) as count FROM vendors WHERE tenantId = ?").get(tId) as { count: number };
             if (!checkLimit(tId, 'maxCustomers', count.count)) return res.status(403).json({ error: "Limit Exceeded: Maximum Customers/Vendors reached for your plan." });
          }
        }
        
        // Final filter to ensure we strictly only insert columns that exist in DB
        keys = keys.filter(k => validColumns.includes(k));

        const placeholders = keys.map(() => '?').join(', ');
        const columns = [...keys, 'tenantId', 'companyId'].join(', ');
        const values = keys.map(k => jsonFields.includes(k) ? JSON.stringify(data[k]) : data[k]);
        values.push(tId, cId);

        db.prepare(`INSERT OR REPLACE INTO ${table} (${columns}) VALUES (${placeholders}, ?, ?)`).run(...values);
        
        const userName = (req.headers['x-user-name'] as string) || 'Company Admin';
        logActivity(tId, cId, userName, `Saved ${table}`, `Record ID: ${data.id || data.invoiceNumber || data.itemId}`);
        
        res.json({ success: true });
      } catch (e) {
        require('fs').appendFileSync('server_error.log', `[${pathBase}] Error: ${e.message}\nPayload: ${JSON.stringify(data)}\n`);
        res.status(500).json({ error: e.message });
      }
    });

    // DELETE
    app.delete(`/api/${pathBase}/:id`, (req, res) => {
      const tId = getTenantId(req), cId = getCompanyId(req);
      const userName = (req.headers['x-user-name'] as string) || 'Company Admin';
      const { id } = req.params;
      if (!tId || !cId) return res.status(400).json({ error: "Missing Isolation Headers" });
      try {
        db.prepare(`DELETE FROM ${table} WHERE id = ? AND tenantId = ? AND companyId = ?`).run(id, tId, cId);
        logActivity(tId, cId, userName, `Deleted from ${table}`, `Record ID: ${id}`);
        res.json({ success: true });
      } catch (e) { res.status(500).json({ error: e.message }); }
    });
  };

  createIsolatedRoutes('invoices', 'invoices', ['customerData', 'itemsData']);
  createIsolatedRoutes('estimates', 'estimates', ['customerData', 'itemsData']);
  createIsolatedRoutes('purchases', 'purchases', ['vendorData', 'itemsData']);
  createIsolatedRoutes('items', 'items');
  createIsolatedRoutes('vendors', 'vendors');
  createIsolatedRoutes('customers', 'customers');
  createIsolatedRoutes('movements', 'stock_movements');
  createIsolatedRoutes('activity_logs', 'activity_logs');
  createIsolatedRoutes('staff', 'staff');

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
    db.prepare("INSERT OR REPLACE INTO tenants (id, name, email, loginId, password, planId, status, setupCompleted, validTill) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(t.id, t.name, t.email, t.loginId, t.password, t.planId, t.status, t.setupCompleted || 0, t.validTill);
    // Auto-create default company
    db.prepare("INSERT OR IGNORE INTO companies (id, tenantId, name, gstin, address, phone, email, isDefault) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run('default', t.id, t.name, '', '', '', t.email, 1);
    res.json({ success: true });
  });

  app.put("/api/tenants/:id/plan", (req, res) => {
    try {
      const { planId, validTill } = req.body;
      db.prepare("UPDATE tenants SET planId = ?, validTill = ? WHERE id = ?").run(planId, validTill, req.params.id);
      res.json({ success: true });
    } catch(e) {
      res.status(500).json({ error: e.message });
    }
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
