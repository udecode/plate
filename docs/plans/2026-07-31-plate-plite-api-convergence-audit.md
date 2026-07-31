# Plate Plite API convergence audit

Objective:
Audit Plate/Plite plugin-extension API drift; done when every public shape has a source-backed winner and ranked adoption packet; plan docs/plans/2026-07-31-plate-plite-api-convergence-audit.md.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-07-31-plate-plite-api-convergence-audit.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Major source:
- type: user-directed local architecture/API audit
- id / link: current task prompt; no tracker
- title: Plate versus Plite API convergence
- decision to make: choose one canonical naming and authoring grammar for every
  overlapping Plate plugin and Plite extension shape, explicitly including
  `create*Plugin` versus `define*Extension`, without erasing honest layer jobs
- decision criteria: truthful ownership, smallest vocabulary, exact inference,
  discoverability, layer consistency, deletion value, and adoption feasibility

Major lane:
- lane: framework comparison plus public API
- output type: exhaustive planning-only audit, strict concept matrix, ideal code
  shapes, one winner, and dependency-ordered adoption packets
- implementation expected: no; stop after decision-ready audit and request acceptance
- affected packages / surfaces: `packages/plite*`, `packages/core`, `packages/plate`,
  their public exports/types/builders/portals/React adapters, current docs,
  Vision, source rules, representative feature packages and registry callers
- dominant risk: cosmetic symmetry that flattens a real substrate/framework
  distinction or silently breaks inference

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
- initial confidence score: N/A: strict coverage counts replace a subjective score
- improvement loop: close manifest and matrix gaps until zero unexplained public shapes
- final score / loop closure: N/A: validator and decision rows are the closure gate

Completion threshold:
- A bounded public-surface manifest maps every exported Plate plugin and Plite
  extension factory, descriptor noun, authoring stage, root field, composition
  primitive, portal/editor surface, definition extractor, adapter, and
  representative current caller to exactly one atomic concept or exclusion.
- The symmetric concept matrix has exactly one row per manifest concept,
  validates mechanically, and leaves zero unexplained, grouped, duplicate,
  unknown, or unresolved rows.
- Every drift has a source-backed `keep`, `hard-cut`, `rename`, `move`, or
  `rearchitect` decision, one winner, exact before/final TypeScript call shapes,
  deletion/adoption impact, proof obligations, and `plate-plan`/`plite-plan`
  ownership.
