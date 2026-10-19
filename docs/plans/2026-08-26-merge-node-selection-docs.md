# Merge node selection docs

Objective:
Consolidate node-selection docs into canonical model and React owners; done when stale routes are gone and docs, registry, and browser checks pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-26-merge-node-selection-docs.md

Template:
docs/plans/templates/docs.md

Primary template:
docs/plans/templates/docs.md

Applied packs:
- none

Docs source:

- type: local current-state docs topology and registry metadata
- id / link: `content/docs/(plugins)/(functionality)/node-selection.mdx`
- title: Node Selection
- acceptance criteria: delete the false plugin page; keep model/API teaching in the Plite Selection API; document package React primitives in Plate Components; expose the existing demo through the Editor registry item; remove stale route links and navigation.

Docs lane:

- lane: API reference plus generated component/registry discovery
- target docs: `content/docs/api/core/plate-components.mdx`, `content/docs/plite/api/locations/selection.mdx`, Editor registry metadata, and affected inbound docs links
- documented source owner: Plite owns selection state and queries; Plate Core React owns `NodeSelectionHighlight` and `NodeSelectionDrag`; copied `Editor` owns example composition.
- nearest sibling docs: `content/docs/plite/concepts/16-selection-and-dom.mdx`, generated `/docs/components/editor`, and `/docs/examples/node-selection`
- plugin page: delete; no plugin or independent feature-package owner exists

First checkpoint:

- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:

- requested duration: N/A: none requested
- semantics: N/A
- initial confidence score: N/A: binary artifact and command threshold is stronger
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:

- Both standalone node-selection plugin MDX files are deleted.
- Zero stale `/docs/node-selection`, `data-slot="node-selection"`, or `data-slot="node-selection-marquee"` references remain in current docs/registry source.
- Plate Components teaches both shipped React primitives, composition, selection eligibility, self-highlight opt-out, and current data slots without duplicating Plite selection API reference.
- The Editor registry item exposes `node-selection-demo` and links the canonical Plate Components API page.
- Source/parser/docs/registry/browser gates pass for the three surviving routes.
- Docs closure is legal only when the page teaches the fastest correct path,
  every claim is source-backed, the selected lane-specific shape proof row is
  satisfied, required MDX/link/preview checks are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-merge-node-selection-docs.md`
  passes.

Verification surface:

- focused `rg` stale-route/symbol audit and source comparison against `NodeSelection.tsx` and `editor.tsx`
- JSON parse plus www source/docs/registry generation checks required by current scripts
- scoped formatting/type checks for changed TS/TSX
- Browser route/render proof for `/docs/api/core/plate-components#node-selection`, `/docs/components/editor`, and `/docs/examples/node-selection`, plus removed-route behavior

Constraints:

- Follow `.agents/rules/docs-creator.mdc` for docs style and workflow.
- Write current-state docs only. No changelog voice.
- Keep code examples repo-backed and copy-pasteable.
- Do not invent APIs, routes, demos, imports, components, transforms, or options.
- Do not add docs ceremony for tiny typo/copy edits.

Boundaries:

- Source of truth: live Plite selection API, Plate Core React primitives, copied Editor composition, registry metadata, and docs navigation.
- Allowed edit scope: the two canonical docs, deleted EN/CN node-selection pages, direct inbound docs/example links, the command-menu copy target derived from the removed page, `content/docs/meta.json`, Editor registry metadata, generated docs/registry outputs required by repo commands, and this plan.
- Browser surface: the three surviving docs/component/example routes and the removed `/docs/node-selection` route.
- Tracker sync: N/A: no issue or external tracker requested.
- Non-goals: no runtime/API changes, no new component/page/plugin, no redirect or compatibility alias, no commit/push/PR.

Output budget strategy:

- Use exact files and bounded `rg`; exclude generated registry payloads from exploratory searches unless a verification command regenerates them; cap command output and record summaries in this plan.

Blocked condition:

- Stop only if the canonical API/component route cannot render or the registry/docs generators require a contradictory public owner that cannot be resolved from current source.

Docs state:

- task_type: docs
- task_complexity: normal
- current_phase: intake
- current_phase_status: in_progress
- next_phase: writing
- goal_status: active

Current verdict:

