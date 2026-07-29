# Explicit plugin state contracts

Objective:
Migrate every production Plate plugin state owner to an exported explicit
`*PluginState` contract; done when all owners, adoption, docs, release notes,
and focused checks pass.

Goal plan:
docs/plans/2026-07-27-explicit-plugin-state-contracts.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Major source:
- type: direct user instruction
- id / link: N/A
- title: Explicit plugin state contracts
- decision to make: accepted; execute the explicit-state hard cut
- decision criteria: no state-owning plugin relies on inferred state; exported
  plugin descriptors export a `*PluginState`; no state default uses `as` or
  `satisfies` as its contract; consumer overrides remain partial and inline

Major lane:
- lane: public API migration
- output type: implementation plus verification
- implementation expected: yes
- affected packages / surfaces: all production Plate package plugin owners,
  `apps/www` registry/app plugin owners, public exports, docs, changesets
- dominant risk: silently narrowing or losing nullable, collection, callback,
  and later-added state fields while changing public type names

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
- initial confidence score: N/A; exact source and typecheck gates exist
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Every production `createBasePlugin`, `createPlatePlugin`, `toPlatePlugin`,
  and state-widening `.extend()` owner with `initialState` is backed by an
  explicit named `*PluginState` and typed default/factory.
- Every exported plugin descriptor exports its state contract.
- No owning `initialState` uses an inline inferred contract, `as`, or
  `satisfies`; consumer `.configure()` and weak overrides remain inline.
- Public names, barrels, docs, registry callers, and release artifacts are
  adopted without compatibility aliases.
