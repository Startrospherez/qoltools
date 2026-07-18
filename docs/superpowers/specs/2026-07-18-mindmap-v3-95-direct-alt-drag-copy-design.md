# MindMap V3.95: Direct Alt-drag Copy Design

## Purpose

Make copying one object as quick as holding `Alt` and dragging it, while
preserving the existing way to copy a selected Node/image group.

## Scope

This change applies to MindMap Nodes, images, Timeline Lines, and Floating
Text. It changes only the selection decision made at the start of an
Alt-drag; the existing copy, placement, and Undo/Redo mechanisms remain in
place.

## Node and image selection rules

The active Node/image selection is evaluated when the Alt-drag begins.

1. If the dragged object is already selected, copy the active selection as it
   is today.
2. If the dragged object is not selected and there is no active Node/image
   selection, copy that object alone. This permits direct Alt-drag copying
   without a preparatory click.
3. If the dragged object is not selected and there is an active Node/image
   selection, temporarily add it to the selection and copy the expanded
   selection. This covers the deliberate case of extending a selected group
   by Alt-dragging one more object.

For Node/image groups, connectors whose two endpoints are in the final group
are copied with their arrow modes and route labels. Connectors leading outside
the group are not copied. Images keep their existing image asset instead of
duplicating its binary data.

## Line and Floating Text rules

Line and Floating Text retain their independent, single-object selections.
Alt-drag copies the clicked Line or Text whether or not it was previously
selected.

## Safety and interaction details

- A copy starts only after the existing small drag threshold is crossed.
- An Alt-click without movement changes no selection and creates no copy.
- Once the drag begins, the copy is the active selection and is positioned at
  the mouse release point, as in V3.95.
- Each copy operation is a single Undo/Redo activity.
- `Escape` or browser blur cancels an in-progress copy and restores the
  original selection.

## Verification

Test direct Alt-drag of one unselected Node, image, Line, and Floating Text;
then test an existing selected Node/image group plus one unselected object.
Confirm internal connectors only are copied, a single Undo removes all copied
objects, and an Alt-click without dragging has no effect.
