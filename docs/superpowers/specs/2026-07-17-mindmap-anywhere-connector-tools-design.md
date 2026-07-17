# MindMap Anywhere Connector Tools Design

## Goal

Replace the permanent middle `+` control with an on-demand connector point the
user can place anywhere by clicking a line.

## Interaction

- Every connector receives an invisible, wider hit target. Clicking any point
  on that target uses one direct gesture; its pointer cursor indicates this.
- Click and release: split the connector with a normal junction dot, then
  call the same default `right` action used by a Node's `+` control. This
  creates a regular Node and connector without showing an intermediate menu.
- Press and drag: show a temporary line from the exact split point; on
  release, split the original connector and create the regular Node at the
  released Canvas location.
- The split point is always a normal `n.j` junction Node, so its size and
  appearance exactly match every pre-existing intersection dot.

## Arrow gesture

- `Alt + click` on a connector cycles only that connector through
  `— → ← ↔`; it never adds a Node. This keeps the ordinary click/drag gesture
  free for adding content and avoids permanent controls on the Canvas.
- When adding a junction splits a connector that already has an arrow mode,
  its two replacement segments inherit that mode. The new branch starts with
  no arrow. Direction therefore remains continuous across the new junction.

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

Test horizontal, vertical, and diagonal connectors near both endpoints and the
middle; click-to-add; drag-to-add; the visual size of new and existing
junctions; `Alt + click` arrow cycling; arrow preservation on split;
save/reopen; undo/redo.
