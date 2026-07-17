# MindMap Route-Label Proximity Implementation Plan

> Implements `../specs/2026-07-17-mindmap-route-label-proximity-design.md`.

The writing-plans skill is unavailable in this workspace; this is the
equivalent repository-local plan.

1. Replace the regular-Node automatic docking constant in
   `connectorRouteLabelPlacement` from 24 to 14 screen pixels.
2. Do not alter the 10-pixel junction value, manual positions, or directional
   label classes.
3. Bump the MindMap version to V3.85, regenerate `tools/mindmap.html`, update
   `HANDOFF.md`, run JavaScript syntax checks and `git diff --check`, then ask
   the user to test both sides and a short connector near a Node control.
