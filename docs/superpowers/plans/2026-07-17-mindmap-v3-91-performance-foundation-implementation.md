# MindMap V3.91 Performance Foundation Implementation Plan

> Implements `docs/superpowers/specs/2026-07-17-mindmap-v3-91-performance-foundation-design.md`.

The writing-plans skill is not installed in this session, so this is the
equivalent repository-local implementation plan.

## 1. Add a bounded Node-drag render path

1. Track the latest pending drag delta, one animation-frame request, and the
   connector elements attached to the dragged selection.
2. Collect attached connectors once when a Node drag begins.
3. Move the selected Nodes and update only those connectors inside the next
   animation frame.
4. Flush any pending drag frame on mouseup before recording history.
5. Clear pending drag state when loading/importing another history state.

## 2. Add safe incremental history loading

1. Extract the current full reconstruction into a named fallback helper.
2. Add strict topology compatibility checks for Node IDs/types and connector
   IDs/endpoints.
3. When compatible, patch changed Node fields and connector metadata in place.
4. Recalculate only connectors attached to changed Nodes or carrying changed
   metadata, then refresh transient labels/tools and existing image/annotation
   renderers.
5. Fall back to the current full reconstruction for every incompatible or
   malformed state.

## 3. Preserve compatibility and document the release

1. Keep full internal history snapshots and all Project ZIP/JSON fields
   unchanged.
2. Bump the visible MindMap version to V3.91.
3. Update `HANDOFF.md` with the measured baseline, optimization boundaries,
   and pending user verification.
4. Rebuild `tools/mindmap.html` from the decoded source.

## 4. Verify

1. Run the inline JavaScript syntax check, `node build-tools.js`, and
   `git diff --check`.
2. Add a static regression harness for the topology-compatibility and affected
   connector selection helpers where practical.
3. Validate the synthetic ZIP counts, connector endpoints, and CRC again.
4. Ask the user to repeat the 1,000-Node drag and Undo/Redo timings, followed by
   Snap, multi-select drag, route labels, direct connector gestures, and the
   regular `D:\202607162107.zip` smoke test.
