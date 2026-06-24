# Yjs Awareness Reconnect Cursor

Objective:
Fix the Hocuspocus awareness reconnect remote cursor regression; done when a failing-first regression and focused Hocuspocus awareness soak pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-06-13-yjs-awareness-reconnect-cursor.md

Primary template:
manual task plan, because the autogoal helper requires an AGENTS.md repo root and slate-v2 has none.

Applied packs:
- browser
- package-api

Requirements:
- Reproduce the reported bug on `http://localhost:3100/examples/yjs-hocuspocus?room=awareness-repro-1`.
- Use TDD: add a regression that fails before implementation.
- Preserve the scope: this is an awareness / remote cursor reconnect bug, not a content sync bug.
- Expected behavior: Peer A Select makes other peers show Peer A remote cursor text containing `101:0`.
- Expected behavior: Peer A Offline removes Peer A remote cursor from other peers.
- Expected behavior: Peer A Online followed by Select makes other peers show valid Peer A remote cursor text again.
- The old bad text shape is `202:null | 303:null | 404:null | 303:null | 404:null | 202:null | 404:null | 202:null | 303:null`.
- Use the provided soak command shape with `SOAK_FAIL_ON_ISSUES=1`.
- Do not run git state checks unless explicitly requested.
- Do not commit, push, or open PR.

Completion threshold:
- RED: a focused awareness reconnect regression fails before the fix with missing/empty remote cursor selection or label after reconnect.
- GREEN: the same regression passes.
- Browser/provider proof: the focused Hocuspocus awareness soak passes with `SOAK_FAIL_ON_ISSUES=1`.
- Type/lint proof covers modified package/example files.
- Completion checker is attempted; it may be N/A because slate-v2 has no AGENTS.md root for the shared autogoal script.

Verification surface:
- `packages/slate-yjs/test/**` for package-level behavior.
- `site/examples/ts/yjs-hocuspocus.tsx` only if the example owns the bug.
- `scripts/proof/yjs-collaboration-soak.mjs` and `test-results/yjs-collaboration-soak/**` for browser/provider proof.

Constraints:
- Fix the real ownership boundary, not a runner-only mask.
- Keep the raw webhook/provider room behavior untouched unless evidence proves the example integration is at fault.
- Do not broaden into unrelated structural Yjs bugs.
- Do not claim done from package tests alone; this bug was found on real Hocuspocus.

Boundaries:
- Allowed: `packages/slate-yjs/**`, `site/examples/ts/yjs-hocuspocus.tsx`, `scripts/proof/**`, `docs/plans/**`.
- Avoid: release, publish, changeset, PR, unrelated Plate files.

Blocked condition:
- Stop only if local Hocuspocus/browser infrastructure cannot run after three distinct attempts, or if the fix requires a public API decision that cannot be inferred from current `@slate/yjs` contracts.

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| User requirements extracted | yes | Listed above from the latest user prompt and prior reproduction. |
| Existing goal checked | yes | `get_goal` returned no active goal before `create_goal`. |
| Active goal created | yes | Goal objective names this plan and focused pass threshold. |
| Reproduction confirmed | yes | `SOAK_RUN_ID=awareness-repro` failed with `awareness-missing-after-reconnect`. |
| TDD skill read | yes | Read `/Users/felixfeng/Desktop/repos/plate-copy/.agents/skills/tdd/SKILL.md`. |

