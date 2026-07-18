# MindMap Handoff

Updated: 2026-07-18 (Asia/Bangkok)

## Current Baseline

- Repository: `Startrospherez/qoltools`
- Current MindMap build: **V3.95** (Canvas-scaled route labels, easier Timeline
  Line selection, and Alt-drag copy), automated and user-verified on
  2026-07-18. The user tested real images, mixed selection, group movement,
  Snap, individual resize, mixed Delete Undo/Redo, and the complete Alt-drag
  copy refinement successfully. V3.93 activity-based batch Delete history
  remains user-verified: multi-Node Delete and one-step Undo/Redo worked with
  the current real working map.
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

## V3.95: Scaled Labels, Line Hit Areas, and Alt-drag Copy (Automated and User Verified)

- Connector route labels now use normal Canvas units. At 100% they retain the
  prior appearance, while at every other zoom they scale together with their
  Nodes and retain Canvas-relative automatic docking gaps.
- Timeline Lines keep their 4px visual stroke but render a separate invisible
  20px non-scaling hit stroke, making selection and dragging easier without
  changing exports, persistence, or the visible divider.
- `Alt`+drag copies Node/image groups, Lines, and Floating Text. A copied
  Node/image group retains relative positions, reuses image assets, and
  recreates only connectors wholly within the copied group, including arrow
  modes and route labels. Each completed copy is one Undo/Redo activity.
- The direct-copy refinement permits `Alt`+drag on an unselected single Node,
  image, Line, or Text without a preparatory click. When a Node/image group is
  already selected, `Alt`+dragging an unselected Node or image adds it to the
  copied group. An `Alt`+click without a drag leaves data, history, and
  selection unchanged; Escape/blur restores the original selection.
- The `i` dialog documents both the direct `Alt`+drag shortcut and the
  Node/image group behavior.
- The localhost 1,000-Node browser harness passed all existing checks plus
  direct copy of each object type, expanded Node/image group copy, one-step
  Undo/Redo, and the no-drag safety case. The user verified all requested
  direct-copy cases on the local `file://` MindMap page successfully.

## V3.94: Mixed Node/Image Selection (Automated Verification Passed)

- Image selection now lives in the transient `selectedImageIds` set instead of
  only visible image DOM classes, so it remains correct when viewport culling
  removes and recreates image elements.
- `Shift`+click toggles an individual Node or image. A normal click on an
  unselected Object replaces the selection; normal click on an already
  selected Object preserves the whole mixed selection for dragging.
- Empty-canvas marquee now selects images and Nodes together; `Shift`+marquee
  adds to the existing mixed selection.
- Dragging a selected Node or selected image moves all selected Nodes and
  images by one shared Canvas-space delta. With Snap on, only the drag anchor
  is snapped, preserving all relative spacing. Connectors attached to moved
  Nodes still redraw incrementally.
- Image resize remains single-image only. The existing Shift/Ctrl resize
  modifiers are unchanged. Selection is not saved in JSON, ZIP, HTML,
  history, backups, or `formatVersion: 1` project data.
- One mixed move and one mixed Delete each form one Undo/Redo activity. Image
  deletion removes its transient selected ID.
- The localhost browser harness passed on the 1,000-Node fixture. It covered
  Shift+click, normal selection replacement/preservation, marquee and
  Shift+marquee, image culling/recreation, Node-anchor and image-anchor group
  drag, Snap geometry, connector redraw, group Undo/Redo, and mixed
  Node/image Delete Undo/Redo. Its displayed app version and new Project ZIP
  manifest version are `3.94`.
- **User verification passed (2026-07-18):** real-image mixed selection,
  group movement from both Object types, Snap, individual resize, and
  one-step Undo/Redo for mixed Delete all worked as intended.

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

## V3.91: Performance Foundation (Automated and User Verification Passed)

- The 1,000-Node synthetic fixture established the pre-change baseline on the
  user's machine: about eight seconds before a short Node drag became visible,
  and about three seconds for movement/text Undo or Redo. Direct connector
  branching and Find were immediate.
- Node drag now collects the connectors attached to the dragged selection once
  at pointer-down, batches pointer movement through `requestAnimationFrame`,
  and redraws only those connectors and route labels. A pending frame is
  flushed before history is saved on pointer-up.
- Undo/Redo retains the existing full snapshots, but topology-compatible states
  patch only changed Nodes and connector metadata in place. Structural changes
  automatically use the prior full rebuild path.
- Project ZIP/JSON fields and image storage remain compatible. New Project ZIP
  manifests now correctly report app version `3.91`; `formatVersion` remains 1.
- The background browser harness below now exercises the generated page over a
  loopback-only server, avoiding the automated browser restriction on local
  `file://` pages. Subjective feel during real work still belongs to the user.

## Background Browser Harness (Implemented and Verified)

- `tests/mindmap-test-server.js` is a read-only Node standard-library server.
  It binds only to `127.0.0.1`, defaults to port `8765`, rejects write methods,
  traversal, directories, and missing files, and sends `Cache-Control: no-store`.
- `tests/mindmap-browser-harness.html` loads the generated MindMap in a
  same-origin iframe and imports only
  `test-fixtures/mindmap-ai-stress-1000.zip`. It never imports the user's real
  `D:\202607162107.zip` automatically.
