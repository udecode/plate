# Intake: which other domains earn a formal check

Page: https://claude.ai/artifact/7v98QfG2zZqCf6yscXWsRQ
Status: done: 15 items, 4 chips offered, 0 folded
Playbook: verdict

The owner asked whether formal checks can come from the code, tests, fixes and plans we already have, and whether each domain, such as DOCX, can get one, or whether that needs a sweep like natamox's. No sweep is needed. A domain earns a check when its code makes a promise a check can test without a browser, something says what the right answer is, and tests only sample the inputs while bugs keep landing. The 2026-10-23 intake already judged autoformat, now built, suggestion recording, Yjs peers, selection and Tab. Of the 15 domains read here, four earn a check: delete and paste over every range, undo and redo over every short command list, table commands on every small grid, and Markdown round trips with streamed chunks. The other eleven get none, mostly because their open bugs need a real browser, Word itself or a design answer first.

## Brief

### What will change?

No code changes. Four new tasks add exhaustive checks: delete and paste, undo and redo, table commands, and Markdown with streamed chunks. They run after the two checks the first intake already queued.

### What could go wrong?

The evidence counts fixes by commit subject and bugs by title, so it is rough. Each check still has to show on its first run that it finds a known bug in under about 15 seconds.

## Pushback

- **"Each domain" is the wrong unit.** A check pays where a browser-free promise meets an oracle and sampled tests. DOCX has many open tasks, but they ask what Word shows, which only Word answers, and the retained Plate part makes Plate's own round trip an identity by design (`docs/vision/plate.md:1088`).
- **The material for four checks already exists.** Each of the four has a sampled generator or reference to start from: `createMarkdownStressCases`, the table grid generators, the history soak traces and `rawActionArbitrary`. A check enumerates what those sample, so the bug a seed misses stops depending on luck.
- **The 15-second budget is already loose.** The decision-order skill records its give-back family at about 21 s under load (`.agents/rules/authored-decision-order.mdc:41`), so each new check should measure its gate before it joins `pnpm check`.
- **The first intake's Tab premise moved a little.** List Tab and Shift+Tab rules now exist (`docs/editor-behavior/markdown-editing-spec.md:829`, `:837`). They cover lists only, and the open Tab bugs #5199 and #5200 are in Details titles and paragraph ranges, so its item 5 stands.

## Items

