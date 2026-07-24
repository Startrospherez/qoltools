# MindMap V3.96 Background Areas and Floating Text Axis Lock Implementation Plan

> Implements
> `../specs/2026-07-23-mindmap-v3-96-background-areas-text-axis-lock-design.md`.

The `writing-plans` skill is not installed in this session, so this document is
the equivalent repository-local implementation plan.

## 1. Add focused browser regressions first

1. Extend `tests/mindmap-browser-harness.html` with V3.96 checks using the
   existing synthetic 1,000-Node fixture. Do not add exported projects,
   screenshots, or binary assets to Git.
2. Verify that an Area is below Nodes, images, connector SVG, Line annotations,
   and Floating Text, and that its normal DOM has no pointer events.
3. Exercise Area mode through real mouse/keyboard event paths: enter mode,
   drag-create, select, move, resize from an edge and corner, recolour, Snap,
   delete, and exit via both the button and `Escape`.
4. After leaving Area mode, dispatch ordinary empty-Canvas double-click,
   marquee, and pan gestures through an Area and confirm the existing Canvas
   paths still receive them.
5. Add one-history-activity checks for Area creation, movement, resizing,
   recolouring, and deletion. Confirm one Undo/Redo reverses and restores the
   full activity.
6. Add Floating Text checks for free drag, `Shift` horizontal/vertical lock,
   Grid Snap after locking, and `Alt`+`Shift` copy placement.

## 2. Extend the annotation data model compatibly

1. In `decoded/mindmap.html`, change the annotation default from
   `{ lines: [], texts: [] }` to `{ areas: [], lines: [], texts: [] }`.
2. Extend `normalizedAnnotations()` to validate and clone each Area's ID,
   finite Canvas coordinates, positive dimensions, colour, and bounded faint
   opacity. Missing `areas` in old maps normalizes to an empty array.
3. Keep `mindmap-project` `formatVersion: 1`. Do not change connector, Node,
   image, backup, JSON/ZIP detection, or standalone-HTML compatibility.
4. Include Areas in annotation equality/history comparisons and every existing
   normalized annotation state used by autosave, import, export, and rebuild.

## 3. Create a dedicated background rendering layer

1. Add `#annotation-area-layer` as an absolutely positioned Canvas child below
   connector SVG, Line/Text annotation layers, images, and Nodes.
2. Render one borderless rectangle per persisted Area in creation order.
   Store geometry in Canvas units so the existing Canvas transform naturally
   handles zoom and pan.
3. Outside Area mode, set both the layer and Area rectangles to
   `pointer-events: none`; no Area may intercept Node, connector, empty-Canvas,
   marquee, or pan input.
4. In Area mode, render the selected Area with a transient dashed outline,
   eight resize handles, and an `×` control. Mark all edit controls as
   transient so DOM-to-state reads, PNG, HTML, and persisted data ignore them.
5. Add Area rectangles to Zoom-to-fit bounds using their persisted geometry.

## 4. Add the `🟨 Area` edit mode

1. Add one `🟨 Area` toolbar button in the Shapes/annotation controls and a
   transient `areaEditMode` state. The button visibly indicates when the mode
   is active.
2. Entering the mode clears ordinary Object/annotation selection and enables
   only Area editing on empty Canvas. Leaving it clears Area selection,
   transient controls, and active gestures.
3. While active, dragging empty Canvas beyond the existing movement threshold
   creates an Area from the normalized drag bounds. A click without sufficient
   movement creates nothing.
4. Clicking an Area selects it; dragging its body moves it. Resize handles
   modify the corresponding edges/corners while enforcing a small minimum
   width and height.
5. Apply Grid Snap to creation bounds, movement anchor, and resized edges.
   Preserve the opposite edge when an edge or corner is snapped.
6. `Escape` during an Area gesture cancels it and restores the pre-gesture
   Area data. `Escape` while idle exits Area mode. Browser blur follows the
   same cancellation path.

## 5. Integrate colour, delete, and history behavior

1. Extend the existing colour-palette dispatcher to prioritise the selected
   Area while Area mode is active. Store the palette hue and preserve the
   Area's faint opacity.
2. Let `Delete` and the transient `×` remove only the selected Area. Other
   Object deletion paths remain unchanged.
3. Save exactly one history state after each completed Area create, move,
   resize, recolour, or delete activity. Do not save during pointer movement.
4. Ensure Undo/Redo rebuild and incremental compatibility checks render Areas
   correctly without destabilising Node/connector DOM identity.

## 6. Include Areas in output paths

1. Because Areas live in normalized annotation state, confirm local backup,
   IndexedDB graph autosave, JSON, and Project ZIP round-trip them unchanged.
2. Ensure standalone HTML embeds and reloads Areas without external assets.
3. Ensure PNG includes visible Area fills but excludes selection outlines,
   handles, and delete controls.
4. Preserve Area creation order across every round trip. Find deliberately
   ignores Areas.

## 7. Add Floating Text axis locking

1. In `startAnnotationTextDrag()`, calculate Canvas-space deltas from the
   pointer-down point. When `Shift` is held, zero the non-dominant delta before
   applying Grid Snap.
2. Re-evaluate the dominant axis on each move from the original pointer-down
   point, matching the current Line axis-lock convention. Releasing `Shift`
   resumes free movement within the same gesture.
3. Apply the same text-specific axis lock inside
   `startSelectedAnnotationCopyDrag()` when `kind === 'text'`.
4. Preserve double-click editing, ordinary selection, direct Alt-drag copy,
   one-step Undo/Redo, and cancellation behavior.

## 8. Version, help, build, and validation

1. Increment visible MindMap/About and new Project ZIP manifest app version
   from 3.95 to 3.96. Keep project `formatVersion: 1`.
2. Update `content/mindmap-info.html` with the `🟨 Area` mode workflow,
   click-through behavior, and Floating Text `Shift` axis lock.
3. Regenerate `tools/mindmap.html` only with `node build-tools.js`.
4. Run inline JavaScript syntax checks for `decoded/mindmap.html`,
   `tools/mindmap.html`, and `tests/mindmap-browser-harness.html`; run the full
   browser harness and `git diff --check`.
5. Ask the user to verify the generated local `file://` page. After successful
   interaction testing, update `HANDOFF.md`, commit the verified baseline, and
   push the completed V3.96 commits to `origin/main`.

## 9. Final user test checklist

1. Create several vertical Areas with different colours; overlap two and
   confirm creation order is visible while all map Objects remain above them.
2. Exit Area mode and create/select/move Nodes, marquee, pan, and double-click
   empty Canvas directly over an Area. No Area should intercept input.
3. Re-enter Area mode and move, edge-resize, corner-resize, Snap, recolour,
   delete, and Escape-cancel an Area.
4. Confirm one Undo/Redo handles each whole Area activity.
5. Export/import Project ZIP and standalone HTML, then inspect PNG and Zoom to
   fit. Areas should survive and transient edit controls should not.
6. Drag Floating Text freely, with `Shift`, with Snap, and copy it using
   `Alt`+`Shift`; verify exact horizontal/vertical results and one-step
   Undo/Redo.
