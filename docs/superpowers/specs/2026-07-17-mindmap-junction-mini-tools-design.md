# MindMap Junction Mini Tools and Directional Labels Design

## Goal

Keep docked route-label text out of Nodes, make labels at a junction clickable,
and replace the crowded set of overlapping junction controls with a compact,
selection-first mini toolbar.

## Directional route-label layout

- A label docked on the right of its owning endpoint renders as `→ text` and
  expands rightward, away from the Node or junction.
- A label docked on the left renders as `text ←` and expands leftward, again
  away from its owner.
- Vertical connectors retain horizontal label text and use the clearer of the
  two horizontal expansion directions; when a label is manually dragged, its
  existing manual placement remains authoritative.
- The full label hit target moves with that outward layout, so typing a longer
  relationship does not cover the owning Node or the junction dot.

## Junction selection and mini tools

- A junction is normally only its small dark dot. Its red `×` delete control
  is no longer permanently overlaid on the dot.
- Clicking the visible dot selects it. The selected dot receives a clear focus
  treatment and opens a compact mini toolbar in a free perpendicular position.
- The toolbar contains:
  - `＋` — start a new branch by dragging from this junction;
  - `×` — delete this junction, retaining the current reconnect behavior when
    it has exactly two neighbours.
- The toolbar closes when a different Canvas item is selected or the user
  clicks empty Canvas.

## Separation of responsibilities

- Route labels remain the per-connector navigation/edit controls: click to
  jump, double-click to edit text, drag to make the label manual.
- The existing middle `＋` and its `—/→/←/↔` button remain per-line controls;
  they appear on that line rather than in the junction toolbar. Their crowded
  hit-area protection remains active.
- The mini toolbar is deliberately limited to junction-level actions. It never
  implies an arrow setting for an ambiguous one of several connected lines.

## Compatibility and verification

- Route-label text, manual positions, history, local backup, JSON, Project
  ZIP, standalone HTML, and PNG continue unchanged.
- Verify right/left and vertical labels with short and long text, junction-dot
  selection, toolbar branch drag, junction deletion/reconnect, line controls,
  route navigation, and crowded multi-connector junctions.