| # | Item | Outcome | Scope | Strongest reason | Evidence | Next |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | A check that cross-block delete and fragment insert keep the text outside the range, in order, keep the document canonical and undo in one step, over every range of every small document | Defer, P2 | none | Three P1 delete and paste bugs are open, t_31726070, t_b2ddef38 and t_ea3f0bf2, plus t_96b80fff on block picks, and K28 and K30 came from the same commands. The reference algebra samples raw actions, not editing commands, and insert-fragment behavior is mostly examples. Keep it if it finds those bugs in under 15 s | `packages/plitejs/test/document-change-laws.test.ts:414`; `packages/plitejs/test/clipboard-contract.ts:228`; `docs/editor-behavior/markdown-editing-spec.md:2790` | chip t_5d0972b0 |
| 2 | A check that undo and redo give back each earlier document over every short command list, with the grouping rules for clock, root and caret | Defer, P2 | none | t_d3072b82 (P0) and t_3f19cf79 (P1) are open, history had 9 fixes in two months, and t_78e51eb0's mutants rec-undo-h2 and rec-undo-h5 in history-state.ts survive every law. The soak tests sample seeded traces. Keep it if it catches those two mutants | `packages/plitejs/test/history/history-soak-contract.spec.ts:32`; `packages/plitejs/test/history/anchor-history-contract.ts:1193`; `docs/vision/plite.md:640` | chip t_219405e2 |
| 3 | A check that every table command keeps a valid grid and moves content as the spec's table rows say, on every small grid and span layout | Defer, P2 | none | Table had 10 fixes in two months, t_3e344661 and the sweep's cross-cell delete find are open, and the grid generators sample 100 span grids. An independent occupancy grid says the right answer | `docs/editor-behavior/markdown-editing-spec.md:1420` to `:1452`; `packages/platejs/src/features/table/lib/internal/grid.spec.ts:98`; `packages/platejs/src/features/table/lib/internal/mutation.spec.ts:401` | chip t_3ebc1211 |
| 4 | A check that Markdown parse, serialize and parse is stable on every small document, and that a streamed parse equals a fresh parse at every chunking of short sources | Defer, P2 | none | AI had 14 fixes and Markdown 8 in two months, the most of any domain read. The stress cases sample 256 seeded documents and the continuation test three chunkings. Both oracles exist in the tests already | `packages/platejs/src/markdown/lib/commonmarkSurface.spec.ts:80`; `packages/platejs/src/markdown/lib/markdownContinuation.spec.ts:54`; `docs/vision/plate.md:1387` | chip t_2e25157a |
| 5 | DOCX | Stop | none | Its eight open tasks ask what Word renders for margins, numbering, spans and images, and K38 needs real third-party files. No browser-free oracle answers either, and numbering already has a reference with generated documents | `packages/platejs/src/docx/import/lib/numbering/importDocxNumbering.spec.ts:183`; `docs/plans/2026-10-23-sweep-loop.md:167` | none |
| 6 | HTML | Stop | none | Its open tasks decode outside CSS, such as server style priority and `-webkit-center`, which a round trip of Plate's own HTML never produces. The conformance contract already checks each first-party mapping | `packages/platejs/src/html/htmlConformance.spec.ts:57` | none |
| 7 | Tab-separated paste into tables | Stop | none | One fix in two months, no open bug, and example tests cover quotes, line breaks and malformed quotes | `packages/platejs/src/features/table/lib/internal/tabularText.spec.ts:4` | none |
| 8 | List numbering and indent | Stop | none | Numbering already has an independent oracle with 5,000 seeded mutations. The open bugs are Tab dispatch, which needs the browser key path, and an untraced marker bug | `packages/platejs/src/features/list/lib/listNumbering.internal.spec.ts:24`; `docs/plans/2026-10-23-sweep-loop.md:139` | none |
| 9 | Footnote and TOC numbering | Stop | none | Two fixes in two months, and its open work is a design question on pasted refs and a multi-root index task. A check now would encode an answer nobody has given | t_379f939a; t_ad6feb38 | none |
| 10 | Drag and drop model moves | Stop | none | The open bugs are gestures, drop places and scrolling, which the model never sees, and move algebra is already sampled | `docs/plans/2026-10-23-sweep-loop.md:147`; `packages/plitejs/test/document-change-laws.test.ts:682` | none |
| 11 | Link | Stop | none | The open link bug #5228 is toolbar UI, and link automd is one narrow input rule outside the autoformat kits, so it belongs to that check's coverage, not a new one | `docs/editor-behavior/markdown-editing-spec.md:3993`; `.agents/rules/autoformat-input-rules.mdc`, What it does not cover | none |
| 12 | Comments and annotations | Stop | none | Anchor laws already sample traces, and the open comment bugs are UI | `packages/plitejs/test/history/anchor-history-contract.ts:1193`; #5126 | none |
| 13 | Pagination | Stop | none | Its bugs are geometry, selection paint and hit testing, which need layout | `docs/vision/plite.md:904` | none |
| 14 | The first intake's Tab item | Settled | none | List Tab rules exist now, but #5199 and #5200 are outside lists | `docs/editor-behavior/markdown-editing-spec.md:829`, `:837` | none |
| 15 | A sweep to find where checks pay | Stop | none | The code, tests, ledger and fix history answer it, as this page did, and the sweep stays for what needs a browser | this page | none |

## Order

1. The first intake's two checks, t_a998edbb and t_dd929413, go first, because recording and Yjs bugs lose data.
2. Then item 1, the delete and paste check, t_5d0972b0. Three P1 bugs wait in that code.
3. Item 2, the history check, t_219405e2, waits for t_a998edbb, because it reuses that check's command generator.
4. Items 3 and 4, t_3ebc1211 and t_2e25157a, can run in any order.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Order of the four new checks | Delete and paste first, since three urgent bugs wait there | History first, since it has the urgent stuck-undo bug | history first | small |
| HTML round trips | Left out of the Markdown check, since HTML's open bugs come from outside CSS | Check HTML round trips beside Markdown | with html | small |

## Close

This run landed this page and its decision log and offered four tasks. It wrote no code and no test.

A read-only evidence pass read the spec, the vision files, the tests and generators named above, the sweep plan's kinds, the ledger and the GitHub issues with Beta in their title or the target:beta label. It counted commits since 2026-08-24 on `origin/next` at ee0b38ca07 by subject. Bug counts come from titles and the ledger, so domain assignment is inferred. No test, mutant or benchmark ran in this pass. Each check's 15-second budget and keep condition is a target its first run measures.
