# rename registry plate editor

Objective:
Rename composed registry `Editor` exports to `PlateEditor`; done when aliases are gone, consumers and generated registry agree, and checks pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-27-rename-registry-plate-editor.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:

- browser (docs/plans/templates/packs/browser.md)
- agent-native (docs/plans/templates/packs/agent-native.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:

- type: direct user request
- id / link: N/A: no tracker
- title: Rename composed registry editors to PlateEditor
- acceptance criteria: rename both block-owned composed `Editor` components to `PlateEditor`; keep the shared presentation component named `Editor`; remove `Editor as EditorSurface`; update every consumer, registry artifact, changelog, and affected doctrine owner; do not rename editor hooks or unrelated aliases in this task; verify source, types, registry generation, browser routes, and agent-rule sync.

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
- initial confidence score: N/A: binary rename and verification threshold
- improvement loop: N/A: one-shot execution
- final score / loop closure: N/A: no timed checkpoint

Completion threshold:

- Both block-owned `plate-editor.tsx` files export `PlateEditor`, import the shared `Editor` without aliasing, and retain identical rendered composition.
- Every source, generated registry artifact, example, and documentation consumer uses `PlateEditor`; repository searches return zero relevant `EditorSurface` aliases and zero stale imports of the renamed block export.
- A registry rename changelog entry and generated JSON agree; relevant typecheck/lint, registry generation/check, browser routes, doctrine sync, agent-native review, and goal-plan checker pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-27-rename-registry-plate-editor.md` passes.

Verification surface:

- Exact `rg` source audit for `EditorSurface`, both block exports, and all `plate-editor` consumers.
- Scoped typecheck/lint for the affected www registry surface; `pnpm --filter www build:registry` when the current branch requires generated registry output.
- Registry changelog generator `--write` and `--check`.
- Browser proof for `/blocks/editor-basic` and `/blocks/editor-ai`: both routes load, expose the editable surface, and have no task-caused console error.
- `pnpm install`, source/mirror parity audit, and `agent-native-reviewer` because `.agents/rules/**` doctrine changes.

Constraints:

- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:

- Source of truth: root `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, `.agents/rules/best-api.mdc`, `.agents/rules/plate-ui.mdc`, the two block-owned `plate-editor.tsx` files, registry metadata/consumers, and registry changelog sources.
- Allowed edit scope: the two composed block components and exact consumers; registry changelog source/generated output; smallest durable Vision and agent-rule owners; generated agent mirrors from `pnpm install`; this goal plan.
- Browser surface: `/blocks/editor-basic` and `/blocks/editor-ai`.
- Browser strategy: Browser DOM/render/console proof; no native Chrome/OS behavior is involved. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: direct request.
- Non-goals: renaming the shared presentation `Editor`, changing editor hooks, cleaning unrelated aliases, changing package exports, changing editor behavior or styles, committing, pushing, or opening a PR.

Output budget strategy:

- Search exact `plate-editor` import paths and identifiers first, cap reads to matched files, exclude dependencies/build output, and inspect generated registry changes only after the source rename.

Blocked condition:

- Stop only if the registry component has an undiscoverable external consumer that cannot be updated locally, or the required Browser/dev-server environment cannot start after one documented install-corruption retry.

Task state:

- task_type: copied registry component API rename plus doctrine repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:

- verdict: keep the reusable presentation `Editor`; rename the block-owned complete composition to `PlateEditor`
- confidence: high before implementation; the collision exists only because both layers currently export `Editor`
- next owner: task
- reason: the composed block owns editor creation and `<Plate>` while the shared component already owns reusable editor presentation.

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-27-rename-registry-plate-editor.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact rename, preserved shared component, alias deletion, non-goals, proof, and final handoff are recorded above. |
| Timed checkpoint parsed | no | N/A: none requested. |
| Skill analysis before edits | yes | Loaded `plate-ui`, its component/registry rules, `best-api`, `autogoal`, `shadcn`, and `registry-changelog`. |
| Active goal checked or created | yes | Confirmed no active goal, then created the matching rename goal. |
| Source of truth read before edits | yes | Read root/common/Plate Vision and the relevant Plate UI/API doctrine before product edits. |
| Tracker comments and attachments read | no | N/A: direct request without tracker. |
| Video transcript evidence required | no | N/A: no recording supplied. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: bounded identifier/API rename with accepted target. |
| TDD decision before behavior change or bug fix | no | N/A: no behavior change; source/type/browser proof covers the rename. |
| Branch decision for code-changing task | no | N/A: no commit or PR requested; work stays in the current checkout. |
| Release artifact decision | yes | Registry copied-code rename requires a registry changelog; no npm package changeset. |
| Browser tool decision for browser surface | yes | Use Browser on both standalone block demo routes. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Exact identifier/path searches and capped matched-file reads only. |
| Browser pack selected | yes | Browser completed final proof on `/blocks/editor-basic` and `/blocks/editor-ai`; both rendered with zero console errors. |
| Browser route / app surface identified | yes | `/blocks/editor-basic` and `/blocks/editor-ai`; the dynamic block route resolves exact registry item names. |
| Browser tool decision recorded | yes | Browser first; Chrome/Computer are N/A because no native browser/OS behavior is involved. |
| Console/network caveat policy recorded | yes | Check console errors; network is relevant only to route-load failure because the rename changes no requests. |
| Observable browser case captured | no | N/A: no report-backed behavior bug; this is a source API rename with render smoke proof. |
| Agent-native pack selected | yes | Durable API/component naming doctrine will change under `.agents/rules/**`. |
| Agent-facing action surface identified | yes | `best-api` recommendation and `plate-ui` component naming guidance. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/*.mdc`; regenerate `.agents/skills/*/SKILL.md` through `pnpm install`; never hand-edit mirrors. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Required after implementation; load before review rather than before source edits. |
| Package/API pack selected | yes | The copied registry component export is a reusable source-distribution API. |
| Public surface or package boundary identified | yes | Registry block export only; no npm package export changes. |
| Release artifact path selected | yes | Registry changelog source plus generated JSON. |
| `changeset` skill loaded when `.changeset` is required | no | N/A: registry-only public delta, so no `.changeset`. |
| Barrel/export impact decision recorded | no | N/A: no package barrel or exported file layout changes. |

Work Checklist:

- [x] N/A: no duration requested; no timed confidence loop applies.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is N/A: no video supplied.
- [x] Nearby repo instructions, Plate UI/component law, registry changelog law,
      and API doctrine read before edits.
- [x] Rename both composed exports and all exact consumers without changing the
      shared presentation `Editor` or runtime behavior.
- [x] Add the registry rename changelog source and generated JSON.
- [x] Repair the smallest durable API/component naming rules and regenerate mirrors.
- [x] Run exact source audit, scoped lint/typecheck, registry generation/check,
      Browser proof, agent-native review, and plan checker.
- [x] Final handoff shape decided: changed files, checks, both Browser routes,
      no PR/tracker, and any residual risk.
- [x] Branch handling recorded: N/A because no commit or PR is requested.
- [x] Local-env-rot retry policy recorded: one `pnpm run reinstall` only if a
      surprising module/React-resolution failure matches repo corruption signals.
- [x] Workspace authority recorded: `/Users/zbeyens/git/plate-2` owns every source and command proof; Browser owns route proof.
- [x] High-risk note recorded: stale copied-code imports are the realistic failure; exact consumer search, typecheck, generated registry build, and both routes cover it.
- [x] Review/P1 autoreview target is N/A: the product patch is a narrow identifier rename; agent-rule edits receive the specialized agent-native review.
- [x] Agent-native review decision recorded: required after rule/source sync.
- [x] Output budget discipline recorded: exact searches and capped outputs only.
- [x] Browser pack: routes, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser is selected; Chrome and Computer Use are N/A.
- [x] Browser pack: console errors will be checked; task-specific network behavior is N/A.
- [x] Browser pack: screenshot/paint proof is N/A because no visual claim or style change exists.
- [x] Browser pack: report-backed pre-fix proof is N/A because this is not a behavior bug.
- [x] Browser pack: fresh final route loads will run after all generated/rule changes.
- [x] Browser pack: exact pushed-ref/clean-checkout proof is N/A because no commit/push or fixed issue claim is requested.
- [x] Browser pack: 5/5 native interaction stability is N/A because no selection/paint/focus/DnD/lifecycle behavior changes.
- [x] Browser pack: no temporary alias or generated-file edit will count as proof.
- [x] Agent-native pack: source `.agents/rules/**` files, never generated mirrors, are the edit owners.
- [x] Agent-native pack: the durable rule will name the composed-block collision and canonical `PlateEditor` outcome.
- [x] Agent-native pack: generated mirrors are synced with `pnpm install`.
- [x] Agent-native pack: review passed. The public action, source owner,
      generated mirror, and local proof route are all discoverable; no
      actionable finding remains.
- [x] Package/API pack: registry copied-code API changes; npm package boundary and exports do not.
- [x] Package/API pack: registry changelog is the release artifact; no package changeset.
- [x] Package/API pack: `.changeset` work is N/A.
- [x] Package/API pack: registry-only work follows `registry-changelog`.
- [x] Package/API pack: no-artifact path is N/A because a registry changelog is required.
- [x] Package/API pack: hard cut is explicit; no compatibility alias for the old composed `Editor` export survives.
- [x] Package/API pack: package-owned build/test is N/A; www source typecheck and registry build own proof.
- [x] Package/API pack: barrels are N/A; registry generated output is covered separately.
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run all named proof | Source audit, www typecheck, registry/changelog generation, browser proof, and agent sync passed. |
| Bug reproduced before fix | no | N/A | N/A: identifier/API cleanup, not a behavior bug. |
| Targeted behavior verification | yes | Render both changed blocks | Both routes rendered editable textboxes with expected headings. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=www` passed: 45/45 tasks. |
| Package exports or file layout changed | no | N/A | N/A: no package barrel or file-layout change. |
| Package manifests, lockfile, or install graph changed | no | N/A | N/A: no manifest or lockfile edit; `pnpm install` still passed for rule sync. |
| Agent rules or skills changed | yes | Sync and verify mirrors | `pnpm install` passed; exact rule text exists in both source rules and generated skills. |
| Workspace authority proof | yes | Verify in owner | Commands ran from `/Users/zbeyens/git/plate-2`; Browser verified the local www app. |
| Browser surface changed | yes | Browser proof | `/blocks/editor-basic` and `/blocks/editor-ai` returned 200 and rendered. |
| Browser final proof | yes | Fresh route proof | Final local dev-server run passed after generation and lint. |
| CI-controlled template output changed | no | N/A | N/A: no `templates/**` output touched. |
| Package behavior or public API changed | no | N/A | N/A: registry copied-code export only, not an npm package API. |
| Registry-only component work changed | yes | Registry changelog | Source MDX and generated event/index/component JSON are current. |
| Docs or content changed | yes | Verify source-backed claim | Plate Vision and agent rules state the exact owner split implemented in source. |
| High-risk mini gate | yes | Record failure and proof | Risk was stale copied consumers/artifacts; exact search, typecheck, generator, and route proof close it. |
| Agent-native review for agent/tooling changes | yes | Run capability review | Pass: action routes to `plate-ui`/`best-api`, source and generated mirrors agree, and proof is local. |
| Local install corruption suspected | no | N/A | N/A: no corruption-shaped failure. |
| P1 autoreview for non-trivial implementation changes | no | N/A | N/A: trivial identifier rename plus generated copies; specialized agent review applied. |
| PR create or update | no | N/A | N/A: user did not request a PR. |
| Task-style PR body verified | no | N/A | N/A: no PR. |
| PR proof image hosting | no | N/A | N/A: no PR and no visual claim. |
| Tracker sync-back | no | N/A | N/A: direct request without tracker. |
| Final handoff contract | yes | Fill fields below | Complete below. |
| Final lint | yes | Run scoped fix and check | Scoped Ultracite fix/check passed; Markdown/MDX formatted with Prettier. |
| Output budget discipline | yes | Record noisy attempts | Two generators emitted broad file lists; subsequent audits were exact and capped. |
| Timed checkpoint | no | N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run completion checker | Run after this final plan update. |
| Browser interaction proof | yes | Exercise both routes | Both editable surfaces and expected headings were present. |
| Browser console/network check | yes | Inspect console and route responses | Zero error logs; both GET requests returned 200. |
| Browser final proof artifact | yes | Record DOM/route proof | Browser DOM snapshots recorded editable textbox plus `Basic Editor` and `Welcome to the Plate Playground!`. |
| Exact case replay | no | N/A | N/A: no report-backed behavior case. |
| Final ref and fingerprints | no | N/A | N/A: local uncommitted task; no pushed-ref claim. |
| Clean final runtime | no | N/A | N/A: local uncommitted proof, explicitly not a shipped/fixed issue claim. |
| Retry-free stability | no | N/A | N/A: no native selection, paint, focus, DnD, or lifecycle change. |
| Agent source / generated sync | yes | Run install and audit | Passed via `pnpm install` plus exact `rg` parity. |
| Agent action discoverability | yes | Audit routes | `plate-ui` owns component naming; `best-api` owns collision review. |
| Agent-native review | yes | Close findings | Pass with no actionable findings. |
| Public API / package boundary proof | yes | Audit boundary | Only registry copied-code exports changed; no npm export or barrel changed. |
| Release artifact classification | yes | Classify | Registry-only rename. |
| Published package changeset | no | N/A | N/A: no published npm package delta. |
| Registry changelog | yes | Generate and check | `--write` and `--check` passed for 90 events. |
| No release artifact | no | N/A | N/A: registry changelog is present. |
| Package typecheck/build/test | yes | Run owning checks | www typecheck and registry build passed. |
| Barrel/export generation | no | N/A | N/A: no package barrel/export layout change. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Vision, rules, component owners, consumers, registry metadata, and route owner read | done |
| Implementation | complete | Canonical `PlateEditor`, generated registry payloads, changelog, Vision, and agent rules agree | done |
| Verification | complete | Lint, typecheck, generation, exact audit, browser, and agent-native review passed | done |
| PR / tracker sync | complete | N/A: no PR or tracker requested | done |
| Closeout | complete | Final plan checker is the only remaining command | final response |

Findings:

- The shared `components/editor/editor.tsx` presentation owner and both complete block components currently export `Editor`; only the block layer needs a more specific name.
- Existing doctrine already separates `editor.tsx` presentation from optional block-owned `plate-editor.tsx`, so `PlateEditor` names the higher owner without inventing `EditorContent`.
- Exact production consumers are the two block `page.tsx` files. Registry metadata copies both `plate-editor.tsx` files to the same installed target, so each replacement block can export the same canonical `PlateEditor` name.
- Browser preview routes are `/blocks/editor-basic` and `/blocks/editor-ai`, derived from exact registry item names rather than a `-demo` suffix.

Decisions and tradeoffs:

- Rename the complete block exports to `PlateEditor`; retain shared `Editor`, `EditorContainer`, and their behavior unchanged.
- Make the rename a hard cut with no `Editor` compatibility export; stale consumers should fail typecheck instead of preserving fake aliases.
- Record the reusable owner-first naming rule in best-API/Plate-UI doctrine; package/API Vision is reaffirmed unless exact source audit shows a contradictory durable rule.

Implementation notes:

- Both block compositions export `PlateEditor` and directly render the shared
  `Editor`; the two block pages import the canonical export.
- `apps/www/public/r/editor-ai.json` and `editor-basic.json` were rebuilt from
  source so installed blocks receive the same API.
- The registry changelog records the hard rename. Plate Vision, `plate-ui`, and
  `best-api` name the durable owner-first rule; `pnpm install` regenerated the
  skill mirrors.

Review fixes:

- Agent-native review found no orphaned action, stale generated mirror,
  cloud-only dependency, or conflicting owner. No follow-up fix was needed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial broad `Editor` search exceeded the useful output budget | 1 | Search only exact block import paths and target identifiers | Exact search found two page consumers and two component owners. |
| Prettier could not infer the `.mdc` parser | 1 | Pass `--parser markdown` for the two rule sources | Both rule files formatted successfully. |
| Changelog check became stale after MDX formatting | 1 | Regenerate from the formatted source, then rerun `--check` | Generator and check passed for all 90 events. |

Verification evidence:

- `pnpm exec ultracite fix <four block TSX files>` and the matching scoped
  `ultracite check`: passed.
- `pnpm turbo typecheck --filter=www`: 45/45 tasks passed.
- `pnpm --filter www build:registry`: passed and materialized 379 canonical
  payloads plus 15 sparse overlays.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --write` and
  `--check`: passed for 90 events.
- Exact audit found zero `EditorSurface` or `EditorContent` occurrences in the
  two block sources and generated payloads; all exports/consumers use
  `PlateEditor`.
- `pnpm install`: passed; exact searches found the new naming law in each
  `.agents/rules` source and generated `.agents/skills` mirror.
- Browser: `/blocks/editor-basic` and `/blocks/editor-ai` returned 200, exposed
  editable textboxes, rendered their expected headings, and logged zero errors.
- `git diff --check` on the task files: passed.

Final handoff contract:

- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: direct request.
- Confidence line: high; source, generated artifacts, types, and both routes agree.
- Flow table:
  - Reproduced: N/A: API cleanup, not a reported bug.
  - Verified: lint/typecheck/generation green; both Browser routes green.
- Browser check: both routes returned 200 with editable surfaces and zero console errors.
- Outcome: complete block composition is `PlateEditor`; shared presentation remains `Editor`; caller aliases are gone.
- Caveat: work is local and uncommitted; no shipped-ref claim.
- Design:
  - Chosen boundary: rename the higher block-owned composition.
  - Why not quick patch: an alias would preserve the collision and leak a fake name into consumers.
  - Why not broader change: shared `Editor` already has the correct presentation meaning; hooks and package exports are unrelated.
- Verified: exact source/generated audit, www typecheck, registry/changelog generation, agent sync/review, and Browser proof.
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

- PR: N/A: no PR requested.
- Issue / tracker: N/A: direct request.
- Browser proof: local `/blocks/editor-basic` and `/blocks/editor-ai`, both 200, editable, zero console errors.
- Caveats: local uncommitted result only.

Timeline:

- 2026-08-27T22:44:27.576Z Task goal plan created.
- 2026-08-28 Source, generated registry payloads, changelog, Vision, and agent
  rules aligned on `PlateEditor`.
- 2026-08-28 Lint, www typecheck, registry/changelog generation, source/mirror
  audit, agent-native review, and both Browser routes passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete; final checker next. |
| Where am I going? | Final response. |
| What is the goal? | Use `PlateEditor` for full block compositions while keeping shared `Editor`. |
| What have I learned? | See Findings |
| What have I done? | Implemented the owner rename and closed source, generated, doctrine, type, and browser proof. |

Open risks:

- No known task-specific runtime risk. The only status caveat is that the work
  remains local and uncommitted because no commit or PR was requested.
