# require unslop and disclose Plate requirements

Objective:
Require Unslop in docs workflow and verify Plate runtime/compiler requirements; done when source, generated skill, docs, and checks agree.

Goal plan:
docs/plans/2026-08-24-require-unslop-and-disclose-plate-requirements.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: direct user request
- id / link: current Codex task
- title: require Unslop and disclose Plate requirements
- acceptance criteria: `docs-creator` makes Unslop a required step for every docs artifact; Plate's React 19, React Compiler, and related runtime/setup requirements are checked against live source and stated accurately in the owning docs; source and generated skill stay synchronized; affected docs and agent rules pass their verification lanes.

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
- initial confidence score: N/A: binary artifact and command threshold applies
- improvement loop: source audit, smallest durable rule/docs edits, generated sync, Unslop pass, docs/parser/browser/review proof
- final score / loop closure: complete only when every named command and source audit passes

Completion threshold:
- `.agents/rules/docs-creator.mdc` requires an explicit Unslop pass for every
  created or edited docs artifact, preserves literal content and source-backed
  claims, and names the verification evidence expected at closeout.
- The generated `.agents/skills/docs-creator/SKILL.md` matches the source after
  `pnpm install`; no generated skill is hand-edited.
- Current Plate package/app/config owners determine whether React 19, React
  Compiler, Next, or other setup facts are requirements, recommendations, or
  internal implementation details. The owning install/get-started docs state
  only user-relevant requirements and explicit constraints.
- Every changed prose file receives a deliberate Unslop file-edit pass without
  changing code, commands, identifiers, links, package names, or technical facts.
