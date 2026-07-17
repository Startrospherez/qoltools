# MindMap Centered Automatic Route Labels Implementation Plan

> Implements `../specs/2026-07-17-mindmap-centered-route-labels-design.md`.

The writing-plans skill is unavailable in this workspace; this is the
equivalent repository-local plan.

1. Split automatic-label placement into a provisional centred point and a
   measured-size adjustment along the connector.
2. Render automatic labels with the same centred transform used by manually
   dragged labels; remove directional dock classes and perpendicular offsets.
3. After the label is in the DOM, measure its projected extent along the
   connector and move its centre far enough to preserve the 14px/10px visible
   gap. Re-run this adjustment while editing long text.
4. Keep the middle `+` crowded hit-area logic untouched. Bump to V3.86,
   rebuild, syntax-check, run focused placement checks, and update HANDOFF.
