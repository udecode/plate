# editing behavior docs

Objective:
Add a source-backed Plate guide for editing behavior, wire it into docs
navigation, and verify the new page renders without stale anchors, duplicate
delete/merge docs, or unbacked API claims.

Goal plan:
docs/plans/2026-05-31-editing-behavior-docs.md

Template:
docs/plans/templates/docs.md

Primary template:
docs/plans/templates/docs.md

Applied packs:
- none

Docs source:
- type: local docs gap review
- id / link: user request in current thread
- title: Editing Behavior
- acceptance criteria: one guide page explains break, delete, merge,
  normalize, and selection behavior; Plugin Rules remains the rule reference;
  Table links to the document-level merge model; docs nav includes the new page.

Docs lane:
- lane: guide/system
- target docs: `content/docs/(guides)/editing-behavior.mdx`,
  `content/docs/(guides)/plugin-rules.mdx`,
  `content/docs/(plugins)/(elements)/table.mdx`, `content/docs/meta.json`
- documented source owner: Plate core runtime owns `OverridePlugin`,
  `AffinityPlugin`, rule handling, merge guards, and node flags; feature
  packages own default rules and table transforms; apps own local plugin config.
- nearest sibling docs: `plugin-rules.mdx`, `plugin-input-rules.mdx`,
  `editor-methods.mdx`, `table.mdx`
- plugin page: no; system guide with links to plugin/table references.

Completion threshold:
- New guide exists, is in the guide nav, links from adjacent docs resolve, and
  source-backed behavior claims are verified against Plate core/table source.
- Docs closure is legal only when the page teaches the fastest correct path,
  every claim is source-backed, docs-lane shape is satisfied, required MDX/link/
  preview checks are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-editing-behavior-docs.md`
  passes.

Verification surface:
- Source audit: `OverridePlugin.ts`, `withBreakRules.ts`, `withDeleteRules.ts`,
  `withMergeRules.ts`, `withNormalizeRules.ts`, `AffinityPlugin.ts`,
  `deleteMerge.ts`, `mergeNodes.ts`, `BasePlugin.ts`, `BaseTablePlugin.ts`.
- Parser/check: `pnpm --filter www build:source`,
  `pnpm --filter www check:docs`.
- Render/link proof: `curl -I http://localhost:3002/docs/editing-behavior`
  and body grep for `Editing Behavior`, `Choose the Right Surface`,
  `Merge Behavior`, `Plugin Rules`.
- Review: `.agents/skills/autoreview/scripts/autoreview --mode local`.

Constraints:
- Follow `.agents/rules/docs-creator.mdc` for docs style and workflow.
- Write current-state docs only. No changelog voice.
- Keep code examples repo-backed and copy-pasteable.
- Do not invent APIs, routes, demos, imports, components, transforms, or options.
- Do not add docs ceremony for tiny typo/copy edits.

Boundaries:
- Source of truth: Plate source files listed in Verification surface.
- Allowed edit scope: new guide page, adjacent guide/table links, docs nav
  metadata, this goal plan.
- Browser surface: existing local server at `localhost:3002`; Browser plugin was
  unavailable, so curl route proof was used.
- Tracker sync: none.
- Non-goals: no separate delete doc, merge doc, API rewrite, CN translation, or
  package behavior change.

Blocked condition:
- Block only if Plate source contradicts the documented behavior, the MDX
  parser fails, docs parity fails, the route cannot render on the active local
  server, or autoreview reports an accepted actionable finding.

Docs state:
- task_type: docs
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: complete
- confidence: high
- next owner: user
- reason: source audit, parser, docs parity, route proof, and autoreview all
  passed.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-editing-behavior-docs.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `docs-creator` loaded | yes | `.agents/skills/docs-creator/SKILL.md` read. |
