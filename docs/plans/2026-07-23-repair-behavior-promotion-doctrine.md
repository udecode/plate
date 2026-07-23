# Repair behavior promotion doctrine

Objective:
Repair behavior promotion doctrine; done when best-api, Plate Vision, and
editor-behavior agree and agent-native validation passes; plan
docs/plans/2026-07-23-repair-behavior-promotion-doctrine.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-23-repair-behavior-promotion-doctrine.md

Template:
docs/plans/templates/docs.md

Primary template:
docs/plans/templates/docs.md

Applied packs:

- agent-native (docs/plans/templates/packs/agent-native.md)

Docs source:

- type: repo-internal API doctrine and behavior-law documentation
- id / link: `.agents/rules/best-api.mdc`,
  `docs/research/systems/editor-behavior-architecture.md`
- title: behavior-to-plugin promotion protocol
- acceptance criteria: one invariant/parameter/capability/product-policy
  classification; hard promotion gates; ordinary plugin composition; no
  profiles-first runtime or one-plugin-per-callback guidance

Docs lane:

- lane: spec / law / behavior plus agent workflow doctrine
- target docs: `.agents/rules/best-api.mdc`,
  `docs/vision/plate.md`, `docs/editor-behavior/README.md`, and
  `docs/research/systems/editor-behavior-architecture.md`
- documented source owner: Plate plugin composition, current Table behavior
  declarations, and Plite extension identity
- nearest sibling docs: `docs/editor-behavior/editor-protocol-matrix.md`,
  `docs/editor-behavior/markdown-editing-spec.md`, and
  `docs/analysis/best-api-review.md`
- plugin page: N/A: internal doctrine, not a public feature page

First checkpoint:

- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:

- requested duration: none
- semantics: N/A: no timed checkpoint requested
- initial confidence score: N/A: binary artifact and validation gates apply
- improvement loop: repair contradictions, review, validate, close findings
- final score / loop closure: N/A: binary completion threshold below

Completion threshold:

- `.agents/rules/best-api.mdc` owns a behavior-promotion protocol that separates
  invariant, parameter, substitutable capability, and app policy.
- `docs/vision/plate.md` carries the durable summary without package-specific
  Table names.
- editor-behavior architecture and README no longer teach profiles-first as the
  default architecture and explain how protocol rows feed packaging decisions.
- Current Table declarations pressure-test the protocol without turning seven
  implementation contributions into seven plugins.
- `pnpm install`, source audits, markdown formatting checks,
  `agent-native-reviewer`, `autoreview`, and the goal checker pass with no
  accepted findings open.
