# slate docs creator closure loop

Objective:
Close Plite docs docs-creator gaps; done when repeated docs scan has no actionable findings and docs checks pass.

Goal plan:
docs/plans/2026-06-22-slate-docs-creator-closure-loop.md

Template:
docs/plans/templates/docs.md

Primary template:
docs/plans/templates/docs.md

Applied packs:
- none

Docs source:

- type: Plite docs closure loop
- id / link: `content/docs/plite/**/*.mdx`, `content/docs/plite/meta.json`
- title: Plite docs docs-creator closure loop
- acceptance criteria: every actionable docs-creator mismatch found by review
  is fixed, then the review restarts until no suggestions remain.

Docs lane:

- lane: mixed docs topology: guide/system, behavior/runtime concept, API
  reference, install/get-started, and package-library reference
- target docs: all Plite docs under `content/docs/plite`
- documented source owner: docs only; public API claims must match current
  package docs/import surfaces when named
- nearest sibling docs: all `content/docs/plite` pages are in scope; avoid
  isolated page-only fixes that make adjacent docs inconsistent
- plugin page: no, Plite docs are substrate/library docs, not Plate plugin pages

First checkpoint:

- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:

- requested duration: none
- semantics: N/A: user requested iterative closure, not a timed checkpoint
- initial confidence score: N/A: completion is scan/check based
- improvement loop: review all Plite docs, apply all accepted suggestions,
  restart the review from the top, and stop only when no actionable suggestion
  remains
- final score / loop closure: no actionable docs-creator findings after the
  final repeated scan

Completion threshold:

- Repeated Plite docs scan has zero actionable docs-creator findings for:
  opening length, missing `##` sections, long-page navigation, stale routes,
  stale terms, anti-slop terms, nav order, and missing docs topology.
- Any accepted restructure/add/merge/delete suggestion is applied before
  closeout.
- Verification commands and route/link audits pass or record a concrete
  blocker.
