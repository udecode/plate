# dedupe plate skill responsibilities

Objective:
Separate Plate API, plugin, and registry skill ownership; done when source rules, Vision, routing, mirrors, budget audit, and agent-native review pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-14-dedupe-plate-skill-responsibilities.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:

- agent-native (docs/plans/templates/packs/agent-native.md)
- docs (docs/plans/templates/packs/docs.md)

Task source:

- type: direct user request
- id / link: current Codex task
- title: dedupe Plate skill responsibilities
- acceptance criteria: keep `plate-plugin-creator` and `plate-ui` separate; make
  `AGENTS.md` a compact router rather than a doctrine dump; keep durable shared
  API law in Vision/`best-api`; remove duplicated or stale editor-composition,
  generated-editor, schema-identity, plugin-builder, and registry doctrine from
  worker skills; preserve a clear decision -> plan -> worker -> docs/proof chain;
  regenerate mirrors and prove routing, sync, and prompt-budget health.

First checkpoint:

- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:

- requested duration: N/A
- semantics: N/A: no duration requested
- initial confidence score: N/A: binary source/proof gates apply
- improvement loop: close source ownership, mirror, routing, budget, and review gates
- final score / loop closure: N/A: command and source-audit threshold applies

Completion threshold:

- `AGENTS.md` contains one compact Plate responsibility chain without becoming a
  master doctrine owner.
- `best-api` and `docs/vision/plate.md` own one runtime-first, CLI-optional
  editor-composition law.
- `plate-plugin-creator` contains package/plugin mechanics only and hands
  app/registry composition to `plate-ui`.
- `plate-ui` contains registry/UI composition and proof only, without package
  builder or generated-editor doctrine.
- Source-generated mirrors are exact after `pnpm install`; Plate Next doctrine
  version/fingerprint validation passes when its tracked sources change.
