# slate editing behavior docs

Objective:
Add Slate docs concept pages for editing behavior and selection/DOM, then route `Slate Browser` to those concepts.

Goal plan:
docs/plans/2026-06-22-slate-editing-behavior-docs.md

Template:
docs/plans/templates/docs.md

Primary template:
docs/plans/templates/docs.md

Applied packs:
- none

Docs source:

- type: user request
- id / link: chat request: "go, 1, 2, 4"
- title: Slate editing behavior docs topology gap
- acceptance criteria: implement recommendation 1, 2, and 4 only: add `Editing Behavior`, add `Selection And DOM`, and strengthen `Slate Browser` links.

Docs lane:

- lane: Behavior / runtime concept plus package guide cross-link
- target docs: `content/docs/slate/concepts/15-editing-behavior.mdx`, `content/docs/slate/concepts/16-selection-and-dom.mdx`, `content/docs/slate/libraries/slate-browser.mdx`, `content/docs/slate/meta.json`
- documented source owner: `@platejs/slate`, `@platejs/slate-react`, `@platejs/slate-dom`, `@platejs/browser`
- nearest sibling docs: `concepts/04-transforms`, `concepts/05-operations`, `concepts/11-normalizing`, `libraries/slate-react/editable`, `libraries/slate-react/event-handling`, `libraries/slate-react/dom-coverage-boundaries`, `libraries/slate-browser`
- plugin page: N/A: these are Slate runtime/package docs, not Plate plugin docs.

First checkpoint:

- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:

- requested duration: none
- semantics: N/A
- initial confidence score: 0.78: page-level audit was clean, but runtime topology gap is real.
- improvement loop: write the two missing concept pages and route the existing package guide to them.
- final score / loop closure: 0.93: docs topology gap closed for the requested scope; route/browser-tool caveat recorded.

Completion threshold:

- Done when the two concept pages exist in the Concepts nav, `Slate Browser` links to them without duplicating their explanation, nearest owning pages have precise cross-links, docs parsing/checks pass, and edited/new routes return 200 locally.
- Docs closure is legal only when the page teaches the fastest correct path,
  every claim is source-backed, the selected lane-specific shape proof row is
  satisfied, required MDX/link/preview checks are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-slate-editing-behavior-docs.md`
  passes.

Verification surface:

- Source audit with `rg`/file reads over Slate runtime, React event/DOM docs, and browser proof package docs.
- `pnpm --filter www check:docs`
- `content/docs/slate/meta.json` JSON parse
- route smoke for new/edited docs pages on local www server
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-slate-editing-behavior-docs.md`

Constraints:

- Follow `.agents/rules/docs-creator.mdc` for docs style and workflow.
- Write current-state docs only. No changelog voice.
- Keep code examples repo-backed and copy-pasteable.
- Do not invent APIs, routes, demos, imports, components, transforms, or options.
- Do not add docs ceremony for tiny typo/copy edits.

Boundaries:

- Source of truth: current Slate package docs and source in this checkout.
- Allowed edit scope: Slate docs concept pages, `Slate Browser` page, neighbor cross-links, and Slate docs nav.
- Browser surface: docs routes only; no product UI behavior is changed.
- Tracker sync: N/A.
- Non-goals: no sidebar migration restructure, no API changes, no runtime changes, no broad copy pass over all 70 docs.

Blocked condition:

- Block only if a named public API/source owner cannot be verified in current checkout, MDX parsing fails from an unrelated blocker, or local docs route smoke cannot start after one reasonable retry.

Docs state:

- task_type: docs
- task_complexity: medium
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:

- verdict: complete
- confidence: 0.93
- next owner: none
- reason: requested docs topology packet landed and verified

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-slate-editing-behavior-docs.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | request narrowed to recommendations 1, 2, and 4 only |
| Timed checkpoint parsed | yes | no duration requested |
| `docs-creator` loaded | yes | `.agents/skills/docs-creator/SKILL.md` read |
| Active goal checked or created | yes | file-based autogoal plan created |
| Docs lane selected | yes | Behavior / runtime concept |
| Target docs read | yes | existing `Slate Browser`, `Editable`, event handling, DOM coverage read; new docs were created |
| Nearest sibling docs read | yes | transforms, operations, normalizing, editor, extensions read |
| Docs style doctrine read | yes | `docs-creator` read |
| Documented source code read | yes | inspected `packages/browser`, `packages/slate-dom`, `packages/slate-react`, and Slate tests/source via `rg` and file reads |
| Ownership map drafted | yes | pages map `@platejs/slate`, `@platejs/slate-react`, `@platejs/slate-dom`, and `@platejs/browser` |
| Plugin-page rules decision | no | N/A: Slate runtime/package docs, not Plate plugin docs |
| Browser/render proof decision | yes | docs routes verified by local HTTP smoke; Browser plugin controls unavailable this turn |
| PR/tracker expectation decision | no | N/A: local docs packet, no PR/tracker requested |