| Active goal checked or created | yes | `create_goal` created active goal for editing behavior docs. |
| Docs lane selected | yes | Guide/system lane. |
| Target docs read | yes | `plugin-rules.mdx`, `table.mdx`, `editor-methods.mdx`, `plugin-input-rules.mdx`. |
| Nearest sibling docs read | yes | Same as target docs read. |
| Docs style doctrine read | yes | `docs-creator` structural and shadcn-dense guidance read. |
| Documented source code read | yes | Core override, affinity, Plite merge/delete, and table plugin source read. |
| Ownership map drafted | yes | Core runtime / feature package / app config split recorded above. |
| Plugin-page rules decision | yes | N/A: system guide, not plugin page. |
| Browser/render proof decision | yes | Curl route proof because Browser tool was unavailable. |
| PR/tracker expectation decision | yes | N/A: user did not ask for PR/tracker update. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
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
| Named verification threshold | yes | Run the source audit, parser/build, link/demo check, or review named in this plan | Source files read; `pnpm --filter www build:source`; `pnpm --filter www check:docs`; curl route proof; autoreview clean. |
| Docs lane shape satisfied | yes | Check the lane-specific structure against `docs-creator` | Guide/system page with quick decision table before mechanics and API reference last. |
| Source-backed claim audit | yes | Verify every named API/option/transform/component/import/route against source | Core/table source files listed in Verification surface were read before writing. |
| Ownership map verified | yes | Confirm package/layer/kit/app-local ownership claims against source | Ownership map recorded above. |
| MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes | Passed. |
| Links/routes/previews verified | yes | Check leaf links, routes, anchors, and `<ComponentPreview>` names or record N/A | Route returned 200; body contained title and key headings; no new previews. |
| Plugin page specifics | yes | If plugin page, apply `docs-creator` kit/manual/API rules or record N/A | N/A: system guide, not plugin page. |
| Browser/render surface changed | yes | Capture Browser Use proof or record explicit waiver/blocker | Browser tool unavailable; curl proof on local server used. |
| Package/API behavior changed | yes | Add changeset or record N/A | N/A: docs/nav only. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | N/A: no agent rules or skills changed. |
| Autoreview for non-trivial docs changes | yes | Load `.agents/skills/autoreview/SKILL.md` and run the right target, or record N/A for tiny/no-local-patch work | `.agents/skills/autoreview/scripts/autoreview --mode local ...` clean. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Scoped equivalent: `pnpm --filter www check:docs` passed for docs source. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-editing-behavior-docs.md` | ready to run. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | plan created; sibling docs and source files read | writing |
| Writing | complete | new guide and adjacent links/nav edited | verification |
| Verification | complete | parser, docs parity, route proof, autoreview passed | closeout |
| PR / tracker sync | complete | N/A: no PR/tracker requested | final response |
| Closeout | complete | completion checker ready | final response |

Findings:
- Gap fixed: added one system guide instead of splitting delete and merge into
  duplicate pages.

Decisions and tradeoffs:
- Kept `Plugin Rules` as the rule reference.
- Added `Editing Behavior` as the concept guide between `Plugin Rules` and
  `Plugin Input Rules`.
- Linked `Table` to the document-level merge model instead of moving table
  merge content out of the table plugin page.
- Did not add separate delete/merge pages; those would duplicate the rule
  reference and rot.

Implementation notes:
- Added `content/docs/(guides)/editing-behavior.mdx`.
- Updated `content/docs/(guides)/plugin-rules.mdx`.
- Updated `content/docs/(plugins)/(elements)/table.mdx`.
- Updated `content/docs/meta.json`.

Review fixes:
- None; autoreview reported no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `node -e "JSON.parse(require('fs').readFileSync('content/docs/meta.json','utf8')); console.log('meta ok')"`: passed.
- `pnpm --filter www build:source`: passed.
- `pnpm --filter www check:docs`: passed.
- `curl -I http://localhost:3002/docs/editing-behavior`: 200 OK.
- `curl http://localhost:3002/docs/editing-behavior | rg ...`: found title and key headings.
- `.agents/skills/autoreview/scripts/autoreview --mode local ...`: clean, no accepted/actionable findings.

Final handoff contract:
- PR line: no PR requested.
- Issue / tracker line: no tracker update requested.
- Confidence line: high.
- Docs lane: guide/system.
- Source-backed claims: checked against core override, affinity, Plite
  delete/merge, plugin type, and table source.
- Content build / parser: `pnpm --filter www build:source` passed.
- Links / demos / previews: route proof passed; no new previews.
- Browser check: Browser tool unavailable; curl route proof used.
- Outcome: new guide added and nav wired.
- Caveat: no CN translation added; CN route falls back to English.
- Verified: parser, docs parity, route proof, autoreview.

Final handoff / sync:
- PR: none requested.
- Issue / tracker: none requested.
- Browser proof: curl route proof on `localhost:3002`.
- Caveats: no CN translation; no package/API change.

Timeline:
- 2026-05-31T19:36:30.478Z Docs goal plan created.
- 2026-05-31T19:39Z Added Editing Behavior guide, adjacent links, and nav metadata.
- 2026-05-31T19:40Z `pnpm --filter www build:source` passed.
- 2026-05-31T19:41Z `pnpm --filter www check:docs` passed.
- 2026-05-31T19:41Z `localhost:3002/docs/editing-behavior` returned 200 and rendered key headings.
- 2026-05-31T19:47Z Autoreview completed clean.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I? | Closeout |
| Where am I going? | Final response |
| What is the goal? | Add and verify the Editing Behavior guide |
| What have I learned? | The gap was connective concept docs, not missing API refs |
| What have I done? | See Timeline |

Open risks:
- Low: no CN translation was added; existing docs routing falls back to English
  for CN when the CN page is absent.
