# Yjs Hocuspocus Known Issues Fix

Objective:
Fix known Hocuspocus/Yjs collaboration issues; done when focused TDD repros and Hocuspocus soak gates pass; plan docs/plans/2026-06-10-yjs-hocuspocus-known-issues-fix.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-06-10-yjs-hocuspocus-known-issues-fix.md

Primary template:
manual task plan, because the autogoal helper requires an AGENTS.md repo root and slate-v2 has none.

Applied packs:
- browser

Completion threshold:
- Every known issue class from `test-results/yjs-collaboration-soak/hocuspocus-3h-20260609-231052/summary.md` has a focused failing TDD repro before implementation or a recorded N/A reason.
- Focused TDD repros pass after implementation.
- `test:yjs-hocuspocus-production-soak` completes with `PRODUCTION_SOAK_FAIL_ON_ISSUES=1` and no non-expected issues.
- A focused replay or soak path covers the old Hocuspocus issue classes: non-convergence, `Yjs parent is text at path 0.0`, `No Yjs node at path 0.1`, and awareness selection.
- `bun typecheck:site` or package-level typecheck covering modified TypeScript passes.
- `node /Users/felixfeng/Desktop/repos/plate-copy/.agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-10-yjs-hocuspocus-known-issues-fix.md` passes.

Verification surface:
- Unit/contract tests under `packages/slate-yjs/test`.
- Browser/soak scripts under `scripts/proof`.
- Existing Hocuspocus example route `/examples/yjs-hocuspocus`.
- Summary artifacts under `test-results/yjs-*`.

Constraints:
- Use TDD vertical slices: one failing behavior proof, one implementation fix, repeat.
- Do not change Hocuspocus server/provider product simulation unless the test harness itself is wrong.
- Do not claim awareness is fixed unless a deterministic browser or contract proof observes remote selection.
- Do not mark offline network console errors as product issues when they are expected browser offline noise.
- Do not run git status or branch hygiene.
- Do not commit, push, or open PR.

Boundaries:
- Allowed: `packages/slate-yjs/**`, `site/examples/ts/yjs-hocuspocus.tsx`, `scripts/proof/**`, `package.json`, `docs/plans/**`.
- Avoid: unrelated Plate app/docs, release/publish/changelog, package export changes unless proven necessary.

Output budget strategy:
- Read exact summary slices and focused source files only.
- Use `rg --files`, `rg -n`, and bounded `sed -n` ranges.
- Keep long soak output in `test-results/**` artifacts and inspect summaries.
- Avoid streaming full event logs unless a narrow event range is needed.

Blocked condition:
- Stop only if a required Hocuspocus/browser dependency cannot run locally after three distinct attempts, or if fixing requires a public API/protocol decision that cannot be inferred from Slate/Yjs contracts.

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| User requirements extracted | yes | User requested `autogoal`, TDD, fix all known issues, including `test-results/yjs-collaboration-soak/hocuspocus-3h-20260609-231052/summary.md`. |
| Existing goal checked | yes | `get_goal` returned no active goal. |
| Plan helper attempted | yes | `create-goal-scratchpad.mjs` failed because slate-v2 has no AGENTS.md root; manual equivalent plan created. |
| Source of known issues read | yes | Read old 3h summary and latest production soak summary. |
| TDD skill read | yes | Read `/Users/felixfeng/Desktop/repos/plate-copy/.agents/skills/tdd/SKILL.md`. |

