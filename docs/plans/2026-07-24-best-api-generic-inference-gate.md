# best api generic inference gate

Objective:
Make generic-builder inference preservation a durable best-api rule; done when
source, generated skill, review, and forward-test pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-24-best-api-generic-inference-gate.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: direct user correction
- id / link: current Codex task
- title: Preserve inferred builder contracts before collapsing `.extend*`
- acceptance criteria:
  - `.agents/rules/best-api.mdc` makes generic accumulator parity a hard gate.
  - The rule covers contextual inference, accumulation, composition,
    conversion/configuration, portal projection, declaration emit, and negative
    type proof without casts or callback annotations.
  - The smallest durable Plate Vision owner carries the same principle.
  - `pnpm install` regenerates the installed `best-api` skill.
  - Agent-native review and an unseeded real-API forward-test pass.

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
- initial confidence score: N/A: binary acceptance checklist
- improvement loop: N/A: one narrow repair and verification loop
- final score / loop closure: N/A: close on all five acceptance rows

Completion threshold:
- Source rule and Plate Vision contain one non-contradictory inference gate.
- Generated `.agents/skills/best-api/SKILL.md` contains the source rule.
- `pnpm install` succeeds.
- Agent-native review reports no accepted actionable finding.
- A forward-test against the real plugin builder surface identifies the type
  parity requirement without being told the expected conclusion.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-best-api-generic-inference-gate.md` passes.

Verification surface:
- Focused source audit of `.agents/rules/best-api.mdc`,
  `docs/vision/plate.md`, and generated `.agents/skills/best-api/SKILL.md`.
- `pnpm install`.
- `agent-native-reviewer` capability map.
- Independent forward-test on
  `packages/core/src/lib/plugin/BasePlugin.ts`.
- `pnpm lint:fix`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.agents/rules/best-api.mdc`; durable doctrine:
  `docs/vision/plate.md`.
- Allowed edit scope: those owners, generated skill mirrors from `pnpm install`,
  and this goal plan.
- Browser surface: N/A: agent rule and doctrine only.
- Browser strategy: N/A: no rendered product surface changes.
- Tracker sync: N/A: no external issue or PR.
- Non-goals: no product API implementation, no `.extend*` deletion, no package
  behavior change, no broad skill rewrite.

Output budget strategy:
- Read exact rule, Vision, reviewer, and BasePlugin owner files only; cap every
  search/read and avoid repo-wide unbounded output.

Blocked condition:
- Stop only if source generation cannot run or the source/generated ownership
  cannot be established after focused inspection.

Task state:
- task_type: agent-rule repair
- task_complexity: micro
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: add a generic-accumulator parity gate; do not equate fewer builder
  names with preserved typing
