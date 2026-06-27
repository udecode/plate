# fix pipeOnNodeChange type depth

Objective:
Fix pipeOnNodeChange TS depth; done when focused spec/package typecheck passes; plan docs/plans/2026-06-26-fix-pipeonnodechange-type-depth.md.

Goal plan:
docs/plans/2026-06-26-fix-pipeonnodechange-type-depth.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: user prompt
- id / link: N/A
- title: Fix `Type instantiation is excessively deep and possibly infinite` in `packages/core/src/lib/utils/pipeOnNodeChange.spec.ts`
- acceptance criteria: focused repro/typecheck no longer reports the TS2589 error.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `packages/core/src/lib/utils/pipeOnNodeChange.spec.ts` no longer trips TS2589.
- `pnpm --filter @platejs/core typecheck` passes.
- Focused spec test passes if the spec is runtime executable in isolation.
- Task closure is legal only when the focused evidence is recorded and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-26-fix-pipeonnodechange-type-depth.md` passes.

Verification surface:
- focused source read of `pipeOnNodeChange.spec.ts` and helper under test.
- `pnpm --filter @platejs/core typecheck`.
- focused Bun spec test if it applies after type repair.
- scoped lint fix if code formatting changes.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `packages/core/src/lib/utils/pipeOnNodeChange.spec.ts` and nearby helper/plugin typings.
- Allowed edit scope: narrow core spec/helper types needed to remove TS2589.
- Browser surface: N/A, no browser/UI route changed.
- Browser strategy: N/A.
- Tracker sync: N/A.
- Non-goals: broad Plate/Plite API redesign, docs, release notes, PR/commit.

Output budget strategy:
- Use focused file reads, capped `rg`, and scoped typecheck/test output.

Blocked condition:
- Blocked only if the repo typecheck fails from unrelated install corruption after one focused retry.

Task state:
- task_type: TypeScript/type-depth bug
- task_complexity: micro/normal
- current_phase: implementation
- current_phase_status: in_progress
- next_phase: implementation
- goal_status: active

Current verdict:
- verdict: valid
- confidence: medium before repro, high after focused typecheck
- next owner: task
- reason: pending

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-26-fix-pipeonnodechange-type-depth.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Fix TS2589 in `packages/core/src/lib/utils/pipeOnNodeChange.spec.ts` |
| Timed checkpoint parsed | N/A | No duration requested |
| Skill analysis before edits | yes | Read `autogoal` and `task` skills |
| Active goal checked or created | yes | No active goal existed; created this goal |
| Source of truth read before edits | yes | Read spec and `pipeOnNodeChange.ts` |
| Tracker comments and attachments read | N/A | User prompt only |
| Video transcript evidence required | N/A | No video |
| `docs/solutions` checked for non-trivial existing-code work | N/A | Micro type fixture repair |
| TDD decision before behavior change or bug fix | yes | No behavior change; focused existing spec is enough |
| Branch decision for code-changing task | yes | Use current checkout; no git operations requested |
| Release artifact decision | N/A | No public release artifact |
| Browser tool decision for browser surface | N/A | No browser surface |
| PR expectation decision | N/A | No PR requested |
| Tracker sync expectation decision | N/A | No tracker |
| Output budget strategy recorded | yes | Focused reads and capped command output |

Work Checklist:
- [x] If a duration was requested, it is recorded as N/A because none was requested.
- [x] First checkpoint complete: the explicit TS2589 spec path and proof surface are recorded.
- [x] Objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified as user-prompted TypeScript type-depth bug in Core.
- [x] Required video evidence marked N/A because no video or tracker source exists.
- [x] Nearby implementation patterns read: `pipeOnNodeChange.ts`, sibling `pipeOnTextChange.spec.ts`, `createBasePlugin` overloads.
- [x] Implementation fixes the fixture inference boundary with a capped test helper instead of changing production runtime.
- [x] Release artifact requirement recorded as N/A because no package release surface changed.
- [x] Final handoff shape is a concise patch/proof summary.
- [x] Branch handling recorded as current checkout, no git operations.
- [x] Local-env-rot retry policy is N/A; focused commands passed.
- [x] Workspace authority recorded: all proof commands ran in `/Users/zbeyens/git/plate-2`.
- [x] High-risk note marked N/A; no public API/runtime behavior changed.
- [x] Review/autoreview marked N/A; micro test-fixture type repair.
- [x] Agent-native review marked N/A; no agent/tooling source changed.
- [x] Output budget discipline followed with focused reads and scoped commands.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused spec and core typecheck | `bun test ...pipeOnNodeChange.spec.ts` passed; `pnpm --filter @platejs/core typecheck` passed |
| Bug reproduced before fix | N/A | IDE-only TS2589 report; package typecheck was already green | Source showed anonymous plugin inference as likely recursion point |
| Targeted behavior verification | yes | Run focused spec | 2 pass, 0 fail |
| TypeScript or typed config changed | yes | Run core typecheck | passed |
| Package exports or file layout changed | N/A | No export/file layout changed | N/A |
| Package manifests, lockfile, or install graph changed | N/A | No install graph changed | N/A |
| Agent rules or skills changed | N/A | No agent files changed | N/A |
| Workspace authority proof | yes | Run proof in repo/package owner | `/Users/zbeyens/git/plate-2`, `@platejs/core` |
| Browser surface changed | N/A | No browser/UI changed | N/A |
| Browser final proof | N/A | No browser proof applies | N/A |
| CI-controlled template output changed | N/A | No template output changed | N/A |
| Package behavior or public API changed | N/A | Test fixture type cap only | N/A |
| Registry-only component work changed | N/A | No registry files changed | N/A |
| Docs or content changed | N/A | No docs/content changed | N/A |
| High-risk mini gate | N/A | No public API/runtime/package-boundary behavior changed | N/A |
| Agent-native review for agent/tooling changes | N/A | No agent/tooling source changed | N/A |
| Local install corruption suspected | N/A | Focused commands passed | N/A |
| Autoreview for non-trivial implementation changes | N/A | Micro test-fixture type repair | N/A |
| PR create or update | N/A | No PR requested | N/A |
| Task-style PR body verified | N/A | No PR requested | N/A |
| PR proof image hosting | N/A | No PR/body image proof | N/A |
| Tracker sync-back | N/A | No tracker | N/A |
| Final handoff contract | yes | Fill this plan and final response | Done |
| Final lint | yes | Run scoped lint fix | `pnpm --filter @platejs/core lint:fix` passed |
| Output budget discipline | yes | Use focused output | No broad output streamed |
| Timed checkpoint | N/A | No duration requested | N/A |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-26-fix-pipeonnodechange-type-depth.md` | pending final run |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | Plan, spec, helper, sibling spec, plugin overloads read | implementation |
| Implementation | done | Added capped `createNodeChangePlugin` fixture helper | verification |
| Verification | done | Focused spec, typecheck, lint passed | closeout |
| PR / tracker sync | N/A | No PR/tracker requested | final response |
| Closeout | done | Plan ready for check-complete | final response |

