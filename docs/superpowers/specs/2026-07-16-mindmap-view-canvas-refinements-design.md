# MindMap View and Canvas Refinements Design

## Scope

This small refinement corrects the confusing startup canvas appearance,
clarifies the Mindmap-specific Dark control, swaps the visual states of the
node Note button, and improves the Fit/Return keyboard flow. It does not alter
the V3.74 Project ZIP format or image-library implementation.

## Canvas Dark

Mindmap's toolbar `Dark` control becomes a local **Canvas Dark** toggle. It
changes only the working-canvas background to a near-black color. The toolbar,
buttons, nodes, Info dialog, and shared Hub theme remain in their existing
colors.

- Canvas Dark is off when a Mindmap opens, preventing an unintended black
  startup screen.
- It is independent from the global `hub_theme` state and does not write to
  that state, so turning it on does not change the other tools.
- It must remain usable with Grid, Snap, selection, PNG export, and standalone
  HTML. Grid lines remain visible against the dark canvas.

## Node Note Button

The `📝` node Note button keeps its current visibility behavior (shown when
the node is selected or hovered), but its colors invert:

- normal: light background with blue border/icon;
- hover: blue background with a white icon.

This explicit hover style overrides the generic button hover rule.

## Alt+R Fit / Return

`Alt+R` has one Fit/Return pair. Its first press records the current view and
zooms to Fit.

- If the user has not panned after Fit, the second press restores the exact
  recorded `{cx, cy, zoom}` view.
- If the user pans with right-click or middle-mouse after Fit, the second press
  restores the recorded zoom level but centers the canvas point currently under
  the mouse pointer. If no pointer coordinate is available, use the usable
  viewport center.
- Wheel zoom after Fit ends that Fit/Return pair, because it is an intentional
  change to magnification. The next `Alt+R` starts a fresh Fit pair.
- After any Return, clear the saved pair. The next `Alt+R` always begins with
  Fit.

The toast should distinguish exact restore from cursor-centered zoom restore.

## Verification

1. Open `tools/mindmap.html` directly: Canvas starts in normal light/sepia
   mode, not black. Toggle Dark and verify only Canvas changes.
2. Toggle Grid and Canvas Dark together; verify grid and node readability.
3. Check Note button normal and hover colors on selected and hovered nodes.
4. At 80%, press `Alt+R`, then press again without moving: exact original view
   returns.
5. At 80%, press `Alt+R`, pan to another graph region, point at it, then press
   `Alt+R`: that region is centered at 80%.
6. Fit, wheel zoom, then press `Alt+R`: confirm it starts a new Fit pair.
7. Run JavaScript syntax checks, `node build-tools.js`, and `git diff --check`.
