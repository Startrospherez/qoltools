# MindMap Anywhere Connector Tools Implementation Plan

> Implements `../specs/2026-07-17-mindmap-anywhere-connector-tools-design.md`.

The writing-plans skill is unavailable in this workspace; this is the
equivalent repository-local plan.

1. Replace each persistent `.mb` middle control with an invisible SVG hit line
   that resolves a pointer to a normalized position on its connector.
2. Track one ephemeral selected connector point. Render only its dark dot
   initially; clicking it opens the perpendicular mini toolbar with branch,
   arrow-cycle, and delete actions.
3. Let the dark point distinguish a click from a drag. On drag, initialize
   the existing exact-point branch code at its original pointer-down and
   replay the first moved position so a quick drag retains its actual drop.
4. Scope junction-toolbar cleanup to junction toolbars only, and add pointer
   cursors to the connector hit target and point.
5. Generalize the current midpoint branch-drag helper to receive the selected
   point; temporarily turn hit lines off during connector drops.
6. Clear selection correctly on Canvas/item selection, history loading, and
   deletion. Exclude all temporary UI from standalone HTML/PNG.
7. Bump to V3.89, rebuild, syntax-check, run focused point-projection tests,
   and update HANDOFF.
