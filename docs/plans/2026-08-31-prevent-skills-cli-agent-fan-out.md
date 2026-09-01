# Prevent Skills CLI agent fan-out

Objective:
Remove the unintended Skills CLI fan-out and prevent narrow skill refreshes from mutating unrelated skills or agent directories; done when approved destinations remain and guard verification passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-31-prevent-skills-cli-agent-fan-out.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: direct user correction after a failed agent-skill refresh
- id / link: current Codex thread
- title: Repair unintended `.cortex` and global Skills CLI installs
- acceptance criteria: explain the exact commands and semantics that caused the
  fan-out; inventory and remove only destinations created by that fan-out;
  preserve canonical skill sources; replace unsafe update/wildcard teaching with
  a fail-closed targeted path; verify that a future narrow refresh cannot silently
  target every installed skill or every supported agent.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A
- initial confidence score: N/A: exact filesystem and command-contract checks are stronger
- improvement loop: audit -> clean exact collateral -> add guard -> forward-test
- final score / loop closure: N/A

Completion threshold:
- Every `autogoal` destination introduced by `--agent '*'` is accounted for;
  only the approved canonical/project destinations remain; unrelated global
  skills are not deleted without a recoverable baseline; every relevant source
  instruction rejects update-all and wildcard fan-out for narrow refreshes; a
  deterministic guard rejects `*` and validates explicit destinations; focused
  skill validation and source/mirror checks pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-prevent-skills-cli-agent-fan-out.md` passes.

Verification surface:
- Local Skills CLI help/source inspection for `update` and `--agent '*'` semantics.
- Before/after filesystem inventory of `autogoal` links and installed-skill lists.
- Guard-script negative tests for wildcard and update-all attempts plus a
  non-mutating explicit-target plan test.
- Skill validators, stale-guidance search, generated parity check, and the final
  autogoal plan checker.

Constraints:
- Preserve canonical skill source and unrelated user-installed skills.
- Delete only exact links/copies proven to come from this failed invocation;
  never infer that an old agent directory is disposable.
- Prefer a mechanical fail-closed command owner over prose-only reminders.
- Do not create PRs, comments, commits, or pushes.

Boundaries:
- Source of truth: `/Users/zbeyens/.agents/skills/sync-skills`, its canonical
  upstream if identified, the installed Skills CLI implementation/help, and
  Plate's source `.agents/rules/**` only if it teaches the unsafe contract.
- Allowed edit scope: exact unintended `autogoal` links; relevant shared skill
  source and helper; smallest Plate source-rule/template repair needed for this
  demonstrated failure; one authorized memory correction note if stale memory
  would reproduce it.
- Browser surface: N/A: filesystem/CLI agent workflow only.
- Browser strategy: N/A.
- Tracker sync: N/A.
- Non-goals: rolling back unrelated global skills without a known baseline;
  changing product packages; broad skill cleanup; PR/commit/push work.

Output budget strategy:
- Search only named skill roots and shallow destination paths; cap CLI-source
  hits with `rg`/`head`; store full inventories in a temporary artifact when
  output is large and summarize counts plus exact affected paths in the plan.

Blocked condition:
- Stop only if ownership cannot be proven for a material directory or a cleanup
  target is a real copy with no recoverable canonical source; leave it intact
  and report the exact ambiguity.

Task state:
- task_type: agent-workflow regression repair
- task_complexity: normal
- current_phase: final response
- current_phase_status: completed
- next_phase: none
- goal_status: ready_complete

Current verdict:
- verdict: cleanup and fail-closed replacement verified
- confidence: high
- next owner: task
- reason: `skills update` is update-all and `--agent '*'` explicitly targets all supported agents.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-prevent-skills-cli-agent-fan-out.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Cause explanation, exact cleanup, and future prevention are captured above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Read `autogoal`, `sync-skills`, and `skill-creator` completely. |
| Active goal checked or created | yes | `get_goal` returned none; goal creation follows this completed intake. |
| Source of truth read before edits | yes | Read global `sync-skills` source and bundled `skill-creator`; CLI source inspection remains a work item. |
| Tracker comments and attachments read | no | N/A: no tracker. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: direct command-contract regression. |
| TDD decision before behavior change or bug fix | yes | Negative guard tests plus a non-mutating positive plan test. |
| Branch decision for code-changing task | no | N/A: local repair only; no commit or PR. |
| Release artifact decision | no | N/A: no package release surface. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Scoped paths and capped CLI-source searches recorded above. |
| Agent-native pack selected | yes | `agent-native` materialized. |
| Agent-facing action surface identified | yes | Narrow external-skill refresh/install/removal in `sync-skills`. |
| Source rule versus generated mirror boundary identified | yes | Patch canonical shared source; do not hand-edit generated Plate mirrors. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Read the complete reviewer skill and ran the capability-map review after the diff. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence: N/A, no video supplied.
- [x] Nearby repo instructions and implementation patterns read before edits:
      repo instructions plus complete relevant skill entrypoints.
- [x] Implementation fixes the right ownership boundary: the configured updater
      script, its skill contract, the cross-repo sync route, and personal target
      config fail closed together.
- [x] Release artifact requirement: N/A, agent workflow only.
- [x] Final handoff shape decided: root cause, exact cleanup, durable prevention,
      verification, and any deliberately preserved ambiguity.
- [x] Branch handling: N/A, no commit/PR requested and repo instructions forbid
      proactive branch hygiene.
- [x] Local-env-rot retry policy: N/A, every failure matched command/harness code
      and no package-resolution or React-install signal appeared.
- [x] Workspace authority recorded: Plate owns project fan-out inventory;
      `/Users/zbeyens/.agents/skills` owns the shared workflow; installed CLI
      cache owns command semantics.
- [x] High-risk note: an unsafe narrow-refresh command can mutate unrelated
      global skills and create dozens of agent directories; proof includes
      negative command guards and exact destination accounting.
- [x] Review/P1 autoreview: N/A, branch is `next`, where repo policy forbids
      autoreview; the owning agent-native review and focused tests passed.
- [x] Agent-native review decision: required and completed with PASS verdict.
- [x] Output budget discipline: one initial unfiltered skill-list command
      streamed excess output; every later list/search was filtered and capped.
- [x] Agent-native pack: edited canonical global skill sources, not installed
      Plate mirrors.
- [x] Agent-native pack: named and broad refresh routes are discoverable in
      `skills-update`; cross-repo routing is discoverable in `sync-skills`.
- [x] Agent-native pack: generated mirror sync is N/A because no
      `.agents/rules/**` source changed.
- [x] Agent-native pack: reviewer found the legacy singular `agent` fallback;
      it was hard-cut and covered by a negative test.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named tests, path inventories, source audit, and validators | All focused proof passed; exact commands listed below. |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Old updater dry-run printed `skills update autogoal --project -y` for all three repos; installed CLI source proved the args are discarded. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | 4 Node tests pass; disposable real CLI install produced only `.agents` and `.claude`. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: JavaScript and JSON only; `node --check` and JSON parse passed. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: project skill lock was restored through targeted CLI; no package graph changed. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | Global canonical skills changed; no Plate rule generator applies. Both skills passed `quick_validate.py`. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Cleanup/list proof ran in Plate; helper tests/validators ran against `/Users/zbeyens/.agents/skills`; CLI semantics came from installed `skills@1.4.7`. |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A. |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Skill docs validated and every command claim is backed by installed CLI source or tests. |
| High-risk mini gate | yes | Record failure mode, proof plan, and chosen boundary | Failure mode and boundary are recorded in Findings/Decisions; negative guards and real CLI proof passed. |
| Agent-native review for agent/tooling changes | yes | Load reviewer and close accepted findings | PASS after hard-cutting the legacy `agent` fallback. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun exact failing command, or record N/A | N/A: no install-corruption signal. |
| P1 autoreview for non-trivial implementation changes | no | Run or record N/A | N/A: current branch is `next`; repo policy forbids autoreview there. |
| PR create or update | no | Run `check` before PR work and sync PR body | N/A: no PR requested. |
| Task-style PR body verified | no | Verify PR body | N/A: no PR. |
| PR proof image hosting | no | Host proof image or N/A | N/A: no PR/browser proof. |
| Tracker sync-back | no | Post tracker sync or N/A | N/A: no tracker. |
| Final handoff contract | yes | Fill exact final handoff fields | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Scoped `node --check`, Node tests, skill validators, JSON parse, and diff checks passed; repo lint is unrelated to global skill files. |
| Output budget discipline | yes | Verify bounded output or record recovery | Initial unfiltered list was excessive; all later audits were filtered/capped. |
| Timed checkpoint | no | Complete duration or N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-prevent-skills-cli-agent-fan-out.md` | Final rerun passes after closing this row and phase. |
| Agent source / generated sync | no | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | N/A: no `.agents/rules/**` change. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `skills-update` owns direct use; `sync-skills` routes cross-repo refreshes to it. |
| Agent-native review | yes | Load reviewer and close accepted findings | PASS; capability map recorded below. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | CLI source, filesystem provenance, and skill sources read | implementation |
| Implementation | completed | cleanup plus guarded helper, config, docs, tests, and memory correction | verification |
| Verification | completed | tests, validators, disposable CLI proof, path/list audits | closeout |
| PR / tracker sync | completed | N/A: none requested | final response |
| Closeout | completed | focused proof passed; final plan checker rerun is the last command | final response |

Findings:
- Installed Skills CLI is global `skills@1.4.7`. Its dispatcher calls
  `runUpdate()` for `update`/`upgrade` and discards every remaining argument;
  therefore a skill name, `--project`, or even `--help` cannot narrow or stop it.
- `runUpdate()` reads the global lock and spawns `skills add <source> -g -y` for
  every changed entry. The first mistaken call updated global
  `create-payment-credential`, `financial-insights`, and `autogoal`; the help
  probe later updated global `shadcn`.
- `--agent '*'` resolves to every one of the CLI's 45 agent identifiers. The
  project add created 28 top-level hidden agent directories, 25 links inside
  them, and `skills/autogoal`; `.agents/skills/autogoal` is the canonical copy
  and `.claude/skills/autogoal` is an approved existing project mirror.
- The first global update created 17 provably new cross-agent links at 11:13: 5 for
  `autogoal` beyond its older Claude link, and 6 each for
  `create-payment-credential` and `financial-insights`. The accidental help
  probe created 2 more `shadcn` links plus empty global `.codebuddy` and
  `.continue` directories at 11:57.
- Recurrence sources are live: `sync-skills` teaches wildcard add/remove,
  `skills-update` teaches invalid targeted update plus wildcard fallback, and
  `~/.agents/config.json` sets the target agent to `"*"`.

Decisions and tradeoffs:
- Keep current canonical skill contents. The update process deleted the prior
  directories and lock hashes, so rewinding global content would guess at an
  unproven historical revision.
- Remove only links/directories with exact creation time, shape, and canonical
  target evidence from the failed commands; leave every older/global user skill
  intact.
- Make `skills-update` the mechanical owner: targeted `add` only, explicit
  configured agents, dry-run by default, explicit `--apply`, and explicit
  `--all` for a broad configured refresh. `sync-skills` routes to that helper.

Implementation notes:
- Removed 28 exact project agent directories, their 25 Autogoal links, and the
  root `skills/autogoal` link. Kept only canonical `.agents/skills/autogoal` and
  approved `.claude/skills/autogoal`.
- Removed 19 exact global cross-agent links and 2 empty global agent directories
  created by the two bad update calls. Preserved every canonical global skill.
- Replaced updater `update`/wildcard behavior with targeted `add`, explicit
  `agents[]`, default dry-run, required `--apply`, and explicit `--all`.
- Changed personal config from `agent: "*"` to
  `agents: ["codex", "claude-code"]`.
- Repaired `sync-skills` so configured work routes through the guarded helper
  and unconfigured work requires an explicit agent allowlist.
- Added 4 focused Node tests and a future-memory correction note.

Agent-native capability map:
| User action | Agent route | Source owner | Mirror/lock/doc | Proof | Status |
|---|---|---|---|---|---|
| Refresh one configured skill | `skills-update <name>` dry-run then `--apply` | global `skills-update` script and SKILL | config plus target `skills-lock.json` | Node tests, dry-run, disposable real install | pass |
| Refresh every configured skill | `skills-update --all` dry-run then `--apply` | same | configured `skillSources` | no-arg rejection plus explicit-all dry-run | pass |
| Sync one unconfigured repo | `sync-skills` explicit targeted add | global `sync-skills` | repo lock and exact installed paths | source audit plus real targeted CLI proof | pass |

Review fixes:
- Accepted P1: legacy singular `agent` remained a compatibility path. Hard-cut
  the field, require `agents[]`, and test both `agent: "*"` and
  `agent: "codex"` rejection.
- Agent-native review verdict: PASS. Route, owner, proof, discoverability, and
  authority boundaries are present.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Ran `npx skills update --help`; CLI ignored `--help` and refreshed global `shadcn` | 1 | Inspect installed source directly; never invoke `update` for probing or mutation | Global content remains latest because no exact prior hash survives; no project diff was produced. |
| First disposable proof omitted `cd "$proof_dir"` and targeted Plate | 1 | Restore the remote lock with the explicit safe command, then rerun from a realpath-normalized temp cwd | Remote `udecode/dotai` lock restored; no unapproved destination appeared; corrected disposable proof passed. |
| First corrected harness compared `/tmp` with macOS `/private/tmp`; diagnostic retry used read-only zsh variable `status` | 2 | Normalize the temp path with `realpath` and use a task-specific exit variable | Strict harness passed with only `.agents`, `.claude`, and `skills-lock.json`. |
| Initial plan checker rejected its own pending evidence row and open closeout phase | 1 | Close the already-verified row and phase, then rerun | Expected incomplete result; final rerun follows this edit. |

Verification evidence:
- `node --test ~/.agents/skills/skills-update/scripts/update-skill.test.mjs` ->
  4/4 pass.
- `node --check` on helper and test -> pass.
- `quick_validate.py` on `skills-update` and `sync-skills` -> both valid.
- Named updater dry-run -> exactly three targeted `skills add` commands with
  `--agent codex claude-code`; no mutation.
- No-argument updater -> exit 2 with explicit `--all` requirement.
- Disposable real `skills@1.4.7` install -> only `.agents/skills/autogoal`,
  `.claude/skills/autogoal`, and `skills-lock.json`; no `.cortex` or root
  `skills/autogoal`.
- Project installed list -> Autogoal has the same six expected consumers as
  other Plate skills; filesystem has only canonical `.agents` plus `.claude`.
- Global installed list -> Autogoal is back to its older Claude link;
  `create-payment-credential` and `financial-insights` have no cross-agent
  links; Shadcn is back to its six pre-probe links.
- Config JSON parse, stale executable-guidance search, forbidden spawned-command
  search, canonical-content assertions, and diff checks -> pass.
- `check-complete.mjs` on this plan -> complete.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no tracker.
- Confidence line: high; exact provenance and focused behavioral proof passed.
- Flow table:
  - Reproduced: old dry-run emitted invalid update-all command; browser N/A.
  - Verified: 4/4 tests, strict disposable CLI install, exact path/list audits;
    browser N/A.
- Browser check: N/A: CLI/filesystem workflow.
- Outcome: unintended project/global links removed; safe updater and routing live.
- Caveat: the CLI destroyed prior content hashes for four refreshed global
  skills, so their latest valid canonical content remains rather than guessing
  a rollback revision.
- Design:
  - Chosen boundary: configured updater script plus config and sync-skill route.
  - Why not quick patch: prose alone cannot stop update-all or wildcard calls.
  - Why not broader change: patching third-party CLI distribution would be
    overwritten; the wrapper blocks unsafe arguments across CLI versions.
- Verified: exact commands and results listed above.
- PR body verified: N/A: no PR.

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
- Caveats: prior global content revisions are unrecoverable; current canonical
  versions are valid and preserved.

Timeline:
- 2026-08-31T09:54:19.218Z Task goal plan created.
- 2026-08-31T10:04:38Z Confirmed CLI dispatch/add semantics, exact project
  fan-out, global collateral, and three live recurrence sources.
- 2026-08-31T10:15:39Z Removed exact collateral, installed the fail-closed
  updater/config/docs/tests, completed agent-native review, and passed focused
  verification.
- 2026-08-31T10:18:00Z Closed the final evidence row after the checker correctly
  rejected the still-open closeout bookkeeping.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final response |
| Where am I going? | Complete the active goal and hand off exact results. |
| What is the goal? | Remove unintended fan-out and make narrow skill refresh fail closed. |
| What have I learned? | The CLI update command is unscopable and wildcard add targets 45 agents. |
| What have I done? | Cleaned exact collateral and verified the guarded replacement end to end. |

Open risks:
- Prior global content hashes for four refreshed skills are not recoverable from
  the current lock. Do not invent a rollback revision.
