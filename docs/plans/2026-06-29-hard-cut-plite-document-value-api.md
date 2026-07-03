# hard cut plite document value api

Objective:
Hard cut Plite document value read API; done when Plite/docs/Core use children/root/value/meta shape and checks pass.

Goal plan:
docs/plans/2026-06-29-hard-cut-plite-document-value-api.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: user-requested hard-cut public API cleanup
- id / link: N/A: chat request
- title: Hard cut Plite document value API to children/root/value/meta
- acceptance criteria:
  - Plite read API exposes `editor.read.children()`, `editor.read.root("header")`, `editor.read.value()`, and `editor.read.meta()`.
  - Document value type uses `meta?: Record<string, unknown>` instead of `state?: Record<string, unknown>`.
  - Zero-arg `root()` is not kept as a public primary-children alias.
  - Plite package source/tests are updated.
  - Core/Plate usages are updated.
  - Plite docs/content are updated.
  - No public compat aliases or docs for old API names remain.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A: no timed checkpoint requested
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Source audit finds no public `state.value.get()`, `state.value.root()`,
  `editor.read.value.get()`, `editor.read.value.root()`, `initialValue.state`,
  or document-value `state?:` usage in Plite docs/source/Core except intentional
  non-document runtime state language.
- `EditorDocumentValue` and `InitialValue` expose `meta`, not document `state`.
- Focused Plite/Core package tests and typechecks pass.
- Generated barrels are refreshed if public exports or exported layout changed.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-29-hard-cut-plite-document-value-api.md` passes.

Verification surface:
- Source audit with focused `rg` over `packages/plite*`, `packages/core`, and
  `content/docs/plite`.
- Package tests/typecheck for Plite and Core surfaces touched.
- `pnpm brl` if API/export shape requires generated barrel updates.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-29-hard-cut-plite-document-value-api.md`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: current Plite source under `packages/plite/**`, Plite docs
  under `content/docs/plite/**`, and Core call sites under `packages/core/**`.
- Allowed edit scope: `packages/plite/**`, `packages/plite-react/**`,
  `packages/plite-dom/**`, `packages/plite-history/**`,
  `packages/plite-layout/**`, `packages/browser/**`, `packages/core/**`,
  `content/docs/plite/**`, `docs/plite/**`, package-generated barrels, and this plan.
- Browser surface: docs text/API only unless verification exposes rendered docs breakage.
- Browser strategy: N/A unless docs route behavior changes; use Browser only if
  docs rendering needs visual proof.
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker/PR requested.
- Non-goals:
  - Do not add compat aliases for old `value.get/root` read names.
  - Do not redesign extension state fields beyond document-value `meta`.
  - Do not broaden into Plate v2 runtime cleanup beyond required Core callers.

Output budget strategy:
- Use focused `rg` by exact old/new API symbols with output caps. Use file lists
  and targeted `sed` slices instead of broad source dumps.

Blocked condition:
- Block only if the API hard cut exposes an incompatible Plite design decision
  that cannot be resolved without choosing a different public shape than
  `children/root/value/meta`.

Task state:
- task_type: public API hard cut
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready-to-complete

