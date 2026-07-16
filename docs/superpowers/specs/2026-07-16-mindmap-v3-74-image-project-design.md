# MindMap V3.74 Image Project Design

## Goal

Make MindMap suitable for a long-running Buddhist-relationship project that may
contain thousands of images, without making pan, zoom, search, autosave, or
exports unusably slow. The project package is a single portable
`.mindmap.zip` file that users can import and export without manually
extracting it.

V3.74 is the image-project foundation. It also extends Find to search node
Notes. Library-management features such as searching the image library and
bulk import queues belong to V3.75.

## Compatibility and Source of Truth

- `decoded/mindmap.html` remains the source; `node build-tools.js` generates
  `tools/mindmap.html`.
- Existing `.json` Mindmaps must import and work without conversion. JSON is
  retained as a legacy/data interchange input, but is not a normal export
  choice for end users.
- `💾 HTML` remains an interactive Mindmap export. In Project mode it is a
  lightweight interactive snapshot: nodes, connectors, text, and image
  thumbnails remain, but it does not embed original image files. Project ZIP
  is the only complete editable backup for a map with managed images.
- Existing drag-and-drop image insertion remains supported.
- `content/mindmap-info.html` remains the editable source of the Info dialog.

## Project Package

The portable project format has the extension `.mindmap.zip` and is read
directly by the app. The user does not need to extract it.

```text
<project-name>.mindmap.zip
|-- manifest.json
|-- mindmap.json
|-- images/
|   |-- original/
|   `-- thumbs/
```

`manifest.json` identifies the package format and version. `mindmap.json`
contains graph state and image placements; it never duplicates full image
bytes inside history states. `images/original/` preserves original quality and
`images/thumbs/` contains browser-friendly thumbnails used on the Canvas.

## Runtime Storage and Image Data Model

Project mode stores graph metadata and image blobs in IndexedDB rather than
localStorage. This supports large binary data and avoids repeatedly storing
base64 image data in autosave and Undo/Redo.

An image has two distinct concepts:

1. An **asset** owns one original image blob, one thumbnail blob, and its
   `assetId`. A matching source file is stored once in the package.
2. An **image placement** owns an `assetId`, Canvas position, display size,
   caption, source/URL, and multi-line note.

Several placements may point to one asset. When the same image is inserted
again, the user can copy placement metadata from an existing placement. If
several placements already use the asset, the user chooses the placement to
copy. The copied caption, source, and note become independent afterwards;
editing one placement never changes another.

History stores placement metadata and asset references only, not original or
thumbnail blobs. Deleting a placement removes it from the Canvas but does not
immediately delete its asset, so Undo remains reliable. Unused assets may be
cleaned during Project ZIP export or by a later library-maintenance command.

## Import, Export, and Autosave

`📥 Import` is the only import entry point and accepts both `.json` and
`.mindmap.zip`:

- JSON follows the present import path as legacy/data input.
- Project ZIP is validated before the active map is replaced. The app reads
  the manifest, graph state, asset records, and thumbnails, then reports any
  missing or unreadable assets while still opening the rest of the graph.
- Import must show progress and leave the current active map intact if parsing,
  validation, or storage fails.
- The app detects the package from its contents rather than trusting only its
  extension: it validates JSON structure or ZIP structure plus `manifest.json`.

`📤 Export` is the only normal data-export action and always creates the
complete `.mindmap.zip` package. If a map has no images, the package contains
only its manifest and compact `mindmap.json`, so it remains lightweight. If it
has images, it additionally contains originals and thumbnails. This eliminates
the confusing choice between JSON and ZIP while preserving JSON inside every
package as the graph's data layer.

`💾 HTML` keeps its present role for a single-file interactive Mindmap. In
Project mode it exports the graph structure and the visual placements of
images, embeds their compact thumbnails, and omits the original image files.
The exported HTML must identify this as a snapshot and direct users to Project
ZIP when they need a complete, editable image project. `📸 PNG` remains the
option for a flat visual capture that includes whatever is currently rendered.

When a legacy JSON map first receives a managed image, it enters Project mode
and creates its local IndexedDB project data automatically. The user can then
export one complete `.mindmap.zip` file. Browser autosave is convenience data,
not a replacement for regular Project ZIP backups.

## Toolbar and Canvas Interaction

- Keep one `📤 Export` action that creates Project ZIP. Add `🖼️ IMG` beside
  `🔎 Find`; it opens an image picker and inserts selected
  images at the visible Canvas center. Drag-and-drop continues to insert at
  the drop position.
- Add one toggle button named `🌄 ภาพ` immediately to the right of `🧲 Snap`.
  Its single control switches the Image Layer on and off.
  - On: render thumbnails near the visible viewport.
  - Off: do not render image thumbnails; nodes, connectors, Grid, and text
    remain available for a lighter structural-editing mode.
  - Turning the layer off never deletes image data and Project ZIP exports
    remain complete.
- Single click selects an image; drag moves it; Snap applies to image moves.
- The image delete control and `Delete` remove the selected placement.
- The existing bottom-right resize handle supports:
  - no modifier: free resize;
  - Shift: preserve aspect ratio;
  - Ctrl: preserve original image center;
  - Shift + Ctrl: preserve both aspect ratio and center.
- Double-clicking an image opens a large-image dialog instead of creating a
  node. The dialog loads the original only for that image and provides editable
  caption, source/URL, and multi-line note. It closes with Escape, its close
  button, or a click on the backdrop.

## Find Includes Node Notes

Find keeps two scopes:

- `หัวข้อ`: title only.
- `หัวข้อ + รายละเอียด`: title, description, and the otherwise hidden node
  Note.

The result list contains each matching node once even when its query occurs in
multiple fields. Navigation centers that node. A matching title or description
highlights the matching text in its visible field. A Note-only match highlights
the node itself but never exposes Note text on the Canvas or adds a permanent
note marker.

## Performance, Failure Handling, and Limits

- Canvas displays thumbnails, not originals. Original blobs are loaded only in
  the image dialog or package export.
- Use viewport-aware thumbnail rendering so a map with many image placements
  does not paint all thumbnails at once.
- Add image files progressively and report import progress rather than blocking
  the UI.
- Handle IndexedDB quota/storage errors without overwriting the active map.
- Preserve placeholder placements for missing/corrupt assets and identify them
  in the import summary.
- Package code must remain usable from the local `file://` tool page and must
  not require a cloud service or user account.

