# Tiptap: commands and transforms

## Command preflight with can()

- **Command preflight.** Tiptap's `editor.can()` runs a command with an undefined `dispatch`, so it reports whether the command would apply without applying it. `ueberdosis/tiptap@91c51be53c:packages/core/__tests__/can.spec.ts` (14 tests, lines 18-189) pins that `can().undo()` is false on a fresh editor and true after a change, also inside a chain. It pins that `can().setMark('bold')` is false with the caret in a code block or when the selected nodes, marks or stored marks conflict with bold, and true when at least one selected node accepts it. A nested `can().chain()` passes the undefined dispatch down. The harvest routes this to the enabled state of Plate toolbar buttons and shortcuts (`docs/editor-test-harvester/tiptap/report.md:94`). Read at that commit on 2026-10-08; the 2026-05-10 harvest pinned no commit, but its cited lines match this one.

## Hard break

- **Hard break.** Tiptap's hard break is an inline `hardBreak` node rendered as `<br>`, the line break that Plite calls a soft break. The HardBreak demo spec (`ueberdosis/tiptap@91c51be53c:demos/src/Nodes/HardBreak/React/index.spec.js:12-48`, mirrored in Vue) pins that `<br>` and `<br />` both parse to it, and that the toolbar button, Shift+Enter and Mod+Enter each insert one; the extension binds both keys (`ueberdosis/tiptap@91c51be53c:packages/extension-hard-break/src/hard-break.ts:112-117`). Plite's DOM hotkeys bind Shift+Enter to `insertSoftBreak`, which inserts a `\n` into the text rather than a node (`packages/plitejs/src/dom/utils/hotkeys.ts:29`, `packages/plitejs/src/editor/insert-soft-break.ts:8-18`). The harvest routes this to Plite's soft-break browser examples and Plate's break policy (`docs/editor-test-harvester/tiptap/portable-mixed-routing.md:46-47`). Read on 2026-10-08.

## Transaction ownership in chains

- Tiptap command chains reuse one held transaction. A custom command participating in a chain must use the supplied transaction or chain rather than dispatching independent work through the editor. Source: `docs/plans/2026-07-15-plite-update-lifecycle-api.md:473`, citing https://tiptap.dev/docs/editor/api/commands and https://tiptap.dev/docs/editor/api/commands/set-meta in its 2026-07-15 review. The cited documentation is unversioned; this establishes the command-authoring contract, not a measured performance advantage.

## Insertion targets

- Tiptap separates insertContent, which targets the current selection, from insertContentAt, which accepts an explicit position or range; selection updating is a separate control. The July 2026 comparison read ueberdosis/tiptap@91c51be:packages/core/src/commands/insertContent.ts and insertContentAt.ts, reported as core 3.21.0 (c70bacbd4a:docs/plans/2026-07-13-plite-block-relative-insertion-api.md:469). This establishes distinct target and selection-policy choices, not a reason to copy Tiptap's parsing, chaining or content policy into a raw editor primitive. No execution result was recorded.

## Keyboard shortcuts and inline boundaries

- The May inline-delete investigation treated Tiptap's extension keyboard shortcuts as product wrappers around ProseMirror deletion commands, and distinguished an atom node view's opaque content from editable inline content. Evidence: `c70bacbd4a:docs/plans/2026-05-07-plite-inline-delete-boundary-repro-ralplan.md:111-112`, citing Tiptap's `ueberdosis/tiptap:packages/core/src/extensions/keymap.ts:13`, `commands/join.ts:59`, `commands/selectNodeBackward.ts:17`, `helpers/getSchemaByResolvedExtensions.ts:80` and `NodeView.ts:261`. The plan pins no Tiptap commit; this supports the historical ownership comparison, not a current-version compatibility claim.

## Keyboard shortcut dispatch

- Tiptap's `keyboardShortcut` command normalizes a shortcut, synthesizes a `KeyboardEvent` and routes it through ProseMirror `handleKeyDown`. Its core keymap composes product commands on the ProseMirror runtime. Source: `docs/plans/2026-05-03-plite-hotkey-runtime-dependency-ralplan.md:101-106`, citing `ueberdosis/tiptap:packages/core/src/commands/keyboardShortcut.ts:5-89` and `ueberdosis/tiptap:packages/core/src/extensions/keymap.ts:68-99`. Limit: the local May source read pins no Tiptap revision; it establishes an integration boundary rather than a portable low-level matcher.

## Command composition

- **A command chain shares its transaction and dispatches at its boundary.** Tiptap's `createChain` creates or receives one transaction, passes that transaction to each command, and dispatches from `run()` only when the chain owns the transaction and dispatch is enabled. Nested chains therefore compose without independently dispatching the supplied transaction. Evidence: `ueberdosis/tiptap@91c51be53c4655ef07e29ec489471524debfa0ca:packages/core/src/CommandManager.ts:61-100`; the historical comparison is `docs/plans/2026-07-12-list-v2-api.md:381`. Limit: this establishes transaction composition, not a recommendation to copy Tiptap's global command namespace.

## Optional node reads

- Tiptap's list-joining helpers consume nullable ProseMirror node reads at the command boundary. In `toggleList.ts`, the backward and forward helpers compare the list type with `nodeBefore?.type` or `nodeAfter?.type` after `tr.doc.nodeAt`, and return without joining when the comparison fails (ueberdosis/tiptap@91c51be53:packages/core/src/commands/toggleList.ts; c70bacbd4a:docs/plans/2026-07-15-internalize-required-node-reads.md:452). This supports guarding optional reads inside product commands; it is evidence from these helpers, not a claim about every Tiptap command.
