# MindMap V3.95 Direct Alt-drag Copy Implementation Plan

> Implements `../specs/2026-07-18-mindmap-v3-95-direct-alt-drag-copy-design.md`.

The `writing-plans` skill is not installed in this session, so this document is
the equivalent repository-local implementation plan.

## 1. Extend deferred Node/image copy selection

1. In `decoded/mindmap.html`, adjust the Node/image Alt-drag entry points and
   `startSelectedObjectCopyDrag()` so they build a copy selection from the
   pointer target plus the active Node/image selection.
2. If the target is already selected, retain the active selection unchanged.
3. If the target is unselected and no Node/image selection exists, use a
   one-object selection containing only the target.
4. If the target is unselected and a Node/image selection exists, add the
   target to the copied selection without clearing the existing selection.
5. Defer every selection mutation and data clone until the drag threshold is
   crossed. An Alt-click or a below-threshold movement leaves the original
   selection unchanged.

## 2. Permit direct Line and Text copying

1. In the Line and Floating Text Alt-drag handlers, begin the existing
   annotation-copy controller even when the clicked annotation is not already
   selected.
2. Keep Lines and Floating Text independent, single-select annotation types;
   this change must not introduce cross-type annotation groups.
3. Keep the successful copy selected and preserve its existing geometry,
   content, colour, font-size, Snap, and Shift-axis behavior.

## 3. Preserve copy and cancellation behavior

1. Continue using the existing targeted clone routines: new Node/placement
   IDs, reused image assets, and copied internal connectors only.
2. Ensure expanded Node/image selections copy arrows and route labels on
   internal connectors and retain the original group’s relative positions.
3. Confirm the copied group appears at the pointer release position and is
   the active selection after the gesture.
4. Preserve one history activity per completed copy. Escape, browser blur,
   and a gesture below the drag threshold must leave data, history, and
   original selection unchanged.

## 4. Add focused browser regression coverage

1. Extend `tests/mindmap-browser-harness.html` with direct Alt-drag tests for
   an unselected Node, image, Timeline Line, and Floating Text.
2. Add a test for an existing selected Node/image group plus one unselected
   Node or image. Verify every selected object plus the new target is copied,
   only internal connectors are recreated, and images reuse asset IDs.
3. Verify Alt-click without a drag creates no object, changes no selection,
   and adds no Undo/Redo history activity.
4. Verify a single Undo/Redo removes/restores each complete direct-copy
   activity.

## 5. Generate, validate, and hand off

1. Keep the visible version at V3.95: this is a refinement within its already
   released capability, not a separate user-visible version line.
2. Update the `i` dialog wording only if it needs clarification that direct
   Alt-drag works without selecting one object first.
3. Regenerate `tools/mindmap.html` via `node build-tools.js`.
4. Run inline JavaScript syntax checks for source, generated MindMap, and
   harness; run browser regressions and `git diff --check`.
5. Ask the user to test the local `file://` MindMap. After verification,
   update `HANDOFF.md` with both V3.95 direct-copy behavior and the result.

## 6. Final user test checklist

1. With no active selection, Alt-drag one Node, one image, one Line, and one
   Floating Text. Each should copy immediately after dragging, without a
   preparatory click.
2. Select several Nodes/images, then Alt-drag one unselected Node or image.
   Confirm the copied set contains the old group and the new object, including
   only internal connectors.
3. Alt-click an unselected object without moving. Confirm no selection,
   copy, movement, or history change occurs.
4. For every copy case, confirm the original remains, the copy is selected at
   the release position, and one Undo/Redo reverses/restores the full action.
