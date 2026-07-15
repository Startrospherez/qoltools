# MindMap Handoff

Updated: 2026-07-16 (Asia/Bangkok)

## Current Baseline

- Repository: `Startrospherez/qoltools`
- Current completed MindMap release: **V3.73**
- Latest completed commit: `5246f3f Add Mindmap navigation and help center`
- User-owned unrelated working-tree change: `.gitignore` (do not stage or edit).
- MindMap source of truth: `decoded/mindmap.html`; run `node build-tools.js` to
  regenerate `tools/mindmap.html` after source edits.

## Completed Recently

- V3.72: center-based Grid Snap, 50% opacity while snapping drag, per-node
  plain-text Notes stored in history/backup/JSON/standalone HTML.
- V3.73: zoom percentage control; current three-step Reset/Fit/Restore flow;
  `Alt+R`; reorganized About dialog with help, hotkeys, credits, and copyright.

## User-Test Feedback: Next V3.73 Revision (Approved Requirements)

### View control

1. Change `Alt+R` to a two-step toggle only:
   - first press: Zoom to Fit;
   - second press: restore the exact view from before Zoom to Fit.
   Manual pan or wheel zoom clears the stored view and starts a new Fit cycle.
2. At the lower-left, show only the zoom percentage as visually unstyled text
   (no visible button chrome).
3. That percentage remains clickable, but clicking it always resets zoom to
   **100% only**. It must not Fit or Restore.

### Alignment hotkeys

Apply only when the relevant node count is selected, matching current toolbar
behavior. These replace the old Alt+M Shader shortcut; Shader remains available
through its toolbar button.

| Shortcut | Action |
|---|---|
| Alt+U | Top Align |
| Alt+J | Center (horizontal row) Align |
| Alt+M | Bottom Align |
| Alt+I | Left Align |
| Alt+O | Center (vertical column) Align |
| Alt+P | Right Align |
| Alt+K | Horizontal Dist |
| Alt+L | Vertical Dist |

Update all toolbar tooltips and the Help/Hotkeys content to match.

### About / Info dialog

1. Retain the bottom-right `i` entry point; do not create a separate Hotkeys
   button.
2. Convert every content section to a collapsed `<details>`/`<summary>` toggle;
   every section starts closed.
3. Use emoji in every section heading and use button emoji/names consistently
   in the explanatory text. Make the information easy to scan.
4. Replace wording `ล้อเมาส์` with `เมาส์กลาง`.
5. Use this information architecture and friendly Thai copy:
   - `📖 วิธีใช้งาน` — introductory section placed before all others.
   - `🧩 ใช้งานยังไง?` — creating/editing/selecting/dragging/connecting nodes.
   - `🧭 ทำยังไง?` — navigation, zoom, `▦ Grid`, `🧲 Snap`, and alignment.
   - `✨ นอกจาก node ที่เห็นแล้วมีอะไรอีก?` — explain that images can be
     dropped onto the canvas and that each node has a `📝` note space.
   - `⌨️ Hotkeys` — complete current list, including the revised keys above.
   - `🤝 การแบ่งปัน (เครดิต)` — existing credits and external links, restyled
     to match the other sections (no special blue name treatment).
6. Keep `© 2026 Chetphanu Sutadharo` in the Info dialog.

### Editable Info content

Current Info markup is inline in `decoded/mindmap.html` near `#about-ui`, which
is inconvenient for the user to edit. Recommended design: create a dedicated
source fragment such as `content/mindmap-info.html` and have `build-tools.js`
inject it at a stable marker when generating `tools/mindmap.html`. This keeps
the standalone HTML output self-contained while giving the user a single,
easy-to-edit file. **This extraction is proposed and needs final user approval
before implementing.**

## Planned V3.74: Image Workflow (Approved Earlier, Not Implemented)

- Add `🖼️ IMG` beside `🔎 Find` to open an image-only file picker and insert at
  the visible canvas center. Drag-and-drop image insertion remains supported.
- Resize handle modifiers:
  - none: free resize;
  - Shift: preserve aspect ratio;
  - Ctrl: retain original image center;
  - Shift+Ctrl: preserve aspect ratio and original center.

## Later Roadmap (Not Implemented)

1. Canvas annotations shared architecture:
   - resizable `Line` divider for timelines;
   - Floating Text that is independent of nodes.
2. Long-connection navigation: show jump affordances only near a visible line
   end when the opposite node is offscreen; avoid permanent clutter.
3. Connector labels: future standalone feature. Store `label` in line state,
   decide horizontal orientation and midpoint placement, preserve in history,
   JSON, HTML, exports, and avoid conflict with the mid-line branch control.
4. GitHub release practice: repository currently has only tag `v0.9`. When a
   MindMap release is ready to publish, propose a tag such as
   `mindmap-v3.73` and a GitHub Release; do not create/push one without user
   authorization.

## Verification Expectations

- Run inline JavaScript syntax check and `node build-tools.js`.
- Run `git diff --check`.
- Preserve `.gitignore` as an unrelated user change.
- Local `file://` page navigation was previously blocked by automated browser
  policy, so ask the user to refresh and perform final interaction checks.
