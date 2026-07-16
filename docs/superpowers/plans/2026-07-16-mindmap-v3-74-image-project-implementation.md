# MindMap V3.74 Image Project Implementation Plan

> Implements the approved design in
> `docs/superpowers/specs/2026-07-16-mindmap-v3-74-image-project-design.md`.
> Work only from `decoded/mindmap.html`, then rebuild `tools/mindmap.html`.

## 1. Establish a safe baseline

**Files:** `decoded/mindmap.html`, `build-tools.js`, `HANDOFF.md`

1. Record the current V3.73 behavior and run the existing inline-script syntax
   check, `node build-tools.js`, and `git diff --check`.
2. Preserve the unrelated `.gitignore` worktree change throughout.
3. Correct the stale top-level V3.73 handoff text so its latest commit and
   two-step Fit/Restore behavior agree with the source.
4. Add a V3.74 in-progress entry that links to the approved design and this
   plan.

## 2. Add offline ZIP support and package constants

**Files:** `assets/` (new vendored ZIP library), `decoded/mindmap.html`,
`build-tools.js` only if generation needs a new injected dependency

1. Vendor a reviewed, browser-compatible ZIP library locally so Project ZIP
   read/write works from `file://` and does not depend on a network request or
   account.
2. Load that library before the Mindmap application script in the generated
   tool page.
3. Define package constants in Mindmap: format identifier, manifest version,
   `.mindmap.zip` extension, thumbnail dimensions/encoding, and minimum
   supported package version.
4. Keep the existing standalone HTML behavior independent of ZIP code; a
   project HTML snapshot must not pretend it contains original assets.

## 3. Introduce a bounded project store

**Files:** `decoded/mindmap.html`

1. Add a small IndexedDB wrapper with distinct stores for project metadata,
   graph state, assets, and thumbnails. Each method must return a Promise and
   surface quota/transaction errors to the UI.
2. Define serializable records:
   - project: `id`, name, format version, active-map metadata;
   - asset: `assetId`, original Blob metadata and checksum;
   - thumbnail: `assetId`, thumbnail Blob metadata;
   - placement: `id`, `assetId`, x/y/w/h, caption, source, note.
3. Keep existing node/line serialization unchanged. Replace the current image
   history state `{src, x, y, w, h}` with placement references after a map
   enters Project mode.
4. Preserve the legacy base64 image state when opening old JSON/HTML. Migrate
   it to assets only when that map first enters Project mode.
5. Make history contain placement metadata only. Never clone original or
   thumbnail binary data for Undo/Redo.

## 4. Refactor image rendering into a layer

**Files:** `decoded/mindmap.html`

1. Separate placement data from live `.img-float` DOM elements. Keep only
   viewport-near placement elements rendered while retaining all placement
   records in memory.
2. Re-render the Image Layer after pan, zoom, state load, image import,
   Image-Layer toggle, and viewport resize. Use Canvas coordinates and a
   generous viewport margin to avoid flicker while panning.
3. Create/revoke thumbnail object URLs safely when image DOM elements enter or
   leave the layer, avoiding memory leaks.
4. Add `🌄 ภาพ` immediately after `🧲 Snap`. Its state controls rendering only;
   it must not change stored placements, package exports, or graph history.
5. Ensure selection, Delete, drag movement, Snap, and Undo/Redo work when the
   selected image was rendered lazily. If the layer is off, image selection is
   intentionally unavailable until it is switched back on.

## 5. Build image insertion and metadata UI

**Files:** `decoded/mindmap.html`, `content/mindmap-info.html`

1. Add `🖼️ IMG` beside `🔎 Find`, with a hidden multi-file image picker. It
   inserts each selected image at the usable viewport center; drag-and-drop
   inserts at the drop coordinate.
2. On insertion, decode the source file, create a bounded thumbnail, write
   original/thumbnail assets to IndexedDB, and create a placement record.
3. Detect duplicate assets by a stable content checksum. For a repeated asset,
   offer an existing placement as metadata-copy source; if several placements
   match, let the user choose. Copy caption/source/note values into the new
   placement so later edits are independent.
