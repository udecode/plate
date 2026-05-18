# Slate v2 keydown command coverage ralplan

Date: 2026-05-14
Status: superseded by `docs/plans/2026-05-14-slate-v2-example-memoization-hard-cut-ralplan.md`
Score: 0.94
Owner: Slate Ralplan planning only
Execution owner: ralph in `../slate-v2`

## Verdict

No. The table example is not covered by the previous callback cleanup.

The completed `onCommand` pass covered native formatting commands and removed
the bad `onDOMBeforeInput` formatting example. It did not cover the rest of the
example keyboard behavior. Current Slate v2 still routes only
`keyDownCommand.kind === 'format'` through user `onCommand` during keydown.

That leaves real editor behavior behind raw `onKeyDown` callbacks:

- table boundary Backspace/Delete/Enter
- inline left/right movement around inline elements
- image/root select-all behavior
- markdown Enter/Backspace shortcuts
- richtext block/mark hotkeys beyond the built-in format lane
- code block hotkeys and Tab/Shift+Tab indentation
- paste-url behavior in the inlines example

The docs also overstate the current contract: they say `onCommand` handles
history, delete, paste, text insertion, and line breaks from keyboard shortcuts,
but the live keydown path only exposes `format` to `onCommand`.

## Rule

Do not hard cut internal runtime `useCallback`. Runtime event handlers,
selector subscriptions, root listeners, and rendering strategy callbacks are
implementation machinery.

Hard cut user-facing callback ceremony when the example is expressing editor
behavior that Slate can classify semantically.

Keep `onKeyDown` for app UI state and escape hatches. Do not make Slate React
own overlay state.

## Live Source Evidence

Runtime:

- `../slate-v2/packages/slate-react/src/editable/editable-command-types.ts`
  already defines semantic commands for delete, history, insert break, insert
  data, insert text, move selection, select-all, set-block, and toggle-mark.
- `../slate-v2/packages/slate-react/src/editable/keyboard-input-strategy.ts`
  currently calls `applyUserEditableCommandHandler` only when the classified
  keydown command is `format`.
- `../slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts`
  routes native beforeinput commands through `onCommand` more broadly.
- `../slate-v2/packages/slate-react/src/editable/editable-input-rules.ts`
  already supports editor extension capability input rules, so behavior can
  move out of example props without inventing a new plugin system first.

Docs:

- `../slate-v2/docs/libraries/slate-react/editable.md` still teaches
  `onKeyDown` for keyboard shortcuts and claims broader `onCommand` coverage
  than keydown currently provides.

Examples:

| File | Current shape | Covered? | Target |
| --- | --- | --- | --- |
| `site/examples/ts/hovering-toolbar.tsx` | `onCommand` for format | yes | Keep. This is the good example. |
| `site/examples/ts/tables.tsx` | `useCallback<EditableKeyDownHandler>` around `applyTableBoundaryCommand(editor, event.key)` | no | Route classified `delete` and `insert-break` keydown commands to `onCommand` before default behavior. |
| `site/examples/ts/inlines.tsx` | raw `onKeyDown` for left/right inline navigation | no | Route `move-selection` commands to `onCommand`; keep raw handler only if UI-only behavior remains. |
| `site/examples/ts/images.tsx` | inline `onKeyDown` for `mod+a` root/image selection | no | Route `select-all` through `onCommand` before default select-all behavior. |
| `site/examples/ts/markdown-shortcuts.tsx` | `inputRules` plus raw Enter/Backspace `onKeyDown` and Android `onDOMBeforeInput` flush glue | partial | Move Enter/Backspace to command/input-rule ownership; move Android diff flushing into runtime so the example does not touch Android internals. |
| `site/examples/ts/richtext.tsx` | inline `onKeyDown` for exit block, clear formatting, block hotkeys, mark hotkeys | partial | Use keymap-to-command registration for block/mark/clear commands; keep `onCommand` as the behavior execution boundary. |
| `site/examples/ts/iframe.tsx` | inline `onKeyDown` for mark hotkeys | partial | Use the same mark command/keymap path as richtext. |
| `site/examples/ts/code-highlighting.tsx` | `useCallback` keydown hook for code block conversion and indentation | no | Add keymap-to-command coverage for code block conversion and code indentation commands. |
| `site/examples/ts/inlines.tsx` | raw `onPaste` URL wrapper | no | Route paste as `insert-data` or add paste/input-rule capability; do not require raw clipboard parsing in the basic example. |
| `site/examples/ts/mentions.tsx` | `useCallback` for ArrowDown/ArrowUp/Tab/Enter/Escape popup control | intentionally no | Keep as UI overlay state unless a separate combobox/plugin layer is introduced. |

## Architecture Target

### 1. Make `onCommand` keydown-complete

For every keydown event that `getEditableCommandFromKeyDown` classifies into an
`EditableCommand`, Slate should give `onCommand` the first app-level chance to
handle it before applying default model behavior.

Do not keep the `format` special case.

Target flow:

```txt
keydown
-> root/runtime ownership checks
-> classify keydown into EditableCommand
-> onCommand(command, context)
-> default model/native behavior if unhandled
-> repair/selection sync
```

