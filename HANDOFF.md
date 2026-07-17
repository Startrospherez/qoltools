# MindMap Handoff

Updated: 2026-07-17 (Asia/Bangkok)

## Current Baseline

- Repository: `Startrospherez/qoltools`
- Current MindMap build: **V3.90** (direct connector click/drag and arrow
  gesture; user verified).
- Latest verified baseline: V3.86 centred automatic route labels, after V3.84
  directional route-label expansion and selected-junction mini tools, V3.83
  route-label docking, V3.82
  connector-control clearance, V3.81 adaptive route-label placement, V3.80
  route-label interaction fix, V3.77 directed connectors, V3.76 Floating
  Text, V3.74 image workflow, view/canvas refinements, and V3.75 Line
  annotations.
- MindMap source of truth: `decoded/mindmap.html`; run `node build-tools.js` to
  regenerate `tools/mindmap.html` after source edits.
- `D:\202607162107.zip` is the user's current largest regular test map. It
  contains no images and is a suitable future baseline for graph stress tests.
- `test-fixtures/mindmap-ai-stress-1000.zip` is the deterministic, image-free
  1,000-node synthetic stress fixture. It is generated locally by
  `generate-mindmap-stress-fixture.py`, intentionally ignored by Git, and must
  not be mistaken for study data.

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

- The final Shape slot now has `│`, which creates a vertical free Canvas
  divider at the visible center in blue (`C9`).
- The line is independent of node connectors. Drag its body to move it; drag
  either endpoint for free-angle resizing. Hold `Shift` to lock to horizontal
  or vertical, and turn on `🧲 Snap` to place positions on the 40px grid.
- Selecting a Line exposes endpoints and an `×` delete control. The colour
  palettes recolour the selected line; `Delete` removes it.
- Lines are part of Undo/Redo, local backup, imported JSON/Project ZIP,
  standalone HTML, PNG output, and Zoom to fit. The user tested this feature.

## V3.76: Floating Text (Verified)

- `T` creates a free timeline heading with a title and a smaller Description
  beneath it. It is independent of nodes and Lines while sharing annotation
  persistence.
- The Text can be moved with Snap, recoloured, font-sized with A+/A-, deleted,
  and re-entered for editing by clicking it twice quickly.
- It is included in Undo/Redo, backup, ZIP, HTML, PNG, and Zoom to fit. The
  user tested the feature successfully.

## V3.77: Directed Connectors (Verified)

- Node-to-node connectors now start and end at the bounding-box edge of each
  Node, so large Nodes no longer hide part of a connector. The existing `+`
  branch control is centred on the exposed connector segment.
- The compact control beside that `+` cycles each connector through no arrow,
  forward, reverse, and two-headed arrows. Existing maps remain plain lines.
- Arrow mode is preserved by history, autosave, JSON/ZIP, and standalone HTML;
  splits create plain replacement segments rather than copying arrow meaning.
- The user tested geometry, all arrow modes, and the existing interaction;
  everything passed.

## V3.78: Long-Connector Navigation (Superseded)

- Hover or select a visible Node with a connector whose opposite Node is fully
  outside the usable viewport. A compact direction button appears near the
  visible Node edge, pointing toward the remote Node.
- Clicking the button keeps the zoom percentage and centres the target Node.
  Partly visible targets and connections with both endpoints outside the view
  intentionally receive no button.
- The controls are temporary, grouped with perpendicular offsets for
  same-direction connectors, and are not persisted or exported.

## V3.79: Connector Route Labels (Implemented; refined and verified later)

- Replaces V3.78's circular jump controls with two persistent, horizontal
  route labels per connector: one label for each Node endpoint.
- Hover or select a Node to see every attached label. An empty endpoint shows
  `→ +`; click it to enter a relationship word or phrase. A populated label
  navigates to the opposite Node, double-click edits it, and drag repositions
  it along the edge-to-edge connector.
- Labels normally have no frame. A light interaction treatment appears only on
  hover, edit, or drag. Labels persist in history, backup, JSON/ZIP, HTML,
  and PNG; old connectors receive empty defaults.

## V3.80: Route Label Interaction Fix (Verified)

- Prevents redraws from destroying an active label editor, so text entry stays
  focused after mouse release.
- Empty and populated labels now share one interaction model: single-click
  navigates, double-click edits, and drag moves the normalized position.
- The label glyph now follows the physical connector direction from its owning
  Node, using all eight cardinal/diagonal arrow glyphs.

## V3.81: Adaptive Route Label Placement (Verified)

- New route labels are initially placed about 30 screen pixels from the edge
  of their owning Node instead of at a fixed percentage along the connector.
- On very short connectors, untouched labels render with opposite small
  perpendicular offsets, keeping their click targets distinct. Dragging either
  label removes this automatic offset and preserves the user's chosen
  normalized position.
- Existing saved labels retain their prior positions. The `autoPlacement`
  marker is included wherever connector route-label data is already preserved.

## V3.82: Connector-Control Clearance (Verified)

