# MindMap V3.97–V3.99 Design

## Goal

Extend the verified V3.96 MindMap in three reversible releases: unify selection
and layout operations, give background Areas useful metadata and navigation,
then refine connector styles, palette behavior, toolbar controls, themes, and
help. Existing `mindmap-project formatVersion: 1` files remain compatible.

## V3.97: Unified selection and layout

- A transient Selection Registry owns `{ kind, id }` entries for Nodes, images,
  Timeline Lines, Floating Text, and Areas, plus the last-selected primary
  object.
- Ordinary marquee selects Nodes, images, Floating Text, and Timeline Lines
  whose visible segment intersects the marquee. Area selection is enabled only
  in Area mode; entering that mode preserves other selections so Shift-click
  can add Areas.
- Shift-click toggles one object. Dragging any selected object moves the whole
  mixed selection by one shared delta. Snap is calculated from the dragged
  primary object and applied to every member.
- Align uses each object's Canvas bounds. A Timeline Line is translated without
  changing its length or angle. Distribution keeps the existing equal-gap
  behavior and requires at least three objects.
- One mixed move, Align, Dist, or Delete is one history activity. Only the
  primary object shows destructive/resize controls; secondary selections show
  a lightweight highlight.
- Alt-dragging an Area in Area mode duplicates only that Area and places the
  copy at the release position.

## V3.98: Area metadata, Notes, Find, and context

- Area records gain optional `name`, `description`, `note`, and `fontSize`
  fields. Missing values normalize safely without changing `formatVersion`.
- A small always-available `📝` control straddles the Area's bottom-left
  corner. Only this control receives pointer input outside Area mode; the Area
  surface remains click-through.
- Name and Description render just inside the bottom-left corner, to the right
  of the Note control, using Floating Text's title/description hierarchy.
- The shared Note dialog edits Area Name, Description, and multiline Note and
  provides the existing internal Note Find behavior.
- Global Find includes Area name in title scope and Area
  name/description/note in all scope. Visible matches highlight their text;
  note-only matches reveal and highlight `📝`.
- Area results navigate to the bottom-left Note/name corner rather than the
  rectangle center.
- Any rectangle overlap places a Node in an Area. Programmatic Node navigation
  shows every distinct, non-empty overlapping Area name joined by ` · ` in a
  dedicated 4.5-second toast above the existing 3-second navigation toast.
- Metadata participates in history, backup, IndexedDB, JSON, Project ZIP,
  standalone HTML, and PNG paths already carrying normalized annotations.

## V3.99: Connector and interface refinements

- Connectors gain optional `style: solid | dotted | dashed`; missing or invalid
  values normalize to `solid`. Alt+left-click continues cycling arrow modes.
  Alt+middle-click on a connector cycles connector style, while plain middle
  drag continues panning.
- Connector split, junction, copy, history, import, and export preserve both
  arrow and style metadata.
- Move Timeline Line `│` and Floating Text `T` to the top Shape row after
  `📜`; move `🟨 Area` to the lower row after `💭`.
- Applied Board colors use stable Normal or Highlight palette families.
  Changing `🎨` only changes which family future applications use; existing
  object colors do not change. Theme still adapts both families and Shader is
  unchanged. Legacy `var(--cN)` values migrate to the stable Normal family with
  the same index.
- A+/A− changes one step on click. Holding for 400 ms repeats every 100 ms.
  One hold is one history activity. It applies to Node, Floating Text, and Area
  label font sizes, not Lines or images.
- Hiding the toolbar also hides the shared Hub/Tools controls and flyout while
  retaining the floating restore control.
- Sepia with Dark Canvas uses the same dark background for the viewport outside
  the Canvas while keeping Sepia UI, Nodes, and dialogs.
- The Info dialog has collapsed sections for introductory, Basic,
  Intermediate, Advanced, Hotkeys, and Credits content. Existing credits and
  `© 2026 Chetphanu Sutadharo` remain.

## Compatibility and safety

- User files outside the workspace are read-only.
- Selection remains transient and is never persisted.
- Optional fields are normalized at load boundaries; no project format bump or
  one-way migration is introduced.
- Each version is built from `decoded/mindmap.html`, regenerated through
  `node build-tools.js`, syntax-checked, diff-checked, and exercised by the
  localhost 1,000-Node harness before user interaction testing.

