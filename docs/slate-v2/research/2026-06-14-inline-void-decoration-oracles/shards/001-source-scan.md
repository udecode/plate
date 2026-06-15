# Source Scan

Scope: local sibling source scan for inline void, decoration refresh, IME, and
toolbar-selection proof.

Status: promoted.

## Reads

- ProseMirror composition tests: decoration refresh, highlighted text, multi-node
  composition, and widgets beside composition.
- ProseMirror selection tests: arrow motion through selectable inline nodes.
- ProseMirror draw-decoration tests: inline decorations across inline node
  boundaries.
- ProseMirror clipboard tests: node selection serializes only the selected node.
- Lexical composition/input code: token/segmented text and DOM-selection mismatch
  force editor-owned input paths.
- Lexical mention entity code: mentions block insertion before/after and export a
  scoped span representation.

## Slate Mapping

- Covered-existing: async decoration composition proof in
  `decorations-async.test.ts`, with Chromium IME transport scope.
- Covered-existing: atomic mention arrow, drag, editing, and clipboard proof in
  `mentions.test.ts`.
- Covered-existing: decorated DOM range import and decorated clipboard export in
  `slate-dom` tests.
- Promoted: inline decoration boundary projection contract in
  `packages/slate-react/test/projections-and-selection-contract.tsx`.

## Verification

- `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx -t "projects decorations across inline element boundaries"`: 1 passed.
- `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx`: 25 passed.

## Slowdown

The broad Lexical/Tiptap/Milkdown scan was too noisy for the active context.
Future runs should write broad scans to raw artifacts and read exact slices only.
