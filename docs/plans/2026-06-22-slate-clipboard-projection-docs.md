# slate clipboard projection docs

Objective:
Add Slate clipboard and projection docs; done when pages/nav/links are verified and docs checks pass.

Goal plan:
docs/plans/2026-06-22-slate-clipboard-projection-docs.md

Template:
docs/plans/templates/docs.md

Primary template:
docs/plans/templates/docs.md

Applied packs:
- none

Docs source:

- type: Slate docs concept-page implementation
- id / link: `content/docs/slate`
- title: Clipboard and projection concept docs
- acceptance criteria: add `Clipboard And Paste` and `Projection And Overlays`
  concept pages, patch the Operations hidden-magic wording, wire nav and
  cross-links, then verify docs parsing, links, routes, and docs-creator shape.

Docs lane:

- lane: Behavior / runtime concept, with a small API/concept wording edit
- target docs: `content/docs/slate/concepts`, `content/docs/slate/libraries`,
  `content/docs/slate/walkthroughs`, `content/docs/slate/meta.json`
- documented source owner: `@platejs/slate`, `@platejs/slate-dom`,
  `@platejs/slate-react`, and `@platejs/browser` for proof boundaries
- nearest sibling docs: Editing Behavior, Selection And DOM, Extensions,
  Editable Component, React Editor, Annotations, Slate DOM, Slate Browser,
  Operation Replay Substrate, Operations
- plugin page: no; these are Slate substrate docs, not Plate plugin docs

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
- initial confidence score: N/A: pass/fail docs contract
- improvement loop: N/A: implement the accepted docs review items and verify
- final score / loop closure: N/A

Completion threshold:

- `content/docs/slate/concepts/17-clipboard-and-paste.mdx` exists and follows
  Behavior / runtime concept shape.
- `content/docs/slate/concepts/18-projection-and-overlays.mdx` exists and
  follows Behavior / runtime concept shape.
- `content/docs/slate/meta.json` includes both pages in the Concepts order.
- Neighboring pages link to the new concepts where useful.
- `content/docs/slate/concepts/05-operations.mdx` avoids hidden-magic wording
  around operation application.
