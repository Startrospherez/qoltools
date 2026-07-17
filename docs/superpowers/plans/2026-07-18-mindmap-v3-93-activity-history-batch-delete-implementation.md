# MindMap V3.93 Activity-Based Batch Delete History Implementation Plan

> Implements `docs/superpowers/specs/2026-07-18-mindmap-v3-93-activity-history-batch-delete-design.md`.

The `writing-plans` skill is not installed in this session, so this document is
the equivalent repository-local implementation plan.

## 1. Add failing browser regressions first

1. Extend `tests/mindmap-browser-harness.html` with an activity-history section.
2. Select multiple connected regular Nodes and dispatch one real `Delete`
   keyboard event through the MindMap window.
3. Record exact pre-delete and post-delete Node/connector IDs and counts.
4. Assert that one Undo restores the complete pre-delete graph and one Redo
   restores the complete post-delete graph.
5. Hold an unrelated Node and connector reference and assert strict DOM
   identity survives the batch Undo/Redo path.
6. Add a selected regular-Node plus junction batch using the existing branch
   fixture, and assert one Undo restores the entire branch.
7. Add two separate public single-object deletions and assert they still require
   two separate Undo operations.
8. Run the harness against V3.92 and confirm the new multi-delete assertion
   fails for the expected one-object-at-a-time reason before changing source.

## 2. Separate deletion mutation from history commitment

1. In `decoded/mindmap.html`, extract the current Node deletion body into an
   internal synchronous primitive that returns `true` only when it removed a
   Node.
2. Keep attached connector cleanup, route-label/hit/midpoint cleanup, Notes
   dialog closure, and current junction healing inside that primitive.
3. Change public `window.del(id)` into a single-activity wrapper: invoke the
   primitive and call `doSaveState()` once only when it reports a change.
4. Extract image placement removal into an equivalent internal primitive that
   removes managed image DOM/placement state and reports whether it changed.
5. Change public `window.delImage(id)` into the corresponding single-activity
   wrapper.
6. Preserve all existing public call signatures used by Node `×`, junction
   mini tools, image `×`, and test code.

## 3. Implement one explicit selection-delete activity

1. Add a focused helper for the keyboard activity rather than global history
   suppression or time-based coalescing.
2. Capture selected Node IDs and image placement IDs before mutation begins.
3. Run Node primitives first and image primitives second, preserving current
   deletion order and final Canvas semantics.
4. Track whether at least one object was removed and commit exactly one full
   snapshot afterward.
5. If a synchronous removal unexpectedly throws after a partial mutation,
   commit the actual partial Canvas once, report the error, and keep the state
   Undoable.
6. Replace the current `Delete` key loop and its redundant final save with one
   call to this activity helper.
7. Keep editable-input, annotation Line, and Floating Text Delete branches
   unchanged because each already represents a single activity.

## 4. Version and compatibility

1. Change the visible title and About version from V3.92 to V3.93.
2. Change new Project ZIP manifest `appVersion` to `3.93`.
3. Keep `mindmap-project` `formatVersion: 1` and every persisted snapshot field
   unchanged.
4. Regenerate `tools/mindmap.html` only through `node build-tools.js`.

## 5. Verify behavior and regressions

1. Run inline JavaScript syntax checks for source, generated MindMap, and the
   browser harness.
2. Verify the synthetic fixture remains exactly 1,000 regular Nodes, zero
   junctions, and 975 persisted connectors.
3. Run the complete localhost background browser harness and require all V3.92
   plus new activity-history correctness checks to pass.
4. Confirm one-keypress batch Undo/Redo is one step, while separate public
   deletions remain separate steps.
5. Confirm the branch/junction batch preserves exact IDs, arrows, route labels,
   and unrelated DOM identity after Undo/Redo.
6. Record raw timings without treating them as cross-hardware pass/fail limits.
7. Check browser console output, close the test tab, stop the loopback server,
   run `git diff --check`, and confirm only intended files changed.

## 6. Document, commit, and request final interaction testing

1. Update `HANDOFF.md` with V3.93 semantics, automated results, and the pending
   mixed Node/image manual test.
2. Commit the source, generated output, harness, implementation plan, and
   handoff together; do not stage local AI files or generated test artifacts.
3. Ask the user to test on the generated local `file://` page:
   - select several connected Nodes and press `Delete` once;
   - confirm one Undo restores all of them and one Redo removes all of them;
   - click `×` on two Objects separately and confirm they Undo separately; and
   - when convenient, select a Node and image together and verify one-step
     Undo/Redo.
4. Never modify the user's `D:\202607162107.zip`; automated tests continue to
   use only the copied synthetic fixture.
