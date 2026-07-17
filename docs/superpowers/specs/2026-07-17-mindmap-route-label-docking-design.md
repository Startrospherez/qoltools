# MindMap Route Label Docking Design

## Goal

Eliminate far-away automatic route labels. An untouched route label should
remain docked to its owning Node or junction while the connector changes
length, position, or zoom. The existing drag behavior remains the intentional
way to place a label in the middle of a connector.

## Docking behavior

### Regular Nodes

- The automatic label docks immediately outside the relevant Node `+` branch
  control, with only a tiny visual clearance so the two targets do not overlap.
- Its directional glyph is the near element; the relationship text remains
  horizontal.
- Every connector redraw recalculates this docked placement from the current
  Node/connector geometry. It is not represented by a fixed percentage of the
  connector length.

### Junction Nodes

- The automatic label docks immediately outside the small junction dot in the
  direction of its connector.
- A junction has no Node `+` branch controls, so no extra branch-control
  clearance is needed.

## Manual placement

- Dragging a route label continues to store its normalized connector position.
- The first meaningful drag changes that label from automatic to manual.
- Manual labels are never re-docked by Node movement, zoom, loading, undo/redo,
  or export-import.

## Compatibility

- Existing manually positioned labels remain unchanged.
- Existing automatic labels migrate to the docked state when first rendered
  under this revision.
- The automatic state, manual position, and docking revision remain part of
  existing history, backup, JSON, Project ZIP, standalone HTML, and PNG paths.

## Verification

1. Create two nearby Nodes, then drag one far away: both untouched labels stay
   at their respective Nodes.
2. Repeat with horizontal, vertical, and diagonal connectors and at several
   zoom levels.
3. Split a connector and verify junction-side labels dock beside the dot.
4. Drag one label into the middle; subsequently move/resize/zoom/reload and
   verify only that label remains manual.
5. Verify both the Node `+` and the docked label can be clicked on short links.
