# MindMap V3.92 Structural History Reconciliation Implementation Plan

> Implements `docs/superpowers/specs/2026-07-18-mindmap-v3-92-structural-history-reconciliation-design.md`.

The writing-plans skill is not installed in this session, so this document is
the equivalent repository-local implementation plan.

## 1. Extract reusable DOM helpers

1. Add one snapshot-to-Node helper shared by incremental reconciliation, full
   rebuild, and new Node creation.
2. Add connector creation and removal helpers that consistently manage the
   persisted SVG line, midpoint control, hit target, arrows, and route labels.
3. Preserve current event handlers, placeholder text, style fields, Node types,
   connector IDs, arrow modes, and route-label metadata.

## 2. Validate and classify structural history transitions

1. Validate target Node/connector arrays, unique IDs, normalized Node types,
   and connector endpoints before changing DOM.
2. Compare the current and target snapshots by ID.
3. Treat Node type changes and connector endpoint changes as replacements.
4. Permit structural reconciliation only when images and normalized annotations
   are unchanged; otherwise select the existing full rebuild fallback.
5. Reject an invalid target without advancing the history cursor.

## 3. Reconcile graph topology incrementally

1. Reset transient state through the existing state-load cleanup.
2. Remove obsolete/replacement connectors and their auxiliary DOM.
3. Remove obsolete/replacement Nodes.
4. Patch retained Nodes with the V3.91 field patcher.
5. Create only new/replacement Nodes and connectors from the target snapshot.
6. Redraw only new, metadata-changing, and geometrically affected connectors.
7. Finalize `nid`, `curStep`, route labels, junction tools, and annotations once.
8. Recover with the full rebuild if a validated reconciliation throws.

## 4. Version and automated coverage

1. Change visible and manifest versions from V3.91 to V3.92 without changing
   project `formatVersion: 1`.
2. Extend the browser harness to assert stable unrelated Node/connector DOM
   identity across structural Undo/Redo.
3. Assert exact IDs, connector arrow/route-label metadata, and deletion history.
4. Keep background-throttling detection and raw timing reporting intact.

## 5. Verify and hand off

1. Run `node build-tools.js`, server/harness and generated inline JavaScript
   syntax checks, `git diff --check`, and fixture-integrity checks.
2. Run the complete localhost background browser benchmark.
3. Confirm the test tab and loopback server are cleaned up.
4. Record results and the required final local `file://` interaction checks in
   `HANDOFF.md`.
5. Commit only the intended MindMap source, generated output, tests, plan, and
   handoff files.
