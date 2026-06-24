# slate extension docs cleanup

Objective:
Clean Plite extension docs; done when public docs use extension-first wording, simple authoring path first, and source audits pass.

Goal plan:
docs/plans/2026-06-15-slate-extension-docs-cleanup.md

Template:
docs/plans/templates/docs.md

Primary template:
docs/plans/templates/docs.md

Applied packs:
- none

Docs source:
- type: user-requested docs cleanup
- id / link: current Codex thread
- title: Plite extension docs cleanup
- acceptance criteria: public docs say extensions first, avoid muddy "Plugins"
  page/title language, show simple `defineEditorExtension` authoring before
  advanced generic/module augmentation, and teach the small extension path
  before the broad slot surface.

Docs lane:
- lane: guide/system plus release/API docs
- target docs: `.tmp/plite/docs/**`
- documented source owner: Plite core extension runtime
- nearest sibling docs: Plite release, migration, concepts, and API docs
- plugin page: no; this is raw Plite and should be extension-first

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Public Plite docs do not use "Plugins" as a page/title concept for raw
  Plite extension authoring.
- Public Plite docs use extension-first wording; "plugin" is allowed only
  where it is explicitly casual or legacy vocabulary and not the public surface.
- First `defineEditorExtension` authoring example is inference-simple, with
  advanced generic/module augmentation later.
- Broad extension slots are introduced as a small path first, with the full
  surface moved behind a reference-oriented section.