- Docs closure is legal only when the page teaches the fastest correct path,
  every claim is source-backed, the selected lane-specific shape proof row is
  satisfied, required MDX/link/preview checks are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-23-repair-behavior-promotion-doctrine.md`
  passes.

Verification surface:

- Source audit for stale profiles-first/default profile machinery and promotion
  terminology across the changed owners.
- Generated mirror audit after `pnpm install`.
- Markdown formatting/lint proof scoped to changed doctrine files.
- Table forward-test against `BaseTablePlugin.ts` and `TablePlugin.tsx`.
- `agent-native-reviewer`, `autoreview`, and `check-complete.mjs`.

Constraints:

- Follow `.agents/rules/docs-creator.mdc` for docs style and workflow.
- Write current-state docs only. No changelog voice.
- Keep code examples repo-backed and copy-pasteable.
- Do not invent APIs, routes, demos, imports, components, transforms, or options.
- Do not add docs ceremony for tiny typo/copy edits.
- Keep behavior specification separate from public packaging: protocol rows are
  evidence, not one-to-one plugin declarations.
- Preserve the default `plugins: [TablePlugin]` path.
- Keep one-owner behavior colocated; plugin identity does not force a file
  split.
- Do not introduce a behavior DSL, registry, profile runtime, serialized
  profile, or runtime switching API.

Boundaries:

- Source of truth: `.agents/rules/best-api.mdc`, `docs/vision/plate.md`, and the
  editor-behavior architecture/spec stack.
- Allowed edit scope: the named source rule, generated best-api mirror,
  Plate Vision, editor-behavior README/architecture, this plan, and only
  directly contradictory worker wording proven by audit.
- Browser surface: N/A: internal Markdown and agent instruction changes have no
  rendered product route.
- Tracker sync: N/A: no issue or tracker requested.
- Non-goals: no Table/Core implementation, no public package API, no changeset,
  no profile/runtime system, and no broad editor-behavior spec rewrite.

Output budget strategy:

- Use exact-file reads and bounded `rg` searches excluding generated/build
  directories. Cap broad contradiction scans to filenames/counts before line
  output. Do not print full large specs.

Blocked condition:

- Stop only if source generation cannot reproduce `.agents/skills/best-api`,
  doctrine owners require mutually incompatible rules, or validation repeatedly
  fails without an in-scope repair.

Docs state:

- task_type: docs
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final handoff
- goal_status: complete

Current verdict:

- verdict: repair required
- confidence: high
- next owner: best-api repair
- reason: the behavior-law stack has useful ownership evidence but its
  profiles-first architecture conflicts with the accepted smallest public
  composition model

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-23-repair-behavior-promotion-doctrine.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User requested both the best-api promotion protocol and editor-behavior repair; scope, non-goals, deliverables, and proof are recorded above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| `docs-creator` loaded | yes | Read `.agents/skills/docs-creator/SKILL.md` completely before writing. |
| Active goal checked or created | yes | Goal tool returned no active goal; created the objective recorded above. |
| Docs lane selected | yes | Spec / law / behavior plus agent workflow doctrine. |
| Target docs read | yes | Read best-api, Plate Vision, editor-behavior README, architecture, protocol matrix, and Table law. |
| Nearest sibling docs read | yes | Read `docs/analysis/best-api-review.md` Table rows and relevant protocol/spec sections. |
| Docs style doctrine read | yes | Read `docs-creator` source-generated skill completely. |
| Documented source code read | yes | Read the seven Table `.extendExtension` blocks and React Table handler owner. |
| Ownership map drafted | yes | Behavior law -> editor-behavior; public promotion decision -> best-api; durable taste -> Plate Vision; execution -> plate-plan/plugin owner. |
| Plugin-page rules decision | no | N/A: no public plugin page is changing. |
| Browser/render proof decision | no | N/A: no rendered app/content surface is changing. |
| PR/tracker expectation decision | no | N/A: user requested local repair only. |
| Agent-native pack selected | yes | `agent-native` pack materialized into this plan. |
| Agent-facing action surface identified | yes | `best-api design/review/repair` behavior-promotion decision. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/best-api.mdc`; regenerate `.agents/skills/best-api/SKILL.md` with `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Read `.agents/skills/agent-native-reviewer/SKILL.md` completely. |

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
      evidence. The architecture page puts contract, owner map, classification,
      gates, Table evidence, and open questions in that order.
- [x] Target docs and nearest sibling docs were read before writing.
- [x] Docs style doctrine in `docs-creator` was read before writing.
- [x] Documented behavior or API was verified against current source:
      `BaseTablePlugin.ts` has seven `.extendExtension(...)` contributions and
      `TablePlugin.tsx` owns React copy, cut, and keydown handlers.
- [x] Ownership map records Plite mechanics, Plate feature invariants,
      capability plugins/extensions, app kits, `best-api`, and plan owners.
- [x] Fastest success path appears before deeper mechanics or API reference:
      the architecture page opens with the five-rule bottom line.
- [x] Opening is three sentences or fewer and avoids generic fluff.
- [x] Named APIs, options, transforms, components, imports, routes, and package
      specifiers are exact and current. No new public API is claimed.
- [x] Plugin docs, if applicable, satisfy kit/manual/API ordering and headless
      package ownership. N/A: no public plugin page changed.
- [x] Serialization docs, if applicable, split directions and state environment
      constraints before examples. N/A: no serialization docs changed.
- [x] API reference docs, if applicable, use exact contracts and avoid tutorial
      filler. N/A: this is doctrine, not API reference.
- [x] Spec/law docs record the contract, owner map, source evidence, promotion
      gates, and unresolved Table candidate questions.
- [x] Demos/previews are real registry entries or marked N/A with reason. N/A:
      no product or rendered docs surface changed.
- [x] Links target real leaf pages and do not reinforce pages being displaced.
      A scoped cross-tree audit resolved links in 22 changed files; a stricter
      file-relative audit resolves all 13 editor-behavior Markdown files.
- [x] Anti-slop audit passed: current-state language, no fake public API, no
      placeholder comments, and the rejected profile plan is explicitly
      superseded rather than left executable.
- [x] Workspace authority recorded: all proof ran from
      `/Users/zbeyens/git/plate-2`.
- [x] Review/autoreview target selected for non-trivial docs work: dirty-local
      review with an exact doctrine-only scope prompt.
- [x] Agent-native pack: source-of-truth `.agents/rules/**` files were edited
      instead of generated skill mirrors.
- [x] Agent-native pack: `AGENTS.md` routes best-API questions to `best-api`,
      whose Behavior Promotion section names the action and downstream owners.
- [x] Agent-native pack: `pnpm install` regenerated the skill mirrors; the
      Behavior Promotion source and generated sections match exactly.
- [x] Agent-native pack: accepted agent-native review findings are fixed; the
      final independent re-review returned clean.

Lane-Specific Shape Proof:
| Lane | Applies | Required proof | Evidence |
|------|---------|----------------|----------|
| Install / get-started | no | Opening has only the short lead before the first `##`; page has `## Installation`, `## Usage` or an equivalent first working path, and next-step links; procedural setup uses `<Steps>` when it is more than one real step; installed packages have an ownership table when more than one package/layer is involved; app-file snippets use titled code fences when file context matters. | N/A: internal doctrine. |
| Component / registry item | no | Real preview exists or is marked N/A; installation is CLI/manual shaped; usage has imports plus smallest JSX; examples are real variants; API reference is last when needed. | N/A: internal doctrine. |
| Guide / system | no | Opening is short with sibling disambiguation when needed; ownership model appears early; quick start precedes deeper mechanics; reference material stays last. | N/A: spec/law lane is stronger. |
| Behavior / runtime concept | no | Decision table or equivalent surface choice appears early; runtime pipeline has owner map; each stage is separated; recipes link to canonical references. | N/A: spec/law lane is stronger. |
| Plugin / feature | no | Kit usage and manual usage are split when a kit exists; headless package ownership is explicit; plugin APIs/transforms are documented only when source-real. | N/A: no public plugin page. |
| Serialization / conversion | no | Directions are split up front; environment constraints appear before examples; extension points come after the base path; heavy API reference stays late. | N/A: no serialization docs. |
| Workflow / AI | no | Required runtime pieces are separated from optional UI; setup path comes before architecture; client/server or provider boundaries are explicit. | N/A: no workflow/AI docs. |
| API reference | no | Short purpose paragraph, grouped surface, exact parameters/options/returns, caveats, and no tutorial restart. | N/A: doctrine, not API reference. |
| Spec / law / behavior | yes | Contract, owner map, model-before-UX, evidence, and explicit gaps are recorded before any appendix. | `editor-behavior-architecture.md` states the contract and owner map first, then classification and eight promotion gates, then current Table evidence and three explicit open questions. |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | passed | Run the source audit, parser/build, link/demo check, or review named in this plan | Source terminology, links, source/mirror sync, Table evidence, Markdown format, agent-native review, and final autoreview pass. |
| Docs lane shape satisfied | passed | Resolve the selected row in `Lane-Specific Shape Proof`; do not close this gate from a generic shape assertion | Exact evidence is recorded in the selected spec/law row above. |
| Source-backed claim audit | passed | Verify every named API/option/transform/component/import/route against source | Seven Base Table extension contributions and three React handler owners verified; no invented public API remains. |
| Ownership map verified | passed | Confirm package/layer/kit/app-local ownership claims against source | Architecture owner map separates Plite mechanics, Plate invariants, ordinary capability plugins/extensions, app kits, API decision, and adoption plan. |
| MDX/content parser | N/A | Run `pnpm --filter www build:contentlayer` for MDX/content changes, or record N/A | No `content/**` or MDX file changed. |
| Links/routes/previews verified | passed | Check leaf links, routes, anchors, and `<ComponentPreview>` names or record N/A | Strict audit resolves all 13 editor-behavior files; exact checks resolve the three changed research index/log links. No routes or previews are involved. |
| Plugin page specifics | N/A | If plugin page, apply `docs-creator` kit/manual/API rules or record N/A | No public plugin page changed. |
| Browser/render surface changed | N/A | Capture Browser proof for normal rendered surfaces, or Chrome/Computer proof for native browser/OS surfaces | Internal Markdown and agent instructions only; no rendered route or UI changed. |
| Package/API behavior changed | N/A | Add changeset or record N/A | No package source or public API implementation changed. |
| Agent rules or skills changed | passed | Run `pnpm install` and verify generated skill sync | `pnpm install` completed and exact section comparison confirmed the generated `best-api` mirror. |
| Autoreview for non-trivial docs changes | passed | Load `.agents/skills/autoreview/SKILL.md` and run the right target, or record N/A for tiny/no-local-patch work | Final scoped dirty-local Codex review returned `autoreview clean: no accepted/actionable findings reported`. |
| Final lint | passed | Run `pnpm lint:fix` or scoped equivalent | Scoped Prettier check passed every changed Markdown file; Skiller generation is authoritative for `.mdc` mirrors. |
| Timed checkpoint | N/A | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | No duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-23-repair-behavior-promotion-doctrine.md` | Final checker executed against the sealed ledger and returned `[autogoal] complete`. |
| Agent source / generated sync | passed | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` passed; source and generated Behavior Promotion sections match exactly. |
| Agent action discoverability | passed | Source-audit the skill/rule path an agent will read | Root and source `AGENTS.md` route “best API” to `best-api`; the generated skill exposes Behavior Promotion and hands adoption to `plate-plan`/`plite-plan`. |
| Agent-native review | passed | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | The independent review found four docs-contract gaps and one stale Table-debt row; all were fixed, and the final re-review returned clean. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | governing skills, doctrine, behavior law, Table owners, and sibling analysis read | writing |
| Writing | complete | source rules, Vision, editor-behavior architecture/spec stack, research decisions, and stale plan repaired | verification |
| Verification | complete | generation, source audit, link audit, Table forward-test, formatting, agent-native review, and autoreview pass | closeout |
| PR / tracker sync | complete | N/A: no PR or tracker action requested | final response |
| Closeout | complete | final ledger sealed for the goal checker | final response |

Findings:

- `docs/editor-behavior` already owns law, exhaustive scenarios, and coverage;
  packaging must remain a grouped decision above individual protocol rows.
- `docs/research/systems/editor-behavior-architecture.md` correctly identifies
  nearest-structure ownership and plugin-provided capabilities, but incorrectly
  mandates a profiles-first runtime and leaves core-vs-plugin promotion open.
- Current Table code has seven implementation contributions that group into
  fewer behavior families; the unseeded forward test found that none currently
  has a complete enough fallback to earn public plugin identity.

Decisions and tradeoffs:

- Put the reusable promotion gate in `best-api`; summarize durable taste in
  Plate Vision; keep Table-specific classification in the architecture doc.
- Treat profiles as ordinary reusable plugin arrays only after real reuse, not
  as a default runtime ontology.
- Keep the current Table Base/React boundary. Treat clipboard customization as
  a future candidate only after a real replacement caller and browser proof.

Implementation notes:

- Added the four-class promotion protocol to the source `best-api` rule and
  summarized it in Plate Vision.
- Reframed editor-behavior as law and evidence, not a profiles-first public
  runtime; routed public packaging to `best-api`.
- Kept Plite as the sole execution/composition model and ordinary plugin arrays
  as the advanced path.
- Renamed three research artifacts whose filenames encoded the rejected
  profiles-first conclusion and repaired their inbound links.
- Marked the rejected behavior-profile plan superseded.
- Replaced the command pack's nonexistent `$editor-spec`, `$ralplan`, `$ralph`,
  `research-maintain`, `research-full`, and `$deep-interview` entrypoints with
  current repo skills; renamed the live Ralph command to
  `execute-next-batch.md`.
- Normalized editor-behavior Markdown links to real file-relative targets and
  removed dead `.omx` navigation.
- Added schema-required system metadata and current update dates to materially
  repaired research pages.

Review fixes:

- Accepted: canonical command routes were uncallable. Replaced them with
  `auto`, `research-wiki`, `grill-with-docs`, `best-api`, `plate-plan`, and
  `plite-plan`.
- Accepted: canonical editor-behavior links were repo-root-looking but broken
  when resolved from their files. Normalized the whole current command/doc
  surface and proved it file-relative.
- Accepted: research metadata was missing or stale. Added required frontmatter
  and `updated: 2026-07-23`.
- Accepted: the first review was seeded and could not satisfy the best-api
  forward test. Ran a no-context, unseeded Table packaging review and tightened
  the pressure test to its stricter no-promotion result.
- Accepted: `docs/analysis/best-api-review.md` still ranked Table behavior
  composition as P1 debt after the forward test found no promotable
  capability. Removed the row, documented complete Base/React presets, and
  retained only a future clipboard candidate behind the full gates.
- Accepted: the renamed research decision still used a repo-root-looking href
  in `index.md` and `log.md`. Converted both changed links and the changed
  architecture entry to file-relative targets.
- Final independent agent-native re-review: clean.
- Final scoped Codex autoreview: clean, no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First link script accepted repo-root fallback and therefore missed broken file-relative navigation | 1 | Resolve every editor-behavior link only from its containing file | Strict audit passes all 13 files. |
| First autoreview froze before the completed plan update | 1 | Update evidence, then rerun on the final bundle | Fixed; final rerun clean. |
| Final autoreview found one changed research href still resolving from the wrong directory | 1 | Fix the exact changed index/log links and rerun the same scoped review | Fixed; final rerun clean. |
| First goal-checker pass rejected self-referential “remains open” wording | 1 | Record the checker result directly instead of describing its timing | Rerun returns complete. |

Verification evidence:

- `pnpm install` passed after source-rule edits and regenerated skill mirrors.
- Exact source/generated comparison passed for `## Behavior Promotion`.
- Scoped terminology audits found no stale moved filenames or active
  profiles-first doctrine; rejected terms survive only in explicit rejections.
- Cross-tree links resolve across 22 changed Markdown files; strict
  file-relative links resolve across all 13 editor-behavior Markdown files.
- `BaseTablePlugin.ts` contains seven `.extendExtension(...)` contributions;
  `TablePlugin.tsx` contains the copy, cut, and keydown handler owners used by
  the pressure test.
- A no-context, unseeded Table packaging review concluded that no current
  fragment earns public plugin identity; only clipboard customization remains
  a future candidate pending a real caller and browser proof.
- Research frontmatter satisfies the schema and uses the current meaningful
  update date.
- The changed research index, log, and architecture links resolve from their
  containing files.
- Current command docs contain no stale Ralph/editor-spec entrypoints or dead
  `.omx` navigation, and every named skill exists.
- Independent agent-native re-review returned clean after all accepted
  findings were fixed.
- Final command:
  `.agents/skills/autoreview/scripts/autoreview --mode local --prompt <scoped doctrine contract>`.
  Result: `autoreview clean: no accepted/actionable findings reported`.
- Scoped Prettier check passed all changed Markdown files.

Final handoff contract:

- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no tracker action requested.
- Confidence line: high.
- Docs lane: spec / law / behavior plus agent workflow doctrine.
- Source-backed claims: verified against current Table Base/React owners and
  generated agent rules.
- Content build / parser: N/A: no MDX or `content/**` surface changed.
- Links / demos / previews: strict current-doc links pass; no demos or previews.
- Browser check: N/A: no rendered route, package behavior, or UI changed.
- Outcome: behavior law, API promotion, adoption planning, and execution now
  have distinct owners; profiles-first machinery is rejected; current Table
  remains one complete Base/React feature.
- Caveat: no product API implementation or Table portal cleanup was attempted.
- Verified: generation, exact mirror comparison, terminology audits, strict
  links, research schema, unseeded Table test, formatting, agent-native review,
  autoreview, and goal checker.

Final handoff / sync:

- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A: internal Markdown and agent doctrine only.
- Caveats: current doctrine repair only; accepted product API work still routes
  through `best-api` and the owning layer plan.

Timeline:

- 2026-07-23T13:00:21.464Z Docs goal plan created.
- 2026-07-23: Goal created; autogoal, best-api, docs-creator, and
  agent-native-reviewer instructions read; first checkpoint completed.
- 2026-07-23: User redirected the thread to a separate read-only Plite/Wordgard
  API review. Doctrine repair WIP frozen without a completion claim.
- 2026-07-23: Repaired source doctrine, Vision, editor-behavior architecture,
  behavior specs, research decisions, and stale plan; regenerated skills.
- 2026-07-23: Source, mirror, terminology, link, Table forward-test, and
  Markdown formatting checks passed; final reviews started.
- 2026-07-23: Independent review found stale command routes, file-relative link
  failures, research metadata drift, and a missing unseeded forward test; all
  four were repaired and revalidated.
- 2026-07-23: Removed the stale Table composition debt row, repaired the final
  changed research links, and reached a clean final autoreview.
- 2026-07-23: Sealed the completion ledger for the final goal checker.
- 2026-07-23: Goal checker returned `[autogoal] complete`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Complete |
| Where am I going? | Final handoff |
| What is the goal? | Align best-api, Plate Vision, and editor-behavior on a strict behavior-to-plugin promotion protocol. |
| What have I learned? | Behavior-law evidence is strong; plugin promotion needs substitution and fallback proof, not callback count or universality. |
| What have I done? | Repaired the doctrine stack, removed active profiles-first conclusions, regenerated skills, and passed scoped source/format/link checks. |

Open risks:

- No accepted in-scope findings remain. Historical execution plans retain
  provenance; the rejected 2026-07-23 profiles plan is explicitly superseded.
