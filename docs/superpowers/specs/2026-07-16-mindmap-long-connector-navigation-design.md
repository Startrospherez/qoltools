# MindMap Long Connector Navigation Design

## Goal

Allow users to follow a long node-to-node connector when its opposite Node is
outside the current viewport. The interaction must be discoverable without
leaving permanent controls across a large MindMap.

## User interaction

1. When the user hovers or selects a visible Node, inspect every connector
   attached to that Node.
2. If its opposite endpoint Node is completely outside the usable viewport,
   show a small circular direction button on the exposed connector segment,
   just beyond the visible Node edge.
3. The icon points toward the off-screen Node using the connector's actual
   direction: for example `→`, `↗`, or `↓`.
4. Clicking the button keeps the current zoom percentage and pans the Canvas
   so the off-screen Node is centred in the usable viewport.
5. The buttons immediately recalculate after panning, zooming, moving Nodes,
   changing selection, or mouse hover. If both Nodes are visible or both are
   off-screen, no button is shown.

## Presentation and overlap handling

- The navigation controls are temporary editor UI, never graph content. They
  are not exported, saved, included in history, or included in Fit bounds.
- The controls visually differ from the existing midpoint `+` branch control
  and the arrow-mode button, but use the existing theme variables.
- If qualifying connectors leave the same Node in nearly the same direction,
  their controls are staggered perpendicular to the connector. Each still
  keeps its directional icon and target identity.
- The control is placed near the Node rather than at the connector midpoint,
  so a long line is usable before the user scrolls to find its middle.

## Architecture

The feature is a derived viewport overlay:

1. A pure visibility helper converts Node Canvas bounds through the current
   `cx`, `cy`, and `zoom` transform and tests against the usable viewport.
2. A navigation renderer scans only the connectors attached to the currently
   hovered or selected visible Node and creates/removes overlay buttons.
3. The jump handler uses the existing canvas transform pattern: preserve
   `zoom`, set `cx`/`cy` from the target Node centre and usable viewport
   centre, update the transform, and clear the Fit restore cycle.

This requires no additions to connector data or project files. It works the
same for plain, directed, reverse, and two-headed connectors.

## Error handling and compatibility

- Missing endpoint Nodes and non-finite geometry are ignored; no navigation
  control is rendered.
- A Node partly crossing the viewport boundary counts as visible, preventing
  redundant jump buttons.
- Controls are removed before every render, so loading old maps or deleting a
  Node cannot leave stale controls behind.
- Existing pointer, branch, arrow-mode, selection, image, annotation, export,
  and persistence behaviours remain unchanged.

## Verification

1. At a fixed zoom, pan until exactly one endpoint of a long connector is
   fully off-screen; hover and select the visible endpoint and verify the
   directional control appears.
2. Click it and verify the target is centred without changing zoom.
3. Test horizontal, vertical, diagonal, and multiple similarly directed
   connectors; verify direction and button staggering.
4. Verify no control when both endpoints are visible, both are off-screen, or
   a target is partly visible.
5. Move/resize Nodes, Zoom, pan, Undo/Redo, branch, use arrow modes, and
   export PNG/HTML/ZIP to confirm no regression or persisted UI.
6. Run syntax checks, `node build-tools.js`, and `git diff --check`.
