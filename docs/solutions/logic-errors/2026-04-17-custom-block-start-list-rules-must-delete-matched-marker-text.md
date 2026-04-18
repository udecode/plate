---
module: Input Rules
date: 2026-04-17
problem_type: logic_error
component: editor_transforms
symptoms:
  - "Typing `- ` in `/blocks/list-demo` kept the `-` text instead of starting an empty list item"
  - "Ordered and task markdown list shorthands depended on the same custom block-start path"
  - "Selection coverage existed for structure in some rule tests, but not for the post-transform caret position"
root_cause: logic_error
resolution_type: code_change
severity: medium
tags:
  - input-rules
  - list
  - selection
  - autoformat
  - blockStart
---

# Custom blockStart list rules must delete matched marker text

## Problem

Modern list markdown rules promoted the paragraph into a list item, but they
left the shorthand marker text behind in the live editor.

The most obvious repro was `/blocks/list-demo`: typing `- ` produced a list
paragraph whose text was still `-`.

## Root cause

`createRuleFactory(... type: 'blockStart' ...)` only performs built-in matched
text deletion when the rule uses the default block-start apply path.

Modern list rules supplied custom `apply` functions:

- [BulletedListRules.ts](packages/list/src/lib/BulletedListRules.ts)
- [OrderedListRules.ts](packages/list/src/lib/OrderedListRules.ts)
- [TaskListRules.ts](packages/list/src/lib/TaskListRules.ts)

That meant the shorthand marker range was never deleted unless the rule did it
manually.

`list-classic` already handled this correctly by deleting `match.range` inside
its custom apply path. Modern list rules did not.

## Solution

Make modern list rules mirror `list-classic`:

- resolve the matched range explicitly
- delete `match.range` inside custom `apply`
- then run `toggleList(...)`

```ts
resolveMatch: ({ range }) => ({ range }),
apply: ({ editor }, match) => {
  editor.tf.delete({ at: match.range });
  toggleList(editor, { listStyleType: KEYS.ul });
  return true;
}
```

For ordered lists, keep the parsed start number and the range together:

```ts
resolveMatch: ({ match, range }) => ({
  range,
  start: Number((match as RegExpMatchArray)[1]),
})
```

## Why This Works

The list transform itself was fine. The broken part was the missing cleanup
step before the transform.

Once the marker range is deleted first, the promoted list paragraph starts
empty and selection lands at `[0, 0]` offset `0`, which is what the live
editor should have done all along.

## Prevention

- Do not assume custom `blockStart` apply handlers inherit matched-text cleanup.
- If a rule family uses custom `apply`, add one regression for:
  - transformed structure
  - marker text removal
  - final selection
- When `list-classic` and modern `list` disagree, inspect the cleanup path
  before touching normalization or rendering.

## Verification

```bash
bun test packages/list/src/lib/inputRules.spec.tsx
bun test ./apps/www/src/__tests__/package-integration/list/current-kit.slow.tsx
bun test ./apps/www/src/__tests__/package-integration/playground/playground-rules.slow.tsx
pnpm turbo build --filter=./packages/list --filter=./packages/link --filter=./apps/www
pnpm turbo typecheck --filter=./packages/list --filter=./packages/link --filter=./apps/www
pnpm lint:fix
```

Browser proof:

- Fresh `dev-browser` load of `http://localhost:3001/blocks/list-demo`
- Reset to an empty paragraph
- Type `- `
- Result is an empty list item with selection at `[0, 0]`, offset `0`