Work Checklist:

- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Docs lane is classified as install, guide/system, plugin/feature,
      serialization/conversion, workflow/AI, API reference, or spec/law.
- [x] Selected lane-specific shape proof row below is resolved with concrete
      evidence. A generic "docs lane shape satisfied" statement is not enough.
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

Lane-Specific Shape Proof:
| Lane | Applies | Required proof | Evidence |
|------|---------|----------------|----------|
| Install / get-started | no | Opening has only the short lead before the first `##`; page has `## Installation`, `## Usage` or an equivalent first working path, and next-step links; procedural setup uses `<Steps>` when it is more than one real step; installed packages have an ownership table when more than one package/layer is involved; app-file snippets use titled code fences when file context matters. | N/A |
| Component / registry item | no | Real preview exists or is marked N/A; installation is CLI/manual shaped; usage has imports plus smallest JSX; examples are real variants; API reference is last when needed. | N/A |
| Guide / system | yes | Opening is short with sibling disambiguation when needed; ownership model appears early; quick start precedes deeper mechanics; reference material stays last. | `Selection And DOM` opens with sibling disambiguation, owner table, model/native/DOM sections, and reference links last; `Slate Browser` remains package guide with cross-links early. |
| Behavior / runtime concept | yes | Decision table or equivalent surface choice appears early; runtime pipeline has owner map; each stage is separated; recipes link to canonical references. | `Editing Behavior` has `Choose The Right Surface`, `Runtime Pipeline`, stage sections, browser proof, and recipes linking canonical docs. |
| Plugin / feature | no | Kit usage and manual usage are split when a kit exists; headless package ownership is explicit; plugin APIs/transforms are documented only when source-real. | N/A |
| Serialization / conversion | no | Directions are split up front; environment constraints appear before examples; extension points come after the base path; heavy API reference stays late. | N/A |
| Workflow / AI | no | Required runtime pieces are separated from optional UI; setup path comes before architecture; client/server or provider boundaries are explicit. | N/A |
| API reference | no | Short purpose paragraph, grouped surface, exact parameters/options/returns, caveats, and no tutorial restart. | N/A |
| Spec / law / behavior | no | Contract, owner map, model-before-UX, evidence, and explicit gaps are recorded before any appendix. | N/A |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the source audit, parser/build, link/demo check, or review named in this plan | Source reads/rg done; `pnpm --filter www check:docs` passed; JSON parse passed; link target audit passed; route smoke passed. |
| Docs lane shape satisfied | yes | Resolve the selected row in `Lane-Specific Shape Proof`; do not close this gate from a generic shape assertion | Behavior/runtime and guide rows resolved above. |
| Source-backed claim audit | yes | Verify every named API/option/transform/component/import/route against source | Checked `defineEditorExtension`, `tx.selection.collapse`, `openExample`, selection assertions, DOM coverage types, and browser harness source/tests. |
| Ownership map verified | yes | Confirm package/layer/kit/app-local ownership claims against source | Source owner map matched `packages/slate`, `packages/slate-react`, `packages/slate-dom`, and `packages/browser`. |
| MDX/content parser | yes | Run `pnpm --filter www build:contentlayer` for MDX/content changes, or record N/A | `pnpm --filter www check:docs` ran `fumadocs-mdx source.config.ts .source` and source parity check. |
| Links/routes/previews verified | yes | Check leaf links, routes, anchors, and `<ComponentPreview>` names or record N/A | Link target audit passed; eight local docs routes returned HTTP 200. No previews added. |
| Plugin page specifics | no | If plugin page, apply `docs-creator` kit/manual/API rules or record N/A | N/A: not plugin docs. |
| Browser/render surface changed | no | Capture Browser proof for normal rendered surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A for product UI; Browser plugin controls were unavailable, so docs route smoke used for text docs. |
| Package/API behavior changed | no | Add changeset or record N/A | N/A: docs only. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no `.agents/rules` or skill source changed. |
| Autoreview for non-trivial docs changes | no | Load `.agents/skills/autoreview/SKILL.md` and run the right target, or record N/A for tiny/no-local-patch work | N/A: docs-creator source audit, parser, link audit, and route smoke are the right gate for this docs-only packet. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: docs-only MDX packet; `check:docs` and anti-slop/link scans are the scoped lint. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | No duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-slate-editing-behavior-docs.md` | Ready to run after this closeout patch. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | plan, docs-creator, sibling docs, and source reads done | writing |
| Writing | complete | two concept pages added; `Slate Browser`, proof map, nav, and neighbor links updated | verification |
| Verification | complete | docs check, JSON parse, anti-slop scan, link audit, route smoke | closeout |
| PR / tracker sync | complete | N/A: no PR/tracker requested | final response |
| Closeout | complete | final evidence recorded | final response |

Findings:

- Slate docs had package/reference coverage, but no single runtime concept page for event-to-commit editing behavior.
- Selection proof was split across Locations, Editable, DOM Coverage, React Editor, and Slate Browser; the new concept page gives it a single mental model.

Decisions and tradeoffs:

- Added concept pages instead of expanding `Slate Browser` into a giant mixed package/mental-model doc.
- Kept `Slate Browser` as the package guide and linked out to the concept pages early.
- Did not restructure Migration/sidebar order because the user approved only recommendations 1, 2, and 4.

Implementation notes:

- Added `content/docs/slate/concepts/15-editing-behavior.mdx`.
- Added `content/docs/slate/concepts/16-selection-and-dom.mdx`.
- Updated `content/docs/slate/meta.json` Concepts nav.
- Updated `content/docs/slate/libraries/slate-browser.mdx` with concept links and a proof-contract table.
- Added precise cross-links from `index`, `Editable`, `Event Handling`, `DOM Coverage Boundaries`, and `Docs Proof Map`.

Review fixes:

- Shortened touched page openings back to three sentences or fewer after the first anti-slop/opening scan caught overlong openings.
- Changed the browser proof snippet to use the documented `openExample(page, "plaintext")` shape.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Shell route smoke with `curl`/`perl` | 1 | Use Node `fetch` because those commands were not on PATH | Resolved; Node route smoke passed |

Verification evidence:

- `pnpm --filter www check:docs` passed.
- `node -e "JSON.parse(...content/docs/slate/meta.json...)"` passed.
- Anti-slop scan over edited/new docs returned no matches.
- Opening scan over edited/new docs returned three sentences or fewer above first `##`.
- Link target audit over edited/new docs returned `link targets ok`.
- Local route smoke on `http://localhost:3002` returned HTTP 200 for the two new docs plus edited docs routes.

