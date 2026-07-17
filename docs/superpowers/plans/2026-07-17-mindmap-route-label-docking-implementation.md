# MindMap Route Label Docking Implementation Plan

> Implements `docs/superpowers/specs/2026-07-17-mindmap-route-label-docking-design.md`.

The writing-plans skill is not installed in this workspace, so this is the
equivalent repository-local implementation plan.

## 1. Separate automatic docking from manual positions

1. Add a new docking revision to route-label state, retaining the existing
   normalized `position` only as the source of truth for manual labels.
2. Preserve all labels with `autoPlacement: false` exactly as stored.
3. Migrate existing untouched automatic labels to the new revision when first
   rendered.

## 2. Resolve the docked point from live geometry

1. Derive the outward connector direction at each endpoint.
2. For a regular Node, use the matching cardinal Node `+` control as the dock
   reference and place the label immediately outside its visible edge with a
   small non-overlapping clearance.
3. For a junction Node, use the connector edge at the junction dot as the dock
   reference with only a small visible clearance.
4. Recalculate the automatic point on every route-label render; do not turn it
   into a persistent percentage merely because a Node has moved.
5. Retain the short-connector perpendicular separation where needed, while
   keeping each label adjacent to its own endpoint.

## 3. Preserve manual interaction and exports

1. On meaningful drag, project the pointer onto the connector as today, save
   that normalized position, and turn automatic placement off permanently for
   that label.
2. Keep current click navigation, double-click editing, history, backup,
   JSON/ZIP, standalone HTML, and PNG behavior unchanged.

## 4. Integrate and verify

1. Bump the page and Project package to V3.83; record V3.82 as verified and
   V3.83 as pending in `HANDOFF.md`.
2. Run inline-script syntax checks, build generation, focused docking geometry
   tests, and `git diff --check`.
3. Ask the user to create a link, stretch it far, split it at a junction, and
   verify that untouched labels remain docked while a dragged label stays put.
