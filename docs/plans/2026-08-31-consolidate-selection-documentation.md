# Consolidate Selection Documentation

Objective:
Consolidate Plate selection teaching at `/docs/selection`; done when old names
are gone and docs, registry, tests, and browser proof pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-31-consolidate-selection-documentation.md

Template:
docs/plans/templates/docs.md

Primary template:
docs/plans/templates/docs.md

Applied packs:
- none

Linked plans:
- None.

Docs source:

- type: local Plate guide plus copied registry example
- id / link: `content/docs/(guides)/selection-retention.mdx` and
  `apps/www/src/registry/examples/selection-retention-demo.tsx`
- title: Selection
- acceptance criteria: `/docs/selection` teaches Plate's selection mental
  model, common reads and updates, focus/native DOM ownership, inactive paint,
  node-selection rendering, and exact links to specialized feature docs.

Docs lane:

- lane: guide / system
- target docs: `content/docs/(guides)/selection.mdx` and `selection.cn.mdx`
- documented source owner: `plitejs` owns selection state; `plitejs/react`
  owns native/inactive rendering; `platejs` reexports the public model and
  Plate React node-selection components; copied registry UI owns styling and
  marked external focus targets.
- nearest sibling docs: Plate Editor Methods and Editing Behavior; Plite
  Selection And DOM, Selection API, and Editable Component.
- plugin page: N/A: plugin-specific selection behavior stays in its owning
  feature page and receives links rather than copied prose.

First checkpoint:

- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:

- requested duration: none
- semantics: N/A: no duration requested
- initial confidence score: N/A: artifact and command gates are concrete
- improvement loop: N/A: no timed loop
- final score / loop closure: N/A: no timed loop

Completion threshold:

- English and Chinese `/docs/selection` guides exist and the displaced
  selection-retention pages do not.
- `inactive-selection-demo` replaces the old example id across source,
  registry metadata, tests, docs preview, and browser route.
- Plugin-specific selection docs remain in place and the guide links the exact
  owning references.
- Zero stale `selection-retention` references remain outside intentional
  redirect or historical changelog data; no second live docs page remains.
- Registry changelog and generated registry output agree.
- Focused component tests, docs parser/parity checks, registry generation, and
  Browser replay of `/blocks/inactive-selection-demo` pass.