- verdict: delete and merge; do not move the standalone page
- confidence: high from live owner/source audit
- next owner: docs
- reason: the page claims plugin taxonomy while explicitly documenting no plugin; its model and UI halves already have separate canonical owners

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-merge-node-selection-docs.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Accepted target copied into completion threshold and boundaries before implementation. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| `docs-creator` loaded | yes | Read `.agents/skills/docs-creator/SKILL.md` completely. |
| Active goal checked or created | yes | No active goal existed; created this one-shot goal with this plan. |
| Docs lane selected | yes | API reference plus generated component/registry discovery; standalone plugin lane rejected. |
| Target docs read | yes | Read both node-selection pages and the surviving Plate/Plite docs. |
| Nearest sibling docs read | yes | Read Selection API, Selection And DOM headings/content, Plate Components, Block Menu, and generated Editor metadata. |
| Docs style doctrine read | yes | Read `style-and-structure.md` and the API/component lane templates. |
| Documented source code read | yes | Read `packages/core/src/react/components/NodeSelection.tsx` and copied `editor.tsx`. |
| Ownership map drafted | yes | Plite model; Plate Core React DOM behavior; copied Editor visual composition; registry metadata discovery. |
| Plugin-page rules decision | yes | N/A as retained lane: delete because no plugin owner exists. |
| Browser/render proof decision | yes | Required for surviving routes and removed route because content and `apps/www` change. |
| PR/tracker expectation decision | no | N/A: user authorized local execution only; no commit, push, PR, or tracker mutation. |

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
- [ ] Selected lane-specific shape proof row below is resolved after writing with concrete evidence. A generic "docs lane shape satisfied" statement is not enough.
- [x] Target docs and nearest sibling docs were read before writing.
- [x] Docs style doctrine in `docs-creator` was read before writing.
- [x] Documented behavior or API was verified against current source.
- [x] Ownership map records core runtime, package, kit, registry, and app-local
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
- [ ] Every created or edited docs artifact completed the required `unslop`
      file-edit pass after claims stabilized; evidence names each file and
      confirms literal content and technical claims were preserved.
- [ ] Requirement language, when present, separates hard compatibility,
      layer-specific setup, recommendations, and repo-only implementation
      details against live source owners.
- [ ] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed docs.
- [ ] Review/P1 autoreview target selected for non-trivial docs work, or marked
      N/A with reason.

Lane-Specific Shape Proof:
| Lane | Applies | Required proof | Evidence |
|------|---------|----------------|----------|
| Install / get-started | no | Opening has only the short lead before the first `##`; hard requirements appear before the first install command and are classified against package, copied-source, or build owners; the page has `## Installation`, `## Usage` or an equivalent first working path, and next-step links; procedural setup uses `<Steps>` when it is more than one real step; installed packages have an ownership table when more than one package/layer is involved; app-file snippets use titled code fences when file context matters. | N/A: no install page. |
| Component / registry item | no | Real preview exists or is marked N/A; installation is CLI/manual shaped; usage has imports plus smallest JSX; examples are real variants; API reference is last when needed. | N/A: generated Editor page remains registry-owned; this task only adds its existing demo relationship. |
| Guide / system | no | Opening is short with sibling disambiguation when needed; ownership model appears early; quick start precedes deeper mechanics; reference material stays last. | N/A: no guide page. |
| Behavior / runtime concept | no | Decision table or equivalent surface choice appears early; runtime pipeline has owner map; each stage is separated; recipes link to canonical references. | N/A: no concept page is created. |
| Plugin / feature | no | Kit usage and manual usage are split when a kit exists; headless package ownership is explicit; plugin APIs/transforms are documented only when source-real. | N/A: fake plugin page is deleted. |
| Serialization / conversion | no | Directions are split up front; environment constraints appear before examples; extension points come after the base path; heavy API reference stays late. | N/A: no serialization docs. |
| Workflow / AI | no | Required runtime pieces are separated from optional UI; setup path comes before architecture; client/server or provider boundaries are explicit. | N/A: no workflow/AI docs. |
| API reference | yes | Short purpose paragraph, grouped surface, exact parameters/options/returns, caveats, and no tutorial restart. | Pending final prose audit in `plate-components.mdx` and cross-link-only change in Selection API. |
| Spec / law / behavior | no | Contract, owner map, model-before-UX, evidence, and explicit gaps are recorded before any appendix. | N/A: no spec/law page. |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the source audit, parser/build, link/demo check, or review named in this plan | pending |
| Docs lane shape satisfied | pending | Resolve the selected row in `Lane-Specific Shape Proof`; do not close this gate from a generic shape assertion | pending |
| Source-backed claim audit | pending | Verify every named API/option/transform/component/import/route against source | pending |
| Required Unslop pass | pending | Run `unslop` in file-edit mode on every created or edited docs artifact after claims stabilize; name each file and confirm protected literal content and technical claims survived | pending |
| Requirements disclosure | pending | For install/get-started work, classify hard compatibility, layer-specific setup, recommendations, and repo-only details against live owners; otherwise record N/A | pending |
| Ownership map verified | pending | Confirm package/layer/kit/app-local ownership claims against source | pending |
| MDX/content parser | pending | Run `pnpm --filter www build:contentlayer` for MDX/content changes, or record N/A | pending |
| Links/routes/previews verified | pending | Check leaf links, routes, anchors, and `<ComponentPreview>` names or record N/A | pending |
| Plugin page specifics | pending | If plugin page, apply `docs-creator` kit/manual/API rules or record N/A | pending |
| Browser/render surface changed | pending | Capture Browser proof for normal rendered surfaces, or Chrome/Computer proof for native browser/OS surfaces | pending |
| Package/API behavior changed | pending | Add changeset or record N/A | pending |
| Agent rules or skills changed | pending | Run `pnpm install` and verify generated skill sync | pending |
| P1 autoreview for non-trivial docs changes | pending | Load `.agents/skills/autoreview/SKILL.md` and run the right target with `--max-priority P1`; use P2 or P3 only when explicitly requested, or record N/A for tiny/no-local-patch work | pending |
| Final lint | pending | Run `pnpm lint:fix` or scoped equivalent | pending |
| Timed checkpoint | pending | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-merge-node-selection-docs.md` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | in_progress | created plan | writing |
| Writing | pending | | verification |
| Verification | pending | | closeout |
| PR / tracker sync | pending | | final response |
| Closeout | pending | | final response |

Findings:

- The standalone page says no selection plugin or extra store exists while living in the plugin/functionality lane.
- Plite Selection API already owns every model read/write and canonicalization claim from the standalone page.
- Plate Core React exports `NodeSelectionHighlight` and `NodeSelectionDrag`; copied `Editor` composes them as siblings.
- The standalone page's `node-selection` and `node-selection-marquee` slot names are stale; source uses `node-selection-highlight` and `node-selection-drag`.
- The command menu still listed a nonexistent `node-selection` registry item; the surviving example resolves through `node-selection-demo` first and does not need that dead name.

Decisions and tradeoffs:

- Delete rather than move the standalone page -> avoids duplicating two canonical owners -> requires updating nav and inbound links.
- Do not create `/docs/components/node-selection` -> no copied registry item owns that name -> use Plate Components API plus generated Editor/example discovery.
- No compatibility redirect -> accepted hard cut and no hard runtime/data law requires a docs alias.
- Link generated registry metadata to the Plate Components page rather than its `#node-selection` anchor -> the shared `toLinkHref` helper treats path-plus-fragment strings as pathnames and emits `%23`; changing that shared router helper is outside this docs-only boundary.