- The final recommendation explicitly settles consistent naming and patterns,
  including the factory verb, without compatibility aliases.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-31-plate-plite-api-convergence-audit.md`
  passes.

Verification surface:
- Coverage manifest and source-unit counts under
  `docs/plans/artifacts/plate-plite-api-convergence-audit/`.
- Strict source-to-contract matrix validated with
  `.agents/rules/editor-audit/scripts/validate-concept-matrix.mjs`.
- Exact public export/type/factory/caller scans across the named packages and
  current docs, excluding generated/build/history trees.
- `best-api` ideal-call-site and reality passes plus one adversarial review pass.
- Mechanical goal check over this plan.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Do not execute implementation unless this major goal explicitly includes it.
- Pick one winner; do not preserve parallel spellings for compatibility.
- Do not force identical names when Plate adds an honest framework-only job.
- Preserve hard runtime, schema, transaction, React/static, and type-inference laws.
- Current source outranks memory and prior plans; reconcile prior candidates only
  after independently mapping live source.

Boundaries:
- Source of truth: root/detail Vision, live public source/exports/types/tests/docs
  in the named packages, representative production callers, then prior audits.
- Allowed edit scope: this goal plan and audit artifacts only; no `packages/**`,
  `apps/**`, `content/**`, rules, skills, or public docs implementation edits.
- External sources: N/A unless a narrow unresolved TypeScript/API precedent
  cannot be settled locally; no external editor comparison requested.
- Browser surface: N/A: analytical public-shape audit with no runtime/UI change.
- Tracker sync: N/A: no issue or PR source.
- Non-goals: implementation, compatibility design, migration shims, runtime
  behavior redesign unrelated to extension/plugin authoring, and generated output.

Output budget strategy:
- Enumerate files/symbols/counts before reading bodies. Scope scans to public
  package roots, source docs, and representative feature callers; exclude
  `node_modules`, `dist`, generated registry output, templates, changelogs,
  historical plans, test fixtures, and vendored trees unless a row needs them.
  Store exhaustive manifests/matrices as artifacts and inspect bounded slices;
  cap ordinary command output to a few thousand tokens.

Blocked condition:
- Block only if live public declarations cannot be resolved from the checkout
  after three distinct bounded source/export/type attempts, or a genuinely
  product-level distinction has two equally valid targets that source cannot
  settle. Otherwise choose and document the winner.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: implementation only after user acceptance
- goal_status: complete

Current verdict:
- verdict: Plite wins shared naming and native authoring; Plate keeps only
  framework-only jobs
- confidence: high; 18/18 manifest concepts validate with zero integrity gaps
- next owner: user acceptance, then `plite-plan` for substrate cuts and
  `plate-plan` for Core/package adoption
- reason: live declarations show one coherent field model but five material
  vocabulary/alternative debts; exact code targets are recorded in the audit
  artifacts

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-31-plate-plite-api-convergence-audit.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exhaustiveness, consistent names/patterns, `create*Plugin` versus `defineExtension`, and one winner are explicit checkpoints above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `major-task` loaded | yes | Full `.agents/skills/major-task/SKILL.md` read |
| Active goal checked or created | yes | Goal created with this plan path |
| Source of truth read before analysis | yes | Root Vision, common, Plate, Plite, `best-api`, `editor-audit`, feature-matrix, relevant memory lead, then live declarations read |
| Major lane selected | yes | Framework comparison plus public API, analytical only |
| Decision criteria stated | yes | Ownership, vocabulary, inference, discovery, deletion value, adoption |
| Existing repo patterns / prior decisions checked | yes | Current Vision and prior best-api audit lead recorded; live source will decide disposition |
| Helper stack selected | yes | `autogoal` lifecycle, `major-task` artifact, `editor-audit` coverage, `best-api` decision |
| External research decision recorded | no | N/A: local Plate/Plite source is authoritative |
| Implementation expectation recorded | yes | Planning-only; no product source edits |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2` current checkout |
| Branch / PR expectation decided | no | N/A: analytical task; no PR or branch mutation |
| Output budget strategy recorded | yes | Count-first bounded scans and artifacted exhaustive results above |
| Package/API pack selected | yes | Public package naming and boundary audit requires package-api rows |
| Public surface or package boundary identified | yes | Plite extension substrate versus Core/Base/Plate plugin framework |
| Release artifact path selected | no | N/A: planning-only audit creates no published user-visible delta |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no package implementation or release delta |
| Barrel/export impact decision recorded | no | N/A: no exported files change |

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
      benchmark, or plan. Evidence: `source-manifest.md` closes every public
      factory, field, stage, portal, constructor, adapter, and composition token.
- [x] Existing repo patterns, prior decisions, and nearby implementation
      constraints are recorded before external research. Evidence: Vision and
      `docs/analysis/best-api-review.md:64` were reconciled after the live map.
- [x] External docs or source are used only where repo evidence does not settle
      the question, or N/A reason is recorded. N/A: local Plate/Plite source is
      the product authority and settled every row.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded in `recommendation.md` and the strict concept matrix.
- [x] Facts, inference, and recommendation are separated across the source
      manifest, matrix comparisons, and final recommendation.
- [x] Review or pressure lenses are selected and completed, or marked N/A with
      reason. Completed one adversarial job/ownership pass over factory names,
      parser/codecs, editor enhancement, and weak overrides.
- [x] If implementation happens, touched-surface packs cover docs, browser,
      package/API, or agent-native surfaces as needed. N/A: planning-only; the
      implementation proof packet is specified instead.
- [x] Workspace authority recorded: all source and validation evidence is owned
      by `/Users/zbeyens/git/plate-2`.
- [x] Output budget discipline recorded and followed: broad scans were counted,
      capped, and reduced into the source manifest; one early combined source
      read truncated and all later reads were split into bounded slices.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence. Accepted: keep bounded `override.plugins` because SingleLine,
      SingleBlock, and List prove an optional-peer job; retained the parser cut
      because it still duplicates the format extension channel.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: this task changes
      planning artifacts only, so no package changeset or registry changelog.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules. N/A: no implementation or published delta.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: no registry edit.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`: planning artifacts only.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes: no aliases; five material packets are ranked.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason. N/A: no package source changed; future proof contracts are specified.
- [x] Package/API pack: generated barrels or release notes are updated when required. N/A: no exported file changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Validate exactly one matrix row per manifest concept | 18/18 rows; zero missing, duplicate, grouped, unknown, canned, prior-candidate, or unresolved gaps |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | `source-manifest.md` maps all bounded public shapes and adoption counts |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | `recommendation.md` chooses one verb law, keeps honest layer jobs, and ranks every debt |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Exact current/final code and rejection reasons are in `recommendation.md` |
| Review / pressure pass | yes | Run selected reviewer/lens or record N/A with reason | Adversarial ownership pass reversed the proposed `override.plugins` cut |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | Matrix revalidated after the accepted correction |
| External-source audit | no | Cite official/local clone/external sources when used, or record N/A | N/A: local source is authoritative and no external claims were needed |
| Implementation gates | no | If code changed, close primary-template and touched-surface gates; otherwise N/A | N/A: only planning artifacts changed |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Completed below |
| Final lint | yes | Run scoped equivalent when files changed | `git diff --check --` on this plan and its artifacts passes |
| Output budget discipline | yes | Verify broad output was bounded or record recovery | One early combined read truncated; subsequent reads were split and the final source census is artifacted |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run the goal checker | `check-complete.mjs` passes for this plan |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Manifest covers Plite root, Core root/react, feature factories, docs, and representative consumers |
| Release artifact classification | yes | Classify the current task delta | Planning-only internal audit artifacts; no published package or registry delta |
| Published package changeset | no | Add only for implementation | N/A: no package source/API changed in this task |
| Registry changelog | no | Add only for registry implementation | N/A: no registry edit |
| No release artifact | yes | Record exact reason | Planning-only internal artifacts have no user-visible package delta |
| Package typecheck/build/test | no | Run for implementation or record N/A | N/A: no package source changed; future packet proofs are explicit |
| Barrel/export generation | no | Run when exports change | N/A: no exported source file changed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Prompt, skills, Vision, prior memory lead, goal, and plan contract read | current-state map |
| Current-state map | complete | `source-manifest.md` | options |
| Options and recommendation | complete | `recommendation.md` | review |
| Review / pressure pass | complete | Weak-override objection accepted; parser decision reaffirmed | implementation decision |
| Implementation or plan artifact | complete | Planning-only artifacts; no source implementation | verification |
| Verification | complete | Strict 18-row validator plus scoped diff check | closeout |
| Closeout | complete | Goal checker and final contract | final response |

Findings:
- Durable doctrine already says Plate is an opinionated layer lowered onto
  Plite once, but generic descriptor factories still mix `define` and `create`.
- The public grammar contains three different `extend` jobs: plugin definition
  widening, live extension installation, and public editor enhancement.
- Seven configured extension factories use two naming styles; three
  `create*Extension` outliers conflict with established noun factories.
- All 19 native Plite fields already live flat at the Plate root. The remaining
  Plate-only fields mostly represent honest framework jobs.
- `parsers.html` is the remaining parallel serialization channel beside
  schema-aware Plate codecs and Plite host codecs.
- `override.plugins` looked deletable but production callers prove a distinct
  optional-peer adaptation job; its current restricted contract is justified.

Decisions and tradeoffs:
- Plite wins shared names and native field semantics. Plate keeps its noun and
  framework-only fields instead of cosmetically renaming everything.
- Hard-cut generic factories to `defineExtension`, `defineBasePlugin`, and
  `definePlatePlugin`; keep stateful editor/runtime constructors on `create*`.
- Hard-cut live `editor.extend` to `editor.install`; keep transactional slot
  `reconfigure` and Plate descriptor `.extend()`.
- Keep noun configured factories and rename only `createYjsExtension`,
  `createTriggerComboboxExtension`, and
  `createExcludeDiffFragmentExtension` to capability nouns.
- Remove public `extendBaseEditor`/`extendPlateEditor`; constructors already own
  the existing-editor input.
- Fold `parsers.html` into `codecs`; keep restricted `override.plugins`.
- No compatibility aliases: they would preserve the exact alternatives this
  audit is removing.

Implementation notes:
- N/A: user requested comparison and winner; no product source was edited.
- Dependency-ordered implementation packets and proof obligations are in
  `recommendation.md`.

Review fixes:
- Accepted: retracted the initial `override.plugins` cut after reading
  `SingleLinePlugin`, `SingleBlockPlugin`, `BaseListPlugin`, and the bounded
  Core resolver. The matrix moved from material rearchitecture to keep.
- Reaffirmed: `parsers.html` remains a real convergence target because its four
  production owners feed a parallel HTML ingress registry.
- Reaffirmed: public editor enhancement functions have no non-test production
  callers, while both constructors already accept `editor`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Combined source read exceeded the direct output budget | 1 | Split PlatePlugin, factory, and validator reads into bounded slices | Resolved; final manifest is count-first and bounded |
| TypeScript 7 modular package did not expose the old compiler AST API | 1 | Use exact source slices and public type declarations instead of an AST shortcut | Resolved; no source fact depends on the failed shortcut |

Verification evidence:
- From `/Users/zbeyens/git/plate-2`:
  - `node .agents/rules/editor-audit/scripts/validate-concept-matrix.mjs --manifest docs/plans/artifacts/plate-plite-api-convergence-audit/concept-manifest.json --ledger docs/plans/artifacts/plate-plite-api-convergence-audit/concept-matrix.md`
    passes 18 concepts with zero integrity gaps; dispositions are 2 P0, 3 P1,
    and 13 keeps.
  - `git diff --check -- docs/plans/2026-07-31-plate-plite-api-convergence-audit.md docs/plans/artifacts/plate-plite-api-convergence-audit`
    passes.
  - `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-31-plate-plite-api-convergence-audit.md`
    passes.

Final handoff contract:
- Recommendation: adopt the verb law and exact target code in
  `recommendation.md`; Plite wins shared grammar, Plate keeps honest extras.
- Confidence: high; every bounded public shape maps to one of 18 validated rows.
- Evidence: source manifest, strict matrix, current/final code comparison,
  production caller counts, and adversarial correction.
- Tests / commands: strict matrix validator, scoped diff check, and goal checker.
- Browser proof: N/A for planning-only artifacts; mandatory during adoption.
- PR / tracker: N/A; none requested and no public mutation occurred.
- Caveats: parser-to-codec convergence must preserve raw-data, query, and
  post-fragment ordering; factory hard cuts have a large docs/caller blast radius.
- Next owner: user acceptance, then `plite-plan` for `defineExtension` and
  `install`, followed by `plate-plan` for factories, packages, docs, and codecs.

Timeline:
- 2026-07-31T20:27:13.498Z Major-task goal plan created.
- 2026-07-31: Loaded `autogoal`, `major-task`, `editor-audit`, strict matrix,
  `best-api`, root/detail Vision, and prior audit memory lead; captured every
  user requirement before broad source exploration.
- 2026-07-31: Closed the public source manifest, validated 18/18 concepts,
  completed the adversarial pass, and froze the decision-ready recommendation.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Planning-only closeout |
| Where am I going? | User acceptance, then layer-owned implementation plans |
| What is the goal? | Exhaustively settle one canonical plugin/extension API vocabulary and pattern set |
| What have I learned? | Shared field semantics are mostly coherent; naming and three alternative entrypoints are the real debt |
| What have I done? | Mapped all bounded public shapes, picked one winner, ranked five material packets, and validated 18/18 rows |

Open risks:
- `parsers.html` convergence is a rearchitecture, not a rename; raw-data and
  fragment ordering must be proved before deletion.
- The generic factory hard cut touches hundreds of source/docs call sites and
  must ship atomically with barrels and release prose.
- The noun-factory rule is intentionally different from generic `define*`:
  capability factories configure known descriptors, while `define*` declares a
  new descriptor/token from an author object.
