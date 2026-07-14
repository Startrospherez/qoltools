# Mindmap Find Design

## Goal

Add a Find control to the Mindmap page so a user can search text across a crowded canvas, jump to each matching node, and move forward or backward through duplicate matches.

## Scope

The feature searches the visible text in both parts of every regular Mindmap node:

- The title (`.nt`)
- The detail text (`.nd`)

Matching is case-insensitive substring matching. For example, a search for `ธรรม` matches any title or detail containing that sequence. Connector/junction nodes (`.n.j`) have no searchable text and are excluded.

Find is transient UI state. It does not modify the Mindmap data model, selection, history, local storage, imports, or exports.

## User Interface

Add a `🔎 Find` button to the existing Mindmap toolbar. Activating it opens a compact floating search bar at the upper-right of the viewport, visually similar to a browser's Ctrl+F control.

The controls appear in this order:

`[ search input ] [ current / total ] [ ▲ ][ ▼ ] [ × ]`

- `▲` moves to the previous result.
- `▼` moves to the next result.
- The arrow buttons sit directly beside each other on the right for easy repeated clicking.
- `×` closes Find and removes the search highlight.
- The counter displays values such as `2 / 5`.
- Enter in the input moves to the next result.
- Shift+Enter moves to the previous result.
- Arrow buttons include Thai tooltips describing their action and keyboard equivalent.

The bar normally sits below the fixed toolbar so it does not cover toolbar controls. When the toolbar is hidden, the Find bar moves near the top edge. The bar remains usable on narrow screens by constraining its width to the viewport.

Opening Find focuses the input and selects its current contents. Closing and reopening Find may retain the current query during the page session, but must not persist it across page reloads.

## Search Behavior

Typing in the input immediately rebuilds the ordered result list from the current `nodes` collection. Results follow the collection's existing order, which is stable for a given Mindmap state.

For a non-empty query:

1. Read each eligible node's title and detail using visible text (`textContent`).
2. Normalize both the query and candidate text to lowercase.
3. Include the node when either field contains the normalized query.
4. Set the current result to the first match after the query changes.
5. Center that node in the usable viewport and apply the temporary Find highlight.

Navigation wraps in both directions: moving next from the final result selects the first, and moving previous from the first selects the final result.

An empty query shows no active result and does not move the canvas. If there are no matches, the counter shows `ไม่พบ` and the viewport stays where it is.

The result list is recalculated when the query changes. Before navigating an existing list, stale nodes that are no longer connected to the document are discarded so editing, deletion, undo, redo, or import cannot leave navigation pointing to a removed node.

## Viewport and Highlight

Jumping to a result keeps the user's current zoom level. It updates `cx` and `cy` so the center of the target node appears in the center of the usable viewport, accounting for the toolbar area when it is visible, and then calls the existing transform update path.

The current result receives a dedicated Find highlight class. This class is visually distinct and independent from `.sel`; search navigation must not clear, add, or otherwise change the user's existing node selection. Only the current result is highlighted.

Closing Find clears the Find highlight but leaves the viewport at the most recently visited result.

## Component Boundaries

The implementation remains within the existing standalone Mindmap HTML and is divided into small responsibilities:

- Search bar markup and CSS: presentation and responsive placement.
- Search state: current query, matching node references, and active result index.
- Match refresh: reads node text and produces the ordered matches.
- Navigation: wraps the index and selects the active result.
- Viewport focus: centers one node without changing zoom or data.
- Cleanup: removes highlight and closes the transient UI.

The source change is made in `decoded/mindmap.html`; the repository's existing `build-tools.js` process regenerates `tools/mindmap.html`.

## Error and Edge Cases

- Empty query: no highlight, no movement, neutral counter.
- No matches: show `ไม่พบ`, disable or no-op both arrow buttons, and do not move the viewport.
- One match: both directions remain on that match.
- Duplicate text in one node: the node appears once, even if both title and detail match.
- Rich or formatted content: search the readable text rather than HTML markup.
- Deleted or replaced nodes: discard stale references before navigation.
- Junction nodes: ignore them because their text fields are hidden and absent from the user-facing canvas.
- Closing with Escape while focus is in the Find bar: close Find and return focus to the page.

## Verification

Manual browser verification will cover:

1. A query matching only a title.
2. A query matching only details.
3. Substring and case-insensitive matching.
4. Multiple matching nodes using `▲`, `▼`, Enter, and Shift+Enter.
5. Forward and backward wraparound.
6. Empty and no-result queries.
7. Preservation of zoom and existing node selection.
8. Correct centering with the toolbar shown and hidden.
9. Closing through `×` and Escape.
10. Narrow viewport layout.
11. Editing, deleting, undoing, redoing, or importing while Find is open.
12. A build check confirming `tools/mindmap.html` is regenerated successfully from the decoded source.
