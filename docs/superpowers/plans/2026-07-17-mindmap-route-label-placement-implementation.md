# MindMap Route Label Default Placement Implementation Plan

> Implements `docs/superpowers/specs/2026-07-17-mindmap-route-label-placement-design.md`.

The writing-plans skill is not installed in this workspace, so this is the
equivalent repository-local implementation plan.

## 1. Extend the route-label state safely

1. Add `autoPlacement` to each route-label endpoint record.
2. Preserve existing numeric positions and default their `autoPlacement` to
   false, so saved maps do not change.
3. Make `createLine` create fresh endpoint records with `autoPlacement: true`.
4. When a legacy connector has no route-label record at all, give it those
   adaptive defaults the first time its labels are rendered or saved.

## 2. Resolve an adaptive default from connector geometry

1. Add one helper that reads the edge-to-edge line coordinates and calculates
   approximately 30 screen pixels from each relevant Node end in Canvas units.
2. Convert the result to a normalized position, clamping it to a safe range.
3. For a connector too short to keep both defaults apart, return opposite
   perpendicular screen-space offsets for the two labels while retaining their
   near-end positions.
4. Use the helper only while `autoPlacement` is true. Render manually placed
   labels from their persisted normalized position with no automatic offset.

## 3. Keep manual interaction authoritative

1. Render the label at the adaptive point and offset when it is automatic.
2. On drag, project the pointer onto the connector as before, write that
   normalized position, set `autoPlacement: false`, and immediately remove the
   automatic perpendicular offset.
3. Keep the current single-click navigation and double-click text editing
   behavior unchanged.

## 4. Integrate and verify

1. Bump the visible MindMap version to V3.81 and update `HANDOFF.md` to mark
   V3.80 user-verified and V3.81 pending manual verification.
2. Run the inline JavaScript syntax check, `node build-tools.js`, and
   `git diff --check`.
3. Manually verify static data round-tripping through history state and export
   code paths; then ask the user to test long, short, horizontal, vertical,
   diagonal, and manually dragged labels at more than one zoom level.