- Source audit, affected typechecks/tests, lint, browser proof or exact N/A,
  autoreview, and the goal checker pass.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-27-explicit-plugin-state-contracts.md`
  passes.

Verification surface:
- AST/source audit of every production plugin state owner under `packages/**`,
  `apps/**`, and `benchmarks/**`.
- Source-first Turbo typechecks for every modified package and `www`.
- Focused package tests where state contracts have runtime coverage.
- `pnpm brl`, `pnpm lint:fix`, release-artifact audit, Browser proof for the
  modern registry editor route, and `autoreview`.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Execute the accepted hard cut without compatibility aliases or inferred
  plugin-state contracts.
- Preserve runtime defaults and consumer `.configure({ initialState })`
  ergonomics.
- Do not change document, editor, or external Zustand runtime behavior.

Boundaries:
- Source of truth: live plugin constructors, store consumers, exports, docs,
  registry owners, and current `main` for release-note wording.
- Allowed edit scope: production plugin sources, affected tests/type tests,
  barrels, docs/registry adoption, changesets, and this goal plan.
- External sources: N/A; local TypeScript and Plate contracts settle the task.
- Browser surface: modern `apps/www` standalone editor demo using registry
  plugins; resolve exact route before proof.
- Tracker sync: N/A; no issue or PR requested.
- Non-goals: redesigning plugin store runtime, selectors, or consumer
  `.configure()`; compatibility aliases; unrelated plugin API cleanup.

Output budget strategy:
- Use AST counts and filename manifests before line output; cap source reads by
  package; exclude tests/generated output until adoption or proof requires
  them; store no high-volume logs in the conversation.

Blocked condition:
- Stop only if the owning generic cannot express an explicit state without
  losing another published capability and three distinct repair attempts fail,
  or required package/browser tooling remains unavailable after the mandated
  reinstall/fallback path.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: explicit named state contracts for every owner
- confidence: high
- next owner: major-task execution
- reason: inferred defaults lose nullable, empty collection, absent callback,
  and future state fields; assertions hide the mismatch

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-27-explicit-plugin-state-contracts.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | This plan records all-owner scope, explicit exported state, no inference/assertions, adoption, and proof |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `major-task` loaded | yes | `.agents/skills/major-task/SKILL.md` read |
| Active goal checked or created | yes | Goal created with this plan path |
| Source of truth read before analysis | yes | 210 constructors and 53 state owners audited from live source |
| Major lane selected | yes | Public API migration |
| Decision criteria stated | yes | Completion threshold above |
| Existing repo patterns / prior decisions checked | yes | `VISION.md`, `docs/vision/plate.md`, builder generics, state owners, and prior best-api review |
| Helper stack selected | yes | `major-task`, `autogoal`, `changeset`; `autoreview` at closure |
| External research decision recorded | no | N/A: local source settles TypeScript contract |
| Implementation expectation recorded | yes | User said `go all` |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2` |
| Branch / PR expectation decided | no | N/A: no PR requested; repo rule forbids proactive branch hygiene |
| Output budget strategy recorded | yes | Scoped AST/count-first strategy above |
| Docs pack selected | yes | Docs audit included |
| `docs-creator` loaded | yes | `.agents/skills/docs-creator/SKILL.md` read before public docs edits |
| Docs lane selected | yes | Incidental public API reference adoption |
| Target docs and nearest sibling docs read | yes | `content/docs/api/core/plate-plugin.mdx` and plugin guides already establish explicit initial-state doctrine |
| Docs style doctrine read | yes | Current-state-only doctrine in repo instructions |
| Documented source owner identified | yes | Package plugin source and generated barrels |
| Browser pack selected | yes | Registry sources are in scope |
| Browser route / app surface identified | yes | Resolve modern standalone editor demo before proof |
| Browser tool decision recorded | yes | Browser plugin for ordinary route proof |
| Console/network caveat policy recorded | yes | Record route console/network state; ignore unrelated expected demo API failures only with evidence |
| Package/API pack selected | yes | Exported state types are public package API |
| Public surface or package boundary identified | yes | Every package exporting an affected plugin descriptor |
| Release artifact path selected | yes | One changeset per published package with a delta from `main`; registry changelog only if copied registry users see a delta |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/skills/changeset/SKILL.md` read |
| Barrel/export impact decision recorded | yes | Run `pnpm brl` after exported type additions/renames |
| Agent-native pack selected | yes | State authoring doctrine changed in three agent source rules |
| Agent-facing action surface identified | yes | Authoring and reviewing production plugin state |
| Source rule versus generated mirror boundary identified | yes | `.agents/rules/*.mdc` owns text; `.agents/skills/*/SKILL.md` is generated |
| `agent-native-reviewer` loaded or waiver recorded | yes | `.agents/skills/agent-native-reviewer/SKILL.md` read |

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
- [x] Major source records source type, id/link, title, decision type, expected
      outcome, decision criteria, likely files/packages/surfaces, browser
      surface, and highest-leverage owner.
- [x] Current state is mapped before proposing a new architecture, migration,
      benchmark, or plan.
- [x] Existing repo patterns, prior decisions, and nearby implementation
      constraints are recorded before external research.
- [x] External docs or source are used only where repo evidence does not settle
      the question, or N/A reason is recorded. N/A: local source settles it.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [x] Facts, inference, and recommendation are separated.
- [x] Review or pressure lenses are selected and completed: agent-native
      source/mirror audit completed; structured autoreview is the final gate.
- [x] If implementation happens, touched-surface packs cover docs, browser,
      package/API, or agent-native surfaces as needed.
- [x] Workspace authority recorded: all shell proof ran from
      `/Users/zbeyens/git/plate-2`; browser proof used the local `www` server.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence in the review fixes section.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages.
- [x] Browser pack: route, interaction path, and expected visible outcome were
      recorded before proof: `/blocks/playground`, one editor, edit/undo.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it. Native
      browser/OS behavior is N/A here.
- [x] Browser pack: console and network errors were checked after render and
      edit/undo; both were empty.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
      N/A: DOM snapshot, title, interaction result, console, and CDP network
      events fully inspected this type-only surface.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: package changesets
      for published type changes; no registry changelog because registry edits
      only adopt package contracts.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: this is package API work.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`. N/A: published types changed.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded.
