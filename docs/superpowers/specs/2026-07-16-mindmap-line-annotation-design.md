# MindMap Line Annotation Design

## Goal

Add a standalone `Line` annotation for visually dividing large Mindmaps, such
as separating periods on a timeline. It is not a connector between nodes and
does not affect graph relationships.

Floating Text and connector labels are intentionally deferred. This change
establishes the annotation data path first.

## User interaction

1. Add a Line button in the final empty position of the Shapes area.
2. Clicking it creates a horizontal line, approximately 400 Canvas pixels
   long, centred in the usable viewport. Its initial stroke colour is `C9`
   blue.
3. Clicking a line selects it. Selection shows a delete control and two end
   handles.
4. Dragging the body moves the complete line. Dragging either end changes that
   end only, so the line can be resized or angled freely.
5. Holding Shift while dragging an end constrains the result to horizontal or
   vertical, choosing the closer axis. Holding Shift while moving the body
   constrains movement to one axis.
6. When Snap is enabled, moving the body or either endpoint snaps its Canvas
   coordinates to the existing 40px grid.
7. `Delete` removes a selected line. The red delete control removes that line
   directly. Lines are deselected when the user selects another Canvas object.
8. Selecting one or more existing colour controls changes the selected line's
   stroke. The colour controls continue to work for selected nodes as today.

## Rendering and layering

- Lines are ordinary SVG elements inside a dedicated annotation SVG layer.
- The layer is below nodes, images, and node-to-node connectors. Thus, a
  timeline divider remains visible across open space but never blocks the
  content it organizes.
- The selected line has a visible, theme-compatible selection treatment and
  pointer-friendly endpoints. Handles and the delete control are UI only and
  never appear in exports or saved state.

## Data model and persistence

Each line record contains:

```js
{ id, x1, y1, x2, y2, color }
```

Records are stored in Mindmap history separately from graph connectors.
They participate in autosave, legacy JSON import compatibility, Project ZIP,
standalone HTML, and Undo/Redo. Existing maps without `annotations.lines`
remain valid and load with an empty list.

Zoom-to-Fit includes both endpoints. PNG and HTML output render the visible
line but omit editing handles and delete controls.

## Error handling and compatibility

- Invalid or incomplete imported line records are ignored rather than blocking
  a whole map import.
- Minimum line length prevents an accidental zero-length annotation.
- Existing node connectors retain their current IDs and SVG behavior; no
  connector semantics are changed.

## Verification

1. Create, move, resize, angle, axis-constrain, recolour, and delete a line.
2. Test Snap for line movement and endpoints.
3. Verify lines persist through Undo/Redo, local reload, JSON import, Project
   ZIP export/import, standalone HTML, and PNG.
4. Verify Fit includes off-screen lines and node connectors remain unchanged.
5. Run script syntax checks, `node build-tools.js`, and `git diff --check`.
