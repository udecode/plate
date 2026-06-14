# Yjs Hocuspocus Known Issues Fix

Objective:
Fix all known Hocuspocus/Yjs collaboration issues from the recorded Slate v2 soak summaries using TDD, then prove the fixes on focused package tests, old Hocuspocus seed windows, and a production-like Hocuspocus network soak.

Completion threshold:
- Known issues from `/Users/felixfeng/Desktop/repos/slate-v2/test-results/yjs-collaboration-soak/hocuspocus-3h-20260609-231052/summary.md` are mapped to root-cause classes.
- Focused RED tests fail before implementation and pass after implementation.
- Old failing Hocuspocus seed windows pass with `issues: 0`.
- Production-like Hocuspocus soak passes with `PRODUCTION_SOAK_FAIL_ON_ISSUES=1`.
- Modified TypeScript is formatted and typechecked.

Verification surface:
- `/Users/felixfeng/Desktop/repos/slate-v2/packages/slate-yjs/test/**`
- `/Users/felixfeng/Desktop/repos/slate-v2/packages/slate-yjs/src/core/**`
- `/Users/felixfeng/Desktop/repos/slate-v2/site/examples/ts/yjs-hocuspocus.tsx`
- `/Users/felixfeng/Desktop/repos/slate-v2/scripts/proof/**`
- `/Users/felixfeng/Desktop/repos/slate-v2/test-results/yjs-*`

Constraints:
- Use TDD for product bugs.
- Treat browser offline console noise, Next dev overlay click interception, and Slate DOM zero-width text as harness issues unless document data diverges.
- Do not change public collaboration protocol details.
- Do not commit, push, or open a PR.

Boundaries:
- Implementation lives in sibling repo `/Users/felixfeng/Desktop/repos/slate-v2`.
- This file is the control-plane autogoal completion record for the `plate-copy` thread.
- No unrelated Plate source files are in scope.

Blocked condition:
- None. The Slate v2 checker helper cannot run inside `slate-v2` because that checkout has no `AGENTS.md`; this control-plane plan exists so the autogoal checker can run from `plate-copy`.

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Requirements extracted | yes | User requested autogoal, TDD, all known issues, including the 3h Hocuspocus summary. |
| Known summary read | yes | Old summary had 17 issues: non-convergence, path/page errors, awareness suspect, and harness noise. |
| TDD path selected | yes | Package contracts and Hocuspocus seed replays were used as the proof surfaces. |

Work Checklist:
- [x] Read known Hocuspocus summary and dedupe issue classes.
- [x] Add focused RED coverage for text-boundary deletion.
- [x] Add focused RED coverage for virtual merge placeholder leakage.
- [x] Fix generated virtual id collision across browser bundles.
- [x] Fix cross-boundary `remove_text` projection.
- [x] Fix virtual unwrap, move, and merge placeholder cleanup.
- [x] Fix harness noise for Next dev overlay, expected offline errors, and DOM `\uFEFF`.
- [x] Rerun old failing Hocuspocus seed windows.
- [x] Run production-like Hocuspocus soak.
- [x] Run package/site typecheck and Biome.

Completion Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| TDD red proof | yes | `insert-fragment-contract` failed before the `remove_text` fix; `structural-soak-contract` failed before merge placeholder cleanup for seeds 75, 116, and 131. |
| Focused tests | yes | Focused package command passed: 60 pass, 0 fail. |
| Old issue coverage | yes | Seed windows 1, 31, 41, 58, 68, 75, 85, 91, 99, 116, and 131 passed with `issues: 0`. |
| Production soak | yes | `known-issues-final-production-20260610-1` passed with actions 30, hard reloads 2, browser offline windows 2, issues 0. |
| Typecheck and format | yes | `bunx biome check --write ...`, `bun --filter @slate/yjs typecheck`, and `bun typecheck:site` passed. |
| Autogoal checker | yes | This control-plane plan is checked from `plate-copy` after final evidence is recorded. |

Phase / pass table:
| Phase | Status | Evidence |
| --- | --- | --- |
| Scope | complete | Known summary and user requirements captured. |
| RED tests | complete | Text-boundary and merge-placeholder regressions failed before fixes. |
| Fixes | complete | Operation encoder and harness fixes implemented in `slate-v2`. |
| Browser proof | complete | Old Hocuspocus seed windows and production-like soak passed. |
| Final audit | complete | Format, package typecheck, site typecheck, and focused tests passed. |

Verification evidence:
- `bun test packages/slate-yjs/test/document-id-contract.spec.ts packages/slate-yjs/test/insert-fragment-contract.spec.ts packages/slate-yjs/test/structural-soak-contract.spec.ts packages/slate-yjs/test/merge-node-contract.spec.ts packages/slate-yjs/test/split-merge-contract.spec.ts packages/slate-yjs/test/unwrap-nodes-contract.spec.ts packages/slate-yjs/test/move-node-contract.spec.ts packages/slate-yjs/test/simple-operations-contract.spec.ts` passed: 60 pass, 0 fail.
- Old Hocuspocus replay windows passed with `issues: 0`: `known-issues-all-seeds-1-20260610-1`, `known-issues-all-seeds-31-20260610-1`, `known-issues-all-seeds-41-20260610-1`, `known-issues-all-seeds-58-20260610-1`, `known-issues-all-seeds-68-20260610-1`, `known-issues-all-seeds-75-20260610-1`, `known-issues-all-seeds-85-20260610-1`, `known-issues-all-seeds-91-20260610-1`, `known-issues-all-seeds-99-20260610-1`, `known-issues-all-seeds-116-20260610-1`, `known-issues-all-seeds-131-20260610-1`.
- `PRODUCTION_SOAK_FAIL_ON_ISSUES=1 PRODUCTION_SOAK_RUN_ID=known-issues-final-production-20260610-1 bun ./scripts/proof/yjs-hocuspocus-production-soak.mjs` exited 0 and reported issues 0.
- `bunx biome check --write ...` passed.
- `bun --filter @slate/yjs typecheck` passed.
- `bun typecheck:site` passed.

Reboot status:
The known Hocuspocus issue rows are fixed or classified as harness noise, and the current state is ready for a longer endurance soak if desired.

Open risks:
None known for the recorded issue rows. A new multi-hour soak can still find new intermittent cases, but it is not needed to close this known-issue batch.