- [x] Package/API pack: generated barrels and release notes are updated.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced with `pnpm install`.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason. No findings.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run exact owner/default/export audits | 53 owners, 21 consumers, zero gaps; zero optional-default gaps |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | Complete production AST audit |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | All completion criteria satisfied |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Decisions and tradeoffs section |
| Review / pressure pass | yes | Run selected reviewer/lens | Agent-native review plus structured autoreview |
| Review findings closure | yes | Fix or explicitly reject findings | Media finding rejected with source and built declaration proof |
| External-source audit | no | Cite external sources or record N/A | N/A: local source settles the contract |
| Implementation gates | yes | Close primary-template and touched-surface gates | Docs, browser, package/API, agent-native gates closed |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Complete below |
| Final lint | yes | Run scoped equivalent | Scoped Biome passed; root formatter avoided shared unrelated WIP |
| Output budget discipline | yes | Verify searches/output were bounded | Count-first AST and capped output used |
| Timed checkpoint | no | Record N/A | N/A: no duration requested |
| Goal plan complete | yes | Run goal checker | Checker run after this table |
| Docs source-backed claim audit | yes | Verify docs claims against current source | Docs owner audit and `www` typecheck passed |
| Docs links / routes / previews | yes | Verify docs references | `check:docs`, source parity, registry source passed |
| Docs MDX/content parser | yes | Run content parser | `pnpm --filter www build:source` passed |
| Plugin page specifics | yes | Apply docs-creator rules | Current-state authoring examples updated in API/guides/plugin pages |
| Browser interaction proof | yes | Exercise target route | Playground rendered; edit/undo passed |
| Browser console/network check | yes | Check logs and failed/HTTP >=400 requests | Empty before and after interaction |
| Browser final proof artifact | yes | Record route proof | URL, title, DOM snapshot, editor count, edit/undo result recorded |
| Public API / package boundary proof | yes | Audit exports and declarations | Barrels, package typechecks, media declaration build passed |
| Release artifact classification | yes | Classify public delta | Published package type API |
| Published package changeset | yes | Validate package changesets and forbidden minors | 57 changesets / 58 releases; zero forbidden minors |
| Registry changelog | no | Record N/A | N/A: registry only adopts package contracts |
| No release artifact | no | Record N/A | N/A: published type API changed |
| Package typecheck/build/test | yes | Run owning checks | 24 package typechecks/tests plus full `www` typecheck passed |
| Barrel/export generation | yes | Run `pnpm brl` | 55/55 barrel tasks passed |
| Agent source / generated sync | yes | Run `pnpm install` and verify mirrors | Exact source/mirror text verified |
| Agent action discoverability | yes | Audit skill/rule route | best-api, plate-next, plate-plugin-creator all carry the rule |
| Agent-native review | yes | Load reviewer and close findings | Reviewer loaded; no remaining finding |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | prompt captured; source manifest built | complete |
| Current-state map | done | 53 owners / 21 consumers | complete |
| Options and recommendation | done | explicit-state hard cut accepted | complete |
| Review / pressure pass | done | agent-native plus autoreview | complete |
| Implementation or plan artifact | done | owners/adoption/docs/rules/changesets migrated | complete |
| Verification | done | package/app/docs/browser/export proof green | complete |
| Closeout | complete | goal checker next | final response |

Findings:
- Source audit found 210 production `createBasePlugin` /
  `createPlatePlugin` constructors and 53 direct state-owning declarations.
- Twenty-two `.configure({ initialState })` sites are consumer overrides, not
  state owners; one weak override in the suggestion registry is also excluded.
- Seventeen owners use assertions, two use `satisfies`, three registry owners
  confuse widening with configuration, and the remaining owners still need an
  explicit exported/local named contract under the accepted no-inference rule.
- `list-classic` is included because the user's explicit `go all` overrides the
  normal maintenance-only exclusion for this bounded type migration.

Decisions and tradeoffs:
- Require a named `*PluginState` for every state owner; export it whenever the
  descriptor is exported, keep it local only for private app/benchmark plugins.
- Use `const initialState: FooPluginState` for static defaults and an explicit
  `(): FooPluginState =>` factory for editor-derived defaults.
- Keep consumer `.configure({ initialState })` and weak peer overrides inline
  because they do not establish a state contract.
- Convert registry `.extend({ initialState })` to `.configure()` when it only
  overrides an existing state; keep `.extend()` only when it genuinely adds
  state and give that addition an explicit contract.
- Reject `as`, `satisfies`, inferred inline owner state, compatibility aliases,
  and an enforcement DSL. Durable doctrine plus a final AST audit is enough.

Implementation notes:
- Migrated all 53 production state owners to named contracts. Package
  descriptors export the contract; private app/benchmark owners keep a local
  named contract.
- Required every field supplied by an owner default; optional fields now mean
  a genuinely absent capability rather than "the default object happened to
  omit it."
- Kept all 21 production `.configure({ initialState })` consumer overrides
  partial and inline.
- Moved selection-area configuration types from the internal barrel to
  `packages/selection/src/lib/selectionAreaTypes.ts`, preventing exported
  `BlockSelectionPluginState` from leaking an `/internal` type.
