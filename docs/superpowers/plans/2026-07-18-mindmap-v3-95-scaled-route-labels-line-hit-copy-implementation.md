# MindMap V3.95 Scaled Route Labels, Line Hit Areas, and Alt-drag Copy Implementation Plan

> Implements `../specs/2026-07-18-mindmap-v3-95-scaled-route-labels-line-hit-copy-design.md`.

The `writing-plans` skill is not installed in this session, so this document is
the equivalent repository-local implementation plan.

## 1. Establish focused browser regressions

1. Review `tests/mindmap-browser-harness.html` and add focused checks without
   adding test maps or binary image artifacts to Git.
2. Add a route-label scale check that records the screen-space size of a label
   and of its source Node at 10%, 100%, and 200%. The ratio must remain
   constant; the 100% appearance remains the baseline.
3. Add an annotation-Line hit test that dispatches a pointer close to, but not
   directly on, a Line at low and high zoom. Assert that the Line selects and
   that a Node above the Line still receives its own click.
4. Add copy-history checks for one selected Node/image group with an internal
   connector. Assert cloned IDs are distinct, only the internal connector is
   recreated, the image asset ID is reused, and one Undo/Redo reverses and
   restores the entire copy activity.
5. Keep Line and Floating Text copy coverage focused on their persisted
   geometry/content and one-history-activity behavior.

## 2. Let connector route labels use Canvas scale

1. In `decoded/mindmap.html`, trace the route-label render and automatic
   placement helpers, including `renderConnectorRouteLabels()` and its
   measurement/docking helper.
2. Remove the inverse font-size compensation (`16 / zoom`) and render with the
   100% Canvas size as its CSS size. Because the parent Canvas is already
   transformed, it will naturally scale with Nodes.
3. Remove inverse zoom compensation from the automatic Node docking gap so
   label padding and distance from the Node also scale in Canvas units.
4. Preserve normalized manual route-label positions, auto-placement revision
   migration, endpoint direction arrows, pointer navigation, drag, editing,
   and hide/show timing. Do not change route-label persistence fields.
5. Confirm automatic labels remain centred/docked with the current collision
   and measurement rules after the new scale behavior.

## 3. Add a non-visual wide hit area for annotation Lines

1. In `renderAnnotations()`, retain the existing visible `.annotation-line`.
   For each persisted annotation, add a separate transparent SVG hit line with
   the same endpoints and the same pointer-down behavior.
2. Give only the transparent hit line pointer events, hand cursor behavior,
   and a roughly 20px non-scaling SVG stroke. Keep the displayed line thin and
   visually unchanged.
3. Keep the hit target transient: it must not use `.annotation-line`, enter
   `annotationsFromDom()`, export, import, backup, or history data.
4. Render selected endpoint controls and delete control after the hit line so
   their current pointer interaction wins. Retain the annotation layer below
   Nodes so Node and Node-control clicks still take precedence.
5. Preserve all existing move, endpoint-resize, Shift axis locking, grid Snap,
   and deletion paths for vertical, horizontal, and diagonal Lines.

## 4. Add deferred Alt-drag copy state

1. Add one small copy-drag controller beside existing drag state. It records
   the pointer-down position, anchor kind/ID, selected-object snapshot, and
   original selection, but does not create data until the pointer crosses the
   current drag threshold.
2. Start it only for `Alt` pointer-down on a selected object:
   - Node or image: require that the target is in the existing selected
     Node/image group.
   - Line: require `selectedAnnotationId` to equal the pointed Line.
   - Floating Text: require `selectedAnnotationTextId` to equal the pointed
     text.
   An Alt pointer-down on an unselected object is a safe no-op: no selection
   changes, original movement, or copy.
3. Once the threshold is crossed, create the copy at the original Canvas
   coordinates, switch selection to the copied Objects, and route the rest of
   the gesture through the existing Canvas-space drag/Snap calculations. The
   copy continues even if Alt is released after the gesture has started.
4. If pointer-up occurs before the threshold, discard the deferred state. No
   duplicate appears and no history snapshot is created.
