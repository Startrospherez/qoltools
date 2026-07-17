# MindMap Connector Control Clearance Design

## Goal

Make route labels feel close to their owning endpoint without colliding with
the Node's `+` branch control, and keep short connector segments easy to use
when a line's middle `+` is near that control.

## Endpoint-aware route labels

### Regular Nodes

- An automatically placed label starts 24 screen pixels from the connector
  edge, rather than 30px.
- The Node branch control is 24px wide and protrudes about 15px beyond the
  Node boundary. When the automatic label would overlap that visible control,
  its anchor receives a small perpendicular screen-space offset.
- The label stays horizontal. Its small offset is only a default-layout aid;
  dragging it clears automatic placement and preserves the user's exact
  normalized position.

### Junction Nodes

- A junction is the small dark Node created by splitting a connector. It has
  no branch `+` controls, so its attached route label starts much nearer the
  visible dot: 10 screen pixels from the connector edge.
- This makes its label read like a compact direction sign at an intersection,
  while maintaining the current directional arrow and click-to-navigate
  behavior.

## Crowded middle `+` controls

- The middle `+` keeps its current midpoint and behavior: click to split a
  connector and drag to make a branch.
- If its midpoint lies close enough to the relevant branch `+` control of a
  regular Node for their hit regions to overlap, mark that middle control as
  crowded.
- A crowded middle control keeps its visible button, but its invisible
  hover/click halo is reduced. The Node's `+` therefore remains the easier
  target, while the middle control remains available on its visible circle.
- No automatic side shift is applied; this avoids a second cluster of controls
  around an already busy junction.

## Compatibility

- Manual route labels (`autoPlacement: false`) do not move.
- Untouched automatic labels receive the new endpoint-aware default once. A
  placement revision marker prevents repeated movement after that migration.
- Existing older saved labels without automatic-placement data retain their
  current normalized positions.
- The route-label state remains part of history, backups, Project ZIP, JSON,
  standalone HTML, and PNG export behavior.

## Verification

1. Test new labels on horizontal, vertical, and diagonal regular-node links.
2. Split a line and verify each junction-side label starts near the dot.
3. Test short Node-to-junction segments: both the Node `+` and the line middle
   `+` must be reachable without accidental activation.
4. Drag a label, then move/zoom/reload/export-import to verify it does not
   receive a later automatic offset or migration.
