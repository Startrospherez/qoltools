# MindMap V3.94 Multi-Image Selection — Design

## Context

MindMap V3.93 makes one multi-selection `Delete` keypress one Undo/Redo
activity. Nodes already support Shift+click, marquee selection, and group drag,
but image elements can only be selected and dragged one at a time. The user
therefore could not test a mixed Node/image deletion activity.

Images are viewport-rendered for performance. Their DOM elements may be removed
when they leave the render area, so image selection cannot rely only on the
transient `.sel` CSS class.

## Goals

- Select multiple images with Shift+click or a marquee on empty Canvas space.
- Let a marquee select Nodes and images together; Shift+marquee adds to the
  current selection.
- Drag one selected Node or image to move every selected Node and image by one
  shared delta.
- Preserve selected-image state while image DOM is culled and recreated.
- Allow V3.93 one-activity Delete/Undo/Redo to include selected Nodes and
  images together.
- Keep image resize single-image only and preserve all existing image
  insertion, virtualization, Snap, Notes, export, and history formats.

## Non-goals

- Do not add group resize, group rotation, image alignment, or image
  distribution controls.
- Do not persist selection state in JSON, Project ZIP, HTML, local backup, or
  history snapshots.
- Do not alter stored images, thumbnails, IndexedDB asset records, or
  `mindmap-project` `formatVersion: 1`.

## Selected approach

Use one in-memory `selectedImageIds` set as the authoritative image selection
state. The existing `.sel` class remains a rendering detail and is synchronized
whenever an image element is created or the selection changes.

Nodes retain their existing DOM-class selection model. Mixed selection is
permitted for every group action. Dragging any selected Node or image moves all
selected Nodes and images together, making selection consistently mean one
movable group as well as one deletion group.

## Selection interactions

### Image click

- A normal click on an unselected Node or image clears Node and image selection,
  selects that Object, and begins its drag interaction.
- A normal click on a selected Node or image keeps the existing complete
  selection and begins group drag.
- Shift+click toggles only the clicked Object and does not start a drag. Node
  and image selections may coexist.
- Image delete, resize, and detail controls keep their current separate event
  handling and do not accidentally trigger a group drag.

### Marquee

The existing Canvas selection rectangle tests both Node bounds and image
placement bounds for overlap:

- without Shift, it replaces both Node and image selections;
- with Shift, it adds all overlapping Nodes and images to the pre-marquee
  selection;
- image IDs rather than only current image DOM are retained, so a selected
  image remains selected if viewport rendering recreates it later.

Annotation selection behavior remains exclusive and clears image selection as
it does today.

## Unified group drag and Snap

At Node or image pointer-down, capture every selected Node's original position,
every selected image placement's original position, and remember the clicked
Object as the drag anchor.

During drag, calculate one Canvas-space delta from the anchor pointer. When
Snap is off, apply that same delta to all captured Nodes and images. When Snap
is on, snap the anchor's target position to the 40px grid (Node center for a
Node anchor; top-left for an image anchor), derive the resulting single delta,
and apply it unchanged to every Object in the group. This preserves exact
relative spacing rather than independently rounding Objects and distorting the
group.

The move commits one history snapshot only on pointer-up if position actually
changed. Connectors attached to moved Nodes redraw through the existing
incremental drag path; images do not have connectors.

## Resize and deletion

- The resize handle continues to resize only its owning image. Shift and Ctrl
  retain their existing aspect-ratio and center-preservation meanings.
- Removing an image also removes its ID from `selectedImageIds`.
- V3.93 batch deletion reads the selected image-ID set together with selected
  Nodes, so one `Delete` keypress creates one history entry for a mixed set.
- State loading, importing, and selection clearing empty `selectedImageIds` so
  transient selection never leaks across history/import boundaries.

## Compatibility and versioning

- Visible MindMap and new Project ZIP manifest app version become V3.94.
- Project `formatVersion` remains 1 because selection is transient.
- Existing images, legacy image data, image virtualization, history snapshots,
  backup, JSON/ZIP/HTML import/export, PNG, Find, Notes, and annotations remain
  compatible.
- The user's `D:\202607162107.zip` remains read-only and is not used by
  automated tests.

## Verification

Extend the browser harness with a small synthetic image set in addition to the
existing 1,000-Node fixture, without adding generated assets to Git:

1. Shift+click selects and toggles two images while preserving selected Nodes.
2. A normal image click replaces prior selection when the image was not already
   selected.
3. Marquee selection includes overlapping Nodes and images; Shift+marquee adds
   rather than replaces.
4. Dragging one selected Node or image moves every selected Node and image by
   the same delta; connectors attached to moved Nodes redraw correctly.
5. With Snap enabled, the anchor lands on the grid and all Node-to-Node,
   image-to-image, and Node-to-image spacing remains unchanged.
6. One group move creates one Undo/Redo step.
7. One mixed selected Node/image Delete creates one Undo/Redo step.
8. Removing an image clears its selected ID; loading/importing state clears all
   transient image selection.
9. Re-run V3.93 history, drag, branch, route-label, structural identity, and
   image regression checks.
10. Run `node build-tools.js`, generated inline JavaScript syntax validation,
    fixture-integrity checks, `git diff --check`, and final local `file://`
    interaction testing.

Correctness is the release gate. The user performs the final test with real
images, including a Node/image mixed Delete activity.
