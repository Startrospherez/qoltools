# MindMap V3.73 Refinement Design

## Scope

Refine the V3.73 view controls, add alignment shortcuts, and make the Info
dialog maintainable as a separate content source. This release does not include
the V3.74 image workflow.

## View Controls

The lower-left zoom percentage is an unstyled, clickable text control. It
always displays the rounded current zoom percentage and clicking it sets zoom
to 100% while preserving the canvas coordinate at the usable viewport center.

`Alt+R` has a separate two-state behavior:

1. Zoom to Fit nodes and images with padding below the toolbar, saving the
   exact pre-fit `{cx, cy, zoom}` view.
2. Restore that saved view.

Manual pan or wheel zoom clears the saved fit view. The next `Alt+R` then
starts a new Fit/Restore pair. The percentage control does not participate in
this pair.

## Alignment Shortcuts

Use `Alt+U`, `Alt+J`, and `Alt+M` for Top, center-row, and Bottom Align;
`Alt+I`, `Alt+O`, and `Alt+P` for Left, center-column, and Right Align;
`Alt+K` and `Alt+L` for horizontal and vertical distribution. `Alt+M` is
reassigned from Shader; the toolbar Shader button remains available.

## Info Content Source and Rendering

Create `content/mindmap-info.html` as the user-editable source of the Info
dialog body. `decoded/mindmap.html` contains an explicit placeholder marker.
Extend `build-tools.js` to replace that marker with the source fragment while
generating `tools/mindmap.html`. Therefore the generated page and every saved
standalone HTML file contain the complete dialog, but the user has only one
small content file to edit.

The content uses collapsed `<details>` sections by default:

- `📖 วิธีใช้งาน`
- `🧩 ใช้งานยังไง?`
- `🧭 ทำยังไง?`
- `✨ นอกจาก node ที่เห็นแล้วมีอะไรอีก?`
- `⌨️ Hotkeys`
- `🤝 การแบ่งปัน (เครดิต)`

Use button emoji and names consistently, call the middle mouse button
`เมาส์กลาง`, keep all existing sharing links and credits, remove the special
blue name styling, and retain `© 2026 Chetphanu Sutadharo`.

## Verification

1. Build injects the Info source once into `tools/mindmap.html`; no placeholder
   remains in generated output.
2. Click the zoom percentage: it resets only to 100%. Use `Alt+R` twice:
   Fit then exact restore. Pan or wheel between presses resets that pair.
3. Verify all eight alignment/distribution shortcuts and that `Alt+M` no
   longer toggles Shader.
4. Open Info: every section is collapsed initially, content is scrollable, all
   links and copyright are present, and its Hotkeys match the code.
5. Confirm standalone HTML output retains the injected Info dialog.