## Scope Boundaries

### V3.74

- Project ZIP read/write, manifest versioning, IndexedDB project storage.
- Original/thumbnail asset handling and per-placement metadata.
- `🖼️ IMG`, `🌄 ภาพ`, resize modifiers, image dialog, legacy compatibility.
- Find support for node Notes and visible-field highlighting.

### V3.75 (not part of this implementation)

- Search/filter the image library.
- Identify and remove unused assets through a dedicated tool.
- Large bulk-import queue and advanced asset management.

## Acceptance Checks

1. Import an old JSON map and edit it; `📤 Export` produces a compact Project
   ZIP when it contains no images.
2. Create a Project ZIP containing images; import it into a fresh browser
   session and verify all placements, originals, thumbnails, captions, sources,
   and notes survive.
3. Test a damaged ZIP and an asset missing from an otherwise valid ZIP: the
   current map remains safe until validation completes and surviving graph data
   opens with a clear report.
4. Test image move, Delete/Undo, all four resize modifier combinations, and
   double-click preview editing.
5. Toggle `🌄 ภาพ` off and verify image DOM rendering is suppressed while
   node/connector editing remains responsive; toggle it back on and verify
   placements return unchanged.
6. Search title, description, and Note text. Verify visible matches highlight
   their field, Note-only results highlight only the owning node, and duplicate
   field matches do not duplicate results.
7. Export HTML from a project with images: it opens independently with
   thumbnails but no original image files; Project ZIP restores the full
   originals.
8. Run JavaScript syntax checks, `node build-tools.js`, and `git diff --check`.
