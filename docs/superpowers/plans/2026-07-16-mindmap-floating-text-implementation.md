# MindMap Floating Text Implementation Plan

> Implements the approved design in
> `docs/superpowers/specs/2026-07-16-mindmap-floating-text-design.md`.
> Modify `decoded/mindmap.html`, then regenerate `tools/mindmap.html` with
> `node build-tools.js`.

## 1. Extend annotation state without breaking Line maps

1. Change annotation normalization to always produce `{ lines, texts }`.
2. Validate text records: string `id`, finite `x`/`y`, string `text`, valid
   string colour, and a finite positive `fontSize`; default missing legacy
   properties safely.
3. Include `texts` automatically in current state, history, backup, imported
   JSON, Project ZIP, and autosave through the existing annotation state path.
4. Add selected Floating Text state separately from selected Line state, and
   make shared selection clearing deterministic.

## 2. Render an HTML text annotation overlay

1. Insert a dedicated Canvas overlay for Floating Text that is visually above
   the SVG annotation lines and below nodes/images.
2. Render each record as an absolutely positioned, plain-text `div` with
   `white-space: pre-wrap`; never inject stored text as HTML.
3. Render the dashed selection outline and delete `×` as transient controls
   only while a text object is selected and not editing.
4. Add DOM hydration for saved standalone HTML, analogous to Line hydration,
   so a reopened exported HTML page retains editable data state.

## 3. Add creation, movement, and editing behavior

1. Add `T` after `➖` in Shapes. Create C9-blue heading text at the usable
   viewport centre and enter edit mode with the default value selected.
2. Implement input/blur persistence for plain multi-line text and double-click
   re-entry into edit mode. Preserve `Shift+Enter` line breaks.
3. Implement non-editing drag movement with the existing 40px Snap behavior.
4. Make Text selection clear selected nodes, images, and Lines; make other
   object selections clear selected Text.
5. Extend `A+`/`A-`, palette colours, and `Delete` to the selected Text while
   retaining all current node and Line behaviors.

## 4. Integrate exports, view, and help

1. Include measured Floating Text bounds in Fit calculations.
2. Ensure PNG and standalone HTML render text but strip transient selection
   controls and editing-only state.
3. Add concise Info-dialog help for `T`, double-click editing, drag, Snap,
   Shift+Enter, and style controls.
4. Bump the displayed MindMap version to V3.76.

## 5. Verify and hand off

1. Test create, immediate typing, multi-line text, re-edit, movement, Snap,
   colour, font size, delete, Undo, and Redo.
2. Test coexistence with nodes, images, and Lines; especially selection and
   existing connector interactions.
3. Test local backup, legacy JSON, Project ZIP, standalone HTML, PNG, and Fit.
4. Run inline script syntax checks on source and generated HTML, run
   `node build-tools.js`, and run `git diff --check`.
5. Ask the user for final interaction testing, then update `HANDOFF.md` with
   the verified V3.76 result.