Work Checklist:
- [x] Extract explicit requirements and known issue classes with evidence.
- [x] Map old 17 issues to minimal behavior classes and existing test files.
- [x] RED: add focused repros for remote text-boundary deletion and virtual merge placeholder leakage.
- [x] GREEN: fix generated virtual ids, virtual unwrap/move placeholder consumption, cross-boundary `remove_text`, and merge placeholder cleanup.
- [x] Repeat RED/GREEN for remaining issue classes.
- [x] Add harness behavior for Next dev overlay click interception and expected browser offline noise.
- [x] Verify awareness selection through every old-seed Hocuspocus replay window.
- [x] Run focused package tests.
- [x] Run production Hocuspocus soak with fail-on-issues.
- [x] Run relevant typecheck/lint gate.
- [x] Review changed code for correctness and scope.
- [x] Run autogoal completion checker after this evidence update.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| TDD red proof | yes | Record failing test command/output before fix for each root issue class. | `bun test packages/slate-yjs/test/insert-fragment-contract.spec.ts` failed before `remove_text` projection with peer 0 retaining `alphaLin fragment`; `bun test packages/slate-yjs/test/structural-soak-contract.spec.ts` failed before merge placeholder cleanup for seeds 75, 116, and 131 with trailing empty blocks. |
| Focused tests | yes | Focused package/browser tests pass. | `bun test packages/slate-yjs/test/document-id-contract.spec.ts packages/slate-yjs/test/insert-fragment-contract.spec.ts packages/slate-yjs/test/structural-soak-contract.spec.ts packages/slate-yjs/test/merge-node-contract.spec.ts packages/slate-yjs/test/split-merge-contract.spec.ts packages/slate-yjs/test/unwrap-nodes-contract.spec.ts packages/slate-yjs/test/move-node-contract.spec.ts packages/slate-yjs/test/simple-operations-contract.spec.ts` passed: 60 pass, 0 fail. |
| Hocuspocus soak | yes | Production-like soak passes with fail-on-issues. | `PRODUCTION_SOAK_FAIL_ON_ISSUES=1 PRODUCTION_SOAK_RUN_ID=known-issues-final-production-20260610-1 bun ./scripts/proof/yjs-hocuspocus-production-soak.mjs` exited 0; summary reports actions 30, hard_reloads 2, browser_offline_windows 2, issues 0. |
| Old issue coverage | yes | Summary issue classes mapped to tests or N/A rows. | Old failing seed windows reran with issues 0: 1, 31, 41, 58, 68, 75, 85, 91, 99, 116, 131 under run ids `known-issues-all-seeds-*-20260610-1`. |
| Typecheck/lint | yes | Run owning package/site typecheck and formatter if files changed. | `bunx biome check --write ...` passed; `bun --filter @slate/yjs typecheck` passed; `bun typecheck:site` passed. |
| Autoreview | yes | Review changed code for bugs, regressions, missing tests. | Manual review found the remaining `offline-structural-mix-99` browser mismatch was DOM `\uFEFF` snapshot noise, not document divergence; runner now normalizes it. No broader API or protocol change added. |
| Goal plan complete | yes | Run check-complete after final evidence is recorded. | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-10-yjs-hocuspocus-known-issues-fix.md` passed from `/Users/felixfeng/Desktop/repos/plate-copy` against the control-plane mirror plan. |

Issue Class Map:
| Source issue | Class | Status | Evidence |
| --- | --- | --- | --- |
| random-control-5 | cross-Yjs-text-boundary `remove_text` was not broadcast to remotes | fixed | Added `insert_fragment` contract for delete at preserved text boundary; fixed `deleteYjsTextRange`; old seed 1 window now issues 0. |
| random-control-31,35,41,42,43,58,68,85,91 | structural virtual placeholder and unwrap/move leakage | fixed | Added structural contracts for unwrap and move placeholder consumption; old seed windows 31, 41, 58, 68, 85, and 91 now issues 0. |
| random-control-75,116,131 | element `merge_node` consumed children but left parent virtual placeholder exposing hidden target as an empty block | fixed | Added structural seed contracts; fixed merge fallback to consume the target placeholder; old seed windows 75, 116, and 131 now issues 0. |
| offline-structural-mix-99 | DOM `\uFEFF` zero-width text made equal document values compare unequal | fixed as harness noise | Snapshot normalization removes `\uFEFF`; seed 99 window now issues 0. |
| random-control-43 | path type error | fixed by structural placeholder changes | Old seed 41 window covers 43 and reports page_errors 0, issues 0. |
| random-control-91 | missing Yjs node | fixed by structural placeholder changes | Old seed 91 window reports page_errors 0, issues 0. |
| awareness | remote selection missing | covered | Every old-seed replay window includes repeated awareness scenarios and reports issues 0. |
| production baseline/persistence/network/degraded | independent provider non-convergence and Y.XmlText errors | fixed/covered | Final production-like soak `known-issues-final-production-20260610-1` reports issues 0. |
| Next dev overlay click interception | harness issue | fixed | Click helper falls back through pointer dispatch when Next dev overlay intercepts button clicks. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Scope and goal setup | complete | Summaries read; manual goal plan created after helper failure; active goal created. | Done. |
| Root-cause mapping | complete | 17 old issue rows deduped into text-boundary delete, virtual unwrap/move, virtual merge placeholder, DOM FEFF, and harness click/offline-noise classes. | Done. |
| TDD fix loop | complete | RED tests failed before fixes and focused tests now pass. | Done. |
| Soak verification | complete | Old seed sweep and production-like soak report issues 0. | Done. |
| Completion audit | complete | Biome, package typecheck, site typecheck, manual review, and control-plane autogoal checker complete. | Done. |

Findings:
- The old 3h Hocuspocus run completed 9,228 actions over 980 iterations and reported 17 issues.
- The latest production-like Hocuspocus run completed 18 actions and reported 12 issues across independent browser contexts.
- Hard product errors collapsed into three core encoder bugs: generated virtual id collisions across browser bundles, text-boundary delete projection, and unconsumed virtual placeholders after unwrap/move/merge.
- Harness noise included Next dev overlay click interception, expected offline network console errors, and DOM `\uFEFF` zero-width text in snapshot comparison.

Timeline:
- 2026-06-10 Read autogoal prompt and TDD skill.
- 2026-06-10 Read old Hocuspocus 3h summary and latest production soak summary.
- 2026-06-10 Autogoal helper failed in slate-v2 because no AGENTS.md repo root exists.
- 2026-06-10 Created manual goal plan.
- 2026-06-10 Added RED package contracts for generated virtual id collision, text-boundary delete, unwrap/move placeholder leakage, and merge placeholder leakage.
- 2026-06-10 Fixed core Yjs operation encoder and soak harness noise.
- 2026-06-10 Reran all old failing seed windows and production-like Hocuspocus soak with issues 0.

Decisions and tradeoffs:
- Use one-shot execution because the user asked to start fixing, not to approve a proposal.
- Treat the 17 old summary issues as coverage requirements but dedupe by root issue class to avoid writing shallow tests for repeated symptoms.
- Treat `<nextjs-portal>` click interception as harness-first unless evidence shows product UI breakage.
- Treat DOM `\uFEFF` as snapshot noise because Slate can render zero-width DOM text for editable positioning while the editor/Yjs document value stays clean.
- Keep implementation scoped to operation encoding and proof scripts; no collaboration protocol redesign was needed.

Review fixes:
- `remove_text` now deletes across consecutive visible `Y.XmlText` siblings when Slate has normalized them into one logical text leaf.
- `move_node` and `merge_node` now consume virtual placeholders that used to continue exposing hidden targets.
- Virtual generated ids include the Y.Doc client id, so independent browser bundles do not collide on `slate-yjs-1`.
- Production and collaboration soak runners distinguish expected offline/browser/dev-overlay noise from product issues.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | --- | --- | --- |
| `create-goal-scratchpad.mjs` could not find repo root containing AGENTS.md in slate-v2 | 1 | Create manual plan using the required autogoal sections. | Manual plan created. |

Verification evidence:
- `bun test packages/slate-yjs/test/insert-fragment-contract.spec.ts` failed before fix: peer 0 retained `alphaLin fragment` when expected `alphaLin fragmen`; passes after fix.
- `bun test packages/slate-yjs/test/structural-soak-contract.spec.ts` failed before merge placeholder cleanup for seeds 75, 116, and 131; passes after fix.
- `bun test packages/slate-yjs/test/document-id-contract.spec.ts packages/slate-yjs/test/insert-fragment-contract.spec.ts packages/slate-yjs/test/structural-soak-contract.spec.ts packages/slate-yjs/test/merge-node-contract.spec.ts packages/slate-yjs/test/split-merge-contract.spec.ts packages/slate-yjs/test/unwrap-nodes-contract.spec.ts packages/slate-yjs/test/move-node-contract.spec.ts packages/slate-yjs/test/simple-operations-contract.spec.ts` passed: 60 pass, 0 fail.
- Old Hocuspocus issue replay windows passed with issues 0: `known-issues-all-seeds-1-20260610-1`, `known-issues-all-seeds-31-20260610-1`, `known-issues-all-seeds-41-20260610-1`, `known-issues-all-seeds-58-20260610-1`, `known-issues-all-seeds-68-20260610-1`, `known-issues-all-seeds-75-20260610-1`, `known-issues-all-seeds-85-20260610-1`, `known-issues-all-seeds-91-20260610-1`, `known-issues-all-seeds-99-20260610-1`, `known-issues-all-seeds-116-20260610-1`, `known-issues-all-seeds-131-20260610-1`.
- `PRODUCTION_SOAK_FAIL_ON_ISSUES=1 PRODUCTION_SOAK_RUN_ID=known-issues-final-production-20260610-1 bun ./scripts/proof/yjs-hocuspocus-production-soak.mjs` exited 0; summary reports actions 30, hard_reloads 2, browser_offline_windows 2, issues 0.
- `bunx biome check --write ...` passed.
- `bun --filter @slate/yjs typecheck` passed.
- `bun typecheck:site` passed.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
| --- | --- | --- | --- | --- |
| Completion audit | Final checker | Fix known Hocuspocus/Yjs issues under TDD | Real Hocuspocus exposed operation encoder bugs that local happy-path sync hid | Fixes landed and verified against focused contracts, old seed windows, and production-like soak |

Open risks:
- None known for the listed issue rows after focused replay windows and production-like soak. A fresh multi-hour soak can still be run as an endurance gate, but it is not required to prove the old recorded failures.
