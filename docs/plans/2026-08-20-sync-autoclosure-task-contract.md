# sync autoclosure task contract

Objective:
Sync autoclosure and per-PR task enforcement into Plate; done when source
owners, generated mirrors, checks, and a compliant PR are verified.

Goal plan:
docs/plans/2026-08-20-sync-autoclosure-task-contract.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Flow mode:
- one-shot execution

Linked plans:
- None.

Task source:
- type: user-requested cross-repository workflow sync
- id / link: `../better-convex` -> `../plate`
- title: copy autoclosure and per-PR task requirements into Plate
- acceptance criteria: Plate owns an adapted `autoclosure` rule and plan
  template; every PR requires one exact `task` invocation and plan; invalid PRs
  are commented and closed with the GPT-5.6 high-effort recommendation; source
  owners regenerate all mirrors; Plate checks pass; and the delivery PR itself
  carries valid exact task evidence.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A; no timed request.
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Source-owned Plate rules, templates, and AGENTS guidance implement the
  autoclosure and per-PR task contract without kitcn product/package policy.
- `pnpm install` regenerates root, Codex, and Claude mirrors; source/mirror
  audits find the exact contract and no stale missing-plan PR-body shape.
- `agent-native-reviewer`, `autoreview`, `pnpm lint:fix`, and `pnpm check` pass
  with no accepted/actionable finding remaining.
