# sync-shadcn skill

Objective:
Create a repo-local `sync-shadcn` skill and durable
`docs/sync/shadcn` tracking area so future agents can compare
`../shadcn/apps/v4` against `apps/www`, track the exact upstream commit Plate is
synced to, inventory every upstream added/modified/deleted docs-app change, and
plan what to adopt, exclude, fork, or smart-merge before implementation.

Goal plan:
docs/plans/2026-05-28-sync-shadcn-skill.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native
- docs

Task source:
- type: user request
- id / link: local chat request
- title: create comprehensive sync-shadcn skill
- acceptance criteria: create a skill that tracks upstream shadcn commit
  baseline, uses `../shadcn`, stores durable state under `docs/sync/shadcn`,
  plans added/updated/deleted upstream changes, and recommends adopt/exclude/
  fork/smart-merge decisions before docs sync implementation.

Completion threshold:
- `.agents/rules/sync-shadcn.mdc` exists as the source-of-truth skill
  rule.
- Generated `.agents/skills/sync-shadcn/SKILL.md` exists and points back
  to the source rule.
- `.claude/skills/sync-shadcn` exists as the generated Claude skill link.
- `docs/sync/shadcn/status.json` records the upstream repo, app path, Plate app,
  and current seeded upstream commit.
- `docs/sync/shadcn/decisions.md` records settled keep/fork/exclude policy,
  including no v0, no public create/charts/colors by default, keep lazy
  `/api/registry-source/[name]`, and keep Plate sidebar accordion UX on
  upstream primitives.