- Docs closure is legal only when the page teaches the fastest correct path,
  every claim is source-backed, the selected lane-specific shape proof row is
  satisfied, required MDX/link/preview checks are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-consolidate-selection-documentation.md`
  passes.

Verification surface:

- source audit: focused `rg` for stale names, preview ids, routes, imports, and
  selection ownership claims
- commands: focused Bun component spec, registry build/check, docs source build
  and parity check, scoped lint/type verification
- browser: `/docs/selection` renders and `/blocks/inactive-selection-demo`
  preserves expanded and collapsed selection paint with no runtime errors

Constraints:

- Follow `.agents/rules/docs-creator.mdc` for docs style and workflow.
- Write current-state docs only. No changelog voice.
- Keep code examples repo-backed and copy-pasteable.
- Do not invent APIs, routes, demos, imports, components, transforms, or options.
- Do not add docs ceremony for tiny typo/copy edits.

Boundaries:

- Source of truth: Plite selection docs and runtime, Plate facade and
  node-selection components, copied Editor styles, existing demo proof.
- Allowed edit scope: selection guides and metadata, registry example and
  metadata, its component/browser tests, registry changelog source/generated
  output, docs route/icon/copy integration, explicit legacy redirects, and this
  plan.
- Browser surface: `/docs/selection` and `/blocks/inactive-selection-demo`.
- Tracker sync: N/A: no issue or tracker requested.
- Non-goals: no selection runtime/API changes; no migration of feature-owned
  Block Menu, Multi Select, Link, Find, Cursor Overlay, or Yjs pages; no PR,
  commit, or push.

Output budget strategy:

- Restrict reads and searches to named docs, registry, runtime, and generated
  registry owners. Cap command output and inspect generated diffs by filename
  or focused match. Exclude `node_modules`, `.next`, `.turbo`, logs, and broad
  generated trees unless a named check owns them.

Blocked condition:

- Stop only if the docs route cannot run after one install-repair attempt, the
  registry generator rejects the renamed item without an in-scope repair, or
  live source contradicts the accepted selection ownership model.

Docs state:

- task_type: docs
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: complete
- goal_status: complete

Current verdict:

- verdict: replace the narrow inactive-selection page with one Plate Selection
  concept guide; keep specialized feature pages local.
- confidence: high; source and existing browser proof agree
- next owner: docs
- reason: Plate lacks one app-facing selection mental model while Plite already
  owns the raw model/DOM law.

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-consolidate-selection-documentation.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Accepted `/docs/selection` consolidation, exact cuts/keeps, demo rename, non-goals, and proof gates are recorded above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| `docs-creator` loaded | yes | Read `.agents/skills/docs-creator/SKILL.md`. |
| Active goal checked or created | yes | Goal created with this plan path. |
| Docs lane selected | yes | Guide / system. |
| Target docs read | yes | Read both inactive-selection guide variants and the registry demo/spec. |
| Nearest sibling docs read | yes | Read Plate Editor Methods and Editing Behavior plus Plite Selection And DOM, Selection API, and Editable. |
| Docs style doctrine read | yes | Read style-and-structure plus Guide/System and Behavior/Runtime lane templates. |
| Documented source code read | yes | Read Plate facade, Plite inactive-selection runtime, Editable integration, and Plate node-selection components. |
| Ownership map drafted | yes | Recorded under Docs lane and Boundaries. |
| Plugin-page rules decision | no | N/A: no plugin page is edited; specialized pages stay local. |
| Browser/render proof decision | yes | Browser proof required for both the guide route and interactive demo route. |
| PR/tracker expectation decision | no | N/A: user requested local implementation only. |

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
      package ownership. N/A: no plugin page changed.
- [x] Serialization docs, if applicable, split directions and state environment
      constraints before examples. N/A: no serialization docs changed.
- [x] API reference docs, if applicable, use exact contracts and avoid tutorial
      filler. N/A: canonical API reference pages remain linked owners.
- [x] Spec/law docs, if applicable, record owner map, evidence, and explicit
      gaps. N/A: this is a guide, not a spec.
- [x] Demos/previews are real registry entries or marked N/A with reason.
- [x] Links target real leaf pages and do not reinforce pages being displaced.
- [x] Every created or edited docs artifact completed the required `unslop`
      file-edit pass after claims stabilized; evidence names each file and
      confirms literal content and technical claims were preserved.
- [x] Requirement language, when present, separates hard compatibility,
      layer-specific setup, recommendations, and repo-only implementation
      details against live source owners. N/A: no installation or compatibility
      requirements are introduced.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed docs.
- [x] Review/P1 autoreview target selected for non-trivial docs work, or marked
      N/A with reason. N/A: the current branch is `next`, where repo law forbids
      `autoreview`; focused source, type, registry, component, Playwright, and
      Browser proof cover this bounded docs change.

Lane-Specific Shape Proof:
| Lane | Applies | Required proof | Evidence |
|------|---------|----------------|----------|
| Install / get-started | no | Opening has only the short lead before the first `##`; hard requirements appear before the first install command and are classified against package, copied-source, or build owners; the page has `## Installation`, `## Usage` or an equivalent first working path, and next-step links; procedural setup uses `<Steps>` when it is more than one real step; installed packages have an ownership table when more than one package/layer is involved; app-file snippets use titled code fences when file context matters. | N/A: this is a concept guide. |
| Component / registry item | no | Real preview exists or is marked N/A; installation is CLI/manual shaped; usage has imports plus smallest JSX; examples are real variants; API reference is last when needed. | N/A: the preview supports a concept section but the page does not teach installing a component. |
| Guide / system | yes | Opening is short with sibling disambiguation when needed; ownership model appears early; quick start precedes deeper mechanics; reference material stays last. | Verified in both final guides: a two-sentence Plite/Plate split opens the page, `Ownership` follows, `Quick Start` precedes focus and rendering mechanics, specialized feature links follow, and `API Reference` is last. |
| Behavior / runtime concept | no | Decision table or equivalent surface choice appears early; runtime pipeline has owner map; each stage is separated; recipes link to canonical references. | N/A: selection lifecycle is summarized, while exact runtime stages remain in Plite Selection And DOM. |
| Plugin / feature | no | Kit usage and manual usage are split when a kit exists; headless package ownership is explicit; plugin APIs/transforms are documented only when source-real. | N/A: no plugin page. |
| Serialization / conversion | no | Directions are split up front; environment constraints appear before examples; extension points come after the base path; heavy API reference stays late. | N/A: no serialization work. |
| Workflow / AI | no | Required runtime pieces are separated from optional UI; setup path comes before architecture; client/server or provider boundaries are explicit. | N/A: no workflow/AI page. |
| API reference | no | Short purpose paragraph, grouped surface, exact parameters/options/returns, caveats, and no tutorial restart. | N/A: canonical API references remain under Plite and Plate components. |
| Spec / law / behavior | no | Contract, owner map, model-before-UX, evidence, and explicit gaps are recorded before any appendix. | N/A: this is current-state teaching, not a law page. |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the source audit, parser/build, link/demo check, or review named in this plan | Component spec 2/2, focused Chromium 1/1, docs/type/registry checks, and Browser replay pass. |
| Docs lane shape satisfied | yes | Resolve the selected row in `Lane-Specific Shape Proof`; do not close this gate from a generic shape assertion | Concrete English/Chinese ordering evidence is recorded in the selected Guide / system row. |
| Source-backed claim audit | yes | Verify every named API/option/transform/component/import/route against source | Audited against Plite Selection API/transforms/Editable runtime, Plate exports, Plate node-selection components, registry metadata, and current docs routes. |
| Required Unslop pass | yes | Run `unslop` in file-edit mode on every created or edited docs artifact after claims stabilize; name each file and confirm protected literal content and technical claims survived | Audited `selection.mdx` and `selection.cn.mdx`; only deliberate title-case headings were retained, one abstract sentence was simplified, and all identifiers, links, code, and claims were preserved. |
| Requirements disclosure | no | For install/get-started work, classify hard compatibility, layer-specific setup, recommendations, and repo-only details against live owners; otherwise record N/A | N/A: this concept guide introduces no install or compatibility requirements. |
| Ownership map verified | yes | Confirm package/layer/kit/app-local ownership claims against source | Verified Plite model/runtime ownership, Plate facade and React ownership, and copied registry styling/focus-target ownership. |
| MDX/content parser | yes | Run `pnpm --filter www build:contentlayer` for MDX/content changes, or record N/A | `pnpm --filter www check:docs` passed its current API reference, source-build, and docs-parity owners; full `www` typecheck also passed MDX generation and parity. |
| Links/routes/previews verified | yes | Check leaf links, routes, anchors, and `<ComponentPreview>` names or record N/A | Docs checks passed; Browser loaded `/docs/selection` with `inactive-selection-demo`; English and Chinese legacy routes redirected to their new leaf routes. |
| Plugin page specifics | no | If plugin page, apply `docs-creator` kit/manual/API rules or record N/A | N/A: no plugin page changed. |
| Browser/render surface changed | yes | Capture Browser proof for normal rendered surfaces, or Chrome/Computer proof for native browser/OS surfaces | Browser rendered the guide and demo, proved expanded paint 1/caret 0, clear 0/0, collapsed paint 0/caret 1, and zero console errors. |
| Package/API behavior changed | no | Add changeset or record N/A | N/A: no package or runtime API changed; no changeset. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent rules or skills changed. |
| P1 autoreview for non-trivial docs changes | no | Load `.agents/skills/autoreview/SKILL.md` and run the right target with `--max-priority P1`; use P2 or P3 only when explicitly requested, or record N/A for tiny/no-local-patch work | N/A: `git branch --show-current` returned `next`, where repo law forbids `autoreview`. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Scoped `pnpm exec ultracite fix` passed on every touched source file. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-consolidate-selection-documentation.md` | Passed: `[autogoal] complete` for this plan. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | plan requirements and owner map resolved from current source | writing |
| Writing | complete | Selection guides, route metadata/redirects, registry example/spec, browser route, command-menu/icon integration, and changelog source updated. | verification |
| Verification | complete | Registry/docs/type/component checks and exact Browser/Chromium replay passed. | closeout |
| PR / tracker sync | complete | N/A: no PR, issue, or tracker mutation requested. | final response |
| Closeout | complete | Final goal-plan checker passed. | final response |

Findings:

- Plite already owns complete model/native selection teaching; Plate needs a
  short app-facing guide, not a copy of Plite internals.
- The inactive-selection marker is used by AI, Find, font-size, and link UI, so
  it belongs as one rendering section inside the broader guide.
- The registry demo is a real teaching and browser-proof surface and stays in
  the registry; only its inaccurate retention noun changes.

Decisions and tradeoffs:

- Move and expand the guide; do not keep a second inactive-selection page ->
  prevents competing docs owners.
- Keep specialized feature docs in place and link them -> preserves feature
  ownership and avoids a selection junk drawer.
- Rename the demo to `inactive-selection-demo` -> matches the rendered concept;
  accept the route/id rename and regenerate registry outputs.
- Preserve Plite references as the substrate authority -> Plate teaches the
  common facade path without duplicating low-level contracts.

Implementation notes:

- Registry changelog is required because the public example id and block route
  change. Package changeset is N/A because package/runtime code does not change.
- Shadcn project context confirms Next.js, React server components, Tailwind v4,
  Radix, and the existing registry configuration; no shadcn component API
  changes are involved.

Review fixes:

- Unslop audits flagged only deliberate English title-case headings; retained
  them to match docs heading conventions. Full-file human review removed one
  abstract canonical-state sentence while preserving every identifier, link,
  code block, and technical claim. Chinese audit reported no candidates and
  received the same full-file preservation review.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| A second dev-server start found the existing correct server | 1 | Reuse the running Plate server | Browser proof used the existing `localhost:3000` process. |
| Browser page-evaluate selection introspection was unavailable | 2 | Use the rendered marker contract plus the existing exact Chromium spec | Browser marker counts and focused Playwright replay both passed. |

Verification evidence:

- Workspace for every shell command: `/Users/zbeyens/git/plate-2`.
- `bun test apps/www/src/registry/examples/inactive-selection-demo.spec.tsx`:
  2 passed, 0 failed.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --write` followed by
  `--check`: 97 events checked; passed.
