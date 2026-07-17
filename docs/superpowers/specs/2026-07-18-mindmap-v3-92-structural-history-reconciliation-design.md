# MindMap V3.92 Structural History Reconciliation — Design

## Context

MindMap V3.91 made Node dragging and topology-compatible Undo/Redo incremental.
The user has verified V3.91 with the current real working map and found no
interaction problems. Structural history changes still use
`rebuildStateFully()`: Undoing one connector branch recreates every Node and
connector in the graph. The foreground synthetic benchmark measured roughly
1.4–1.5 seconds for structural Undo/Redo with 1,000 regular Nodes and 975
connectors.

## Goals

- Reconcile structural Undo/Redo for regular Nodes, junction Nodes, and
  connectors by stable ID.
- Preserve unrelated Node and connector DOM objects instead of rebuilding the
  whole graph.
- Preserve full history snapshots, project files, and `mindmap-project`
  `formatVersion: 1` compatibility.
- Retain the existing full rebuild as a correctness fallback.
- Keep all existing connector arrows, route labels, Notes, backup, Find,
  import/export, PNG, and standalone HTML behavior compatible.

## Non-goals

- Do not introduce command-based or inverse-operation history.
- Do not change JSON, ZIP, HTML, image, or IndexedDB schemas.
- Do not incrementally reconcile structural changes that also alter images or
  annotations. Those transitions use the existing full rebuild fallback.
- Do not remove the full-snapshot history model or its recovery path.

## Selected approach

Keep each history entry as a complete internal snapshot. When `loadState()`
finds different graph topology, compare the current and target snapshots by
Node and connector ID, validate the target, and update only the differences.

This extends V3.91's compatible-state patching without requiring every graph
operation to record a new inverse command. Existing history entries and old
maps therefore remain usable.

## Eligibility and validation

Structural reconciliation is eligible only when images and normalized
annotations are equal in the current and target history entries. Otherwise,
`loadState()` uses `rebuildStateFully()`.

Before changing the DOM, the reconciler validates the complete target graph:

- `nodes` and `lines` are arrays.
- Every Node has a non-empty, unique string ID.
- Every connector has a non-empty, unique string ID.
- Each connector's `n1` and `n2` refers to a target Node.
- Each Node type normalizes to regular (`n`) or junction (`j`).

Failed target validation does not modify the graph or advance the history
cursor; it reports the rejected history transition. A valid target that is
unsupported by the incremental scope routes to the full rebuild path. If an
unexpected exception occurs after reconciliation begins, the catch path
immediately rebuilds the already-validated target snapshot. The browser runs
this synchronous state transition as one task, so intermediate DOM is not
presented as a finished user-visible state.

## Reconciliation data flow

1. Build maps for current DOM Nodes/connectors and target Node/connector
   states.
2. Compute added, removed, retained, and replacement IDs. A retained Node whose
   regular/junction type changes is treated as a replacement. A connector whose
   ID remains but whose `n1` or `n2` endpoint changes is also a replacement.
3. Reset transient selection, Find highlights, connector navigation, active
   edits, route-label controls, and junction mini tools using the existing
   state-load cleanup.
4. Remove connectors absent from the target or requiring replacement. Remove
   their midpoint, hit-target, and transient label UI as well.
5. Remove Nodes absent from the target or requiring replacement.
6. Patch retained Nodes with the existing V3.91 field patcher. Track Nodes
   whose geometry changes.
7. Create only added/replacement regular and junction Nodes from target state,
   attach the normal event handlers, and insert them into the canvas.
8. Patch retained connector arrow/route-label metadata. Create only
   added/replacement connectors, preserving the exact connector ID from the
   target snapshot.
9. Redraw new connectors and connectors attached to added, replaced, or
   geometry-changing Nodes. Leave unrelated connectors untouched.
10. Apply `nid`, advance `curStep`, and render route labels and junction tools
    once after the graph is consistent.

Node and connector creation from snapshot state will use shared helpers so the
incremental and full-rebuild paths do not maintain two different HTML/event
templates.

## Example

Undoing a direct connector branch currently rebuilds about 1,975 graph
objects. With reconciliation it will:

- remove one new regular Node;
- remove one new junction;
- remove the three branch connectors;
- restore the original connector with its original ID and metadata; and
- retain every unrelated Node and connector DOM object.

Redo performs the inverse difference from the next full snapshot. The result
is still derived from the snapshot rather than a manually maintained inverse
command.

## Fallback and data safety

- Invalid targets leave the current graph and history cursor unchanged.
- `rebuildStateFully()` remains authoritative for valid but unsupported or
  mixed graph/image/annotation transitions, and as recovery after an
  unexpected reconciliation exception.
- Old maps that omit optional arrow or route-label fields continue through the
  existing normalization functions.
- Reconciliation never saves a new history entry while applying Undo/Redo.
- Backup, autosave, project storage, import/export, and real user files are not
  changed by this work.
- The real `D:\202607162107.zip` remains read-only and is not used by automated
  tests without separate authorization.

## Versioning

The visible MindMap and new Project ZIP manifest version become V3.92 because
structural Undo/Redo responsiveness is user-visible. Project
`formatVersion` remains 1 because no persisted field changes.

## Verification

Extend the background browser harness and existing checks to cover:

1. Import exactly 1,000 regular Nodes and 975 persisted connectors.
2. Branch from a connector, then verify one regular Node, one junction, and a
   net two connectors were added.
3. Structural Undo and Redo restore exact Node/connector counts and IDs.
4. Hold references to an unrelated Node and connector and verify strict DOM
   identity is retained across structural Undo/Redo. This proves the fast path
   did not silently perform a full rebuild.
5. Preserve connector arrows and both route labels across branch Undo/Redo.
6. Delete and restore a regular Node and a junction through history.
7. Confirm unsupported mixed non-graph transitions continue to the full rebuild
   fallback without corrupting the target state.
8. Re-run movement and text Undo/Redo regression checks.
9. Run `node build-tools.js`, inline JavaScript syntax validation, and
   `git diff --check`.

Correctness is the release gate. On the current foreground 1,000-Node fixture,
the directional performance target is structural Undo/Redo below 250 ms,
compared with the V3.91 baseline of roughly 1.4–1.5 seconds. Raw timing is
reported and is not treated as a universal cross-hardware correctness limit.
The user performs the final interaction test on the generated local
`file://` page.
