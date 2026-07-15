# Mindmap Node Notes and Version 3.72 Design

## Goal

Add a large, scrollable plain-text note for each regular Mindmap node. The note
is intended for detailed supporting material, such as sutta sources and
character histories, without crowding the canvas. Release the change as
MindMap V3.72.

## Scope

- Add a compact note button at the lower-left corner of every regular node. It
  is visible when the node is hovered or selected and does not appear on a
  connector/junction node.
- Clicking the button opens a centered, tall modal dialog.
- The dialog header shows the node's current title and description as read-only
  context. A plain-text multiline editor fills the remaining space. The editor
  scrolls vertically as needed.
- The note is saved to the node as a `note` string. It participates in
  autosave, history, undo/redo, JSON import/export, and saved standalone HTML.
- Existing maps without `note` load successfully with an empty editor.
- Update the page title and About dialog from V3.71 to V3.72.

## Design Choices

### Modal instead of side panel or canvas expansion

A centered modal provides the largest writing area while keeping the canvas
uncluttered. A side panel would be too narrow for long source notes, and
expanding nodes would make the map hard to read.

### Plain-text editor

Use a `textarea`, preserving line breaks and treating pasted URLs as text. It
does not interpret HTML or add formatting controls. This keeps notes portable,
safe to render, and easy to store in JSON.

### Save behavior

Input changes update the open node's `note` value and create a normal Mindmap
history state. Closing with the close control or Escape keeps the current
saved note. Opening a different node always loads that node's own note.

## Components and Data Flow

1. The node-markup builder includes the note button and connects it to
   `openNodeNote(nodeId)`.
2. A single modal contains a read-only header and one textarea. It retains only
   transient UI state: the current node ID while open.
3. The textarea input handler writes its value to the target node's `data-note`
   attribute and schedules state saving through the existing history path.
4. State serialization reads `data-note` into `note`; state loading restores it
   when present and defaults to an empty string when absent.
5. The existing clone-based HTML save and JSON export thereby retain notes
   automatically through the normal serialized node state.

## Error and Edge Cases

- A deleted node cannot retain an open note; its modal closes.
- Empty notes are represented by an empty string and do not affect layout.
- Junction nodes do not expose notes.
- Escaping/HTML injection is avoided because note text is assigned through
  textarea values and the header uses text content rather than HTML.
- Repeated typing should not create a history state for every keystroke; saves
  are debounced, while closing the modal flushes any pending save.

## Verification

1. Open a regular node's note from its lower-left button; confirm its title and
   description appear above a large vertical plain-text editor.
2. Enter multiple paragraphs and confirm the editor scrolls.
3. Close and reopen the note; confirm text persists. Confirm undo and redo
   restore note edits.
4. Export/import a map and save/open standalone HTML; confirm notes persist.
5. Import an existing JSON map without `note`; confirm it opens and notes start
   empty.
6. Confirm a junction node has no note button and the page and About dialog say
   V3.72.
