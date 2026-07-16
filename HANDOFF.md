# MindMap Handoff

Updated: 2026-07-16 (Asia/Bangkok)

## Current Baseline

- Repository: `Startrospherez/qoltools`
- Current MindMap release: **V3.75** (`4680105 Add Mindmap line annotations`)
- Latest completed baseline: V3.74 image workflow and its related view/canvas refinements, followed by V3.75 Line annotations.
- User-owned unrelated working-tree change: `.gitignore` (do not stage or edit).
- MindMap source of truth: `decoded/mindmap.html`; run `node build-tools.js` to
  regenerate `tools/mindmap.html` after source edits.

## Completed Recently

- V3.72: center-based Grid Snap, 50% opacity while snapping drag, per-node
  plain-text Notes stored in history/backup/JSON/standalone HTML.
- V3.73: zoom percentage control; clicking the percentage resets to 100%, and
  `Alt+R` toggles Fit graph / exact restore; reorganized About dialog with
  help, hotkeys, credits, and copyright.

## V3.74: Image Project Foundation

- Added the locally vendored JSZip 3.10.1 dependency for offline `file://`
  ZIP support.
- `📤 Export` now creates one `.mindmap.zip` Project package. A no-image map
  contains only `manifest.json` and `mindmap.json`; legacy current images are
  stored once as original assets inside `images/original/` and rehydrated on
  import.
- `📥 Import` accepts both legacy JSON and Project ZIP and detects ZIP from its
  bytes plus `manifest.json`, not filename alone. It validates/reads the whole
  package before replacing the active map.
- **Phase 2 verified by the user:** originals and thumbnails are now
  stored outside history in IndexedDB. Canvas rendering is viewport-aware and
  only creates DOM thumbnail elements near the view. `🌄 ภาพ` suppresses that
  rendering without deleting data. `🖼️ IMG` inserts one or more files; drop
  insertion remains available. Image moves support Snap; resize supports
  Shift, Ctrl, and Shift+Ctrl; double-click opens full image with editable
  caption, source, and Note. `💾 HTML` embeds thumbnails while `📤 Export`
  preserves originals and thumbnails in the Project ZIP.
- Legacy JSON/HTML image data remains readable. It is migrated to managed
  assets when the first managed image is inserted or a Project ZIP is made.
- Find now searches title, description, and per-node Note in its `all` scope.
  Title/description hits receive temporary text highlighting. A Note hit
  instead reveals and highlights the node's `📝` button without leaking Note
  text onto the Canvas. The one shared `🔎` Note-search bar is permanently
  visible at the top-right of the Note dialog. Opening from global Find seeds
  it with the global query; it selects the first match and provides previous/
  next controls for additional matches. This UI is not duplicated per node.
- Browser automation cannot open the local `file://` page under current tool
  policy; static checks passed and the user verified interaction behavior.

## V3.75: Line Annotations (Verified)

- The final Shape slot now has `➖`, which creates a free Canvas divider at the
  visible center in blue (`C9`).
- The line is independent of node connectors. Drag its body to move it; drag
  either endpoint for free-angle resizing. Hold `Shift` to lock to horizontal
  or vertical, and turn on `🧲 Snap` to place positions on the 40px grid.
- Selecting a Line exposes endpoints and an `×` delete control. The colour
  palettes recolour the selected line; `Delete` removes it.
- Lines are part of Undo/Redo, local backup, imported JSON/Project ZIP,
  standalone HTML, PNG output, and Zoom to fit. The user tested this feature.

## User-Test Feedback: V3.73 Revision (Implemented and Verified)

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

The editable source is now `content/mindmap-info.html`. `build-tools.js`
injects it at a stable marker while generating `tools/mindmap.html`; the
generated page and saved standalone HTML therefore stay self-contained.

## View / Canvas Refinements (Implemented and Verified)

1. The former `Sepia` and `Dark` controls are now one `Theme` button. Each
   press cycles: **Sepia → Dark → Sepia with Dark Canvas → Sepia**.
   - `Dark` retains the original full dark theme.
   - `Sepia with Dark Canvas` keeps the normal Sepia UI, nodes, and dialogs,
     while making only the working canvas black. This state does not persist
     when a map is newly opened.
2. The node `📝` button now uses its light accent colour normally and changes
   to blue on hover.
3. `Alt+R` keeps the original exact return when the view has not moved after
   Fit. If the user pans after Fit, the next `Alt+R` restores the pre-Fit zoom
   percentage around the current mouse position instead. Wheel zoom still
   starts a fresh Fit/return cycle.

## V3.74 Image Workflow (Completed)

- `🖼️ IMG` is beside `🔎 Find`; it opens an image-only picker and inserts at
  the visible canvas center. Drag-and-drop remains supported.
- Resize handle modifiers are complete: none = free resize; `Shift` = preserve
  aspect ratio; `Ctrl` = retain original image center; `Shift` + `Ctrl` = both.

## Later Roadmap (Not Implemented)

1. Canvas annotations shared architecture:
   - `Line` divider for timelines is complete;
   - Floating Text that is independent of nodes is the next feature.
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
