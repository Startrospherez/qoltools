# MindMap Directed Connector Design

## Goal

Improve node-to-node connectors so that they begin and end at the visible
edges of their Nodes, rather than behind their centres. Add an optional arrow
mode to individual connectors for showing relationship direction, chronology,
or a two-way relationship.

Existing connectors remain plain lines by default.

## User interaction

1. A connector's existing midpoint `+` control continues to create or split
   branches exactly as it does now.
2. When the cursor is over a connector control, a compact adjacent arrow
   control is also available. It does not remain visible across the map.
3. Each press cycles the connector through four states:
   `none` → `forward` → `reverse` → `both` → `none`.
4. `forward` means `n1 → n2`, based on the connector's recorded endpoints;
   `reverse` means `n2 → n1`; `both` shows arrowheads at both visible ends.
5. The control's icon reflects the currently selected state so its direction
   is readable before the user cycles it again.

## Connector geometry

For every update, calculate the centre-to-centre vector of the two Nodes,
then intersect that vector with each Node's bounding rectangle. The rendered
line starts at the first intersection and ends at the second.

This produces four effects:

- No connector segment is hidden inside a large Node.
- Arrowheads meet the destination Node edge rather than its centre.
- The midpoint `+` is centred on the visible connector segment.
- Existing branch/split operations place their junction at that true visible
  midpoint.

The bounding rectangle is intentionally used for all current Node shapes.
It is a stable, predictable anchor regardless of a Node's content-driven size;
shape-perfect clipping for circles or diamonds is explicitly out of scope.

## Rendering and layering

- Arrowheads use SVG marker definitions and inherit the normal connector
  colour and theme.
- `forward` applies an end marker, `reverse` a start marker, and `both` both
  markers.
- The markers are part of the connector SVG itself, so PNG and standalone
  HTML exports show the same arrows. The hover-only control is editor UI and
  is omitted from exports.
- Connectors stay below Nodes and above the Canvas background as today.

## Data model and persistence

Connector records gain an optional `arrow` field:

```js
{ id, n1, n2, arrow: 'none' | 'forward' | 'reverse' | 'both' }
```

When the field is absent, imports and old autosaves treat it as `none`.
The value participates in history, Undo/Redo, autosave, legacy JSON import,
Project ZIP export/import, standalone HTML, and PNG rendering.

When an existing connector is split into segments, each newly created segment
starts with `arrow: 'none'`. This prevents a formerly meaningful arrow from
being incorrectly copied into a newly inferred relationship.

## Error handling and compatibility

- A connector whose endpoint Node is missing is removed with its controls,
  preserving current cleanup behaviour.
- Coincident Node centres use a safe non-zero fallback direction so geometry
  never yields invalid SVG attributes.
- Unknown or invalid imported arrow values fall back to `none`.
- Existing maps and all existing connectors load unchanged visually.

## Verification

1. Connect Nodes of very different sizes horizontally, vertically, and
   diagonally; verify both ends meet visible Node edges and `+` is centred on
   the exposed segment.
2. Cycle all four arrow states and verify head orientation and Node-edge
   placement.
3. Verify ordinary midpoint branching still works and newly split segments
   have no arrowheads.
4. Verify move/resize Node updates anchors and markers continuously.
5. Verify Undo/Redo, reload/autosave, JSON, Project ZIP, standalone HTML, and
   PNG preserve arrow states and geometry.
6. Run syntax checks, `node build-tools.js`, and `git diff --check`.
