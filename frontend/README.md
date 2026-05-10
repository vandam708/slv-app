# Frontend Layer

This folder is the visual layer of the SLV app.

- `styles/app.css` contains the extracted base styles from the original single-file app.
- `styles/dashboard.css` is reserved for the new main dashboard redesign and should be loaded after `app.css`.

Keep business logic in `index.html` and `src/` until it is intentionally refactored. New visual work should start in `frontend/styles/dashboard.css` so dashboard experiments can be changed or rolled back without touching the app data flow.