- Docs closure is legal only when the page teaches the fastest correct path,
  every claim is source-backed, the selected lane-specific shape proof row is
  satisfied, required MDX/link/preview checks are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-slate-docs-creator-closure-loop.md`
  passes.

Verification surface:

- Source audit: bounded scripts over `content/docs/plite/**/*.mdx` and
  `content/docs/plite/meta.json`.
- Content parser/docs command: `pnpm --filter www check:docs`.
- Link/demo/nav audit: local file/link scan for Plite docs links and
  `content/docs/plite/meta.json` JSON parse.
- Route proof: start the docs app when needed and smoke changed Plite docs
  routes.
- Goal closure: `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-06-22-slate-docs-creator-closure-loop.md`.

Constraints:

- Follow `.agents/rules/docs-creator.mdc` for docs style and workflow.
- Write current-state docs only. No changelog voice.
- Keep code examples repo-backed and copy-pasteable.
- Do not invent APIs, routes, demos, imports, components, transforms, or options.
- Do not add docs ceremony for tiny typo/copy edits.

Boundaries:

- Source of truth: `.agents/skills/docs-creator/SKILL.md`,
  `content/docs/plite/**/*.mdx`, `content/docs/plite/meta.json`, and current
  package/API docs when a claim names an API/import.
- Allowed edit scope: Plite docs, Plite docs nav metadata, and this goal plan.
- Browser surface: changed Plite docs routes in `apps/www` if the docs app can
  run locally.
- Tracker sync: N/A: no issue/PR tracker requested.
- Non-goals: no runtime code changes, no package API changes, no Plate docs
  rewrite outside Plite docs, no changesets, no migration of docs architecture
  beyond Plite docs topology.

Blocked condition:

- Stop only if a docs claim requires a product/API decision not present in
  current source, the docs app cannot run due to unrelated infrastructure after
  one focused retry, or a verification command fails for an owner outside this
  docs packet.

Docs state:

- task_type: docs
- task_complexity: normal
- current_phase: intake
- current_phase_status: complete
- next_phase: writing
- goal_status: active

Current verdict:

- verdict: active
- confidence: medium before edits; final confidence requires repeated scan and
  docs checks
- next owner: docs
- reason: existing audit found structural docs-creator mismatches across Plite
  docs that should be patched before public sharing

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-slate-docs-creator-closure-loop.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint below copies explicit user requirements before docs edits |
| Timed checkpoint parsed | no | N/A: no duration was requested |
| `docs-creator` loaded | yes | Read `.agents/skills/docs-creator/SKILL.md` through EOF |
| Active goal checked or created | yes | `get_goal` showed no active goal; `create_goal` created this goal |
| Docs lane selected | yes | Mixed Plite docs topology; lane rows will be resolved per changed page class |
| Target docs read | yes | Prior bounded Plite docs scans and targeted reads identified current findings |
| Nearest sibling docs read | yes | Scope is all Plite docs; topology scan covers sibling page order and repeated structures |
| Docs style doctrine read | yes | Read `.agents/skills/docs-creator/SKILL.md` through EOF |
| Documented source code read | no | N/A before edits: planned fixes are docs topology/style, not new API behavior claims |
| Ownership map drafted | yes | Docs-only owner map recorded in Docs lane and Boundaries |
| Plugin-page rules decision | no | N/A: Plite substrate docs are not Plate plugin pages |
| Browser/render proof decision | yes | Route smoke after docs edits if app can run |
| PR/tracker expectation decision | no | N/A: no PR/tracker action requested |

Work Checklist:

- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation. Requirements:
      review all Plite docs; match docs-creator; add missing concepts if found;
      restructure order if found; apply all accepted suggestions; restart the
      review loop until no actionable suggestion remains; verify docs and
      routes before closeout.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Docs lane is classified as install, guide/system, plugin/feature,
      serialization/conversion, workflow/AI, API reference, or spec/law.
- [x] Selected lane-specific shape proof row below is resolved with concrete
      evidence. A generic "docs lane shape satisfied" statement is not enough.
- [x] Target docs and nearest sibling docs were read before writing. Evidence:
      bounded scans covered all 72 Plite MDX pages and targeted reads covered
      every flagged page before edits.
- [x] Docs style doctrine in `docs-creator` was read before writing. Evidence:
      `.agents/skills/docs-creator/SKILL.md` read through EOF.
- [x] Documented behavior or API was verified against current source. Evidence:
      N/A for new behavior claims; this pass only moved existing prose/code
      under docs-creator headings and changed nav order.
- [x] Ownership map records core runtime, package, kit, registry, and app-local
      ownership where relevant. Evidence: Plite docs owner map recorded above;
      plugin/kit ownership is N/A.
- [x] Fastest success path appears before deeper mechanics or API reference.
      Evidence: opening-code examples were moved under `## Usage`,
      `## Minimal Usage`, `## Starting Point`, `## Type`, or `## Interface`.
- [x] Opening is three sentences or fewer and avoids generic fluff. Evidence:
      final structural scan reported no findings.
- [x] Named APIs, options, transforms, components, imports, routes, and package
      specifiers are exact and current. Evidence: no new API names introduced;
      `pnpm --filter www check:docs` passed.
- [x] Plugin docs, if applicable, satisfy kit/manual/API ordering and headless
      package ownership. N/A: Plite docs changed here are not Plate plugin docs.
- [x] Serialization docs, if applicable, split directions and state environment
      constraints before examples. N/A: no serialization page changed.
- [x] API reference docs, if applicable, use exact contracts and avoid tutorial
      filler. Evidence: API stubs now have `## Type`, `## Interface`, or
      `## On This Page`; large references have early navigation.
- [x] Spec/law docs, if applicable, record owner map, evidence, and explicit
      gaps. N/A: no spec/law page changed.
- [x] Demos/previews are real registry entries or marked N/A with reason. N/A:
      no `<ComponentPreview>` added or changed.
- [x] Links target real leaf pages and do not reinforce pages being displaced.
      Evidence: refined Plite docs links/assets audit reported `links/assets ok`.
- [x] Anti-slop audit passed: no changelog voice, no fake APIs, no placeholder
      comments, no unresolved task markers, no dead anchors, no redundant
      summary section.
      Evidence: final stale-term scan returned no matches.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed docs. Evidence: verification evidence records cwd
      `/Users/zbeyens/git/plate-2`.
