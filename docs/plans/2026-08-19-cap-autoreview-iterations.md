# Cap Autoreview Iterations

Objective:
Cap Plate Autoreview loops at three runs per unchanged scope; done when Plate source rules, generated mirrors, templates, validation, and review agree; plan docs/plans/2026-08-19-cap-autoreview-iterations.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-19-cap-autoreview-iterations.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user request in this Codex task
- id / link: N/A: no external tracker
- title: Cap Autoreview iterations
- acceptance criteria: An Autoreview loop may invoke the helper at most three
  times for one unchanged review scope. The initial review is iteration 1;
  review-after-fix runs are iterations 2 and 3. A panel or a partitioned helper
  invocation counts once. After iteration 3, stop and report remaining verified
  findings instead of silently widening or resetting scope.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: binary contract change
- improvement loop: N/A: fixed three-run acceptance threshold
- final score / loop closure: N/A: command and source-audit closure

Completion threshold:
- Plate's central agent policy and every conflicting local caller/template
  define the exact three-run cap without adding cross-run state machinery.
- The externally installed Autoreview skill remains untouched: current upstream
  already defaults to one pass, while Plate owns its explicit closeout loops.
- Plate install/sync, focused source audits, lint, P1 Autoreview, agent-native
  review, and this plan checker pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-cap-autoreview-iterations.md` passes.

Verification surface:
- Source audit of current upstream's one-pass default and Plate's bounded caller
  policy.
- Plate `pnpm install`, generated mirror/source audit, `pnpm lint:fix`, and P1
  `autoreview --mode local` for Plate-local policy edits.
- Agent-native capability map and final goal-plan checker.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Count helper invocations, not internal partition passes or panel reviewers.
- Do not add persistent iteration state to the single-run helper.
- Do not commit, push, publish, or open public comments.

Boundaries:
- Source of truth: `.agents/AGENTS.md` for Plate's review-loop policy and
  `.agents/rules/*.mdc` plus `docs/plans/templates/*.md` for local callers;
  `.agents/skills/**` and root `AGENTS.md` are sync output.
- Allowed edit scope: Plate caller rules/templates that contradict the cap,
  generated Plate mirrors, and this plan. Canonical Autoreview is read-only.
- Browser surface: N/A: agent workflow text only.
- Browser strategy: N/A: no product/browser surface changes.
- Tracker sync: N/A: no issue or PR requested.
- Non-goals: helper-side persistent counters, product code, benchmark behavior,
  public GitHub mutation, commits, pushes, and whole-branch review.

Output budget strategy:
- Read exact skill/rule files and capped `rg` results only. Exclude generated
  templates, `.tmp`, `node_modules`, build artifacts, and package sources unless
  a sync command names them. Cap ordinary output at 30k tokens.

Blocked condition:
- Stop only if Plate cannot regenerate its local rules/templates without
  destructive unrelated changes, or the exact P1 review cannot run.

Task state:
- task_type: agent-workflow contract repair
- task_complexity: micro
- current_phase: closeout
- current_phase_status: completed
- next_phase: N/A: complete
- goal_status: complete

Current verdict:
- verdict: pass
- confidence: high
- next owner: user
- reason: The exact three-invocation cap is present in Plate's durable caller
  policy, conflicting loops are repaired, mirrors are synced, and all named
  proof plus P1 review passed.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-cap-autoreview-iterations.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact three-iteration requirement and counting semantics recorded above before source edits |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Loaded `skill-creator`, `autogoal`, `autoreview`, and `agent-native-reviewer` |
| Active goal checked or created | yes | `get_goal` returned null; goal will be created from this filled plan before source edits |
| Source of truth read before edits | yes | Fresh canonical checkout proves upstream defaults to one pass; Plate `.agents/AGENTS.md` and local caller rules own the explicit closeout loops |
| Tracker comments and attachments read | no | N/A: no tracker |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: micro skill-policy edit, no product code |
| TDD decision before behavior change or bug fix | no | N/A: prose contract; source audit and skill validation are stronger proof |
| Branch decision for code-changing task | no | N/A: no branch/commit/PR requested |
| Release artifact decision | no | N/A: no package behavior or release artifact |
| Browser tool decision for browser surface | no | N/A: no browser surface |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Exact/capped reads and noisy-tree exclusions recorded above |
| Agent-native pack selected | yes | `agent-native` pack materialized in this plan |
| Agent-facing action surface identified | yes | Autoreview fix-and-rerun loop |
| Source rule versus generated mirror boundary identified | yes | Plate `.agents/AGENTS.md`, `.agents/rules/*.mdc`, and plan templates are source; root `AGENTS.md` and `.agents/skills/*` are generated mirrors |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded before edits; final capability-map review required |

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
      `<video-transcripts>` XML, or marked N/A with reason. N/A: no video.
- [x] Nearby repo instructions and implementation patterns read before edits:
      Plate root instructions plus installed Autoreview ownership instructions.
- [x] Implementation fixes the right ownership boundary: Plate caller policy,
      not the external one-pass Autoreview package.
- [x] Release artifact requirement recorded: N/A: skill policy only.
- [x] Final handoff shape decided: concise outcome, exact count semantics,
      changed owners, verification, and no-commit/push status.
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded: N/A: no branch operation requested.
- [x] Local-env-rot retry policy recorded: N/A unless install/test output shows
      the named React/module corruption signals.
- [x] Workspace authority recorded: all implementation and proof commands ran
      in `/Users/zbeyens/git/plate-2`; upstream was read from the fresh
      `/Users/zbeyens/git/agent-skills` checkout only.
- [x] High-risk note recorded for the agent-action contract: failure mode is an
      unbounded costly loop; proof is source/mirror/caller audit plus review.
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/P1 autoreview target selected from actual diff state: dirty local
      `--mode local --max-priority P1`.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Agent-native pack: source-of-truth boundary identified; Plate caller
      sources will be edited and installed external Autoreview left untouched.
- [x] Agent-native pack: the changed action is discoverable from Autoreview's
      core Contract and Scope Governor.
- [x] Agent-native pack: `pnpm install` synced generated rule and root mirrors.
- [x] Agent-native pack: capability-map review passed with no accepted findings.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | 58/58 focused tests, source audit, v103 validation, mirror sync, lint, and P1 review passed |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: policy-bound change, not a runtime bug |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Fail-closed source audit found the cap in every named source/mirror and zero stale unbounded phrases |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: Markdown, MDC, and JSON doctrine only |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package files or exports |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest or lockfile change; `pnpm install` still passed for rule sync |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed twice; root and Task/Patch/Autoclosure mirrors contain the cap |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All proof ran in `/Users/zbeyens/git/plate-2`; upstream checkout was read-only evidence |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: no browser surface |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A: no browser surface |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: `docs/plans/templates` is agent workflow source, not CI-controlled `templates/**` output |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no published package behavior |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry component |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Workflow templates were source-audited and `pnpm lint:fix` passed |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode was an unbounded costly review loop; caller policy is the owner and exact source/mirror audit is the proof |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | PASS capability map; no findings |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no corruption signal |
| P1 autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; run dirty local `--mode local --max-priority P1`; fix and rerun only within the hard cap of three helper invocations for one unchanged scope | Invocation 1/3 clean; zero accepted/actionable findings, confidence 0.83 |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body` | N/A: no PR |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR or browser proof |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker |
| Final handoff contract | yes | Fill the final handoff fields below | Filled below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Passed; 15 pre-existing oversized-artifact warnings and no fixes |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Exact/capped reads and searches used; no unbounded artifact scan streamed |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-cap-autoreview-iterations.md` | Final command after this ledger update |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | Passed; external Autoreview directory had zero local diff |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Central `.agents/AGENTS.md` and Task/Patch/Autoclosure sources expose count and stop behavior |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | PASS; route, owner, mirror, proof, and handoff are present |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Read Plate and canonical ownership; upstream already defaults to one pass | implementation |
| Implementation | completed | Added central cap, repaired callers/templates, bumped doctrine to v103, regenerated mirrors | verification |
| Verification | completed | 58/58 tests, source audit, sync check, v103 validation, lint, and P1 invocation 1 clean | closeout |
| PR / tracker sync | completed | N/A: no PR/tracker requested | final response |
| Closeout | completed | Goal ledger complete; checker is the final gate | final response |

Findings:
- Fresh `openclaw/agent-skills` upstream defaults to one review pass. Plate's
  local caller rules created the unbounded retry behavior, so they own the cap.
- `pnpm install` kept the external Autoreview directory untouched and synced
  every Plate-owned generated mirror.
- Agent-native capability map: user request -> Plate Autoreview routing ->
  `.agents/AGENTS.md` and Task/Patch/Autoclosure sources -> root/generated
  mirrors and plan templates -> install/source audit/tests -> PASS.

Decisions and tradeoffs:
- Count top-level helper invocations, not internal partition passes or panel
  reviewers, so one oversized review does not consume the retry budget by
  implementation detail.
- Keep the external package unchanged because its one-pass default is already
  stricter; Plate owns its explicit closeout loops.
- Stop not-clean after invocation 3. Silently starting a fourth review would
  make the cap bullshit.

Implementation notes:
- Central policy lives in `.agents/AGENTS.md`; Task, Patch, Autoclosure, and the
  four affected templates repeat only the caller-specific behavior.
- Plate Next doctrine v103 records the reusable rule without mass-attesting any
  package.

Review fixes:
- Agent-native review: no accepted findings.
- P1 Autoreview invocation 1/3: clean, no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Looked first at sibling `../autoreview`, which is an unrelated macOS app | 1 | Resolve the canonical owner from installed Autoreview `AGENTS.md` and search exact skill paths | Cloned/read fresh `openclaw/agent-skills` checkout; no edit made to the unrelated repo |
| Plate Next validation reported an unversioned doctrine fingerprint | 1 | Bump the owning doctrine instead of bypassing validation | Added immutable v103 entry and regenerated fingerprint; validation passed |
| Generic `quick_validate.py` rejected Plate's supported `argument-hint` and `disable-model-invocation` frontmatter | 1 | Use Plate's own skiller generation, mirror parity, contract tests, and version validation | Repo-owned checks passed; generic validator recorded as inapplicable |

Verification evidence:
- `/Users/zbeyens/git/plate-2`: `pnpm install` -> passed; rules and mirrors synced.
- `/Users/zbeyens/git/plate-2`: focused Node suite -> 58/58 passed.
- `/Users/zbeyens/git/plate-2`: `sync-resources.mjs --check` -> exact.
- `/Users/zbeyens/git/plate-2`: `version.mjs validate` -> Plate Next v103 valid,
  44 active and 2 retired.
- `/Users/zbeyens/git/plate-2`: fail-closed stale-loop/source-mirror audit -> passed.
- `/Users/zbeyens/git/plate-2`: `pnpm lint:fix` -> passed with 15 unrelated
  oversized-artifact warnings and no fixes.
- `/Users/zbeyens/git/plate-2`: `git diff --check` -> passed.
- `/Users/zbeyens/git/plate-2`: P1 Autoreview invocation 1/3 -> clean, confidence 0.83.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: no tracker
- Confidence line: High; exact policy, sync, source audit, contract suite, and P1 review passed
- Flow table:
  - Reproduced: source audit found the old unbounded caller phrases; browser N/A
  - Verified: 58/58 tests and stale-phrase audit passed; browser N/A
- Browser check: N/A: no browser surface
- Outcome: Plate Autoreview loops have a hard three-helper-invocation cap per unchanged scope.
- Caveat: A non-clean third review blocks a clean handoff; it does not authorize a fourth run.
- Design:
  - Chosen boundary: Plate caller policy and affected workflow sources/templates
  - Why not quick patch: Editing the installed external skill would be overwritten and upstream already defaults to one pass.
  - Why not broader change: Persistent helper state is needless machinery for a caller-owned loop bound.
- Verified: install, 58 tests, sync/version/source audits, lint, diff check, agent-native PASS, P1 clean
- PR body verified: N/A: no PR

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
- PR: N/A: no PR requested
- Issue / tracker: N/A: no tracker
- Browser proof: N/A: no browser surface
- Caveats: No commit or push was requested; package doctrine attestations remain at their last proven versions by version law.

Timeline:
- 2026-08-19T09:06:39.940Z Task goal plan created.
- 2026-08-19 Canonical source audit showed upstream defaults to one pass;
  selected Plate caller policy as owner.
- 2026-08-19 Added the cap, repaired local callers/templates, and bumped Plate
  Next doctrine to v103.
- 2026-08-19 Regenerated mirrors and passed 58/58 tests, sync/version/source
  audits, lint, diff check, agent-native review, and P1 Autoreview invocation 1.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final goal-plan check |
| Where am I going? | Goal completion and concise handoff |
| What is the goal? | Cap Plate Autoreview loops at three helper invocations per unchanged scope |
| What have I learned? | Plate caller rules, not upstream's one-pass skill, owned the unbounded loop |
| What have I done? | Added the cap, repaired callers/templates, bumped v103, synced mirrors, and passed verification/review |

Open risks:
- No product/runtime risk. If invocation 3 still reports a verified P1 finding,
  the workflow intentionally stops not-clean and needs a follow-up decision.
