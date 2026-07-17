# MindMap V3.93 Activity-Based Batch Delete History — Design

## Context

MindMap stores complete snapshots for Undo/Redo. V3.92 made structural history
restoration fast, but one multi-selection `Delete` keypress currently calls the
public Node/image deletion functions once per selected object. Each call saves
its own snapshot, and the keyboard handler saves another snapshot afterward.
Consequently, Undo restores a multi-object deletion one object at a time even
though the user performed only one activity.

The history unit must follow the user's activity rather than the number of
objects affected by it.

## Goals

- Treat one `Delete` keypress on a multi-selection as one history activity.
- Restore every selected Node/image and every affected connector with one Undo.
- Remove the same complete selection again with one Redo.
- Keep separate `×` clicks as separate activities.
- Preserve V3.92 structural reconciliation performance and all existing saved
  project compatibility.

## Non-goals

- Do not replace the full-snapshot history model with command/inverse-command
  history.
- Do not add a general-purpose or asynchronous transaction manager.
- Do not merge separate mouse clicks or keypresses based on elapsed time.
- Do not change which connectors are removed or how junction healing behaves.
- Do not change JSON, Project ZIP, standalone HTML, image, or IndexedDB schemas.

## Selected approach

Separate object mutation from history commitment:

- Internal Node and image removal primitives change the Canvas and report
  whether an object was actually removed. They do not save history.
- The existing public single-object deletion entry points call one primitive
  and immediately save one history snapshot when it changed the Canvas.
- A dedicated selection-deletion activity captures all selected Node and image
  IDs, calls the primitives for the complete set, and saves exactly one history
  snapshot after the activity finishes.

This is more explicit than passing a `saveHistory` boolean through every delete
call and safer than introducing hidden global transaction state. It also keeps
the current public behavior intact for junction tools, Node `×`, and image `×`.

## Activity semantics

- Select five objects and press `Delete` once: one history entry is created.
  One Undo restores all five and all connectors removed as a consequence. One
  Redo removes the same result again.
- Click `×` on five objects separately: five history entries are created, so
  five Undo operations are required.
- A single selected object followed by one `Delete` keypress is still one
  activity and one history entry.
- Node and image selections deleted by the same keypress are one mixed
  activity, even though an image-changing Undo/Redo may use the intentional
  V3.92 full-rebuild fallback.
- Connector removal caused by deleting a Node is part of that Node deletion;
  connectors never receive separate history entries.
- If no selected object can be removed, no history entry is created.

## Deletion data flow

1. The keyboard handler ignores `Delete` while an editable input is active,
   preserving current text-editing behavior.
2. Capture the selected Node IDs and selected image placement IDs before any
   DOM is changed. This prevents live selection arrays from shrinking during
   iteration.
3. Remove selected Nodes through the internal Node primitive. Each Node removal
   also removes its attached connector DOM and retains the current junction
   healing behavior.
4. Remove selected images through the internal image primitive.
5. If at least one primitive reported a change, call `doSaveState()` exactly
   once after the complete activity.
6. The resulting full snapshot is restored by the existing V3.92 compatible,
   structural-reconciliation, or safe full-rebuild path as appropriate.

The batch preserves the current Node-then-image deletion order so the final
Canvas result remains compatible with existing behavior.

## Failure handling

All deletion mutations are synchronous. The batch tracks whether any object
has changed. If an unexpected exception occurs after a partial mutation, the
actual resulting Canvas state is committed once before reporting the error, so
the user can Undo the partial activity instead of leaving an untracked change.
Normal execution does not create intermediate history snapshots.

## Compatibility and versioning

- Visible MindMap and new Project ZIP manifest app version become V3.93.
- Project `formatVersion` remains 1.
- Existing V3.92 and older history/project data remain readable because the
  persisted snapshot structure does not change.
- Backup, autosave, Notes, arrows, route labels, Find, annotations, image
  storage, export, PNG, and standalone HTML behavior remain unchanged.
- The real `D:\202607162107.zip` remains read-only and is not used by automated
  tests.

## Verification

Extend the background browser harness and static checks to cover:

1. Select multiple connected regular Nodes and trigger one real `Delete`
   keyboard event.
2. Verify all selected Nodes and their affected connectors are removed.
3. Verify one Undo restores the exact pre-delete Node and connector IDs/counts.
4. Verify one Redo restores the exact post-delete state.
5. Verify an unrelated Node and connector retain DOM identity across the batch
   Undo/Redo fast path.
6. Delete two objects through separate public single-object calls and verify
   Undo restores them one activity at a time.
7. Verify a batch containing a junction preserves the existing final junction
   deletion/healing result and is restored in one Undo.
8. Manually verify a mixed selected Node/image batch because the synthetic
   1,000-Node fixture intentionally contains no image assets.
9. Re-run all V3.92 drag, text, connector branch, structural deletion, arrow,
   and route-label regression checks.
10. Run `node build-tools.js`, inline JavaScript syntax validation, fixture
    integrity checks, and `git diff --check`.

The user performs the final interaction test on the generated local `file://`
page. Success means the number of Undo/Redo operations matches the number of
user activities, not the number of affected objects.
