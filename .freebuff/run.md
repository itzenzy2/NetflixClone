# BatFlix — Dev Server Run Doc

## Reproduce uncommitted artifacts

A fresh checkout needs these files copied/created before the server will run:

1. **Environment secrets** — copy `.env.local` from the main checkout
   (`E:\Dev\Github Repos\NetflixClone\.env.local`) into this worktree root. It contains
   `NEXT_PUBLIC_TMDB_API_KEY=<key>` (never store the value in this doc). If a key is
   missing, TMDb fetches will 403 and pages render their error states.

2. **Dependencies** — install with the project's package manager:
   ```bash
   npm install
   ```

3. **App icons** — the `public/` PNGs (`favicon.png`, `icon-192.png`, `icon-512.png`,
   `apple-touch-icon.png`) and `public/manifest.json` are committed, so nothing to do.
   To regenerate them from the bat path (e.g. after editing the silhouette):
   ```bash
   node scripts/gen-icons.mjs
   ```

## Run the dev server

The dev server binds a **random free port** (Next default `3000` is not assumed; the
port is picked at startup). Start it detached (Windows) and capture the PID:

```powershell
powershell -NoProfile -Command "(Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -RedirectStandardOutput '<log>.out' -RedirectStandardError '<log>.err' -WindowStyle Hidden -PassThru).Id"
```

- stdout and stderr MUST go to different files (PowerShell errors if they share one).
- Confirm it survived: `powershell -NoProfile -Command "Get-Process -Id <pid>"`.
- Find the port: `netstat -ano | findstr LISTENING` and look for the PID, then wait
  until the URL answers before registering a preview.

### Gotcha: `.next` corruption

Running `npm run build` while `next dev` is live overwrites `.next`, which breaks the
dev server's webpack cache (500s / MODULE_NOT_FOUND in `webpack-runtime.js`). After any
production build, restart the dev server cleanly:

1. Kill the dev PID (`taskkill //F //PID <pid>`).
2. Delete `.next` (`rm -rf .next`) to clear the corrupted cache.
3. Start again per the recipe above.