- Widened only the legacy list demo's final mixed plugin array to
  `BasePluginInput[]`; individual plugin descriptors and their state contracts
  remain exact.
- Updated public docs, registry examples, Vision, the best-api/plate-next/
  plate-plugin-creator source rules, generated skill mirrors, package barrels,
  and package changesets. No compatibility aliases remain.

Review fixes:
- Semantic audit found defaulted properties that were still optional in
  Copilot, Indent, DOM, NodeId, AI chat, Emoji, Mention, Footnote, and Slash
  state contracts. Made those properties required and kept only consumer
  override inputs partial.
- Declaration typecheck found a public AI state depending on
  `@platejs/selection/internal`; publicized the selection-area types at their
  owning package boundary.
- `www` found an excessive-instantiation regression in the legacy list demo.
  Two covariant `PlatePlugin` array attempts were invalid; `BasePluginInput[]`
  is the correct application assembly boundary and the full app typecheck
  passes.
- Agent-native review found the best-api source rule too implicit. Added the
  complete no-inference/export/partial-consumer rule and regenerated its skill
  mirror.
- Structured autoreview reported that `MediaPluginState` was internal-only.
  Rejected: `media/types.ts` explicitly re-exports it, both public barrels
  expose that file, and the built `dist/index.d.ts` exports
  `type MediaPluginState`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| TypeScript compiler API script loaded TS7 version-only entry | 1 | Use the installed Babel parser for a read-only AST audit | Exact 53/21/0 audit passed |
| `PlatePlugin[]` / `PlatePlugins` widening rejected invariant callback types | 2 | Use the builder's accepted `BasePluginInput[]` boundary | `www` typecheck passed |
| Initial Browser navigation exceeded the first-compile timeout | 1 | Reuse the same tab after Next completed compilation | Route, editor, edit/undo, logs, and network passed |

Verification evidence:
- AST production audit: 53 owners, 21 consumer overrides, zero untyped owners.
- Optional-default AST audit: zero defaulted optional fields.
- Old-name/assertion audit: zero stale state names and zero owner
  `as`/`satisfies` state contracts.
- Package proof: all 24 affected package typechecks and tests passed; package
  tests reported 24/24 successful.
- App/docs proof: `pnpm --filter www typecheck`,
  `pnpm --filter www build:source`, `pnpm --filter www check:docs`, docs source
  parity, and registry source checks passed.
- Export/release proof: `pnpm brl` passed; `pnpm changeset status` reported 57
  valid changesets / 58 releases and zero forbidden minor releases.
- Lint: scoped Biome covered the 61 task source files, then the final
  list-classic demo; both passed. Root `pnpm lint:fix` was intentionally not
  used because the shared checkout contains unrelated WIP.
- Browser: `http://localhost:3000/blocks/playground` rendered one
  `contenteditable` editor, edit/undo succeeded, and console plus CDP network
  failure/HTTP >=400 checks were empty.
- Agent-native: `pnpm install` regenerated all mirrors; exact source/mirror
  `rg` checks passed for best-api, plate-next, and plate-plugin-creator.

Final handoff contract:
- Recommendation: ship the explicit-state hard cut as the sole authoring
  contract.
- Confidence: high.
- Evidence: exact source audits, package/app/docs checks, public declaration
  proof, browser smoke, changeset validation, and final review.
- Tests / commands: see verification evidence.
- Browser proof: playground render plus edit/undo; no console/network failures.
- PR / tracker: N/A; none requested.
- Caveats: none in task scope.
- Next owner: user/maintainer may commit the current shared checkout when ready.

Timeline:
- 2026-07-27T14:46:23.428Z Major-task goal plan created.
- 2026-07-27 Source audit reconciled all 53 state owners and accepted the
  explicit-state hard cut.
- 2026-07-27 Implementation, adoption, package/app/docs proof, Browser proof,
  and agent-native source/mirror review completed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final structured review and checker closeout |
| Where am I going? | Verified handoff |
| What is the goal? | Export explicit `*PluginState` contracts for every production owner |
| What have I learned? | 53 owners, 21 partial consumers; public state types must not leak internal package types |
| What have I done? | Migrated owners, adoption, docs, rules, release notes, package/app/browser proof |

Open risks:
- None in scope.