- [x] Review/autoreview target selected for non-trivial docs work, or marked
      N/A with reason. N/A: the requested review owner was `docs-creator`; the
      repeated docs-creator audit was run until no actionable finding remained.

Lane-Specific Shape Proof:
| Lane | Applies | Required proof | Evidence |
|------|---------|----------------|----------|
| Install / get-started | no | Opening has only the short lead before the first `##`; page has `## Installation`, `## Usage` or an equivalent first working path, and next-step links; procedural setup uses `<Steps>` when it is more than one real step; installed packages have an ownership table when more than one package/layer is involved; app-file snippets use titled code fences when file context matters. | N/A: no install/get-started page changed in this pass. |
| Component / registry item | no | Real preview exists or is marked N/A; installation is CLI/manual shaped; usage has imports plus smallest JSX; examples are real variants; API reference is last when needed. | N/A: no component/registry page changed. |
| Guide / system | yes | Opening is short with sibling disambiguation when needed; ownership model appears early; quick start precedes deeper mechanics; reference material stays last. | `concepts/08-extensions`, `concepts/09-rendering`, `concepts/13-roots`, and walkthroughs now have short openings, first working-path headings, and long-page jump lists where needed. |
| Behavior / runtime concept | yes | Decision table or equivalent surface choice appears early; runtime pipeline has owner map; each stage is separated; recipes link to canonical references. | N/A for new behavior concepts; changed behavior-adjacent pages only received structural heading/jump-list fixes. |
| Plugin / feature | no | Kit usage and manual usage are split when a kit exists; headless package ownership is explicit; plugin APIs/transforms are documented only when source-real. | N/A: no Plate plugin page changed. |
| Serialization / conversion | no | Directions are split up front; environment constraints appear before examples; extension points come after the base path; heavy API reference stays late. | N/A: no serialization page changed. |
| Workflow / AI | no | Required runtime pieces are separated from optional UI; setup path comes before architecture; client/server or provider boundaries are explicit. | N/A: no workflow/AI page changed. |
| API reference | yes | Short purpose paragraph, grouped surface, exact parameters/options/returns, caveats, and no tutorial restart. | API stubs now have section headings; long API references now have early `## On This Page` navigation and no code before first heading. |
| Spec / law / behavior | no | Contract, owner map, model-before-UX, evidence, and explicit gaps are recorded before any appendix. | N/A: no spec/law page changed. |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the source audit, parser/build, link/demo check, or review named in this plan | Final repeated structural audit: no findings; stale-term scan: no matches; `pnpm --filter www check:docs`: pass. |
| Docs lane shape satisfied | yes | Resolve the selected row in `Lane-Specific Shape Proof`; do not close this gate from a generic shape assertion | Guide/system and API reference rows resolved above with changed page evidence. |
| Source-backed claim audit | yes | Verify every named API/option/transform/component/import/route against source | N/A for new claims; no new API/option/import claims added. Existing docs parsed and rendered. |
| Ownership map verified | yes | Confirm package/layer/kit/app-local ownership claims against source | Docs-only owner map; no package/kit ownership claims changed. |
| MDX/content parser | yes | Run `pnpm --filter www build:contentlayer` for MDX/content changes, or record N/A | `pnpm --filter www check:docs` ran `build:source` and source parity; pass. |
| Links/routes/previews verified | yes | Check leaf links, routes, anchors, and `<ComponentPreview>` names or record N/A | Plite link/asset audit: `links/assets ok`; 30 changed/affected routes returned HTML on `localhost:3002`. |
| Plugin page specifics | no | If plugin page, apply `docs-creator` kit/manual/API rules or record N/A | N/A: no Plate plugin page changed. |
| Browser/render surface changed | yes | Capture Browser proof for normal rendered surfaces, or Chrome/Computer proof for native browser/OS surfaces | Browser MCP was not directly exposed after tool search; text-only route smoke used against live app: 30 routes OK. |
| Package/API behavior changed | no | Add changeset or record N/A | N/A: docs-only, no package/API behavior change. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent rules or generated skills changed. |
| Autoreview for non-trivial docs changes | no | Load `.agents/skills/autoreview/SKILL.md` and run the right target, or record N/A for tiny/no-local-patch work | N/A: the active user request was a docs-creator review loop; repeated docs-creator audit found no remaining actionable docs findings. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: docs-only MDX structural edits; `pnpm --filter www check:docs` is the owning parser/source-parity gate. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-slate-docs-creator-closure-loop.md` | Initial run only found Closeout status open; rerun after closing this row. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | plan filled with explicit prompt requirements and docs-creator gates | writing |
| Writing | complete | Patched Plite docs openings, stub headings, long-page jump lists, first-working-path sections, and nav order. | verification |
| Verification | complete | Final audit clean, docs check pass, links/assets OK, 30 live routes OK. | closeout |
| PR / tracker sync | skipped | N/A: no PR/tracker action requested | final response |
| Closeout | complete | Plan updated; checker rerun after this closeout row. | final response |

Findings:

- Prior bounded Plite docs scan found actionable docs-creator mismatches:
  missing `##` sections in tiny stubs, long pages without an early on-page
  jump list, opening sections over three sentences, reference pages with TOC
  bullets before the first `##`, and `Migration` sitting too high in Plite nav.

