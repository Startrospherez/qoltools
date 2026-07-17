# MindMap V3.91 Performance Foundation — Design

## Context

The synthetic stress fixture contains 1,000 regular Nodes and 975 connectors.
On the user's machine, a short Node drag takes about eight seconds before the
movement becomes visible. Undo/Redo for text and Node movement takes about
three seconds. Direct connector branching and Find remain immediate.

The current drag path calls `updateAll()` on every mousemove, which recalculates
every connector and its hit target. The current Undo/Redo path removes and
recreates every Node and connector even when only one position or text field
changed.

## Goals

- Make an ordinary Node drag visually follow the pointer on the 1,000-Node
  fixture instead of waiting seconds for a full-graph redraw.
- Make Undo/Redo for Node movement and Node text update only the affected DOM
  records when graph topology is unchanged.
- Preserve current behavior, history semantics, Project ZIP/JSON structure,
  image storage, route labels, Snap, and existing imported projects.
- Retain a safe full-state fallback for structural changes.

## Non-goals

- This phase does not virtualize offscreen Nodes or connectors.
- It does not change the exported data schema or migrate saved files.
- It does not replace snapshot history with a new public file format.
- It does not attempt the separate thousands-of-images stress test.

## Approaches considered

### 1. Full renderer/data-model rewrite

Move the graph to a canonical model, virtualize offscreen elements, and render
only a visible working set. This has the highest long-term ceiling, but it also
touches nearly every interaction and is too risky for the current stable
baseline.

### 2. Incremental redraw and compatible-state patching — selected

Determine the connectors attached to the dragged selection once at drag start,
then update only those connectors inside one `requestAnimationFrame` callback.
For Undo/Redo, compare the current DOM topology with the target snapshot. If
Node IDs and connector IDs/endpoints match, patch only changed Node fields,
connector metadata, images, and annotations. If topology differs, use the
existing full rebuild.

This removes the measured bottlenecks while preserving snapshot history and
the saved project schema. It also provides an explicit fallback if a state is
not safe to patch incrementally.

### 3. Throttle the existing full redraw only

Calling `updateAll()` once per animation frame would reduce duplicate work,
but each frame would still recalculate all 975 connectors and Undo/Redo would
remain slow. It is insufficient for the reported results.

## Detailed design

### Drag rendering

- At Node drag start, collect the selected Node IDs and the visible connector
  elements whose `n1` or `n2` endpoint belongs to that set.
- Mousemove records the latest delta and schedules at most one animation-frame
  update. The frame applies positions, then recalculates only the collected
  connector lines and their matching invisible hit lines.
- Route labels and selected-junction tools refresh once per rendered frame only
  when they are relevant to the active selection.
- Mouseup flushes a pending frame before saving the history state. The final
  saved positions therefore match the last pointer position.
- All non-drag callers may continue using `updateAll()`.

### Incremental Undo/Redo

- `loadState()` first checks whether the current and target states have the
  same Node IDs, Node types, connector IDs, and connector endpoints.
- When compatible, it patches changed Node position, style, shape, title,
  description, Note, and font fields in place. It patches connector arrow and
  route-label metadata in place.
- Lines attached to Nodes whose position or dimensions may have changed are
  recalculated. Lines with changed connector metadata are recalculated too.
- Images and annotations continue through their existing normalized state and
  renderer paths; their bytes remain outside graph history.
- Transient editors and controls are closed or redrawn consistently with the
  current full-load behavior.
- When compatibility checks fail, `loadState()` performs the existing complete
  reconstruction. Adding, deleting, splitting, or reconnecting graph elements
  therefore remains correct before being optimized separately.

### Persistence and compatibility

- History entries remain full internal snapshots in V3.91. This keeps existing
  export, local backup, IndexedDB autosave, and standalone HTML paths unchanged.
- No new required property is added to Nodes, connectors, or the project
  manifest.
- Projects created by V3.76 through V3.90 remain importable without migration.

## Error handling and fallback

Incremental loading is an optimization, not a correctness requirement. Missing
DOM elements, duplicate/mismatched IDs, changed Node types, changed endpoints,
or an unexpected state shape must select the existing full rebuild path. The
fallback must not modify the snapshot being loaded.

## Verification

Automated/static checks:

- Rebuild `tools/mindmap.html` from `decoded/mindmap.html`.
- Run the inline JavaScript syntax check and `git diff --check`.
- Verify the 1,000-Node fixture still has 1,000 Nodes, 975 valid connectors,
  no images, no duplicate IDs, and valid ZIP CRC.
- Verify the compatibility check chooses incremental loading for movement/text
  snapshots and full loading for topology changes.

Manual checks on the user's machine:

- Import `test-fixtures/mindmap-ai-stress-1000.zip` and repeat the measured
  short drag, text Undo/Redo, and movement Undo/Redo tests.
- Confirm Snap, multi-selection drag, route-label placement, junction tools,
  direct connector click/drag, and Alt+click arrows still work.
- Import `D:\202607162107.zip` and confirm the regular study map behaves as
  before.

The acceptance target is immediate visible response rather than a fixed frame
rate: ordinary dragging should follow the pointer, and movement/text Undo/Redo
should no longer pause for several seconds on the 1,000-Node fixture.
