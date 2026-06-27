# make check core catch spec types

Objective:
Make `check:core` catch the Core spec type error class that hid the
`pipeOnNodeChange` TS2589/source-server failure.

Goal plan:
docs/plans/2026-06-26-make-check-core-catch-spec-types.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Task source:
- type: user prompt
- title: was it not caught by check:core ?? fix
- acceptance criteria: explain why `check:core` missed the issue, patch the
  check so it catches the selected Core spec type failure, and prove
  `pnpm check:core` passes.

First checkpoint:
- Explicit prompt requirements captured: answer whether `check:core` caught it,
  fix the gate, keep work local, no commit, no PR.

Timed checkpoint:
- requested duration: none
- semantics: not a timed run
- initial confidence score: 0.65, because root cause was likely excluded specs
- final score / loop closure: 0.95 after `pnpm check:core` passed with the new
  spec typecheck lane

Completion threshold:
- `check:core` runs a TypeScript check for the Core lifecycle handler specs that
  produced the hidden IDE error.
- `pipeOnNodeChange.spec.ts` and sibling lifecycle fixture typing no longer
  trigger TS2589.
- `pnpm check:core` passes.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-26-make-check-core-catch-spec-types.md` passes.

Verification surface:
- `pnpm exec tsc -p packages/core/tsconfig.spec.json --noEmit --pretty false`
- `pnpm check:core`
- autogoal plan completeness check

Constraints:
- Preserve runtime behavior.
- Do not broaden into a full historic Core spec typing cleanup.
- Do not change production plugin types just to satisfy loose test fixtures.
- Do not commit or push.

Boundaries:
- Source of truth: `tooling/scripts/check-core.mjs`, Core lifecycle spec files,
  and `packages/core/tsconfig.spec.json`.
- Allowed edit scope: Core check script, Core spec tsconfig, and affected Core
  lifecycle spec fixtures.
- Browser surface: none.
- Browser strategy: no browser path; this is package tooling/typecheck work.
- Tracker sync: none.
- Non-goals: full React/static Core spec typecheck cleanup, broad type-system
  redesign, production API changes.

Output budget strategy:
- Command output capped in shell calls. Broad all-spec failures were summarized
  by error class instead of pasted into handoff.

Blocked condition:
- Block only if TypeScript compiler crash prevents even the targeted lifecycle
  spec gate; not hit.

Task state:
- task_type: tooling/test-gate repair
- task_complexity: medium
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready to complete

Current verdict:
- verdict: fixed
- confidence: 0.95
- next owner: none
- reason: `check:core` now includes a lifecycle spec typecheck and the full lane
  passes.

Completion rule:
- Completion is legal because every required checklist item is checked, every
  completion gate below is resolved, and the goal plan check is run.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Requirement copied into this plan before closeout |
| Timed checkpoint parsed | no | No duration requested |
| Skill analysis before edits | yes | `autogoal` and `task` skills loaded before work |
| Active goal checked or created | yes | Active goal created for this plan |
| Source of truth read before edits | yes | Read `check-core.mjs`, Core tsconfig, test tsconfig, global test declarations |
| Tracker comments and attachments read | no | No tracker target |
| Video transcript evidence required | no | No video input |
| `docs/solutions` checked for non-trivial existing-code work | no | Tooling gate repair; no solution doc needed |
| TDD decision before behavior change or bug fix | yes | No runtime behavior change; type gate plus fixture typing only |
| Branch decision for code-changing task | yes | Current checkout only; no branch requested |
| Release artifact decision | yes | No changeset; internal check/test fixture work |
| Browser tool decision for browser surface | yes | No browser surface |
| PR expectation decision | yes | No PR requested |
| Tracker sync expectation decision | yes | No tracker sync |
| Output budget strategy recorded | yes | Capped command output and summarized broad debt |

Work Checklist:
- [x] Duration handling recorded as not requested.
- [x] First checkpoint complete: prompt requirement, scope, stop condition, and
      verification are copied into this plan.
- [x] Objective, outcome, threshold, verification, constraints, boundaries, and
      blocked condition are concrete.
- [x] Task source classified with acceptance criteria and likely files.
- [x] Video evidence marked not applicable.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the check ownership boundary: `check:core` now runs
      a Core spec typecheck.
- [x] Release artifact requirement recorded as not applicable.
- [x] Final handoff shape decided: concise answer with changed files and proof.
- [x] Branch handling recorded as current checkout only.
- [x] Local-env-rot retry policy recorded as not needed; failure was real check
      coverage, not install corruption.
- [x] Workspace authority recorded: proof commands run in
      `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded: broader all-Core spec typecheck exposed old
      unrelated fixture debt and a TypeScript 6 broad-project crash, so this
      patch gates the selected lifecycle spec class first.
- [x] Review/autoreview target selected as not needed for this narrow tooling
      and fixture patch.
- [x] Agent-native review decision recorded as not applicable; no agent rules or
      skills changed.
