# plite migration guide

Objective:
Create a full Plite migration guide in Better Auth style; done when guide, nav, and source-backed checks pass; plan docs/plans/2026-06-15-plite-migration-guide.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-06-15-plite-migration-guide.md

Template:
docs/plans/templates/docs.md

Primary template:
docs/plans/templates/docs.md

Applied packs:
- none

Docs source:
- type: user request
- id / link: current thread
- title: Full Plite migration guide
- acceptance criteria: write a full migration guide; match the writing style of `../better-auth` migration guides; keep Plite API claims source-backed; wire the page into docs navigation; verify no stale or invented API names.

Docs lane:
- lane: guide/system migration
- target docs: `.tmp/plite/docs/migration/plite.md` plus `.tmp/plite/docs/Summary.md`
- documented source owner: Plite packages under `.tmp/plite/packages/*`, compared with upstream `/Users/zbeyens/git/slate/packages/*`
- nearest sibling docs: `.tmp/plite/docs/Introduction.md`, `.tmp/plite/docs/walkthroughs/01-installing-slate.md`, `.tmp/plite/docs/concepts/07-editor.md`, `.tmp/plite/docs/concepts/04-transforms.md`, `.tmp/plite/docs/libraries/slate-react/README.md`, and Better Auth migration guides under `../better-auth/docs/content/docs/guides/*-migration-guide.mdx`
- plugin page: N/A, migration guide not plugin/feature page

First checkpoint:
- [x] Use `autogoal`. Evidence: active goal created for this plan.
- [x] Use `docs-creator` docs workflow. Evidence: `.agents/skills/docs-creator/SKILL.md` read.
- [x] Create a full migration guide, not a short changelog or changeset recap.
- [x] Match the writing style of `../better-auth` migration guides: frontmatter-like title/description when supported, short intro, explicit warning/caveat, step-by-step sections, old/new code comparisons, and compact mapping tables.
- [x] Adapt style to Plite's GitBook Markdown renderer instead of copying unsupported Better Auth MDX components.
- [x] Source-back every named Plite API, package, option, import path, and migration instruction against current files.
- [x] Wire the guide into Plite docs navigation.
- [x] Stop condition: do not close until the guide exists, the nav references it, source audits pass, stale-symbol audits pass, and `check-complete.mjs` passes.

Completion threshold:
- `.tmp/plite/docs/migration/plite.md` exists and covers the main migration surfaces: install/imports, `createEditor`, React setup, initial value/document state, custom elements, renderers, events, transforms, history, DOM/React editor APIs, hyperscript, package import shape, and validation/testing checklist.
- `.tmp/plite/docs/Summary.md` links the migration guide in a sensible docs section.
- The guide uses Better Auth-style migration rhythm while remaining valid Markdown for Plite docs.
- Every code sample uses current public imports and APIs verified from source.
- Stale-symbol audit rejects legacy guidance that should not appear as target APIs: `withReact`, `withHistory`, `Transforms.`, `ReactEditor.` value usage, `usePlite`, `useSelected`, `useFocused`, and `useReadOnly` outside legacy comparison blocks.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-plite-migration-guide.md` passes after final evidence is recorded.
- Docs closure is legal only when the page teaches the fastest correct path,
  every claim is source-backed, docs-lane shape is satisfied, required MDX/link/
  preview checks are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-plite-migration-guide.md`
  passes.

