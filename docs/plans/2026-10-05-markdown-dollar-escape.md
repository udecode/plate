---
review_scopes: [markdown]
work_kind: implementation
---

# Dollar escaping in Markdown serialize

Status: executed; uncommitted in the working tree
Page: https://claude.ai/artifact/JH4pZrmYKvCkVh9YEdG1Y3
Playbook: bug-fix

With `remark-math` registered, serializing text that holds a dollar sign before a character the writer escapes dropped that dollar's escape: `x$*$y` wrote `x$\*\$y`, which reads back as text `x`, an inline equation and `y`. The same happened to `x$_$y`, `x$[$y` and ``x$`$y``, and to `x$|$y` inside a GFM table cell. It reproduces at `fe0e9599a6`.

## Main changes

- `serializeMdWithRuntime` in `packages/platejs/src/markdown/lib/internal/markdownConversion.ts` runs a small remark plugin, `remarkEscapeDollars`, after the app's remark plugins. When a registered to-markdown extension escapes `$` in phrasing, it adds the same unsafe pattern without an `after` key.
- The cause is upstream. `mdast-util-math` 3.0.0 writes its pattern as `after: single ? undefined : '\\$'`, and `mdast-util-to-markdown` 2.1.2's `safe()` reads `'after' in pattern`, so it treats the dollar's escape as conditional and skips it when the next character is escaped. A second pattern without the key clears that condition.
- An editor without `remark-math` writes dollars as before, unescaped.

## Close

What landed, uncommitted in the working tree:

- `remarkEscapeDollars` and its wiring in `packages/platejs/src/markdown/lib/internal/markdownConversion.ts`.
- The test "keeps a dollar sign before an escaped character as text" in `packages/platejs/src/markdown/lib/mathSurface.spec.ts`.
- `.changeset/markdown-dollar-escape.md` (`platejs` patch).
- The Open work list in `docs/research/decisions/markdown-conversion.md` drops the item.

Proof and its limits:

- The new test fails before the fix (the text reads back as an equation) and passes after. At `HEAD` plus only this task's patch in a detached worktree, `bun test src/markdown src/math src/features/table` passes (452 tests), and with the fix removed the new test fails.
- On the working tree: `bun test src/markdown src/math src/features/table` 495 pass, the slow Markdown lane and `www` Markdown tests 95 pass, `typecheck:partition:markdown` and `ultracite check` on both task files exit 0.
- A public-API probe round-trips all eight dollar cases at top level and both table-cell cases unchanged, and an editor without `remark-math` still writes `price $5 and x$\*$y`.
- The fix covers to-markdown extensions registered as flat objects, which is how `remark-math` registers; an extension nested inside another extension's `extensions` list is not inspected.

The writing passes ran: deslop named the condition, and comment-sicko kept the comment after probing its claim. No panel ran, since a bug fix is not on the reviews list.
