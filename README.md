# Futuristic Website Design (CMS Template)

A static sci-fi portfolio template with a local-only “mini CMS” editor.

## How it works

- **Admin/editor**: `admin.html`
- **Live site**: `index.html` (renders **Live** config)
- **Draft preview**: `index.html?preview=draft` (renders **Draft** config)

All content is stored **locally in your browser** using `localStorage`, and updates are synced between tabs via `BroadcastChannel`.

## Draft vs Live workflow

- **Edit Draft**: open `admin.html` and make changes (Draft is saved).
- **Preview Draft**: open `index.html?preview=draft`.
- **Publish**: click **Publish** in the admin to copy Draft → Live.
- **View Live**: open `index.html`.

## Backups / Import / Export

In `admin.html` → **Backups**:

- Create backups for Draft/Live.
- Restore any backup into Draft or Live.
- Export Draft/Live JSON.
- Import JSON into Draft or Live.

## GitHub Pages deployment

This repo is GitHub Pages–friendly (uses relative links).

### Steps

- **Settings** → **Pages**
- **Build and deployment** → Source: **Deploy from a branch**
- Branch: `main` (or your default branch)
- Folder: `/ (root)`

Your site will be available at:

`https://<username>.github.io/<repo-name>/`

## Local development

For best results, run a local dev server (recommended vs `file://`).

Examples:

- Python:
  - `python -m http.server 8000`
- Node:
  - `npx serve`

Then open:

- `http://localhost:8000/index.html`
- `http://localhost:8000/admin.html`

## Notes

- Because this is local-only storage, **content does not automatically sync between devices/browsers**.
- Use Export/Import or Backups to move content.