- A dedicated task-style PR contains this plan at its exact head, names that
  plan in its body, and identifies the exact PR.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-sync-autoclosure-task-contract.md` passes.

Verification surface:
- Compare better-convex and Plate source owners section-by-section.
- Run `pnpm install`, source/mirror `rg` audits, both agent reviews,
  `pnpm lint:fix`, `pnpm check`, and the goal-plan checker from `../plate`.
- Read back the exact PR body, head OID, plan-at-head, checks, and task ownership
  through `gh`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: better-convex autoclosure/task common contract plus Plate's
  `.agents/AGENTS.md`, `.agents/rules/task.mdc`, templates, and VISION forks.
- Allowed edit scope: Plate agent source rules, project-owned goal templates,
  generated agent mirrors/root guidance, this task plan, and delivery metadata.
- Browser surface: N/A; no UI or rendered product output.
- Tracker sync: N/A; no issue or Linear item owns this request.
- Non-goals: Plate product/package behavior, kitcn-specific package/fixture/docs
  lanes, external skill ownership changes, or manual `skills-lock.json` edits.

Output budget strategy:
- Read named source/destination owners in bounded ranges, compare headings and
  exact contract phrases, and cap generated diff/check output. Exclude package
  source, build output, node_modules, templates, and app artifacts unless a
  named verification failure points there.

Blocked condition:
- Stop if Plate ownership conflicts with the required close/comment/merge
  semantics, generated sync cannot reproduce mirrors, required checks keep
  failing after an owner-specific repair, or GitHub cannot create/read back a
  compliant PR.

Task state:
- task_type: agent-workflow sync
- task_complexity: non-trivial
- current_phase: PR / tracker sync
- current_phase_status: in_progress
- next_phase: closeout
- goal_status: active

Current verdict:
- verdict: ready
- confidence: high
- next owner: task
- reason: exact source/destination owners and repo-specific forks are known.

Pre-solution issue challenge:
- reporter claim: N/A; direct workflow-copy request, not a bug report.
- suggested diagnosis or fix: port common contract through Plate source owners,
  not generated mirrors.
- repro ladder:
  - tests / source-level repro: source inventory proves Plate lacks autoclosure
    and its task contract lacks per-PR evidence gates.
  - Playwright / automated browser: N/A; no browser behavior.
  - Browser plugin: N/A; no browser behavior.
  - screenshot / visual proof: N/A; no visual output.
- reproduction verdict: N/A; source-gap audit replaces runtime reproduction.
- validity verdict: valid.
- best long-term fix boundary: Plate `.agents` source rules, project templates,
  and `.agents/AGENTS.md`, regenerated by `pnpm install`.
- harsh honest feedback: copying generated `SKILL.md` files would be wrong and
  would be overwritten; source-level adaptation is mandatory.
- hard-stop decision: proceed with the source-owned sync.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-sync-autoclosure-task-contract.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | `sync-skills`, `autogoal`, and `task` loaded; agent reviews selected for closeout. |
| Active goal checked or created | yes | Active goal names this exact plan and completion threshold. |
| Source of truth read before edits | yes | Both AGENTS sources, skiller configs, VISION files, autoclosure source/template, and Plate task source/template read. |
| Tracker comments and attachments read | no | N/A: no tracker source. |
| Video transcript evidence required | no | N/A: no video evidence. |
| Pre-solution issue challenge required | no | N/A: direct workflow request, not public issue claim. |
| Reproduction verdict before implementation | yes | Source inventory proves missing autoclosure and missing per-PR task gates. |
| Repro escalation ladder selected | no | N/A: static agent contract, no runtime/browser behavior. |
| Suggested fix reviewed against durable boundary | yes | Patch source rules/templates and regenerate; never edit generated mirrors. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: explicit cross-repo contract sources own the change. |
| TDD decision before behavior change or bug fix | no | N/A: declarative agent workflow sync; source/mirror audits are the honest proof. |
| Branch decision for code-changing task | yes | `codex/sync-autoclosure-task-contract` created from Plate `main`. |
| Release artifact decision | no | N/A: no package or registry behavior; no changeset/changelog. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | yes | `task` requires a dedicated verified PR for this non-trivial agent change. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Named bounded owner reads and capped generated/check output. |
| Agent-native pack selected | yes | Materialized in this plan. |
| Agent-facing action surface identified | yes | PR task evidence, invalid-PR comment/close, feedback/P1 gate, receipt, and delivery actions. |
| Source rule versus generated mirror boundary identified | yes | `.agents/AGENTS.md` and `.agents/rules/*.mdc` are source; root/skills are generated. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Required after implementation; skill source already identified and will be loaded fully before use. |

Work Checklist:
- [x] N/A: no duration requested.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] N/A: no video or screen recording.
- [x] N/A: no public tracker bug/diagnosis claim.
- [x] N/A: static source-gap audit replaces the runtime repro ladder.
- [x] N/A: no invalid/not-reproduced bug claim.
- [x] Nearby repo instructions, VISION, source owners, templates, and generated
      ownership metadata read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] N/A: no package release artifact or registry changelog.
- [x] Final handoff shape decided: PR, confidence, source/mirror sync, reviews,
      checks, preserved forks, and deliberate non-syncs.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Local-env-rot policy: use `pnpm run reinstall` once only if failures show
      the documented React/install corruption signature; otherwise N/A.
- [x] Workspace authority recorded: every proof command runs in `../plate`;
      GitHub read-back uses the Plate repository.
- [x] High-risk note: a bad gate could close a compliant PR or merge with
      unresolved P1 feedback; exact immutable-head evidence, unfiltered
      feedback inventory, read-back receipts, reviews, and generated audits
      prove the durable boundary.
- [x] Review target selected: dirty local agent contract for
      `agent-native-reviewer`, then `autoreview --mode local`.
- [x] Agent-native review required after the source and generated diff exists.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Contract audit and `pnpm check` passed in Plate. |
| Pre-solution issue challenge verdict | no | N/A: direct workflow request, not tracker bug. | N/A |
| Repro escalation ladder | no | N/A: no runtime/browser claim. | N/A |
| Bug reproduced before fix | no | N/A: no bug. | N/A |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Source/mirror assertions and clean structured review passed. |
| TypeScript or typed config changed | no | N/A: Markdown/TOML-owned agent contract only. | N/A |
| Package exports or file layout changed | no | N/A: no package exports. | N/A |
| Package manifests, lockfile, or install graph changed | no | N/A: `pnpm install` is generated sync only; no manifest/lock owner change intended. | N/A |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | Passed in `/Users/zbeyens/git/plate`; root/Codex/Claude mirrors regenerated. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All install/audit/lint/check/review commands ran in `/Users/zbeyens/git/plate`. |
| Browser surface changed | no | N/A: no browser surface. | N/A |
| Browser final proof | no | N/A: no rendered output. | N/A |
| CI-controlled template output changed | no | N/A: `docs/plans/templates/**` are project-owned workflow templates, not Plate registry templates. | N/A |
| Package behavior or public API changed | no | N/A: no package/API change or changeset. | N/A |
| User-visible registry output changed | no | N/A: no registry output. | N/A |
| Docs or content changed | no | N/A: operational goal plans/rules only; no public docs/content. | N/A |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Exact-head evidence and P1 receipt gates prevent compliant-close and unresolved-P1 failure modes; source-owned boundary survives generation. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Incremental review PASS; discoverability/shared-workspace parity intact. |
| Local install corruption suspected | no | N/A unless a documented corruption signature appears. | N/A |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | Local review found one P1 bootstrap defect; fixed/regenerated; rerun exited clean with no findings. |
| PR create or update | pending | Run `check` before PR work and sync PR body to the task-style final handoff | pending |
| Task-style PR body verified | pending | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | pending |
| PR proof image hosting | no | N/A: no browser proof image. | N/A |
| Tracker sync-back | no | N/A: no tracker. | N/A |
| Final handoff contract | pending | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | pending |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Passed; 3,286 files checked, no fixes. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Bounded owner reads/audits; full required check output was capped and polled. |
| Timed checkpoint | no | N/A: no duration requested. | N/A |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-sync-autoclosure-task-contract.md` | pending |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | Passed; generated source metadata and Claude symlink verified. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Root AGENTS plus generated `task` and `autoclosure` skills expose the actions. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | PASS; no accepted finding. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | source/destination owners and forks inventoried | implementation |
| Implementation | completed | source rules/templates patched; managed mirrors regenerated | verification |
| Verification | completed | source/mirror audits, reviews, lint, and full check passed | PR sync |
| PR / tracker sync | in_progress | dedicated branch staged | final response |
| Closeout | pending | | final response |

Findings:
- Plate has task/autogoal/resolve-pr-feedback/agent-native-reviewer/autoreview,
  but no source-owned autoclosure rule or template.
- Plate task already owns rich tracker/security/docs/registry forks; only the
  common per-PR task evidence and shipping contract should be merged.
- Plate generated mirrors are produced from `.agents` sources by `pnpm install`.

Decisions and tradeoffs:
- Adapt `bun` commands and kitcn lanes to Plate `pnpm`, registry, docs, browser,
  template-output, and package ownership.
- Keep `resolve-pr-feedback` as the live-feedback owner; do not resurrect the
  excluded legacy `pr-comment-resolver`.
- Do not add a new external skill or edit `skills-lock.json`; autoclosure is a
  repo-local rule and all required hard-gate dependencies already exist.

Implementation notes:
- Dedicated branch: `codex/sync-autoclosure-task-contract`.
- Added Plate-owned autoclosure rule/template and merged common per-PR task
  evidence into Plate's AGENTS/task owners without replacing tracker, security,
  docs, registry, package, or browser forks.
- `pnpm install` regenerated root AGENTS plus Codex/Claude task and autoclosure
  mirrors; package lock and external skill lock stayed unchanged.
- Delivery PR is not yet created; this plan owns that exact future PR slice.

Review fixes:
- Agent-native incremental review: PASS. New actions are discoverable through
  root AGENTS and generated `task`/`autoclosure` skills; agent and user share
  the same PR, git ref, plan, and GitHub feedback surfaces; no UI action or
  isolated agent workspace exists. No actionable parity finding.
- Accepted autoreview P1: autoclosure's unconditional PR compliance gate
  dead-ended its advertised local-tree path. Added an explicit no-PR bootstrap:
  require the dedicated current task plan, finish local proof, create the PR at
  delivery, record and push exact PR ownership, then enforce compliance before
  feedback or merge.
- Final structured autoreview rerun: clean, zero accepted/actionable findings,
  overall correctness `patch is correct` at 0.82 confidence.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Autoreview refused an untracked generated Claude skill symlink as sensitive | 1 | Stage the authorized whole-checkout task patch, then rerun the same local review | Resolved by staging the authorized full patch. |
| Autoreview found no-PR autoclosure bootstrap dead-end | 1 | Add explicit local slice -> PR delivery -> compliance ordering | Fixed in source rule/template; pending generated sync and review rerun. |

Verification evidence:
- Initial source inventory confirmed better-convex owns autoclosure in
  `.agents/rules/autoclosure.mdc` plus
  `docs/plans/templates/autoclosure.md`; Plate lacked both before this patch.
- `pnpm install` in `/Users/zbeyens/git/plate` completed and generated
  `.agents/skills/autoclosure/SKILL.md`, `.claude/skills/autoclosure/SKILL.md`,
  task mirrors, and root `AGENTS.md` from Plate source owners.
- Source/mirror audits found `$task`, GPT-5.6 high-or-higher, exact task-plan
  evidence, P1 replay, terminal receipt, and `pnpm check`; no donor kitcn/bun,
  fixture/scenario, package-skill, `auto`, or `deslop` contract remains.
- `git diff --cached --check` and contract assertions passed.
- `pnpm lint:fix` passed with no fixes.
- `pnpm check` passed: lint, 54 package builds, 54 package typechecks, and all
  fast, slow, and slowest test lanes completed with zero failures. One existing
  sidebar hook warning remained non-blocking.

Final handoff contract:
- PR line: exact dedicated PR URL and final state.
- Issue / tracker line: N/A; direct user request.
- Confidence line: evidence-bound after generated sync, reviews, checks, and PR
  read-back.
- Flow table:
  - Reproduced: Plate source-gap audit; browser N/A.
  - Verified: source/mirror audits and checks; browser N/A.
- Browser check: N/A; no rendered surface.
- Outcome: Plate owns autoclosure and per-PR task enforcement.
- Caveat: no product/package behavior and no external skill ownership change.
- Design:
  - Chosen boundary: `.agents` sources plus project-owned goal templates.
  - Why not quick patch: generated `SKILL.md` edits are overwritten.
  - Why not broader change: Plate product and external skill forks are not part
    of this workflow port.
- Verified: pending generated sync, reviews, lint/check, checker, and PR proof.
- PR body verified: pending exact task plan/body/head read-back.

Task-style PR body contract:
- Preserve any existing `<!-- auto-release:start -->` block. If a changeset is
  part of the diff and repo policy expects auto release, include that block.
- Use the accepted kitcn PR #270 visual format. The body starts with an emoji
  issue/tracker/fix line, for example `🐛 Fixes #123` or `🐛 Fixes ➖ N/A`, then
  exactly one
  `🧭 Task plan: docs/plans/2026-08-20-sync-autoclosure-task-contract.md`
  line, then an emoji confidence line like `🟢 95-100% confidence`.
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
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: preserve Plate-specific task/tracker/security/docs/registry forks.

Timeline:
- 2026-08-20T11:08:39.098Z Task goal plan created.
- 2026-08-20 Source/destination instructions, VISION, task/autoclosure owners,
  templates, dependencies, and generated ownership inventoried; active goal
  created; dedicated branch selected.
- 2026-08-20 Plate source owners patched; `pnpm install` regenerated mirrors;
  source/mirror and agent-native parity audits passed.
- 2026-08-20 Autoreview P1 repaired and clean rerun completed; lint and full
  repository check passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | PR / tracker sync |
| Where am I going? | Dedicated PR creation, exact task evidence, closeout |
| What is the goal? | Port autoclosure and exact per-PR task enforcement into Plate. |
| What have I learned? | See Findings |
| What have I done? | Implemented, regenerated, reviewed, linted, and passed the full repository gate. |

Open risks:
- A too-literal copy could import kitcn-only lanes or conflict with Plate's
  explicit merge override; implementation must preserve Plate policy while
  keeping immutable-head/P1/read-back safety intact.
