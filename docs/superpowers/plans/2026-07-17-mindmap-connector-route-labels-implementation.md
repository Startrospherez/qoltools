# MindMap Connector Route Labels Implementation Plan

> Implements the approved design in
> `docs/superpowers/specs/2026-07-17-mindmap-connector-route-labels-design.md`.
> Work from `decoded/mindmap.html`, then rebuild `tools/mindmap.html`.

## 1. Persist endpoint route labels safely

1. Normalize each connector's optional `routeLabels` into two endpoint records
   with text and clamped normalized position.
2. Include route labels in state snapshots, history, autosave, JSON/ZIP, and
   standalone HTML, while keeping old maps valid.
3. Ensure new and split connectors start with empty endpoint labels.

## 2. Replace temporary navigation controls with route-label rendering

1. Remove V3.78's `.connector-nav` rendering and outside-viewport filter.
2. Add a route-label overlay that renders the active Node's labels above
   connectors and stays horizontal.
3. Render an `→ +` creation placeholder for empty endpoint labels only while
   the endpoint Node is hovered or singly selected.
4. Use stored normalized positions, with defaults close to the respective
   endpoint.

## 3. Add label interaction

1. Single-click populated text to centre the opposite Node while preserving
   zoom; single-click an empty placeholder to enter editing.
2. Double-click populated text to edit it in place; handle Enter, Shift+Enter,
   Escape, blur, and autosave.
3. Drag labels along their connector with 0–1 clamping; use pointer movement
   thresholds so clicks do not navigate after a drag.
4. Show only transient hover/focus/drag affordances, never a normal label box.

## 4. Integrate, verify, and hand off

1. Hook rerendering into Node hover/selection, transform updates, connector
   updates, Node moves, state loading, and deletion.
2. Preserve arrow modes and midpoint branching; remove labels with deleted or
   split connectors.
3. Update Info text, version, and HANDOFF status.
4. Run syntax checks, `node build-tools.js`, and `git diff --check`; ask the
   user to test label creation, both directions, drag, navigation, and
   persistence.