- Untouched automatic labels now begin 24px from a regular Node and 10px from
  a small junction Node. Automatic labels that used the previous revision are
  migrated once; manually positioned labels do not move.
- A regular-Node label receives a small perpendicular offset only when needed
  to clear that Node's `+` branch control.
- A middle `+` whose invisible hit halo would overlap a nearby Node `+` keeps
  its position and behavior, but uses a smaller halo so the Node `+` remains
  the easier click target.

## V3.83: Route Label Docking (Verified)

- Automatic route labels now resolve their near-Node position every time their
  connector is redrawn. Creating a short link and later dragging a Node far
  away therefore never leaves its labels in the middle of the connector.
- The regular-Node clearance and near-junction treatment remain in force while
  automatic; dragging a label still makes it manual and preserves its position.

## V3.84: Directional Labels and Junction Mini Tools (Verified)

- An automatic route label docked to a regular Node uses a directional anchor:
  a right-side label expands to the right, while a left-side label expands to
  the left. Its arrow stays nearest the Node, preventing newly typed text from
  covering the Node. Vertically connected labels choose stable opposite sides.
  A manually dragged label retains its existing centered, free placement.
- A junction now has no permanent delete control. Select its dark dot to show
  one compact mini toolbar in the least-occupied cardinal direction: green
  `+` is dragged to create a new branch (or clicked to create a Node); red `×`
  removes the junction using the existing reconnect-when-two-branches
  behavior. The toolbar is transient and excluded from exports.

## V3.85: Route-Label Proximity (Superseded by V3.86)

- Automatic labels at a regular Node now dock 14 screen pixels from its edge,
  instead of 24px. Junction-dot labels remain at 10px and manually moved
  labels retain their positions.

## V3.86: Centred Automatic Route Labels (Verified)

- Automatic route labels are now centred directly on their connector, matching
  the placement used after the user drags a label. The old perpendicular
  offsets for short links and nearby Node `+` controls are removed.
- Their centre moves along the connector by the label's measured size, keeping
  a visible 14px gap from a regular Node and 10px gap from a junction dot.
  Text that grows while editing is remeasured and moves farther along the
  connector as needed.
- The separate crowded hit-area protection for the middle `+` remains intact.

## V3.90: Direct Connector Gesture (Verified)

- The selected-point dot and its mini toolbar are superseded by one direct
  connector gesture: click/release creates the same default right-hand Node
  as a Node `+`; press/drag creates the Node at the release location.
- Both actions split the original connector with a real `n.j` junction, so
  new and existing junction dots share precisely the same 16px visual.
- `Alt + click` now cycles the selected connector's arrow mode. Arrow state
  survives a split across its two replacement segments; a new branch begins
  without an arrow. The Help and Hotkeys sections document this gesture.
- Cleanup removed all unreachable V3.87–V3.89 selected-point/mini-toolbar
  code. V3.90 retains only the direct gesture and no temporary connector UI.

## V3.89: Direct-Drag Connector Point Tools (Superseded by V3.90)

- A selected connector point now separates a click from a drag: click/release
  opens the `+`, `—`, `×` toolbar; drag begins the pre-existing exact-point
  branch workflow and receives the first moved position immediately.
- Junction toolbar cleanup is scoped to junctions, so its normal refresh on
  mouse release no longer removes connector controls. Connector hit targets
  and their point now use a hand/drag cursor.

## V3.88: Two-Stage Anywhere Connector Tools (Superseded by V3.89)

- V3.87 confirmed that connector clicks create a temporary dark point, but
  exposed that the point was not acting as the familiar junction control.
- V3.88 makes the interaction explicitly two-stage: click a connector to
  place its dark point, then click that point to open `+`, `—`, and `×`.
  The dash cycles the connector arrow mode; the other commands retain the
  existing exact-point branch and connector-only delete behaviours.
- The selected point and its open/closed menu state remain temporary UI:
  clicking elsewhere, loading history, or deleting the connector clears both.

## V3.87: Anywhere Connector Tools (Superseded by V3.88)

- The old persistent middle `+` is replaced with an invisible wide connector
  hit target. Clicking anywhere on a connector shows a temporary dark point at
  that position and a mini toolbar.
- The toolbar's `+` splits/branches from that exact point, its arrow button
  cycles `— / → / ← / ↔`, and `×` removes only the selected connector. These
  temporary controls never enter saved/exported graph data.
- The former middle-control crowded hit halo is superseded by the new selected
  point and its mini toolbar; Node and junction controls keep their own
  existing interaction behaviour.

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

1. GitHub release practice: repository currently has only tag `v0.9`. When a
   MindMap release is ready to publish, propose a tag such as
   `mindmap-v3.73` and a GitHub Release; do not create/push one without user
   authorization.

## Verification Expectations

- Run inline JavaScript syntax check and `node build-tools.js`.
- Run `git diff --check`.
- Local `file://` page navigation was previously blocked by automated browser
  policy, so ask the user to refresh and perform final interaction checks.
