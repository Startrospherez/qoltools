# MindMap Route Label Default Placement Design

## Goal

Make newly created connector route labels appear consistently close to their
owning Node, regardless of connector length, while keeping labels usable on
very short connectors.

## Default placement

1. Replace the fixed 18%/82% defaults with a screen-space distance of roughly
   30px from the visible edge of the owning Node, calculated when a new route
   label is first laid out.
2. Convert that distance to Canvas units using the current zoom, then store the
   result as the connector's normalized position. This makes the initial
   default look consistent on every long connector without changing it again
   when the user later zooms, moves, or resizes a Node.
3. Route-label records gain an `autoPlacement` flag. It is true only for a
   newly created, untouched label; dragging that label stores its new normalized
   position and turns the flag off. Previously saved records have the flag off,
   retaining their exact placement.

## Short-connector protection

- When the two near-edge default positions would leave too little room between
  them, keep each label close to its owning endpoint and render the pair with a
  small, opposite perpendicular screen-space offset. This automatic offset is
  removed as soon as that label is dragged.
- This gives each short-connector label its own click target without adding a
  permanent container or moving it into a Node.
- The offset is only a default layout aid. Users can still drag either label
  anywhere along its connector; a manually positioned label is never changed
  automatically.

## Compatibility and verification

- Existing labels retain their saved normalized positions exactly.
- Only newly created empty labels use the new adaptive defaults. Legacy
  connectors without any saved label record receive the new default the first
  time one is created.
- Verify long horizontal/vertical/diagonal connectors, short connectors at
  multiple zoom levels, two labels on one line, drag persistence, reload,
  Undo/Redo, JSON/ZIP, HTML, and PNG.