- Structural/stale-term/link checks and `pnpm --filter www check:docs` pass.
- Docs closure is legal only when the page teaches the fastest correct path,
  every claim is source-backed, the selected lane-specific shape proof row is
  satisfied, required MDX/link/preview checks are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-slate-clipboard-projection-docs.md`
  passes.

Verification surface:

- Source audit: targeted reads of existing sibling docs and source exports/files
  for clipboard, projection, annotations/widgets, and browser proof surfaces.
- Structural audit over `content/docs/slate/**/*.mdx`.
- Link/nav audit for Slate docs.
- `node -e` JSON parse for `content/docs/slate/meta.json`.
- `pnpm --filter www check:docs`.
- Live route smoke for new docs pages if the docs app can run.

Constraints:

- Follow `.agents/rules/docs-creator.mdc` for docs style and workflow.
- Write current-state docs only. No changelog voice.
- Keep code examples repo-backed and copy-pasteable.
- Do not invent APIs, routes, demos, imports, components, transforms, or options.
- Do not add docs ceremony for tiny typo/copy edits.

Boundaries:

- Source of truth: `docs-creator`, current Slate docs, and source files under
  `packages/slate`, `packages/slate-dom`, `packages/slate-react`, and
  `packages/browser`.
- Allowed edit scope: Slate docs and this goal plan.
- Browser surface: docs routes only; no product behavior/browser test changes.
- Tracker sync: N/A.
- Non-goals: no runtime code changes, no package API changes, no changesets, no
  Plate plugin docs rewrite, no broad copy-edit of every Slate docs page.

Blocked condition:

- Stop if a concept claim requires a runtime/API decision not present in source,
  if docs parser/link verification fails from an unrelated owner, or if route
  proof cannot run after one focused local retry.

Docs state:

- task_type: docs
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready-to-close

Current verdict:

- verdict: complete
- confidence: high after source audit, docs parser, link audit, formatting, and
  live route smoke
- next owner: user review
- reason: accepted docs review items are implemented and verified

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-slate-clipboard-projection-docs.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Requirements copied into Docs source, Completion threshold, Boundaries, and Work Checklist before docs edits |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `docs-creator` loaded | yes | Read `.agents/skills/docs-creator/SKILL.md` through EOF |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created this goal |
| Docs lane selected | yes | Behavior / runtime concept plus one API/concept wording edit |
| Target docs read | yes | Previous review read current Slate docs inventory; targeted sibling reads continue before writing |
| Nearest sibling docs read | yes | Existing review read relevant siblings; targeted reads continue before writing |
| Docs style doctrine read | yes | Read `.agents/skills/docs-creator/SKILL.md` through EOF |
| Documented source code read | yes | Initial source audit read public exports for Slate, Slate React, Slate DOM, Browser, Yjs, and Layout; targeted reads continue |
| Ownership map drafted | yes | Ownership recorded in Docs lane and Boundaries |
| Plugin-page rules decision | no | N/A: no Plate plugin page |
| Browser/render proof decision | yes | Text docs route smoke after changes if app runs |
| PR/tracker expectation decision | no | N/A: no PR/tracker action requested |

Work Checklist:

- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation. Requirements: apply
      all three accepted items from the review: add Clipboard And Paste, add
      Projection And Overlays, patch Operations wording; verify docs.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Docs lane is classified as install, guide/system, plugin/feature,
      serialization/conversion, workflow/AI, API reference, or spec/law.
- [x] Selected lane-specific shape proof row below is resolved with concrete
      evidence. A generic "docs lane shape satisfied" statement is not enough.
- [x] Target docs and nearest sibling docs were read before writing. Evidence:
      Editing Behavior, Selection And DOM, Extensions, Editable, React Editor,
      Annotations, Slate DOM, Slate Browser, Hooks.
- [x] Docs style doctrine in `docs-creator` was read before writing. Evidence:
      `.agents/skills/docs-creator/SKILL.md` read before edits.
- [x] Documented behavior or API was verified against current source. Evidence:
      `packages/slate/src/interfaces/editor.ts`,
      `packages/slate-dom/src/plugin/dom-editor.ts`,
      `packages/slate-react/src/components/editable-text-blocks.tsx`,
      `packages/slate-react/src/index.ts`,
      `packages/slate-react/src/hooks/use-slate-decoration-source.ts`,
      `packages/slate-react/src/editable/browser-handle.ts`.
- [x] Ownership map records core runtime, package, kit, registry, and app-local
      ownership where relevant. Evidence: tables name `@platejs/slate`,
      `@platejs/slate-dom`, `@platejs/slate-react`, `@platejs/browser`, Browser,
      and app UI ownership; no kit/registry owner applies.
- [x] Fastest success path appears before deeper mechanics or API reference.
      Evidence: both new pages start with `Choose The Right Surface`, then the
      runtime pipeline, then examples and proof.
- [x] Opening is three sentences or fewer and avoids generic fluff. Evidence:
      structural audit passed for all 74 Slate docs.
- [x] Named APIs, options, transforms, components, imports, routes, and package
      specifiers are exact and current. Evidence: source audit confirmed
      `clipboard.insertData`, `editor.api.clipboard.*`, `tx.fragment.insert`,
      `decorate`, `decorateDirtiness`, `decorateRuntimeScope`, `renderSegment`,
      `useSlateDecorationSource`, `useSlateRangeDecorationSource`,
      `useSlateAnnotationStore`, `useSlateWidgetStore`, `useSlateWidgets`, and
      `useSlateWidget`.
- [x] Plugin docs, if applicable, satisfy kit/manual/API ordering and headless
      package ownership. N/A: no Plate plugin doc.
- [x] Serialization docs, if applicable, split directions and state environment
      constraints before examples. N/A: not a serialization page.
- [x] API reference docs, if applicable, use exact contracts and avoid tutorial
      filler. N/A: concept pages plus one reference cross-link packet.
- [x] Spec/law docs, if applicable, record owner map, evidence, and explicit
      gaps. N/A: behavior/runtime concept pages, not a spec/law page.
- [x] Demos/previews are real registry entries or marked N/A with reason. N/A:
      no demos or previews added.
- [x] Links target real leaf pages and do not reinforce pages being displaced.
      Evidence: custom Slate docs link audit passed for 74 routes.
- [x] Anti-slop audit passed: no changelog voice, no fake APIs, no placeholder
      comments, no TODOs, no dead anchors, no redundant summary section.
      Evidence: stale/slop `rg` blacklist returned no matches.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed docs. Evidence: all commands ran in
      `/Users/zbeyens/git/plate-2`; package owner was `www` for docs checks.
- [x] Review/autoreview target selected for non-trivial docs work, or marked
      N/A with reason. N/A: docs-only concept packet verified through
      docs-creator shape, source audit, parser, link, formatting, and route
      checks; no runtime code review target.

Lane-Specific Shape Proof:
| Lane | Applies | Required proof | Evidence |
|------|---------|----------------|----------|
| Install / get-started | no | Opening has only the short lead before the first `##`; page has `## Installation`, `## Usage` or an equivalent first working path, and next-step links; procedural setup uses `<Steps>` when it is more than one real step; installed packages have an ownership table when more than one package/layer is involved; app-file snippets use titled code fences when file context matters. | N/A: no install page changed |
| Component / registry item | no | Real preview exists or is marked N/A; installation is CLI/manual shaped; usage has imports plus smallest JSX; examples are real variants; API reference is last when needed. | N/A: no component or registry page changed |
| Guide / system | no | Opening is short with sibling disambiguation when needed; ownership model appears early; quick start precedes deeper mechanics; reference material stays last. | N/A: selected lane is behavior/runtime concept |
| Behavior / runtime concept | yes | Decision table or equivalent surface choice appears early; runtime pipeline has owner map; each stage is separated; recipes link to canonical references. | `17-clipboard-and-paste.mdx` and `18-projection-and-overlays.mdx` both start with `Choose The Right Surface`, then `Runtime Pipeline`, then examples/proof/related docs; owner maps name Slate, Slate DOM, Slate React, Browser, and app UI layers |
| Plugin / feature | no | Kit usage and manual usage are split when a kit exists; headless package ownership is explicit; plugin APIs/transforms are documented only when source-real. | N/A: no Plate plugin page changed |
| Serialization / conversion | no | Directions are split up front; environment constraints appear before examples; extension points come after the base path; heavy API reference stays late. | N/A: not serialization docs |
| Workflow / AI | no | Required runtime pieces are separated from optional UI; setup path comes before architecture; client/server or provider boundaries are explicit. | N/A: not workflow/AI docs |
| API reference | no | Short purpose paragraph, grouped surface, exact parameters/options/returns, caveats, and no tutorial restart. | N/A: no API reference page added |
| Spec / law / behavior | no | Contract, owner map, model-before-UX, evidence, and explicit gaps are recorded before any appendix. | N/A: no spec/law page changed |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the source audit, parser/build, link/demo check, or review named in this plan | Source audit, structural audit, stale/slop audit, link audit, `pnpm --filter www check:docs`, formatting, and live route smoke all passed |
| Docs lane shape satisfied | yes | Resolve the selected row in `Lane-Specific Shape Proof`; do not close this gate from a generic shape assertion | Behavior/runtime concept row resolved with decision table, runtime pipeline, owner map, examples, proof, and related docs |
| Source-backed claim audit | yes | Verify every named API/option/transform/component/import/route against source | Confirmed names in Slate, Slate DOM, Slate React, and Browser source files listed in Work Checklist |
| Ownership map verified | yes | Confirm package/layer/kit/app-local ownership claims against source | New tables map browser event/app UI/package/runtime/proof owners; no kit/registry owner applies |
| MDX/content parser | yes | Run `pnpm --filter www build:contentlayer` for MDX/content changes, or record N/A | `pnpm --filter www check:docs` ran `fumadocs-mdx source.config.ts .source` and docs source parity passed |
| Links/routes/previews verified | yes | Check leaf links, routes, anchors, and `<ComponentPreview>` names or record N/A | Link audit passed for 74 docs routes; live route smoke returned 200 for 12 changed/linked docs routes |
| Plugin page specifics | no | If plugin page, apply `docs-creator` kit/manual/API rules or record N/A | N/A: no Plate plugin page |
| Browser/render surface changed | yes | Capture Browser proof for normal rendered surfaces, or Chrome/Computer proof for native browser/OS surfaces | Browser navigation tool was not exposed; used rendered HTTP route smoke against `PORT=3002 pnpm --filter www dev`, 12 routes returned 200 and content markers were present |
| Package/API behavior changed | no | Add changeset or record N/A | N/A: docs-only packet, no package/API behavior change |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no `.agents` source edits |
| Autoreview for non-trivial docs changes | no | Load `.agents/skills/autoreview/SKILL.md` and run the right target, or record N/A for tiny/no-local-patch work | N/A: docs-only concept packet verified with docs-creator/source/parser/link/route gates |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm exec biome check content/docs/slate --fix` passed; `pnpm exec prettier --write` ran on all edited docs files |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-slate-clipboard-projection-docs.md` | To be rerun after this plan evidence patch |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read docs-creator/autogoal, existing sibling docs, and source files for clipboard/projection APIs | writing |
| Writing | complete | Added `17-clipboard-and-paste.mdx`, `18-projection-and-overlays.mdx`, nav, cross-links, and Operations wording patch | verification |
| Verification | complete | JSON, structural, stale/slop, link, docs parser, formatting, and live route smoke passed | closeout |
| PR / tracker sync | complete | N/A: no PR/tracker requested | final response |
| Closeout | complete | Final evidence recorded; check-complete to be rerun | final response |

