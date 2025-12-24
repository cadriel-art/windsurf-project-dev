# Tasks

## Active
- [ ] 2025-12-24: Implement a WordPress-style CMS workflow for this template (local-only).

### Workflow (how the app is intended to operate)

- **Source of truth**
  - **Draft config**: stored in `localStorage` key `siteConfig.v2.draft`
  - **Live config**: stored in `localStorage` key `siteConfig.v2`
  - **Backups**: stored in `localStorage` key `siteConfig.v2.backups` (bounded list)

- **Editing**
  - Open `/admin.html` and edit content.
  - Admin writes changes to the current mode using `SiteTemplate.saveConfig(...)`.
  - Other tabs update via `BroadcastChannel` (`site-config`) + `storage` events.

- **Previewing**
  - **Live site**: `/` (renders Live)
  - **Draft preview**: `/?preview=draft` (renders Draft)
  - Navigation is config-driven (menu + pages) and should work in both modes.

- **Publishing**
  - Click **Publish** in admin to copy **Draft → Live**.
  - The Live site (`/`) will show the published content.

- **Recovery / portability**
  - **Backups**: create/restore/delete restore points for Draft or Live.
  - **Export**: download Draft or Live JSON.
  - **Import**: upload JSON into Draft or Live.

### CMS must-have behaviors (WordPress baseline)

#### Editing / Publishing model
- [ ] Draft vs Live
  - [ ] Admin edits a Draft copy only.
  - [ ] Main site (`/`) shows Live only.
  - [ ] Preview mode can show Draft (e.g. `/?preview=draft`).
  - [ ] Publish action copies Draft → Live.
- [ ] Explicit save feedback
  - [ ] Visible Save state: `Unsaved` → `Saving…` → `Saved`.
  - [ ] Errors are visible in-page (not only console).
- [ ] Autosave
  - [ ] Debounced autosave while typing.
  - [ ] Save should be resilient to rapid edits.
- [ ] Revisions
  - [ ] Undo/redo for the current session.
  - [ ] Stored revision history (bounded) in local storage.
- [ ] Reset
  - [ ] Reset Draft to defaults.
  - [ ] Reset Live to defaults (admin-only).

#### Content model (what the CMS must manage)
- [ ] Site identity
  - [ ] Site title (document title)
  - [ ] Logo text
  - [ ] Logo image
  - [ ] Avatar image
- [ ] Hero section
  - [ ] Headline
  - [ ] Subheadline/typing line
  - [ ] Description
  - [ ] CTA text + link
- [ ] Projects (CPT: portfolio)
  - [ ] Add / edit / delete / reorder
  - [ ] Fields: title, description, tags, category, type, link(s), featured image
  - [ ] Element/theme affinity per project (electric/fire/water/alien)
  - [ ] Optional: hidden/draft flag per project
- [ ] Contact
  - [ ] Title/subtitle
  - [ ] Email
  - [ ] Social links (GitHub, LinkedIn, X, etc.)
- [ ] Footer
  - [ ] Footer text

#### Theme / design system controls
- [ ] Theme presets
  - [ ] Select preset
  - [ ] Duplicate preset
  - [ ] Rename preset
- [ ] Color tokens (global)
  - [ ] Electric / Fire / Water / Alien (+ accents)
  - [ ] Background / text tokens
- [ ] Typography (optional but WordPress-like)
  - [ ] Base font scale
  - [ ] Heading font
  - [ ] Body font

#### Navigation / menus
- [ ] Menu editor
  - [ ] Add/edit/remove links
  - [ ] Reorder
  - [ ] Section anchors and external links

#### Media library
- [ ] Upload images into a library
- [ ] Reuse uploaded images across fields
- [ ] Clear/remove image
- [ ] Size guardrails (warn if very large)

#### Import / Export / Backup
- [ ] Export Draft JSON
- [ ] Export Live JSON
- [ ] Import JSON (choose Draft or Live)
- [ ] “Download backup” before destructive actions (reset/live overwrite)

#### Diagnostics (to avoid "mockup" feel)
- [ ] Admin shows:
  - [ ] Current mode: Draft or Live
  - [ ] Storage key used
  - [ ] Last saved time
  - [ ] Any JS error messages

#### Permissions (local-only equivalent)
- [ ] Admin access guard (optional)
  - [ ] Simple password gate (client-side) or a toggle in config

### Acceptance criteria
- [ ] If you edit any field in admin, the Draft preview updates within 1s.
- [ ] If you click Publish, the Live site updates (after refresh) and shows the Draft content.
- [ ] If save fails, the admin clearly shows why.

## Completed

- [x] 2025-12-24: Build initial sci-fi web page (Elemental Edition) based on provided HTML.

## Discovered During Work
