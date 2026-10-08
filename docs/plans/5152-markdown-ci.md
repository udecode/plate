# PR 5152 Markdown fixes: CI repair

Status: executed; pushed as 9a0e7ce0e4, CI on next stays red for its own reasons
Page: https://claude.ai/artifact/1Y6PNrtjDQWBQXErYz979P
Playbook: babysit

Babysit of [PR 5152](https://github.com/udecode/plate/pull/5152) by natamox, head `e1fb01295e` on `next` at `c70bacbd4a`. The repair is pushed to `codex/markdown-regression` as `9a0e7ce0e4`, under the Branch delivery rule the owner added to `AGENTS.md` on 2026-10-09.

## Brief

### What will change?

The PR's four Markdown fixes stay as written. Two old tests that expected the broken output go, and the Chinese docs page gets the table-cell change the English page already has.

### What could go wrong?

The PR's CI stays red, because next itself fails five check steps and six Plite browser tests. Only the two Markdown tests were this PR's. I tested with this checkout's packages, not a fresh install.

## Teach

Plate can save a document as Markdown and read it back. A line break at the very end of a paragraph has no plain Markdown spelling, so Plate writes it as an HTML line-break tag on its own line.

Before this PR, that failed when a paragraph ended in two or more breaks. Plate wrote a backslash and a space right before the tag line. Markdown reads that as a literal backslash, so one break got lost each time. The PR now writes every break in that trailing run as the HTML tag, and the text survives the round trip.

Two tests in the website app still expected the old, lossy output, so CI failed on them. Package tests already check the same round trip, so the repair deletes the two stale tests.

## Main changes

| Change | Before | After |
| --- | --- | --- |
| Stale www tests | `serializeMarkdown.spec.tsx` pinned `> Block quote\ ` and `Para\\\n\ ` output, which reads back with a lost break | Deleted; `commonmarkSurface.slow.ts` and `paragraphBreaks.spec.ts` assert the round trip |
| Chinese Markdown docs | Said block tags in a table cell stay text | Matches the English page: childless registered block tags, such as a sized image, stay blocks in a cell |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Two stale website tests | Delete them, since package tests already check the round trip | Keep them, updated to the new output | keep www tests | small |
| Failures that are already on next | Leave them to their owners and list them here | Fix them inside this PR | fix next too | small |
| Shorter trailing-break output | Keep the PR's output | Write only the last break as HTML and change every single-break snapshot | shorter breaks | detail |

## Close

Verdict: the PR should land. Its four fixes repair real round-trip losses at the producer, and its list change removes a second copy of paragraph lowering. The thermo-nuclear review found no structural blocker ([summary](artifacts/5152-markdown-ci/thermo/summary.md)).

Reversal first: the repair first stayed uncommitted for the owner. The owner then said to always push to branches other than main and next, so it landed as `9a0e7ce0e4` on top of `e1fb01295e`, and the PR body now matches the pushed diff:

- `apps/www/src/__tests__/package-integration/markdown-rich/serializeMarkdown.spec.tsx` drops the two tests that pinned the lossy output.
- `content/docs/(plugins)/(serializing)/markdown.cn.mdx` gets the two table-cell sentences the English page already has.

Proof and its limits:

- The round-trip probe shows base losing a break and adding a backslash for `a<br/><br/>`, dropping a list item's trailing break and throwing on `## https://example.com`, while the PR head round-trips all three ([log](artifacts/5152-markdown-ci/probe-breaks-a2.log)).
- `pnpm check test` fails the same five cases in the repair worktree and the base worktree, all www tests that import `@emoji-mart/data`, which the linked `node_modules` of this checkout lack. No Markdown case fails in either ([PR](artifacts/5152-markdown-ci/check-test-pr-a1.log), [base](artifacts/5152-markdown-ci/check-test-base-a1.log)). A real install at the PR head was not run, so CI is the first clean-environment run of the repair.
- The Chinese docs edit is prose only, checked by reading it against the English page. The docs parity script needs a `build:source` first and was not run.
- Not run: `test-slow`, typecheck, the www build and the browser matrix. PR CI already passed `test-slow`, typecheck and lint on the same product code.

CI after a push stays red on checks that fail the same way on `next`: the main-to-next sync tooling test, `core-audits` (`rg` missing on the runner), `entrypoint-graph`, `www` (`plate` CLI missing) and six Plite Chromium cases that throw `getFlatTreeParentElement is not defined`. A suggested task covers the Plite crash. The EditorStatic reuse oracle timed out on CI and passed 3 of 3 locally in 1.4 s.

Counts: 20 todo items, 17 done, 3 skipped (one babysitter check, the watcher, which needs a push, and bot triage with no bot comments), 0 partial, 0 blocked, 0 open.

## Open work

- Red checks that fail the same on `next`. owner: zbeyens. stop: `next` CI passes those steps. Tracked on this page; the Plite crash also has a suggested task.