Findings:

- Clipboard/paste/drop/fragment ingress is source-real but split across
  Extensions, Editable, React Editor, Slate DOM, DOM Coverage, Slate Browser,
  and Operation Replay.
- Projection/overlay behavior is source-real but split across Editable,
  Hooks, Annotations, React package index, and performance guidance.

Decisions and tradeoffs:

- Add concept pages instead of expanding primitive references. This matches
  docs-creator's pipeline-concept rule.
- Do not split Migration in this packet. The user accepted the three concrete
  review items only.

Implementation notes:

- Added `content/docs/slate/concepts/17-clipboard-and-paste.mdx`.
- Added `content/docs/slate/concepts/18-projection-and-overlays.mdx`.
- Added both pages to `content/docs/slate/meta.json`.
- Patched `content/docs/slate/concepts/05-operations.mdx` to remove the hidden
  magic wording.
- Added cross-links from Overview, Extensions, Editing Behavior, Selection And
  DOM, Editable, Annotations, React Editor, Slate DOM, and Slate Browser.

Review fixes:

- Initial route smoke checked an exact source phrase and failed because rendered
  HTML preserved a newline. Reran with whitespace normalization.
- Initial link audit did not understand `index.mdx` route bases or folder
  indexes. Reran with route-aware resolution.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First `apply_patch` missed a table context in Selection And DOM | 1 | Split patch into smaller file/add/link patches | Applied successfully |