- [x] Output budget discipline recorded and followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused spec typecheck and `check:core` | Passed |
| Bug reproduced before fix | yes | Show `check:core` previously passed without spec typecheck and focused spec typecheck reproduced TS2589 | Pre-fix `check:core` passed; focused spec typecheck failed before fixture cap |
| Targeted behavior verification | yes | Run focused typecheck | `pnpm exec tsc -p packages/core/tsconfig.spec.json --noEmit --pretty false` passed |
| TypeScript or typed config changed | yes | Run relevant typecheck | Focused spec typecheck and `pnpm check:core` passed |
| Package exports or file layout changed | no | No public exports or barrels changed | Not applicable |
| Package manifests, lockfile, or install graph changed | no | No install graph changed | Not applicable |
| Agent rules or skills changed | no | No generated skill sync needed | Not applicable |
| Workspace authority proof | yes | Run verification in repo root | `pnpm check:core` passed in `/Users/zbeyens/git/plate-2` |
| Browser surface changed | no | No browser proof | Not applicable |
| Browser final proof | no | No browser proof | Not applicable |
| CI-controlled template output changed | no | No templates changed | Not applicable |
| Package behavior or public API changed | no | No changeset | Not applicable |
| Registry-only component work changed | no | No registry changelog | Not applicable |
| Docs or content changed | no | Plan only | Not applicable |
| High-risk mini gate | yes | Record failure mode and boundary | Full all-Core spec typecheck remains separate debt; targeted lifecycle gate fixes this miss without broad casts |
| Agent-native review for agent/tooling changes | no | No agent tooling changed | Not applicable |
| Local install corruption suspected | no | No reinstall | Not applicable |
| Autoreview for non-trivial implementation changes | no | Narrow check repair; full `check:core` is the proof gate | Not applicable |
| PR create or update | no | No PR requested | Not applicable |
| Task-style PR body verified | no | No PR | Not applicable |
| PR proof image hosting | no | No PR image | Not applicable |
| Tracker sync-back | no | No tracker | Not applicable |
| Final handoff contract | yes | Include cause, changed files, proof, and caveat | Ready |
| Final lint | yes | Covered by `pnpm check:core` Core/Plite lint steps | Passed |
| Output budget discipline | yes | Avoid unbounded handoff output | Done |
| Timed checkpoint | no | No duration requested | Not applicable |
| Goal plan complete | yes | Run check-complete | Ready |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read check script and tsconfigs | implementation |
| Implementation | complete | Added Core spec tsconfig and check script step; capped fixture inference | verification |
| Verification | complete | Focused spec typecheck and `pnpm check:core` passed | closeout |
| PR / tracker sync | complete | Not requested | final response |
| Closeout | complete | Plan ready for check-complete | final response |

Findings:
- `check:core` missed the IDE/source-server error because `packages/core/tsconfig.json`
  excludes `*.spec.*`, and Bun executes specs without running TypeScript over
  those spec source files.
- A broad all-Core spec typecheck currently exposes unrelated legacy spec
  fixture typing and TS 6 project crash debt. This patch intentionally gates the
  lifecycle handler specs that produced the miss instead of burying the backlog
  under casts.

Decisions and tradeoffs:
- Add `packages/core/tsconfig.spec.json` as the check-owned spec type gate.
- Wire it into `tooling/scripts/check-core.mjs`.
- Cap `createBasePlugin` inference at the test fixture helper boundary for
  `pipeOnNodeChange` and `pipeOnTextChange`; runtime still uses the real
  `createBasePlugin`.

Implementation notes:
- `check-core.mjs` now runs `pnpm exec tsc -p packages/core/tsconfig.spec.json --noEmit`.
- `tsconfig.spec.json` uses Bun globals, source aliases needed by the checked
  specs, modern JSX mode, and relaxed `strictFunctionTypes` for plugin handler
  fixtures.

Review fixes:
- Fixed formatter failure in `pipeOnTextChange.spec.ts`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad all-spec typecheck produced unrelated fixture debt | 1 | Scope to lifecycle spec class | Done |
| Root tsconfig broad project hit TypeScript 6 debug failure | 1 | Avoid root broad project for this gate | Done |
| Helper still triggered TS2589 through generic overload | 2 | Call `createBasePlugin` via fixture-level `any` wrapper | Done |
| Formatting failed in `check:core` | 1 | Manual format patch | Done |

Verification evidence:
- `pnpm exec tsc -p packages/core/tsconfig.spec.json --noEmit --pretty false`
  passed.
- `pnpm check:core` passed.

Reboot status:
- current: complete; no resume needed.
- next command if reopened: `pnpm check:core`.

Open risks:
- Broad all-Core spec typecheck is still not green and should be treated as a
  separate cleanup lane, not as part of this lifecycle handler gate repair.

Final handoff contract:
- PR line: no PR.
- Issue line: no issue.
- Confidence: 0.95.
- Tests: focused Core spec typecheck and full `check:core`.
- Browser: not applicable.
- Outcome: fixed gate coverage for the missed lifecycle spec type error.
- Caveat: broad all-Core spec typecheck remains separate cleanup debt.
