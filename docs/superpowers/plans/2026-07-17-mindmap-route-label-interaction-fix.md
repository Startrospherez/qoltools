# MindMap Route Label Interaction Fix Plan

> Implements the refined route-label design in
> `docs/superpowers/specs/2026-07-17-mindmap-connector-route-labels-design.md`.

## 1. Preserve the editor lifecycle

1. Stop general mouse-up and redraw paths from replacing the active editable
   label DOM.
2. Keep focus until Enter, blur, or Escape explicitly completes the edit.
3. Make empty `→ +` labels use the same click, double-click, and drag rules as
   populated labels.

## 2. Stabilize click, edit, and drag behaviour

1. Delay the single-click navigation just enough to distinguish it from a
   double-click edit.
2. Ensure drag uses connector projection and persists the normalized position
   for both empty and populated labels.
3. Prevent Canvas selection, Node dragging, and route-label redraw timers from
   stealing route-label pointer input.

## 3. Make the arrow directional

1. Derive an eight-way arrow glyph from the owning endpoint toward the
   opposite Node.
2. Keep the relationship text horizontal after the directional glyph.
3. Update help, version, and handoff notes.

## 4. Verify

1. Test empty and populated labels for click navigation, double-click editing,
   Escape, Enter, and drag across horizontal, vertical, and diagonal lines.
2. Test both endpoints of one connector and several crowded routes.
3. Verify persistence, Undo/Redo, export, syntax checks, build, and diff
   hygiene before manual user verification.
