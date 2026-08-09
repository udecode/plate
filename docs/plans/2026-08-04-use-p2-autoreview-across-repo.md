# Use P2 autoreview across repo

Objective:
Make P2 the explicit Plate autoreview ceiling; done when every live repo-owned
invocation and policy uses `--max-priority P2`, P3 remains opt-in, and
source/mirror audits pass.

Goal plan:
docs/plans/2026-08-04-use-p2-autoreview-across-repo.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: direct user request
- id / link: current Codex task
- title: Update all autoreview references to use P2
- acceptance criteria: every live repo-owned autoreview invocation and policy,
  including `docs/plans/templates/task.md`, explicitly selects P2; P3 remains
  opt-in; generated skill mirrors match their source rules.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A; no duration requested
- semantics: N/A
- initial confidence score: 90%
- improvement loop: audit, edit source owners, regenerate, audit again, review
- final score / loop closure: 98%; source/mirror audits and both P2 review lanes clean

Completion threshold:
- Zero default live repo-owned autoreview commands or policy references omit
  the explicit P2 ceiling; an explicit P3 request overrides it with P3.
- `docs/plans/templates/task.md` and every active plan template/policy use
  `--max-priority P2`; P3 is documented as opt-in only.
- `.agents/rules/**` remains the source of truth, `pnpm install` regenerates
  mirrors, the autoreview helper self-test passes, agent-native review closes,
  and autoreview itself passes at P2.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-04-use-p2-autoreview-across-repo.md` passes.

Verification surface:
- A scoped `rg` inventory and a negative audit for live references missing P2.
- `pnpm install` plus source/generated mirror comparison.
- `.agents/skills/autoreview/scripts/autoreview --self-test`.
- Agent-native review and local autoreview with `--max-priority P2`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.agents/AGENTS.md`, `.agents/rules/*.mdc`, active plan
  templates, and repo-owned scripts/config that invoke autoreview.
- Allowed edit scope: active workflow sources and their generated mirrors;
  historical completed plans/evidence are audited but not rewritten as policy.
- Browser surface: N/A; agent workflow prose and shell behavior only.
- Browser strategy: N/A. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A; no external tracker or PR requested.
- Non-goals: changing finding semantics, making P3 default, rewriting historical
  execution records, or creating a commit/PR.

Output budget strategy:
- Count and list matching files first; inspect active source directories in
  bounded chunks; exclude dependencies, caches, generated registry output, and
  git internals from broad searches.

Blocked condition:
- Block only if source generation fails repeatedly or live references cannot be
  classified without changing historical records; neither is currently true.

Task state:
- task_type: agent workflow policy migration
- task_complexity: non-trivial repo-wide source/mirror update
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: P2 should be explicit at every live invocation; helper defaults alone
  are too easy to drift.
- confidence: 98%
- next owner: task
- reason: explicit call-site policy makes the Plate ceiling durable even when
  the shared helper's own default changes.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-04-use-p2-autoreview-across-repo.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | This plan copies the P2, all-references, task-template, and P3 opt-in requirements |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | `autogoal` then `task`; agent-native pack selected |
