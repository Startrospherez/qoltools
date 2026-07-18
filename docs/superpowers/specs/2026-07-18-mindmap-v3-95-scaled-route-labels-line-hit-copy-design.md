# MindMap V3.95: Scaled route labels, Line hit areas, and Alt-drag copy

**Status:** Approved design — implementation not started
**Date:** 2026-07-18

## Purpose

V3.95 resolves two interaction problems discovered while using a large map and
adds a quick way to reuse existing work:

1. Connector route labels must share the same visual scale as Nodes when the
   map is zoomed.
2. Timeline Lines must be easy to select without making the visible line
   visually heavier.
3. `Alt` + drag must duplicate an intentionally selected object or selected
   Node/image group in one direct gesture.

## Scope and boundaries

- Work only in the MindMap source: `decoded/mindmap.html`, then regenerate
  `tools/mindmap.html` through `node build-tools.js`.
- Preserve `mindmap-project` `formatVersion: 1`, existing JSON/ZIP/HTML
  compatibility, image storage, connector navigation, history, and exports.
- Bump the displayed MindMap version to **V3.95** because this is a visible
  behavior and capability change.
- Add the new shortcut to the editable Info/Hotkeys source
  `content/mindmap-info.html`.
- Do not add cross-type multi-selection. Node and image selection remains the
  existing mixed multi-selection model; a Line or Floating Text remains a
  single selected annotation.
- Do not duplicate image bytes. A copied image placement reuses its existing
  image asset and thumbnail reference.

## 1. Connector route labels scale with the map

### Behavior

- At 100% zoom, a route label retains its current appearance: text size,
  arrow, padding, and spacing from the Node.
- At every other zoom value, the label scales exactly with the Canvas and its
  Node. Zooming out makes it smaller; zooming in makes it larger.
- This includes automatically docked labels and labels manually dragged along
  a connector. Their normalized connector position, navigation click, drag,
  and double-click editing behavior remain unchanged.

### Design

Route labels are children of the transformed Canvas, but their current
`fontSize = 16 / zoom` and automatic dock gap measured as `gap / zoom`
deliberately cancel that transform. Remove this inverse compensation:

- Render the label with its normal 100% Canvas font size.
- Calculate the automatic docking gap in Canvas units, not screen-pixel units.
- Keep the existing normalized label position and endpoint-side direction
  calculation.

At 10%, labels will be as small relative to the screen as 10% Nodes. This is
intentional: the map remains readable as an overview rather than retaining
large overlapping navigation words.

## 2. Easy-to-hit Timeline Lines

### Behavior

- The visible Line remains its current thin, clean stroke.
- Around it, the app provides an invisible selection corridor approximately
  20 screen pixels wide. The corridor remains that usable screen width across
  all zoom levels.
- Hovering the corridor uses a hand cursor. Clicking or dragging it selects
  and moves the Line exactly as today; selected endpoint and delete controls
  retain their existing behavior.
- Nodes and their controls continue to win pointer input above a Line, so a
  Line cannot steal a click from a Node that visually overlaps it.

### Design

For each persisted annotation Line, render:

1. its existing visible SVG line; and
2. a second, transparent SVG hit line above it, using SVG pointer events on
   the stroke and a non-scaling stroke width of roughly 20px.

Both elements call the existing annotation drag/select entry point. The hit
line is transient UI only and is never serialized or exported as data. The
annotation SVG layer remains below Nodes, while endpoint/delete controls are
rendered above the hit line for the selected Line.

## 3. Alt-drag copy

### Eligibility and gesture

- Copying begins only when `Alt` is held and the pointer starts on an object
  that is already selected.
- If the pointed object is not selected, no copy is made and the original does
  not move through this Alt-drag gesture. The user selects it first.
- A minimum movement threshold prevents a click from producing an overlapping
  duplicate.
- While dragging, the duplicate follows the pointer. On release it is placed
  at the pointer position. For a group, the grabbed object is the anchor and
  all internal distances are retained.
- Once placed, the new duplicate or group becomes the active selection; the
  original selection is cleared.

### Node and image groups

- The existing mixed Node/image selection is copied as one group.
- Node copies retain title, description, note, visual style, shape, size, and
  position relative to the group.
- Image copies retain their placement geometry and reference the same image
  asset, rather than creating another original-image or thumbnail record.
- If both endpoints of a connector are selected Nodes, the copied Nodes gain a
  new equivalent connector. Arrow mode, route-label text, and route-label
  placement are preserved.
- A connector that leads to an unselected Node is not copied. Original Nodes
  and connectors are never changed.
- Existing Snap behavior applies to the dragged group anchor, preserving each
  copied member's relative spacing.

### Line and Floating Text

- Because annotation selection remains single-object, a selected Line copies
  only that Line and a selected Floating Text copies only that Text.
- Each copy retains its line endpoints or text/description, color, font size,
  and other stored presentation properties, then moves by the drag delta.

### History and persistence

- A completed copy-and-place operation is one history activity. One Undo
  removes every newly copied object and internal connector; one Redo restores
  them.
- Cancelling or failing to exceed the movement threshold records no history
  activity and leaves no transient object behind.
- Copied identifiers are new and unique. The existing graph, annotations, and
  image-placement serializers persist them without a format-version change.

## UI documentation

The Info dialog's Hotkeys section gains a concise Thai entry explaining:

- `Alt` + drag — copy the currently selected Node/image group, Line, or
  Floating Text; select the object first.

## Verification

Automated checks before handoff:

1. Run `node build-tools.js`.
2. Run the inline JavaScript syntax check.
3. Run `git diff --check`.
4. Extend the browser harness, where applicable, to cover one history activity
   for a copied Node/image selection and its Undo/Redo result.

User interaction checks on the local `file://` page:

1. At 10%, 100%, and 200%, confirm route labels are the same scale relative to
   their Nodes; verify navigation, editing, and dragging labels still work.
2. Select and drag vertical, horizontal, and diagonal Timeline Lines near the
   visible stroke at low and high zoom; verify a Node overlapping the Line is
   still selected instead of the Line.
3. Alt-drag one selected Node, a selected Node/image group, a selected Line,
   and a selected Floating Text. Verify position, Snap behavior, and the new
   active selection.
4. For a selected connected Node group, verify only internal connectors copy,
   including their arrow modes and route labels; verify external connectors do
   not copy.
5. Undo and Redo each copy with one action. Confirm image copies share the
   existing image asset and that save/export/import preserves all copies.

## Out of scope

- Multi-selecting Lines or Floating Text together with Nodes/images.
- Copying external connector relationships to unselected Nodes.
- Duplicating image binary data.
- Changing the project file format or adding another export mode.
