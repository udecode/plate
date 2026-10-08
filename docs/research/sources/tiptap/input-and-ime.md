# Tiptap: input and IME

## Shortcuts on non-Latin layouts

- **Non-Latin undo shortcuts.** Tiptap's UndoRedo demo spec (`ueberdosis/tiptap@91c51be53c:demos/src/Extensions/UndoRedo/React/index.spec.js:9-89`, mirrored in Vue) runs undo and redo from buttons and shortcuts, including `Mod-я` and `Shift-Mod-я`. The test fires `keydown` with `key: 'я'` and no key code. It passes because the UndoRedo extension binds `Mod-я` and `Shift-Mod-я` beside `Mod-z`, `Shift-Mod-z` and `Mod-y` (`ueberdosis/tiptap@91c51be53c:packages/extensions/src/undo-redo/undo-redo.ts:77-83`), so it proves one hard-coded Russian binding, not a fallback for every layout. Plite matches by physical key instead: for a single-letter hotkey whose `key` is non-ASCII, `matchKey` falls back to `event.code` (`packages/plitejs/src/dom/utils/hotkey-match.ts:181-196`). `packages/plitejs/test/dom/hotkeys.ts:129-136` pins Cyrillic `я` and `Я` on `KeyZ` as undo, and line 138 pins that an ASCII-remapped layout does not match. That is a unit test of the matcher, not a browser run. The harvest cited the same test under its pre-merge package name (`docs/editor-test-harvester/tiptap/report.md:96`). Read on 2026-10-08.

## Core input

- Tiptap delegates core browser input, selection and paste handling to ProseMirror and is not an independent low-level input engine; on top it adds selection decorations, NodeView mutation-ignore rules, hidden-content selection correction in its details extension and paste metadata hooks. Evidence: a package-level scan of the local Tiptap checkout on 2026-06-13, not line-level reads (`docs/plite/research/2026-06-13-oss-selection-ime-paste-oracle-scout/read-log.tsv:10`, `rejected-ledger.tsv:3`).
