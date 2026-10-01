# Dynasty Tankathon V6

A clean rebuild of the dynasty fantasy football dashboard for Sleeper league `1312170915835969536`.

## Included

- Live Sleeper league/users/rosters/traded picks
- Projected rookie draft order with Max PF / record / PF modes
- Playoff-aware draft order
- Future draft-pick ownership
- Team cards and roster popups
- Tankathon 2027 big-board importer filtered to QB, RB, WR and TE
- Editable fantasy prospect order in the browser
- Rookie mock draft using the projected order and current pick owners
- KeepTradeCut market-value importer
- Trade analyzer using KTC player/pick values
- Superflex and 1QB value toggle
- `/api/health` deployment check

## IMPORTANT: how V6 is meant to be hosted

GitHub stores the code. Vercel runs the website and API functions.

Do **not** use GitHub Pages for the live site. GitHub Pages cannot execute the files in `/api`.

## Clean GitHub setup

The safest setup is a brand-new GitHub repository.

1. Download and unzip the V6 ZIP.
2. In GitHub, create a new repository named something like `dynasty-tankathon-v6`.
3. Do not initialize it with a README, license, or .gitignore.
4. Open the unzipped `dynasty-tankathon-v6` folder on your computer.
5. Upload the **contents of that folder**, not the outer folder and not the ZIP.
6. Commit the files.

The repository root must look exactly like this:

```text
api/
  health.js
  sleeper.js
  prospects.js
  ktc.js
app.js
index.html
styles.css
package.json
README.md
```

There should be no extra `dynasty-tankathon-v6/` folder around those files.

## Clean Vercel setup

For V6, creating a new Vercel project is strongly recommended instead of reusing one that may have old root/build settings.

1. In Vercel, choose **Add New -> Project**.
2. Import the new GitHub repository.
3. Framework Preset: **Other**.
4. Root Directory: leave it at the repository root (`./`).
5. Build Command: leave blank/default.
6. Output Directory: leave blank/default.
7. Install Command: leave blank/default.
8. Deploy.

V6 targets Node.js 24 through `package.json`.

## FIRST TEST after Vercel deploys

Open:

```text
https://YOUR-SITE.vercel.app/api/health
```

You must see JSON similar to:

```json
{
  "ok": true,
  "app": "Dynasty Tankathon",
  "version": "6.0.0"
}
```

If `/api/health` is 404, stop there. The API folder is not at the Vercel project root. Do not troubleshoot Sleeper or Tankathon yet.

## Then test Sleeper

```text
https://YOUR-SITE.vercel.app/api/sleeper?path=%2Fleague%2F1312170915835969536
```

Then:

```text
https://YOUR-SITE.vercel.app/api/sleeper?path=%2Fleague%2F1312170915835969536%2Fusers
```

Both should return JSON.

## Then test the prospect feed

```text
https://YOUR-SITE.vercel.app/api/prospects
```

The response includes `mode`:

- `live` = direct Tankathon import worked
- `reader` = alternate reader worked
- `snapshot` = live import failed, so V6 used the built-in fantasy-position snapshot

Only QB, RB, WR and TE are returned.

## Then test KTC

```text
https://YOUR-SITE.vercel.app/api/ktc
```

KTC can change its public page structure, so this endpoint reports whether the live feed is available. The trade analyzer still links to KTC's official calculator.

## Important trade-analyzer note

V6 uses KTC market values as an asset comparison layer. It does not claim to reproduce KeepTradeCut's proprietary trade adjustment algorithm. For the official KTC result, use the button inside the Trade Analyzer.

## Common deployment mistake

Wrong repository structure:

```text
dynasty-tankathon-v6/
  api/
  index.html
```

Correct repository structure:

```text
api/
index.html
app.js
styles.css
package.json
```

The `api` folder and `index.html` must be visible immediately when you open the GitHub repository homepage.
