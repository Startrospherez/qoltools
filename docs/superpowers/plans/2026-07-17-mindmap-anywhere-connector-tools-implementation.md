# MindMap Anywhere Connector Tools Implementation Plan

> Implements `../specs/2026-07-17-mindmap-anywhere-connector-tools-design.md`.

The writing-plans skill is unavailable in this workspace; this is the
equivalent repository-local plan.

1. Replace each persistent `.mb` middle control with an invisible SVG hit line
   that resolves a pointer to a normalized position on its connector.
2. Track one ephemeral selected connector point and render its dark dot plus a
   perpendicular mini toolbar with branch, arrow-cycle, and delete actions.
3. Generalize the current midpoint branch-drag helper to receive the selected
   point; temporarily turn hit lines off during connector drops.
4. Clear selection correctly on Canvas/item selection, history loading, and
   deletion. Exclude all temporary UI from standalone HTML/PNG.
5. Bump to V3.87, rebuild, syntax-check, run focused point-projection tests,
   and update HANDOFF.