Decisions and tradeoffs:

- Keep this pass docs-only. Do not create new source/API claims while fixing
  docs structure.
- Treat `Migration` as a supporting page under General, not a top-level Plite
  landing item.

Implementation notes:

- Changed Plite docs nav so `Migration` lives under General instead of the
  top unpublished section.
- Added or normalized first sections: `## Type`, `## Interface`, `## Usage`,
  `## Minimal Usage`, and `## Starting Point`.
- Added `## On This Page` jump lists to long API/reference/concept pages that
  need navigation.

Review fixes:

- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:

- `/Users/zbeyens/git/plate-2`: structural Plite docs scan over 72 MDX files
  -> no findings.
- `/Users/zbeyens/git/plate-2`: stale/changelog/slop term scan over
  `content/docs/plite/**/*.mdx` -> no matches.
- `/Users/zbeyens/git/plate-2`: `content/docs/plite/meta.json` JSON parse ->
  pass.
- `/Users/zbeyens/git/plate-2`: Plite docs links/assets audit ->
  `links/assets ok`.
- `/Users/zbeyens/git/plate-2`: `pnpm --filter www check:docs` -> pass.
- `/Users/zbeyens/git/plate-2`: live route smoke on
  `http://localhost:3002` for 30 changed/affected Plite docs routes -> OK.

Final handoff contract:

- PR line: N/A: no PR action requested
- Issue / tracker line: N/A: no tracker action requested
- Confidence line: high for docs-creator structural closure
- Docs lane: mixed Plite docs topology, mainly guide/system and API reference
- Source-backed claims: no new runtime/API claims introduced
- Content build / parser: `pnpm --filter www check:docs` passed
- Links / demos / previews: links/assets audit passed; no preview changed
- Browser check: Browser MCP unavailable; live HTTP route smoke passed for 30
  changed/affected routes
- Outcome: repeated scan has no actionable docs-creator findings
- Caveat: no human copy taste pass beyond docs-creator structural review
- Verified: structural audit, stale-term audit, nav parse, link/asset audit,
  docs check, route smoke

Final handoff / sync:

- PR: N/A
- Issue / tracker: N/A
- Browser proof: Browser MCP unavailable; live app route smoke used for text docs
- Caveats: no runtime/package code changed

Timeline:

- 2026-06-22T05:09:06.497Z Docs goal plan created.
- 2026-06-22T05:09:06Z Active goal created and first checkpoint filled before
  implementation.
- 2026-06-22T05:18:00Z Patched first-pass docs-creator findings.
- 2026-06-22T05:22:00Z Restarted audit; patched remaining code-before-first-H2
  findings.
- 2026-06-22T05:27:00Z Final repeated audit clean; docs check and route smoke
  passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run goal checker, complete goal, final handoff |
| What is the goal? | Close Plite docs docs-creator gaps until repeated scan has no actionable findings |
| What have I learned? | Plite docs had structural docs-creator drift, not a missing concept gap. |
| What have I done? | Applied structural fixes, restarted audit, verified clean. |

Open risks:

- None blocking. Residual taste risk: the pass is structural/docs-creator
  focused, not a full human copy-edit of every paragraph.
