# fix-slate-react-dom-repair-policy

Objective:
Fix stable slate-react DOM repair policy failure at `packages/plite-react/test/dom-repair-policy-contract.test.ts:698` without regressing the Yjs cleanup.

Goal plan:
docs/plans/2026-06-11-fix-slate-react-dom-repair-policy.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: user request
- id / link: latest chat: "帮我修复"
- title: Fix slate-react DOM repair policy blocker
- acceptance criteria: failing slate-react test turns green; relevant slate-react contracts pass; `@slate/yjs` tests/typecheck remain green; full `bun check` passes; no commit/PR.

First checkpoint:
- Captured requirement: repair the stable `plite-react` Vitest failure blocking full `bun check`.
- Scope: `packages/plite-react/src/editable/dom-repair-queue.ts` and related tests.
- Non-goals: no Yjs refactor changes, no PR/commit/release, no broad input architecture rewrite.

Completion threshold:
- `native text repair advances captured virtualized target when DOM offset lags` passes.
- Related DOM repair, keyboard input, and selection reconciler contracts pass.
- `packages/plite-react` full Vitest passes.
- `@slate/yjs` tests and typecheck pass.
- Full `/Users/felixfeng/Desktop/repos/plite` `bun check` passes.
- Autoreview reports no accepted/actionable findings.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-11-fix-slate-react-dom-repair-policy.md` passes.

Verification surface:
- `bun test:vitest -- test/dom-repair-policy-contract.test.ts -t "native text repair advances captured virtualized target when DOM offset lags"`.
- `bun test:vitest -- test/dom-repair-policy-contract.test.ts test/keyboard-input-strategy-contract.test.ts test/selection-reconciler-contract.test.tsx`.
- `bun test:vitest` in `packages/plite-react`.
- `bun test ./packages/plite-yjs/test`.
- `bun --filter @slate/yjs typecheck`.
- `bun check`.
- Autoreview local mode.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless explicitly requested.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `/Users/felixfeng/Desktop/repos/plite/packages/plite-react/src/editable/dom-repair-queue.ts` and `packages/plite-react/test/dom-repair-policy-contract.test.ts`.
- Allowed edit scope: slate-react DOM repair policy code and this plan file.
- Browser surface: N/A: no runnable browser route changed; test-level DOM/JSDOM policy fix.
- Tracker sync: N/A: no issue/Linear/PR requested.
- Non-goals: no Yjs source edits, no release/publish, no PR.

Output budget strategy:
- Use focused `sed`/`rg`, single-test reproduction, related contract tests, then full gates. Keep command output capped.

Blocked condition:
- Stop only if the focused test cannot be reproduced, if the fix requires changing unrelated input architecture, or if a non-owned blocker remains after full gate.

Task state:
- task_type: bugfix
- task_complexity: normal
- current_phase: closeout
- current_phase_status: done
- next_phase: final response
- goal_status: ready to complete

Current verdict:
- verdict: fixed
- confidence: high
- next owner: none
- reason: focused red test is green and full `bun check` passes.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied and this plan passes the checker.
- Do not create hook state for this goal.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User asked to fix the stable `plite-react` DOM repair blocker. |
| Skill analysis before edits | yes | Used debug for root-cause investigation and autogoal for measurable closure. |
| Active goal checked or created | yes | `get_goal` returned none; created goal for this fix. |
| Source of truth read before edits | yes | Read failing test and `dom-repair-queue.ts` before editing. |
| Tracker comments and attachments read | no | N/A: no tracker. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: focused local failure with direct source/test authority. |
| TDD decision before behavior change or bug fix | yes | Reproduced failing focused test before patch. |
| Branch decision for code-changing task | no | N/A: no branch/commit/PR requested; no proactive git state check. |
| Release artifact decision | no | N/A: no release/publish. |
| Browser tool decision for browser surface | no | N/A: JSDOM contract test, no browser route. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker sync requested. |
| Output budget strategy recorded | yes | Focused reads/tests before full gate; capped output. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope boundary, timing constraint, stop condition, deliverable, final handoff section, verification surface, and success criterion is copied into this plan.
- [x] Short objective plus outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type, acceptance criteria, caveats, likely files/routes/packages, browser surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized `<video-transcripts>` XML, or marked N/A with reason. N/A: no video.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or N/A with reason. N/A: no release.
- [x] Final handoff shape decided: concise Chinese handoff with changed file and tests.
- [x] Branch handling recorded for code-changing work: N/A, no branch requested.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure: N/A, failure was deterministic source/test behavior.
- [x] Workspace authority recorded: all behavior proof ran in `/Users/felixfeng/Desktop/repos/plite`.
- [x] High-risk note recorded: DOM input ownership is sensitive; related contracts and full `plite-react` Vitest were run.
- [x] Review/autoreview target selected from actual diff state: local autoreview against `/Users/felixfeng/Desktop/repos/plite`.
- [x] Agent-native review decision recorded: N/A, no agent/tooling files changed except plan ledger.
- [x] Output budget discipline recorded and followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named tests/checks | Focused test, related tests, full slate-react Vitest, Yjs tests/typecheck, and `bun check` passed. |
| Bug reproduced before fix | yes | Record failing test/repro | Focused Vitest failed before fix at `dom-repair-policy-contract.test.ts:698`, expected false got true. |
| Targeted behavior verification | yes | Run focused test/proof | Focused test passed after patch. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A for TS config; `bun check` includes package typechecks and passed. |
| Package exports or file layout changed | no | Run `pnpm brl` if needed | N/A: no package exports/file layout changes. |
| Package manifests, lockfile, or install graph changed | no | Run install if needed | N/A: no manifest/lockfile changes. |
| Agent rules or skills changed | no | Run generated skill sync if needed | N/A: no agent/rule source edits. |
| Workspace authority proof | yes | Verify in owning workspace | All commands ran in `/Users/felixfeng/Desktop/repos/plite` except plan checker in `plate-copy`. |
| Browser surface changed | no | Browser proof or waiver | N/A: JSDOM test surface only. |
| Browser final proof | no | Screenshot/caveat | N/A. |
| CI-controlled template output changed | no | Restore or record | N/A. |
| Package behavior or public API changed | no | Changeset or N/A | N/A: internal behavior fix, no release requested. |
| Registry-only component work changed | no | Changelog or N/A | N/A. |
| Docs or content changed | yes | Verify source-backed claims | This plan is source-backed by command evidence; no user-facing docs changed. |
| High-risk mini gate | yes | Record failure mode and proof | Failure mode: captured native insert target path still owns DOM, but stale DOM offset prevented model selection advancement and DOM-current ownership release. Proof: related input/selection contracts and full check passed. |
| Agent-native review for agent/tooling changes | no | Run agent-native review or N/A | N/A. |
| Local install corruption suspected | no | Reinstall/rerun or N/A | N/A. |
| Autoreview for non-trivial implementation changes | yes | Run local autoreview | `autoreview clean: no accepted/actionable findings reported`. |
| PR create or update | no | Run check before PR | N/A: no PR requested. |
| Task-style PR body verified | no | Verify PR body | N/A. |
| PR proof image hosting | no | Host proof images | N/A. |
| Tracker sync-back | no | Post tracker sync | N/A. |
| Final handoff contract | yes | Fill final handoff fields | Filled below. |
| Final lint | yes | Run lint or equivalent | `bun check` includes `biome check . && eslint .`, passed. |
| Output budget discipline | yes | Verify no unbounded output | Used scoped reads and capped command outputs. |
| Goal plan complete | yes | Run plan checker | `[autogoal] complete: docs/plans/2026-06-11-fix-slate-react-dom-repair-policy.md`. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | Read failing test and DOM repair queue | complete |
| Implementation | done | Patched captured insert ownership condition | complete |
| Verification | done | Focused, related, package, Yjs, full check, autoreview passed | complete |
| PR / tracker sync | N/A | No PR/tracker requested | complete |
| Closeout | done | Ledger prepared | final response |

Findings:
- Root cause: `preferCapturedInsert` native input repair required the live DOM offset to match the captured target selection offset before moving the model selection.
- In virtualized DOM, the path can still be the captured target while the DOM offset lags one native mutation behind.
- Requiring offset equality left `preferModelSelectionForInputRef.current` stuck at `true` even though the captured insert correctly advanced the Plite model selection.

Decisions and tradeoffs:
- Fixed ownership at the DOM repair queue decision point, not in the test or selection controller.
- Captured inserts now treat same-path live DOM as target ownership; different path still prevents stealing selection from another DOM target.
- Did not broaden non-captured native input behavior.

Implementation notes:
- Changed `/Users/felixfeng/Desktop/repos/plite/packages/plite-react/src/editable/dom-repair-queue.ts` so `capturedInsertStillOwnsDOMTarget` depends on `targetPathStillOwnsDOMSelection`, not exact offset equality.

Review fixes:
- Autoreview reported no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Focused Vitest failed before fix | 1 | Trace ownership booleans in `dom-repair-queue.ts` | Fixed same-path captured insert ownership. |
| Autoreview Codex CLI config rejected `service_tier=priority` | 1 | Use temporary wrapper with `-c service_tier="fast"` | Autoreview ran clean; global config unchanged. |

Verification evidence:
- `/Users/felixfeng/Desktop/repos/plite/packages/plite-react`: focused failing test -> 1 passed, 18 skipped.
- `/Users/felixfeng/Desktop/repos/plite/packages/plite-react`: related contracts -> 58 passed.
- `/Users/felixfeng/Desktop/repos/plite/packages/plite-react`: `bun test:vitest` -> 57 files passed, 662 tests passed.
- `/Users/felixfeng/Desktop/repos/plite`: `bun test ./packages/plite-yjs/test` -> 187 pass.
- `/Users/felixfeng/Desktop/repos/plite`: `bun --filter @slate/yjs typecheck` -> pass.
- `/Users/felixfeng/Desktop/repos/plite`: `bun check` -> pass.
- `/Users/felixfeng/Desktop/repos/plite`: autoreview local -> clean, no accepted/actionable findings.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker requested.
- Confidence line: high.
- Flow table:
  - Reproduced: focused slate-react Vitest failed before patch.
  - Verified: focused, related, full slate-react, Yjs, and full repo gates passed.
- Browser check: N/A, JSDOM contract test only.
- Outcome: full `bun check` is green.
- Caveat: none.
- Design:
  - Chosen boundary: DOM repair queue captured insert ownership.
  - Why not quick patch: flipping the test expectation would hide a real stale-offset bug.
  - Why not broader change: selection controller and model input strategy were not the source.
- Verified: command list above.
- PR body verified: N/A.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: none.

Timeline:
- 2026-06-11T14:36:22.348Z Task goal plan created.
- 2026-06-11T14:36Z Focused failing test reproduced.
- 2026-06-11T14:37Z Patched DOM repair captured insert ownership.
- 2026-06-11T14:38Z Full `bun check` passed.
- 2026-06-11T14:44Z Autoreview completed clean.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run plan checker, close goal, final response |
| What is the goal? | Fix slate-react DOM repair policy blocker and keep Yjs gates green |
| What have I learned? | Same-path captured native inserts must survive stale DOM offsets; different-path DOM still wins |
| What have I done? | Fixed ownership condition and proved full repo gate passes |

Open risks:
- None known.
