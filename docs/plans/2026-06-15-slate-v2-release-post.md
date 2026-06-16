# slate v2 release post

Objective:
Create Slate v2 release blog doc; done when Better Auth-style source-backed release post exists and plan checks pass.

Goal plan:
docs/plans/2026-06-15-slate-v2-release-post.md

Template:
docs/plans/templates/docs.md

Primary template:
docs/plans/templates/docs.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Docs source:
- type: release/blog documentation
- id / link: user request in current Codex thread
- title: Slate v2 release post
- acceptance criteria: answer whether the full release doc exists; create or repair it if missing; copy the writing shape of `../better-auth`; include all Slate v2 changes/new features from source-backed docs and package surfaces; avoid invented claims; close with autogoal evidence.

Docs lane:
- lane: release/blog narrative with docs-source audit
- target docs: decide after release/migration inventory; expected owner under `docs/slate-v2/**` unless existing public release route is the better owner.
- documented source owner: Slate v2 docs, package sources, migration guide, changesets/release ledgers, and public API surfaces.
- nearest sibling docs: Better Auth blog examples in `../better-auth/docs/content/blogs/**`, Plate release page, Slate v2 migration/readiness docs.
- plugin page: N/A: release narrative, not a plugin page.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- A full Slate v2 release/blog artifact exists and is written in a Better Auth-like narrative style.
- The release artifact includes a source-backed section for every major Slate v2 change/new feature found in the current release/migration/readiness/package sources, with no fake completeness.
- The plan records an explicit source coverage ledger for included, deferred, and non-release items.
- Docs closure is legal only when the page teaches the fastest correct path,
  every claim is source-backed, docs-lane shape is satisfied, required MDX/link/
  preview checks are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-slate-v2-release-post.md`
  passes.

Verification surface:
- Source audit: focused reads of Slate v2 migration/readiness/API/package docs, current package/package-export surfaces, current changesets/release ledgers, and Better Auth blog examples.
- Artifact audit: `rg` checks proving the release artifact has required sections for architecture, API/DX, React/runtime, browser/editing behavior, performance, tests/oracles, docs/migration, examples, and deferred/explicit-not-included lanes.
- Parser/build: run a docs parser/build command only if the artifact lands under MDX/content routes; otherwise record N/A for plain Markdown under `docs/**`.
- Review: run autoreview for the local docs patch before closeout.

Constraints:
- Follow `.agents/rules/docs-creator.mdc` for docs style and workflow.
- Write current-state docs only. No changelog voice.
- Keep code examples repo-backed and copy-pasteable.
- Do not invent APIs, routes, demos, imports, components, transforms, or options.
- Do not add docs ceremony for tiny typo/copy edits.

Boundaries:
- Source of truth: current checkout files, especially `docs/slate-v2/**`, `docs/plans/**`, `.tmp/slate-v2/**` when present, package sources, and Better Auth blog examples for prose shape only.
- Allowed edit scope: goal plan plus one release/blog artifact and minimal nav/link updates if the selected owner is a public docs route.
- Browser surface: only required if an MDX public route changes; plain `docs/**` artifact can use source/parser audits.
- Tracker sync: N/A: no GitHub/Linear issue was requested.
- Non-goals: do not ship/release/publish; do not invent marketing claims; do not convert migration guide into changelog prose; do not alter runtime/package code.

Blocked condition:
- Block only if source inventory cannot distinguish release claims from historical draft noise, or if a required public-route placement decision cannot be inferred from current docs topology.

Docs state:
- task_type: docs
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: none
- goal_status: ready to complete

Current verdict:
- verdict: complete
- confidence: high
- next owner: none
- reason: `.tmp/slate-v2/docs/releases/slate-v2.md` exists, is linked from Summary, includes the release/change map, source-backed API claims, private-package caveats, and clean targeted review.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-slate-v2-release-post.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint captured: answer whether release doc exists, create/repair full blog-style release doc, include all major Slate v2 changes/new features, copy Better Auth style, use autogoal, keep claims source-backed. |
| `docs-creator` loaded | yes | Read `.agents/skills/docs-creator/SKILL.md` before edits. |
| Active goal checked or created | yes | `get_goal` returned null; `create_goal` created this active release-post goal. |
| Docs lane selected | yes | Release/blog narrative with source-backed docs audit. |
| Target docs read | yes | Created/read `.tmp/slate-v2/docs/releases/slate-v2.md`; updated/read `.tmp/slate-v2/docs/Summary.md`. |
| Nearest sibling docs read | yes | Read Plate release route, Slate v2 overview/readiness/architecture/proof docs, migration guide, package readmes, roots/state docs, and Better Auth 1.5/1.6 blog posts. |
| Docs style doctrine read | yes | Read `docs-creator` voice, release docs, anti-slop, verification, and lane sections. |
| Documented source code read | yes | Read package readmes and source-export evidence for `slate`, `slate-react`, `slate-dom`, `slate-history`, `slate-hyperscript`, `slate-layout`, and repo-private `slate-browser`. |
| Ownership map drafted | yes | Release post has Package Split, Package Guide, Complete Change Map, current limits, and repo-private browser proof wording. |
| Plugin-page rules decision | no | N/A: release/blog artifact, not a plugin page. |
| Browser/render proof decision | no | N/A: GitBook Markdown source under `.tmp/slate-v2/docs/**`; no running public MDX route changed. |
| PR/tracker expectation decision | no | N/A: user asked for local release doc, not PR/tracker sync. |
| Package/API pack selected | yes | Applied `package-api` pack because release claims cover public APIs/packages. |
| Public surface or package boundary identified | yes | Release post documents public Slate v2 package surfaces; no package source/export behavior changed. |
| Release artifact path selected | no | N/A: docs-only release narrative in `.tmp/slate-v2/docs/**`; no published package user-visible delta from code. |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no `.changeset` required for docs-only artifact. |
| Barrel/export impact decision recorded | no | N/A: no exported package file layout changed. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Docs lane is classified as install, guide/system, plugin/feature,
      serialization/conversion, workflow/AI, API reference, or spec/law.
- [x] Target docs and nearest sibling docs were read before writing.
- [x] Docs style doctrine in `docs-creator` was read before writing.
- [x] Documented behavior or API was verified against current source.
- [x] Ownership map records core runtime, package, kit, registry, and app-local
      ownership where relevant.
- [x] Fastest success path appears before deeper mechanics or API reference.
- [x] Opening is three sentences or fewer and avoids generic fluff.
- [x] Named APIs, options, transforms, components, imports, routes, and package
      specifiers are exact and current.
- [x] Plugin docs, if applicable, satisfy kit/manual/API ordering and headless
      package ownership.
- [x] Serialization docs, if applicable, split directions and state environment
      constraints before examples.
- [x] API reference docs, if applicable, use exact contracts and avoid tutorial
      filler.
- [x] Spec/law docs, if applicable, record owner map, evidence, and explicit
      gaps.
- [x] Demos/previews are real registry entries or marked N/A with reason.
- [x] Links target real leaf pages and do not reinforce pages being displaced.
- [x] Anti-slop audit passed: no fake APIs, no placeholder
      comments, no task markers, no dead anchors, no redundant summary section.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed docs.
- [x] Review/autoreview target selected for non-trivial docs work, or marked
      N/A with reason.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work updates `docs/components/changelog.mdx` instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the source audit, parser/build, link/demo check, or review named in this plan | Link/fence/section/source audits passed; focused package surface proof passed; targeted autoreview clean. |
| Docs lane shape satisfied | yes | Check the lane-specific structure against `docs-creator` | Better Auth-style release shape: intro, Highlights, Important Changes, Migrating, Package Guide, Proof, Complete Change Map, Current Limits. |
| Source-backed claim audit | yes | Verify every named API/option/transform/component/import/route against source | Source symbol audits passed, including root hook signatures and repo-private `slate-browser`. |
| Ownership map verified | yes | Confirm package/layer/kit/app-local ownership claims against source | Package Split and Package Guide match package readmes/source; `slate-browser` is labeled repo-private. |
| MDX/content parser | no | Run `pnpm --filter www build:contentlayer` for MDX/content changes, or record N/A | N/A: GitBook Markdown under `.tmp/slate-v2/docs/**`, not Plate MDX/contentlayer. |
| Links/routes/previews verified | yes | Check leaf links, routes, anchors, and `<ComponentPreview>` names or record N/A | Node link audit passed with 11 links; no previews. |
| Plugin page specifics | no | If plugin page, apply `docs-creator` kit/manual/API rules or record N/A | N/A: release/blog narrative, not plugin page. |
| Browser/render surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: Markdown source only; no running docs route changed. |
| Package/API behavior changed | no | Add changeset or record N/A | N/A: docs-only artifact; no package behavior/API changed. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent rules/skills changed in this task. |
| Autoreview for non-trivial docs changes | yes | Load `.agents/skills/autoreview/SKILL.md` and run the right target, or record N/A for tiny/no-local-patch work | Local autoreview clean; targeted release-doc autoreview found two doc issues, both fixed; final targeted autoreview clean. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: docs-only Markdown in `.tmp`; link/fence/source/review audits used. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-slate-v2-release-post.md` | Run after this final evidence update. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Source symbol audits and focused package surface tests passed. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | No release artifact: docs-only release narrative; no code/package delta. |
| Published package changeset | no | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | N/A: no published package behavior/API/types/config/runtime change. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, update `docs/components/changelog.mdx` and do not add a package changeset | N/A: no registry code changed. |
| No release artifact | yes | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | Docs-only `.tmp/slate-v2/docs/**` release narrative; no package or registry release artifact. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | `bun test ...` from `.tmp/slate-v2` passed: 135 tests across 3 files, 0 fail. |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no exports/exported file layout changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read Better Auth blog samples, Slate v2 release/readiness docs, migration guide, package readmes/source evidence. | done |
| Writing | complete | Added `.tmp/slate-v2/docs/releases/slate-v2.md` and linked it from `.tmp/slate-v2/docs/Summary.md`. | done |
| Verification | complete | Link/fence/section/source audits, focused package tests, and targeted autoreview passed. | done |
| PR / tracker sync | N/A | No PR/tracker requested. | done |
| Closeout | complete | Plan final evidence recorded; `check-complete` next. | done |

Findings:
- Initial inventory found `content/docs/releases/index.mdx`, Slate v2 migration/readiness docs, and many Slate v2 plans/ledgers, but no obvious Better Auth-style full Slate v2 release/blog announcement.
- Better Auth has blog/release infrastructure under `../better-auth/docs/content/blogs/**` and release OG assets; use its prose shape as style input only.
- Created release artifact at `.tmp/slate-v2/docs/releases/slate-v2.md`.
- Linked release artifact from `.tmp/slate-v2/docs/Summary.md`.
- `slate-browser` is repo-private (`private: true`, `0.0.0-private`), so release prose now labels it as proof infrastructure, not public install surface.
- `useSlateRootEffect` and `useSlateCommandCallback` take callback/effect first and root through options, so the release table now uses `useSlateRootEffect(effect, { root })` and `useSlateCommandCallback(callback, { root })`.

Decisions and tradeoffs:
- Treat this as a release/blog artifact, not a changeset. Changesets summarize package deltas; this doc should explain the complete product/API story.
- Keep the artifact source-backed. "ALL changes" means all major release-relevant changes surfaced by current docs/package inventories, not every historical scratchpad note.

Implementation notes:
- Added `.tmp/slate-v2/docs/releases/slate-v2.md`.
- Updated `.tmp/slate-v2/docs/Summary.md`.
- Patched review fixes for root hook signatures and repo-private `slate-browser` wording.

Review fixes:
- Targeted autoreview finding accepted: root hook signatures were stale. Fixed the table.
- Targeted autoreview finding accepted: `slate-browser` was described like a public package. Fixed the release post to call it repo-private and `0.0.0-private`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Targeted source audit initially searched the wrong exact substring for `useSlateRootEffect` | 1 | Check the real exported declaration string | Reran with `export function useSlateRootEffect`; audit passed. |
| First targeted autoreview classified release-doc findings as out-of-scope because `.tmp` is outside the local diff bundle | 1 | Verify findings manually against source and patch anyway | Both findings accepted and fixed; reran targeted review clean. |

Verification evidence:
- Node link audit from `/Users/zbeyens/git/plate-2`: passed for 11 release-doc links and Summary nav.
- Node fence audit from `/Users/zbeyens/git/plate-2`: passed with 46 code-fence markers.
- Node section audit from `/Users/zbeyens/git/plate-2`: passed for 22 required release-post sections.
- Fresh final evidence: final targeted autoreview is clean after fixing both accepted release-doc findings; link/fence/section/source audits and focused package surface proof are recorded below.
- `rg` placeholder/unsupported-marker audit from `/Users/zbeyens/git/plate-2`: no task markers, unsupported Better Auth MDX tags, stale hook signatures, or banned wording found.
- Node source symbol audit from `/Users/zbeyens/git/plate-2`: passed for 17 package/API claims.
- Node targeted source audit from `/Users/zbeyens/git/plate-2`: passed for root-hook signatures and repo-private `slate-browser`.
- `bun test ./packages/slate/test/public-package-import-smoke.test.ts ./packages/slate-react/test/surface-contract.tsx ./packages/slate-browser/test/core/package-scripts.test.ts ./packages/slate-layout/test/page-layout-contract.test.ts ./packages/slate-history/test/history-contract.ts ./packages/slate-hyperscript/test` from `/Users/zbeyens/git/plate-2/.tmp/slate-v2`: 135 pass, 0 fail.
- `.agents/skills/autoreview/scripts/autoreview --mode local` from `/Users/zbeyens/git/plate-2`: clean.
- Targeted autoreview prompt for release files from `/Users/zbeyens/git/plate-2`: final clean, no remaining source-backed release-doc issues.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker sync requested.
- Confidence line: High for release-doc completeness against current source inventory.
- Docs lane: release/blog narrative with source-backed package/API audit.
- Source-backed claims: audited against Slate v2 docs, package readmes, source exports, package metadata, and focused package surface tests.
- Content build / parser: N/A for GitBook Markdown under `.tmp/slate-v2/docs/**`; link/fence audits ran.
- Links / demos / previews: 11 relative links verified; no demos/previews.
- Browser check: N/A, no public rendered route changed.
- Outcome: full Better Auth-style Slate v2 release draft exists and is linked.
- Caveat: release doc is a draft and explicitly does not claim npm publish/release/PR/raw mobile/pagination maturity.
- Verified: link/fence/section/source audits, focused package surface proof, local autoreview, and targeted release-doc autoreview.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A for Markdown source.
- Caveats: release/publish remains unclaimed; `slate-browser` stays repo-private; `slate-layout` remains experimental.

Timeline:
- 2026-06-15T17:29:47.608Z Docs goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run `check-complete`, then close the goal. |
| What is the goal? | Create a Better Auth-style full Slate v2 release/blog doc with source-backed coverage of all major release changes and new features. |
| What have I learned? | Migration guide existed; full release/blog narrative was missing. Root-hook signatures and `slate-browser` privacy needed explicit correction. |
| What have I done? | Added and linked release draft, fixed review findings, and ran audits/review. |

Open risks:
- None blocking. Residual release-lane caveat is intentional: this is a release draft, not a publish claim.