- `pnpm --filter www build:registry`: 366 canonical payloads and 15 overlays;
  passed. `NODE_ENV=development pnpm --filter www build:registry` rebuilt the
  development registry and removed its stale generated item.
- `pnpm --filter www check:docs`: API reference, source build, and docs parity
  passed.
- `pnpm --filter www typecheck`: editor check, API reference, MDX, parity,
  registry source, Next type generation, and TypeScript passed.
- Scoped `pnpm exec ultracite fix` on every touched source file passed.
- `pnpm --filter www test:www-browser:chromium
  tests/browser/transient-editor-geometry.spec.ts --grep "inactive selection"`:
  1 passed in 7.8 seconds.
- Focused stale-name audit found only the two intentional permanent redirects
  plus an unrelated Plite test fixture id; no displaced guide, example,
  registry item, or generated payload remains.
- Browser rendered `/docs/selection` with the live preview and no console
  errors. `/blocks/inactive-selection-demo` produced expanded marker counts
  1/0, clear counts 0/0, and collapsed counts 0/1. The English and Chinese old
  URLs redirected to `/docs/selection` and `/cn/docs/selection`.

Final handoff contract:

- PR line: not requested; no PR created
- Issue / tracker line: not requested; no tracker mutation
- Confidence line: high; source, generated artifacts, component tests, focused
  Chromium, and Browser all agree