| First link audit treated index and folder-index routes as missing | 1 | Use route-aware resolver with folder-index support | Link audit passed |
| First route smoke looked for a source phrase without whitespace normalization | 1 | Normalize rendered whitespace before checking markers | Route smoke passed |

Verification evidence:

- `node -e "JSON.parse(require('fs').readFileSync('content/docs/slate/meta.json','utf8')); console.log('meta json ok')"`: passed.
- Structural docs audit over `content/docs/slate/**/*.mdx`: passed for 74 files.
- Stale/slop blacklist `rg` over Slate docs: no matches.
- Custom Slate docs link audit: passed for 74 files / 74 routes.
- `pnpm --filter www check:docs`: passed.
- `pnpm exec biome check content/docs/slate --fix`: passed; no fixes applied.
- `pnpm exec prettier --write ...`: passed on all edited MDX/JSON files.
- `PORT=3002 pnpm --filter www dev`: app ready on `http://localhost:3002`.
- Live route smoke returned 200 for `/docs/slate`,
  `/docs/slate/concepts/05-operations`,
  `/docs/slate/concepts/08-extensions`,
  `/docs/slate/concepts/15-editing-behavior`,
  `/docs/slate/concepts/16-selection-and-dom`,
  `/docs/slate/concepts/17-clipboard-and-paste`,
  `/docs/slate/concepts/18-projection-and-overlays`,
  `/docs/slate/libraries/slate-react/editable`,
  `/docs/slate/libraries/slate-react/annotations`,
  `/docs/slate/libraries/slate-react/react-editor`,
  `/docs/slate/libraries/slate-dom`, and
  `/docs/slate/libraries/slate-browser`.

Final handoff contract:

- PR line: no PR requested.
- Issue / tracker line: no tracker update requested.
- Confidence line: high.
- Docs lane: Behavior / runtime concept.
- Source-backed claims: clipboard and projection API names checked against
  package source.
- Content build / parser: `pnpm --filter www check:docs` passed.
- Links / demos / previews: link audit and live route smoke passed; no demos or
  previews added.
- Browser check: Browser navigation tool unavailable; rendered HTTP route smoke
  passed against local dev server.
- Outcome: docs review items implemented.
- Caveat: no runtime/browser behavior changed.
- Verified: see Verification evidence.

Final handoff / sync:

- PR: none.
- Issue / tracker: none.
- Browser proof: local HTTP rendered-route smoke; Browser tool unavailable in
  this session.
- Caveats: docs-only packet; no package runtime proof needed.

Timeline:

- 2026-06-22T05:23:06.948Z Docs goal plan created.
- 2026-06-22T05:23Z Goal created and first checkpoint filled before docs edits.
- 2026-06-22T05:30Z Implemented concept pages, nav, cross-links, and Operations
  wording.
- 2026-06-22T05:39Z Verification passed and dev server stopped.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response after `check-complete` and goal close |
| What is the goal? | Add two Slate concept pages, patch Operations wording, wire docs/nav links, verify |
| What have I learned? | See Findings |
| What have I done? | See Implementation notes and Verification evidence |

Open risks:

- None blocking.
