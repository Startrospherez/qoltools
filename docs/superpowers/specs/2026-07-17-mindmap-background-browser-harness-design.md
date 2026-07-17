# MindMap Background Browser Test Harness — Design

## Purpose

Provide a repeatable way for Codex to test MindMap through the in-app browser
without requiring the user to leave MindMap visible, surrender the physical
mouse, or manually import the synthetic fixture for every test run.

The user remains responsible for subjective usability checks during real work.
The harness covers repeatable correctness checks and measurable performance.

## Selected approach

Use a read-only local HTTP server plus a separate same-origin browser harness.
The harness loads the production-generated `tools/mindmap.html` inside an
iframe and imports the existing synthetic 1,000-Node Project ZIP automatically.

This was selected over:

1. A local server alone, which would still require manual fixture import.
2. A test mode inside the production MindMap page, which would mix test-only
   behavior into the stable application.

The production MindMap source and exported project format do not gain any
test-only fields or controls.

## Components

### Read-only local server

`tests/mindmap-test-server.js` uses only Node.js standard-library modules.

- Bind to `127.0.0.1` only; never bind to all network interfaces.
- Default to port 8765 and accept an explicit alternative port when needed.
- Serve files only from the repository workspace root.
- Normalize and validate requested paths before reading them. Reject traversal
  attempts and requests outside the workspace.
- Provide correct content types for HTML, JavaScript, JSON, ZIP, CSS, and common
  image types.
- Send `Cache-Control: no-store` so every run uses the latest generated build.
- Provide a small read-only `/__health` response.
- Do not implement uploads, writes, directory listings, or a remote shutdown
  endpoint.

Codex starts the server in a managed terminal session and stops that exact
session after browser testing. The user can also run it manually when desired.

### Browser harness

`tests/mindmap-browser-harness.html` is a standalone test page, not part of the
MindMap toolbar.

- Load `/tools/mindmap.html` in a same-origin iframe.
- Fetch `/test-fixtures/mindmap-ai-stress-1000.zip` from the local server.
- Construct a browser `File` from the fetched bytes and call the existing
  `window.importMindmapFile()` entry point in the iframe.
- Wait for import completion, then verify the iframe contains exactly 1,000
  regular Nodes and 975 persisted connector lines.
- Provide `Load/Reset fixture`, `Run benchmark`, and `Copy report` controls.
- Display each correctness assertion and timing in a bounded result panel.

The localhost browser origin has storage separate from the user's normal
`file://` MindMap. Test history, backup, and IndexedDB data therefore do not
overwrite the normal working copy's browser storage.

## Automated benchmark

The first benchmark covers the V3.91 bottlenecks and their correctness:

1. Fixture import time and final Node/connector counts.
2. Five short Node drags using the normal mouse event path. Record the median
   visible completion time after animation frames have settled.
3. Verify the moved Node position and every attached connector endpoint change
   consistently.
4. Measure movement Undo and Redo, waiting for the following rendered frame;
   verify the Node returns to the exact before/after positions.
5. Edit one Node title through its contenteditable event path and save history.
6. Measure text Undo and Redo and verify the exact title each time.
7. Perform one structural connector branch check and verify Node/line counts.
   Structural Undo/Redo is reported separately because V3.91 intentionally uses
   the safe full-rebuild fallback for topology changes.

Correctness failures are always marked as failures. Performance results are
reported as milliseconds and compared with the previous run when available;
the first version does not declare a universal hardware-independent pass/fail
threshold. It may label results as responsive, caution, or slow for readability
without hiding the raw values.

## Report format

The visible report contains:

- MindMap version, timestamp, browser user agent, Node count, and connector
  count.
- Import, drag median, movement Undo/Redo, text Undo/Redo, and structural
  operation timings.
- Correctness result and a short error message for every failed assertion.
- Overall `PASS`, `PARTIAL`, or `FAIL` based on correctness, not speed alone.

`Copy report` copies the same information as plain text/JSON for pasting into a
Codex task. Test runs do not append files or modify the repository automatically.

## Browser execution and visibility

Background operation is the default:

1. Start the local server in a managed background terminal session.
2. Open the harness in an in-app-browser tab without making it visible.
3. Run the automated benchmark and read the result panel.
4. Use browser-controlled UI interaction for additional focused checks when
   needed.
5. Finalize the test tab and stop the server session.

The automation does not move the user's physical mouse. The user can work in
other applications while the test runs, but closing Codex or interrupting the
active task will stop the run.

Visible mode is reserved for debugging. Codex tells the user before exposing a
test tab when shared visual inspection would materially help.

## Data and security boundaries

- Automatically load only the explicitly synthetic fixture stored under
  `test-fixtures`.
- Do not copy, serve, or import `D:\202607162107.zip` or other real study data
  without separate user authorization.
- Do not send project data over the network; all requests stay on loopback.
- Do not inspect browser cookies, profiles, or unrelated storage.
- Do not leave the local server running after a Codex-controlled test finishes.

## Failure handling

- If port 8765 is occupied, report it and start the same server on an explicit
  unused loopback port; never terminate an unknown process.
- If the generated MindMap or fixture is missing, stop before running metrics
  and show the missing path.
- If import or an assertion fails, preserve the visible harness result, stop
  later dependent steps, and report the first actionable failure.
- Always attempt to close the controlled test tab and stop the known server
  session during cleanup.
- Browser policy or connection failures are reported directly; the harness
  does not fall back to `file://` or another browser surface.

## Verification and acceptance

Implementation verification includes:

- Node syntax check for the server.
- Path traversal, missing-file, MIME-type, health endpoint, and loopback-binding
  checks.
- Inline JavaScript syntax check for the harness and generated MindMap.
- A complete background browser run using the 1,000-Node fixture.
- Confirmation that the controlled tab and server session are cleaned up.

The feature is accepted when Codex can start one background run, import the
fixture without user interaction, produce a readable correctness/timing report,
and cleanly release browser and server resources without changing the normal
MindMap application or real project files.
