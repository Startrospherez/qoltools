# MindMap Anywhere Connector Tools Design

## Goal

Replace the permanent middle `+` control with an on-demand connector point the
user can place anywhere by clicking a line.

## Interaction

- Every connector receives an invisible, wider hit target. Clicking any point
  on that target selects the connector at the nearest point on its path.
- A small dark point appears only at the selected location, matching an
  intersection dot. It is not saved, exported, or otherwise persistent.
- A compact mini toolbar opens perpendicular to the selected connector:
  - `+` keeps the existing split-and-branch behaviour, using the selected
    point instead of the former midpoint;
  - `— / → / ← / ↔` cycles the connector's arrow mode;
  - `×` removes only that connector and keeps both endpoint Nodes.
- Clicking empty Canvas or another item closes the selected connector point.

## Ambiguous locations

- An actual junction dot keeps priority over a line hit.
- For overlapping non-junction connectors, the first closest connector hit
  receives the selection; the interaction remains reversible and the user can
  click again if needed.

## Compatibility

- Connector endpoints, arrow data, route labels, history, backups, imports,
  exports, and HTML saves retain their current formats.
- The old middle control and its hit halo are removed. During an active
  branch drag, invisible connector hit targets temporarily disable so a drop
  onto another connector still resolves to the visual line.

## Verification

Test selection near both ends and at the middle of horizontal, vertical, and
diagonal links; branch click/drag; arrow cycling; connector deletion; Node and
junction priority; overlapping lines; deselection; save/reopen; undo/redo.