4. Implement resize handle math in canvas space:
   - free resize;
   - Shift aspect-ratio lock;
   - Ctrl center-preserving resize;
   - Shift+Ctrl both rules;
   - retain safe minimum dimensions.
5. Add the image detail modal. Double-clicking an image must open it and must
   stop the existing global double-click handler from creating a node. Load the
   original blob only when the modal opens. Provide editable caption, source or
   URL, and multi-line note; close with Escape, close button, or backdrop.
6. Update Info copy to describe `🖼️ IMG`, `🌄 ภาพ`, full-image view, and the
   revised export behavior.

## 6. Implement one Import and one Export

**Files:** `decoded/mindmap.html`, `content/mindmap-info.html`

1. Change the visible Import input to accept JSON and ZIP. Detect JSON by
   parse/shape validation and ZIP by archive contents plus `manifest.json`, not
   merely extension or MIME type.
2. Parse and validate into a temporary in-memory package before clearing or
   replacing the active graph. Present progress for archive entries and asset
   writes.
3. On successful ZIP import, atomically create the IndexedDB project and load
   graph/placement records. On malformed input, missing storage, cancellation,
   or quota failure, retain the current map unchanged and display a useful
   summary.
4. Replace the visible JSON export action with one `📤 Export` that always
   produces `<name>.mindmap.zip`. For maps without images, output only
   `manifest.json` and `mindmap.json`; for Project maps, add originals and
   thumbnails.
5. Update `💾 HTML` for Project mode: embed compact thumbnails per placement,
   omit original blobs, and add an in-page snapshot notice that Project ZIP is
   required to recover full originals. Retain normal interactive nodes and
   connectors in the HTML output.
6. Retain legacy JSON import compatibility; do not expose a normal JSON export
   button. JSON remains the data document inside every Project ZIP.

## 7. Extend Find safely to node Notes

**Files:** `decoded/mindmap.html`, `content/mindmap-info.html`

1. Extend the existing `title` / `all` search model so `all` searches title,
   description, and `data-note`.
2. Build one result per node, retaining which visible fields matched and
   whether only the hidden Note matched.
3. Use safe text-node-based highlighting for title/description matches; do not
   rewrite arbitrary `innerHTML` or expose Note text on the Canvas.
4. For Note-only matches, keep the existing node-level Find highlight and
   center behavior without adding a permanent note indicator.
5. Clear all temporary field and node highlights when the Find query changes,
   Find closes, the graph reloads, or an export clone is produced.
6. Update Info/Hotkeys text only where current behavior changes.

## 8. Verify performance, compatibility, and exports

**Files:** `decoded/mindmap.html`, generated `tools/mindmap.html`, test
fixtures added only if needed

1. Add small controlled test fixtures: legacy JSON with nodes, Project ZIP
with images, repeated-asset placements, a broken ZIP, and a missing-asset ZIP.
2. Test legacy JSON import, compact no-image ZIP export/import, image ZIP
round-trip into a clean browser profile, and Project HTML snapshot behavior.
3. Test Image Layer On/Off, pan/zoom while many placements exist, selection,
drag/Snap, Delete/Undo, all resize modifiers, duplicate metadata copying, and
the image modal.
4. Test Find separately for title, description, Note-only, and multi-field
matches. Confirm no duplicate result rows and no Note text leakage.
5. Test invalid ZIP, missing asset, IndexedDB storage failure simulation, and
that current work is not replaced before import success.
6. Run inline JavaScript syntax checks, `node build-tools.js`, generated-output
assertions, and `git diff --check`.
7. Ask the user to perform final browser interaction tests; update HANDOFF,
the Info version label, and release documentation only after acceptance.

## Implementation checkpoints

Do not treat this as one opaque change. Pause for a user test after:

1. ZIP import/export plus legacy JSON compatibility;
2. image insertion, layer toggle, resize, and detail modal;
3. HTML snapshot and Find/Note behavior.
