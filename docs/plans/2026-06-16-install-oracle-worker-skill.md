# Install Oracle Worker Skill

Objective:
Install Oracle as advisory worker skill; done when global skill installs, local
routing keeps it non-primary, mirrors sync, and audits pass.

Goal plan:
docs/plans/2026-06-16-install-oracle-worker-skill.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user command after OpenClaw sync review
- id / link: `/Users/zbeyens/git/openclaw/openclaw/skills/oracle/SKILL.md`
- title: Install Oracle worker skill
- acceptance criteria: install `oracle` via `npx skills add`, keep it as a
  worker/advisory tool behind primary entrypoints, update OpenClaw decision
  ledger, and verify active global skill state plus local routing.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: no duration requested.
- semantics: N/A.
- initial confidence score: N/A.
- improvement loop: N/A.
- final score / loop closure: N/A.

Completion threshold:
- `/Users/zbeyens/.agents/skills/oracle/SKILL.md` exists and is listed by
  `npx skills list -g --json`.
- `.agents/AGENTS.md` says Oracle/second-model review is advisory worker
  capacity behind primary entrypoints, not a primary prompt target.
- `docs/sync/openclaw/decisions.json` records the OpenClaw Oracle row as
  accepted with the correct owner.
- Generated mirrors/root instructions are synced when `.agents/**` changes.
- Source/global audits and `check-complete.mjs` pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-install-oracle-worker-skill.md` passes.

Verification surface:
- `npx -y skills add /Users/zbeyens/git/openclaw/openclaw -g --skill oracle --agent '*' --yes --full-depth --copy`
- `npx -y skills list -g --json`
- `test -f /Users/zbeyens/.agents/skills/oracle/SKILL.md`
- `rg` audits for Oracle advisory routing and decision ledger.
- `pnpm install` if `.agents/AGENTS.md` changes.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-install-oracle-worker-skill.md`

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: user said `go` after approving Oracle via npx skills add,
  plus OpenClaw Oracle source skill.
- Allowed edit scope: global skill install state, `.agents/AGENTS.md`,
  `docs/sync/openclaw/decisions.json`, this plan, generated root `AGENTS.md`
  via `pnpm install`.
- Browser surface: N/A.
- Tracker sync: N/A.
- Non-goals: adding Oracle as a primary entrypoint, running an Oracle review,
  installing the Oracle CLI binary globally, changing Plite runtime code, commit,
  push, or PR.

Output budget strategy:
- Use exact installer/list commands, capped source reads, and exact `rg` audits.

Blocked condition:
- Stop only if `npx skills add` cannot install from the local OpenClaw checkout
  or the installed skill cannot be verified in global skill state.

Task state:
- task_type: agent-workflow/global-skill-install
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready_to_close

