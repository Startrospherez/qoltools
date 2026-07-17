# MindMap Route-Label Proximity Refinement

## Goal

Bring automatic route labels closer to a regular Node without covering the
Node or its branch controls.

## Approved behaviour

- Change the automatic regular-Node docking distance from **24 screen pixels**
  to **14 screen pixels**.
- Retain the existing 10-pixel docking distance for a junction dot, so the dot
  remains an easy click target.
- Keep the current directional left/right expansion, short-connector handling,
  branch-control clearance, manual label positions, and all saved data
  unchanged.

## Verification

Check a selected regular Node on each horizontal side, then a short connector
near a branch `+` control. Confirm that the label is visibly closer while its
text remains outside the Node and the `+` is still clickable.
