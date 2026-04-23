# Professional Split Deployment (DirectAdmin + Home VPS)

This guide explains how to host your frontend on your professional domain (`ifastx.in` via DirectAdmin) while keeping your data private on your own local VPS.

## Architecture Overview
- **Domain**: `ifastx.in` (Root)
- **Frontend**: Hosted on **DirectAdmin** (Handles `https://ifastx.in/billing`)
- **Backend API**: Hosted on your **Local VPS** (Handles `https://billing-api.ifastx.in`)
- **SSL/Routing**: Managed by **Nginx Proxy Manager (NPM)** on your local server.

---

## Step 1: Backend Setup (Local VPS)
1. **DNS Config**: Log into your domain registrar (e.g., GoDaddy/Namecheap) and create an **A Record** for `api.ifastx.in` pointing to your **Home Public IP**.
2. **Mikrotik**: Ensure ports **80** and **443** are forwarded to your **Nginx Proxy Manager VM**.
3. **Nginx Proxy Manager (NPM)**:
   - Add Proxy Host: `api.ifastx.in`
   - Forward to your Billing VPS IP on Port **6000**.
   - SSL Tab: Request a certificate for `api.ifastx.in`.
4. **Environment**: In your Billing VPS `.env`, set:
   ```env
   GEMINI_API_KEY=your_key
   NODE_ENV=production
   PORT=6000
   ```
5. **Start**: `pm2 start dist/server.cjs --name "billing-api"`

---

## Step 2: Frontend Setup (DirectAdmin)
1. **Config Check**: Open `src/config.ts` in this project and verify:
   ```typescript
   export const API_URL = 'https://api.ifastx.in'; // This MUST match your subdomain in NPM.
   ```
2. **Build**: Run `npm run build` on your local machine.
   - **Note**: Ensure `vite.config.ts` has `base: '/billing/'` (already configured).
3. **Upload**: 
   - Open DirectAdmin File Manager.
   - Navigate to `public_html/billing/`.
   - **Delete old files first** to avoid confusion.
   - Upload all files from the `dist/` folder of this project to that directory.
   - **Note**: You do *not* need to upload `server.ts` or `node_modules` to DirectAdmin. Only the static files (index.html, assets, etc.).

---

## Step 3: Verify the Bridge
1. Go to `https://ifastx.in/billing` in your browser.
2. The website loads from DirectAdmin.
3. When you save an invoice, the data travels across the internet to `api.ifastx.in`, which your home router passes to your Local VPS.
4. Data is saved in the SQLite `data.db` on your VPS.

---

### Why this is the best setup:
- **Professional Look**: Users see your main domain `ifastx.in`.
- **Data Privacy**: Your financial data never touches the DirectAdmin shared server; it stays on your physical hardware at home.
- **Speed**: Static files load fast from the web host, while the database stays under your full control.


---

## Step 8: Database Persistence (SQLite)
Your data is saved in `data.db` in your project folder. 
**Crucial:** Make sure PM2 has permission to write to this file.
```bash
sudo chown -R $USER:$USER /var/www/ifastx
```

### Summary of Commands to Update App Later:
If you make changes to the code, simply run:
```bash
git pull
npm install
npm run build
pm2 restart ifastx-billing
```

Your app will now be live at `https://ifastx.in/billing`!
