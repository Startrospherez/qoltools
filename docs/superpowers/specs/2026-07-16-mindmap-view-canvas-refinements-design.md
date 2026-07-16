# MindMap View and Canvas Refinements Design

## Scope

This small refinement corrects the confusing startup canvas appearance,
clarifies the Mindmap-specific Dark control, swaps the visual states of the
node Note button, and improves the Fit/Return keyboard flow. It does not alter
the V3.74 Project ZIP format or image-library implementation.

## Canvas Dark

The existing `Dark` theme remains available. Its toolbar button cycles through
three explicit states:

1. **Sepia / normal** → full **Dark theme**, exactly as the current button
   does.
2. **Full Dark theme** → **Canvas Dark**: reset the interface, nodes, dialogs,
   and controls to normal Sepia, while changing only the working-canvas
   background to a near-black color.
3. **Canvas Dark** → normal **Sepia / normal**.

Canvas Dark is therefore a useful second press of the existing Dark button,
not a replacement for the original full Dark theme. The second transition also
sets the shared base theme back to Sepia, preserving the existing global theme
model; only the Canvas-black state itself is Mindmap-local.

- Canvas Dark is off when a Mindmap opens unless a user explicitly reaches it
  through this button cycle, preventing an unintended black startup screen.
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
   mode, not black. Press Dark once for the full Dark theme, press it again
   for Canvas Dark with Sepia UI, then press it once more to return to Sepia.
2. Toggle Grid and Canvas Dark together; verify grid and node readability.
3. Check Note button normal and hover colors on selected and hovered nodes.
4. At 80%, press `Alt+R`, then press again without moving: exact original view
   returns.
5. At 80%, press `Alt+R`, pan to another graph region, point at it, then press
   `Alt+R`: that region is centered at 80%.
6. Fit, wheel zoom, then press `Alt+R`: confirm it starts a new Fit pair.
7. Run JavaScript syntax checks, `node build-tools.js`, and `git diff --check`.
