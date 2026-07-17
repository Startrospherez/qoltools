# MindMap Connector Control Clearance Implementation Plan

> Implements `docs/superpowers/specs/2026-07-17-mindmap-connector-control-clearance-design.md`.

The writing-plans skill is not installed in this workspace, so this is the
equivalent repository-local implementation plan.

## 1. Version the automatic route-label defaults

1. Extend each normalized route-label endpoint with a placement revision.
2. Keep saved manual labels unchanged (`autoPlacement: false`).
3. When an untouched automatic endpoint is first rendered under the new
   revision, recalculate and save its normalized position once; later redraws
   retain that coordinate.
4. Use 24 screen pixels for a regular Node and 10 screen pixels for a junction
   Node, measured from the existing edge-to-edge connector endpoint.

## 2. Give regular Nodes branch-control clearance

1. Add helpers for the relevant Node branch-control center and connector-label
   placement.
2. If an automatic regular-Node label lands within the branch control's visual
   clearance, apply a small perpendicular screen-space offset.
3. Retain the current short-connector opposite offsets, combining rather than
   replacing them when both protections are needed.
4. Clear all automatic offset behavior immediately when the user drags a
   label.

## 3. Protect Node `+` from a crowded middle control

1. Add a `crowded` class to the existing middle `+` control when its current
   midpoint lies within the hit-area clearance of any branch control on an
   attached regular Node.
2. Keep the button at the connector midpoint with its existing click and drag
   behavior.
3. Reduce only the invisible `::before` interaction halo for `.mb.crowded`, so
   the Node's `+` receives nearby pointer input first while the middle button's
   visible circle remains usable.

## 4. Integrate and verify

1. Bump MindMap to V3.82 and record V3.81 as verified in `HANDOFF.md`.
2. Rebuild `tools/mindmap.html`, run inline JavaScript syntax checks, focused
   geometry/state checks, and `git diff --check`.
3. Ask the user to test regular and junction labels, short Node-to-junction
   segments, split/drag behavior, reload, and export-import persistence.
