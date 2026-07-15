# Mindmap Navigation, Info, and Image Workflow Design

## Roadmap

The current V3.72 is the stable baseline. This work is divided into two
releases:

1. **V3.73 — Navigation and Info:** zoom status, the three-step view control,
   `Alt+R`, and a reorganized About/Help dialog.
2. **V3.74 — Image workflow:** image picker and modifier-key image resizing.

Future work for canvas annotations (Line and Floating Text), long-edge
navigation, and connector labels remains intentionally outside these releases.

## V3.73: Navigation and Info

### Zoom status and view cycle

Show a fixed, clickable zoom percentage in the bottom-left corner. Its value
always reflects the current `zoom` value. Its tooltip explains the action:
Reset 100% → Fit graph → Restore view.

The same behavior is available through `Alt+R`:

1. **Reset:** save the current `{cx, cy, zoom}` view, then set zoom to 100%
   while preserving the canvas coordinate at the viewport center.
2. **Fit:** calculate bounds for all nodes and floating images, add safe
   padding, and set the view to fit those bounds below the toolbar.
3. **Restore:** return exactly to the saved pre-reset view and clear the cycle.

Each action shows a short toast. Any manual wheel zoom or pan clears the cycle
and its saved view, so the next click or `Alt+R` starts at Reset.

Empty canvases fall back to 100% without attempting Fit. The control is
transient UI state: it is not saved to JSON or added to history.

### Reorganized About/Help dialog

Retain the existing bottom-right `i` control but turn it into the complete
MindMap reference. The dialog uses clear, scannable sections:

- MindMap V3.73 overview and quick start
- creating, editing, selecting, dragging, and connecting nodes
- navigation, Grid, Snap, and the new view cycle
- images and Node Notes
- all current keyboard shortcuts, including `Alt+R`
- existing sharing/credit text, kept intact
- `© 2026 Chetphanu Sutadharo`

The content remains in Thai and preserves the current external sharing links.
No separate Hotkeys button is added.

## V3.74: Image Workflow

### Insert image

Add a `🖼️ IMG` button adjacent to Find. It opens a hidden file picker restricted
to images and places the selected image at the visible canvas center, with the
same initial sizing and state-saving behavior as the existing drag-and-drop
image insertion. Drag-and-drop remains supported.

### Resize modifiers

The existing lower-right resize handle keeps its default free resize behavior.
During a resize gesture, modifier state is read continuously:

- none: width and height change independently;
- Shift: preserve the image's original aspect ratio;
- Ctrl: keep the original image center fixed while resizing;
- Shift+Ctrl: preserve aspect ratio and original center together.

Minimum dimensions are enforced in all modes. Resizing saves through the
existing image state/history path. Images imported before this release require
no migration.

## Verification

### V3.73

1. Confirm the bottom-left percentage tracks wheel zoom.
2. Verify button and `Alt+R` perform Reset, Fit, then Restore; pan or wheel
   between steps restarts the cycle.
3. Verify Fit includes nodes and images with visible padding.
4. Inspect every About/Help section, existing credits/links, copyright, and
   the complete hotkey list.

### V3.74

1. Insert an image through `🖼️ IMG` and drag-and-drop; verify both persist
   through undo/redo and export/import.
2. Resize with each modifier combination; confirm aspect ratio and/or center
   behavior precisely match the defined mode.
3. Confirm minimum dimensions and normal free resize still work.
