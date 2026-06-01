# {{TITLE}}

Objective:
TODO: Write the short create_goal objective, under 240 characters. Put the full docs contract in the sections below.

Goal plan:
{{PLAN_PATH}}

Template:
{{TEMPLATE_PATH}}

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

Completion threshold:
- TODO: Define the exact docs done state.
- Docs closure is legal only when the page teaches the fastest correct path,
  every claim is source-backed, docs-lane shape is satisfied, required MDX/link/
  preview checks are recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}`
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
  `node .agents/rules/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
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
- [ ] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [ ] Docs lane is classified as install, guide/system, plugin/feature,
      serialization/conversion, workflow/AI, API reference, or spec/law.
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

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the source audit, parser/build, link/demo check, or review named in this plan | pending |
| Docs lane shape satisfied | pending | Check the lane-specific structure against `docs-creator` | pending |
| Source-backed claim audit | pending | Verify every named API/option/transform/component/import/route against source | pending |
| Ownership map verified | pending | Confirm package/layer/kit/app-local ownership claims against source | pending |
| MDX/content parser | pending | Run `pnpm --filter www build:contentlayer` for MDX/content changes, or record N/A | pending |
| Links/routes/previews verified | pending | Check leaf links, routes, anchors, and `<ComponentPreview>` names or record N/A | pending |
| Plugin page specifics | pending | If plugin page, apply `docs-creator` kit/manual/API rules or record N/A | pending |
| Browser/render surface changed | pending | Capture Browser Use proof or record explicit waiver/blocker | pending |
| Package/API behavior changed | pending | Add changeset or record N/A | pending |
| Agent rules or skills changed | pending | Run `pnpm install` and verify generated skill sync | pending |
| Autoreview for non-trivial docs changes | pending | Load `.agents/skills/autoreview/SKILL.md` and run the right target, or record N/A for tiny/no-local-patch work | pending |
| Final lint | pending | Run `pnpm lint:fix` or scoped equivalent | pending |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` | pending |

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
- {{CREATED_AT}} Docs goal plan created.

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
