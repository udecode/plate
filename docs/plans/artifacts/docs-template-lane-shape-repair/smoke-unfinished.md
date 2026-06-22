# smoke docs lane shape proof

Objective:
TODO: Write the short create_goal objective, under 240 characters. Put the full docs contract in the sections below.

Goal plan:
docs/plans/artifacts/docs-template-lane-shape-repair/smoke-unfinished.md

Template:
docs/plans/templates/docs.md

Primary template:
docs/plans/templates/docs.md

Applied packs:
- none

Docs source:
- type: pending
- id / link: pending
- title: pending
- acceptance criteria: pending

Docs lane:
- lane: pending
- target docs: pending
- documented source owner: pending
- nearest sibling docs: pending
- plugin page: pending

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: pending
- semantics: pending
- initial confidence score: pending
- improvement loop: pending
- final score / loop closure: pending

Completion threshold:
- TODO: Define the exact docs done state.
- Docs closure is legal only when the page teaches the fastest correct path,
  every claim is source-backed, the selected lane-specific shape proof row is
  satisfied, required MDX/link/preview checks are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/artifacts/docs-template-lane-shape-repair/smoke-unfinished.md`
  passes.

Verification surface:
- TODO: Name the source audit, docs render/parser command, link/demo check,
  content build, or review proof that proves the threshold.

Constraints:
- Follow `.agents/rules/docs-creator.mdc` for docs style and workflow.
- Write current-state docs only. No changelog voice.
- Keep code examples repo-backed and copy-pasteable.
- Do not invent APIs, routes, demos, imports, components, transforms, or options.
- Do not add docs ceremony for tiny typo/copy edits.

Boundaries:
- Source of truth: TODO.
- Allowed edit scope: TODO.
- Browser surface: TODO.
- Tracker sync: TODO.
- Non-goals: TODO.

Blocked condition:
- TODO: Name the missing source code, registry entry, demo, route, design
  decision, product choice, or command failure that stops autonomous docs work.

Docs state:
- task_type: docs
- task_complexity: pending
- current_phase: intake
- current_phase_status: in_progress
- next_phase: writing
- goal_status: active

Current verdict:
- verdict: pending
- confidence: pending
- next owner: docs
- reason: pending

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/artifacts/docs-template-lane-shape-repair/smoke-unfinished.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | pending | pending |
| Timed checkpoint parsed | pending | pending |
| `docs-creator` loaded | pending | pending |
| Active goal checked or created | pending | pending |
| Docs lane selected | pending | pending |
| Target docs read | pending | pending |
| Nearest sibling docs read | pending | pending |
| Docs style doctrine read | pending | pending |
| Documented source code read | pending | pending |
| Ownership map drafted | pending | pending |
| Plugin-page rules decision | pending | pending |
| Browser/render proof decision | pending | pending |
| PR/tracker expectation decision | pending | pending |

Work Checklist:
- [ ] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
- [ ] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [ ] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [ ] Docs lane is classified as install, guide/system, plugin/feature,
      serialization/conversion, workflow/AI, API reference, or spec/law.
- [ ] Selected lane-specific shape proof row below is resolved with concrete
      evidence. A generic "docs lane shape satisfied" statement is not enough.
- [ ] Target docs and nearest sibling docs were read before writing.
- [ ] Docs style doctrine in `docs-creator` was read before writing.
- [ ] Documented behavior or API was verified against current source.
- [ ] Ownership map records core runtime, package, kit, registry, and app-local
      ownership where relevant.
- [ ] Fastest success path appears before deeper mechanics or API reference.
- [ ] Opening is three sentences or fewer and avoids generic fluff.
- [ ] Named APIs, options, transforms, components, imports, routes, and package
      specifiers are exact and current.
- [ ] Plugin docs, if applicable, satisfy kit/manual/API ordering and headless
      package ownership.
- [ ] Serialization docs, if applicable, split directions and state environment
      constraints before examples.
- [ ] API reference docs, if applicable, use exact contracts and avoid tutorial
      filler.
- [ ] Spec/law docs, if applicable, record owner map, evidence, and explicit
      gaps.
- [ ] Demos/previews are real registry entries or marked N/A with reason.
- [ ] Links target real leaf pages and do not reinforce pages being displaced.
- [ ] Anti-slop audit passed: no changelog voice, no fake APIs, no placeholder
      comments, no TODOs, no dead anchors, no redundant summary section.
- [ ] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed docs.
- [ ] Review/autoreview target selected for non-trivial docs work, or marked
      N/A with reason.

Lane-Specific Shape Proof:
| Lane | Applies | Required proof | Evidence |
|------|---------|----------------|----------|
| Install / get-started | pending | Opening has only the short lead before the first `##`; page has `## Installation`, `## Usage` or an equivalent first working path, and next-step links; procedural setup uses `<Steps>` when it is more than one real step; installed packages have an ownership table when more than one package/layer is involved; app-file snippets use titled code fences when file context matters. | pending |
| Component / registry item | pending | Real preview exists or is marked N/A; installation is CLI/manual shaped; usage has imports plus smallest JSX; examples are real variants; API reference is last when needed. | pending |
| Guide / system | pending | Opening is short with sibling disambiguation when needed; ownership model appears early; quick start precedes deeper mechanics; reference material stays last. | pending |
| Behavior / runtime concept | pending | Decision table or equivalent surface choice appears early; runtime pipeline has owner map; each stage is separated; recipes link to canonical references. | pending |
| Plugin / feature | pending | Kit usage and manual usage are split when a kit exists; headless package ownership is explicit; plugin APIs/transforms are documented only when source-real. | pending |
| Serialization / conversion | pending | Directions are split up front; environment constraints appear before examples; extension points come after the base path; heavy API reference stays late. | pending |
| Workflow / AI | pending | Required runtime pieces are separated from optional UI; setup path comes before architecture; client/server or provider boundaries are explicit. | pending |
| API reference | pending | Short purpose paragraph, grouped surface, exact parameters/options/returns, caveats, and no tutorial restart. | pending |
| Spec / law / behavior | pending | Contract, owner map, model-before-UX, evidence, and explicit gaps are recorded before any appendix. | pending |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the source audit, parser/build, link/demo check, or review named in this plan | pending |
| Docs lane shape satisfied | pending | Resolve the selected row in `Lane-Specific Shape Proof`; do not close this gate from a generic shape assertion | pending |
| Source-backed claim audit | pending | Verify every named API/option/transform/component/import/route against source | pending |
| Ownership map verified | pending | Confirm package/layer/kit/app-local ownership claims against source | pending |
| MDX/content parser | pending | Run `pnpm --filter www build:contentlayer` for MDX/content changes, or record N/A | pending |
| Links/routes/previews verified | pending | Check leaf links, routes, anchors, and `<ComponentPreview>` names or record N/A | pending |
| Plugin page specifics | pending | If plugin page, apply `docs-creator` kit/manual/API rules or record N/A | pending |
| Browser/render surface changed | pending | Capture Browser proof for normal rendered surfaces, or Chrome/Computer proof for native browser/OS surfaces | pending |
| Package/API behavior changed | pending | Add changeset or record N/A | pending |
| Agent rules or skills changed | pending | Run `pnpm install` and verify generated skill sync | pending |
| Autoreview for non-trivial docs changes | pending | Load `.agents/skills/autoreview/SKILL.md` and run the right target, or record N/A for tiny/no-local-patch work | pending |
| Final lint | pending | Run `pnpm lint:fix` or scoped equivalent | pending |
| Timed checkpoint | pending | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/artifacts/docs-template-lane-shape-repair/smoke-unfinished.md` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | in_progress | created plan | writing |
| Writing | pending | | verification |
| Verification | pending | | closeout |
| PR / tracker sync | pending | | final response |
| Closeout | pending | | final response |

Findings:
- None yet.

Decisions and tradeoffs:
- None yet.

Implementation notes:
- None yet.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Pending.

Final handoff contract:
- PR line: pending
- Issue / tracker line: pending
- Confidence line: pending
- Docs lane: pending
- Source-backed claims: pending
- Content build / parser: pending
- Links / demos / previews: pending
- Browser check: pending
- Outcome: pending
- Caveat: pending
- Verified: pending

Final handoff / sync:
- PR: pending
- Issue / tracker: pending
- Browser proof: pending
- Caveats: pending

Timeline:
- 2026-06-22T04:05:51.130Z Docs goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Writing, verification, closeout |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Pending.
