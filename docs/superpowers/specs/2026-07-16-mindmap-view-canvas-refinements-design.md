# MindMap View and Canvas Refinements Design

## Scope

This small refinement corrects the confusing startup canvas appearance,
clarifies the Mindmap-specific Dark control, swaps the visual states of the
node Note button, and improves the Fit/Return keyboard flow. It does not alter
the V3.74 Project ZIP format or image-library implementation.

## One Theme Button

Replace the separate `Sepia` and `Dark` toolbar buttons with one button named
`Theme`. It changes the visual theme and cycles through three explicit states:

1. **Sepia** — the current default cream theme.
2. **Dark** — the existing full Dark theme for the interface and Canvas.
3. **Sepia with Dark Canvas** — interface, nodes, dialogs, and controls use
   normal Sepia, while only the working-canvas background is near-black.

The cycle is `Sepia → Dark → Sepia with Dark Canvas → Sepia`. Full Dark keeps
its current behavior. The Canvas-dark transition sets the shared base theme
back to Sepia; only the Canvas-black state itself is Mindmap-local.

- Canvas Dark is off when a Mindmap opens unless a user explicitly reaches it
  through the Theme cycle, preventing an unintended black startup screen.
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
   mode, not black. Press Theme to cycle Sepia → full Dark → Sepia with Dark
   Canvas → Sepia.
2. Toggle Grid and Canvas Dark together; verify grid and node readability.
3. Check Note button normal and hover colors on selected and hovered nodes.
4. At 80%, press `Alt+R`, then press again without moving: exact original view
   returns.
5. At 80%, press `Alt+R`, pan to another graph region, point at it, then press
   `Alt+R`: that region is centered at 80%.
6. Fit, wheel zoom, then press `Alt+R`: confirm it starts a new Fit pair.
7. Run JavaScript syntax checks, `node build-tools.js`, and `git diff --check`.
