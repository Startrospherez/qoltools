# MindMap Centered Automatic Route Labels Design

## Goal

Make automatic route labels visually match manually dragged labels: their
centre sits directly on the connector in every direction, with no
perpendicular nudge.

## Approved behaviour

- Remove the automatic perpendicular offsets previously used for short links
  and for nearby Node branch `+` controls.
- Keep an automatic label centred on its connector, whether the connector is
  horizontal, vertical, or diagonal.
- Position the label along the connector using its measured rendered size, so
  its nearest visible edge keeps the existing 14px gap from a regular Node and
  10px gap from a junction dot. Longer text moves farther along the connector
  rather than covering its owner.
- Preserve manual label positions and their existing centred rendering.
- Retain the separate crowded-hit-area protection for the middle `+` control;
  it continues to protect a nearby Node `+` and is not a label-placement rule.

## Short links

If a connector cannot physically fit both automatic labels at their preferred
clearances, labels remain centred on the line. They may be close along that
line, but they are never pushed sideways; the user can still drag either label
to a chosen manual position.

## Verification

Test horizontal, vertical, diagonal, short, and junction links. Test long
label text, a label near a Node `+`, the middle `+` beside a Node `+`, label
dragging, navigation, editing, and save/reopen persistence.
