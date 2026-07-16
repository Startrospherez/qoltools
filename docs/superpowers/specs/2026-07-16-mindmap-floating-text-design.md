# MindMap Floating Text Design

## Goal

Add a standalone `Floating Text` annotation for naming broad areas of a large
MindMap. Its main use is a heading above timeline columns, used alongside
vertical `Line` dividers, such as `อดีตชาติ`, `พุทธกาล`, or `หลังปรินิพพาน`.
It is not a node and has no graph relationship.

This is intentionally a general-purpose text object. A later `Timeline
Section` feature may group text, divider lines, and an optional background,
but this first version must not impose a timeline-only model.

## User interaction

1. Add a `T` button immediately after `➖` in the Shapes area.
2. Clicking `T` creates one Floating Text object at the centre of the usable
   viewport, with the default title `หัวข้อช่วงเวลา...`, the default
   description `คำอธิบายช่วงเวลา...`, C9 blue colour, and a large heading
   font size. The title is selected so typing replaces it immediately.
3. Text has no visible box, background, or permanent controls.
4. Outside editing mode, drag a text object to move it. If `🧲 Snap` is on,
   its anchor position snaps to the existing 40px grid.
5. Double-click a text object to edit it again. It exposes its title and a
   smaller Description beneath it; both fields are plain multi-line text and
   preserve `Shift+Enter` line breaks.
6. Selecting text shows only a subtle dashed outline and a small `×` delete
   control. It deliberately has no resize handles or directional arrows.
7. The existing `A+` and `A-` controls change the selected Floating Text font
   size. Existing colour palettes recolour it. `Delete` removes it.
8. Selecting a node, image, or Line clears the Floating Text selection;
   selecting text clears other object selections.

## Rendering and layering

- Floating Text and Lines belong to the same logical `annotations` layer:
  neither is a node or a connector.
- Lines remain in the SVG annotation group. Text uses a lightweight HTML
  overlay so Thai editing, selection, caret placement, and multi-line input
  work reliably.
- The text overlay sits visually above Lines and below nodes and image
  controls. Thus headings remain readable over a divider while never covering
  the node interaction layer.
- Selection outlines and delete controls are editing UI only. They are not
  persisted and never appear in PNG or saved standalone HTML.

## Data model and persistence

`annotations` gains a `texts` array alongside `lines`:

```js
{ id, x, y, text, description, color, fontSize }
```

- `x` and `y` are Canvas coordinates for the text's top-left anchor.
- `text` and `description` are plain text containing optional newline
  characters. No HTML markup is stored or interpreted.
- Missing `annotations.texts` remains valid for old maps. Invalid imported
  records (missing string id/text or non-finite coordinates) are ignored.
- Text records participate in history, autosave, local backup, JSON import,
  Project ZIP, standalone HTML, and Undo/Redo.
- Zoom to fit includes the measured bounds of every Floating Text object.
  PNG and standalone HTML render text but omit its edit controls.

## Scope boundaries

- This change does not implement a grouped column/section object, tinted
  regions, automatic line pairing, or a semantic chronology.
- It does not alter node content editing, node Notes, node connectors, or Line
  behavior.
- A later Timeline Section can build on the shared annotation data path while
  retaining free placement for existing Lines and Floating Text objects.

## Verification

1. Create a Text object, replace its default title and Description, insert a
   line break, move it, double-click to edit it again, recolour it, resize its
   font, and delete it.
2. Check Snap while moving and verify that selecting Text, Line, node, and
   image clears the appropriate prior selection.
3. Verify Undo/Redo, local reload, legacy JSON, Project ZIP export/import,
   standalone HTML, and PNG retain Text content and omit selection UI.
4. Verify Fit includes Text placed away from nodes and that Line/connector
   behavior has not regressed.
5. Run source/generated script syntax checks, `node build-tools.js`, and
   `git diff --check`.
