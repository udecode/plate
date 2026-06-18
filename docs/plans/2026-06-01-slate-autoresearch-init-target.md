# slate autoresearch init target

Objective:
Add Slate Autoresearch target initialization and document quality-gap/finalization
flows; done when generated skill mirrors and target commands verify.

Goal plan:
docs/plans/2026-06-01-slate-autoresearch-init-target.md

Completion threshold:
- `pnpm slate:ar:setup-target -- <target-id>` remains read-only setup-plan.
- `pnpm slate:ar:init-target -- <target-id>` runs real Autoresearch setup.
- `slate-autoresearch` covers quality-gap loops and finalization mode.
- Generated `.agents/skills/**` and `.claude/skills/**` mirrors are synced.
- Verification commands below pass or have an explicit tool-crash caveat.

Verification surface:
- `pnpm install`
- `node --check tooling/scripts/bench-targets.mjs`
- `node --check tooling/scripts/slate-autoresearch.mjs`
- `pnpm bench:targets:check`
- `pnpm bench:targets:report:check`
- `pnpm bench:targets:dry-run -- react-active-typing-breakdown`
- `pnpm slate:ar:setup-target -- react-active-typing-breakdown`
- `pnpm slate:ar:init-target -- react-active-typing-breakdown`
- `pnpm slate:ar:prompt-plan -- --prompt "Slate pagination perf target"`
- `pnpm slate:ar:finalize-preview`
- `rg` audit for generated skill mirrors
- `git diff --check`

Constraints:
- Edit `.agents/rules/slate-autoresearch.mdc`, not generated `SKILL.md`.
- Keep `Plate repo root` as the Slate target workspace.
- Do not commit, push, branch-finalize, or create PRs.
- Keep `setup-target` safe/read-only; real mutation belongs to `init-target`.

Boundaries:
- Source of truth: `.agents/rules/slate-autoresearch.mdc`,
  `tooling/scripts/bench-targets.mjs`, `tooling/scripts/slate-autoresearch.mjs`,
  `package.json`, and `benchmarks/targets/README.md`.
- Allowed edit scope: Slate Autoresearch command/rule/docs support only.
- Browser surface: N/A; this is CLI/agent workflow.
- Tracker sync: N/A; no issue/PR requested.
- Non-goals: no pagination runtime changes, benchmark tuning, or PR branch work.

Blocked condition:
Blocked only if the local `../codex-autoresearch` CLI is missing or rejects
real setup for registered Slate targets.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Read `slate-autoresearch` and `autogoal` skills. |
| Active goal checked or created | yes | Created active goal for init/finalization/quality-gap contract. |
| Source of truth read before edits | yes | Read rule, package scripts, target helper, target README, and AR CLI help. |
| Agent-native source/mirror boundary | yes | Edited `.agents/rules/slate-autoresearch.mdc`, then ran `pnpm install`. |
| Browser tool decision | no | N/A: no browser behavior changed. |

Work Checklist:
- [x] Added `pnpm slate:ar:init-target -- <target-id>` for real setup.
- [x] Kept `pnpm slate:ar:setup-target -- <target-id>` read-only.
- [x] Added `pnpm slate:ar:setup-plan-target` as the explicit read-only alias.
- [x] Added root Slate AR wrapper that strips pnpm's `--` separator and injects
      `Plate repo root`.
- [x] Added quality-gap, research, and finalization package shortcuts.
- [x] Documented quality-gap mode and `quality_gap=0` semantics.
- [x] Documented finalization mode, evidence filtering, warnings, and approval
      boundaries.
- [x] Synced generated skill mirrors with `pnpm install`.
- [x] Restored active `Plate repo root` Autoresearch config to
      `react-active-typing-breakdown` after smoke quality-gap setup.
- [x] Recorded Biome stack overflow as a tooling caveat.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run command surface and sync checks | Verification evidence below. |
| Agent rules or skills changed | yes | Run `pnpm install` and audit mirrors | `pnpm install`; `rg` mirror audit passed. |
| Package scripts changed | yes | Parse package and verify commands | `node -e JSON.parse(...)`; command smoke tests passed. |
| JS tooling changed | yes | Syntax check scripts | `node --check` passed for both scripts. |
| Target registry command contract | yes | Check target registry and dry-run setup | `bench:targets:check`, `report:check`, `dry-run` passed. |
| Browser surface changed | no | N/A | CLI-only workflow. |
| Final lint | partial | Run scoped Biome or record crash | Biome 2.3.6 stack-overflowed even on edited JS; syntax and diff checks passed. |
| Goal plan complete | yes | Run autogoal completion check | `check-complete.mjs` passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Read relevant skills, scripts, docs, CLI help | implementation |
| Implementation | completed | Patched rule, scripts, package commands, README | verification |
| Verification | completed | Commands listed below | closeout |
| Closeout | completed | Plan filled, goal ready to close | final response |

Verification evidence:
- `pnpm install` synced generated skills.
- `node --check tooling/scripts/bench-targets.mjs` passed.
- `node --check tooling/scripts/slate-autoresearch.mjs` passed.
- `pnpm bench:targets:check` passed with 23 targets.
- `pnpm bench:targets:report:check` passed.
- `pnpm bench:targets:dry-run -- react-active-typing-breakdown` passed.
- `pnpm slate:ar:setup-target -- react-active-typing-breakdown` returned
  setup-plan JSON and `setup-plan is read-only`.
- `pnpm slate:ar:init-target -- react-active-typing-breakdown` created/kept
  real Autoresearch session files and initialized `typing_seconds`.
- `pnpm slate:ar:state` reports `react-active-typing-breakdown` and
  `typing_seconds`.
- `pnpm slate:ar:prompt-plan -- --prompt "Slate pagination perf target"`
  proved the wrapper strips pnpm's `--` separator.
- `pnpm slate:ar:finalize-preview` now prints compact output and reports blocked
  finalization warnings without dumping thousands of files.
- `rg` audit found quality-gap/finalization/init-target text in source and both
  generated mirrors.
- Agent-native review found the action surface discoverable: package scripts,
  source rule, generated skill mirror, and target README all expose the new
  commands.
- `git diff --check` passed.
- Caveat: `pnpm exec biome check ... --fix` crashed with a Biome 2.3.6 stack
  overflow, including when scoped to the edited JS files.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response |
| What is the goal? | Slate Autoresearch init/quality-gap/finalization command contract |
| What have I learned? | Direct AR shortcuts need a wrapper to strip pnpm's `--`; raw finalization preview is too noisy for agent use. |
| What have I done? | Implemented commands, docs, wrapper, generated mirror sync, and command verification. |

Open risks:
- Biome stack overflow blocks lint confirmation for the edited JS files. Syntax,
  JSON parsing, command smoke tests, generated sync, and whitespace checks pass.
