# MindMap Junction Mini Tools and Directional Labels Implementation Plan

> Implements `docs/superpowers/specs/2026-07-17-mindmap-junction-mini-tools-design.md`.

The writing-plans skill is not installed in this workspace, so this is the
equivalent repository-local implementation plan.

## 1. Direct route-label text away from its owner

1. Derive a dock direction from the endpoint toward the opposite Node.
2. Apply right/left label layout classes so text grows outward, not into the
   Node or junction; choose a stable horizontal side for vertical links.
3. Keep manual label drag, click navigation, and double-click editing intact.

## 2. Add junction selection and mini tools

1. Track the selected junction separately from ordinary Node selection.
2. Suppress the junction's overlaid delete control in its resting state.
3. Render a compact `＋` / `×` toolbar beside the selected dot in a
   perpendicular free position.
4. Reuse the existing branch-drag and delete/reconnect paths.

## 3. Integrate and verify

1. Bump to V3.84 and record the new behavior in `HANDOFF.md`.
2. Rebuild, run JavaScript syntax and focused logic checks, then diff hygiene.
3. Ask the user to test text direction, junction selection, branch drag,
   deletion/reconnect, labels, and per-line controls.
