# tasks-and-bills-ai-upgrade
Legacy → modern: Shared Tasks & Bills app upgraded with AI (summaries, bill-split suggestions, semantic search). Includes legacy & modern code.

## Live demo
- Replit: <## Live demo
- GitHub Pages: https://IrishDec.github.io/tasks-and-bills-ai-upgrade/

- Backup: GitHub Pages / Netlify (optional)

## Quick start
Open `index.html` directly, or run a tiny static server:
```bash
python3 -m http.server 5173
# visit http://localhost:5173
```

## What this shows (at a glance)
- Users (add/remove), per-user tasks
- Shared bills with per-person split and member selection
- “Mark paid” → shows **Paid** + **Delete** (current cycle)
- LocalStorage persistence
- Due highlighting (overdue / due soon)
- Clean separation: `index.html`, `style.css`, `script.js`

## Why it’s a modernization
**Before (legacy snapshot)**
- Single-file HTML, inline CSS/JS
- No structure, weak accessibility, no persistence

**After (modern)**
- Externalized CSS/JS, clear state model
- Accessible controls, keyboard operable
- Idempotent renderers, small utilities, currency formatting

## How I used AI (responsibly)
- Drafted skeleton & renderers, then hand-refined
- Added constraints (IDs, event scope, date math, currency)
- Wrote docs/README, created meaningful commits  
- See `PROMPTS.md` for selected prompts + steering notes

## Screenshots
_Add images to `/screenshots` and link them here._
- Legacy snapshot: `screenshots/legacy.png`
- Modern UI: `screenshots/modern.png`
- Bills split & paid state: `screenshots/bills-paid.png`
