# MindMap V3.94 Multi-Image Selection Implementation Plan

> Implements `docs/superpowers/specs/2026-07-18-mindmap-v3-94-multi-image-selection-design.md`.

The `writing-plans` skill is not installed in this session, so this document is
the equivalent repository-local implementation plan.

## 1. Add browser regressions before changing behavior

1. Extend `tests/mindmap-browser-harness.html` with a small in-memory image
   fixture. Use data already available to the harness or tiny generated data
   URLs at runtime; do not add image artifacts to Git.
2. Add real pointer/keyboard interaction tests for Shift+click selection and
   toggling of two images while a Node remains selected.
3. Add selection-box tests covering Node/image overlap, replacement behavior,
   and Shift-add behavior.
4. Add a mixed Node/image group-drag test from a Node anchor and another from
   an image anchor. Assert one common Canvas-space delta and preserved pairwise
   Node/image positions.
5. Run the new tests against V3.93 before source changes and record the
   expected failures: image multi-selection is unavailable and mixed group
   dragging cannot occur.

## 2. Establish persistent-in-memory image selection helpers

1. In `decoded/mindmap.html`, introduce one transient `selectedImageIds` set
   near image placement state. It becomes the only authoritative image
   selection state; `.img-float.sel` remains visual output.
2. Add focused helpers to retrieve selected placements, test/set/toggle an
   image ID, synchronize rendered image selection classes, and clear Node plus
   image selection together.
3. Update `renderImageLayer()` so every newly created or re-created viewport
   image receives `.sel` when its placement ID is currently selected.
4. Update image removal, import/load/reset, annotation selection, and existing
   `clearSel()` paths to discard or synchronize selected IDs. Selection must
   never be written to saved map state or history snapshots.
5. Update V3.93's `deleteSelectedObjectsActivity()` to read selected image IDs
   rather than only image DOM selection classes, so culled selected images are
   still deleted in the same activity.

## 3. Make selection interactions consistent across Nodes and images

1. Adjust Node pointer-down handling so Shift+click toggles just that Node and
   ends there; it must not start a drag.
2. Adjust image pointer-down handling with matching semantics: Shift+click
   toggles only that image ID and does not start a drag; a normal click on an
   unselected Object clears both selection types, selects the Object, then
   starts drag; normal click on selected Object preserves the full selection.
3. Keep image `×`, resize handles, and image detail/view interactions isolated
   from selection drag through event propagation checks.
4. Extend Canvas marquee state to capture both preselected Nodes and preselected
   image IDs. Test each placement's Canvas bounds against the rectangle and
   apply replace/add behavior without relying on an image being rendered.

## 4. Replace single-type dragging with one mixed group-drag activity

1. Refactor existing Node drag bookkeeping into a group-drag state that records
   original positions for all selected Nodes and all selected image placements,
   plus an explicit anchor kind and anchor ID.
2. Start that shared drag state from both `attachNodeEvents()` and
   `attachImgEvents()`. Preserve existing Canvas-to-screen conversion and pan
   behavior.
3. On each animation-frame drag update, calculate one Canvas-space delta from
   the pointer and the chosen anchor. Apply the same delta to every captured
   Node and image placement.
4. With Snap enabled, derive the shared delta by snapping the Node-anchor
   center or image-anchor top-left to the existing 40px grid. Do not round each
   selected Object independently.
5. Continue incremental connector redraw only for connectors attached to moved
   Nodes. Update rendered selected images from their placements without forcing
   offscreen images into the DOM.
6. On pointer-up, flush the pending frame and save one history state only when
   any captured Object moved. Preserve the existing no-op click behavior.
7. Leave image resizing single-image: Shift maintains aspect ratio, Ctrl keeps
   the center, and Shift+Ctrl keeps both. Do not introduce group resize.

## 5. Version, generation, and compatibility

1. Change visible MindMap and About version text from V3.93 to V3.94.
2. Change new Project ZIP manifest `appVersion` to `3.94`; keep
   `mindmap-project` `formatVersion: 1` and all persisted fields unchanged.
3. Regenerate `tools/mindmap.html` only through `node build-tools.js`.
4. Verify JSON, ZIP, HTML, thumbnails, IndexedDB image asset records, PNG,
   Find, Notes, annotations, backup, and legacy imports do not gain a persisted
   selection field or change formats.

## 6. Verify correctness and regressions

1. Run inline JavaScript syntax checks for source, generated MindMap, and
   browser harness, then run `git diff --check`.
2. Confirm the existing synthetic fixture remains exactly 1,000 regular Nodes,
   zero junctions, and 975 persisted connectors.
3. Run the complete localhost browser harness, including V3.92/V3.93 history,
   drag, branch, route-label, structural-identity, and image regressions.
4. Require new checks to prove mixed selection remains stable across viewport
   image culling, group drag and Snap preserve shared geometry, mixed Delete
   is one Undo/Redo activity, and individual image resize remains unchanged.
5. Record timings as observations only; correctness remains the pass/fail
   release gate. Close the test tab and stop the loopback server after testing.

## 7. Document and hand off

1. Update `HANDOFF.md` with V3.94 semantics, automated checks, and the final
   user verification result after the user tests it.
2. Commit only intended source, generated MindMap, browser harness, plan, and
   handoff changes. Do not stage AI-local files, generated test maps, exports,
   or the user's `D:\202607162107.zip`.
3. Ask the user to final-test on the local `file://` page with real images:
   Shift+select images and Nodes, marquee-select a mixed group, drag it from
   both a Node and an image with Snap off/on, resize one image, and verify one
   Undo/Redo for mixed move and mixed Delete.
