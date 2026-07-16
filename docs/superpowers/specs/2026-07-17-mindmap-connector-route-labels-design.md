# MindMap Connector Route Labels Design

## Goal

Replace V3.78's temporary circular long-connector jump buttons with editable,
floating route labels. Each connector can describe the relationship from each
of its two endpoint Nodes and each label navigates to the opposite Node.

This removes the previous requirement that a target Node be outside the
viewport. Route labels provide continuous, local navigation for every
connector around the active Node.

## User interaction

1. Every connector owns two independent endpoint labels: one read from `n1`
   toward `n2`, and one read from `n2` toward `n1`.
2. When the user hovers or selects a Node, show the route label for that
   Node's side of every attached connector.
3. A populated label is horizontal floating text in the form `→ label`.
   Clicking it preserves the current zoom and centres the opposite Node.
4. Double-click a populated label to edit its text in place. Pressing Enter
   saves; Shift+Enter creates a new line only if needed. Escape cancels the
   active edit.
5. Drag a label to move it anywhere along its connector. The label remains
   horizontally oriented regardless of connector angle.
6. A side without text shows `→ +` only while its Node is hovered or selected.
   Clicking this placeholder enters editing to create its first label.

## Appearance and layout

- Labels have no normal border, fill, or pill background. They read as
  ordinary floating text over the Canvas.
- On hover, focus, or drag, a subtle theme-compatible outline/background
  appears solely to reveal the interactive target.
- Default positions are near their owning Node (18% from `n1`, 82% from
  `n1` for `n2`), avoiding an immediate collision at the connector midpoint.
- Each side stores a normalized position from 0 to 1 along the visible
  edge-to-edge connector, so positions update naturally when either Node
  moves or changes size.
- Labels may be dragged across the full connector length. The system does not
  forcibly resolve intentional overlaps; users can separate crowded routes
  themselves.

## Data model and persistence

Each connector gains an optional `routeLabels` record:

```js
{
  n1: { text: '', position: 0.18 },
  n2: { text: '', position: 0.82 }
}
```

The names identify the endpoint Node, not graph direction. Old connectors
with no record normalize to the two empty defaults. Labels participate in
history, Undo/Redo, autosave, JSON, Project ZIP, standalone HTML, and PNG.
They are graph content, unlike V3.78's temporary navigation controls.

## Rendering and integration

- The old `.connector-nav` overlay and outside-viewport filtering are removed.
- A dedicated route-label overlay renders only labels for the currently
  hovered Node, or for exactly one selected Node when there is no hover.
- Route labels are rendered above connector lines but below Node interaction
  controls. They do not change connector geometry, Fit bounds, or the existing
  midpoint branch / arrow-mode controls.
- Navigation continues to use the existing transform model: retain `zoom`,
  centre the target Node in the usable viewport, and clear Fit restore state.

## Error handling and compatibility

- Missing endpoint Nodes, malformed label records, and non-finite positions
  are normalized or ignored without blocking the map.
- Positions outside 0–1 are clamped during load and drag.
- Existing maps retain current connector arrow modes and load with empty route
  labels. Existing V3.78 temporary navigation controls require no migration
  because they were never persisted.
- Deleting or splitting a connector removes its labels; new split segments
  receive empty labels and plain arrow mode.

## Verification

1. Create labels on both ends of one connector and verify each navigates to
   the opposite Node at unchanged zoom.
2. Edit, cancel, multiline-edit, drag, and reposition labels on horizontal,
   vertical, and diagonal connectors; verify text remains horizontal.
3. Verify unlabeled endpoints show `→ +` only while their owner is active.
4. Test a Node with many connectors and separate crowded labels by dragging.
5. Test node move/resize, branch/split, arrow modes, Undo/Redo, reload,
   JSON/ZIP, standalone HTML, PNG, and Fit.
6. Run syntax checks, `node build-tools.js`, and `git diff --check`.
