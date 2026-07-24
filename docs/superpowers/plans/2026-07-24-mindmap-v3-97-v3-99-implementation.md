# MindMap V3.97–V3.99 Implementation Plan

> Implements
> `../specs/2026-07-24-mindmap-v3-97-v3-99-design.md`.
>
> The `writing-plans` skill is not installed in this session, so this document
> is the equivalent repository-local implementation plan.

## 1. Close V3.96

1. Regenerate the tools, validate inline scripts, run `git diff --check`, and
   run the complete 1,000-Node browser harness.
2. Record the user's successful file interaction test in `HANDOFF.md`.
3. Commit and push the verified V3.96 baseline before V3.97 code changes.

## 2. Implement V3.97

1. Add focused harness regressions for mixed selection, line/marquee
   intersection, Shift toggles, shared drag/Snap, Align/Dist, batch Delete,
   primary controls, Area duplication, and one-step history.
2. Add a transient Selection Registry and per-kind adapters for lookup, bounds,
   translation, deletion, highlighting, and primary controls.
3. Route existing Node/image and annotation/Area selection paths through the
   registry without persisting selection.
4. Extend marquee, movement, keyboard Delete, Align, Dist, and Alt-drag Area
   duplication to the approved mixed-kind behavior.
5. Set visible and Project ZIP app version to 3.97, update Help, regenerate,
   syntax-check, diff-check, and run the full harness.

## 3. Implement V3.98

1. Add harness regressions for Area schema normalization, label rendering,
   Note editing/search, Global Find scopes and highlighting, corner navigation,
   overlap context toasts, history, and export/import.
2. Normalize optional Area metadata and render the bottom-left Note control,
   Name, and Description without making the Area body interactive.
3. Generalize the shared Note dialog and its internal Find to Node or Area
   targets.
4. Add Area results to Global Find and implement bottom-left result navigation.
5. Calculate overlapping named Areas for every programmatic Node navigation
   and show the separate timed context toast.
6. Set app version to 3.98, update Help, regenerate, syntax-check, diff-check,
   and run the full harness.

## 4. Implement V3.99

1. Add harness regressions for connector style gesture/persistence, toolbar
   layout, stable palette migration, A+/A− hold/history, toolbar hiding, and
   dark viewport coverage.
2. Normalize and render connector style; distinguish Alt+left connector arrow
   cycling, Alt+middle style cycling, and plain middle pan.
3. Preserve style through every connector creation, split, clone, history,
   import, and export path.
4. Reorder annotation controls and make applied palette references stable
   across future `🎨` changes while preserving Theme and Shader behavior.
5. Add press-and-hold font sizing as one history activity, extend it to Area
   labels, and keep Lines/images unchanged.
6. Extend toolbar hiding to the injected Hub/Tools controls; correct the outer
   dark Canvas background; rewrite the Info sections and hotkeys.
7. Set app version to 3.99, regenerate, syntax-check, diff-check, and run the
   complete browser harness.

## 5. Finish

1. Run the final source/generated/harness inline-script syntax checks,
   `git diff --check`, and the full 1,000-Node browser harness.
2. Update `HANDOFF.md` with implementation and automated results.
3. Commit and push the completed work. Ask the user to perform the final local
   `file://` interaction checklist before recording final user verification.

