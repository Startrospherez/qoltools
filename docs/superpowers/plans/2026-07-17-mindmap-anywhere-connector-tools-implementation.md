# MindMap Anywhere Connector Tools Implementation Plan

> Implements `../specs/2026-07-17-mindmap-anywhere-connector-tools-design.md`.

The writing-plans skill is unavailable in this workspace; this is the
equivalent repository-local plan.

1. Keep the invisible SVG connector hit line, but replace point/menu selection
   with one direct click-or-drag gesture.
2. Extract safe connector splitting at an exact path point: create a normal
   `n.j`, replace the line by two segments, and preserve its arrow mode.
3. On click, call the same `addLink(junction, 'r')` path as a Node's right
   `+`; on drag, render a temporary guide and create the Node at release.
4. Reserve `Alt + click` for arrow-mode cycling and add it to MindMap help.
5. Remove temporary selected-point/menu UI, rebuild, syntax-check, update
   HANDOFF, and bump to V3.90.
