# Mindmap Center Snap Design

## Goal

When Grid and Snap are enabled, nodes placed in the same grid row or column
must have perfectly horizontal or vertical connector lines, even when their
dimensions differ.

## Options Considered

1. Snap each node's top-left corner (current behavior). This keeps corners on
   grid intersections but makes center-to-center connectors slant for nodes of
   different sizes.
2. Snap each node's visual center to the 40px grid (selected). This preserves
   the existing grid and connector model while aligning connector endpoints.
3. Keep corner snapping and force connector lines to horizontal/vertical. This
   would misrepresent the actual node positions and complicate branching.

## Design

Add one shared helper that rounds a node's center position to the 40px grid,
then returns the corresponding `left` and `top` coordinates. Use it in both
single-node dragging and multi-selection dragging whenever Snap is on.

The helper reads the target node's rendered width and height. Its output places
the center at an exact grid intersection, so the current center-to-center SVG
line rendering becomes exactly horizontal for equal snapped center Y values and
vertical for equal snapped center X values. Dragging without Snap, Shift axis
locking, saved data, import/export, and connector behavior remain unchanged.

## Verification

Manually verify that differently-sized nodes snap to the same row with a flat
horizontal connector, and to the same column with a straight vertical connector.
Also verify normal dragging and multi-node snapping.