Current verdict:
- verdict: complete
- confidence: high after global list audit.
- next owner: final response
- reason: Oracle is installed globally and local routing keeps it advisory.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-install-oracle-worker-skill.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | This plan captures install, worker/advisory boundary, routing, ledger, and verification. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Read `openclaw-sync`, OpenClaw Oracle skill, and `npx skills --help`. |
| Active goal checked or created | yes | `get_goal` returned no active goal; created this goal. |
| Source of truth read before edits | yes | Read `/Users/zbeyens/git/openclaw/openclaw/skills/oracle/SKILL.md`. |
| Tracker comments and attachments read | no | N/A: no tracker item. |
| Video transcript evidence required | no | N/A: no media. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: no implementation code work. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior change. |
| Branch decision for code-changing task | no | N/A: no branch requested and no runtime code change. |
| Release artifact decision | no | N/A: no package release artifact. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker sync. |
| Output budget strategy recorded | yes | Exact installer/list/source audits only. |
| Agent-native pack selected | yes | Global skills and agent instructions change. |
| Agent-facing action surface identified | yes | Oracle second-model review as worker/advisory capacity. |
| Source rule versus generated mirror boundary identified | yes | Patch `.agents/AGENTS.md`, run `pnpm install`; do not hand-edit generated root `AGENTS.md`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded `.agents/skills/agent-native-reviewer/SKILL.md`; no actionable finding. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
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
      N/A with reason. Risk: extra visible skill clutter; mitigated by worker
      routing text.
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
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `oracle` installed globally; list/source/routing/ledger audits passed. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: no bug fix. |
| Targeted behavior verification | no | Run focused test/proof for changed behavior or record N/A | N/A: no product behavior change. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: no TS/config code change. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no package manifest/lockfile expected from skill install. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed; root `AGENTS.md` contains Oracle advisory routing text. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Global skill proof from `/Users/zbeyens/.agents/skills/oracle/SKILL.md` and `npx skills list -g --json`; local routing proof from `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no browser surface. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: no browser surface. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no CI template output. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no package behavior/API. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Incidental agent docs/ledger only; source-audit routing text. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk: skill-list clutter. Boundary: Oracle is global advisory worker capacity behind primary entrypoints, not a primary Plate/Plite entrypoint. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Loaded reviewer; no actionable finding. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no install corruption signal. |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: no runtime implementation diff; agent-native review covered agent tooling. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR/browser proof. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Final handoff fields filled below. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: no code formatting/lint surface. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One bad `rg` used double quotes around backticks and triggered shell substitution; reran with `rg -F` fixed strings. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-install-oracle-worker-skill.md` | Final mechanical gate after this closeout update. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` passed and root `AGENTS.md` regenerated. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `/Users/zbeyens/.agents/skills/oracle/SKILL.md` exists; `.agents/AGENTS.md` and generated root `AGENTS.md` define Oracle as advisory worker. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Loaded reviewer; no accepted/actionable findings. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Created plan, read OpenClaw Oracle source and installer help. | implementation |
| Implementation | complete | Installed global Oracle skill, patched `.agents/AGENTS.md`, updated OpenClaw decision ledger, ran `pnpm install`. | verification |
| Verification | complete | Global skill list, skill file, npx Oracle help, routing/ledger audits, JSON parse, agent-native review passed. | closeout |
| PR / tracker sync | complete | N/A: no PR/tracker. | final response |
| Closeout | complete | Plan updated with evidence and caveats. | final response |

Findings:
- `oracle` is installed as a global skill at `/Users/zbeyens/.agents/skills/oracle/SKILL.md`.
- `npx skills list -g --json` lists `oracle` at global scope for 57 agents.
- `oracle` binary is not installed globally; `npx -y @steipete/oracle --help`
  works and reports Oracle CLI v0.14.0.
- Installer reported one unsupported target failure: PromptScript does not
  support global skill installation. Codex/global skill state still succeeded.

Decisions and tradeoffs:
- Kept Oracle as a global worker skill, not a repo-local primary entrypoint.
- Did not install the Oracle CLI binary globally; the skill documents `npx`
  fallback, and `npx -y @steipete/oracle --help` proves it is runnable.

Implementation notes:
- Ran `npx -y skills add /Users/zbeyens/git/openclaw/openclaw -g --skill oracle --agent '*' --yes --full-depth --copy`.
- Patched `.agents/AGENTS.md` with Oracle advisory-worker boundary.
- Added accepted Oracle row to `docs/sync/openclaw/decisions.json`.
- Ran `pnpm install` to regenerate root `AGENTS.md`.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Double-quoted `rg` pattern containing markdown backticks executed `oracle` through shell substitution | 1 | Use `rg -F` fixed-string scans for backtick text | Reran audit with `rg -F`; routing/ledger text proved. |

Verification evidence:
- `test -f /Users/zbeyens/.agents/skills/oracle/SKILL.md` passed.
- `npx -y skills list -g --json` captured `.tmp/openclaw-sync/global-skills-after-oracle.json`; parsed row shows `oracle	global	/Users/zbeyens/.agents/skills/oracle	agents=57`.
- `npx -y @steipete/oracle --help` passed and reported Oracle CLI v0.14.0.
- `pnpm install` passed.
- `rg -F` audits found Oracle advisory-worker text in `.agents/AGENTS.md` and generated `AGENTS.md`.
- `rg -F` audits found accepted Oracle row in `docs/sync/openclaw/decisions.json`.
- `docs/sync/openclaw/decisions.json` parses as JSON.
- Loaded `.agents/skills/agent-native-reviewer/SKILL.md`; no actionable finding.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no tracker.
- Confidence line: high.
- Flow table:
  - Reproduced: N/A, no bug.
  - Verified: global skill install, local routing, decision ledger, npx CLI help.
- Browser check: N/A.
- Outcome: Oracle installed globally as advisory worker.
- Caveat: Oracle CLI binary is not globally installed; use `npx -y @steipete/oracle` or install CLI later if desired. PromptScript target failed global skill install, but Codex/global skill state is good.
- Design:
  - Chosen boundary: global worker skill plus local routing text.
  - Why not quick patch: installing without routing would add prompt clutter.
  - Why not broader change: no need to create repo-local Oracle wrapper or primary entrypoint.
- Verified: commands listed in Verification evidence.
- PR body verified: N/A.

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
- Caveats: Oracle CLI binary is npx-runnable, not globally installed; one unsupported PromptScript target failed.

Timeline:
- 2026-06-16T20:26:53.088Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Install Oracle as advisory worker skill without making it a primary Plate/Plite entrypoint. |
| What have I learned? | See Findings |
| What have I done? | Installed Oracle skill, patched routing, updated ledger, verified. |

Open risks:
- Future Codex sessions need to reload the skill list before `oracle` appears
  in the available-skills prompt.
- If we want `oracle` as a direct shell command instead of `npx`, install
  `@steipete/oracle` globally later.