- Source audits for the above pass.
- Docs closure is legal only when the page teaches the fastest correct path,
  every claim is source-backed, docs-lane shape is satisfied, required MDX/link/
  preview checks are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-slate-extension-docs-cleanup.md`
  passes.

Verification surface:
- Source audits over `.tmp/plite/docs` and `.tmp/plite/Readme.md` for
  `Plugins`, `plugin-authoring`, `defineEditorExtension<`, and top-level slot
  dumps.
- Source verification for `defineEditorExtension` import/signature in
  `.tmp/plite/packages/**`.
- Scoped docs parse/build command if the changed docs are part of the local www
  content pipeline; otherwise record N/A with reason.

Constraints:
- Follow `.agents/rules/docs-creator.mdc` for docs style and workflow.
- Write current-state docs only. No changelog voice.
- Keep code examples repo-backed and copy-pasteable.
- Do not invent APIs, routes, demos, imports, components, transforms, or options.
- Do not add docs ceremony for tiny typo/copy edits.

Boundaries:
- Source of truth: Plite source and `.tmp/plite/docs/**` public docs.
- Allowed edit scope: public Plite docs and this goal plan.
- Browser surface: none expected; text docs only unless route/nav changes.
- Tracker sync: N/A.
- Non-goals: no runtime/API changes, no Plate docs rewrite, no release/publish
  claims.

Blocked condition:
- Stop only if source contradicts the accepted extension API shape or a route/nav
  rename requires a docs system owner that is not present locally.

Docs state:
- task_type: docs
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: docs patched and verified
- confidence: high
- next owner: final handoff
- reason: stale page/title wording is gone, simple extension path is first, and
  focused source/tests pass

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-slate-extension-docs-cleanup.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | This plan copies the extension-first, simple-example-first, small-path-first requirements. |
| `docs-creator` loaded | yes | `.agents/skills/docs-creator/SKILL.md` read. |
| Active goal checked or created | yes | `get_goal` returned null; goal created for this docs cleanup. |
| Docs lane selected | yes | guide/system plus release/API docs. |
| Target docs read | yes | `.tmp/plite/docs/concepts/08-plugins.md`, release docs, migration docs, package docs, resources, FAQ, proof map. |
| Nearest sibling docs read | yes | `.tmp/plite/docs/libraries/slate.md`, `docs/api/nodes/editor.md`, `docs/concepts/01-interfaces.md`, `docs/Summary.md`. |
| Docs style doctrine read | yes | `.agents/skills/docs-creator/SKILL.md` read. |
| Documented source code read | yes | `.tmp/plite/packages/plite/src/core/editor-extension.ts`, `src/interfaces/editor.ts`, `src/create-editor.ts`, extension/schema tests. |
| Ownership map drafted | yes | Plite core extensions; Plate owns product-level plugins. |
| Plugin-page rules decision | yes | N/A as plugin page; use extension-first raw Plite docs. |
| Browser/render proof decision | yes | N/A unless route/nav changes. |
| PR/tracker expectation decision | yes | N/A; no PR/tracker requested. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation. Evidence: this plan.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Docs lane is classified as install, guide/system, plugin/feature,
      serialization/conversion, workflow/AI, API reference, or spec/law.
- [x] Target docs and nearest sibling docs were read before writing. Evidence:
      source reads listed in Start Gates.
- [x] Docs style doctrine in `docs-creator` was read before writing.
- [x] Documented behavior or API was verified against current source. Evidence:
      `defineEditorExtension` source and 28 passing extension/schema tests.
- [x] Ownership map records core runtime, package, kit, registry, and app-local
      ownership where relevant. Evidence: Plite extensions vs Plate
      product-level plugins boundary in `08-extensions.md`.
- [x] Fastest success path appears before deeper mechanics or API reference.
      Evidence: `Smallest Extension` precedes state/tx, setup, middleware, slot
      reference, and advanced TypeScript.
- [x] Opening is three sentences or fewer and avoids generic fluff.
- [x] Named APIs, options, transforms, components, imports, routes, and package
      specifiers are exact and current.
- [x] Plugin docs, if applicable, satisfy kit/manual/API ordering and headless
      package ownership. N/A: raw Plite docs now use extension-first topology.
- [x] Serialization docs, if applicable, split directions and state environment
      constraints before examples. N/A: no serialization docs changed.
- [x] API reference docs, if applicable, use exact contracts and avoid tutorial
      filler. Evidence: API docs were only link/terminology-adjacent, no API
      reference rewrite.
- [x] Spec/law docs, if applicable, record owner map, evidence, and explicit
      gaps. N/A: no spec/law docs changed.
- [x] Demos/previews are real registry entries or marked N/A with reason. N/A:
      no demos/previews added.
- [x] Links target real leaf pages and do not reinforce pages being displaced.
      Evidence: `rg` has zero `08-plugins` matches and new
      `08-extensions.md` exists.
- [x] Anti-slop audit passed: no changelog voice, no fake APIs, no placeholder
      comments, no TODOs, no dead anchors, no redundant summary section.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed docs.
- [x] Review/autoreview target selected for non-trivial docs work, or marked
      N/A with reason. N/A: helper local mode would review the whole dirty
      checkout; targeted source/test/audit review was the correct scope.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the source audit, parser/build, link/demo check, or review named in this plan | Passed source audits and focused source tests. |
| Docs lane shape satisfied | yes | Check the lane-specific structure against `docs-creator` | Extension page opens with a small path, keeps reference slots later, and uses exact ownership. |
| Source-backed claim audit | yes | Verify every named API/option/transform/component/import/route against source | Read extension source/types and ran focused extension/schema tests. |
| Ownership map verified | yes | Confirm package/layer/kit/app-local ownership claims against source | Plite owns raw extension runtime; Plate mention is limited to product-level plugin vocabulary. |
| MDX/content parser | N/A | Run `pnpm --filter www build:contentlayer` for MDX/content changes, or record N/A | Plite docs here are plain Markdown; no local docs parser/build script found. |
| Links/routes/previews verified | yes | Check leaf links, routes, anchors, and `<ComponentPreview>` names or record N/A | `rg` shows zero stale `08-plugins` route references; no previews added. |
| Plugin page specifics | N/A | If plugin page, apply `docs-creator` kit/manual/API rules or record N/A | Page is now raw Plite Extensions, not a Plate plugin page. |
| Browser/render surface changed | N/A | Capture Browser Use proof or record explicit waiver/blocker | Text docs only; no route server/browser surface changed beyond Markdown links. |
| Package/API behavior changed | N/A | Add changeset or record N/A | Docs only; no package runtime/API changed. |
| Agent rules or skills changed | N/A | Run `pnpm install` and verify generated skill sync | No agent rules/skills changed. |
| Autoreview for non-trivial docs changes | N/A | Load `.agents/skills/autoreview/SKILL.md` and run the right target, or record N/A for tiny/no-local-patch work | Loaded autoreview; helper target rejected because it would sweep unrelated dirty checkout. |
| Final lint | N/A | Run `pnpm lint:fix` or scoped equivalent | No Markdown lint script found; scoped anti-slop and stale-term audits passed. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-slate-extension-docs-cleanup.md` | First run caught closeout metadata gaps; rerun after this update is the final mechanical gate. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | read docs, source, `docs-creator`, `autoreview` | writing |
| Writing | complete | renamed/reworked Extensions page and updated references | verification |
| Verification | complete | audits plus 28 passing focused tests | closeout |
| PR / tracker sync | N/A | no PR/tracker requested | final response |
| Closeout | complete | plan updated with final evidence; check-complete rerun next | final response |

Findings:
- Public docs had a `Plugins` concept page and stale `08-plugins.md` links.
- The first extension authoring path was too broad: it led with state/tx instead
  of a tiny inferred schema extension.
- The full slot surface is source-real but belongs after the small path.
- `defineEditorExtension` supports the simple form and the curried generic
  advanced form.
- Remaining `plugin` hits are either Plate product-level vocabulary or source
  paths under `src/plugin/*`.

Decisions and tradeoffs:
- Rename the concept route to `08-extensions.md` instead of only changing the
  heading. The old route reinforced the wrong public noun.
- Keep one explicit Plate boundary sentence using "plugins" because that is the
  product-level term Plate owns.
- Do not run the autoreview helper in local mode because it would review the
  entire dirty checkout rather than this docs pack.

Implementation notes:
- Added `.tmp/plite/docs/concepts/08-extensions.md`.
- Removed `.tmp/plite/docs/concepts/08-plugins.md`.
- Updated sidebar, related docs, release docs, migration docs, package docs,
  resources, FAQ, and proof map wording.

Review fixes:
- Anti-slop audit caught two existing `powerful` adjectives in touched
  resources docs; both were cut.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Source grep included missing `.tmp/plite/examples` path | 1 | Use existing `.tmp/plite/site/examples` and package paths only | Corrected subsequent source reads. |
| Docs-script search used unmatched zsh glob `.tmp/plite/*/package.json` | 1 | Read `.tmp/plite/package.json` directly and inspect docs tree | No docs parser/build script found. |
| `bun test ./packages/plite/test/generic-extension-install-contract.ts ./packages/plite/test/generic-extension-namespace-contract.ts` failed | 1 | Use runtime extension/schema tests instead of top-level compile-error fixture | Replacement command passed: 28 tests. |
| First `check-complete` run failed on plan metadata | 1 | Fill final gate evidence and closeout status, then rerun checker | Plan metadata repaired. |

Verification evidence:
- Fresh final evidence recorded 2026-06-15:
- `bun test ./packages/plite/test/extension-methods-contract.ts ./packages/plite/test/schema-contract.ts` in `.tmp/plite` -> 28 pass, 0 fail.
- `rg -n "08-plugins|concepts/08-plugins|\\[Plugins\\]|# Plugins|plugin-authoring|Plite plugins|shared by plugins|Plugins extend|Applications, plugins|build a plugin|every plugin" docs Readme.md packages/plite/Readme.md` in `.tmp/plite` -> no matches.
- Anti-slop source audit over changed docs for placeholder markers,
  changelog voice, banned fluff, and placeholder comments -> no matches.
- `rg -n "plugins|plugin" docs Readme.md packages/plite/Readme.md` in `.tmp/plite` -> only Plate product-level wording and source paths.

Final handoff contract:
- PR line: N/A, not requested.
- Issue / tracker line: N/A.
- Confidence line: high.
- Docs lane: guide/system plus release/API docs.
- Source-backed claims: extension source/types read; focused tests passed.
- Content build / parser: N/A, no docs parser/build script found for these
  plain Markdown docs.
- Links / demos / previews: stale route audit passed; no demos/previews changed.
- Browser check: N/A, text docs only.
- Outcome: extension-first docs patched.
- Caveat: autoreview helper skipped because local mode would review unrelated
  dirty checkout.
- Verified: source audits and focused tests passed.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: generic extension install test is not a valid focused runtime command
  because it contains top-level compile-error assertions that throw under
  `bun test`.

Timeline:
- 2026-06-15T18:34:29.193Z Docs goal plan created.
- 2026-06-15T18:35Z Requirement checkpoint filled before docs rewrite.
- 2026-06-15T18:39Z Rewrote Plugins concept as Extensions and updated public
  references.
- 2026-06-15T18:43Z Ran stale-term/source audits and focused extension/schema
  tests.
- 2026-06-15T18:46Z First check-complete run found plan metadata gaps; repaired
  final gate evidence and closeout status.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closing the docs goal |
| Where am I going? | Run check-complete, then final handoff |
| What is the goal? | Clean Plite extension docs so public docs are extension-first and simple-first |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- None for this docs patch.
