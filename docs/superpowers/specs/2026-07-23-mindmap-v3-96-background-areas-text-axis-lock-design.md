# MindMap V3.96: Background Areas and Floating Text Axis Lock

## Purpose

Add faint, borderless coloured areas behind the MindMap so long timelines can
be divided into clear periods without interfering with normal Node work. Also
let Floating Text move in an exact horizontal or vertical line while `Shift`
is held.

## Background-area model

Background Areas are persisted Canvas annotations with rectangular geometry:
an ID, Canvas-space position, width, height, fill colour, and low fill opacity.
They are stored as `annotations.areas` beside the existing Line and Floating
Text annotation data. Older `mindmap-project` `formatVersion: 1` files may omit
`areas` and must continue to load as an empty list.

Areas are rendered in a dedicated background layer below connectors, Lines,
Floating Text, images, and Nodes. The normal visible state has no border,
handles, or pointer events. Mouse actions therefore pass through an Area to
the ordinary empty Canvas and preserve all existing Node creation, marquee,
pan, connector, and selection behavior.

## Area-edit mode

Add one `🟨 Area` toolbar control that toggles a dedicated Area-edit mode.
Its active state is visually marked.

While Area-edit mode is active:

- Dragging empty Canvas space creates a new Area from the drag bounds.
- Clicking an existing Area selects it.
- Dragging the selected Area moves it.
- Eight temporary handles resize its four edges and four corners.
- The existing colour palette changes the selected Area's fill colour while
  retaining a faint default opacity.
- `Delete` or the temporary `×` control removes the selected Area.
- Grid Snap applies to creation, movement, and resized edges when enabled.
- Pressing `Escape` or pressing `🟨 Area` again leaves Area-edit mode and
  returns every Area to click-through rendering.

Area-edit controls are transient UI and are not included in saved or exported
data. Nodes and their controls remain visually above the Area layer, but Area
mode owns empty-Canvas gestures until the mode is exited.

## Appearance and layering

The default Area uses a light palette colour at low opacity so Nodes and
connectors remain readable. Palette changes affect fill hue, not opacity.
Normal Areas remain borderless; only the selected Area in Area-edit mode gets
a temporary dashed outline and resize controls.

Overlapping Areas are allowed and retain creation order. A later Area is
painted above an earlier Area, while every Area stays below all existing map
objects.

## Persistence and compatibility

Areas participate in Undo/Redo, local backup, IndexedDB graph autosave, JSON,
Project ZIP, standalone HTML, PNG export, and Zoom to fit. They do not
participate in Find and do not affect image storage.

Import normalization treats missing or malformed Area data safely. Existing
Line/Text data, image assets, connector route labels, arrow modes, and project
`formatVersion: 1` remain compatible.

Copying Areas with `Alt`+drag is outside this first Area release. The existing
Alt-drag behavior for Nodes, images, Lines, and Floating Text is unchanged.

## Floating Text `Shift` axis lock

During an ordinary Floating Text drag, holding `Shift` locks the movement to
the dominant direction measured from the pointer-down point:

- horizontal when the horizontal delta is greater;
- vertical when the vertical delta is greater.

The non-dominant delta becomes zero. Releasing `Shift` during the gesture
returns to free movement. Grid Snap remains compatible and is applied after
the axis lock. The same rule applies while placing an Alt-dragged Floating Text
copy. Editing or selecting text without dragging is unchanged.

## History and cancellation

Creating, moving, resizing, recolouring, or deleting one Area creates one
Undo/Redo activity. A creation drag below the existing movement threshold
creates nothing. `Escape` during an active Area gesture cancels the transient
change and restores the prior data and selection.

Floating Text movement and copying keep their existing one-activity history
behavior.

## Verification

1. Confirm Areas are fully click-through outside Area-edit mode: empty-space
   double-click, marquee, pan, and Node interactions behave as before.
2. In Area mode, create, select, move, resize, recolour, Snap, delete, and
   Escape-cancel Areas; confirm transient borders and handles disappear after
   leaving the mode.
3. Confirm overlapping Areas remain below every connector, Line, Text, image,
   and Node.
4. Verify one-step Undo/Redo and round trips through JSON, Project ZIP,
   standalone HTML, PNG, backup, and Zoom to fit.
5. Drag Floating Text freely, with `Shift`, with Grid Snap, and with
   `Alt`+`Shift`; verify exact horizontal/vertical placement and one-step
   Undo/Redo.
