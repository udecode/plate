# openclaw setup sync skill

Objective:
Create a global `openclaw-sync` skill that audits local OpenClaw clones against our agent setup and reports `new`, `smart-merge`, and `reject` sync candidates.

Goal plan:
docs/plans/2026-06-16-openclaw-setup-sync-skill.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user instruction
- id / link: current chat
- title: Global skill for OpenClaw agent setup sync
- acceptance criteria: global skill exists; it explains how to analyze
  `../openclaw` repos for skills/docs/agent setup; it includes a command that
  compares latest OpenClaw against our current setup; it classifies candidates
  as `new`, `smart-merge`, or `reject`; validation passes.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- `/Users/zbeyens/.agents/skills/openclaw-sync/SKILL.md` exists with concise
  workflow, classification rules, merge policy, output contract, and validation
  guidance.
- `/Users/zbeyens/.agents/skills/openclaw-sync/scripts/openclaw-sync-report.mjs`
  exists, runs without external npm deps, and produces a bounded report
  comparing OpenClaw agent assets against current repo/global agent assets.
- The skill folder validates with `quick_validate.py`, the script passes
  `node --check`, and a smoke report command runs against the local checkout.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-setup-sync-skill.md` passes.

Verification surface:
- `python3 /Users/zbeyens/.codex/skills/.system/skill-creator/scripts/quick_validate.py /Users/zbeyens/.agents/skills/openclaw-sync`
- `node --check /Users/zbeyens/.agents/skills/openclaw-sync/scripts/openclaw-sync-report.mjs`
- `node /Users/zbeyens/.agents/skills/openclaw-sync/scripts/openclaw-sync-report.mjs --openclaw-root /Users/zbeyens/git/openclaw --target /Users/zbeyens/git/plate-2 --global-skills /Users/zbeyens/.agents/skills --max 20 --out .tmp/openclaw-sync/smoke.md --json .tmp/openclaw-sync/smoke.json`

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: global skill folder
  `/Users/zbeyens/.agents/skills/openclaw-sync/**` plus this active goal plan.
- Allowed edit scope: new global skill files and active goal plan.
- Browser surface: N/A.
- Tracker sync: N/A.
- Non-goals: do not patch Plate/Plite setup from OpenClaw yet; do not commit;
  do not clone more repos unless the local OpenClaw root is missing; do not
  flatten OpenClaw product-specific rules into our setup.

Output budget strategy:
- Script output defaults to a bounded row limit and writes full artifacts only
  when `--out`/`--json` are supplied. Manual reads use `sed` and `find` caps.

Blocked condition:
- Block only if global skill creation is not writable or local
  `/Users/zbeyens/git/openclaw` is absent and network clone discovery fails.

Task state:
- task_type: global skill creation
- task_complexity: normal
- current_phase: intake
- current_phase_status: in_progress
- next_phase: implementation
- goal_status: active

Current verdict:
- verdict: create `openclaw-sync` with one deterministic report script
- confidence: high
- next owner: task
- reason: user wants reusable global workflow plus command, not a one-time
  analysis.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-setup-sync-skill.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Captured global skill, OpenClaw repo analysis, command, latest/current compare, and `new` / `smart-merge` / `reject` output contract. |
| Skill analysis before edits | yes | Read `autogoal`, `skill-creator`, `sync-skills`, `skill-cleaner`, and `agent-native-reviewer`; inspected global skill layout. |
| Active goal checked or created | yes | `get_goal` returned none; active goal created for this skill. |
| Source of truth read before edits | yes | `/Users/zbeyens/.agents/skills/**` global layout, `/Users/zbeyens/.agents/config.json`, and local `/Users/zbeyens/git/openclaw` layout inspected. |
| Tracker comments and attachments read | no | N/A: no tracker. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: global skill creation, no product-code behavior. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime product behavior change. |
| Branch decision for code-changing task | no | N/A: user did not ask branch/PR. |
| Release artifact decision | no | N/A: global skill only, no package release. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Script caps Markdown rows and writes JSON/Markdown artifacts; manual reads were capped. |
| Agent-native pack selected | yes | New global agent skill and command surface changed. |
| Agent-facing action surface identified | yes | `$openclaw-sync` plus `scripts/openclaw-sync-report.mjs` command. |
| Source rule versus generated mirror boundary identified | yes | Global `/Users/zbeyens/.agents/skills` skills are direct-authored; Plate generated skill flow does not apply. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded reviewer; new action is CLI/skill surface, no app UI parity gap. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Skill validation, Node syntax check, and smoke comparison command passed. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: skill creation, not a reported product bug. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Smoke report scanned 7 OpenClaw repos and emitted `new`, `smart-merge`, and `reject` counts. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: JS script plus Markdown skill only; `node --check` covers syntax. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no package manifests or lockfiles touched. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | N/A for generated sync: this is a global direct-authored skill under `/Users/zbeyens/.agents/skills`, validated with `quick_validate.py`. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Validation ran from `/Users/zbeyens/git/plate-2`; skill path is absolute under `/Users/zbeyens/.agents/skills/openclaw-sync`. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no browser UI. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: no browser UI. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no CI-generated template output changed. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: global skill only. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry component work. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | `SKILL.md` is the content surface; it validates and its command smoke-runs. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: shallow title-only imports from OpenClaw. Skill requires reading source and section-level merge; script output is triage only. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Loaded reviewer. Verdict: PASS for this scope; no UI action parity issue, command is visible in skill. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no install-corruption signal. |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: small global skill/script, verified by command; no product code. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 format | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR/browser proof. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: no repo TS/lint surface; script syntax and skill validation passed. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Smoke output capped at 20 rows; full artifacts written to `.tmp/openclaw-sync/`. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-setup-sync-skill.md` | Run after this plan update. |
| Agent source / generated sync | no | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | N/A: no Plate `.agents/rules/**` changed. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `/Users/zbeyens/.agents/skills/openclaw-sync/SKILL.md` has trigger description and command. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Loaded and applied; no accepted findings. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Plan, skill creator, sync-skills, skill-cleaner, OpenClaw layout inspected. | implementation |
| Implementation | complete | Added global skill, report script, and OpenAI UI metadata. | verification |
| Verification | complete | Skill validation, node syntax, and smoke comparison passed. | closeout |
| PR / tracker sync | skipped | N/A: no PR/tracker requested. | final response |
| Closeout | complete | Final plan evidence recorded. | final response |

Findings:
- OpenClaw sync needs a report artifact, not a pure prompt, because the corpus
  is already hundreds of agent assets.
- The first smoke run scanned 7 local OpenClaw repos and found 254 candidate
  rows: 155 `new`, 19 `smart-merge`, 80 `reject`.
- The report is intentionally triage-grade. Accepted rows still require source
  reading before patching.

Decisions and tradeoffs:
- Created a global skill, not a Plate-local generated rule, because the workflow
  applies across repos.
- Added a deterministic script because repeated `find`/`rg` comparisons would
  drift and flood context.
- Kept `--refresh` optional. Latest compare can pull OpenClaw, but stable
  offline snapshots remain possible.
- Did not apply any OpenClaw changes to our setup in this pass.

Implementation notes:
- Created `/Users/zbeyens/.agents/skills/openclaw-sync/SKILL.md`.
- Created `/Users/zbeyens/.agents/skills/openclaw-sync/scripts/openclaw-sync-report.mjs`.
- Updated `/Users/zbeyens/.agents/skills/openclaw-sync/agents/openai.yaml`.
- Smoke artifacts written to `.tmp/openclaw-sync/smoke.md` and
  `.tmp/openclaw-sync/smoke.json`.

Review fixes:
- Moved token classification constants above top-level execution so the script
  can run under ESM without temporal-dead-zone errors.
- Removed an unused `statSync` import while fixing the script.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Directly executing `init_skill.py` failed with permission denied | 1 | Run through `python3` | Skill initialized successfully. |
| Smoke command failed because `STOP_WORDS` was initialized after top-level code called `tokenize()` | 1 | Move constants above execution | `node --check` and smoke command pass. |

Verification evidence:
- `node --check /Users/zbeyens/.agents/skills/openclaw-sync/scripts/openclaw-sync-report.mjs` passed.
- `python3 /Users/zbeyens/.codex/skills/.system/skill-creator/scripts/quick_validate.py /Users/zbeyens/.agents/skills/openclaw-sync` returned `Skill is valid!`.
- `node /Users/zbeyens/.agents/skills/openclaw-sync/scripts/openclaw-sync-report.mjs --openclaw-root /Users/zbeyens/git/openclaw --target /Users/zbeyens/git/plate-2 --global-skills /Users/zbeyens/.agents/skills --max 20 --out .tmp/openclaw-sync/smoke.md --json .tmp/openclaw-sync/smoke.json` passed.
- Smoke report: 7 repos scanned, 254 rows, `new=155`,
  `smart-merge=19`, `reject=80`; Markdown artifact has 36 lines, JSON artifact
  has 3069 lines.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: High for skill creation and command smoke; medium for row
  classification quality until the first real sync pass tunes heuristics.
- Flow table:
  - Reproduced: N/A, no bug.
  - Verified: skill validation, node syntax, smoke comparison.
- Browser check: N/A, no browser surface.
- Outcome: global `openclaw-sync` skill exists with a compare command and
  `new` / `smart-merge` / `reject` workflow.
- Caveat: report is a triage tool; future sync still needs source-file reading
  before patching.
- Design:
  - Chosen boundary: global skill plus deterministic report script.
  - Why not quick patch: prompt-only analysis would repeat brittle searches and
    miss duplicates.
  - Why not broader change: applying OpenClaw lessons belongs to a separate
    sync pass after reviewing report rows.
- Verified: validation commands and smoke artifacts above.
- PR body verified: N/A, no PR.

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
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: report classifications are triage-grade; inspect source files before
  accepting a row.

Timeline:
- 2026-06-16T08:56:59.254Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout; implementation and verification are complete. |
| Where am I going? | Run `check-complete`, mark goal complete, final response. |
| What is the goal? | Create global `openclaw-sync` skill with compare command and classification workflow. |
| What have I learned? | OpenClaw sync needs bounded artifacts and source-reading gates, not raw prompt analysis. |
| What have I done? | Created skill, script, metadata, smoke report artifacts, and validation evidence. |

Open risks:
- None blocking. First real sync pass should tune reject/new heuristics if
  report rows are too noisy.
