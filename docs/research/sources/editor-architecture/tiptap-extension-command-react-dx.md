---
title: Tiptap extension command React DX
type: source
status: accepted
updated: 2026-04-23
source_refs:
  - ../raw/tiptap/docs/src/content/editor/api/editor.mdx
  - ../raw/tiptap/docs/src/content/editor/core-concepts/extensions.mdx
  - ../raw/tiptap/docs/src/content/guides/performance.mdx
  - ../raw/tiptap/docs/src/content/guides/react-composable-api.mdx
  - ../raw/tiptap/docs/src/content/guides/create-mark.mdx
  - ../raw/tiptap/repo/packages/core/src/CommandManager.ts
related:
  - docs/research/entities/tiptap.md
  - docs/research/decisions/slate-v2-read-update-runtime-architecture.md
---

# Tiptap extension command React DX

## Purpose

Compile the Tiptap evidence that matters to Slate v2's extension ergonomics and
React integration.

## Strongest Evidence

- Tiptap's editor instance centralizes editor creation, extensions, content,
  editability, input rules, paste rules, editor props, and ProseMirror view
  setup.
- extensions package nodes, marks, attributes, global attributes, commands,
  events, and keyboard shortcuts.
- custom extensions add commands that appear on `editor.commands` and
  `editor.chain()`.
- `CommandManager` builds single-command and chained-command APIs around one
  transaction.
- React performance docs recommend selective editor-state subscriptions and
  disabling transaction-wide rerenders.
- the composable API exposes editor context, loading states, bubble/floating UI,
  and selector hooks.

## What To Steal

### 1. Extension ergonomics

Slate v2 should make feature packaging feel like:

- define extension
- add extension
- get methods/normalizers/handlers/UI outputs

Plate should not have to manually thread unrelated snippets across React
providers, editor construction, and command handlers.

### 2. Command discoverability

Tiptap's command catalog is good DX. Slate v2 should expose discoverable editor
methods and extension methods, but should keep the write lifecycle as
`editor.update`.

### 3. Optional chain API

Tiptap's chain API is useful for composing multiple operations into one
transaction. Slate v2 can offer optional sugar:

```ts
editor.chain().setNodes(props).wrapNodes(wrapper).run()
```

But `chain().run()` should be sugar over `editor.update`, not a second engine.

### 4. React selector posture

Tiptap docs correctly identify React rerender pressure around editor
transactions. Slate v2 should go further:

- selector hooks should consume `EditorCommit` dirtiness
- urgent text paths should use live reads / DOM capability results
- unrelated React state should not rerender the editor body

### 5. Composable UI

Tiptap's composable React API is good product DX. Slate v2 / Plate should
provide:

- provider
- content
- loading/ready state
- bubble/floating UI channels
- selector hooks
- toolbar helpers

## What Not To Steal

- Do not require `chain().focus().command().run()` for ordinary toolbar
  commands.
- Do not make ProseMirror leakage the advanced-user default.
- Do not make React integration rely on isolating the editor from React.
- Do not use commands as a substitute for a safe read/update lifecycle.

## Take For Slate v2

Tiptap is the product-DX benchmark, not the engine benchmark.

Slate v2 should use:

```txt
editor.update as lifecycle
primitive methods as power API
extension methods as product API
optional chain as sugar
selector hooks for React UI
```

This keeps Slate flexibility while giving Plate/Tiptap-level ergonomics.
