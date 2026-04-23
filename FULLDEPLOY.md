# Full Deployment Guide for iFastX GST Billing
This guide will walk you through deploying your application to your own VPS (Ubuntu/Linux) at `https://ifastx.in/billing`.

## Prerequisites
Before you begin, ensure your VPS has the following installed:
1. **Node.js (v18 or higher)**
2. **NPM** (Node Package Manager)
3. **Nginx** (To act as a reverse proxy for your domain)
4. **Git** (To transfer your code)

---

## Step 1: Prepare Your VPS
Login to your VPS via SSH:
```bash
ssh root@your_vps_ip
```

Update your system and install necessary tools:
```bash
sudo apt update
sudo apt install nodejs npm nginx git -y
```

Install **PM2**, a process manager that keeps your app running 24/7:
```bash
sudo npm install -g pm2
```

---

## Step 2: Get the Code
1. Export your code from AI Studio (ZIP or GitHub).
2. On your VPS, go to the directory where you want to host the app:
```bash
mkdir -p /var/www/ifastx
cd /var/www/ifastx
```
3. Upload your files here. If using Git:
```bash
git clone <your-repo-link> .
```

---

## Step 3: Install and Build
Install the project dependencies:
```bash
npm install
```

Build the application for production:
```bash
npm run build
```
*This creates a `dist` folder with your frontend and a `dist/server.cjs` file for your backend.*

---

## Step 4: Configure Environment & PORT
1. Open a new Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/ifastx
```

**FOR YOUR SETUP (Proxmox/Mikrotik):**
Since port 3000 is in use, we use port **6000**.
In your `.env` file on the VPS, add:
```env
PORT=6000
NODE_ENV=production
```

Also, update `server.ts` on your VPS to use this environment variable:
`const PORT = process.env.PORT || 6000;`

---

## Step 5: Start the App with PM2
Start your backend server:
```bash
PORT=6000 pm2 start dist/server.cjs --name "ifastx-billing"
```

---

## Step 6: Configure Nginx for https://ifastx.in/billing
Paste the following configuration:
```nginx
server {
    listen 80;
    server_name ifastx.in;

    location /billing/ {
        proxy_pass http://localhost:6000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Important for sub-path routing
        rewrite ^/billing/(.*)$ /$1 break;
    }
}
```

## Step 7: Mikrotik / Proxmox Port Forwarding
In your Mikrotik router (NAT rules):
1. **Chain**: `dstnat`
2. **Protocol**: `6 (tcp)`
3. **Dst. Port**: `80, 443`
4. **Action**: `dst-nat`
5. **To Addresses**: `Your_VPS_IP`
6. **To Ports**: `80, 443` (Nginx will handle the internal 6000 routing)


3. Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/ifastx /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 7: Secure with SSL (HTTPS)
Use Certbot to get a free SSL certificate:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d ifastx.in
```
Follow the prompts to enable HTTPS.

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