Implementation notes:

- Required Unslop file-edit pass read every edited docs/changelog artifact in full. The deterministic audit reported zero findings in both canonical docs and both Block Menu pages; its changelog bullet warning was a false positive for the required `- **\`editor\`**:` row grammar. One ambiguous eligibility sentence in Plate Components was tightened without changing API literals or links.

Review fixes:

- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `shadcn info --json` run at monorepo root returned `monorepo_root` | 1 | Target the owning workspace with `-c apps/www`. | `pnpm dlx shadcn@latest info --json -c apps/www` passed and confirmed the Radix/New York registry context. |
| Browser rejected `networkidle` for `waitForLoadState` | 1 | Use the supported `domcontentloaded` state plus a focused rendered-state read. | Canonical section rendered with exact primitives, links, and zero console warnings/errors. |
| Registry badge rendered `#node-selection` as `%23node-selection` | 1 | Keep the docs-only boundary and target the canonical Plate Components page. | Removed the fragment from Editor registry metadata; direct MDX links still target the section. |

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

- 2026-08-26T16:43:57.272Z Docs goal plan created.
- 2026-08-26 Source, taxonomy, lane, ownership, and accepted hard-cut requirements recorded before implementation.
- 2026-08-26 Deleted the EN/CN fake plugin pages, added the Plate Components section and Plite cross-link, rewired direct links/nav, attached the demo to Editor metadata, and updated the existing registry changelog source.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Writing complete; technical and prose verification next. |
| Where am I going? | Unslop, generation, source/parser checks, Browser proof, and closeout. |
| What is the goal? | Delete the false plugin page and consolidate selection docs into the Plite model and Plate React owners with route-safe proof. |
| What have I learned? | The page duplicates existing model API docs and carries stale component slot names. |
| What have I done? | Consolidated docs into canonical owners, removed the stale route, and rewired registry discovery. |

Open risks:

- Registry/docs generation may rewrite derived metadata; inspect only task-owned generated deltas and preserve unrelated shared-checkout changes.
