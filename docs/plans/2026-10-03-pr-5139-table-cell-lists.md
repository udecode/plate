# PR 5139: lists inside Markdown table cells

Status: merged as 961c65be4c on main, 2026-10-03
Page: https://claude.ai/artifact/EYzQ5BVZEr1pxdThba2i6X

## Outcome

[PR 5139](https://github.com/udecode/plate/pull/5139) is an external contributor's fix for issue #5138 in `@platejs/markdown` on the `main` line. A list typed into a table cell used to write a raw newline into the GFM row and break the table, and an HTML `<ul>` in a cell read back as literal text. The PR makes both round-trip: cell lists read as indent-list paragraphs and write back as inline `<ul>`/`<ol>` HTML.

The maintainer repair is commit `538053aea0` on the contributor's branch, on top of their head `68cfd132dd`. CI passed on it, and the owner merged the PR with an admin squash merge as `961c65be4c`, past the missing review and Vercel status. Issue #5138 closed with it.

## Main changes

- The `table`, `tr`, `td` and `th` rules and every cell-list helper moved out of the 1,465-line `rules/defaultRules.ts` into `rules/internal/tableRules.ts`. `defaultRules.ts` is now 1,010 lines, below the 1,142 it had on `main`. Paths under `internal/` stay out of the barrels, so the package exports nothing new.
- The private node filters moved into `deserializer/internal/shouldDeserializeNode.ts` and `serializer/internal/shouldSerializeNode.ts`. The cell code calls them directly instead of injecting a temporary rule or serializing a node to see whether it survives.
- A cell list also needs the `list` type to pass `allowedNodes` and `disallowedNodes`. Excluding `list` keeps the cell's text fallback, which is the output `main` gives.
- An ordered list's `start` must be a safe integer; larger values keep the text fallback.
- The `a` rule reads a string `href` attribute when the node has no `url`. remark-mdx delivers an inline HTML `<a href>` as JSX, so these links lost their URL in every paragraph, and the cell lists started routing them there.
- The changeset adds the `<a href>` fix. The contributor's docs rows and task plan stay as they pushed them.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Where the code ran | `../plate` on the PR branch, with this repository's skills and rules | `../plate`'s own task and autoclosure rules | "plate rules" |
| `<a href>` fix | In the shared `a` rule, so paragraphs gain it too | Make cell lists fall back to text when they hold an anchor | "cells only" |
| Docs rows | The contributor's two rows from `e036684`; this run's row dropped | Keep both | "both rows" |
| Contributor tests | All kept, including the literal-checkbox test cut and then restored | Cut the low-signal ones | "cut tests" |
| Remaining warnings | Deferred: parse cell lists once, share `isNodeTypeAllowed` with the serializer, a paragraph-level `href` test, the `p` rule's trailing-break filter case | Fix them in this PR | "fix warnings" |
| Rule edits in this repository | `AGENTS.md`, the babysit playbook and `maintainer.mdc` stay uncommitted for you | Commit them now | "commit rules" |

## Proof

- `pnpm --filter @platejs/markdown test` in `../plate`: 272 pass, 0 fail. The new tests for the list filter, the safe start and the `<a href>` URL each failed before their fix.
- `pnpm check` in `../plate` on the final tree: exit 0 (Biome on 3,307 files, 54 typecheck tasks, 3,567 fast tests plus the slow and slowest suites).
- PR CI on `538053aea0`: CI passed in 5m15s and Verify changeset policy passed, after the fork's runs were approved.
- The decision log beside this plan records every review finding and its outcome.

## Delivery

- Commit `538053aea0` pushed as a fast-forward to `OrbitingBucket:feat/markdown-table-cell-lists`, after a re-read of the PR head.
- The PR description keeps the contributor's task-style body with four lines updated; the read-back matched.
- `../plate` is back on `codex/harden-media-file-urls`.
- [Issue 5140](https://github.com/udecode/plate/issues/5140) tracks the filter gap: `disallowedNodes: ['a']` does not block inline HTML `<a href>`, reproduced on `main`.
- The babysit playbook now opens this page before the first review round and sends owner questions through it (uncommitted in this repository).
