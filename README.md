# Dashboard refactor

Static dashboard split into smaller files:

- `index.html` — markup only
- `assets/css/dashboard.css` — styling and responsive layout
- `assets/js/tabs.js` — tab behavior
- `assets/js/infrastructure.js` — infrastructure overview/table
- `assets/js/conversion.js` — experts, work, conversion and pniyot dashboards
- `assets/js/interests.js` — interests dashboard
- `assets/js/app.js` — startup/fetch orchestration

Open `index.html` from a static server. The data flow still uses only two API calls.
