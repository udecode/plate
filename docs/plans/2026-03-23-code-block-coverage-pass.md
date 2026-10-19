---
title: Code Block Coverage Pass
type: testing
date: 2026-03-23
status: completed
---

# Goal

Do one narrow non-React pass on `@platejs/code-block`.

# Target Seams

- `packages/code-block/src/lib/formatter/formatter.ts`
- `packages/code-block/src/lib/withCodeBlock.ts`
- `packages/code-block/src/lib/withInsertDataCodeBlock.ts`
- `packages/code-block/src/lib/setCodeBlockToDecorations.ts`

# Approach

- add `formatter.spec.ts`
- deepen existing:
  - `withCodeBlock.spec.tsx`
  - `withInsertDataCodeBlock.spec.tsx`
  - `setCodeBlockToDecorations.spec.ts`
- avoid `/react`
- no broad serializer or transform sweep

# Desired Cases

## `formatter`

- supported language detection
- valid vs invalid syntax checks
- `formatCodeBlock` no-op for unsupported or invalid code
- `formatCodeBlock` inserts formatted JSON for valid code

## `withCodeBlock`

- existing insert-break indentation case stays
- lang-changing `set_node` clears cached code-line decorations
- `resetBlock` unwraps code blocks instead of delegating
- `tab` indents and reverse-tabs outdents selected code lines

## `withInsertDataCodeBlock`

- VSCode paste outside a code block creates a new typed code block with language
- VSCode paste inside a code block inserts lines, not a nested block
- invalid VSCode metadata falls back to normal paste behavior

## `setCodeBlockToDecorations`

- registered-language highlight failure logs debug error and returns empty decorations
- unregistered-language failure warns and falls back to plaintext
- cache setter populates `CODE_LINE_TO_DECORATIONS`
- reset helper clears cache for all code lines

# Verification

- targeted `bun test` on touched code-block specs
- `pnpm test:profile -- --top 20 packages/code-block/src`
- `pnpm test:slowest -- --top 20 packages/code-block/src`
- `pnpm install`
- `pnpm turbo build --filter=./packages/code-block`
- `pnpm turbo typecheck --filter=./packages/code-block`
- `pnpm lint:fix`

# Result

## Added

- `packages/code-block/src/lib/formatter/formatter.spec.ts`

## Expanded

- `packages/code-block/src/lib/withCodeBlock.spec.tsx`
- `packages/code-block/src/lib/withInsertDataCodeBlock.spec.tsx`
- `packages/code-block/src/lib/setCodeBlockToDecorations.spec.ts`

## Runtime fix

- `packages/code-block/src/lib/withCodeBlock.ts`
  - `tab` now queries selected `code_line` nodes instead of the enclosing `code_block`, so multi-line tab and shift-tab work on every selected line.

## Deferred

- `packages/code-block/src/lib/withNormalizeCodeBlock.tsx`
- `packages/code-block/src/lib/BaseCodeBlockPlugin.ts`
- broader serializer and deserializer coverage outside the existing seams

## Verification

- `bun test packages/code-block/src/lib/formatter/formatter.spec.ts packages/code-block/src/lib/withCodeBlock.spec.tsx packages/code-block/src/lib/withInsertDataCodeBlock.spec.tsx packages/code-block/src/lib/setCodeBlockToDecorations.spec.ts`
- `bun test packages/code-block/src`
- `pnpm test:profile -- --top 20 packages/code-block/src`
- `pnpm test:slowest -- --top 20 packages/code-block/src`
- `pnpm install`
- `pnpm turbo build --filter=./packages/code-block`
- `pnpm turbo typecheck --filter=./packages/code-block`
- `pnpm lint:fix`