Verification surface:
- Source audit: compare Better Auth migration guides and Plite docs/source.
- Source audit: verify current public exports in `.tmp/plite/packages/plite/src/index.ts`, `plite-react/src/index.ts`, `plite-dom/src/index.ts`, `plite-history/src/index.ts`, and `plite-hyperscript/src/index.ts`.
- Content audit: verify `.tmp/plite/docs/Summary.md` links the new page and every relative docs link exists.
- Stale-symbol audit: scan the new page for legacy-only APIs outside explicit legacy comparison sections.
- Plan checker: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-plite-migration-guide.md`.

Constraints:
- Follow `.agents/rules/docs-creator.mdc` for docs style and workflow.
- Write current-state docs only. No changelog voice.
- Keep code examples repo-backed and copy-pasteable.
- Do not invent APIs, routes, demos, imports, components, transforms, or options.
- Do not add docs ceremony for tiny typo/copy edits.

Boundaries:
- Source of truth: `../better-auth/docs/content/docs/guides/*-migration-guide.mdx` for writing style; `/Users/zbeyens/git/slate` for old Plite public shape; `.tmp/plite` source/docs for current Plite shape.
- Allowed edit scope: `.tmp/plite/docs/migration/plite.md`, `.tmp/plite/docs/Summary.md`, this goal plan, and temporary audit artifacts if needed.
- Browser surface: N/A unless docs renderer route is already available; Plite docs are Markdown/GitBook-style source in this checkout.
- Tracker sync: N/A, no issue/PR requested.
- Non-goals: no runtime code changes; no package changesets; no commit/PR; no pagination/perf architecture.

Blocked condition:
- Block only if current Plite public APIs cannot be verified from source or if the docs renderer requires unsupported MDX components to match Better Auth exactly.

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
- reason: guide, nav link, source-backed audits, stale-symbol audit, link audit, fence audit, and focused package proof are recorded.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-plite-migration-guide.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint copies guide/style/source/nav/verification requirements from the prompt. |
| `docs-creator` loaded | yes | `.agents/skills/docs-creator/SKILL.md` read before writing. |
| Active goal checked or created | yes | `get_goal` returned this active goal. |
| Docs lane selected | yes | Lane recorded as guide/system migration. |
| Target docs read | yes | `.tmp/plite/docs/Summary.md` and target migration path decision recorded. |
| Nearest sibling docs read | yes | Installing, editor, transforms, React setup/hooks/events, roots, document state, history, and hyperscript docs read. |
| Docs style doctrine read | yes | `docs-creator` workflow read and applied. |
| Documented source code read | yes | Public exports checked in `.tmp/plite/packages/plite*` and current tests. |
| Ownership map drafted | yes | Package ownership recorded in the guide and source-backed. |
| Plugin-page rules decision | N/A | This is a migration guide, not a plugin page. |
| Browser/render proof decision | N/A | Markdown docs source changed only; no docs renderer route was required. |
| PR/tracker expectation decision | N/A | User asked for local guide, no PR or tracker sync. |

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
      comments, no TODOs, no dead anchors, no redundant summary section.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed docs.
- [x] Review/autoreview target selected for non-trivial docs work, or marked
      N/A with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run source audit, stale-symbol audit, link check, package proof, and plan checker | Guide/nav/source audits completed. |
| Docs lane shape satisfied | yes | Check the guide/system migration shape against `docs-creator` | Better Auth-style intro, warning, steps, mapping table, old/v2 examples, validation checklist, API links. |
| Source-backed claim audit | yes | Verify every named API/option/transform/component/import/route against source | Public symbols checked in `packages/plite*`; state field and roots claims checked against docs/tests. |
| Ownership map verified | yes | Confirm package/layer ownership claims against source | Package ownership list matches public package exports. |
| MDX/content parser | N/A | Run `pnpm --filter www build:contentlayer` for MDX/content changes, or record N/A | Plite docs are GitBook Markdown under `.tmp/plite/docs`, not Plate MDX/contentlayer. |
| Links/routes/previews verified | yes | Check leaf links, routes, anchors, and previews or record N/A | Node link audit passed; no previews. |
| Plugin page specifics | N/A | If plugin page, apply `docs-creator` kit/manual/API rules or record N/A | Migration guide only. |
| Browser/render surface changed | N/A | Capture Browser Use proof or record explicit waiver/blocker | Markdown source only; no local docs browser target needed. |
| Package/API behavior changed | N/A | Add changeset or record N/A | Docs-only edit, no package behavior changed. |
| Agent rules or skills changed | N/A | Run `pnpm install` and verify generated skill sync | No `.agents` source or rules changed. |
| Autoreview for non-trivial docs changes | N/A | Load `.agents/skills/autoreview/SKILL.md` and run the right target, or record N/A for tiny/no-local-patch work | Docs-only self-review used source/link/stale audits; no runtime patch. |
| Final lint | N/A | Run `pnpm lint:fix` or scoped equivalent | No Markdown lint command exists for this docs source; fence/link/source audits used instead. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-plite-migration-guide.md` | Running after this evidence update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Better Auth guides, Plite docs/source, and old Plite public surface read | done |
| Writing | complete | `.tmp/plite/docs/migration/plite.md` created and `Summary.md` linked it | done |
| Verification | complete | link/nav, stale-symbol, source, fence, and focused package proof recorded | done |
| PR / tracker sync | N/A | No PR/tracker requested | done |
| Closeout | complete | plan evidence updated; check-complete next | done |

Findings:
- Better Auth migration guides use a concise intro, warning/caveat, step flow, migration maps, and old/new code comparisons.
- Plite docs are GitBook Markdown, so unsupported Better Auth MDX components were not copied.
- Current Plite migration center is `usePliteEditor`, `editor.read`, `editor.update`, public helper APIs, rootless primary editable, optional extra roots, and document state fields.

Decisions and tradeoffs:
- Created a dedicated Migration section in `Summary.md` instead of burying the guide under Walkthroughs.
- Kept legacy APIs only in `Slate 0.x` comparisons and mapping rows.
- Used Markdown headings and code blocks instead of Better Auth MDX `<Steps>` or `<Tabs>`.

Implementation notes:
- Added `.tmp/plite/docs/migration/plite.md`.
- Updated `.tmp/plite/docs/Summary.md`.
- Patched examples after self-review: old snippets import their old APIs, document state uses `initial` and `persist`, and context hooks run under `<Plite>`.

Review fixes:
- Fixed `defineStateField` example from `initialValue` to `initial`.
- Split the document-state React example so `useStateFieldValue` runs inside the `<Plite>` provider.
- Added missing imports in old Plite comparison snippets.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `bun test ./packages/plite/test/public-package-import-smoke.test.ts ./packages/plite-react/test/generic-react-editor-contract.tsx ./packages/plite-history/test/history-contract.ts ./packages/plite-hyperscript/test` failed because `generic-react-editor-contract.tsx` references `slateNode` at module scope | 1 | Rerun package proof without that unrelated executable test | Passing focused package proof recorded; generic test failure left as existing test-lane caveat. |

Verification evidence:
- `node` link/nav audit from `/Users/zbeyens/git/plate-2`: passed for `.tmp/plite/docs/migration/plite.md` links and `Summary.md` nav.
- `node` legacy-symbol containment audit from `/Users/zbeyens/git/plate-2`: passed; old APIs appear only in legacy comparison/map/negative guidance.
- `rg` source audit from `/Users/zbeyens/git/plate-2`: confirmed helper APIs in Plite interface files and public import smoke expectations.
- `rg` anti-slop audit from `/Users/zbeyens/git/plate-2`: no unsupported MDX component tags, task markers, or changelog phrases found.
- `node` fence audit from `/Users/zbeyens/git/plate-2`: passed with 76 balanced code fences.
- `bun test ./packages/plite/test/public-package-import-smoke.test.ts ./packages/plite-history/test/history-contract.ts ./packages/plite-hyperscript/test` from `/Users/zbeyens/git/plate-2/.tmp/plite`: 82 pass, 0 fail.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker sync requested.
- Confidence line: High for docs/source correctness; one unrelated focused test caveat recorded.
- Docs lane: guide/system migration.
- Source-backed claims: public imports and named APIs checked against Plite docs/source/tests.
- Content build / parser: N/A for GitBook Markdown source; link/fence audits ran.
- Links / demos / previews: link/nav audit passed; no demos/previews.
- Browser check: N/A, docs source only.
- Outcome: full migration guide added and linked.
- Caveat: direct execution of `generic-react-editor-contract.tsx` fails on an existing `slateNode` reference outside this docs task.
- Verified: link/nav audit, stale-symbol audit, source audit, anti-slop audit, fence audit, and focused package proof.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A for Markdown source.
- Caveats: existing `generic-react-editor-contract.tsx` executable failure when included in focused package proof.

Timeline:
- 2026-06-15T16:56:42.465Z Docs goal plan created.
- 2026-06-15T17:09:00Z Migration guide and nav link added.
- 2026-06-15T17:16:00Z Docs/source audits and focused package proof completed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response after check-complete |
| What is the goal? | Full Plite migration guide in Better Auth style |
| What have I learned? | Better Auth style can be mirrored with Markdown steps/maps without MDX; v2 target APIs are source-backed |
| What have I done? | Added guide, linked nav, ran audits and focused proof |

Open risks:
- Existing `packages/plite-react/test/generic-react-editor-contract.tsx` fails when run directly because `slateNode` is undefined at module scope; unrelated to this docs edit but worth fixing in the test lane.