- Source audits, docs generation/checks, Browser proof, lint, agent-native
  review, P1 autoreview when applicable, and the final goal checker pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-24-require-unslop-and-disclose-plate-requirements.md` passes.

Verification surface:
- Source audit of package peer dependencies, app/compiler configs, installation
  docs, rule source, generated skill, and any existing requirement language.
- `pnpm install`; source/mirror text comparison; Unslop deterministic audit on
  each changed prose file.
- `pnpm --filter www build:source`, `pnpm --filter www check:docs`, relevant
  docs source checks, `pnpm lint`, and Browser proof for changed content routes.
- Agent-native review and scoped P1 autoreview, followed by the goal-plan checker.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Preserve technical facts, commands, identifiers, code fences, package names,
  URLs, frontmatter, metadata, and link targets during Unslop edits.
- Do not claim React Compiler is a consumer prerequisite unless the literal
  package/runtime contract proves that; separate hard requirements, supported
  app configuration, recommendations, and implementation details.
- Edit `.agents/rules/docs-creator.mdc`, never the generated skill directly.

Boundaries:
- Source of truth: `.agents/rules/docs-creator.mdc`, live package manifests and
  compiler/app configs, and the owning installation/get-started docs.
- Allowed edit scope: docs-creator source rule and regenerated mirrors; the
  smallest owning Plate docs needed to correct requirement disclosure; this
  goal plan. No product runtime/API changes.
- Browser surface: changed www docs route when content changes.
- Browser strategy: Browser for normal docs QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no issue or external tracker requested.
- Non-goals: no package/runtime/compiler behavior changes, no mass docs rewrite,
  no generated registry/template edits, no commit, push, PR, release, or deploy.

Output budget strategy:
- Read exact rule, reference, manifest, config, and installation-doc owners.
  Search authored source with path exclusions; emit filenames/counts before
  matching lines; cap command output and never scan generated registry, build,
  dependency, or template trees unless they are the named sync artifact.

Blocked condition:
- Block only if current source proves materially conflicting React/runtime
  contracts with no canonical owner, or required Browser/docs tooling fails
  repeatedly after owner-specific recovery. Ordinary wording choices and lint
  fixes are not blockers.

Task state:
- task_type: agent-doctrine repair plus source-backed docs correction
- task_complexity: normal
- current_phase: intake
- current_phase_status: in_progress
- next_phase: implementation
- goal_status: active

Current verdict:
- verdict: inspect source before choosing exact disclosure wording
- confidence: medium before live contract audit
- next owner: task
- reason: React 19 is a hard package baseline, but React Compiler may be an app
  optimization/configuration rather than a library-consumer requirement; the
  docs must not blur those categories.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-24-require-unslop-and-disclose-plate-requirements.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Required Unslop step for all docs, live audit of Plate React 19/Compiler requirements, accurate disclosure, source/mirror sync, verification, and no external mutation are recorded above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | User explicitly invoked `docs-creator` and `unslop`; repo policy additionally requires `autogoal` and agent-native review for rule changes |
| Active goal checked or created | yes | No active goal existed; a new goal names this exact plan and binary threshold |
| Source of truth read before edits | yes | Read `.agents/rules/docs-creator.mdc`, linked style/lane doctrine, Unslop file-edit doctrine, agent-native reviewer, package peer manifests, package compiler config, app configs, registry init, React Compiler contract checker, and installation docs |
| Tracker comments and attachments read | no | N/A: direct request has no tracker or attachment |
| Video transcript evidence required | no | N/A: no video evidence |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: doctrine and reference-doc wording task; live rule/config/docs owners are authoritative |
| TDD decision before behavior change or bug fix | no | N/A: no product behavior changes; source/mirror and docs checks own proof |
| Branch decision for code-changing task | no | N/A: no branch, commit, push, or PR requested |
| Release artifact decision | no | N/A: agent doctrine and docs wording require no changeset or registry changelog |
| Browser tool decision for browser surface | yes | Use Browser on the exact changed docs route if authored content changes; agent-rule-only changes need no Browser |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker requested |
| Output budget strategy recorded | yes | Exact-owner reads and bounded authored-source searches are recorded above |
| Docs pack selected | yes | Task primary template materialized the docs pack because live docs may require correction |
| `docs-creator` loaded | yes | User supplied the complete current skill; source rule and linked style doctrine will be read before edits |
| Docs lane selected | yes | Install/get-started lane for the live disclosure; agent workflow doctrine for the skill/template repair |
| Target docs and nearest sibling docs read | yes | Read `content/docs/installation.mdx`, its CN counterpart, Plate UI, React, Next, manual, RSC and Node neighbors plus `content/docs/index.mdx` |
| Docs style doctrine read | yes | Read `style-and-structure.md`, the install lane template, Unslop file-edit doctrine and the local shadcn docs-style corpus |
| Documented source owner identified | yes | React/DOM floor comes from package peers; package compilation from `tsdown.config.ts`; copied-source compiler policy from registry/compiler contract; app configuration from both Next configs |
| Agent-native pack selected | yes | Task primary template materialized the agent-native pack for `.agents/rules/**` changes |
| Agent-facing action surface identified | yes | `docs-creator` workflow and verification checklist control future docs creation/editing |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/docs-creator.mdc`; regenerate `.agents/skills/docs-creator/SKILL.md` with `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded before edits; final parity map will prove user action, agent route, source owner, generated mirror and proof |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; N/A because no duration was requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is N/A: no video was supplied.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [ ] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [ ] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [ ] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [ ] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [ ] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [ ] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [ ] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [ ] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [ ] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [ ] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [ ] Docs pack: docs use current-state reference voice, not changelog voice.
- [ ] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors; implementation will touch only the rule source before regeneration.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text through the explicit required Unslop section and workflow/gate rows.
- [ ] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [ ] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the command, proof, source audit, or artifact check named in this plan | pending |
| Bug reproduced before fix | pending | Record failing test/repro or N/A with reason | pending |
| Targeted behavior verification | pending | Run focused test/proof for changed behavior or record N/A | pending |
| TypeScript or typed config changed | pending | Run relevant typecheck | pending |
| Package exports or file layout changed | pending | Run `pnpm brl` before final verification and keep generated barrel updates | pending |
| Package manifests, lockfile, or install graph changed | pending | Run `pnpm install` and relevant package checks | pending |
| Agent rules or skills changed | pending | Run `pnpm install` and verify generated skill sync | pending |
| Workspace authority proof | pending | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | pending |
| Browser surface changed | pending | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | pending |
| Browser final proof | pending | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | pending |
| CI-controlled template output changed | pending | Restore generated template output or record why it is intentionally kept | pending |
| Package behavior or public API changed | pending | Add a changeset or record why no changeset applies | pending |
| Registry-only component work changed | pending | Update `docs/components/changelog.mdx` or record N/A | pending |
| Docs or content changed | pending | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | pending |
| High-risk mini gate | pending | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | pending |
| Agent-native review for agent/tooling changes | pending | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | pending |
| Local install corruption suspected | pending | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | pending |
| P1 autoreview for non-trivial implementation changes | pending | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | pending |
| PR create or update | pending | Run `check` before PR work and sync PR body to the task-style final handoff | pending |
| Task-style PR body verified | pending | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | pending |
| PR proof image hosting | pending | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | pending |
| Tracker sync-back | pending | Post concise issue/Linear sync after PR exists, or record N/A/blocker | pending |
| Final handoff contract | pending | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | pending |
| Final lint | pending | Run `pnpm lint:fix` or scoped equivalent | pending |
| Output budget discipline | pending | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | pending |
| Timed checkpoint | pending | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-24-require-unslop-and-disclose-plate-requirements.md` | pending |
| Docs source-backed claim audit | pending | Verify docs claims against current source or record N/A | pending |
| Docs links / routes / previews | pending | Verify leaf links, routes, anchors, and preview names or record N/A | pending |
| Docs MDX/content parser | pending | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | pending |
| Plugin page specifics | pending | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | pending |
| Agent source / generated sync | pending | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | pending |
| Agent action discoverability | pending | Source-audit the skill/rule path an agent will read | pending |
| Agent-native review | pending | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | in_progress | created plan | implementation |
| Implementation | pending | | verification |
| Verification | pending | | closeout |
| PR / tracker sync | pending | | final response |
| Closeout | pending | | final response |

Findings:
- None yet.

Decisions and tradeoffs:
- None yet.

Implementation notes:
- None yet.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Pending.

Final handoff contract:
- PR line: pending
- Issue / tracker line: pending
- Confidence line: pending
- Flow table:
  - Reproduced: tests pending, browser pending
  - Verified: tests pending, browser pending
- Browser check: pending
- Outcome: pending
- Caveat: pending
- Design:
  - Chosen boundary: pending
  - Why not quick patch: pending
  - Why not broader change: pending
- Verified: pending
- PR body verified: pending

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
- PR: pending
- Issue / tracker: pending
- Browser proof: pending
- Caveats: pending

Timeline:
- 2026-08-24T09:09:46.609Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Implementation, verification, PR/tracker sync, closeout |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Pending.