This immediately covers tables, inline arrows, select-all, Enter, Backspace,
Delete, history, and movement commands without teaching users raw `event.key`.

### 2. Add keymap-to-command registration for custom hotkeys

`onCommand` is a command consumer, not a raw hotkey parser.

Examples like richtext and code-highlighting need a way to register:

```ts
hotkey -> EditableCommand
```

This should be extension-capability owned, matching the existing
`editableInputRules(...)` direction. Candidate public shape:

```ts
editableKeyCommands(
  { hotkey: 'mod+b', command: { kind: 'toggle-mark', mark: 'bold' } },
  { hotkey: 'mod+shift+7', command: { kind: 'set-block', blockType: 'numbered-list' } }
)
```

Keep the prop surface minimal. Do not add `onKeyCommand`; `onCommand` is already
the right execution boundary.

### 3. Promote command/input rules for structural shortcuts

Markdown Enter/Backspace behavior is not UI state. It should be modeled as
command-aware input rules or key command rules, not a raw example callback.

The basic rule:

- text insertion shortcuts stay input-rule based
- Enter/Backspace/Delete shortcuts use command-aware rules
- Android pending diff flushing belongs in the Slate React runtime

### 4. Keep raw event props as escape hatches

Do not remove `onKeyDown`, `onPaste`, or `onDOMBeforeInput`.

Raw event props are still needed for:

- UI overlays like mentions
- highly custom browser integrations
- temporary debugging
- behavior that Slate cannot classify yet

But docs/examples should not present raw events as the normal way to customize
editor behavior once a command exists.

## Candidate Comparison

ProseMirror has low-level DOM props, but serious behavior normally lives in
keymap/inputrule/plugin layers. That supports the target: raw event props stay,
but examples should prefer semantic behavior registration.

Lexical is the strongest argument for this rewrite. It centralizes root event
handling and exposes commands as the public customization path. Slate should not
copy Lexical's whole class-node model, but it should copy the command boundary.

Tiptap proves the product-DX side: keyboard shortcuts, commands, input rules,
and paste rules are extension ergonomics, not scattered DOM event parsing.
Slate should stay lower-level than Tiptap, but Plate can productize the richer
side on top.

## Execution Plan For Ralph

### Phase 1: Lock the current gap

- Add focused tests showing `delete`, `insert-break`, `move-selection`, and
  `select-all` keydown commands call `onCommand` before default behavior.
- Add a doc/contract test or source assertion proving docs do not claim command
  families that the runtime cannot expose.

### Phase 2: Remove the `format` gate

- In `keyboard-input-strategy`, route all classified keydown commands through
  `applyUserEditableCommandHandler`.
- Preserve native deferral for cases that must remain native, especially the
  existing backward-delete native deferral.
- Ensure handled commands prevent default and record the same trace/repair data
  as model-owned defaults.

### Phase 3: Rewrite examples that need no new API

- `tables.tsx`: replace `onKeyDown` with `onCommand` handling `delete` and
  `insert-break`.
- `inlines.tsx`: move left/right logic to `onCommand` for `move-selection`.
- `images.tsx`: move select-all logic to `onCommand`.
- Keep behavior identical with focused browser tests for each touched example.

### Phase 4: Add key command capability

- Add `editableKeyCommands(...)` as a Slate React extension capability.
- Feed key commands into the same keydown classifier before default commands.
- Use `EditableCommand` output, not arbitrary DOM event callbacks.
- Convert `richtext.tsx`, `iframe.tsx`, and the code-block hotkey portion of
  `code-highlighting.tsx`.

### Phase 5: Command-aware rules and paste

- Add command-aware rules for markdown Enter/Backspace.
- Move Android pending diff flush policy out of `markdown-shortcuts.tsx`.
- Route paste customization through `insert-data`/paste-rule ownership so the
  inlines URL paste example does not need raw `onPaste`.

### Phase 6: Docs and verification

- Rewrite `editable.md` so:
  - `onCommand` describes only behavior the runtime actually exposes
  - `onKeyDown` is documented as an escape hatch and UI shortcut path
  - raw `onDOMBeforeInput` remains advanced native input API
- Focused tests first:
  - `slate-react` keyboard command unit tests
  - example package tests for tables, inlines, images, markdown shortcuts, and
    code highlighting
  - Chromium Playwright rows for each rewritten example
- Final gate:
  - `cd ../slate-v2 && bun --filter slate-react typecheck`
  - `cd ../slate-v2 && bun lint:fix`
  - `cd ../slate-v2 && bun --filter slate-react test`
  - `cd ../slate-v2 && bun check`

## Risk

The risky part is not removing `useCallback`. The risky part is letting
`onCommand` become a second plugin system.

Keep the boundary sharp:

- `onCommand` handles semantic commands
- key command capabilities produce semantic commands
- input/paste rules produce semantic commands or text transforms
- raw DOM props stay escape hatches
- UI overlay state stays in the app

## Completion

This planning pass is complete. It is ready for `ralph` execution.
