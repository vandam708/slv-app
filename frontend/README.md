# Frontend Layer

This folder is the visual layer of the SLV app.

- `styles/app.css` contains the extracted base styles from the original single-file app.
- `styles/dashboard.css` is reserved for the new main dashboard redesign and should be loaded after `app.css`.
- `assets/ui/` is for visual-only UI assets such as frames, textures, masks, decorative panels, wheel rings, water flask shells, and body images.
- `components/` contains visual component modules for dashboard blocks. Move rendering into these files gradually, one block at a time.

Keep business logic in `index.html` and `src/` until it is intentionally refactored. New visual work should start in `frontend/styles/dashboard.css` so dashboard experiments can be changed or rolled back without touching the app data flow.

Current component placeholders:

- `components/energy-panel.js`
- `components/sleep-panel.js`
- `components/water-tank.js`
- `components/air-panel.js`
- `components/nutrition-panel.js`
- `components/sport-panel.js`
- `components/fizz-wheel.js`