- Manual start command:
  `node tests/mindmap-test-server.js --port 8765`, then open
  `http://127.0.0.1:8765/tests/mindmap-browser-harness.html`. Add `?autorun=1`
  for an unattended run. Stop the terminal process with `Ctrl+C` afterward.
- The harness checks the exact 1,000 regular Nodes and 975 connectors, five
  drags plus attached connector redraws, movement/text Undo and Redo, a
  connector branch, and structural Undo and Redo. It keeps reports in the page
  only; it does not write benchmark results into the repository.
- First background run on 2026-07-17 passed all correctness assertions. Main
  timings: import 1376.8 ms, drag-visible median 15.9 ms, drag-commit median
  35.9 ms, movement Undo/Redo 29.2/33.2 ms, text Undo/Redo 34.9/31.7 ms,
  structural branch 32.2 ms, and structural Undo/Redo 1484.4/1416.5 ms.
  Structural history remains the known full-rebuild path and is the clearest
  remaining performance target.
- A later deeply hidden iframe run also passed every correctness assertion and
  correctly reported overall `PARTIAL`: rendered drag timing was unavailable
  because Chromium throttled the iframe. In that mode the harness skips waiting
  on hidden animation frames, reports handler timings separately, and never
  presents throttled values as normal foreground performance. It also dispatches
  the existing contenteditable blur event when a hidden iframe cannot receive
  programmatic focus, keeping the text history test on the real save path.
- The browser-control layer emitted one `MutationObserver.observe` console
  error while instrumenting the reloaded iframe. No `MutationObserver` exists
  in the MindMap or harness source, and all application assertions passed; this
  is recorded as browser-instrumentation noise rather than an application error.

## V3.92: Structural History Reconciliation (Automated Verification Passed)

- Undo/Redo continues to save complete `formatVersion: 1` snapshots, but a
  valid Node/Junction/connector topology change is now reconciled by stable IDs
  instead of rebuilding the whole Canvas. Unrelated Node and connector DOM
  objects remain intact.
- The reconciler removes obsolete graph elements, patches retained elements,
  creates only missing elements, restores exact connector IDs, and preserves
  arrow modes and both endpoint route labels. Image or annotation topology
  changes, imports, startup backup restoration, and unexpected reconciliation
  errors deliberately retain the safe full-rebuild path.
- History targets are validated before application. Duplicate or missing IDs,
  connector/Node ID collisions, and missing connector endpoints are rejected
  without advancing the history cursor.
- Node and connector construction now share helpers used by live creation,
  full rebuild, and structural reconciliation, reducing behavior drift between
  normal editing and history restoration.
- The background harness now also checks exact created IDs, arrow/route-label
  preservation, structural Undo/Redo identity retention, regular Node deletion,
  junction deletion, and their Undo/Redo cycles.
- Automated foreground-iframe run on 2026-07-18 passed every correctness check
  with 1,000 regular Nodes and 975 persisted connectors. Structural Undo/Redo
  measured 16.1/19.0 ms; deleted-Node Undo/Redo 17.5/11.9 ms; deleted-junction
  Undo/Redo 14.3/14.9 ms. Import was 1258.4 ms and remains a deliberate full
  rebuild. The known browser-instrumentation `MutationObserver.observe` noise
  appeared again; there is still no such observer in MindMap or harness code.
- Displayed version and Project ZIP manifest app version are now `3.92`;
  Project ZIP `formatVersion` remains 1. The user's local interaction test
  confirmed that structural Undo/Redo was fast, while revealing that one
  multi-selection Delete still produced one history step per Object; V3.93
  corrects that separate history-unit defect.

## V3.93: Activity-Based Batch Delete History (Automated and User Verified)

- One `Delete` keypress now creates one history entry for the complete selected
  Node/image activity. One Undo restores all affected Objects and connectors;
  one Redo removes the same result again.
- Separate Node, junction, or image `×` actions remain separate history
  activities. Connector cleanup and existing junction-healing order are
  unchanged.
- Node and image deletion now use internal mutation primitives. Public
  single-object deletion commits immediately, while the keyboard batch captures
  selected IDs first, performs every mutation, and commits once at the end.
- The new regression first reproduced the V3.92 failure: three selected regular
  Nodes were removed by one keypress, but the first Undo left the graph in the
  deleted state because intermediate and duplicate snapshots existed.
- After the fix, the complete browser suite passed all correctness checks for
  1,000 regular Nodes and 975 persisted connectors. It verified multi-regular
  deletion, regular-plus-junction deletion, exact one-step Undo/Redo, unrelated
  DOM identity, and two separate deletions remaining two separate activities.
- The final unattended run reported `PARTIAL` only because Chromium throttled
  background rendering; correctness remained fully passed. Raw batch
  Undo/Redo measured 18.7/7.7 ms in that run and is not treated as a universal
  performance limit.
- Visible and Project ZIP manifest app version are `3.93`; project
  `formatVersion` remains 1. The user verified the multi-Node batch on the local
  `file://` page and found it correct. Mixed Node/image selection could not be
  tested because the current UI does not yet support selecting multiple images;
  that is a separate future capability, not a V3.93 failure.

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