- Docs lane: Guide / system; selected row satisfied in both locales
- Source-backed claims: passed against current Plite, Plate, registry, and docs
  owners
- Content build / parser: passed through `check:docs` and full `www` typecheck
- Links / demos / previews: passed in source checks and Browser
- Browser check: passed on guide, renamed demo, and both legacy redirects
- Outcome: one general Plate Selection guide with one accurately named inactive
  selection proof fixture; specialized feature docs remain local and linked
- Caveat: none within the requested docs-only scope
- Verified: component 2/2; Chromium 1/1; docs, registry, type, lint, stale-name,
  and Browser gates passed

Final handoff / sync:

- PR: N/A: not requested; no PR created
- Issue / tracker: N/A: not requested; no mutation made
- Browser proof: passed
- Caveats: none

Timeline:

- 2026-08-31T13:18:08.078Z Docs goal plan created.
- 2026-08-31 selection guide and Chinese pair moved/expanded; inactive-selection
  example, registry id, focused tests, routes, metadata, redirects, icon,
  command-menu name, and changelog source renamed.
- 2026-08-31 registry outputs regenerated for production and development;
  component, docs, type, lint, stale-name, focused Chromium, and Browser gates
  passed.
- 2026-08-31 autogoal completion checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Complete the active goal and hand off. |
| What is the goal? | One Plate `/docs/selection` guide plus renamed inactive-selection preview and passing proof. |
| What have I learned? | The runtime/API owners are correct; the debt is Plate teaching topology and stale naming. |
| What have I done? | Completed the source rename, both Selection guides, generated artifacts, and every named verification gate. |

Open risks:

- None in scope. The only old guide names are intentional permanent redirects;
  the unrelated Plite fixture id describes a separate behavior test.
