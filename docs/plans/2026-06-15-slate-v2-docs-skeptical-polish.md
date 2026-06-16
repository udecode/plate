# slate v2 docs skeptical polish

Objective:
Polish Slate v2 release and migration docs for skeptical developers; done when source-backed audits, review, and plan checks pass.

Goal plan:
docs/plans/2026-06-15-slate-v2-docs-skeptical-polish.md

Template:
docs/plans/templates/docs.md

Primary template:
docs/plans/templates/docs.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Docs source:
- type: user-requested docs quality loop
- id / link: current Codex thread
- title: Slate v2 release and migration docs skeptical polish
- acceptance criteria: step back and keep improving `.tmp/slate-v2/docs/releases/slate-v2.md` and `.tmp/slate-v2/docs/migration/slate-v2.md` until they satisfy a skeptical Slate developer: clear why v2 exists, honest limits, exact migration path, precise API names/imports, no marketing fog, no stale guidance, no unproven release claims, source-backed examples, and clean review/audit proof.

Docs lane:
- lane: release/blog narrative plus guide/system migration
- target docs: `.tmp/slate-v2/docs/releases/slate-v2.md` and `.tmp/slate-v2/docs/migration/slate-v2.md`
- documented source owner: `.tmp/slate-v2/packages/**`, `.tmp/slate-v2/docs/**`, and current Slate v2 proof/readiness docs under `docs/slate-v2/**`
- nearest sibling docs: `.tmp/slate-v2/docs/Summary.md`, `.tmp/slate-v2/Readme.md`, package readmes, roots/document-state docs, React setup/hooks docs, and Better Auth release/migration examples for style only
- plugin page: N/A: not a plugin page

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Both target docs read like they were written for a skeptical Slate developer, not for someone already convinced.
- Release doc explains value, limits, package ownership, migration entry points, proof posture, and hard cuts without overclaiming release/publish/mobile/pagination/collab readiness.
- Migration guide gives a concrete porting path from old Slate to v2, with old/new examples, exact imports, root/state persistence guidance, event/hook mapping, validation checklist, and clear stop conditions.
- Every named public API/import/package claim is backed by current source or explicitly labeled repo-private/experimental/deferred.
- Link, fence, anti-slop, stale-symbol, source-symbol, focused package-surface, and targeted review checks pass.
- Docs closure is legal only when the page teaches the fastest correct path,
  every claim is source-backed, docs-lane shape is satisfied, required MDX/link/
  preview checks are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-slate-v2-docs-skeptical-polish.md`
  passes.

Verification surface:
- Source reads: target docs, adjacent Slate v2 docs/readmes/source, selected public export/test surfaces, and Better Auth style examples.
- Static audits: link audit, code-fence audit, section/coverage audit, stale-symbol audit, anti-slop audit, and source-symbol audit for named APIs.
- Package proof: focused package surface/import tests in `.tmp/slate-v2` for packages named by the docs.
- Review proof: targeted autoreview prompt against the two target docs after edits.

Constraints:
- Follow `.agents/rules/docs-creator.mdc` for docs style and workflow.
- Write current-state docs only. No changelog voice.
- Keep code examples repo-backed and copy-pasteable.
- Do not invent APIs, routes, demos, imports, components, transforms, or options.
- Do not add docs ceremony for tiny typo/copy edits.

Boundaries:
- Source of truth: `.tmp/slate-v2/**` for Slate v2 current docs/source, `docs/slate-v2/**` for proof/readiness claim width, and `../better-auth/**` for style only.
- Allowed edit scope: `.tmp/slate-v2/docs/releases/slate-v2.md`, `.tmp/slate-v2/docs/migration/slate-v2.md`, `.tmp/slate-v2/docs/Summary.md` only if link routing needs repair, and this goal plan.
- Browser surface: N/A unless a rendered docs route is changed; these are GitBook-style Markdown docs in the sibling Slate v2 checkout.
- Tracker sync: N/A: no issue/PR requested.
- Non-goals: no runtime changes, no package release/publish/PR claim, no new package API, no pagination architecture, no raw mobile claim, no collab/Yjs implementation.

Blocked condition:
- Block only if source cannot prove a public API used by the docs or if a required product/release claim needs a user decision rather than wording.

Docs state:
- task_type: docs
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final handoff
- goal_status: ready for `update_goal(status: complete)`

Current verdict:
- verdict: complete after accepted review fixes
- confidence: high
- next owner: docs
- reason: target docs now give skeptical-developer entry gates, guarded install guidance, a first migration slice, exact public API wording, deletion proof gates, and clean review/audit proof.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-slate-v2-docs-skeptical-polish.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Copied explicit requirements: use autogoal, step back, improve release + migration docs, skeptical Slate developer lens, continue until fully satisfied, source-backed verification. |
| `docs-creator` loaded | yes | Read `.agents/skills/docs-creator/SKILL.md`. |
| Active goal checked or created | yes | `get_goal` returned null; created active goal for this plan. |
| Docs lane selected | yes | Release/blog narrative plus guide/system migration. |
| Target docs read | yes | Read `.tmp/slate-v2/docs/releases/slate-v2.md` and `.tmp/slate-v2/docs/migration/slate-v2.md`. |
| Nearest sibling docs read | yes | Read `.tmp/slate-v2/Readme.md`, `.tmp/slate-v2/docs/libraries/slate-react/hooks.md`, and Better Auth migration style sample for tone only. |
| Docs style doctrine read | yes | Read `.agents/skills/docs-creator/SKILL.md`. |
| Documented source code read | yes | Read package exports for `slate`, `slate-react`, `slate-dom`, `slate-history`, `slate-hyperscript`, `slate-layout`, and `slate-browser`. |
| Ownership map drafted | yes | Release and migration docs state package ownership plus repo-private `slate-browser` boundary. |
| Plugin-page rules decision | no | N/A: release and migration docs, not plugin docs. |
| Browser/render proof decision | no | N/A for now: Markdown docs in `.tmp/slate-v2`; run source/link/fence audits unless a public route changes. |
| PR/tracker expectation decision | no | N/A: no PR/tracker requested. |
| Package/API pack selected | yes | Applied package-api pack because docs teach public package APIs. |
| Public surface or package boundary identified | yes | Target docs teach `slate`, `slate-dom`, `slate-react`, `slate-history`, `slate-hyperscript`, `slate-layout`, and repo-private `slate-browser`. |
| Release artifact path selected | no | N/A: docs-only polish, no package behavior delta. |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no `.changeset` required for docs-only polish. |
| Barrel/export impact decision recorded | no | N/A: no source exports changed. |

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
- [x] Anti-slop audit passed: no changelog voice, no fake APIs, no placeholder
      comments, no unfinished markers, no dead anchors, no redundant summary section.
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
| Named verification threshold | yes | Run source audit, link/fence check, package surface proof, and review | Source/link/fence audits passed; focused package tests passed; final autoreview clean. |
| Docs lane shape satisfied | yes | Check the lane-specific structure against `docs-creator` | Added skeptic gate, first migration slice, install caveat, package ownership, proof gates, and clean next-read path. |
| Source-backed claim audit | yes | Verify every named API/option/transform/component/import/route against source | Export/source reads plus package tests verified named public API claims; removed fake `TextString`/`ZeroWidthString` public wording and fixed decorate target. |
| Ownership map verified | yes | Confirm package/layer/kit/app-local ownership claims against source | Package split in docs matches public exports and `slate-browser` private package status. |
| MDX/content parser | no | Run `pnpm --filter www build:contentlayer` for MDX/content changes, or record N/A | N/A: changed GitBook-style Markdown under `.tmp/slate-v2/docs/**`, not Plate `content/**` MDX. |
| Links/routes/previews verified | yes | Check leaf links, routes, anchors, and `<ComponentPreview>` names or record N/A | Node link/fence audit passed; no previews present. |
| Plugin page specifics | no | If plugin page, apply `docs-creator` kit/manual/API rules or record N/A | N/A: release and migration docs, not plugin docs. |
| Browser/render surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: docs-only Markdown edit, no known rendered route changed in Plate app. |
| Package/API behavior changed | no | Add changeset or record N/A | N/A: docs-only edit, no runtime/API/type behavior change. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no `.agents` source edited. |
| Autoreview for non-trivial docs changes | yes | Load `.agents/skills/autoreview/SKILL.md` and run the right target, or record N/A for tiny/no-local-patch work | Final targeted autoreview exited clean with no accepted/actionable findings. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: docs-only Markdown in `.tmp/slate-v2`; source/link/fence/package tests are the scoped equivalent for this edit. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-slate-v2-docs-skeptical-polish.md` | To run after this evidence write. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | `slate` public import smoke plus package-owned contracts passed. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | No release artifact: docs-only edit in `.tmp/slate-v2/docs/**`. |
| Published package changeset | no | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | N/A: no published package behavior/API/types/config/runtime delta. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, update `docs/components/changelog.mdx` and do not add a package changeset | N/A: no registry files changed. |
| No release artifact | yes | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | Docs-only; no published package user-visible delta beyond documentation. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Focused source/package tests passed; failed runner-shape attempts recorded below. |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no exports or exported file layout changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | target docs, sibling docs, Better Auth style sample, and package exports read | done |
| Writing | complete | patched release and migration docs | done |
| Verification | complete | source/link/fence/package/review proof recorded | done |
| PR / tracker sync | N/A | no PR/tracker requested | done |
| Closeout | complete | plan ready for `check-complete` and `update_goal` | final response |

Findings:
- Initial risk: release docs can accidentally overclaim public release/publish/mobile/pagination/collab readiness.
- Initial risk: migration docs can be too long but still miss "what do I do first?" for skeptical old-Slate users.
- Initial risk: root, hook, and `slate-browser` public/private wording drift easily; audit those explicitly.
- Review finding accepted: plain `npm install slate ...` was unsafe while v2 publish is disclaimed. Fixed release and migration docs with pre-publish warnings.
- Review finding accepted: `Editable.decorate` implied a fake static API. Fixed to `<Editable decorate={...} />`.
- Review finding accepted: optional `npm install slate-history slate-hyperscript` needed the same pre-publish warning. Fixed wording to cover every install command in the section.

Decisions and tradeoffs:
- Keep the docs in `.tmp/slate-v2/docs/**` because these are Slate v2 GitBook-style docs, not Plate website release pages.
- Treat Better Auth as style input only; Slate v2 source owns the facts.

Implementation notes:
- `.tmp/slate-v2/docs/releases/slate-v2.md`: renamed page from release draft to current Slate v2 release story; added On This Page, skeptic adoption gate, install warning, and fixed public renderer primitive list.
- `.tmp/slate-v2/docs/migration/slate-v2.md`: added On This Page, migrate/wait gate, first migration slice, install warnings, decorate overlay map, and proof-before-delete section.
- `docs/plans/2026-06-15-slate-v2-docs-skeptical-polish.md`: recorded autogoal evidence.

Review fixes:
- Accepted and fixed autoreview install warning for unpublished v2 packages.
- Accepted and fixed autoreview fake `Editable.decorate` API wording.
- Accepted and fixed autoreview optional install warning.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `bun test` without `./` path prefixes | 1 | Use `./packages/...` path filters | Fixed command shape. |
| Root-cwd React provider test | 1 | Run package test with package cwd plus root preload | Passed with `bun test --preload ../../config/bun-test-setup.ts ./test/provider-hooks-contract.tsx`. |
| Bare package-cwd React test without DOM preload | 1 | Use root preload or Vitest jsdom config | Passed with package-owned runners. |

Verification evidence:
- Source reads: target docs, `.tmp/slate-v2/Readme.md`, slate-react hooks docs, package export indexes, decorate docs/source, and Better Auth migration sample for style only.
- Link/fence audit: Node script passed for both target docs; release has 46 code fences, migration has 76 code fences; links and anchors resolve.
- Anti-slop/source audit: no `Editable.decorate`, fake `TextString`/`ZeroWidthString` public guidance, unfinished markers, dead placeholders, or root `"main"` public usage in target docs. The only string audit hit is the intentional negative pagination disclaimer.
- Package/API proof from `.tmp/slate-v2`: `bun test ./packages/slate/test/public-package-import-smoke.test.ts ...` passed 135 tests across 3 files.
- Package-owned proof from `.tmp/slate-v2/packages/slate`: `bun test ./test/public-package-import-smoke.test.ts` passed 15 tests.
- Package-owned proof from `.tmp/slate-v2/packages/slate-react`: `bun test --preload ../../config/bun-test-setup.ts ./test/surface-contract.tsx` passed 53 tests.
- Package-owned proof from `.tmp/slate-v2/packages/slate-react`: `bun test --preload ../../config/bun-test-setup.ts ./test/provider-hooks-contract.tsx` passed 37 tests.
- Package-owned proof from `.tmp/slate-v2/packages/slate-react`: `bun run vitest run --config ./vitest.config.mjs ./test/surface-contract.tsx ./test/provider-hooks-contract.tsx ./test/use-slate-history.test.tsx ./test/use-slate-root-chrome.test.tsx ./test/use-slate-root-command-hooks.test.tsx` passed 3 test files and 19 tests; config includes only `.test` files.
- Package-owned proof from `.tmp/slate-v2/packages/slate-history`: `bun test ./test/history-contract.ts` passed 50 tests.
- Package-owned proof from `.tmp/slate-v2/packages/slate-hyperscript`: `bun test ./test/package-readme-contract.test.ts` passed 2 tests.
- Package-owned proof from `.tmp/slate-v2/packages/slate-layout`: `bun test ./test/page-layout-contract.test.ts` passed 41 tests.
- Package-owned proof from `.tmp/slate-v2/packages/slate-browser`: `bun test ./test/core/package-scripts.test.ts` passed 8 tests.
- Targeted autoreview final command: `.agents/skills/autoreview/scripts/autoreview --mode local --prompt "Review only these docs changes: .tmp/slate-v2/docs/releases/slate-v2.md and .tmp/slate-v2/docs/migration/slate-v2.md. Ignore unrelated local changes. Focus on skeptical Slate developer clarity, stale/fake public APIs, overclaims, migration correctness, broken anchors/links, and docs style. The npm install snippets are only acceptable if the docs clearly say not to run any install snippet against npm before the v2 packages are published. The decorate migration target must be the <Editable decorate={...} /> prop, not a static Editable.decorate API. Do not request runtime changes unless the docs make an impossible claim."`
- Targeted autoreview final result: clean; no accepted/actionable findings reported.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no issue/tracker requested.
- Confidence line: high after source audit, package proof, and clean targeted autoreview.
- Docs lane: release/blog narrative plus guide/system migration.
- Source-backed claims: package exports and contracts checked.
- Content build / parser: N/A for GitBook Markdown in `.tmp/slate-v2`.
- Links / demos / previews: links/anchors checked; no previews.
- Browser check: N/A for docs-only Markdown change.
- Outcome: docs now answer skeptical adoption, migration ordering, proof gates, install caveats, and fake API risks.
- Caveat: adjacent slate-react docs still use the phrase `Editable.decorate`; not changed because this goal's edit scope was the two target docs.
- Verified: source/link/fence/package tests and targeted autoreview.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A docs-only.
- Caveats: adjacent docs phrase noted above.

Timeline:
- 2026-06-15T17:57:08.264Z Docs goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response after `check-complete` and `update_goal` |
| What is the goal? | Make the Slate v2 release and migration docs convincing, exact, and honest for a skeptical Slate developer. |
| What have I learned? | The real docs failures were unguarded install commands before publish, fake static decorate wording, and missing proof gates. |
| What have I done? | Patched both docs, accepted/fixed three review findings, and verified with source audits, package tests, and clean autoreview. |

Open risks:
- Adjacent slate-react docs still contain `Editable.decorate` phrasing; not part of this edit scope, but worth cleaning in a separate docs consistency pass.
