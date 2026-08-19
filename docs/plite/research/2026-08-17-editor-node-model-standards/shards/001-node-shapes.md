# Shard 001: node shapes

Scope:
Eight representative document/editor node models across nine atomic decisions.

Sources sampled:
- UNIST, MDAST, ProseMirror model/basic schema, Lexical, Slate, BlockNote,
  Portable Text, Editor.js, Quill, and current Plate/Plite.

Top leads:
- P1: one `heading` node/descriptor with `level: 1 | ... | 6`.
- P1: `codeBlock.language` instead of `lang`.
- P1: semantic Table width/height/backgroundColor/columnWidths names instead
  of overloaded `size`, `background`, and `colSizes`.
- Keep: Plate schema AST, flat fields, `{ text }` leaves, leaf marks, editable
  code lines, flat lists, direct media-caption children, document-level schema
  lineage.

Rejected leads:
- Wholesale MDAST, ProseMirror JSON, Lexical JSON, Portable Text, BlockNote,
  Editor.js, or Quill Delta adoption.
- MDAST `depth` as the canonical editor heading field.

Duplicate leads:
- ProseMirror, BlockNote, and Slate converge on `heading + level`; Lexical
  independently supports one heading type with a tag field. Merged into one
  heading lead.
- Lexical, BlockNote, and Portable Text converge on `language`; merged into one
  code-field lead.

Next query:
- None for this bounded question. The next action is user acceptance or
  rejection of the three P1 packets.