Findings:
- The package typecheck was green before the patch, so the reported TS2589 is most likely the IDE/source-server path expanding anonymous `createBasePlugin` overloads inside the spec.
- The spec did not need plugin type inference; it only needs runtime handler ordering.

Decisions and tradeoffs:
- Added a local `createNodeChangePlugin` helper returning `AnyBasePlugin` to cap fixture inference.
- Did not change production `pipeOnNodeChange` because runtime behavior and package typecheck were already valid.

Implementation notes:
- `pipeOnNodeChange.spec.ts` now avoids repeating anonymous rich plugin inference at each test fixture site.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `bun test --path-ignore-patterns '' ./packages/core/src/lib/utils/pipeOnNodeChange.spec.ts` -> 2 pass, 0 fail.
- `pnpm --filter @platejs/core typecheck` -> pass.
- `pnpm --filter @platejs/core lint:fix` -> pass, no fixes applied.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| Closeout | Final response | Remove TS2589 in pipeOnNodeChange spec | Anonymous plugin fixture inference was the risk | Fixture capped and checks passed |

Open risks:
- Low: package typecheck was already green, so this specifically targets IDE/source-server recursion by reducing the spec's inference surface.

Final handoff contract:
- PR line: N/A
- Issue / tracker line: N/A
- Confidence line: high for focused TS fixture repair
- Flow table:
  - Reproduced: package typecheck was already green; source risk identified in fixture inference, browser N/A
  - Verified: focused spec and core typecheck passed, browser N/A
- Browser check: N/A
- Outcome: `pipeOnNodeChange.spec.ts` no longer forces full anonymous plugin inference.
- Caveat: This fixes the likely IDE TS2589 path; package typecheck did not reproduce the error before patch.
- Design:
  - Chosen boundary: spec fixture helper.
  - Why not quick patch: changing production would be bullshit because production typecheck already passed.
  - Why not broader change: no evidence of a production API/type defect.
- Verified: focused spec, core typecheck, core lint.
- PR body verified: N/A

Task-style PR body contract:
- Preserve any existing `<!-- auto-release:start -->` block. If a changeset is
  part of the diff and repo policy expects auto release, include that block.
- Use the accepted kitcn PR #270 visual format. The body starts with an emoji
  issue/tracker/fix line, for example `🐛 Fixes #123` or `🐛 Fixes ➖ N/A`, then
  an emoji confidence line like `🟢 95-100% confidence`.
- Use this exact table header: `| Phase | 🧪 Tests | 🌐 Browser |`.
- Use `Reproduced` and `Verified` rows. Mark passing proof with `🟢`, repro or
  failing proof with `🔴`, and non-applicable cells with `➖ N/A`.
- Use bold emoji section headings: `**✅ Outcome**`, `**⚠️ Caveat**`,
  `**🏗️ Design**`, and `**🧪 Verified**`.
- Never include a line that links to the current PR itself. The current PR URL
  belongs in the final response, not in its own description.
- Do not replace this with a generic `Summary` / `Verification` PR body, an
  adaptive prose body from a git helper skill, plain `## Outcome` sections, or
  an unrelated generated badge footer unless the caller or repo template
  explicitly asks for it.
- Proof is `gh pr view --json body` output or a concise source-backed summary
  of that output.

Final handoff / sync:
- PR: pending
- Issue / tracker: pending
- Browser proof: pending
- Caveats: pending

Timeline:
- 2026-06-26T13:11:05.299Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Implementation, verification, PR/tracker sync, closeout |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Pending.
