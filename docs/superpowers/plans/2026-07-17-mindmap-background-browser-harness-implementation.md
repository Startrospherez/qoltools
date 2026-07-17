# MindMap Background Browser Test Harness Implementation Plan

> Implements `docs/superpowers/specs/2026-07-17-mindmap-background-browser-harness-design.md`.

The writing-plans skill is not installed in this session, so this is the
equivalent repository-local implementation plan.

## 1. Build the loopback-only read server

1. Add a Node standard-library server under `tests/`.
2. Bind only to `127.0.0.1`, accept a configurable port, and expose a health
   endpoint.
3. Resolve and realpath-check every requested file against the repository root.
4. Serve supported files with explicit MIME types and no-cache headers.
5. Reject writes, directory listing, missing files, and traversal attempts.

## 2. Build the same-origin browser harness

1. Add a standalone harness page under `tests/` with a compact control/report
   panel and the generated MindMap in an iframe.
2. Fetch and import the synthetic 1,000-Node Project ZIP through the existing
   MindMap import entry point.
3. Add deterministic drag, movement Undo/Redo, text Undo/Redo, and structural
   connector-branch checks.
4. Record rendered timings, assert DOM state/counts, and show a copyable report.
5. Support `?autorun=1` for fully unattended background testing.

## 3. Verify server and harness statically

1. Run Node syntax checks for both files.
2. Start the server in a managed session and verify health, MIME types, missing
   files, unsupported methods, and traversal rejection.
3. Confirm the generated MindMap and synthetic ZIP remain unchanged.

## 4. Run the background browser test

1. Connect the in-app browser to the localhost harness without showing it.
2. Wait for the autorun result and read the bounded report.
3. Inspect browser console errors and run focused UI checks when needed.
4. Finalize the controlled tab and stop the exact server session.

## 5. Document and commit

1. Add the harness workflow and first benchmark result to `HANDOFF.md`.
2. Run `git diff --check` and final syntax checks.
3. Commit the implementation while leaving generated benchmark output out of
   the repository.
