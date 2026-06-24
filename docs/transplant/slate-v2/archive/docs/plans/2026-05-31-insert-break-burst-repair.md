# insert break burst repair

Objective:
Fix the fast typing regression where a character burst containing `Enter`
every N characters leaves following characters on the wrong side of a break.
Completion requires a reproduced failure, behavior coverage, a runtime-owned
fix, and focused Slate v2 unit/browser proof from `.tmp/slate-v2`.

Completion threshold:
- Browser or unit repro proves a burst like `abc{Enter}def{Enter}ghi` keeps
  model text and selection in the same order as native typing.
- Characters typed after each break land at the collapsed caret in the new
  block.
- Existing staged pagination perf and virtualized typing regression rows still
  pass.
- Focused `slate-react` tests and typecheck pass.

Verification surface:
- `.tmp/slate-v2` focused package tests for input routing/DOM repair.
- Playwright Chromium route proof when browser-visible behavior is involved.
- `bun --filter slate-react typecheck`.

Constraints:
- Preserve public Slate API/DX.
- Fix the runtime/input boundary, not a pagination-only workaround.
- No commit or PR requested.

Boundaries:
- Source of truth: `.tmp/slate-v2`.
- Likely owners: `packages/slate-react/src/editable/input-router.ts`,
  `runtime-keyboard-events.ts`, DOM repair queue, and pagination browser tests.

Blocked condition:
Block only if real browser keyboard events cannot reproduce the issue after
three focused attempts or the clean fix requires a broader public API decision.

Task state:
- current_phase: complete
- goal_status: ready_for_goal_close

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `slate-patch` and `autogoal` loaded |
| Active goal checked or created | yes | `create_goal` created insert-break burst repair goal |
| Source of truth read before edits | yes | Read slate-react input router, DOM repair, selection reconciliation, selector routing, and pagination browser tests |
| Browser route identified | yes | `http://localhost:3100/examples/pagination?page_layout=single&strategy=staged` equivalent Playwright route |

Work Checklist:
- [x] Objective and completion threshold recorded.
- [x] Reproduce current failure.
- [x] Add behavior coverage.
- [x] Fix runtime ownership boundary.
- [x] Verify focused gates.
- [x] Run architecture pressure review.
- [x] Decide Evidence Kit handling.
- [x] Run or record autoreview outcome.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Bug reproduced before fix | yes | Reproduce burst with inserted breaks | Browser repro showed `abc{Enter}def...` interleaving as `This abc`, `demf`, `ghi`, `jkil`, `mnoxed...`; red Playwright row failed before fix |
| Targeted behavior verification | yes | Run focused test/proof | Unit contracts cover structural command guard, projected-boundary coalescing, stale captured target rebasing, non-contiguous same-path edits, and selector path stability |
| TypeScript changed | yes | Run `bun --filter slate-react typecheck` | Passed |
| Browser surface changed | yes | Run focused Playwright proof | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/pagination.test.ts --project=chromium --grep "keeps fast staged text after insert breaks|keeps staged burst typing responsive|keeps fast burst typing intact|keeps middle-document typing responsive"` passed 4/4 |
| High-risk mini gate | yes | Record failure mode and chosen boundary | Structural model commands arm a short model-owned text guard; normal projection-native typing stays fast but deferred repair trusts event-stream inserts only when explicitly marked authoritative |
| Final lint | yes | Run lint or scoped equivalent | `bunx biome check --fix` passed on touched files |
| Goal plan complete | yes | Run autogoal checker | `[autogoal] complete: docs/plans/2026-05-31-insert-break-burst-repair.md` |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Reproduce | complete | Browser repro and red Playwright row | done |
| Implement | complete | slate-react runtime/input repair boundary patched | done |
| Verify | complete | Unit, typecheck, Vitest, Playwright, autoreview clean | autogoal checker |
| Closeout | complete | plan updated and checker-ready | final response |

Findings:
- Root cause: stale/native DOM text repair could use browser-owned insertion after a model-owned `insertBreak`, so immediate following characters were repaired against the wrong DOM/caret boundary.
- Related root cause: projected text boundaries can make Chrome interleave original suffix text into a fast burst before the deferred repair flushes.
- Chosen fix: keep native projection perf, but mark event-stream coalesced inserts as authoritative only for contiguous or one-character projected-boundary drift; non-authoritative captured targets are re-diffed against the current model.

Verification evidence:
- `bun test ./packages/slate-react/test/native-input-strategy-contract.test.ts ./packages/slate-react/test/dom-text-sync-contract.ts ./packages/slate-react/test/input-router-contract.test.tsx ./packages/slate-react/test/dom-repair-policy-contract.test.ts ./packages/slate-react/test/selection-controller-contract.ts ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/selection-reconciler-contract.ts` passed 60 assertions on the Bun-discovered subset.
- `cd packages/slate-react && bunx vitest run --config ./vitest.config.mjs test/input-router-contract.test.tsx test/dom-repair-policy-contract.test.ts --testNamePattern "coalesces|later same-path|same-path inserts after the caret moves|partially synced|captured coalesced"` passed 6 tests.
- `bun --filter slate-react test:vitest` passed 56 files / 588 tests.
- `bun --filter slate-react typecheck` passed.
- Focused Playwright pagination proof passed 4/4.
- `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local --no-web-search --thinking low` reported clean.

Open risks:
- The unbounded autoreview command was interrupted after hanging silently; the bounded no-web-search low-thinking autoreview completed clean.
- Full Slate v2 integration sweep was not run; focused package and pagination browser gates cover this regression.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Autogoal checker, then final response |
| What is the goal? | Fix burst typing with inserted breaks so text order and caret remain correct |
| What have I learned? | Insert-break bursts and projection-boundary bursts share stale native repair ownership failure modes |
| What have I done? | Added regression coverage, fixed model-owned guard and deferred repair coalescing/rebasing, verified focused gates |