Current verdict:
- verdict: complete
- confidence: 0.97 after package tests, docs check, scoped lint, and stale-symbol audits
- next owner: user review
- reason: accepted API shape is implemented in Plite, Plite React/Core callers are updated, docs teach `children`/`root`/`value`/`meta`, and old public value/root/state names are gone except the intentional negative `root('main')` contract test.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-29-hard-cut-plite-document-value-api.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria copied: hard cut `editor.read.children()`, `editor.read.root("header")`, `editor.read.value()`, `editor.read.meta()`, document value `{ children, roots?, meta? }`, and update Plite/docs/Core |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Loaded `autogoal`; continued matching active goal after compaction |
| Active goal checked or created | yes | `get_goal` returned matching active goal for this plan |
| Source of truth read before edits | yes | Read `packages/plite/src/interfaces/editor.ts`, `packages/plite/src/core/public-state.ts`, and relevant Plite docs/source matches |
| Tracker comments and attachments read | no | N/A: no tracker/PR |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: direct API hard cut with source owners already known |
| TDD decision before behavior change or bug fix | yes | Existing contract tests will be migrated first where practical; add focused tests for new read names/meta shape if missing |
| Branch decision for code-changing task | no | N/A: user did not request branch/PR; work current checkout |
| Release artifact decision | yes | No changeset unless user asks; this is unreleased beta/private API churn in current branch |
| Browser tool decision for browser surface | no | N/A: no rendered UI behavior surface unless docs proof requires it |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Focused `rg` and targeted file slices only |
| Docs pack selected | yes | Applied docs pack |
| `docs-creator` loaded | no | N/A: this is mechanical API wording update, not new docs authoring voice pass |
| Docs lane selected | yes | Incidental docs update in task template with docs pack |
| Target docs and nearest sibling docs read | yes | Read Saving, Editor, Why This Fork slices and source matches |
| Docs style doctrine read | yes | Repo AGENTS docs current-state rule applies |
| Documented source owner identified | yes | Plite source owns API; docs mirror current API |
| Package/API pack selected | yes | Applied package-api pack |
| Public surface or package boundary identified | yes | `@platejs/plite` `EditorRead`/`EditorDocumentValue`/`InitialValue` |
| Release artifact path selected | no | N/A: no published package release artifact requested for current beta branch churn |
| `changeset` skill loaded when `.changeset` is required | no | N/A: changeset not required by user/request |
| Barrel/export impact decision recorded | yes | Run `pnpm brl` if exported type/function names or package barrels change |

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
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: Plite owns document
      value/read API; Core and docs consume the current Plite surface.
- [x] Release artifact requirement recorded: N/A: unreleased beta/private branch
      API churn; no changeset requested for this checkout packet.
- [x] Final handoff shape decided: local code/docs/test closeout; no PR/tracker.
- [x] Branch handling recorded: N/A: user did not request branch/PR.
- [x] Local-env-rot retry policy recorded: N/A: failures were source/test issues,
      not install corruption.
- [x] Workspace authority recorded: all commands ran in
      `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded: public API hard cut; failure mode was stale
      nested value/root names or wrong main-root reads in child-root views.
- [x] Review/autoreview target selected: scoped self-review/source audits used;
      full autoreview not run because current checkout has broad unrelated
      migration work and this goal has focused package proof.
- [x] Agent-native review decision recorded: N/A: no `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling changed.
- [x] Output budget discipline recorded and followed: broad searches were
      focused after one accidental overbroad shell/audit miss.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: no changeset for current beta/private branch churn.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules. N/A: no changeset.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: not registry work.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded.
