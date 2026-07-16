# MindMap Line Annotation Implementation Plan

> Implements the approved design in
> `docs/superpowers/specs/2026-07-16-mindmap-line-annotation-design.md`.
> Work from `decoded/mindmap.html`, then rebuild `tools/mindmap.html`.

## 1. Extend persisted state safely

1. Add an `annotations` object with a `lines` array to Mindmap history states.
2. Keep old maps valid by normalizing missing annotations to `{ lines: [] }`.
3. Include annotations in current-state snapshots, local backup, import/export,
   ZIP `mindmap.json`, standalone HTML, and Undo/Redo without changing graph
   connector records.
4. Sanitize imported line records and ignore invalid entries.

## 2. Add the annotation SVG layer and rendering helpers

1. Insert a dedicated SVG group below connector SVG content and node/image DOM.
2. Render one SVG line per annotation record with a stable DOM id.
3. Render selection UI separately: endpoint handles and a delete control must
   not become saved content or appear in HTML/PNG exports.
4. Ensure theme changes recolour only default/UI styles, retaining explicit
   annotation colours.

## 3. Build Line creation and editing interaction

1. Add the final Shapes button and create a C9-blue 400px vertical line at
   the usable viewport centre.
2. Clicking an annotation selects it; clicking other Canvas content clears the
   selection.
3. Implement body drag, endpoint drag, minimum length, and delete behavior.
4. Apply Shift axis constraints and 40px Snap coordinates to body and endpoint
   drags.
5. Extend the existing colour action so it recolours selected annotations
   without regressing selected node colour behavior.

## 4. Integrate view, exports, and help

1. Include line endpoints in Fit bounds.
2. Ensure `saveFileHTML` clones rendered lines but strips annotation selection
   UI and temporary Find/selection state.
3. Confirm PNG captures rendered annotations but not controls.
4. Add concise Info text describing Line, selection, Shift, and Snap.

## 5. Verify and hand off

1. Test create, move, endpoint resize, angle, Shift lock, Snap, recolour,
   Delete, Undo, and Redo.
2. Test legacy JSON, Project ZIP, HTML, and local backup with and without
   annotations.
3. Test Fit and PNG capture with an off-screen line.
4. Run source/generated script syntax checks, `node build-tools.js`, and
   `git diff --check`.
5. Ask the user to perform final browser interaction tests before marking this
   feature complete.
