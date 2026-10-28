# Study Sync

Study Sync is a React + Vite study dashboard. This package has a clean project root, working Vite scripts, and the Supabase JavaScript client dependency prepared.

## Run on Windows (recommended)

1. Extract the ZIP completely to a normal folder (for example `Downloads\CampusFlow-Ready`).
2. Open the extracted `CampusFlow-Ready` folder. You should see `package.json`, `index.html`, `src`, and `RUN-CAMPUSFLOW.bat` together.
3. Double-click `RUN-CAMPUSFLOW.bat`. On the first run it installs dependencies, then starts Vite.
4. Open the URL printed in the terminal, usually `http://localhost:5173/`.
5. Keep the terminal window open while using the site. Press `Ctrl+C` in that window to stop it.

## Run through VS Code

Open the folder containing `package.json` (not a parent folder and not `src`). In Terminal > New Terminal run:

```powershell
npm install
npm run dev
```

## Supabase setup

The Supabase client package and `src/lib/supabase.js` helper are included, but the cloud database is not connected until you supply your own project credentials and configure tables/access policies.

1. Copy `.env.example` to a new file named `.env` in the same folder as `package.json`.
2. Set `VITE_SUPABASE_URL` to your Supabase Project URL.
3. Set `VITE_SUPABASE_ANON_KEY` to the Supabase publishable key (or legacy `anon` key). Never use a `service_role` or secret key in frontend code.
4. Restart Vite after changing `.env`.

The existing dashboard currently uses browser localStorage for demo data. Public note sharing, real authentication, Storage uploads, and live progress syncing require their database/API integration and appropriate Row Level Security policies; credentials alone do not activate those features.

## Build check

```powershell
npm run build
```
