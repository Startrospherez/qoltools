# MindMap Long Connector Navigation Implementation Plan

> Implements the approved design in
> `docs/superpowers/specs/2026-07-16-mindmap-long-connector-navigation-design.md`.
> Work from `decoded/mindmap.html`, then rebuild `tools/mindmap.html`.

## 1. Build viewport and connector helpers

1. Add safe Node Canvas-bounds and usable-viewport visibility helpers.
2. Find connectors attached to the active visible Node and resolve the
   opposite endpoint Node.
3. Calculate a near-edge button position and a directional arrow glyph from
   the connector vector.

## 2. Render temporary navigation controls

1. Add a dedicated DOM overlay class styled separately from midpoint branch
   and arrow-mode controls.
2. Render only for a hovered or selected visible Node whose opposite endpoint
   is completely outside the viewport.
3. Group near-parallel controls by source Node and apply perpendicular offsets
   to prevent overlap.
4. Remove the overlay before each redraw and from selection/deletion flows.

## 3. Implement jump behavior and update hooks

1. On control activation, preserve `zoom`, centre the target Node in the
   usable viewport, update the transform, and clear Fit restore state.
2. Re-render controls after node hover/selection, drag, pan, wheel zoom,
   transform updates, connector updates, and state load.
3. Keep all navigation controls outside history, project state, exports, and
   Fit bounds.

## 4. Verify and hand off

1. Verify horizontal, vertical, diagonal, and grouped long connectors at a
   fixed zoom, including partly visible targets and both-endpoints-offscreen.
2. Verify zoom preservation and target centring after click.
3. Re-test existing midpoint branching, arrow mode, node drag, undo/redo,
   saved HTML, ZIP, and PNG.
4. Run syntax checks, `node build-tools.js`, and `git diff --check`, then ask
   the user to test in the local browser.