- `AGENTS.md` and `.agents/AGENTS.md` mention when to use the skill.
- Verification evidence below is recorded and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-sync-shadcn-skill.md`
  passes.

Verification surface:
- `pnpm install`
- `node -e` JSON parse and baseline assertion for
  `docs/sync/shadcn/status.json`
- `git -C ../shadcn rev-parse origin/main` compared with the recorded baseline
- `rg` source audit across source rule, generated skill, AGENTS files, and
  `docs/sync/shadcn`
- `test -L .claude/skills/sync-shadcn` and generated skill file existence
- `git diff --check` scoped to the changed agent/docs sync files
- `pnpm exec biome check` scoped to supported changed files
- this plan's `check-complete.mjs` command

Constraints:
- Edit source rules, not generated skill mirrors.
- Do not change existing `apps/www` docs behavior for this task.
- Do not modify unrelated dirty migration files already present in the working
  tree.
- Do not create commits, pushes, PRs, or tracker comments.
- Do not run registry builds.

Boundaries:
- Source of truth: user request plus existing migration plans and solution
  notes.
- Allowed edit scope: `.agents/rules/sync-shadcn.mdc`, generated skill
  output from `pnpm install`, AGENTS skill listings, `docs/sync/shadcn/**`, and
  this goal plan.
- Browser surface: N/A, no app route or UI behavior changed.
- Tracker sync: N/A.
- Non-goals: running an actual shadcn sync plan, implementing docs app changes,
  advancing beyond the seeded baseline, or touching existing migration code.

Output budget strategy:
- Use focused `sed`, `rg`, and status checks.
- Save future full shadcn sync inventories under `docs/sync/shadcn/runs/`
  instead of streaming huge diffs into chat.
- Cap verification command output to changed files and relevant source audits.

Blocked condition:
The task would block only if Skiller generation failed, `../shadcn` was missing
or not a shadcn checkout, or the user rejected seeding the initial baseline from
the current local upstream clone. None of those occurred.

Task state:
- task_type: agent-native docs/tooling task
- task_complexity: non-trivial
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete-ready

Current verdict:
- verdict: complete
- confidence: high
- next owner: sync-shadcn on future sync requests
- reason: source rule, generated skill, AGENTS discoverability, and durable
  baseline files are in place and verified.

Completion rule:
- All required checklist items are checked or marked N/A with reason.
- Verification evidence is recorded below.
- The plan checker passes before final handoff.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Read `.agents/AGENTS.md`, `shadcn-parity`, generated skill conventions, existing migration plans, and relevant solution notes. |
| Active goal checked or created | yes | Created this plan with `autogoal` task template plus agent-native/docs packs. |
| Source of truth read before edits | yes | Read the user request, previous shadcn migration decisions, and the provided task skill shape. |
| Tracker comments and attachments read | N/A | Local chat request, no tracker. |
| Video transcript evidence required | N/A | No video evidence. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read shadcn restart, sidebar parity, init route, registry schema, namespace, and Fumadocs metadata notes. |
| TDD decision before behavior change or bug fix | N/A | No runtime behavior or bug fix. |
| Branch decision for code-changing task | N/A | No commit/PR requested; current branch retained. |
| Release artifact decision | N/A | No package or registry source change. |
| Browser tool decision for browser surface | N/A | No browser surface changed. |
| PR expectation decision | yes | No PR requested. |
| Tracker sync expectation decision | N/A | No tracker. |
| Output budget strategy recorded | yes | See Output budget strategy. |
| Agent-native pack selected | yes | This changes agent skill behavior. |
| Agent-facing action surface identified | yes | New `sync-shadcn` skill plus AGENTS discovery lines. |
| Source rule versus generated mirror boundary identified | yes | Edited `.agents/rules/sync-shadcn.mdc`; generated mirrors came from `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Read and applied `agent-native-reviewer`; no action-parity gap because this adds an agent workflow, not a UI-only action. |
| Docs pack selected | yes | Added durable docs/sync policy files. |
| `docs-creator` loaded | yes | Read docs style/workflow lane guidance. |
| Docs lane selected | yes | Workflow/reference docs for future agent sync runs. |
| Target docs and nearest sibling docs read | yes | Read shadcn migration plans and sync-skill prior plans. |
| Docs style doctrine read | yes | Read relevant `docs-creator` sections. |
| Documented source owner identified | yes | Source owner is `.agents/rules/sync-shadcn.mdc`; durable state owner is `docs/sync/shadcn`. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, title, acceptance criteria,
      caveats, likely files, browser surface, and root-cause layer.
- [x] Required video or screen-recording evidence is marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: source rule plus
      durable sync ledger, not hand-edited generated skill mirrors.
- [x] Release artifact requirement recorded as N/A.
- [x] Final handoff shape decided: concise local patch summary and verification.
- [x] Branch handling recorded as N/A because no commit/PR was requested.
- [x] Local-env-rot retry policy recorded as N/A; no surprising repo-wide test
      failure occurred.
- [x] Workspace authority recorded: all proof ran in `/Users/zbeyens/git/plate`
      except the upstream SHA check in `../shadcn`.
- [x] High-risk note recorded for agent-action changes.
- [x] Review target selected: manual agent-native review of the new skill and
      source audits; autoreview marked N/A for docs/tooling-only patch.
- [x] Agent-native review decision recorded.
- [x] Output budget discipline recorded and followed.
- [x] Agent-native pack: source-of-truth rule files are edited instead of
      generated skill mirrors.
- [x] Agent-native pack: changed agent action is discoverable from AGENTS and
      generated skill text.
- [x] Agent-native pack: generated mirrors synced with `pnpm install`.
- [x] Agent-native pack: no accepted agent-native findings remained.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner
      are recorded.
- [x] Docs pack: named routes and files are source-backed or policy-backed.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links and routes are local repo paths or known upstream clone
      paths; no previews apply.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the recorded source audits and checks. | Verification evidence section records each command. |
| Bug reproduced before fix | N/A | No bug fix. | N/A. |
| Targeted behavior verification | yes | Verify generated skill, status JSON, upstream baseline, and AGENTS discoverability. | Source audits passed. |
| TypeScript or typed config changed | N/A | No TS/config type surface changed. | N/A. |
| Package exports or file layout changed | N/A | No package export layout changed. | N/A. |
| Package manifests, lockfile, or install graph changed | N/A | `pnpm install` ran for Skiller sync; lockfile had no relevant tracked diff. | `pnpm install` passed. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync. | `pnpm install` passed; generated skill metadata points to `.agents/rules/sync-shadcn.mdc`. |
| Workspace authority proof | yes | Run proof in Plate and upstream clone where owned. | Plate checks ran in `/Users/zbeyens/git/plate`; upstream SHA check ran in `../shadcn`. |
| Browser surface changed | N/A | No browser route/UI changed. | N/A. |
| Browser final proof | N/A | No browser route/UI changed. | N/A. |
| CI-controlled template output changed | N/A | No template output changed. | N/A. |
| Package behavior or public API changed | N/A | No package behavior/public API changed. | N/A. |
| Registry-only component work changed | N/A | No registry component source changed. | N/A. |
| Docs or content changed | yes | Verify source-backed claims and local links where applicable. | Source audit and JSON/status checks passed; docs are workflow/reference, not app MDX. |
| High-risk mini gate | yes | Record failure mode, proof plan, and boundary. | Failure mode: future agents skip exact upstream refs or reimport discarded shadcn surfaces. Proof: skill mandates status JSON, full inventory, decisions table, and user confirmation before implementation. Boundary: source rule plus `docs/sync/shadcn` ledger is the durable owner. |
| Agent-native review for agent/tooling changes | yes | Load reviewer and close findings. | Reviewer read; no findings because the change adds an agent workflow and discoverability. |
| Local install corruption suspected | N/A | No corruption-shaped failure occurred. | N/A. |
| Autoreview for non-trivial implementation changes | N/A | Docs/tooling-only source rule change; no runtime implementation diff. | Manual source/agent-native review plus focused checks used instead. |
| PR create or update | N/A | No PR requested. | N/A. |
| Task-style PR body verified | N/A | No PR. | N/A. |
| PR proof image hosting | N/A | No PR/browser proof. | N/A. |
| Tracker sync-back | N/A | No tracker. | N/A. |
| Final handoff contract | yes | Report outcome, caveat, and verification. | Final response will summarize changed files and checks. |
| Final lint | yes | Run scoped supported linter/formatter check and whitespace check. | `pnpm exec biome check ...` checked supported files; `git diff --check` passed. |
| Output budget discipline | yes | Avoid unbounded output. | One `rg` command had shell backtick noise and was rerun safely; no large diff streamed. |
| Goal plan complete | yes | Run `check-complete.mjs`. | Recorded in final verification evidence. |
| Agent source / generated sync | yes | Run `pnpm install`. | Passed. |
| Agent action discoverability | yes | Audit AGENTS and generated skill text. | `rg` found AGENTS entries and generated metadata. |
| Agent-native review | yes | Apply reviewer. | No findings. |
| Docs source-backed claim audit | yes | Verify decisions against prior plans/solutions and current status. | Prior migration artifacts and source audits read. |
| Docs links / routes / previews | yes | Verify local file paths and route names by source audit. | `rg` source audit passed. |
| Docs MDX/content parser | N/A | No app MDX content changed. | N/A. |
| Plugin page specifics | N/A | No plugin page changed. | N/A. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read AGENTS, shadcn parity, migration plans, solution notes, and generated skill conventions. | implementation |
| Implementation | complete | Added source rule, sync ledger, decisions table, AGENTS entry, and generated skill output. | verification |
| Verification | complete | `pnpm install`, JSON/upstream/source audits, symlink check, Biome supported-file check, and diff whitespace check passed. | closeout |
| PR / tracker sync | N/A | No PR/tracker requested. | final response |
| Closeout | complete | Plan updated with evidence; final checker run required. | final response |

Findings:
- `.agents/AGENTS.md` is the source-of-truth instruction file and generated
  `SKILL.md` files must not be edited directly.
- The current upstream clone is `../shadcn` at
  `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`, matching the seeded
  `status.json` baseline.
- Existing migration notes settle the major exclusions and forks: no v0, no
  public create/charts/colors by default, keep Plate API MDX/CN/MCP/Plus/GA/
  home/editor/registry surfaces, and keep lazy code source loading under
  `/api/registry-source/[name]`.

Decisions and tradeoffs:
- Store durable state under `docs/sync/shadcn` with a JSON baseline plus a
  human-readable decisions table.
- Seed the baseline to the current local upstream `origin/main` commit because
  the active migration branch already records the completed shadcn base work,
  while preserving a note that the original plan did not record an exact SHA.
- Make planning the default skill behavior; implementation requires user
  confirmation and delegates through `task`.
- Do not advance `lastSyncedCommit` for future ranges until every upstream row
  is accounted for.

Implementation notes:
- Added `.agents/rules/sync-shadcn.mdc`.
- Added generated `.agents/skills/sync-shadcn/SKILL.md` through
  `pnpm install`.
- Added generated `.claude/skills/sync-shadcn` symlink through Skiller.
- Added `docs/sync/shadcn/README.md`, `status.json`, and `decisions.md`.
- Updated `.agents/AGENTS.md`; generated root `AGENTS.md` synced through
  Skiller.

Review fixes:
- Manual agent-native review found no action parity gap; the change creates an
  agent workflow and makes it discoverable in AGENTS.
- Reran source audit after one shell quoting error from backticks in the `rg`
  pattern.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `rg` pattern with backticks triggered zsh command substitution noise | 1 | Quote the pattern with single quotes and avoid shell-interpreted backticks | Rerun passed and found the expected skill/status lines. |

Verification evidence:
- `pnpm install`: passed; Skiller applied rules for Claude Code and Codex, and
  Fumadocs source generation completed.
- `node -e` JSON parse/baseline assertion for `docs/sync/shadcn/status.json`:
  passed with `status baseline ok`.
- `git -C ../shadcn rev-parse origin/main` compared to `status.json`
  `lastSyncedCommit`: passed with `upstream baseline ok`.
- `rg -n 'sync-shadcn|lastSyncedCommit|Complete Upstream Inventory|registry-source|Discard upstream \`/create\`, \`/charts\`, \`/colors\`|source: .agents/rules/sync-shadcn.mdc' ...`:
  passed and found AGENTS entries, generated metadata, baseline tracking,
  inventory requirement, exclusions, and lazy source policy.
- `test -L .claude/skills/sync-shadcn && test -f .agents/skills/sync-shadcn/SKILL.md`:
  passed with `claude symlink and codex skill ok`.
- `git diff --check -- <changed agent/docs sync files>`: passed.
- `pnpm exec biome check .agents/AGENTS.md AGENTS.md docs/sync/shadcn/README.md docs/sync/shadcn/decisions.md docs/sync/shadcn/status.json`:
  passed; Biome checked its supported file in that set and reported no fixes.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-sync-shadcn-skill.md`:
  passed with `[autogoal] complete`.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: high.
- Flow table:
  - Reproduced: tests N/A, browser N/A
  - Verified: source/generation checks passed, browser N/A
- Browser check: N/A, no browser surface changed.
- Outcome: sync-shadcn skill and durable baseline files created.
- Caveat: existing unrelated migration branch changes remain untouched.
- Design:
  - Chosen boundary: source skill rule plus `docs/sync/shadcn` ledger.
  - Why not quick patch: generated skill mirrors would be overwritten by
    Skiller.
  - Why not broader change: actually running the next upstream sync belongs to
    a later skill invocation.
- Verified: see Verification evidence.
- PR body verified: N/A.

Task-style PR body contract:
- N/A, no PR requested.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: baseline is seeded from current local `../shadcn` and the migration
  branch; future runs must use full range plans before advancing it.

Timeline:
- 2026-05-28T11:35:56.225Z Task goal plan created.
- 2026-05-28 Added source rule and shadcn sync ledger files.
- 2026-05-28 Ran `pnpm install` to generate skill mirrors.
- 2026-05-28 Ran focused source, JSON, upstream baseline, symlink, Biome, and
  whitespace checks.
- 2026-05-28 Ran `check-complete.mjs`; plan passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout after implementation and verification. |
| Where am I going? | Run the plan checker, then final response. |
| What is the goal? | Create a comprehensive sync-shadcn skill with exact upstream baseline tracking. |
| What have I learned? | Source rules own generated skills; current upstream baseline is `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`; prior docs settle major keep/exclude policy. |
| What have I done? | Added the skill rule, generated mirrors, AGENTS discovery, status JSON, decisions table, README, and this plan. |

Open risks:
- None. The only caveat is explicit in `status.json`: the initial exact SHA is
  seeded from the current local upstream clone because the earlier migration
  notes did not record a SHA.