- [x] Package/API pack: generated barrels or release notes are updated when required. N/A: no exported file layout/barrel path changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run source audits and package checks | Old nested API audit no matches; document-value state wording audit no matches; root/main audit no matches outside negative contract test |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: API hard cut, not bug repro |
| Targeted behavior verification | yes | Run focused package tests | Plite, Plite React, DOM, history, layout, and Core tests passed |
| TypeScript or typed config changed | yes | Run relevant typecheck | Plite, Plite React, DOM, history, layout, and Core typechecks passed |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no exported file path/barrel layout changed |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no package manifests or lockfile changed |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent rule/skill edits |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool | All commands ran in `/Users/zbeyens/git/plate-2` |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: no rendered route behavior changed; docs parser proof covers MDX/content |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A: source/API/docs hard cut only |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` edits |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | No changeset: current beta/private branch hard cut, user did not request release artifact |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: not registry work |
| Docs or content changed | yes | Verify source-backed claims and docs parser | `pnpm --filter www check:docs` passed |
| High-risk mini gate | yes | Record realistic failure mode, proof plan, and boundary | Failure mode: child-root view accidentally reading view children as main children; fixed with `readRootChildren` and Plite React tests pass |
| Agent-native review for agent/tooling changes | no | Load reviewer or record N/A | N/A: no agent/tooling files changed |
| Local install corruption suspected | no | Run reinstall once or record N/A | N/A: no install-corruption failure shape |
| Autoreview for non-trivial implementation changes | no | Run focused review or record scoped reason | N/A: full autoreview would review unrelated broad dirty migration; scoped self-review/source audits were used for this packet |
| PR create or update | no | Run `check` before PR work and sync PR body | N/A: no PR requested |
| Task-style PR body verified | no | Verify PR body | N/A: no PR |
| PR proof image hosting | no | Host images or record N/A | N/A: no PR/browser image |
| Tracker sync-back | no | Post sync after PR exists or record N/A | N/A: no tracker |
| Final handoff contract | yes | Fill final handoff fields below | Completed below |
| Final lint | yes | Run scoped lint | `pnpm exec biome check --fix` on 25 touched TS/TSX/JS files passed with no fixes |
| Output budget discipline | yes | Verify no unbounded output remains | One broad output miss recorded; final checks used redirected logs and focused audits |
| Timed checkpoint | no | Finish duration loop or N/A | N/A: no duration requested |
| Goal plan complete | yes | Run check-complete | Run after this plan update |
| Docs source-backed claim audit | yes | Verify docs claims against current source | `EditorDocumentValue` source audit shows `children`, `roots?`, `meta?`; docs check passed |
| Docs links / routes / previews | no | Verify leaf links/routes/previews or N/A | N/A: no new links/routes/previews |
| Docs MDX/content parser | yes | Run docs parser | `pnpm --filter www check:docs` passed |
| Plugin page specifics | no | Apply plugin page rules or N/A | N/A: not plugin docs |
| Public API / package boundary proof | yes | Source-audit public API and boundary impact | Public API reads are direct `children/root/value/meta`; stale nested names audit clean |
| Release artifact classification | yes | Record artifact class | Published package API/docs delta in current beta branch; no release artifact requested |
| Published package changeset | no | Add/update changeset if release artifact required | N/A: no changeset requested for current beta/private branch churn |
| Registry changelog | no | Add registry changelog if registry-only | N/A: not registry work |
| No release artifact | yes | Record exact reason | No changeset/release artifact because this is unreleased beta/private branch API hard cut in current checkout |
| Package typecheck/build/test | yes | Run owning package checks | Plite, DOM, React, history, layout, and Core typecheck/tests passed; Plite packages built |
| Barrel/export generation | no | Run `pnpm brl` if exports/exported layout changed | N/A: no exported file path/barrel layout changed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | plan created and source owners read | implementation |
| Implementation | complete | Plite/Core/docs hard cut applied | verification |
| Verification | complete | package checks, docs check, scoped lint, static audits | closeout |
| PR / tracker sync | N/A | no PR/tracker requested | final response |
| Closeout | complete | goal plan updated with evidence | final response |

Findings:
- `EditorDocumentValue` now uses `{ children, roots?, meta? }`.
- `editor.read.children()`, `editor.read.root(root)`, `editor.read.value()`, and `editor.read.meta()` are the public direct read shape.
- `state.root('main')` intentionally throws; primary-root children are read through `children()`.
- Plite React needed `readRootChildren` so child-root views do not confuse view-local `children()` with the main root.
- Stale reference/ledger docs still mentioned document state; patched to current document value/meta wording.

Decisions and tradeoffs:
- `meta` replaces document `state` for persisted non-content data because it reads as document metadata, not runtime state.
- No public compat aliases for `value.get()`, `value.root()`, or zero-arg `root()`.
- Extension `state` remains as extension runtime/config state; it is not document value state.
- No changeset in this packet because the checkout is still unreleased beta/private branch churn and no release artifact was requested.

Implementation notes:
- Updated Plite source API/types, initial-value normalization, public read/update surfaces, runtime view, Plite React root readers, Core callers, Plite package tests, Core tests, and Plite docs/reference docs.
- Fixed a clipboard API composition issue exposed by Plite DOM/React tests: DOM clipboard capability methods are merged with composed middleware/fallback `insertData` instead of being overwritten or recursively called.

Review fixes:
- Source audit found stale `value.get()` in `docs/plite/references/pr-description.md`; patched to `value()`.
- Source audit found stale document state wording in `docs/plite/**`; patched current-reference docs to document value/meta wording.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Accidental oversized audit output earlier in the goal | 1 | Use focused patterns, redirected logs, and exact tails | Final verification used compact logs and focused `rg` |
| Broad Biome over package dirs hit unrelated existing lint | 1 | Run scoped Biome on touched TS/TSX/JS files | Scoped 25-file Biome passed with no fixes |

Verification evidence:
- `pnpm --filter @platejs/plite typecheck` -> pass.
- `pnpm --filter @platejs/plite test` -> 1008 pass, 85 skip, 0 fail.
- `pnpm --filter @platejs/plite-react typecheck` -> pass.
- `pnpm --filter @platejs/plite-react test` -> 60 files / 833 tests pass.
- `pnpm --filter @platejs/plite-dom typecheck` -> pass.
- `pnpm --filter @platejs/plite-dom test` -> 130 pass, 0 fail.
- `pnpm --filter @platejs/plite-history typecheck` -> pass.
- `pnpm --filter @platejs/plite-history test` -> 18 pass, 0 fail.
- `pnpm --filter @platejs/plite-layout typecheck` -> pass.
- `pnpm --filter @platejs/plite-layout test` -> 51 pass, 0 fail.
- `pnpm --filter @platejs/plite build` -> pass.
- `pnpm --filter @platejs/plite-dom build` -> pass.
- `pnpm --filter @platejs/plite-react build` -> pass.
- `pnpm --filter @platejs/plite-layout build` -> pass.
- `pnpm --filter @platejs/core typecheck` -> pass.
- `pnpm --filter @platejs/core test` -> 689 pass, 0 fail.
- `pnpm --filter www check:docs` -> pass.
- `pnpm exec biome check --fix <25 touched TS/TSX/JS files>` -> pass, no fixes.
- Static audit for old nested read/update API names -> no matches.
- Static audit for document-value state wording -> no matches.
- Static audit for `state.root('main')` / `value.root` / `value.get` excluding the intentional negative contract test -> no matches.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no tracker requested.
- Confidence line: 97%; remaining 3% is broad dirty-checkout review, not this packet's focused proof.
- Flow table:
  - Reproduced: N/A: API hard cut, not bug repro.
  - Verified: package tests/typechecks/builds, docs check, lint, and static audits passed.
- Browser check: N/A: no rendered route behavior changed.
- Outcome: Plite document value/read API hard-cut to `children`/`root`/`value`/`meta`.
- Caveat: Full autoreview was not run because the checkout contains broad unrelated migration work; this packet was closed with scoped package proof and static audits.
- Design:
  - Chosen boundary: Plite owns document value/read API; Core and docs consume it.
  - Why not quick patch: old `value.get/root` names and document `state` wording were public-shape debt.
  - Why not broader change: extension runtime `state` is a separate concept and was left alone.
- Verified: see verification evidence above.
- PR body verified: N/A: no PR.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A: source/API/docs hard cut only.
- Caveats: no full dirty-checkout autoreview; no changeset by current branch policy.

Timeline:
- 2026-06-29T15:37:47.281Z Task goal plan created.
- 2026-06-29T18:27Z Final Plite package checks passed.
- 2026-06-29T18:28Z Core typecheck/test and docs check passed.
- 2026-06-29T18:29Z Stale-symbol audits passed after doc/reference cleanup.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response after mechanical plan check |
| What is the goal? | Hard cut Plite document value/read API to `children`/`root`/`value`/`meta` |
| What have I learned? | Child-root views need a root-aware read helper; stale docs still carried old document state language |
| What have I done? | Implemented source/docs/test/Core updates and verified packages/docs/audits |

Open risks:
- No known runnable risk for this packet. Residual risk is only that a future broad dirty-checkout autoreview may find unrelated migration issues outside this hard-cut scope.