Work Checklist:
- [x] Reproduce current bug.
- [x] RED: add focused awareness reconnect regression.
- [x] Confirm regression fails for the reported reason.
- [x] Fix awareness reconnect ownership boundary.
- [x] GREEN: run focused regression.
- [x] Run focused Hocuspocus awareness soak with fail-on-issues.
- [x] Run relevant type/lint checks.
- [x] Review changed code for scope/correctness.
- [x] Run completion checker.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| TDD red proof | yes | Record failing test command/output before fix. | `bun test packages/slate-yjs/test/provider-contract.spec.ts` failed before fix: after `yjs.connect(); yjs.sendSelection(range, { name: 'Ada' })`, Peer B `remoteCursors()` was `[]` instead of client `101` with data and selection. |
| Focused regression | yes | Same test passes after fix. | `bun test packages/slate-yjs/test/provider-contract.spec.ts` passed: 31 pass, 0 fail. |
| Hocuspocus soak | yes | Provided awareness command shape passes with `SOAK_FAIL_ON_ISSUES=1`. | `SOAK_RUN_ID=awareness-repro-after-fix ... bun scripts/proof/yjs-collaboration-soak.mjs` exited 0; summary reports actions 79, awareness 1, issues 0. |
| Type/lint | yes | Run owning package/example check. | `bun test ./packages/slate-yjs/test` passed: 213 pass, 0 fail; `bun --filter @slate/yjs typecheck` passed; `bunx biome check --write ...` passed. |
| Review | yes | Manual review for overreach and missing behavior coverage. | Autoreview helper was blocked by local Codex config `service_tier=priority`; manual review accepted the narrow lifecycle fix and rejected no findings. |
| Goal plan complete | N/A | Run autogoal checker after evidence is recorded. | Shared checker failed before reading this plan because slate-v2 has no AGENTS.md root; recorded as tool limitation, not product blocker. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Reproduce | complete | `test-results/yjs-collaboration-soak/awareness-repro/summary.md` shows one issue. | Write RED test. |
| TDD fix | complete | RED provider contract failed, then passed after clearing local awareness selection on provider disconnect. | Done. |
| Browser proof | complete | `test-results/yjs-collaboration-soak/awareness-repro-after-fix/summary.md` reports issues 0. | Done. |
| Completion audit | complete | Package tests, typecheck, Biome, manual review, checker limitation recorded. | Done. |

Verification evidence:
- 2026-06-13: `SOAK_BASE_URL=http://localhost:3100 SOAK_URL=http://localhost:3100/examples/yjs-hocuspocus SOAK_START_SERVER=0 SOAK_MS=90000 SOAK_ACTION_DELAY_MS=1000 SOAK_HEADLESS=1 SOAK_FAIL_ON_ISSUES=1 SOAK_RUN_ID=awareness-repro bun scripts/proof/yjs-collaboration-soak.mjs` exited 1; summary reports `awareness-missing-after-reconnect` and `reselectedCursorTexts` all `*:null`.
- 2026-06-13 RED: `bun test packages/slate-yjs/test/provider-contract.spec.ts` failed with Peer B `remoteCursors()` equal to `[]` after Peer A reconnect and same selection resend.
- 2026-06-13 fix: provider lifecycle passes the connected boolean to the controller; the controller clears local awareness selection when the provider disconnects, preserving cursor data and forcing the next same selection to rebroadcast.
- 2026-06-13 GREEN focused: `bun test packages/slate-yjs/test/provider-contract.spec.ts` passed: 31 pass, 0 fail.
- 2026-06-13 package proof: `bun test packages/slate-yjs/test/awareness-contract.spec.ts packages/slate-yjs/test/provider-contract.spec.ts` passed: 42 pass, 0 fail.
- 2026-06-13 browser/provider proof: `SOAK_BASE_URL=http://localhost:3100 SOAK_URL=http://localhost:3100/examples/yjs-hocuspocus SOAK_START_SERVER=0 SOAK_MS=90000 SOAK_ACTION_DELAY_MS=1000 SOAK_HEADLESS=1 SOAK_FAIL_ON_ISSUES=1 SOAK_RUN_ID=awareness-repro-after-fix bun scripts/proof/yjs-collaboration-soak.mjs` exited 0; summary reports issues 0.
- 2026-06-13 package suite: `bun test ./packages/slate-yjs/test` passed: 213 pass, 0 fail.
- 2026-06-13 formatting/typecheck: `bunx biome check --write packages/slate-yjs/src/core/controller.ts packages/slate-yjs/src/core/provider-lifecycle-adapter.ts packages/slate-yjs/test/provider-contract.spec.ts` passed; `bun --filter @slate/yjs typecheck` passed.
- 2026-06-13 review: `/Users/felixfeng/Desktop/repos/plate-copy/.agents/skills/autoreview/scripts/autoreview --mode local ...` failed before review because local Codex config has unknown `service_tier=priority`; manual review found no accepted findings.
- 2026-06-13 checker: `node /Users/felixfeng/Desktop/repos/plate-copy/.agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-13-yjs-awareness-reconnect-cursor.md` failed before plan read because slate-v2 has no AGENTS.md repo root.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
| --- | --- | --- | --- | --- |
| Completion audit | Final handoff | Fix the Hocuspocus awareness reconnect cursor regression with TDD | Same awareness payloads were skipped after reconnect because local selection stayed equal; clearing presence selection on disconnect makes the next same select rebroadcast | RED/GREEN test, real Hocuspocus soak, package suite, typecheck, and review pass are complete |

Open risks:
- None known for this bug after focused package and Hocuspocus proof. The shared autogoal checker cannot validate this plan because slate-v2 has no AGENTS.md root.