| Active goal checked or created | yes | Active goal created for this plan |
| Source of truth read before edits | yes | Root instructions identify `.agents/rules/**` and `.agents/AGENTS.md` as source |
| Tracker comments and attachments read | no | N/A: direct request, no tracker |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: policy/reference migration, no product diagnosis |
| TDD decision before behavior change or bug fix | no | N/A: no product behavior change |
| Branch decision for code-changing task | no | N/A: no branch/commit requested |
| Release artifact decision | no | N/A: no package behavior or release artifact |
| Browser tool decision for browser surface | no | N/A: no browser surface |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Scoped/count-first search recorded above |
| Agent-native pack selected | yes | Generated with `--with agent-native` |
| Agent-facing action surface identified | yes | Autoreview commands and policy prose |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; regenerate `.agents/skills/**` with `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded all 236 lines; capability map and source/mirror proof closed |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
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
      N/A; no install-corruption signal occurred.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/P2 autoreview target selected from actual diff state for
      non-trivial implementation work: local mode with `--max-priority P2`.
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
| Named verification threshold | yes | Run named proof and source audits | Zero unmatched active source and generated-mirror references |
| Bug reproduced before fix | no | N/A with reason | N/A: policy migration, not a product bug |
| Targeted behavior verification | yes | Run focused proof | Self-test, 40 unit tests, syntax check, source/mirror audits |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: no TypeScript or typed config changed |
| Package exports or file layout changed | no | Run `pnpm brl` | N/A: no exports or file moves |
| Package manifests, lockfile, or install graph changed | no | Run install checks | N/A: no manifest/install-graph change in this P2 packet; `pnpm install` passed |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | Final install passed; mirror audit clean |
| Workspace authority proof | yes | Run proof in owning workspace | All commands ran in `/Users/zbeyens/git/plate-2` |
| Browser surface changed | no | Capture Browser proof | N/A: no browser surface |
| Browser final proof | no | Attach Browser proof | N/A: no browser surface |
| CI-controlled template output changed | no | Restore generated output | N/A: plan templates are source, not `templates/**` output |
| Package behavior or public API changed | no | Add a changeset | N/A: workflow policy only |
| Registry-only component work changed | no | Update component changelog | N/A: no registry component work |
| Docs or content changed | yes | Verify source-backed claims | Active templates and policy prose source-audited; no rendered surface |
| High-risk mini gate | yes | Record failure mode and proof | P3 override and no-review-lane narrowing were found and fixed |
| Agent-native review for agent/tooling changes | yes | Load reviewer and close findings | PASS: route, source owner, mirror, proof, and discoverability complete |
| Local install corruption suspected | no | Run reinstall or N/A | N/A: no corruption signal |
| P2 autoreview for non-trivial implementation changes | yes | Run with `--max-priority P2`; explicit P3 overrides | Full migration clean at 0.90 confidence; isolated Plate Next lines clean at 0.98 |
| PR create or update | no | Run `check` before PR work | N/A: no PR requested |
| Task-style PR body verified | no | Verify PR body | N/A: no PR |
| PR proof image hosting | no | Host proof images | N/A: no PR or browser proof |
| Tracker sync-back | no | Post tracker sync | N/A: no tracker |
| Final handoff contract | yes | Fill fields below | Filled below |
| Final lint | yes | Run scoped equivalent | `git diff --check`, cached diff check, and `node --check` passed |
| Output budget discipline | yes | Verify bounded output | Searches were scoped/capped; historical plans excluded |
| Timed checkpoint | no | Complete requested duration | N/A: no duration requested |
| Goal plan complete | yes | Run final checker | Rerun after this update |
| Agent source / generated sync | yes | Run `pnpm install` and audit mirrors | Final install passed; zero unmatched generated references |
| Agent action discoverability | yes | Source-audit action routes | Root AGENTS, rules, and every active template name P2 |
| Agent-native review | yes | Close accepted findings | PASS; no remaining route, ownership, mirror, proof, or discoverability gap |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | requirement contract and bounded live-reference inventory recorded | implementation |
| Implementation | complete | source rules, active templates, queue source/output, and vision updated | verification |
| Verification | complete | self-test, 40 tests, syntax/diff checks, audits, agent-native review, clean P2 reviews | closeout |
| PR / tracker sync | complete | N/A: neither requested | final response |
| Closeout | complete | final checker pending immediately after this update | final response |

Findings:
- The shared upstream autoreview skill defaults to P0. Plate must therefore pass
  `--max-priority P2` explicitly at every live action boundary.
- `docs/plans/**` contains hundreds of completed execution records. Rewriting
  them would falsify history; active templates and the current plan are the
  durable migration boundary.

Decisions and tradeoffs:
- Keep the external helper generic and preserve its upstream P0 default. Plate
  owns the broader P2 policy in callers and templates. P3 remains opt-in.

Implementation notes:
- Updated `.agents/AGENTS.md`, relevant `.agents/rules/**`, all active plan
  templates, maintainer queue generation/output, and vision references.

Review fixes:
- Preserved the no-autoreview-at-any-priority contract for `sync-main-to-next`.
- Kept `$autoreview` as the skill identifier and placed CLI arguments in prose.
- Preserved advisory-tool access for explicit P3 reviews.
- Made P2 the default while allowing an explicit P3 request to override it.
- Updated the current plan's own live autoreview checklist to P2.
- Rejected unrelated Plate Next version findings, isolated the three
  task-specific Plate Next lines, and obtained a clean P2 review.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `python3 -m unittest <path>` treated the path as an empty module | 1 | Run the test file directly | 40 tests passed |
| Full local autoreview hit fake credentialed URI literals in earlier staged upstream tests | 1 | Locate paths; isolate exact task bytes without bypassing TruffleHog | Scoped scans clean |
| Codex CLI 0.139.0 cannot run `gpt-5.6-sol` | 3 | Use bundled ChatGPT Codex CLI 0.146.0-alpha.9.2 | Same Sol model ran successfully |
| Focused review omitted changed action boundaries and inferred they were absent | 1 | Rerun complete migration bundle | Rejected as stale-by-scope; full pass clean |

Verification evidence:
- `pnpm install` passed after final source edits and regenerated mirrors.
- Autoreview self-test: seven checks passed.
- Autoreview unit tests: 40 passed.
- Queue snapshot syntax check passed.
- Active source and generated mirror audits found zero unmatched references.
- Unstaged and staged diff checks passed.
- P2 autoreview: full migration clean at 0.90 confidence; isolated Plate Next
  task lines clean at 0.98 confidence.

Final handoff contract:
- PR line: N/A; no PR requested
- Issue / tracker line: N/A; direct request
- Confidence line: 98%
- Flow table:
  - Reproduced: N/A; policy migration, browser N/A
  - Verified: tests clean, browser N/A
- Browser check: N/A; no UI surface
- Outcome: every live Plate-owned default autoreview action and template uses P2; explicit P3 remains supported.
- Caveat: the external generic autoreview skill still defaults to P0; Plate overrides it at local action boundaries.
- Design:
  - Chosen boundary: Plate source rules and project templates, then generated mirrors.
  - Why not quick patch: changing only `task.md` would leave other workflows on P0.
  - Why not broader change: shared external skill defaults belong to its upstream owner.
- Verified: source/mirror audits, helper tests, syntax/diff checks, agent-native review, and clean P2 reviews.
- PR body verified: N/A; no PR

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
- PR: N/A; no PR requested
- Issue / tracker: N/A; direct request
- Browser proof: N/A; no browser surface
- Caveats: external generic skill remains P0 by design; Plate passes P2 explicitly.

Timeline:
- 2026-08-04T13:36:59.247Z Task goal plan created.
- 2026-08-04 Source owners and all active plan templates migrated to P2.
- 2026-08-04 Mirrors regenerated; tests, audits, agent-native review, and P2 autoreview closed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete; final checker next |
| Where am I going? | Final response |
| What is the goal? | Make P2 the Plate default across every live autoreview action and template while keeping P3 opt-in |
| What have I learned? | External P0 defaults require explicit local arguments; no-review lanes and P3 overrides must remain intact |
| What have I done? | Updated source owners/templates, regenerated mirrors, fixed review findings, and passed proof |

Open risks:
- None within this task. Earlier staged Plate Next doctrine-version changes and
  fake URI test literals remain outside this P2 migration and were not modified.