- Agent-native review has zero accepted actionable findings.
- The post-change skill-budget report is no worse than the recorded 4,461-token
  baseline and preferably lower.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-dedupe-plate-skill-responsibilities.md` passes.

Verification surface:

- source audits over `.agents/AGENTS.md`, `.agents/rules/best-api.mdc`,
  `.agents/rules/plate-plugin-creator*`, `.agents/rules/plate-ui*`, and
  `docs/vision/plate.md`
- `pnpm install` generated-mirror sync
- Plate Next version/sync tests and validation when required by tracked inputs
- `skill-cleaner --root .agents/skills --root-only --no-logs`
- agent-native parity map and accepted-finding closure
- scoped formatting/lint and diff check

Constraints:

- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Do not merge `plate-plugin-creator` and `plate-ui`.
- Do not create another master/wrapper skill.
- Keep the CLI optional and advanced; do not make generated editor artifacts
  the canonical runtime path.
- Edit `.agents/rules/**` and `.agents/AGENTS.md` source only; never hand-edit
  generated `.agents/skills/**/SKILL.md` mirrors.
- Do not change `packages/**`, `apps/**`, or public `content/**` in this task.

Boundaries:

- Source of truth: `.agents/AGENTS.md`, `.agents/rules/**`, root/detail Vision.
- Allowed edit scope: source skill/routing/Vision files, their tracked version
  metadata/tests when required, generated skill mirrors via `pnpm install`, and
  this plan.
- Browser surface: none; agent workflow/source prose only.
- Browser strategy: N/A. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker or PR requested.
- Non-goals: product API implementation, Core/CLI changes, package/registry
  source migration, public docs rewrite, commits, pushes, PRs, or skill merge.

Output budget strategy:

- Read exact source owners and bounded line ranges. Use `rg` with named files,
  counts, and `head`; exclude build/generated product trees. Cap command output
  and use the skill-cleaner summary instead of streaming every skill body.

Blocked condition:

- Stop only if source generation or doctrine validation repeatedly fails for an
  owner outside the allowed skill/Vision scope and no safe source-rule repair
  remains.

Task state:

- task_type: agent workflow architecture repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: none
- goal_status: ready_for_completion

Current verdict:

- verdict: keep workers separate; dedupe through one responsibility chain
- confidence: high
- next owner: best-api/Plate Vision, then worker-specific source rules
- reason: package plugin authorship and copied registry UI share an integration
  boundary but have different source, proof, and distribution jobs.

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-dedupe-plate-skill-responsibilities.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria, constraints, boundaries, and non-goals above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Read `skill-cleaner`, named worker skills, `autogoal`, `best-api`, and `agent-native-reviewer`; baseline analyzer run recorded |
| Active goal checked or created | yes | `create_goal` active with this plan path |
| Source of truth read before edits | yes | `.agents/AGENTS.md`, named generated skills, source-rule matches, Vision routing, and sync policy inspected |
| Tracker comments and attachments read | no | N/A: no tracker source |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: workflow doctrine task, not product-code diagnosis |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior change |
| Branch decision for code-changing task | no | N/A: no git branch/commit requested |
| Release artifact decision | no | N/A: agent rules/Vision only; no package release |
| Browser tool decision for browser surface | no | N/A: no browser surface |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker requested |
| Output budget strategy recorded | yes | Bounded exact-file reads and capped audits recorded above |
| Agent-native pack selected | yes | `agent-native` pack materialized in this plan |
| Agent-facing action surface identified | yes | Plate API decision/routing, plugin authoring, registry UI composition, optional codegen |
| Source rule versus generated mirror boundary identified | yes | `.agents/rules/**` and `.agents/AGENTS.md` are source; `.agents/skills/**` regenerates with `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Full skill read before edits |
| Docs pack selected | yes | `docs` pack materialized because Vision changes |
| `docs-creator` loaded | yes | Read the complete generated skill before Vision edits |
| Docs lane selected | yes | Internal durable Vision doctrine, not public `content/**` docs |
| Target docs and nearest sibling docs read | yes | Read root `VISION.md`, `docs/vision/common.md`, and `docs/vision/plate.md` |
| Docs style doctrine read | yes | Read `docs-creator` and current-state Vision prose law |
| Documented source owner identified | yes | `docs/vision/plate.md` owns durable Plate doctrine |

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
- [x] Required video or screen-recording evidence is N/A: no video input.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact is N/A: no package or registry product release change.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling is N/A: no commit, push, or PR requested.
- [x] Local-env-rot retry is N/A: no install-corruption signal occurred.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Risk: duplicated worker doctrine could reintroduce stale
      API guidance; mirror/version/source audits cover it.
- [x] P2 autoreview targeted dirty local state. The helper failed closed on an
      unrelated oversized untracked harvest file; the scoped direct P2 review
      found no remaining actionable issue.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Agent-native pack: source rule files were edited, never generated mirrors.
- [x] Agent-native pack: the responsibility chain is discoverable from
      `.agents/AGENTS.md` and both worker routing gates.
- [x] Agent-native pack: `pnpm install` synced generated mirrors.
- [x] Agent-native pack: stale `docs-creator` and `plate-next` routes found by
      review were fixed; no accepted finding remains.
- [x] Docs pack: internal Vision lane, target, siblings, and owner are recorded.
- [x] Docs pack: no shipped API claim, import, route, demo, or preview changed;
      the prose records the accepted target architecture only.
- [x] Docs pack: prose is current-state reference voice.
- [x] Docs pack: no link, anchor, or preview changed.

Completion Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Named verification threshold | yes | Plate Next validate, 10/10 tests, source audits, mirror sync, budget audit, formatting, and diff check pass |
| Bug/behavior/type/package proof | no | N/A: no runtime bug, TypeScript source, package exports, manifests, or product behavior changed |
| Agent rules or skills changed | yes | `pnpm install`; exact mirror/resource parity is enforced by Plate Next validation/tests |
| Workspace authority | yes | All commands ran in `/Users/zbeyens/git/plate-2` against repo-owned sources/scripts |
| Browser proof | no | N/A: no `apps/**`, `packages/**`, or `content/**` UI/runtime surface changed |
| Template/release/changelog | no | N/A: no CI template, package release, or registry product change |
| Internal Vision docs | yes | Root/common/Plate Vision read; current-state prose and local references audited; no MDX route involved |
| High-risk agent-action gate | yes | Source owner, route, mirror, version, proof, and handoff mapped; stale worker routes removed |
| Agent-native review | yes | Complete reviewer skill loaded; two accepted stale-owner findings fixed; final map has no gap |
| Local install corruption | no | N/A: no corruption signal |
| P2 autoreview | attempted | Helper failed closed on unrelated oversized `docs/editor-test-harvester/slate/inventory.md`; unrelated WIP was preserved and scoped direct P2 review passed |
| PR/tracker/proof image | no | N/A: no PR, tracker mutation, or browser image requested |
| Final lint | yes | Prettier check passes for Markdown/JSON; Plate Next owns `.mdc` canonical validation; `git diff --check` passes |
| Output budget | yes | Bounded reads/audits used; one broad diff was capped and recovered without repeating it |
| Timed checkpoint | no | N/A: no duration requested |
| Goal plan checker | yes | Run after this plan update |
| Docs parser/plugin page | no | N/A: no public MDX/content/plugin page changed |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Intake and source read | complete | named skills, repo rules, and root/common/Plate Vision read | implementation |
| Implementation | complete | responsibility chain and worker boundaries repaired; doctrine v72 recorded | verification |
| Verification | complete | mirrors, version tests, audits, budget, format, and diff checks pass | closeout |
| PR / tracker sync | N/A | no external mutation requested | closeout |
| Closeout | complete | final handoff and checker prepared | final response |

Findings:

- Baseline skill inventory: 61 loaded repo skills; descriptions consume 4,461
  tokens, 86.3% of the effective 2% budget; `plate-plugin-creator` and
  `plate-ui` are both description-compaction candidates.
- No duplicate skill body/name exists; the debt is doctrine duplication across
  connected workers, not duplicate skill directories.
- Initial stale ownership was confirmed in `plate-plugin-creator`, `plate-ui`,
  `docs-creator`, and `plate-next`; all four now route app composition and
  optional codegen to the durable owners.
- Final skill inventory remains 61 skills. Description cost fell from 4,461 to
  4,320 tokens, or from 86.3% to 83.6% of the effective 2% budget.

Decisions and tradeoffs:

- Keep `plate-plugin-creator` and `plate-ui` separate -> distinct package versus
  copied-registry source/proof jobs.
- Put only routing in `AGENTS.md` -> it is always loaded and should not become a
  doctrine dump.
- Put durable shared law in Plate Vision and reusable call-shape judgment in
  `best-api`; workers consume the accepted target.
- Keep CLI/codegen optional and advanced; runtime composition remains first class.

Implementation notes:

- `.agents/AGENTS.md` carries one compact responsibility chain only.
- `docs/vision/plate.md` and `best-api` own the runtime-first,
  optional-codegen law: plain `plugins`, one optional app-owned `schema`, and
  generated static contracts only when explicitly adopted.
- `plate-plugin-creator` owns package mechanics and stops at copied registry UI.
- `plate-ui` owns copied UI/composition/wiring/proof and stops at package/API
  design boundaries.
- `docs-creator` teaches the ordinary runtime path; `plate-next` audits toward
  it without treating generated output as the runtime owner.
- Plate Next doctrine v72 records the migration law without mass-attesting
  packages.

Review fixes:

- Accepted: stale `schemaIdentity` and `defineEditor()` teaching in
  `docs-creator`; replaced with the single app-owned schema/runtime-first path.
- Accepted: stale generated `EditorKit` assumptions in `plate-next`; replaced
  with ordinary application plugins and opt-in generated static artifacts.
- Accepted: worker descriptions were too broad; compacted both named workers.
- Rejected: merging `plate-plugin-creator` and `plate-ui`; their source,
  distribution, and proof jobs are materially different.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | --- | --- | --- |
| Source-audit shell pattern used backticks | 1 | quote regex with shell single quotes | rerun safely; no stale worker match |
| P2 autoreview local bundle hit unrelated oversized untracked file | 1 | preserve unrelated WIP and run scoped direct review | no accepted scoped finding remained |
| Prettier check included Skiller-owned `.mdc` canonical output | 1 | use Plate Next validation for `.mdc`; Prettier-check Markdown/JSON | both owning checks pass |

Verification evidence:

- `pnpm install` -> Skiller apply and required resource sync completed.
- `node .agents/rules/plate-next/scripts/version.mjs validate` -> Plate Next v72
  registry valid, 42 active and 1 retired.
- `node --test .agents/rules/plate-next/scripts/version.test.mjs` -> 10/10.
- Doctrine fingerprint ->
  `sha256:1bb058044bdc854369bc8c13fc075a348f9037aba373f1ee1dd1daefdbeff8e9`.
- Worker stale-route audit -> zero matches for `schemaIdentity`,
  `defineEditor(`, `EditorKit`, `editor.generated`, generated bindings, or
  generated-contract hook arguments.
- Skill Cleaner -> 61 skills, 4,320 tokens, 83.6% of effective budget, zero
  omitted skills and zero duplicate names/bodies.
- Scoped Prettier check and `git diff --check` -> pass.
- Agent-native capability map:

| User action               | Agent route            | Source owner                                | Mirror/doc                | Proof                            | Status |
| ------------------------- | ---------------------- | ------------------------------------------- | ------------------------- | -------------------------------- | ------ |
| choose reusable Plate API | `best-api`             | `.agents/rules/best-api.mdc` + Plate Vision | generated skill + Vision  | source audit + mirror validation | pass   |
| implement package plugin  | `plate-plugin-creator` | `.agents/rules/plate-plugin-creator*`       | generated skill/resources | Plate Next validation/tests      | pass   |
| build copied registry UI  | `plate-ui`             | `.agents/rules/plate-ui*`                   | generated skill/resources | Plate Next validation/tests      | pass   |
| teach current public path | `docs-creator`         | `.agents/rules/docs-creator.mdc`            | generated skill           | mirror validation + source audit | pass   |
| audit migration adoption  | `plate-next`           | rule + v72 registry                         | generated skill           | validate + 10/10 tests           | pass   |

Final handoff contract:

- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no tracker requested.
- Confidence line: high; all owning structural gates pass.
- Flow table:
  - Reproduced: stale ownership found by source audit; browser N/A
  - Verified: version tests 10/10, mirrors/registry valid; browser N/A
- Browser check: N/A: internal skill/Vision changes only.
- Outcome: workers remain separate with one explicit responsibility chain and
  one optional-codegen doctrine owner.
- Caveat: structured P2 helper was blocked by unrelated oversized untracked
  WIP; scoped direct review and all owner-specific checks passed.
- Design:
  - Chosen boundary: Vision/API decision -> plan -> package or registry worker
    -> docs/proof.
  - Why not quick patch: stale guidance existed in four connected workers and
    would have returned after sync.
  - Why not broader change: product/CLI implementation was explicitly outside
    this skill architecture task.
- Verified: exact commands listed above.
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

- PR: N/A
- Issue / tracker: N/A
- Browser proof: N/A
- Caveats: P2 helper blocker recorded above

Timeline:

- 2026-08-14T11:30:10.481Z Task goal plan created.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Separate durable API doctrine, package plugin mechanics, and copied registry UI ownership |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:

- Product/CLI sources still implement whatever is currently in the shared WIP;
  this task intentionally changed doctrine and routing only.
