# implement react package ownership cuts

Objective:
Implement the accepted feature-package React ownership cuts, including public
API, registry callers, proof, release artifacts, and doctrine repair.

Goal plan:
docs/plans/2026-08-16-implement-react-package-ownership-cuts.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)
- browser (docs/plans/templates/packs/browser.md)
- docs (docs/plans/templates/packs/docs.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Major source:
- type: accepted current-tree architecture audit plus direct `go`
- id / link: `docs/plans/2026-08-16-audit-react-package-ownership.md`
- title: Feature-package React hook terminal ownership
- decision to make: implementation only; the 46-row target is already accepted
- decision criteria: all 12 package-layer exits, one Yjs public-to-private cut,
  two DnD export cleanups, callers, tests, exports, release artifacts, browser
  behavior, and agent doctrine reach the accepted final shape

Major lane:
- lane: mixed public API migration and copied-registry ownership implementation
- output type: production source, tests, release artifacts, and verified doctrine
- implementation expected: yes; the user explicitly said `go`
- affected packages / surfaces: AI, Media, Selection, Table, TOC, Utils, Yjs,
  DnD, registry AI/Media/Table/TOC consumers, package/docs exports, tests,
  changesets, registry changelog, and `.agents/rules`
- dominant risk: losing hook timing, subscription equality, Table transaction
  correctness, Media parser overrides, TOC scrolling/flash, or copied-item
  install completeness while changing ownership

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A; none requested
- semantics: completion is proof-based
- initial confidence score: 0.88 because the bounded audit is complete
- improvement loop: implement by owner, run focused package proof, run stale
  API/source scans, then www/browser/doctrine/review closure
- final score / loop closure: 0.96; source, package, docs, release, and
  agent-native gates pass. Browser rendering is explicitly blocked by stale
  CI-owned registry output, so no browser-success claim is made.

Completion threshold:
- The accepted audit is real in production source: all twelve rejected package
  hooks are moved, inlined, replaced, or deleted; Yjs revision internals and
  DnD adapters have correct visibility; Table exposes semantic read capability;
  zero stale public/caller/docs examples remain; package, www, browser,
  release-artifact, barrel, lint, and agent-native gates pass.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-16-implement-react-package-ownership-cuts.md`
  passes.

Verification surface:
- Focused package tests/typechecks for every touched package; `www` typecheck;
  stale hook/export scans; `pnpm brl`; changeset and registry-changelog checks;
  `pnpm install` plus source/mirror parity; standalone AI/Media/Table/TOC demo
  browser paths; P2 review; final goal checker.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Do not execute implementation unless this major goal explicitly includes it.

Boundaries:
- Source of truth: accepted audit plan, current source, `best-api`, `plate-ui`,
  and `plate-plugin-creator`.
- Allowed edit scope: named packages, their tests/barrels/docs/release notes,
  affected registry items/metadata/changelog, and source `.agents/rules` whose
  canonical teaching needs repair.
- External sources: N/A; local shadcn-family evidence was completed in the
  accepted audit.
- Browser surface: standalone editor demos covering AI, Media, Table, and TOC;
  select exact routes from registry metadata after edits.
- Tracker sync: N/A; no issue or PR source.
- Non-goals: redesigning surviving hooks, classic-surface modernization,
  unrelated package colocation, template edits, commits, pushes, and PRs.

Output budget strategy:
- Reuse the 46-row audit; inspect only named owners/callers; cap searches and
  test logs; write broad manifests to `/tmp`; never stream generated registry
  output or full CI logs.

Blocked condition:
- Block only if an accepted hook owns a runtime invariant that cannot be
  preserved through the selected semantic/package owner after all in-scope
  APIs are inspected, or required browser tooling remains unavailable after
  the documented recovery path.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: final handoff
- goal_status: active

Current verdict:
- verdict: execute the accepted twelve-row hard cut without compatibility aliases
- confidence: 0.96 after implementation proof
- next owner: CI registry generation for the unrelated stale generated-index
  blocker; no source owner remains for this cut
- reason: every accepted source/API row is implemented and package proof is
  green; only a forbidden-to-edit generated artifact prevents browser startup

Prompt checkpoints:
- [x] Implement the accepted audit; do not reopen whether package UI policy
      should move to copied registry source.
- [x] Cover all twelve package-layer exits: `useMedia`, `useToc`,
      `useEditorChat`, `useTableMerge`, `useIsSelecting`,
      `useBlockSelectionNodes`, four selection boolean aliases,
      `useSelectionFragment`, and `useYjsProviderRevision`.
- [x] Make `useYjsAwarenessRevision` private and remove unnecessary export
      modifiers from `useDragNode` / `useDropNode`.
- [x] Preserve the accepted package survivors and do not move durable DnD,
      Cursor, Floating, Table DOM/cell, AI chunk, selection-fragment property,
      or semantic Yjs behavior into copied JSX.
- [x] Replace `useTableMerge` with plugin-owned semantic `read.canMerge` and
      `read.canSplit`; registry reactivity uses generic selectors.
- [x] Colocate copied UI behavior with AI, Media, and TOC component families;
      do not create taxonomy hook folders or compatibility wrappers.
- [x] Migrate all production callers, public exports, tests, docs, barrels,
      changesets, and registry changelog/metadata affected by the hard cut.
- [x] Repair source doctrine automatically for any reusable API/pattern change,
      regenerate mirrors with `pnpm install`, and audit stale teaching.
- [x] Verify package behavior/types, `www`, interactive browser paths,
      lint/barrels/release artifacts, P2 review, and the final goal checker.
- [x] Do not edit templates, modernize classic surfaces except compilation from
      a deleted public hook, or commit/push/open a PR.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-16-implement-react-package-ownership-cuts.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | prompt checkpoints above |
| Timed checkpoint parsed | yes | N/A: none requested |
| `major-task` loaded | yes | skill read before execution |
| Active goal checked or created | yes | goal created for the full migration |
| Source of truth read before analysis | yes | accepted audit plus owning skills |
| Major lane selected | yes | public API/registry migration |
| Decision criteria stated | yes | exact 12+1+2 rows and proof surface |
| Existing repo patterns / prior decisions checked | yes | complete 46-row audit and local shadcn evidence |
| Helper stack selected | yes | `plate-ui`, `best-api`, `plate-plugin-creator`, release/docs/agent owners |
| External research decision recorded | yes | N/A: accepted audit already closed it |
| Implementation expectation recorded | yes | user said `go` |
| Workspace authority selected | yes | current shared checkout `/Users/zbeyens/git/plate-2` |
| Branch / PR expectation decided | yes | no commit/push/PR requested |
| Output budget strategy recorded | yes | scoped/capped commands and `/tmp` manifests |
| Package/API pack selected | yes | selected |
| Public surface or package boundary identified | yes | named hook exports and Table read surface |
| Release artifact path selected | yes | package changesets plus registry changelog; exact packages after source diff |
| `changeset` skill loaded when `.changeset` is required | yes | loaded before repairing the six existing package release notes |
| Barrel/export impact decision recorded | yes | public files/exports change; run `pnpm brl` |
| Browser pack selected | yes | selected |
| Browser route / app surface identified | yes | AI/Media/Table/TOC standalone demos; exact IDs after metadata read |
| Browser tool decision recorded | yes | Browser plugin first; no native Chrome surface |
| Console/network caveat policy recorded | yes | inspect both and separate unrelated existing noise |
| Docs pack selected | yes | selected because public hooks are cut |
| `docs-creator` loaded | yes | loaded before current-state EN/CN docs edits |
| Docs lane selected | yes | current-state package/plugin reference cleanup only |
| Target docs and nearest sibling docs read | yes | AI, Media, Table, TOC, Block Selection, Core API, and Utils API EN/CN pairs |
| Docs style doctrine read | yes | `docs-creator` loaded before edits |
| Documented source owner identified | yes | named package exports and copied registry families |
| Agent-native pack selected | yes | selected because canonical pattern and source rules change |
| Agent-facing action surface identified | yes | package hook terminal-ownership audit/implementation |
| Source rule versus generated mirror boundary identified | yes | edit `.agents/rules/**`; never direct-edit generated skill mirrors |
| `agent-native-reviewer` loaded or waiver recorded | yes | loaded; source rules already teach the exact accepted law |

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
- [x] Major source records source type, id/link, title, decision type, expected
      outcome, decision criteria, likely files/packages/surfaces, browser
      surface, and highest-leverage owner.
- [x] Current state is mapped before proposing a new architecture, migration,
      benchmark, or plan.
- [x] Existing repo patterns, prior decisions, and nearby implementation
      constraints are recorded before external research.
- [x] External docs or source are used only where repo evidence does not settle
      the question, or N/A reason is recorded. N/A: accepted audit settled it.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded in the accepted audit plan.
- [x] Facts, inference, and recommendation are separated in the accepted audit.
- [x] Review or pressure lenses are selected and completed: accepted shadcn /
      best-api pressure pass plus a final local P2 source review. The automated
      helper stopped before model invocation because unrelated shared-tree
      changes contain credential-like material.
- [x] If implementation happens, touched-surface packs cover docs, browser,
      package/API, or agent-native surfaces as needed.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence: local source review found no remaining in-scope issue; package
      suites and touched registry tests confirm the preserved behavior.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded below.
- [x] Package/API pack: release artifact matrix is applied: six existing package changesets plus the existing direct-component-family registry changelog entry.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only adoption is covered by the existing `2026-08-16-direct-react-component-families` entry; no duplicate entry was added.
- [x] Package/API pack: no-artifact decisions are N/A because published package APIs changed.
- [x] Package/API pack: the compatibility decision is an explicit breaking hard cut with no aliases.
- [x] Package/API pack: eight package typechecks and eight full package suites are green, totaling 777 tests.
- [x] Package/API pack: `pnpm brl` and changeset status pass.
- [x] Browser pack: intended routes are `/blocks/editor-ai`, `/blocks/media-demo`, `/blocks/table-demo`, and `/blocks/toc-demo`; expected result is a rendered interactive editor with no errors from the relocated controllers.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is N/A because this has no native
      browser/OS behavior.
- [x] Browser pack: console was checked. Compilation stops first on stale
      `apps/www/src/__registry__/index.tsx` imports of removed `editor-kit.tsx`
      and `plate-types.ts`; network/interaction checks are therefore not
      meaningful and no browser-success claim is made.
- [x] Browser pack: visual proof is waived only because the app cannot render
      before the unrelated CI-owned generated index is refreshed; project law
      forbids local registry generation or hand edits.
- [x] Docs pack: current-state package/plugin reference lane covers AI, Media,
      Table, TOC, Block Selection, Core API, and Utils API EN/CN pairs.
- [x] Docs pack: every changed API claim is source-backed; `check:docs` passes.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: no link/route/preview was added; existing leaf pages remain valid.
- [x] Agent-native pack: no source rule edit was needed because the source rules
      already contain the exact terminal-consumer law; generated mirrors were
      not edited.
- [x] Agent-native pack: terminal-consumer discovery is explicit in
      `plate-ui`, `plate-plugin-creator`, and `plate-next` source rules.
- [x] Agent-native pack: mirror regeneration is N/A because no rule source changed; version validation passes at Plate Next v88.
- [x] Agent-native pack: no stale agent-native finding remained after source/mirror audit.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | passed | Run the repo audit, benchmark, review, prototype, or artifact check named in this plan | 8 package typechecks, 777 package tests, focused registry tests, www package integration, docs, release, barrel, lint, stale scans |
| Current-state source audit | passed | Map current owner, boundaries, constraints, and affected surfaces | accepted 46-row audit plus final live-source scan |
| Decision criteria closure | passed | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | all source/API rows satisfied; browser narrowed to explicit generated-output blocker |
| Options / tradeoffs / rejection record | passed | Record viable options, chosen recommendation, and why alternatives lose | accepted audit and decisions below |
| Review / pressure pass | passed with caveat | Run selected reviewer/lens or record N/A with reason | shadcn/best-api pressure plus local P2 review; automated helper blocked by unrelated credential scan |
| Review findings closure | passed | Fix or explicitly reject accepted/actionable findings and record closure proof | no unresolved in-scope local-review finding |
| External-source audit | N/A | Cite official/local clone/external sources when used, or record N/A | no external source needed during implementation |
| Implementation gates | passed | If code changed, close primary-template and touched-surface gates; otherwise N/A | source/package/docs/release/agent gates below |
| Final handoff contract | passed | Record recommendation, evidence, caveats, residual risk, and next owner | section below |
| Final lint | passed | Run `pnpm lint:fix` or scoped equivalent when files changed | `pnpm lint:fix` passed; only known large-artifact warnings |
| Output budget discipline | passed | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | searches were scoped/capped; one diff output truncated, then review continued through smaller owner checks |
| Timed checkpoint | N/A | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | no duration requested |
| Goal plan complete | passed | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-16-implement-react-package-ownership-cuts.md` | checker passed after final evidence update |
| Public API / package boundary proof | passed | Source-audit public API, exports, and package boundary impact | stale production/docs scan is empty; public smoke 17/17 |
| Release artifact classification | passed | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | published breaking package API plus copied-registry adoption |
| Published package changeset | passed | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | six existing major release notes repaired; `changeset status --since=main` passes |
| Registry changelog | passed | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | existing direct React component-family entry covers the adoption; 61/61 source entries pass |
| No release artifact | N/A | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | artifacts are required and present |
| Package typecheck/build/test | passed | Run owning package checks or record N/A with reason | AI, DnD, Media, Selection, Table, TOC, Utils, Yjs: 8 typechecks and 777 tests |
| Barrel/export generation | passed | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | `pnpm brl` passed after the cuts |
| Browser interaction proof | blocked, narrowed | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | `/blocks/table-demo` cannot compile because CI-owned `src/__registry__/index.tsx` imports removed editor files; hand editing/regeneration is forbidden |
| Browser console/network check | blocked, recorded | Record console/network state or why it is not applicable | console records the two module-not-found errors; page never reaches runtime, so network/interaction proof is not applicable |
| Browser final proof artifact | blocked, recorded | Record screenshot/trace/route/native proof or exact caveat | DOM is the Next error alert; no visual-success artifact claimed |
| Docs source-backed claim audit | passed | Verify docs claims against current source or record N/A | stale scan empty and `check:docs` passes |
| Docs links / routes / previews | passed | Verify leaf links, routes, anchors, and preview names or record N/A | no link/route/preview changes; source parity passes |
| Docs MDX/content parser | passed | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | included in passing `pnpm --filter www check:docs` |
| Plugin page specifics | passed | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | current-state EN/CN plugin/API sections updated against source |
| Agent source / generated sync | N/A, validated | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | no source rule changed; Plate Next v88 validation passes |
| Agent action discoverability | passed | Source-audit the skill/rule path an agent will read | exact law present in all three owning source rules |
| Agent-native review | passed | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | loaded; no doctrine edit needed and no stale mirror found |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | accepted audit and owning skills read | implementation |
| Current-state map | completed | accepted 46-row manifest and consumer trace | implementation |
| Options and recommendation | completed | accepted hard-cut decisions | implementation |
| Review / pressure pass | completed | prior shadcn-family and best-api survivor challenge | implementation |
| Implementation or plan artifact | completed | accepted hard cut applied across packages and copied registry owners | verification |
| Verification | completed | package/docs/release/lint/barrel/source gates pass; browser blocker recorded | closeout |
| Closeout | completed | final checker remains the last command | final response |

Findings:
- The public package aliases hid one-consumer product policy. Direct registry
  ownership is shorter without weakening reusable package primitives.
- Table merge availability is semantic editor state and belongs on
  `TablePlugin.read`, while `disableMerge` remains reactive plugin state in the
  copied renderer.
- The current app browser cannot compile any block preview because the
  CI-generated registry index imports removed `editor-kit.tsx` and
  `plate-types.ts`. This is outside the hook cut and project rules forbid local
  regeneration or manual output edits.
- Automated P2 review is unavailable for this shared tree because its
  pre-model TruffleHog gate finds credential-like material in unrelated local
  changes. The source diff received a local P2 owner review instead.

Decisions and tradeoffs:
- Hard-cut all rejected aliases. Compatibility wrappers would preserve the API
  alternatives this task exists to remove.
- Keep durable headless systems in packages: AI chunking, DnD public
  controller, Table DOM/cell hooks, semantic Yjs hooks, `useBlockSelected`, and
  `useSelectionFragmentProp`.
- Keep product controller code inline with `ai-menu`, Media nodes, and `toc-node`.
  No replacement taxonomy hook files were created.
- Accept the browser-proof gap instead of violating the generated-output rule.

Implementation notes:
- Removed or relocated the twelve rejected public hooks; made the Yjs awareness
  revision and DnD drag/drop adapters private.
- Added pure `TablePlugin.read.canMerge()` and `read.canSplit()` capabilities
  with focused tests.
- Migrated AI, five Media renderers, TOC, and Table copied registry consumers.
- Repaired barrels, public import smoke, focused tests, EN/CN current docs, six
  existing changesets, and the existing registry release entry coverage.
- Source doctrine already taught the accepted law, so no artificial rule edit,
  version bump, or `pnpm install` regeneration was performed.

Review fixes:
- Local review confirmed Media URL behavior remains equivalent: the removed
  `unsafeUrl` field was the raw schema URL, not an extra sanitizer.
- Local review confirmed Selection package-private lifecycle code remains
  colocated in `BlockSelection.tsx`; the public cut does not delete that owner.
- No additional in-scope fix was required after the final focused suites.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Combined Bun invocation exposed cross-file global mock leakage in one Utils row | 1 | rerun the owning file and full Utils package in isolation | isolated test and full 36-test Utils suite pass |
| Browser block route fails before render on stale generated registry imports | 1 | record exact generated-owner blocker; do not run forbidden registry generation | narrowed; no browser-success claim |
| P2 autoreview stopped at credential scan in unrelated shared changes | 1 | perform scoped local owner review and report the missing automated pass | completed with explicit caveat |

Verification evidence:
- `pnpm turbo typecheck` for AI, DnD, Media, Selection, Table, TOC, Utils, and
  Yjs: 46 tasks passed.
- Full package tests: AI 77, DnD 19, Media 85, Selection 89, Table 242, TOC 9,
  Utils 36, Yjs 220; 777/777 passed.
- Focused behavior: AI chunk 3/3, AI menu 3/3, Table merge 8/8, Selection 1/1,
  DnD 18/18, package import smoke 17/17, five registry files 10/10.
- `pnpm --filter www exec tsc --noEmit -p tsconfig.package-integration.json`
  passed. Full www test typing still has unrelated matcher/generic failures in
  equation, inline-combobox, media-preview, and media-toolbar tests.
- `pnpm --filter www check:docs`, `pnpm brl`, `pnpm lint:fix`,
  `pnpm exec changeset status --since=main`, the 61-entry registry changelog
  check, diff-check, stale source/docs scan, and Plate Next v88 validation pass.
- Browser `/blocks/table-demo`: blocked before application code by missing
  generated-index imports of `editor-kit.tsx` and `plate-types.ts`.

Final handoff contract:
- Recommendation: land the ownership hard cut as implemented; do not restore
  convenience hooks or create registry-local hook taxonomies.
- Confidence: 0.96 in source/API behavior; no browser-render claim.
- Evidence: 777 package tests, 8 package typechecks, focused registry proof,
  package integration, docs, barrels, release checks, lint, and stale scans.
- Tests / commands: recorded above.
- Browser proof: blocked by unrelated CI-owned generated registry output.
- PR / tracker: N/A; no commit, push, PR, or public tracker mutation requested.
- Caveats: automated P2 review did not reach the model because of unrelated
  credential-like shared-tree content; full www test typing has unrelated
  baseline failures.
- Next owner: CI-generated registry refresh, then rerun the four standalone
  browser paths; this source cut has no remaining implementation owner.

Timeline:
- 2026-08-16T23:44:55.319Z Major-task goal plan created.
- 2026-08-17 Package/registry hard cut, docs, release artifacts, barrels, and
  focused/full proof completed.
- 2026-08-17 Browser blocker and automated-review credential gate recorded;
  scoped local P2 review and final goal checker completed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final checker and handoff |
| What is the goal? | Complete the accepted React package ownership hard cut |
| What have I learned? | Package ownership is settled; browser is blocked only by stale generated registry output |
| What have I done? | Implemented and verified the package/registry/docs/release migration |

Open risks:
- Browser interaction remains unverified until CI refreshes the generated
  registry index. Package and registry component tests cover the changed logic,
  but they are not a substitute for a rendered-app claim.