5. Keep regular drag, Shift axis locking, resize, pan, selection marquee, and
   connector creation independent of the new controller.

## 5. Clone selected Nodes, images, and internal connectors safely

1. Build a targeted copy snapshot from selected Node DOM state and selected
   image placements only; do not deep-copy the entire 1,000+ Node map for one
   Alt-drag.
2. Create Node copies with fresh Node IDs through the existing node-state
   creation path. Retain title, description, note, colors, shape, dimensions,
   and every other persisted Node property.
3. Create image placements with fresh placement IDs while retaining all
   placement geometry and the same `assetId`, source/thumbnail metadata. Use
   the existing viewport image renderer so offscreen images remain virtualized.
4. Build an old-to-new Node ID map. Recreate only connectors whose two endpoint
   IDs are in that map. Copy each connector's arrow mode and route-label data;
   leave connectors to unselected Nodes attached only to the original graph.
5. Initialize the newly copied Node/image set as the selected group. Movement
   from the grabbed copied anchor uses one shared delta; Snap applies only to
   that anchor, preserving relative group spacing.

## 6. Clone annotations without widening selection scope

1. Extend Line pointer handling with a single-Line copy path: clone endpoints
   and color to a new annotation ID at the drag threshold, select the clone,
   then apply the same delta during the gesture.
2. Extend Floating Text pointer handling similarly: clone text, description,
   color, font size, and coordinates to a new annotation-text ID, select it,
   then apply the drag delta.
3. Keep Lines and Floating Text single-select and exclusive of Node/image
   selection. Do not introduce mixed annotation selection or group annotation
   dragging in V3.95.

## 7. History, cancellation, and compatibility

1. On a successful duplicate-and-place action, call the existing history save
   mechanism exactly once after the final drag position is applied.
2. Undo must remove all copied Nodes, image placements, internal connectors,
   or the copied single annotation as one structural activity. Redo restores
   the same IDs and properties.
3. On Escape, window blur, lost pointer/mouse completion, or a below-threshold
   pointer-up, clear copy-drag transient state and restore the original
   selection without leaving copied DOM or placements behind.
4. Do not alter `mindmap-project` `formatVersion: 1`, backup schema, JSON/ZIP
   detection, HTML thumbnail export, PNG, Find, Node Notes, or IndexedDB image
   asset storage.

## 8. Version, documentation, generation, and handoff

1. Change visible MindMap/About version text and new Project ZIP manifest
   `appVersion` from 3.94 to 3.95. Keep `formatVersion: 1`.
2. Add `Alt` + drag copy instructions to the Hotkeys section in
   `content/mindmap-info.html`, making the select-first requirement clear.
3. Regenerate `tools/mindmap.html` only with `node build-tools.js`.
4. Run source/generated inline JavaScript syntax checks, browser-harness
   regressions, and `git diff --check`.
5. After the user verifies the local `file://` page, record the exact V3.95
   behavior and test result in `HANDOFF.md`.
6. Commit only intended source, generated MindMap, Info content, tests, plan,
   and handoff edits. Do not track AI-local files, generated maps/exports, or
   the user's original `D:\202607162107.zip`.

## 9. Final user test checklist

1. Zoom to 10%, 100%, and 200% and confirm route labels stay the same relative
   size and spacing as their Nodes while click, drag, and double-click editing
   still work.
2. Click/drag near a vertical, horizontal, and diagonal Timeline Line with
   Snap off/on. Confirm the Line is easy to select but an overlapping Node and
   its controls remain easy to select.
3. Select one Node, a connected Node/image group, one Line, and one Floating
   Text. Alt-drag each and verify the copy is placed at the pointer, selected
   after release, and the original remains unchanged.
4. Verify connected copied Nodes retain only internal connector relationships,
   including arrow modes and route labels; verify any external relationship is
   absent from the copied group.
5. Confirm one Undo/Redo handles each whole copy gesture. Save/export/import
   a map containing copies and ensure it reloads without changed image assets
   or relationships.
