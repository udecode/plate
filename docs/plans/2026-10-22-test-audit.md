# Audit every test area against the library bar

Page: https://claude.ai/artifact/MxRzTP4mPzaJ9n8DQ69StX
Status: executed: unit and script lanes cut; browser lanes judged only
Playbook: refactoring

The test audit (t_8ea0d74e) ran the new Library bar over every test area: `packages/platejs`, `apps/www`, `apps/plite`, `tooling`, `packages/test`, `benchmarks`, `packages/cli` and `.agents/rules`. Each cut or rewrite needed a planted bug that a stronger test catches, or proof that the cut test missed that bug too. Browser tests in `apps/plite/tests` and `apps/www` were only judged, because cutting them needs a browser run.

## Brief

### What will change?

About 4,400 net lines go across 161 files, 1,873 added and 6,237 removed. Most of them checked a function's own internals, grepped source text or restated a mock. Rewritten tests now run the real script, key press or rendered output. A few production lines that only tests used go too, such as `mergeDeep` and two dead proof helpers.

### What could go wrong?

A cut test may have caught something the planted bug did not try. Every cut has a mutant log, and tests on the bar list were kept when in doubt. Browser candidates are listed, not cut.

## Evidence

### Method

- Codex `gpt-6.1-sol` read lanes, about 13,000 lines each, wrote one candidate report per lane under the run directory.
- Opus edit delegates owned disjoint files, planted each mutant in a detached proof worktree built by `tooling/scripts/proof-worktree.mjs`, and logged every run.
- The lead reviewed each report, sent back weak cuts and lowered the lint baseline with `pnpm lint:baseline`.

### Areas

| Area | Candidates | Result |
| --- | --- | --- |
| `packages/platejs` | about 115 over 10 lanes and one leftover lane | cut or rewritten; 15 work-count tests restored after the bar's wording was fixed, 3 of them then cut as duplicates |
| `apps/www` unit | 34 | cut or rewritten, mock spreads trimmed, `plate-registry-config.ts` constants inlined |
| `apps/www` browser | 24 | judged only |
| `apps/plite` scripts | 8 | 3 cut, 5 rewritten to run the runner, server and Playwright config |
| `apps/plite` browser | 21 | judged only |
| `tooling` | 23 | 10 cut, 12 rewritten, 1 kept |
| `packages/test` | 17 | 13 cut, 4 rewritten, 1 kept; `keyboard-oracle-audit.test.ts` scanned a missing folder |
| `benchmarks`, `packages/cli` | 11 | all cut; each passed under its own mutant |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Benchmark tests that grep benchmark source | Cut, since each passed with the benchmark timing empty work | Rewrite each to run the benchmark | rewrite benchmark inventories | small |
| A deterministic work count | Kept when it guards a named scaling defect | Cut as speed, which the benchmark lane owns | cut work counts | small |
| Browser candidates | Listed for a browser-proof pass | Cut on reader judgment | cut browser tests | big |

## Close

This run landed the unit and script lanes of every area, this plan and its log. It also lands a sharper last sentence for the Library bar in `CODING_STANDARDS.md` and the `Page:` line of the test-bar plan.

**Counts.** 161 files change and 17 are deleted. Production code loses about 150 lines, all of it reachable only from tests: `mergeDeep.ts`, `V53_PROFILE_SOURCE`, the DOCX schema defaults, two unused `@platejs/test` proof helpers, a watcher-count getter that always returned 0, `readFeatureManifest` and six helpers that `anti-slop-plugin.mjs` exported only for its tests. `pnpm lint:baseline` dropped 98 entries.

**Proof.** Every cut and rewrite has a mutant log under the run directories `docs/plans/artifacts/2026-10-22-test-audit-*/`. Each log shows the kept test failing, or the cut test passing under the bug it claimed to guard. Delegates ran each changed file on intact source, and `pnpm lint:task` on what they changed. `land.mjs` ran `pnpm check --affected`, and all 25 steps passed on the third run. The first two runs failed on host load around 22. `view-caret-work.test.tsx` in `packages/plitejs`, which this change does not touch, ran 5,118 ms against its 5,000 ms limit and passed alone. The second run also exposed a race in the new matrix test's fake Playwright. Parallel projects rewrote one control file in place, so a reader could see it half written. The fake now writes through a rename. Under 40 parallel copies the old fixture failed 5 times and the fixed one never did.

**Reversals.** The bar first said speed belongs to the benchmark lane, and delegates cut deterministic work-count guards under it. The sentence now keeps a work count that guards a named scaling defect. A restore delegate brought back 15 such tests, and 3 of them were then cut as duplicates of kept tests.

**Limits.**
- 45 browser candidates were judged but not cut: 24 in `apps/www` and 21 in `apps/plite/tests`.
- The keep-alive rewrite in `plite-static-server.test.mjs` waits 6.5 seconds, because only a real idle wait shows the socket survives.
- These now have no guard:
  - the static server's `headersTimeout`;
  - the serial-workload marker in browser test files;
  - a weak `htmlEquals` negative control, which needs the browser lane;
  - three generated gauntlets in `@platejs/test` that have no consumer.
- The three tools folded from the Ellie intake were not built: the assertion lint, the coverage check after each cut batch and the patch flag for `proof-worktree.mjs`.
- Benchmark files still hold tests that only read `benchmarks/targets/slate-v2.json` and `package.json`.
- `packages/cli/test/generate.test.ts` keeps 22 raised timeouts.

**Open work.** Each of the first four waits as a suggested task.
- A browser-proof pass over the 45 judged candidates.
- A fix for the bug where pasting mixed code-block and paragraph content inserts nothing.
- A fix for the bug where a DOCX top-level `img` with a data URI writes its media and relationship twice.
- The Ellie intake tools listed under Limits.
- The owner decides whether the exported `_replaceNodeKeys` state in `AIChatPluginState` goes.