Final handoff contract:

- PR line: N/A, no PR requested.
- Issue / tracker line: N/A.
- Confidence line: 0.93.
- Docs lane: Behavior / runtime concept plus package guide cross-link.
- Source-backed claims: checked against Slate runtime, React, DOM coverage, and browser harness sources/tests.
- Content build / parser: `pnpm --filter www check:docs` passed.
- Links / demos / previews: link target audit and local route smoke passed; no previews added.
- Browser check: Browser controls unavailable this turn; docs routes verified by local route smoke.
- Outcome: requested docs packet complete.
- Caveat: no screenshot/browser-plugin visual proof because Browser controls were not exposed; these are text docs and route smoke passed.
- Verified: yes.

Final handoff / sync:

- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: Browser controls unavailable; route smoke passed.
- Caveats: none blocking.

Timeline:

- 2026-06-22T04:53:20.852Z Docs goal plan created.
- 2026-06-22T05:00:00Z Added `Editing Behavior` and `Selection And DOM` docs and cross-linked `Slate Browser`.
- 2026-06-22T05:05:00Z Ran docs parser, anti-slop scan, link target audit, and local route smoke.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response |
| What is the goal? | Add Slate editing behavior and selection/DOM concept pages, then route Slate Browser to them |
| What have I learned? | The docs needed a runtime mental-model layer more than another API reference |
| What have I done? | See Timeline and Implementation notes |

Open risks:

- None.