- confidence: high from current `BasePlugin` generic signatures
- next owner: best-api source rule
- reason: the generic `.extend()` currently widens only selected dimensions,
  while specialized stages widen other public contracts

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-best-api-generic-inference-gate.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria and non-goals above copy the request and source-owner constraint |
| Timed checkpoint parsed | no | N/A: none requested |
| Skill analysis before edits | yes | Read full `best-api`, `autogoal`, and `agent-native-reviewer` instructions |
| Active goal checked or created | yes | `get_goal` returned none; matching goal created |
| Source of truth read before edits | yes | Read `.agents/rules/best-api.mdc`, root/common/Plate Vision, and current `BasePlugin` signatures |
| Tracker comments and attachments read | no | N/A: direct chat request only |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: micro rule repair, no product implementation |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior |
| Branch decision for code-changing task | no | N/A: user did not request branch work |
| Release artifact decision | no | N/A: no package/public runtime change |
| Browser tool decision for browser surface | no | N/A: no browser surface |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Exact-file reads and capped `rg` recorded above |
| Agent-native pack selected | yes | `agent-native` pack materialized in this plan |
| Agent-facing action surface identified | yes | `best-api` review/repair decisions for generic builder consolidation |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/best-api.mdc`; regenerate `.agents/skills/**` with `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Read full `.agents/skills/agent-native-reviewer/SKILL.md` |

Work Checklist:
- [x] N/A: no duration requested.
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
      root/common/Plate Vision, source rule, reviewer, and `BasePlugin` types.
- [x] Implementation fixes the right ownership boundary: source rule plus the
      smallest durable Plate Vision owner; generated mirror was not hand-edited.
- [x] Release artifact requirement: N/A, no package or registry change.
- [x] Final handoff shape: changed owners, exact rule, sync/review/forward-test
      proof, and root-lint caveat; PR/tracker N/A.
- [x] Branch handling: N/A, no branch work requested.
- [x] Local-env-rot retry policy: N/A, no install-corruption signal.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note: an over-broad rule could preserve compiler taxonomy or
      authorize type regressions; parity plus negative proof is the guard.
- [x] Review/autoreview target: N/A for this micro prose-only repair;
      agent-native review is the owning specialized gate.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed.
- [x] Agent-native pack: accepted agent-native review finding was fixed by
      applying the gate to overload consolidation, merge, rename, and deletion.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Source/mirror sync and independent forward-test passed |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: doctrine correction, not a runtime bug |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Unseeded forward-test applied the gate to current `BasePlugin` and required exact accumulator parity before deletion |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: Markdown rule/doctrine only |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package layout/export change |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest/graph change; install was run solely for skill generation |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed; source/generated bodies match exactly |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in `/Users/zbeyens/git/plate-2` |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: no rendered surface |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A: no rendered surface |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no template output |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no package behavior/API implementation |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry work |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Plate Vision claim verified against current `BasePlugin` type signatures; no public rendered docs |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: method-count cleanup erases inferred accumulators; source rule requires parity and negative type proof |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | PASS: source owner, generated mirror, route, sync proof, and unseeded forward-test present; overload wording gap fixed |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no corruption signal |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: micro prose-only repair; specialized agent-native review owns it |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR/browser proof |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Fields below resolved |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Root command ran; owned Markdown is ignored by Biome; root remains blocked by four unrelated shared-WIP lint errors |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Exact files and capped searches only |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-best-api-generic-inference-gate.md` | PASS in `/Users/zbeyens/git/plate-2` |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | Pass; generated skill body equals source rule body |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Dedicated `Generic Builder Inference Gate` plus Review Question in `best-api` |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | PASS; accepted overload-consolidation wording gap fixed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read rule, root/common/Plate Vision, reviewer, and current `BasePlugin` generic signatures | implementation |
| Implementation | complete | Patched source rule and Plate Vision; `pnpm install` regenerated skill | verification |
| Verification | complete | Source/mirror bodies match; forward-test independently applied the rule; agent-native review passed | closeout |
| PR / tracker sync | complete | N/A: neither requested | final response |
| Closeout | complete | Final acceptance rows and handoff recorded | final response |

Findings:
- Current `BasePlugin.extend()` widens options, root API, and selectors but
  carries plugin API, tx, state, dependencies, and schema through unchanged.
- Specialized builder deletion therefore cannot be inferred from runtime
  equivalence or method-count reduction.
- The source/generated boundary is healthy: `pnpm install` copied the complete
  rule body into `.agents/skills/best-api/SKILL.md`.

Decisions and tradeoffs:
- Encode a general type-parity gate rather than a Plate method allowlist.
- Preserve the separate rule that compiler destinations alone do not earn
  public verbs; exact generic parity unlocks deletion rather than permanent
  duplication.

Implementation notes:
- None yet.

Review fixes:
- Accepted P2: the first draft named only generic-builder absorption, leaving
  two specialized methods merged as overloads implicit. Expanded the gate to
  every merge, overload consolidation, rename, and deletion.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First goal-plan check found its own evidence row and Closeout phase unresolved | 1 | Resolve both final rows, then rerun | Resolved; final checker passed |

Verification evidence:
- `pnpm install` in `/Users/zbeyens/git/plate-2` -> pass; Skiller applied rules.
- Source/generated body `diff -u` -> no differences.
- Focused `rg` contradiction audit -> no stale "one generic method regardless
  of inference" rule.
- Root `pnpm lint:fix` -> blocked by four unrelated shared-WIP errors after
  Biome fixed unrelated files; scoped Markdown inputs are ignored by Biome.
- Unseeded forward-test on current `BasePlugin` -> recommended folding
  `extendTxGroup(key, factory)` into an `extendTx(key, factory)` overload only
  after exact Base/Plate accumulator, projection, configuration, declaration,
  negative, and runtime-order parity; it did not recommend collapsing the
  remaining builders.
- Agent-native capability map:
  `best-api` review action -> installed skill route -> source rule and Plate
  Vision -> generated skill mirror -> install/diff/forward-test proof -> PASS.
- Goal-plan checker -> PASS after final closeout evidence.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: direct chat request
- Confidence line: high; exact source/mirror and independent application proof
- Flow table:
  - Reproduced: N/A: reusable judgment miss, not runtime behavior
  - Verified: source sync pass; forward-test pass; browser N/A
- Browser check: N/A: no rendered product surface
- Outcome: future builder consolidation must prove the surviving inferred
  contract before deleting a public authoring path.
- Caveat: root lint remains blocked by unrelated shared-WIP errors; future Core
  implementation proof also needs its current type-test baseline repaired.
- Design:
  - Chosen boundary: `best-api` source rule plus smallest durable Plate Vision
    owner, regenerated into the installed skill.
  - Why not quick patch: chat-only advice would be forgotten next run.
  - Why not broader change: no product API implementation was authorized.
- Verified: source/generated equality, contradiction audit, independent
  forward-test, and agent-native capability map.
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
- Issue / tracker: N/A: direct chat request
- Browser proof: N/A: no browser surface
- Caveats: unrelated root lint and current Core type-test baseline are outside
  this repair

Timeline:
- 2026-07-24T17:50:56.537Z Task goal plan created.
- 2026-07-24 Source rule and Plate Vision patched; `pnpm install` regenerated
  the installed skill.
- 2026-07-24 Independent forward-test applied the inference gate to current
  Core, exposed an overload wording gap, and that gap was fixed.
- 2026-07-24 Final autogoal checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Mechanical goal-plan check and final response |
| What is the goal? | Make builder-consolidation inference preservation durable in `best-api` |
| What have I learned? | Surviving return-type accumulation, not runtime similarity or method count, decides whether deletion is type-safe |
| What have I done? | Patched source/Vision, regenerated, audited, and forward-tested |

Open risks:
- Future `.extend*` implementation work must repair the current Core type-test
  baseline before treating a typecheck as deletion proof.
