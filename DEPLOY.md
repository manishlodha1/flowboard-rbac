# Deployment guide (FlowBoard)

Assignment needs a **public working URL**. Use this path:

## Option A — Render (API + DB) + Vercel (UI)  ← recommended

### 1. Push code to GitHub
```bash
gh auth login
git add .
git commit -m "Initial FlowBoard RBAC app"
gh repo create flowboard-rbac --public --source=. --remote=origin --push
```

### 2. Deploy API + Postgres on Render
1. Go to https://dashboard.render.com → New → Blueprint
2. Connect the GitHub repo
3. Use `render.yaml` in the repo root
4. Set:
   - `CLIENT_ORIGIN` = your Vercel URL (add after step 3, then redeploy)
5. After API is live, note the URL: `https://flowboard-api-xxxx.onrender.com`

### 3. Seed production DB (once)
From your machine:
```bash
cd server
$env:DATABASE_URL="paste-render-postgres-url"
npm run seed
```

### 4. Deploy UI on Vercel
```bash
cd client
npx vercel login
npx vercel --prod
```
Set env: `NEXT_PUBLIC_API_URL=https://flowboard-api-xxxx.onrender.com/api`

### 5. Wire CORS
On Render API service, set `CLIENT_ORIGIN` to the Vercel URL and redeploy.

---

## What to email HR
- GitHub repo URL
- Live app URL (Vercel)
- Demo logins from README
