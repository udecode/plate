# Wordgard Full Architecture Audit

Objective:
Harden the Wordgard architecture audit with `best-api`; done when every public
API decision has ideal call sites, adoption/deletion proof, validators and
`check-complete` pass; plan
docs/plans/2026-07-23-wordgard-full-architecture-audit.md.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-07-23-wordgard-full-architecture-audit.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Mode:
- `deep`

Completion threshold:
- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.

Verification surface:
- A machine-readable coverage manifest maps every relevant `../wordgard`
  architecture item to a concept ID or evidenced exclusion.
- The master concept ledger resolves every concept, score, owner, route,
  adoption, deletion, proof, risk, and dependency decision from current source.
- Mechanical reconciliation proves zero unmapped relevant exports, zero
  unmapped meaningful private mechanisms, zero unscored rows, zero unresolved
  owners/routes/decisions, and zero incomplete change dossiers.
- Fresh bounded audits cover corresponding live Plite and Plate owners and
  transitive consumers.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-07-23-wordgard-full-architecture-audit.md` passes after final
  evidence is recorded.

Constraints:
- Planning only until the user explicitly accepts this exact plan and invokes
  `plite-plan` against it.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Use Plite Plan as primary workflow owner and Plate Plan as mandatory
  product-layer and ownership authority.
- Choose the best coherent architecture first. Breaking scope and migration
  cost are tie-breakers only between otherwise equivalent designs.
- Treat Wordgard as the strongest contemporary reference, not automatic truth.
- Preserve Plite/Plate mechanisms only when current live evidence proves them
  genuinely better for the full TARGET.
- Current source overrides old plans, comparison ledgers, migration claims,
  completion reports, and contradictory docs.
- Every material current-state claim cites exact live Wordgard and current
  Plite/Plate source; absence claims use a bounded source audit.
- Do not edit Plite, Plate, Wordgard, test, benchmark, docs/reference, or
  generated source during this planning run. Planning artifacts are the only
  writable scope.
- Stop after the source-backed plan, closure audit, and checker pass. Do not
  begin an execution packet.

Boundaries:
- In scope: the complete editor architecture represented by `../wordgard` and
  every corresponding live Plite/Plate owner or transitive consumer whose
  behavior, types, configuration, lifecycle, persistence, history,
  collaboration, rendering, browser behavior, performance, ownership, docs, or
  downstream callers could change.
- Source owners: Wordgard packages and architecture-teaching examples; Plite
  model/runtime/operations/transactions/selection/history/collaboration/
  persistence/codecs/DOM/input/React/browser proof; Plate core/plugins/kits/
  registry/docs/examples/product codecs and workflows.
- Non-goals: generic unrelated repository review, unrelated tooling/CI/assets,
  implementation, compatibility design, migration-minimizing compromise, and
  trusting historical artifacts as current evidence.
- Direct Plate/collaboration adoption owners: identify per concept and packet;
  mark genuinely unaffected owners with an architectural reason.
- Coverage artifact:
  `docs/plans/artifacts/wordgard-full-architecture-audit/coverage-manifest.json`.
  It maps evidence to concept IDs and exclusions only; it contains no duplicate
  architectural verdicts.

Output budget strategy:
- Inventory filenames/counts first. Exclude dependencies, generated output,
  build output, coverage, caches, assets, binaries, and VCS internals unless
  they encode a named contract.
- Partition reads by Wordgard owner and concept lane; cap terminal output and
  store exhaustive mappings in the coverage artifact instead of streaming
  broad dumps.
- Follow only corresponding Plite/Plate owners and transitive consumers
  implicated by a concept. Use exact symbols/imports and bounded semantic
  ranges for evidence.

Blocked condition:
- Block only if `../wordgard` or a required live owner is unavailable, a
  material mechanism cannot be read or classified after bounded alternative
  audits, or a decision-changing requirement is contradictory and cannot be
  resolved from source. Do not block while a focused source/proof move remains.

Plite Plan state:
- status: complete
- phase: handoff
- next: user-review
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Requirement contract R001-R058 below captures the original exhaustive audit plus the 2026-07-23 `best-api` hardening iteration. |
| Active goal and plan verified | yes | Active goal objective names this exact plan and the ideal-call-site/adoption/deletion/validator/checker threshold. |
| Current owners read | yes | Live doctrine, donor source, local owners, transitive consumers, and proof evidence are recorded below. |
| Mode and execution boundary resolved | yes | Deep, agent-led plan hardening; planning artifacts only; implementation requires explicit acceptance of this exact plan. |

Requirement contract:

| ID | Checkable requirement | Closure evidence |
| --- | --- | --- |
| R001 | Use `plite-plan --deep` as primary owner and `plate-plan --deep` simultaneously as mandatory product-layer/ownership authority. | Plan metadata, ownership rows, and packet routes name both without competing plans. |
| R002 | Maintain exactly one autogoal, one execution-ready plan at the prescribed path, one concept ledger, one coverage manifest, and one dependency-ordered backlog. | Artifact inventory and closure counts show one of each; no duplicate decision ledger exists. |
| R003 | Do not implement source; write only owned planning/coverage artifacts; stop after source-backed closure audit and passing checker. | Bounded writable-scope audit and final checker evidence. |
| R004 | TARGET is every relevant Wordgard editor mechanism plus its complete dependency graph through representation, semantics, APIs, private runtime, configuration/compilation, transactions/changes, selection, history/collaboration, persistence/codecs, DOM/input/React/rendering, consumers/integrations, proof, performance, ownership, adoption, and deletion. | Coverage manifest categories and zero-unmapped reconciliation. |
| R005 | Design the coherent Plite/Plate architecture one would build from scratch today, at least as precise, composable, typed, performant, ergonomic, and coherent as Wordgard where relevant. | Ideal architecture, target score vectors, gain rows, and critical-regression audit. |
| R006 | Choose architectural value first; preserve a current API only when replacement has no material overall gain across semantics, composition, types, performance, ownership, lifecycle, failure isolation, and human/application/extension-author/agent DX. | Every keep/change dossier includes material-value reasoning. |
| R007 | Break size and migration cost are tie-breakers only; never compromise a superior target to preserve callers. | Rejected alternatives and value ranking. |
| R008 | No compatibility aliases, dual APIs, permanent bridges, runtime shims, legacy names, or local patches that evade the owning abstraction. | Deletion ledger and bridge count/gates. |
| R009 | Apply reference hierarchy: best actual target, Wordgard baseline, demonstrably superior Plite/Plate mechanisms, Slate/others only as behavior/ergonomics/provenance, migration cost last. | Decision methodology and per-row reference disposition. |
| R010 | Reject Wordgard mechanisms that regress JSON-native data, structural typing, extensibility, identity independence, multi-root fitness, correct DOM layering, Plate, collaboration, React, browser behavior, or product breadth. | Keep/surpass/reject dossiers answer every applicable concern. |
| R011 | Treat current source as authority; do not trust old plans, ledgers, migration/completion claims, or contradictory docs. Reopen allegedly completed work when live source remains weaker. | Fresh evidence timestamps and bounded live-source citations. |
| R012 | Cite exact current source from both repositories for every material claim; prove absence by bounded source audit. | Evidence columns and absence-audit records. |
| R013 | Use an atomic mechanism/runtime responsibility as the scoring unit: independently understandable, scoreable, and ownable; broader than a trivial method and narrower than a vague subsystem. | Concept granularity review. |
| R014 | Split concepts when semantics, public API, representation, algorithm, mapping, lifecycle, cache/invalidation, extension/configuration/serialization rule, runtime cost, owner, proof, or verdict can vary independently. | Coverage-to-ledger reconciliation and split rationale. |
| R015 | Do not score trivial getters/re-exports/forwarders/semantic-free aliases; map them to an owner concept. Give independently changeable semantic/ordering/normalization/fitting/correction/mapping/caching/invalidation/persistence/lifecycle helpers their own rows. | Manifest item kinds and granularity audit. |
| R016 | Manifest every relevant Wordgard package, source file, public export/type, meaningful private type/algorithm, configuration mechanism, runtime state owner, test family, generated law, fuzz/property suite, benchmark, codec, DOM/view integration, architecture-teaching example, and persistence format. | Machine-readable manifest counts by item kind. |
| R017 | Map each relevant item to one or more scored concept IDs or exclude it with exact evidence and reason. | Mechanical zero-unmapped result and exclusions table. |
| R018 | Exclude tooling, CI, assets, demos, or generated output only when they encode no public/runtime/proof/performance/architecture contract; record every exclusion. | Exclusion categories and evidence. |
| R019 | Follow corresponding Plite/Plate owners and transitive consumers wherever behavior, types, configuration, lifecycle, persistence, history, collaboration, rendering, browser behavior, performance, ownership, docs, or downstream callers could change; do not drift into unrelated generic review. | Per-concept adoption graph and boundary audit. |
| R020 | Evaluate every applicable mechanism across every requested conceptual/data/internal/CRUD/composition/mapping/rebasing/fitting/correction/invariant/default/validation/equality/merge/serialization/type/structural/extension/configuration/compilation/cache/invalidation/precedence/conflict/reconfiguration/consequence/host/ownership/failure/runtime/memory/locality/DX/proof/benchmark/release/adoption/deletion lane. | Per-concept lane audit; N/A only with architectural reason; required-but-absent capability scores 0. |
| R021 | Run the full suspicion audit per mechanism: owner, leaked internals, derivable caller input, over-unified/split concepts, permissive/implicit/mutable/order-dependent config, implementation-driven DX, hidden Plite gaps, wrong Plate/Plite ownership, large-doc fitness, history/serialization/collaboration/replay/persistence fitness, transactional reconfiguration, React/DOM/input/browser/codec coherence, and deletions unlocked. | Concept dossier suspicion section or compact keyed answers. |
| R022 | Score Wordgard, current Plite, current Plate, current combined Plite+Plate, and proposed target independently. | Every scored row contains all five score fields. |
| R023 | Use eight 0-5 dimensions: semantics, composition, types, runtime, lifecycle, host fitness, ownership/DX, and proof, with the requested scale; normalize only genuine N/A. | Score schema, validation, and per-row vectors/totals. |
| R024 | Per concept report every score vector/normalized total, target gain over combined current, and evidence/reasoning for every score. | Ledger score cells and dossiers. |
| R025 | Do not let positive totals override a critical regression in semantics, types, runtime, collaboration, persistence, or browser correctness. | Critical-regression gate per changed row. |
| R026 | Classify current combined architecture vs Wordgard as superior, inferior, equivalent, or different tradeoff; keep comparison independent from decision. | Comparison and verdict columns. |
| R027 | Assign Wordgard disposition adopt/surpass/reject/defer and local verdict keep/cut/rearchitect/rename/move/bridge/defer/gate. | Resolved disposition/verdict columns. |
| R028 | Every defer names missing evidence, why it changes the decision, next owner, and exact closure condition. | Defer dossier audit. |
| R029 | Every concept/change names current owner, target owner, decision owner, execution skill, upstream dependencies, downstream adoption owners, and dependent packets. | Ownership/routing columns and dossiers. |
| R030 | Route generic substrate to Plite Plan; product plugins/workflows/kits/registry/product schemas/application codecs/UI/docs to Plate Plan; use linked Plite-to-Plate or Plate-discovery-to-Plite-to-Plate chains where appropriate; dependency never transfers ownership. | Packet routes and linked-chain count. |
| R031 | Wordgard package placement is evidence, not target ownership; move product policy upward and genuinely generic substrate downward; split mixed generic/product mechanisms. | Ownership dossiers and split concepts. |
| R032 | Keep one exhaustive master ledger with the full requested evidence, scores, comparison, proposal, owners/routes, dependency, disposition/verdict, adoption/deletion/proof/risk fields; do not duplicate decisions elsewhere. | Ledger schema and artifact inventory. |
| R033 | Split ledger rows when submechanisms have distinct semantics, scores, owners, proposals, routing, or verdicts. | Granularity review. |
| R034 | Every change-worthy row has complete current Wordgard, current Plite, current Plate/evidenced-absence, proposed architecture, routing, adoption, deletion, and proof dossier. | Mechanical dossier completeness zeros. |
| R035 | Proposed dossiers show realistic public/internal TypeScript shapes and simple, advanced, extension-author, and host usage when applicable, plus compiled representation, invariants, lifecycle/reconfiguration, runtime characteristics, target score, and score rationale. | Dossier audit. |
| R036 | Adoption/deletion dossiers name breaks and affected Plite, Plate, React/DOM, history/collaboration/Yjs, codecs, docs/examples/fixtures, callers, exports, helpers/bridges/normalizers/duplicate owners/tests, all proof classes, and hard deletion gate. | Dossier and packet audits. |
| R037 | Every keep/surpass/reject row explains why Wordgard does not justify change, whether Plite/Plate is genuinely stronger or merely broader/opinionated, whether Wordgard benefits from narrower scope, and reversal evidence. | Keep/surpass/reject dossier audit. |
| R038 | Describe the ideal final architecture coherently across all requested public/internal/compiled/invariant/ownership/lifecycle/transaction/selection/mapping/persistence/history/collaboration/React/DOM/input/browser/codec/cache/failure/product-extension/proof concerns. | Ideal architecture section. |
| R039 | Explain precisely how the target surpasses Wordgard rather than merely matching it. | Target-vs-reference synthesis. |
| R040 | Produce a complete architecture-value ranking of every worthwhile change based on long-term value, not ease. | Ranked value table with reasons. |
| R041 | Produce a separate dependency execution order and explain every meaningful divergence from value ranking. | Dependency backlog and divergence notes. |
| R042 | Every vertical packet includes concept IDs, decision/execution/final owners, prerequisites/dependents, entry, exact scope, current/target shape, breaks, all adoption, deletion, focused/generated/property/fuzz/browser/benchmark proof as applicable, exit, hard deletion gate, and rollback answer where meaningful. | Packet completeness audit. |
| R043 | Every new abstraction replaces/deletes a named responsibility; any delayed deletion names private temporary owner, reason, dependent packet, and hard removal gate. | Packet deletion audit. |
| R044 | Adoption audit explicitly covers affected Plite packages, Plite React/DOM, Plate core/plugins/kits/registry, apps/www, apps/plite, history, Yjs, codecs, docs, examples, fixtures, tests, benchmarks, exports, and downstream callers; unaffected owners get reasons. | Adoption matrix. |
| R045 | Deletion audit enumerates APIs, aliases, types, helpers, wrappers, bridges, compatibility, normalizers, duplicate representations/caches/owners, lowering switches, special cases, runtime state, formats, replaced-architecture tests, docs, and examples, each linked to replacement concept, packet, and gate. | Deletion table. |
| R046 | Proof design assigns focused unit/integration, algebraic/model/property/fuzz, round-trip, concurrent transform/history/collaboration, browser/IME/platform, large-doc/memory/locality benchmark, and release proof only where claimed; N/A requires reason. | Proof matrix. |
| R047 | Closure reports totals for Wordgard packages, architecture files, exports, private mechanisms, proof families, concepts/scored rows, every disposition/verdict, packet/chain type, and exclusions. | Closure audit counts. |
| R048 | Closure mechanically proves: unmapped relevant exports 0; unmapped meaningful private mechanisms 0; unscored rows 0; unresolved owners 0; unresolved routes 0; all seven requested missing-dossier categories 0; unresolved decisions 0. | Reconciliation command/artifact evidence. |
| R049 | Final handoff states what Wordgard, Plite, and Plate are fundamentally better at and what only appears better because Wordgard is narrower. | Handoff items 1-4. |
| R050 | Final handoff includes the complete value ranking and dependency backlog. | Handoff items 5-6. |
| R051 | Final handoff enumerates every Plite Plan packet, Plate Plan packet, and linked cross-owner chain. | Handoff items 7-9. |
| R052 | Final handoff states largest hard cuts and final proposed public/internal architecture. | Handoff items 10-12. |
| R053 | Final handoff states total adoption/deletion impact and why no useful Wordgard mechanism remains unaccounted for. | Handoff items 13-14. |
| R054 | Planning evidence validates decisions; the plan names exact focused execution proof for changed behavior, browser semantics, and performance claims without running implementation gates now. | Proof matrix and packet exit gates. |
| R055 | High-risk model/runtime/normalization/selection/IME/DOM/React/history/collaboration/browser/generated-contract changes record at least three realistic failures, blast radius, hard-cut/rollback answer, and focused proof. | Risk register. |
| R056 | External reference conclusions record accepted/rejected mechanisms and local consequences; no generic editor-comparison thesis or bibliography-as-evidence. | Wordgard disposition dossiers and research notes. |
| R057 | The final plan has no decision-changing open question or runnable planning owner; `check-complete.mjs` passes after fresh verification and before handoff. | Final readiness audit and checker output. |
| R058 | Run a `best-api` two-pass hardening over every public API-affecting canonical outcome before layer planning: state the ideal normal, realistic customization, and justified escape call sites; then audit current public types/exports/docs/callers/implementation, reject unearned public machinery, preserve non-negotiable runtime laws, and fold the winning target plus break/adoption/proof owner back into this sole plan without implementation. | Best API review, public-surface coverage reconciliation, revised canonical outcomes/backlog, and fresh closure validation. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, deliverables, stop condition,
  verification surface, and success criteria are captured in R001-R058.
- [x] Current API, docs, tests, exports, and behavior claims cite live source.
- [x] All 181 concept rows resolve scores, owners, adoption, proof, risk, and
  verdict.
- [x] Public breaks and private replacement boundaries have complete adoption
  and deletion answers.
- [x] All 31 executable canonical packets and both no-execution outcomes are
  concrete.
- [x] Conditional work and all 14 handoff answers are resolved without a
  decision-changing open question.
- [x] Every public API-affecting canonical outcome is classified and covered by
  one `best-api` decision or an evidenced internal-only exclusion.
- [x] Every covered public decision shows the ideal common call site, a real
  customization path, and only a justified escape path; live exports, types,
  representative callers, docs, and implementation ownership are cited.
- [x] The revised target, rejected machinery, breaks, adoption, deletion,
  proof, and exact Plite/Plate next owner reconcile with the sole master ledger,
  ranking, and dependency backlog.
- [x] Fresh best-api coverage validation, closure reconciliation, and
  `check-complete.mjs` pass after the second iteration.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Close source, concept, route, dossier, and deletion accounting | Coverage is 119/119 files, 867/867 public declarations, 1,668/1,668 private declarations, and 181/181 scored concepts; all reconciliation zeros are recorded below. |
| Fresh source evidence | yes | Recheck every decision-changing owner from the current checkout | Seven bounded lane audits cite live Wordgard and Plite/Plate source inspected on 2026-07-23; the manifest maps every donor declaration. |
| Conditional risk and adoption | yes | Assign each accepted change its consumers, failure modes, proof, and stop gate | The 33-item packet map, 23-owner adoption audit, 40-family deletion audit, and risk/proof matrix resolve the triggered work. |
| Verification recorded | yes | Record fresh mechanical ledger, coverage, closure, and plan checks | Exact commands and outputs are in Verification evidence. |
| Handoff prepared | yes | Answer the 14 requested architecture and execution questions | “Final handoff answers” resolves items 1-14 and references the sole ranking and backlog. |
| Autoreview | no | Explain why implementation review does not apply | This run changes planning artifacts only. Independent lane synthesis plus mechanical source, score, route, and closure validation is the appropriate review boundary. |
| Goal plan complete | yes | Run the autogoal completion checker against this exact path | The final checker output is recorded in Verification evidence. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Current-source census, coverage manifest, doctrine, lane audits, transitive-owner reads, and current best-API call sites are recorded. | Decide |
| Decide | complete | All 33 canonical outcomes are classified; winning targets and rejected machinery are folded into the sole ledger/ranking/backlog. | Prove and hand off |
| Prove and hand off | complete | Best-API coverage, source ranges, adoption/deletion/proof, closure counts, and completion checker are green. | User review |

Decision brief:
- outcome: Keep Plite as the editor substrate and Plate as the product layer;
  adopt only Wordgard mechanisms that fix a proved current ownership or
  algorithm gap.
- chosen shape: readonly structural Plite values, one public
  `DocumentChange`, one Plite history owner, Yjs transport without undo,
  per-root Plite DOM runtime with private realm/input state, existing Plite
  React rendering without the preview classifier, inferred Plate feature
  updates and inline codecs, and one private Plate `TableGrid`.
- strongest rejected alternative: a Wordgard port. Its nominal, single-root,
  identity-sensitive model and coupled renderer lose persistence,
  collaboration, React, browser, and product breadth.
- consequence: 31 ranked changes enter the six-wave backlog; the existing DOM
  geometry API and localization proposal are resolved no-execution outcomes.

Decision ledger:
- The sole decision corpus is “Master concept ledger and source evidence”
  below: 181 scored rows partitioned by `DOC`, `STATE`, `HC`, `PRODUCT`,
  `TABLE`, `VIEW`, and `META`.
- “Cross-lane concept deduplication” is an ownership index over those rows,
  not a second decision ledger.

Execution slices:
- The sole executable backlog is “Dependency-ordered execution backlog.”
- “Packet alias reconciliation” maps all 36 lane aliases to 33 canonical
  items; the lane partitions contain the complete vertical dossiers.
- Execution is not authorized by this planning run.

Proof matrix:
- “Risk and proof matrix” assigns each change family its focused,
  algebraic/property/fuzz, round-trip, collaboration, browser/platform,
  performance/memory, and stop proof where applicable.
- Each lane dossier supplies the exact package, test owner, benchmark owner,
  and deletion gate. Planning proof is source/manifest reconciliation;
  runtime proof belongs to accepted execution packets.

Conditional evidence:
- High-risk scenarios: model, schema, selection, history, Yjs, DOM, IME,
  React, codec, table, browser, and generated-contract failures are resolved
  into concrete proof and stop gates in the risk matrix.
- External research: the named local `../wordgard` checkout is the reference.
  No web claim changes a decision; historical plans were search pointers only.
- Issue/PR provenance: not applicable because the request is source-backed
  architecture planning, not public queue work.
- Browser/benchmark/docs/release/behavior-law owners: every accepted packet
  names its execution owner and gate. No runtime, browser, benchmark, build, or
  release claim is made for unimplemented work.

Findings:
- Wordgard is better at local cohesion, especially `TableMap`, explicit
  precedence, compact fitter/change algorithms, and small behavior fixtures.
- Plite is decisively better at structural JSON, multi-root state, compiled
  schema identity, exact slices, changes, selection, history, collaboration
  adapters, DOM/input semantics, browser proof, and large-document locality.
- Plate is decisively better at product breadth and adoption. Its real debt is
  duplicate ownership in codecs, feature entry points/UI, tables, and
  collaboration proof.
- The two largest current architecture defects are Plate table geometry
  duplication and Yjs owning a second collaborative undo stack.

Decisions and tradeoffs:
- Do not migrate Wordgard as an editor architecture.
- Preserve Plite's existing data, transaction, selection, history, Yjs
  transport, DOM/React, proof, and performance laws unless a scored row names a
  narrower rearchitecture.
- Use Wordgard's strongest algorithms and fixtures as design pressure:
  canonical `TableGrid`, explicit rule ordering, fitter cohesion, history
  differential cases, and word/bidi test inputs.
- Breaking change size only orders execution; it does not weaken the target.
  No compatibility alias, dual API, or permanent bridge is approved.

Review fixes:
- Replaced false Wordgard history/collaboration absence claims with the live
  state-field and authority-adapter owners and their actual reversal laws.
- Rejected a duplicate public overlay API after export/call-graph audit;
  PV-05 is now only the private `CompiledProjectionStore` name/alias cleanup.
- Normalized all 181 primary dispositions/verdicts to exact enums, separated
  execution skills from packet aliases, and added explicit no-execution
  dossiers for accepted oracle/admission-gate rows.
- Corrected the product combined-score arithmetic for `PRODUCT-019`.
- Corrected the Wordgard vector total for `TABLE-017`.
- Recounted table proof owners from live files: 5/33/30/13 donor cases and
  19 Plate package specs plus one type-contract file.
- Replaced ambiguous STATE comparison cells with all five explicit vectors.
- Expanded history/collaboration proof accounting to 27 canonical
  collaboration cases, 105 structural change-law cases, and 30 Yjs test files
  containing 278 cases; 210 citations were range-checked.
- Reconciled 36 aliases as one completed planning ledger plus 35 future aliases
  that collapse into 31 executable packets and two no-execution outcomes.
- Ran the `best-api` two-pass audit over all 33 canonical outcomes; rejected
  Action/toolbar DSLs, public DOM profiles/geometry namespace/render-plan
  compiler, codec wrappers, color stores, and query-shaped a11y mutation.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| TypeScript compiler API inventory parser exposed only the root package version instead of parser APIs | 3 | Use the already-installed Babel TypeScript parser against the same bounded file set | `@babel/parser` produced the 119-file, 2,535-declaration inventory consumed by the final manifest. |

Closure accounting:
- Artifact cardinality: one active goal, one plan, one master concept ledger,
  one coverage manifest, and one dependency backlog.
- Donor topology: one npm package, one root export plus ten public subpaths,
  119 inventoried files, 113 architecture/proof files mapped, and six exact
  file exclusions.
- Donor proof: 26 mapped files under `test/` comprise 23 executable test
  modules plus three support modules (`generate.ts`, `schema.ts`,
  `tempview.ts`). The dead-code check, browser harness, and declaration-smoke
  source are separately mapped. `bin/mass-change.ts` is a regex source codemod,
  not performance proof.
- Declaration coverage: 867 public items mapped; 1,658 private items mapped
  and ten release-only private items excluded; zero unmapped.
- Concept coverage: 181 scored rows: 34 DOC, 22 STATE, 32 HC, 28 PRODUCT,
  31 TABLE, 28 VIEW, and six META. The donor manifest references 164 rows;
  the other 17 are current-only Plite/Plate mechanisms needed for a complete
  comparison.
- Packet coverage: 36 aliases comprise one completed planning ledger plus 35
  future aliases; those future aliases collapse to 31 executable packets and
  two resolved no-execution outcomes. Nineteen aliases/halves route through
  Plite Plan, nineteen through Plate Plan, and ten linked chains describe
  cross-owner adoption without duplicating work.
- Adoption and deletion: 23 adoption buckets including downstream callers; 40
  named responsibility families removed or privatized after their gates.
- Reconciliation: unmapped files 0; unmapped public declarations 0; unmapped
  private declarations 0; unscored concepts 0; unresolved owners 0; unresolved
  routes 0; incomplete current-Wordgard dossiers 0; incomplete current-local
  dossiers 0; incomplete target dossiers 0; incomplete adoption dossiers 0;
  incomplete deletion dossiers 0; incomplete proof dossiers 0; incomplete
  risk dossiers 0; unresolved architecture decisions 0.

Primary disposition and verdict counts:
### Result

All `181` scored concept IDs have exactly one primary Wordgard disposition and
exactly one primary local verdict.

| Primary Wordgard disposition | Count |
|---|---:|
| Adopted | 49 |
| Surpassed | 91 |
| Rejected | 40 |
| Deferred | 1 |
| **Total** | **181** |

| Primary local verdict | Count |
|---|---:|
| Keep | 111 |
| Rearchitect | 34 |
| Move | 5 |
| Cut | 9 |
| Rename | 2 |
| Bridge | 4 |
| Gate | 16 |
| Defer | 0 |
| **Total** | **181** |

The sole reference defer is `STATE-022`. It is not an unresolved architecture
decision: Wordgard's editor-core `PhraseSet` is rejected, localization remains
product-owned, and any future product localization API must pass a consumer
admission gate. Therefore the count of true unresolved defers, owners, routes,
or decisions is **zero**.

### Primary-counting rule

The two dimensions are independent:

1. **Wordgard disposition** asks what happens to the reference value.
   - `deferred`: an explicit defer intentionally withholds a permanent product
     decision. This applies only to `STATE-022`.
   - `adopted`: at least one named donor law, invariant, fixture, behavior,
     compiler shape, oracle, or workload is deliberately taken into the target.
     This wins over compound `adopt + surpass` or `adopt + reject` wording
     because the row has accepted reference value.
   - `surpassed`: no donor value is imported and the current stack already
     covers the concept more strongly. A missing donor counterpart is surpassed
     when the live stack owns and proves the capability.
   - `rejected`: no donor value is imported and the donor API, implementation,
     placement, or product policy is explicitly excluded.
2. **Local verdict** asks for the net operation on the current Plite/Plate
   architecture. For a compound row the terminal operation wins in this order:
   `cut > rearchitect > move > rename > bridge > gate > keep`. `Gate` means the
   only accepted local work is proof, docs truth, or an admission condition.
   `Defer` would mean an open choice without an owner or stop condition; no row
   meets that definition.

Mentions of moving a *donor* concept into an already-correct current owner do
not count as a local move. Likewise, `keep/rebase on grid` stays `keep`: the
grid's rearchitecture is counted on its owning concept rows, not duplicated on
every dependent table behavior.

### Namespace reconciliation

| Namespace | Concepts | Adopted | Surpassed | Rejected | Deferred | Keep | Rearchitect | Move | Cut | Rename | Bridge | Gate |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| DOC | 34 | 5 | 22 | 7 | 0 | 22 | 7 | 1 | 3 | 0 | 0 | 1 |
| HC | 32 | 6 | 22 | 4 | 0 | 19 | 6 | 1 | 2 | 0 | 1 | 3 |
| META | 6 | 2 | 1 | 3 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | 2 |
| PRODUCT | 28 | 12 | 5 | 11 | 0 | 17 | 5 | 1 | 0 | 1 | 1 | 3 |
| STATE | 22 | 2 | 15 | 4 | 1 | 19 | 0 | 0 | 0 | 0 | 0 | 3 |
| TABLE | 31 | 18 | 6 | 7 | 0 | 14 | 11 | 0 | 3 | 0 | 0 | 3 |
| VIEW | 28 | 4 | 20 | 4 | 0 | 15 | 7 | 2 | 0 | 1 | 2 | 1 |
| **Total** | **181** | **49** | **91** | **40** | **1** | **110** | **36** | **5** | **8** | **2** | **4** | **16** |

### Compound-label resolutions

- `HC-013`, `HC-014`, `HC-019`, `HC-026`, and all comparable
  `adopt + surpass` rows count as `adopted`; the law/boundary/concept is taken,
  while the donor implementation is surpassed.
- `DOC-027`, `PRODUCT-012`, `VIEW-014`, and comparable `adopt + reject` rows
  count as `adopted`; the accepted slice is named and the rejected donor
  placement/default is not.
- `DOC-029` and `DOC-034` count as local `cut`; deletion is the terminal
  operation even though surviving ownership is also rearchitected or moved.
- `HC-024` counts as local `cut`; the rearchitecture is the proof-gated path to
  deleting the duplicate collaborative-history owner.
- `STATE-015` counts as local `keep`; “move to existing owners” describes how
  the rejected donor monolith maps onto owners already present.
- `PRODUCT-007` counts as local `gate`; current behavior stays and only
  uncovered proof gaps are accepted.
- `PRODUCT-022` counts as local `move`; the surviving behavior migrates to the
  owning link plugin route.
- `PRODUCT-023` counts as local `rearchitect`; the current placeholder pipeline
  stays but pure entry points consolidate on their current owners.
- `PRODUCT-028`, `DOC-033`, `TABLE-026`, `TABLE-028`, `TABLE-031`, and
  `VIEW-028` count as local `gate`; their accepted work is docs/proof/release
  truth rather than a new runtime owner.
- `TABLE-013`, `TABLE-022`, `TABLE-025`, and `TABLE-029` count as local
  `rearchitect`; they add or replace a current private contract even where the
  source wording says `adopt` or `canonicalize` rather than repeating the verb.

Verification evidence:
- Score-vector reconciliation:
  `{"concepts":181,"namespaces":{"DOC":34,"HC":32,"META":6,"PRODUCT":28,"STATE":22,"TABLE":31,"VIEW":28}}`.
- Final coverage validator: 119/119 files, 867/867 public declarations,
  1,668/1,668 private declarations, 2,535/2,535 AST declarations, and zero
  unmapped items.
- Final plan-closure validator:
  `{"requirements":58,"concepts":181,"ledgerColumns":24,"executablePackets":31,"noExecutionOutcomes":2,"canonicalOutcomes":33,"packetDossiers":35,"rankedChanges":31,"pliteAliases":19,"plateAliases":19,"linkedChains":10,"adoptionBuckets":23,"deletionFamilies":40,"handoffAnswers":14,"planCitations":1735,"planCitationErrors":0,"manifestEvidence":5445,"manifestRangedEvidence":5444,"manifestEvidenceErrors":0,"files":119,"publicItems":867,"privateItems":1668,"unmapped":0}`.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-07-23-wordgard-full-architecture-audit.md`:
  `[autogoal] complete:
  docs/plans/2026-07-23-wordgard-full-architecture-audit.md`.
- Source-only planning boundary: no Plite, Plate, Wordgard, test, benchmark,
  reference-documentation, generated, package, or runtime source was changed;
  only the prescribed plan and coverage manifest were written, and no
  implementation command was run.

Final handoff prepared:
- Items 1-4: fundamental Wordgard, Plite, and Plate strengths and the donor's
  narrow-scope illusion are answered below.
- Items 5-6: the complete 31-item value ranking and independent six-wave
  dependency order are answered below.
- Items 7-9: every Plite alias, Plate alias, and ten linked cross-owner chains
  are enumerated below.
- Items 10-12: largest hard cuts and final public/internal architecture are
  explicit below.
- Items 13-14: total 23-bucket/40-deletion-family impact and zero-unaccounted
  donor proof are explicit below.

Timeline:
- 2026-07-23T08:47:41.853Z: Plite Plan created with R001-R057.
- 2026-07-23: doctrine and all live donor/local owner lanes audited.
- 2026-07-23: 119-file AST coverage manifest and 181-row score reconciliation
  closed.
- 2026-07-23: cross-lane ownership, ranking, backlog, adoption, deletion,
  proof, risk, and handoff synthesis closed.
- 2026-07-23: `best-api` two-pass correction classified 33/33 outcomes,
  removed unearned public machinery, and reconciled 31 executable plus two
  no-execution outcomes.
- 2026-07-23: final mechanical closure and autogoal checker closed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Prove-and-handoff complete; implementation has not started. |
| Where am I going? | User review of this exact plan; execution requires explicit acceptance and a new `plite-plan` invocation. |
| What is the goal? | Close the exhaustive current-source Wordgard versus Plite/Plate architecture decision with zero coverage, ledger, route, dossier, or checker gaps. |
| What have I learned? | Plite/Plate is stronger, but several first-pass API nouns were unjustified: direct feature updates, private DOM facts, flat geometry intents, and ordinary JSX are the cleaner target. |
| What have I done? | Produced one plan, one 181-row master ledger, one 119-file manifest, a 31-executable plus two-no-execution canonical map, one 31-item ranking, one six-wave backlog, and all 14 handoff answers. |

Open risks:
- No planning decision is open. Execution risk is concentrated in broad
  readonly type adoption, collaborative history deletion, per-root DOM/IME
  ownership, codec precedence, and table geometry replacement.
- Each risk has a hard stop: any semantic/type/browser/collaboration/
  persistence regression, a second owner or representation, an unbounded
  memory/locality regression, or a residual old API blocks its packet.
- C33 localization is a resolved rejection gate, not queued work. It can reopen
  only with two real product consumers and explicit locale/fallback/ICU/SSR/
  accessibility requirements.

## Coverage authority and exclusions

The machine-readable coverage authority is
`docs/plans/artifacts/wordgard-full-architecture-audit/coverage-manifest.json`.
It maps every tracked donor file and every TypeScript declaration site to a
concept ID or an evidenced exclusion; it contains no architectural verdict.

- Census: 119 files; 113 mapped and six excluded.
- Public declarations: 867/867 mapped.
- Private declarations: 1,658 mapped plus ten release-only exclusions out of
  1,668; zero unmapped.
- AST declaration sites: 2,525 mapped plus ten excluded out of 2,535.
- Donor-linked concepts: 164; the other 17 master-ledger rows describe
  necessary current-only Plite/Plate mechanisms.
- Donor tests: 23 executable test modules plus three support modules under
  `test/`.
- Exact exclusions: `.gitignore`, `CHANGELOG.md`, `LICENSE`,
  `bin/release.ts`, `bin/tsconfig.json`, and `demo/flower.jpg`.
  Root `tsconfig.json` is mapped package/type context.
- Evidence validation: all 5,445 manifest evidence entries resolve against
  live `../wordgard`; every ranged entry ends at or before live EOF.

## Master concept ledger

This is the only decision ledger. Its seven namespace partitions use the exact
24-column contract from the request. Every row reports all five independent
eight-axis vectors, score reasons, combined-to-target gain, exact current
Wordgard/Plite/Plate evidence and ownership, target/decision/execution
ownership, dependencies, packets, disposition, verdict, adoption, deletion,
proof, risk, and reversal evidence.

Vector order is semantics / composition / types / runtime / lifecycle / host
fitness / ownership and DX / proof. Scores are out of 40; a layer scored zero
is deliberately absent or unfit for the full target, not silently omitted.

## Normalized document architecture lane

Score vectors use `S/C/T/R/L/H/O/P` for semantics, composition, types, runtime, lifecycle, host fitness, ownership/DX, and proof. Each dimension is `0–5`; totals are `/40`. A zero is used when an architecture does not independently supply a required capability. All citations below were checked against the live `../wordgard` and `plate-2` sources.

| ID | Mechanism | Wordgard shape and evidence | Wordgard score | Current Plite shape and evidence | Plite score | Current Plate shape and evidence | Plate score | Current combined score | Comparison | Proposed shape | Target owner | Decision owner | Execution skill | Dependencies | Dependent packets | Target score | Gain | Reference disposition | Local verdict | Adoption | Deletion | Proof | Risk |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| DOC-001 | JSON tree and roots | **Current owner: `../wordgard/src/doc`.** Nominal `Node = Plot or Leaf`; the distinguished `Plot.Doc` is the only document root (`../wordgard/src/doc/node.ts:23-25`, `../wordgard/src/doc/node.ts:319-395`, `../wordgard/src/doc/node.ts:468-652`, `../wordgard/src/doc/node.ts:868-930`). | `4/3/3/3/2/1/3/3 = 22/40` — coherent tree semantics, but nominal identity, one root, weak host/persistence fitness. | **Current owner: `@platejs/plite`.** Structural element/text JSON plus `{ children, roots, meta }` document state (`packages/plite/src/interfaces/element.ts:11-17`, `packages/plite/src/interfaces/text.ts:23-28`, `packages/plite/src/interfaces/editor.ts:129-170`). | `5/5/5/4/4/5/4/5 = 37/40` — structural, multi-root, host-safe, and proved; public readonly truth is incomplete. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate does not define another document model: `BaseEditor` directly extends the Plite editor over Plite `Value` (`packages/core/src/lib/editor/BaseEditor.ts:1-2`, `packages/core/src/lib/editor/BaseEditor.ts:86-89`). | `0/0/1/0/0/0/2/1 = 4/40` — intentional delegation, with only product typing/integration value. | `5/5/5/4/4/5/4/5 = 37/40` — Plite supplies the canonical model and Plate adds no conflicting tree. | superior — Plite is materially superior: structural JSON and named roots give its real history and collaboration owners portable, schema-aware state that Wordgard’s nominal single-root document cannot provide. | Keep Plite structural JSON; finish readonly snapshot types under DOC-004. Never introduce node classes or a privileged class root. | `@platejs/plite`; Plate remains a typed consumer. | Plite Plan. | No execution packet; `plite-plan` P-DOC-1 owns the residual type work. | DOC-004 and DOC-006. | P-DOC-1 consumes the model types. | `5/5/5/5/5/5/5/5 = 40/40` — readonly structural multi-root publication. | `+3` — readonly/runtime ownership clarity only. | Reject | Keep | P-DOC-1 updates Plate consumers to readonly views; no semantic migration. | Delete no current model; prohibit class-node and single-root compatibility aliases. | Preserve Plite model/schema/change laws; P-DOC-1 adds readonly compile and freeze proof. | Broad type adoption is the only remaining risk; adopting Wordgard would create far larger persistence and collaboration risk. **Reversal evidence:** A class-node, privileged-root prototype must preserve equivalent named-root addressing, JSON and structured-clone portability, history replay, and Yjs convergence without adapters; one failure keeps structural multi-root JSON canonical. Reference scope: reject — Reject direct Wordgard adoption; retain it as negative evidence against nominal and single-root state.. Verdict scope: keep — Keep Plite model; no local implementation beyond P-DOC-1. |
| DOC-002 | Node taxonomy and behavior classification | **Current owner: `../wordgard/src/doc`.** `BaseType`/`BaseTag` objects compile flags and class behavior (`../wordgard/src/doc/node.ts:28-95`, `../wordgard/src/doc/node.ts:397-463`, `../wordgard/src/doc/node.ts:654-859`). | `4/4/3/4/3/2/3/3 = 26/40` — useful compiled facts, but behavior is tied to nominal objects and weak lifecycle. | **Current owner: `@platejs/plite`.** Element behavior is structural schema data and immutable compiled facts (`packages/plite/src/interfaces/schema.ts:204-220`, `packages/plite/src/interfaces/schema.ts:236-259`, `packages/plite/src/core/schema-compiler.ts:292-320`, `packages/plite/src/core/schema-compiler.ts:1420-1434`). | `5/5/5/5/5/5/4/5 = 39/40` — deterministic compiled data with only minor authoring/ownership headroom. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate contributes product declarations, then freezes and compiles them through `compilePlateModel` (`packages/core/src/lib/plugin/PluginConfig.ts:403-458`, `packages/core/src/internal/plugin/compilePlateModel.ts:318-365`). | `4/4/4/3/4/4/4/4 = 31/40` — strong product declaration layer, correctly not another kernel taxonomy. | `5/5/5/5/5/5/4/5 = 39/40` — Plite facts plus Plate declarations form one publication. | superior — Current architecture preserves Wordgard’s useful compilation idea while removing constructor identity and adding transactional product composition. | Keep compiled structural facts in Plite and pure product declarations in Plate; never persist or compare class handles. | Plite schema compiler for generic facts; Plate model compiler for product declarations. | Joint Plite Plan and Plate Plan boundary decision. | No execution packet; preserve the current split. | DOC-009, DOC-010, DOC-011. | None; P-DOC-4/5 consume compiled targets without changing taxonomy. | `5/5/5/5/5/5/5/5 = 40/40` — same semantics with clearer internal navigation. | `+1` — documentation/owner clarity, not a new mechanism. | Surpass | Keep | No caller migration; codec packets read existing compiled bindings. | Delete nothing; reject nominal tag/type handles. | Preserve schema compiler tests and Plate model conflict/reference tests. | Regression risk is low; the danger is reintroducing mutable or identity-sensitive declarations. **Reversal evidence:** Constructor-bound types must survive duplicate package copies, serialization, transactional reconfiguration, and Plate contribution permutation with fewer identity or conflict failures than compiled structural facts; otherwise the structural compiler remains owner. Reference scope: surpass — Surpass Wordgard; keep only the idea that repeated behavior queries should compile once.. Verdict scope: keep — Keep current owners. |
| DOC-003 | Text properties, marks, set algebra, lifecycle | **Current owner: `../wordgard/src/doc`.** Ranked nominal `Mark` objects with add, subtract, union, equality, and attribute shapes (`../wordgard/src/doc/mark.ts:11-40`, `../wordgard/src/doc/mark.ts:46-274`, `../wordgard/test/test-prop.ts:5-100`). | `5/4/4/4/3/2/4/3 = 29/40` — good algebra, but nominal persistence and no transactional schema lifecycle. | **Current owner: `@platejs/plite`.** Typed JSON property descriptors carry targets, merge, defaults, and lifecycle; the compiler indexes them (`packages/plite/src/interfaces/schema.ts:7-154`, `packages/plite/src/interfaces/schema.ts:273-286`, `packages/plite/src/core/schema-compiler.ts:327-342`). | `5/5/5/5/5/5/5/5 = 40/40` — structural persistence, inference, lifecycle, and proof are already complete. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate lowers product marks into Plite properties; bold is a boolean schema property and command, not a second mark class (`packages/core/src/internal/plugin/compilePlateModel.ts:368-380`, `packages/basic-nodes/src/lib/BaseBoldPlugin.ts:5-34`). | `4/5/5/4/4/4/5/4 = 35/40` — excellent product DX, correctly delegates generic algebra. | `5/5/5/5/5/5/5/5 = 40/40` — Plate authoring compiles onto Plite’s complete property law. | superior — Plite/Plate are genuinely stronger, not merely broader: structural values survive serialization, reconfiguration, and collaboration. | Keep property descriptors and Plate mark declarations exactly as the owner boundary. | Plite schema/property kernel; Plate product plugins. | Joint boundary is settled by Plite Plan and Plate Plan. | No execution packet. | DOC-002, DOC-009, DOC-010. | P-DOC-5 reuses property claims for HTML codecs. | `5/5/5/5/5/5/5/5 = 40/40` — the current property architecture already meets every target dimension. | `+0` — no architecture gap. | Surpass | Keep | No adoption work except codec declarations referencing existing properties. | Delete nothing; reject `Mark` classes and rank-as-identity. | Preserve schema property tests, Plate inference tests, mark commands, persistence/Yjs suites. | The main risk is duplicating mark serialization policy in the codec work; P-DOC-5 must derive claims from this owner. **Reversal evidence:** Nominal `Mark` algebra must round-trip through persistence and Yjs, survive schema reconfiguration, and beat property descriptors on the same generated add, subtract, union, default, and merge corpus; any identity or data loss keeps descriptors canonical. Reference scope: surpass — Surpass Wordgard; mine only missing behavioral fixtures if a current law fails. |
| DOC-004 | Readonly publication on existing value types | Wordgard node fields and child arrays are readonly but nominal and host-coupled (`../wordgard/src/doc/node.ts:319-395`, `../wordgard/src/doc/node.ts:468-518`). | `4/3/3/4/3/1/3/2 = 23/40` — clear local immutability, poor ecosystem fit. | Plite freezes/detaches slices, but existing `Value`, element children, `Path`, and `EditorSnapshot` look mutable (`packages/plite/src/core/content-slice.ts:67-176`, `packages/plite/src/interfaces/editor.ts:129`, `packages/plite/src/interfaces/path.ts:1-8`). | `5/4/2/5/4/5/3/5 = 33/40` — runtime truth is stronger than exported types. | Plate inherits those types through `BaseEditor` and initial-value transforms (`packages/core/src/lib/editor/BaseEditor.ts:86-89`, `packages/core/src/internal/plugin/pipeTransformInitialValue.ts:81-89`). | `3/3/2/3/3/4/3/3 = 24/40`. | `5/4/2/5/4/5/3/5 = 33/40`. | superior — structural runtime wins; Wordgard exposes a real readonly-surface defect. | Make existing `Value`, `EditorDocumentValue`, `InitialValue`, location, snapshot, commit, and slice types readonly. Add no `EditorDocumentSnapshot`, `EditorDocumentInput`, or `DeepMutableInput` taxonomy. | `@platejs/plite`; all consumers adopt. | Plite Plan. | `plite-plan` via P-DOC-1. | DOC-001, DOC-007, and exported write-site inventory. | P-DOC-2 and codec packets consume the final existing names. | `5/5/5/5/5/5/5/5 = 40/40`. | `+7`. | Reject | Rearchitect | Plite interfaces, hyperscript, DOM, React, history, Yjs, Plate, apps, fixtures, and tests adopt readonly existing names. | Delete mutable publication casts/aliases; reject a second input/snapshot vocabulary. | Inference and mutation-rejection corpus; freeze/alias tests; history/Yjs round trips; focused clipboard/editing smoke. | Large TypeScript blast radius; stop if inference requires public mutable aliases or runtime cloning. |
| DOC-005 | Equality, defaults, and adjacent-text canonicalization | **Current owner: `../wordgard/src/doc`.** Deep comparison, singleton defaults, and text joining live in helpers/node/slice (`../wordgard/src/doc/helper.ts:5-25`, `../wordgard/src/doc/node.ts:411-434`, `../wordgard/src/doc/node.ts:968-987`, `../wordgard/src/doc/slice.ts:83-93`). | `5/4/4/4/2/2/4/4 = 29/40` — cohesive canonicalization but lacks schema revision and host scope. | **Current owner: `@platejs/plite`.** Plite constructs property-aware canonical values from compiled schema and finalizes changes immutably (`packages/plite/src/interfaces/schema.ts:23-82`, `packages/plite/src/core/schema-compiler.ts:277-390`, `packages/plite/src/core/document-change.ts:6874-6968`). | `5/5/5/5/5/5/4/5 = 39/40` — broader canonical law with deterministic construction and proof. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate supplies product schema declarations that the Plite compiler consumes (`packages/core/src/lib/plugin/PluginConfig.ts:415-458`, `packages/core/src/internal/plugin/compilePlateModel.ts:368-380`); it has no rival canonicalizer. | `4/4/4/3/4/4/4/4 = 31/40` — correct product contribution and delegation. | `5/5/5/5/5/5/4/5 = 39/40` — Plite remains the sole schema-aware canonicalization owner. | superior — Wordgard’s compact helpers are already subsumed by a schema-aware and transaction-aware owner. | Keep canonical construction in Plite; Plate only declares properties/content. | Plite schema/change kernel. | Plite Plan. | No execution packet. | DOC-003, DOC-012, DOC-018. | None. | `5/5/5/5/5/5/5/5 = 40/40` — one canonical constructor plus clear ownership closes the final DX point. | `+1` — owner navigation/JSDoc only. | Surpass | Keep | No adoption. | Delete nothing; do not add a generic deep-equality owner from Wordgard. | Preserve schema construction, change finalization, and text normalization tests. | A second canonicalizer would create divergent JSON and history behavior; keep one owner. **Reversal evidence:** Wordgard-style deep equality, singleton defaults, and text joining must repair a minimized canonicalization failure that the schema-aware constructor cannot, then preserve identical JSON through revision changes and history replay; absent that fixture, no second canonicalizer is justified. Reference scope: surpass — Surpass Wordgard; no code adoption. |
| DOC-006 | Runtime node identity | **Current owner: `../wordgard/src/doc`.** Identity is the class/type object itself; duplicate loading is diagnosed as a nominal failure (`../wordgard/src/doc/node.ts:61-95`, `../wordgard/src/doc/schema.ts:241-243`). | `2/2/2/3/1/0/2/1 = 13/40` — usable in one process, unsafe for persistence, package duplication, and collaboration. | **Current owner: `@platejs/plite`.** Stable per-editor runtime IDs sit outside JSON and map through lazy, injective snapshot indexes (`packages/plite/src/interfaces/editor.ts:1605-1628`, `packages/plite/src/core/snapshot-index.ts:1196-1264`, `packages/plite/src/core/snapshot-index.ts:1325-1481`). | `5/5/4/5/5/5/4/5 = 38/40` — correct identity separation with minor API/navigation headroom. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate consumes Plite paths/IDs instead of owning identity; initial-value transformation constructs frozen `SnapshotIndex` views (`packages/core/src/internal/plugin/pipeTransformInitialValue.ts:20-78`). | `2/2/2/2/3/3/3/3 = 20/40` — integration exists, no independent identity law. | `5/5/4/5/5/5/4/5 = 38/40` — external runtime IDs and lazy indexes remain canonical across Plate consumers. | superior — Plite’s external runtime identity is categorically safer than nominal document values. | Keep IDs external to structural JSON and preserve lazy index mapping. | `@platejs/plite`. | Plite Plan. | No execution packet. | DOC-001, DOC-019, DOC-022. | P-DOC-1 makes exposed paths readonly; semantics unchanged. | `5/5/5/5/5/5/5/5 = 40/40` — external runtime identity plus readonly locations closes type and owner gaps. | `+2` — readonly/API clarity. | Surpass | Keep | Plate only adopts readonly identity views in P-DOC-1. | Delete nothing; never persist constructors/type objects. | Preserve snapshot-index injectivity, move, history, and collaboration tests. | Incorrect cache invalidation is the live risk; nominal identity would additionally fail across package copies. **Reversal evidence:** Constructor identity must remain stable across duplicate package copies, JSON reload, history replay, and Yjs exchange while Plite runtime IDs demonstrably lose injectivity on the same move/root corpus; otherwise identity stays external to JSON. Reference scope: surpass — Reject Wordgard identity architecture.. Verdict scope: keep — Keep Plite. |
| DOC-007 | Public locations and private token positions | **Current owner: `../wordgard/src/doc`.** Public global token `Pos`, walkers, node/plot resolution, and a strong eight-document cache (`../wordgard/src/doc/pos.ts:5-158`, `../wordgard/src/doc/pos.ts:165-324`). | `5/4/3/2/2/2/3/4 = 25/40` — good positional algebra, but single-root global offsets and retention-prone caching. | **Current owner: `@platejs/plite`.** Public root-aware path/point/range types plus private indexed token cursors (`packages/plite/src/interfaces/path.ts:1-139`, `packages/plite/src/interfaces/point.ts:5-94`, `packages/plite/src/core/resolved-token-cursor.ts:34-255`, `packages/plite/src/core/document-change.ts:2009-2168`). | `5/5/4/5/5/5/4/5 = 38/40` — correct public/private split; public arrays still look mutable. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate imports Plite `Path`, `Point`, and root keys into plugin handlers rather than defining offsets (`packages/core/src/lib/plugin/BasePlugin.ts:438-469`, `packages/core/src/lib/plugins/dom/DOMPlugin.ts:1-31`). | `3/3/4/2/2/4/4/3 = 25/40` — correct consumer surface, no position kernel. | `5/5/4/5/5/5/4/5 = 38/40` — root-aware public locations and private cursors remain canonical across Plate. | superior — Plite’s root-aware public locations and private token cursor beat Wordgard’s exposed global offset. **Concrete reversal evidence:** a correctness corpus and benchmark would have to show one public global offset unambiguously addresses main and named roots through history, Yjs, and clipboard mapping, while a retention profile proves the eight-document cache releases obsolete snapshots; current single-root offsets and strong cache do not. | Keep token positions internal; make every public location deeply readonly and preserve explicit root ownership. Reverse to public offsets only after the named-root history/Yjs/clipboard corpus and bounded-retention profile both pass. | `@platejs/plite`; Plate consumes. | Plite Plan. | `plite-plan` via P-DOC-1. | DOC-004, DOC-006, DOC-022. | P-DOC-2 retains private cursor/index machinery. | `5/5/5/5/5/5/5/5 = 40/40` — readonly root-aware locations preserve private token machinery. | `+2` — readonly truth only. | Reject | Rearchitect | All Plite and Plate location consumers adopt readonly tuples/objects. | Delete mutable `Path`, `Point`, `Range`, and location casts; no global-offset compatibility API. | Compile mutation failures; path/point transforms; selection/history/Yjs mapping; browser selection smoke. | Readonly tuple inference fallout; semantic risk is low if internal cursors stay private. **Reversal gate:** global offsets must pass named-root history/Yjs/clipboard equivalence, beat private cursors on the same corpus, and retain no obsolete snapshots; otherwise roll back the experiment and keep private cursors. Reference scope: reject — Reject Wordgard public offsets; retain its resolver cases only if they expose a missing current law.. Verdict scope: rearchitect — Rearchitect types, keep algorithms. |
| DOC-008 | Node reads, traversal, and text output | **Current owner: `../wordgard/src/doc`.** Tree iteration, `nodeAt`, `textContent`, and configurable `TextOutput` (`../wordgard/src/doc/node.ts:545-629`, `../wordgard/src/doc/text.ts:3-24`). | `4/4/3/2/2/2/4/3 = 24/40` — concise reads, but single-root classes and limited host/lifecycle proof. | **Current owner: `@platejs/plite`.** Generic inferred `NodeApi` traversal and editor state reads, including text extraction (`packages/plite/src/interfaces/node.ts:25-175`, `packages/plite/src/interfaces/node.ts:177-380`, `packages/plite/src/interfaces/editor.ts:845-848`). | `5/5/5/4/4/5/4/5 = 37/40` — richer root/schema/selection context with strong typing and proof. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate uses the Plite API directly; e.g. code-block slice middleware calls `NodeApi.string` and schema-aware commands (`packages/code-block/src/lib/withInsertFragmentCodeBlock.ts:18-66`). | `3/4/4/3/3/4/4/4 = 29/40` — strong product use, no duplicate traversal kernel. | `5/5/5/4/4/5/4/5 = 37/40` — Plite typed reads supply the law and Plate adds product use without duplication. | superior — Wordgard is shorter because it omits multiple roots, extension inference, selection, and runtime identity—not because its abstraction is better. | Keep Plite reads and typed traversal; keep Plate commands as consumers. | `@platejs/plite`. | Plite Plan. | No execution packet. | DOC-001, DOC-002, DOC-007. | P-DOC-1 updates return types to readonly. | `5/5/5/5/5/5/4/5 = 39/40` — readonly inferred reads close the remaining type/runtime points. | `+2` — readonly and owner docs. | Surpass | Keep | P-DOC-1 type adoption only. | Delete nothing; do not add class methods that duplicate `NodeApi`. | Preserve node API inference/traversal tests and product middleware tests. | API bloat/navigation remains the only concern; duplicating reads on node classes would worsen it. **Reversal evidence:** A root-aware, selection-aware traversal use case must be impossible to express with inferred `NodeApi` reads yet pass through donor class methods without casts or duplicate read owners; absent that failing corpus, keep typed structural traversal. Reference scope: surpass — Surpass Wordgard. |
| DOC-009 | Schema declarations and Plate composition | **Current owner: `../wordgard/src/doc`.** `Schema.define` consumes node/mark specs and function overrides (`../wordgard/src/doc/schema.ts:189-278`, `../wordgard/src/doc/schema.ts:344-391`). | `5/4/3/4/3/2/4/3 = 28/40` — expressive, but nominal/function identity weakens persistence and lifecycle. | **Current owner: `@platejs/plite`.** Structural declarations, contributions, and inferred schema facts are compiled into immutable identity (`packages/plite/src/interfaces/schema.ts:318-426`, `packages/plite/src/interfaces/schema.ts:455-520`, `packages/plite/src/core/schema-compiler.ts:159-241`). | `5/5/5/4/5/5/4/5 = 38/40` — persisted structural substrate with transactional identity. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate adds pure configured schema factories and plugin references (`packages/core/src/lib/plugin/PluginConfig.ts:354-458`, `packages/core/src/internal/plugin/compilePlateModel.ts:318-365`). | `5/5/5/4/5/5/5/5 = 39/40` — product authoring is exceptionally strong and compiles onto Plite; transactional lifecycle remains owned by Plite. | `5/5/5/5/5/5/5/5 = 40/40` — together they cover generic law and product DX without two schemas. | superior — Current split is the ideal ownership boundary; Wordgard incorrectly binds definition to nominal objects. | Keep Plite structural schema and Plate product composition. | Plite owns generic schema; Plate owns product declarations. | Joint Plite Plan and Plate Plan. | No execution packet. | DOC-002, DOC-003, DOC-010, DOC-011. | P-DOC-4/5 derive codec targets from compiled Plate bindings. | `5/5/5/5/5/5/5/5 = 40/40` — the existing Plite/Plate schema boundary already is the target. | `+0` — the current combined schema ownership boundary already reaches the target. | Surpass | Keep | Codec packets consume current bindings; no schema migration. | Delete nothing; do not introduce another schema DSL. | Preserve compiler identity, contribution, conflict, inference, and transactional reconfiguration tests. | Codec work could accidentally create parallel target declarations; derive claims from this compiler. **Reversal evidence:** A valid Plate contribution or live reconfiguration must require constructor identity and fail deterministic structural compilation while the nominal schema passes serialization and package-duplication proof; otherwise the Plite/Plate split stands. Reference scope: surpass — Reject Wordgard’s nominal/function identity; surpass its authoring surface. |
| DOC-010 | Groups, queries, targets, and content programs | **Current owner: `../wordgard/src/doc`.** Identity-based groups, union/intersection queries, roles, and schema matching (`../wordgard/src/doc/node.ts:236-313`, `../wordgard/src/doc/schema.ts:84-108`). | `5/4/3/4/3/2/3/3 = 27/40` — useful content algebra with identity and lifecycle limits. | **Current owner: `@platejs/plite`.** Structural targets/content programs, compiled reverse indexes, group closure/cycle detection, and content algebra (`packages/plite/src/interfaces/schema.ts:92-179`, `packages/plite/src/core/schema-compiler.ts:354-390`, `packages/plite/src/core/schema-compiler.ts:1437-1660`). | `5/5/5/5/5/5/4/5 = 39/40` — explicit, deterministic, and proved. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate resolves product plugin references and target bindings to Plite types before publication (`packages/core/src/internal/plugin/compilePlateModel.ts:300-365`). | `4/5/5/4/4/4/5/4 = 35/40` — strong product targeting, correctly shares the substrate algebra. | `5/5/5/5/5/5/4/5 = 39/40` — Plite target algebra and Plate reference resolution share compiled structural identity. | superior — Plite/Plate already provide every useful Wordgard capability with structural identity and cycle diagnostics. | Keep compiled structural targets; codec claims must reuse them. | Plite schema compiler, with Plate reference compiler. | Joint Plite Plan and Plate Plan. | No execution packet. | DOC-009, DOC-012, DOC-030. | P-DOC-4 and P-DOC-5 consume target claims. | `5/5/5/5/5/5/5/5 = 40/40` — codec claims reuse the compiled target owner instead of duplicating it. | `+1` — codec adoption makes ownership visible. | Surpass | Keep | No change until codec packets reuse current target facts. | Delete no target algebra; reject class-identity groups. | Preserve group closure, cycle, content matching, and Plate reference tests. | Duplicated codec target resolution is the risk; P-DOC-4 must call the compiled owner. **Reversal evidence:** A minimized group, query, target, or content-program case must resolve correctly through donor handles but fail current cycle-safe compiled targets, including after serialization and reconfiguration; otherwise codec claims reuse the current compiler. Reference scope: surpass — Surpass Wordgard; no port. |
| DOC-011 | Schema identity, revision, and caches | **Current owner: `../wordgard/src/doc`.** A weak cache keys schemas by specs and nominal reuse; duplicate nominal types are rejected (`../wordgard/src/doc/schema.ts:241-243`, `../wordgard/src/doc/schema.ts:323-338`). | `2/3/2/3/2/1/2/1 = 16/40` — process-local reuse without durable identity or transactional revision. | **Current owner: `@platejs/plite`.** Semantic fingerprints, named versions, strict persisted decode, deltas, and revisions; history invalidates on identity change (`packages/plite/src/interfaces/schema.ts:290-316`, `packages/plite/src/core/schema-compiler.ts:159-241`, `packages/plite/src/core/schema-compiler.ts:361-390`, `packages/plite-history/src/history-state.ts:376-399`). | `5/5/5/5/5/5/4/5 = 39/40` — durable and transaction-safe. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate publishes `PlateSchemaIdentity` and freezes/evaluates product declarations as one compiled model (`packages/core/src/lib/editor/BaseEditor.ts:29-32`, `packages/core/src/internal/plugin/compilePlateModel.ts:318-365`). | `4/5/5/4/5/4/4/5 = 36/40` — correct product participation in the same revision lifecycle. | `5/5/5/5/5/5/4/5 = 39/40` — schema fingerprints, history invalidation, and Plate model revision share one lifecycle. | superior — Wordgard’s weak cache cannot support persisted history or live reconfiguration; current identity can. | Keep semantic identity/revision; bind fitter and codecs to the same publication. | Plite schema identity; Plate compiled-model revision. | Joint Plite Plan and Plate Plan. | No execution packet; P-DOC-3 uses `plite-plan` and P-DOC-4 uses `plate-plan`. | DOC-009, DOC-014, DOC-023. | P-DOC-3, P-DOC-4, P-DOC-5. | `5/5/5/5/5/5/5/5 = 40/40` — schema, fitter, and codec artifacts share atomic revision invalidation. | `+1` — all compiled consumers share explicit revision invalidation. | Surpass | Keep | Fitter and codec publications adopt schema/model revision keys. | Delete consumer-local stale caches when each packet lands. | Schema identity persistence, reconfiguration invalidation, history reset, codec/fitter revision tests. | Stale compiled consumers are the risk; atomic discard is mandatory. **Reversal evidence:** A nominal weak-cache schema must persist, reload, and reconfigure history without stale consumers while the semantic identity/revision path fails the same deterministic invalidation corpus; otherwise revision-keyed publication remains canonical. Reference scope: surpass — Reject Wordgard cache/identity; surpass.. Verdict scope: keep — Keep core; extend consumers. |
| DOC-012 | Validation, defaults, wrapping, and correction construction | **Current owner: `../wordgard/src/doc`.** Recursive validation/default fill plus cached breadth-first wrapper search (`../wordgard/src/doc/schema.ts:43-75`, `../wordgard/src/doc/schema.ts:124-181`, `../wordgard/test/test-schema.ts:7-75`). | `5/5/3/4/3/2/4/3 = 29/40` — strong local semantics, but nominal and single-revision. | **Current owner: `@platejs/plite`.** Immutable diagnostics, public validation, compiled construction/wrapper plans, and canonical builder finalization (`packages/plite/src/interfaces/editor.ts:1005-1019`, `packages/plite/src/core/schema-compiler.ts:277-390`, `packages/plite/src/core/document-change.ts:6874-6968`). | `5/5/5/5/5/5/4/5 = 39/40` — richer construction law with deterministic diagnostics. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate product schema factories feed Plite validation; it does not normalize through a parallel tree mutator (`packages/core/src/lib/plugin/PluginConfig.ts:368-458`, `packages/core/src/internal/plugin/compilePlateModel.ts:368-400`). | `4/4/4/3/4/4/4/4 = 31/40` — correct declaration layer. | `5/5/5/5/5/5/4/5 = 39/40` — Plite validation/construction stays canonical while Plate contributes declarations. | superior — Current architecture already incorporates Wordgard’s useful wrapper/default concepts with revision and transaction authority. | Keep one Plite construction/validation owner. | `@platejs/plite`. | Plite Plan. | No execution packet; P-DOC-3 uses `plite-plan` for fit-specific callers. | DOC-009, DOC-010, DOC-014, DOC-018. | P-DOC-3. | `5/5/5/5/5/5/5/5 = 40/40` — schema construction stays singular after fitter extraction. | `+1` — clearer construction/fitter boundary. | Surpass | Keep | P-DOC-3 routes fit construction through the same compiled plans. | Delete no validation law; remove only duplicate fit-local wrappers proven redundant. | Preserve schema validation/construction tests and add fitter delegation equivalence. | Splitting fitter code could duplicate wrapper logic; hard gate requires one compiled construction authority. **Reversal evidence:** A donor fitter must construct a valid wrapper/default correction for a minimized schema case that the current compiled constructor rejects, with identical final JSON and transaction atomicity; otherwise validation and construction keep one Plite owner. Reference scope: surpass — Surpass Wordgard; cases may be harvested, not code. |
| DOC-013 | Public slice value and codec | **Current owner: `../wordgard/src/doc`.** Public `Slice` is a raw token array with equality, walking, slicing, and unversioned JSON (`../wordgard/src/doc/slice.ts:6-142`). | `4/4/3/4/2/2/3/3 = 25/40` — useful openness, but exposes representation and weak persistence/lifecycle. | **Current owner: `@platejs/plite`.** Public `ContentSlice` is immutable JSON content plus exact open depths; construction validates, detaches, freezes, caches variants, and hides tokens (`packages/plite/src/interfaces/editor.ts:1022-1027`, `packages/plite/src/core/content-slice.ts:27-176`, `packages/plite/src/core/content-slice.ts:310-395`). | `5/5/5/5/5/5/5/5 = 40/40` — target architecture already exists. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate consumes exact slices in commands but has no competing slice type; code-block middleware rewrites through `ContentSlice.withContent` (`packages/code-block/src/lib/withInsertFragmentCodeBlock.ts:18-66`). | `3/3/4/3/3/4/4/3 = 27/40` — correct product consumption, not a substrate implementation. | `5/5/5/5/5/5/5/5 = 40/40` — Plite ContentSlice already supplies the complete public and private slice contract. | superior — Plite is both simpler publicly and stronger internally than Wordgard. | Keep `ContentSlice` as the only open-content transport. | `@platejs/plite`; Plate consumes it. | Plite Plan. | No execution packet. | DOC-014, DOC-015, DOC-026. | P-DOC-3 uses it unchanged; P-DOC-4 makes Plate codecs return it directly. | `5/5/5/5/5/5/5/5 = 40/40` — the existing ContentSlice architecture already is the target. | `+0` — ContentSlice already reaches the target. | Surpass | Keep | P-DOC-4 migrates Plate parser returns to exact `ContentSlice`. | Delete no Plite slice API; P-DOC-4 deletes Plate’s forced closed wrapper. | Preserve `packages/plite/test/content-slice-laws.test.ts:81-197`; add codec open-slice round trips. | Product codecs may accidentally close slices; target API forbids dual array/slice returns. **Reversal evidence:** A donor slice representation must preserve an open-parent context through parse, clipboard, fit, history, and serialize round trips where `ContentSlice` loses it, without an array-or-slice union; otherwise `ContentSlice` remains the sole transport. Reference scope: surpass — Reject raw public tokens; surpass Wordgard. |
| DOC-014 | Slice fitting and correction owner | **Current owner: `../wordgard/src/doc`.** Parsing placement and two recognizable fitters handle wrapper/isolating context (`../wordgard/src/doc/parse.ts:397-455`, `../wordgard/src/doc/change.ts:831-1092`, `../wordgard/src/doc/change.ts:1182-1332`). | `5/4/2/3/2/2/2/4 = 24/40` — cohesive state machines and tests, but split correction, single-root, and weak lifecycle. | **Current owner: `@platejs/plite`.** Public fit API is exact and deterministic; private candidate frontier, costs, canonicalization, and schema revision live inside oversized `editor-schema.ts` (`packages/plite/src/interfaces/editor.ts:493-510`, `packages/plite/src/interfaces/editor.ts:850-877`, `packages/plite/src/core/editor-schema.ts:105-180`, `packages/plite/src/core/editor-schema.ts:439-750`, `packages/plite/src/core/editor-schema.ts:1041-1070`). | `5/5/4/5/4/5/3/5 = 36/40` — stronger semantics/proof, weaker physical ownership. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate does not fit independently; product middleware transforms a slice then delegates to Plite (`packages/code-block/src/lib/withInsertFragmentCodeBlock.ts:18-66`). | `1/1/1/1/1/2/2/2 = 11/40` — appropriate delegation, limited independent capability. | `5/5/4/5/4/5/3/5 = 36/40` — fitting semantics and proof are strong but physical owner and revision cohesion remain weak. | superior — Plite wins behavior and host fitness; Wordgard wins local recognizability of the fitter owner. | Extract one private `CompiledSliceFitter` bound to a `CompiledEditorSchema` revision; retain public APIs and candidate ordering exactly. | `packages/plite/src/core/slice-fit/*`. | Plite Plan. | `plite-plan` via P-DOC-3. | P-DOC-2 establishes the private change-kernel boundary; DOC-011 supplies revision identity. | P-DOC-4/5 depend only on unchanged fit behavior and proof. | `5/5/5/5/5/5/5/5 = 40/40` — one revision-bound compiled fitter closes type, lifecycle, and ownership gaps. | `+4` — physical owner, lifecycle binding, and navigation. | Adopt | Rearchitect | Plite schema APIs delegate to the compiled fitter; Plate commands and apps keep existing public calls. | Delete fit-only types/state/helpers from `editor-schema.ts` after equivalence; no bridge or duplicate frontier. | Slice-fit/content-slice/schema laws; history/Yjs replay; revision invalidation; locality/correction benchmarks; apps/plite clipboard browser proof. | Hidden closure dependencies or changed tie ordering could alter edits; equivalence and benchmark gates are mandatory. **Reversal evidence:** The private `CompiledSliceFitter` extraction is reversed if closure capture cannot preserve byte-identical candidate order and corrections or if the same large-slice corpus shows a material locality or allocation regression; then fitting remains colocated. Reference scope: adopt — Adopt Wordgard’s cohesive-owner principle; reject its fitter code and split correction semantics.. Verdict scope: rearchitect — Move/rearchitect without behavior change. |
| DOC-015 | Private token slice and prepared representation | **Current owner: `../wordgard/src/doc`.** `Token` and `Slice` are public and expose node/open/end representation (`../wordgard/src/doc/slice.ts:6-142`). | `5/4/2/4/2/1/2/3 = 23/40` — effective algebra with a wrong public boundary. | **Current owner: `@platejs/plite`.** Plite keeps JSON tokens and prepared `DocumentSlice` inside the change/content-slice implementation (`packages/plite/src/core/document-change.ts:96-230`, `packages/plite/src/core/document-change.ts:1210-1566`, `packages/plite/src/core/content-slice.ts:327-395`). | `5/5/4/5/5/5/3/5 = 37/40` — correct privacy and reuse, but buried in a monolith. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate has no token representation and imports only public `ContentSlice` (`packages/core/src/lib/plugins/ParserPlugin.ts:1-6`, `packages/code-block/src/lib/withInsertFragmentCodeBlock.ts:1-8`). | `0/0/0/0/0/0/0/0 = 0/40` — absence is correct because this is a Plite internal requirement. | `5/5/4/5/5/5/3/5 = 37/40` — private prepared tokens are correct but buried inside the change monolith. | superior — Plite has the right representation boundary; Wordgard only offers a clearer physical file. **Concrete reversal evidence:** at least two independently owned public packages would have to exchange a versioned token representation that `ContentSlice` cannot express, with compatibility tests across releases; the audited Plate consumers import only `ContentSlice` and expose zero token consumers. | Move prepared tokens/indexing into private `core/change/*`; expose no token types. Reverse to a public token contract only after two external consumers, an unmet transport requirement, and a versioned cross-release compatibility corpus are recorded. | `@platejs/plite/internal/change-kernel`. | Plite Plan. | `architecture-cleanup` under `plite-plan` via P-DOC-2. | P-DOC-1 finalizes readonly names; DOC-013 remains public transport. | P-DOC-3 uses the private builder/change result. | `5/5/5/5/5/5/5/5 = 40/40` — private cohesive token/index modules close type and owner gaps. | `+3` — cohesion and internal type truth. | Reject | Move | Plite internal consumers change imports; Plate does nothing. | Delete root/public exposure of internal token/index names; delete old duplicate definitions after move. | Change/slice laws, structural export guard, history/Yjs integration, change benchmarks. | Circular dependencies and accidental public re-export during split. **Reversal gate:** two external consumers must fail to express a shared requirement through `ContentSlice` and pass a versioned token compatibility suite; absent both, roll back any public export immediately. Reference scope: reject — Reject Wordgard public representation; adopt only file-level cohesion.. Verdict scope: move — Move internal owner. |
| DOC-016 | Single-root compact change sections | **Current owner: `../wordgard/src/doc`.** Public `ChangeSet` uses compact sentinel pairs and parallel data (`../wordgard/src/doc/change.ts:109-168`, `../wordgard/src/doc/change.ts:489-670`). | `5/5/3/4/2/2/2/4 = 27/40` — serious compact algebra, but opaque, single-root, and publicly coupled. | **Current owner: `@platejs/plite`.** Plite has stronger property-aware `ChangeSet`, yet exports it with public sections/data alongside `DocumentChange` (`packages/plite/src/core/document-change.ts:3237-3333`, `packages/plite/src/index.ts:33-39`, `content/docs/plite/concepts/05-document-changes.mdx:15-32`). | `5/5/4/5/5/5/2/5 = 36/40` — strong internals, wrong public ownership. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate product code uses `DocumentChange`, not `ChangeSet`; initial transform derives a canonical `DocumentChange` (`packages/core/src/internal/plugin/pipeTransformInitialValue.ts:1-14`, `packages/core/src/internal/plugin/pipeTransformInitialValue.ts:118-130`). | `0/0/0/0/0/0/0/0 = 0/40` — Plate correctly owns no root-change section algebra. | `5/5/4/5/5/5/2/5 = 36/40` — change behavior is strong but the root-level kernel still leaks publicly. | superior — Plite surpasses Wordgard’s algebra but repeats its mistake by exposing the root-level kernel. **Concrete reversal evidence:** a complete public-consumer inventory would have to find independently authored code that must inspect or construct root `sections` and `data`, cannot express its intent as `DocumentChange`, and passes named-root/effect/version compatibility tests; current Plate code consumes `DocumentChange` instead. | Make `DocumentChange` the only public change algebra; keep root sections private behind an intent-specific internal bridge. Reverse only after two independent public consumers satisfy the unmet-intent and compatibility corpus. | `@platejs/plite`, private `core/change/root-change.ts`. | Plite Plan. | `architecture-cleanup` under `plite-plan` via P-DOC-2. | P-DOC-1 type names; Yjs event import inventory. | P-DOC-3 consumes the private builder; Yjs adoption occurs in P-DOC-2. | `5/5/5/5/5/5/5/5 = 40/40` — DocumentChange becomes the sole public algebra and root sections become private. | `+4` — public boundary, types, and ownership. | Reject | Cut | Plite internal imports move; Yjs receives a narrow internal construction bridge; Plate unchanged. | Delete root `ChangeSet` export, public docs, public fields/factories, and public smoke expectation; no alias. | Generated change laws, public import rejection, history persistence, Yjs canonical/event bridge, change/perf benchmarks. | External users may import `ChangeSet`; this is an intentional break and must ship with decisive docs, not a shim. **Reversal gate:** two independent public consumers must prove an intent unavailable through `DocumentChange` and pass named-root/effect/version compatibility; otherwise keep sections private and roll back any compatibility export. Reference scope: reject — Reject donor API; keep compact implementation privately.. Verdict scope: cut — Cut public API and move internals. |
| DOC-017 | Canonical multi-root document change | **Current owner: `../wordgard/src/doc`.** Wordgard has only one `Plot.Doc`; `ChangeSet` has no root lifecycle (`../wordgard/src/doc/node.ts:868-930`, `../wordgard/src/doc/change.ts:117-487`). | `2/4/3/4/2/1/3/4 = 23/40` — capable single-root algebra, missing the required model. | **Current owner: `@platejs/plite`.** Versioned `DocumentChange` owns named-root create/delete, apply, transform, compose, invert, and mapping (`packages/plite/src/core/document-change.ts:5267-5832`, `packages/plite/src/core/document-change.ts:6173-6227`). | `5/5/5/5/5/5/5/5 = 40/40` — canonical target already complete. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate delegates canonical mutation to Plite transactions and `DocumentChange` (`packages/core/src/internal/plugin/pipeTransformInitialValue.ts:1-14`, `packages/core/src/internal/plugin/pipeTransformInitialValue.ts:118-130`). | `0/0/1/0/0/0/1/0 = 2/40` — no independent change algebra, intentionally. | `5/5/5/5/5/5/5/5 = 40/40` — DocumentChange fully owns multi-root mutation and Plate delegates correctly. | superior — Wordgard has no corresponding multi-root capability. | Keep `DocumentChange` public and canonical across update, persistence, history, and collaboration. | `@platejs/plite`. | Plite Plan. | No execution packet; `plite-plan` P-DOC-2 preserves this boundary. | DOC-001, DOC-016, DOC-018. | P-DOC-2. | `5/5/5/5/5/5/5/5 = 40/40` — the existing canonical multi-root change already is the target. | `+0` — multi-root semantics already reach the target; P-DOC-2 scores its boundary cleanup on DOC-016. | Surpass | Keep | No semantic adoption; Yjs keeps lowering canonical changes. | Delete nothing from `DocumentChange`; delete rival public root algebra in P-DOC-2. | Preserve document-change laws, multi-root tests, persistence, history, and Yjs suites. | Boundary erosion is the risk; do not expose lower-level sections again. **Reversal evidence:** Two independent external consumers must prove a shared multi-root intent that `DocumentChange` cannot express and raw sections can, with stable versioned JSON, inversion, transform, history, and Yjs proof; otherwise lower-level sections stay private. Reference scope: surpass — Surpass Wordgard. |
| DOC-018 | Transaction specs and change construction | **Current owner: `../wordgard/src/doc`.** `ChangeSet.Spec` accepts callers’ edits and makes fitting/correction optional (`../wordgard/src/doc/change.ts:517-544`, `../wordgard/src/doc/change.ts:568-670`). | `2/3/3/3/1/1/2/3 = 18/40` — flexible but permits invalid publication paths. | **Current owner: `@platejs/plite`.** Opaque `TransactionSpec` carries canonical changes, effects, selection, annotations, and tags; builder finalization validates atomically (`packages/plite/src/interfaces/editor.ts:1677-1697`, `packages/plite/src/core/document-change.ts:6270-7164`). | `5/5/5/5/5/5/4/5 = 39/40` — strong publication law and construction primitives. | **Current owner: `@platejs/core` plus the cited feature package.** Plate plugin update/transaction groups call the Plite surface rather than manufacturing specs (`packages/core/src/lib/plugin/BasePlugin.ts:369-426`). | `4/5/5/4/4/4/4/4 = 34/40` — strong typed feature composition, correctly subordinate to Plite publication. | `5/5/5/5/5/5/4/5 = 39/40` — opaque atomic publication is canonical and Plate update groups compose onto it. | superior — Plite prevents invalid publication; Wordgard relies on caller discipline. | Keep opaque specs and one canonical builder/finalization owner. | `@platejs/plite`; Plate owns typed feature update groups. | Joint boundary, Plite Plan final authority. | No execution packet. | DOC-012, DOC-017, DOC-019. | P-DOC-2 moves builder internals only. | `5/5/5/5/5/5/5/5 = 40/40` — opaque atomic specs remain canonical with clearer construction ownership. | `+1` — internal ownership clarity. | Surpass | Keep | P-DOC-2 updates internal imports; product APIs unchanged. | Delete nothing public; do not expose raw builder/spec constructors. | Preserve transaction atomicity, failed-fit no-publication, effects/selection mapping, and type inference tests. | Physical split could leak builder construction; export guards prevent it. **Reversal evidence:** A valid atomic edit must be impossible to express as an opaque spec and canonical finalization yet succeed through direct builder access while preserving failed-fit no-publication, effect mapping, and inference; otherwise builders stay private. Reference scope: surpass — Reject Wordgard opt-in validity; surpass. |
| DOC-019 | Apply, structural sharing, and classification | **Current owner: `../wordgard/src/doc`.** A walker rebuilds changed nodes and caches one apply result (`../wordgard/src/doc/change.ts:9-107`, `../wordgard/src/doc/change.ts:170-202`). | `5/5/3/4/2/2/3/4 = 28/40` — solid apply semantics, limited identity/classification/lifecycle. | **Current owner: `@platejs/plite`.** Immutable indexed apply, change classification, runtime candidates, and sparse identity mapping (`packages/plite/src/core/document-change.ts:6173-6227`, `packages/plite/src/core/document-change.ts:6544-6639`, `packages/plite/src/core/snapshot-index.ts:1196-1264`). | `5/5/5/5/5/5/4/5 = 39/40` — stronger consumer invalidation and identity proof. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate reads commits/classification through Plite handlers; handler contracts include commit, change kind, paths, roots, and prior node (`packages/core/src/lib/plugin/BasePlugin.ts:438-469`). | `1/2/2/1/2/3/3/3 = 17/40` — product consumption only. | `5/5/5/5/5/5/4/5 = 39/40` — indexed apply, sharing, and classification remain canonical for Plate handlers. | superior — Current Plite has all useful Wordgard behavior plus root-aware classification and identity preservation. | Keep semantics; move implementation into private change modules in P-DOC-2. | `@platejs/plite/internal/change-kernel`. | Plite Plan. | `architecture-cleanup` under `plite-plan` via P-DOC-2. | DOC-006, DOC-017, DOC-018. | P-DOC-2. | `5/5/5/5/5/5/5/5 = 40/40` — behavior-neutral module ownership closes the final DX point. | `+1` — ownership/navigation only. | Surpass | Keep | Plite internals move; Plate handler API unchanged. | Delete duplicate/old monolith definitions only after import graph is complete. | Apply/classification/runtime-ID laws and benchmarks; Plate change-handler tests. | A split can perturb cache identity or classification order; output equivalence is required. **Reversal evidence:** The private module move is reversed if apply output, runtime-ID preservation, classification order, structural sharing, or allocation changes on the existing deterministic and generated corpus; then the current colocation remains the safer owner. Reference scope: surpass — Surpass Wordgard.. Verdict scope: keep — Move code, keep behavior. |
| DOC-020 | Composition and inversion | **Current owner: `../wordgard/src/doc`.** Section-iterator algebra composes and inverts changes (`../wordgard/src/doc/change.ts:234-286`, `../wordgard/src/doc/change.ts:748-829`, `../wordgard/src/doc/change.ts:1104-1180`, `../wordgard/test/test-change.ts:23-547`). | `5/5/3/4/2/3/3/4 = 29/40` — strong single-root algebra with unseeded proof and no property/root lifecycle. | **Current owner: `@platejs/plite`.** Root- and property-aware compose/invert with seeded generated laws (`packages/plite/src/core/document-change.ts:4326-4388`, `packages/plite/src/core/document-change.ts:5655-5786`, `packages/plite/test/document-change-laws.test.ts:455-799`). | `5/5/5/5/5/5/4/5 = 39/40` — complete law, minor owner cohesion debt. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate owns no independent algebra and consumes canonical commits (`packages/core/src/lib/plugin/BasePlugin.ts:438-469`). | `0/0/0/0/0/0/0/0 = 0/40` — correct absence. | `5/5/5/5/5/5/4/5 = 39/40` — root/property-aware composition and inversion are canonical with seeded law proof. | superior — Wordgard is useful provenance, but Plite covers more semantics with stronger reproducible proof. | Keep algebra exactly; relocate privately with P-DOC-2. | `@platejs/plite/internal/change-kernel`. | Plite Plan. | `architecture-cleanup` under `plite-plan` via P-DOC-2. | DOC-016, DOC-017, DOC-019. | P-DOC-2. | `5/5/5/5/5/5/5/5 = 40/40` — private cohesive modules preserve every algebra law and close ownership. | `+1` — cohesive private owner. | Surpass | Keep | Internal imports only. | Delete no law or algorithm; delete monolith copies after move. | All deterministic/generated compose/invert/associativity laws plus history persistence. | Accidental order or mapping changes during move; byte/semantic equivalence required. **Reversal evidence:** Relocation is reversed on any byte or semantic compose/invert difference, failed associativity or round trip, history persistence drift, or material benchmark regression; the algebra then remains colocated until the dependency is understood. Reference scope: surpass — Surpass Wordgard; retain test ideas only.. Verdict scope: keep — Move/keep. |
| DOC-021 | Transform, rebase, and correction | **Current owner: `../wordgard/src/doc`.** Two-way OT transforms concurrent changes and optionally corrects invalid results (`../wordgard/src/doc/change.ts:672-746`, `../wordgard/src/doc/change.ts:831-1092`). | `5/5/3/4/2/3/3/5 = 30/40` — strong OT intent and tests, but single-root/schema lifecycle limitations. | **Current owner: `@platejs/plite`.** Document-context transform/correction, root/property semantics, lazy history rebase, and seeded convergence laws (`packages/plite/src/core/document-change.ts:3539-3799`, `packages/plite/src/core/document-change.ts:5581-5725`, `packages/plite-history/src/history-state.ts:263-320`, `packages/plite/test/document-change-laws.test.ts:713-799`). | `5/5/5/5/5/5/4/5 = 39/40` — schema/root-aware transform and lazy history rebase are canonical. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate delegates transform/rebase to Plite/history; its plugin surface does not define OT (`packages/core/src/lib/editor/BaseEditor.ts:86-89`, `packages/core/src/lib/plugin/BasePlugin.ts:369-426`). | `0/0/0/0/0/0/0/0 = 0/40` — schema/root-aware transform and lazy history rebase are canonical. | `5/5/5/5/5/5/4/5 = 39/40` — schema/root-aware transform and lazy history rebase are canonical. | superior — Plite includes schema, properties, roots, and history consequences that Wordgard cannot express. | Keep canonical transform/rebase; P-DOC-2 may relocate internals only. | Plite core and `@platejs/plite-history`. | Plite Plan. | `architecture-cleanup` under `plite-plan` via P-DOC-2. | DOC-017, DOC-020, DOC-024. | P-DOC-2. | `5/5/5/5/5/5/5/5 = 40/40` — private cohesive modules preserve convergence and close ownership. | `+1` — ownership clarity. | Surpass | Keep | History changes internal imports only. | Delete no correction/rebase behavior. | Generated pair/triplet convergence, history lazy-rebase and schema-change tests. | Small ordering changes can break convergence; generated laws are hard gates. **Reversal evidence:** A minimized schema, property, or named-root rebase seed must converge under donor transform rules while current Plite diverges, or the private move itself must break an existing pair/triplet law; only that observed trace reopens the owner or algorithm. Reference scope: surpass — Surpass Wordgard.. Verdict scope: keep — Move/keep. |
| DOC-022 | Mapping, inspection, and anchors | **Current owner: `../wordgard/src/doc`.** Association/track mapping and range iterators operate on token positions (`../wordgard/src/doc/change.ts:302-436`, `../wordgard/src/doc/pos.ts:5-158`). | `5/5/3/4/2/2/4/4 = 29/40` — solid positional mapping, single-root and no runtime-anchor lifecycle. | **Current owner: `@platejs/plite`.** Root-aware position mapping, commit classification, runtime IDs, and selection/effect/history mapping (`packages/plite/src/core/document-change.ts:5747-5832`, `packages/plite/src/core/snapshot-index.ts:1196-1481`, `packages/plite-history/src/history-state.ts:277-309`). | `5/5/5/5/5/5/5/5 = 40/40` — root-aware mapping, runtime identity, effects, and history form a complete owner graph. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate plugin handlers receive mapped root-aware paths/commits and DOM scrolling uses Plite changes/locations (`packages/core/src/lib/plugin/BasePlugin.ts:438-469`, `packages/core/src/lib/plugins/dom/DOMPlugin.ts:148-166`). | `2/2/3/2/2/4/3/4 = 22/40` — consumer projection, no independent mapping algebra. | `5/5/5/5/5/5/5/5 = 40/40` — root-aware mapping, runtime identity, effects, and history form a complete owner graph. | superior — Plite fully surpasses Wordgard with root, runtime identity, effects, selection, and history integration. | Keep one mapping/anchor owner in Plite. | `@platejs/plite`. | Plite Plan. | No execution packet; `architecture-cleanup` may move private mapping modules in P-DOC-2. | DOC-006, DOC-007, DOC-017. | P-DOC-1 readonly types; P-DOC-2 physical move. | `5/5/5/5/5/5/5/5 = 40/40` — the existing root-aware mapping architecture already is the target. | `+0` — mapping and anchor semantics already reach the target. | Surpass | Keep | Type/import adoption only. | Delete nothing; reject public global-token anchors. | Preserve anchor, selection/effect mapping, runtime index, history, and DOM change-handler proof. | Anchor association semantics are fragile; moves must preserve exact deletion policy and root mapping. **Reversal evidence:** A donor position-association rule must repair a minimized current move, delete, selection, effect, or named-root mapping failure without losing root identity, and pass history/Yjs replay; otherwise Plite mapping and anchors remain sole owner. Reference scope: surpass — Surpass Wordgard. |
| DOC-023 | Node, slice, change, schema, and value persistence | **Current owner: `../wordgard/src/doc`.** Name-based node JSON, raw slice tokens, unversioned changes; `toJSON` writes `modifications` while `fromJSON` reads `modification` (`../wordgard/src/doc/node.ts:228-234`, `../wordgard/src/doc/schema.ts:280-320`, `../wordgard/src/doc/slice.ts:121-141`, `../wordgard/src/doc/change.ts:204-231`, `../wordgard/src/doc/change.ts:554-559`). | `2/3/3/3/1/1/3/1 = 17/40` — basic encoding with a live round-trip defect and no version lifecycle. | **Current owner: `@platejs/plite`.** Strict JSON codecs, versioned effect/value envelopes, versioned `DocumentChange`, and schema-identity validation (`packages/plite/src/core/value-codec.ts:38-137`, `packages/plite/src/core/value-codec.ts:234-420`, `packages/plite/src/core/document-change.ts:202-230`, `packages/plite/src/core/document-change.ts:5535-5574`, `packages/plite/src/core/schema-compiler.ts:174-241`). | `5/5/5/5/5/5/4/5 = 39/40` — strict versioned Plite persistence stays canonical while Plate formats remain host policy. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate product codecs consume Plite state but do not replace canonical persistence; its current parser declarations are host import policy (`packages/core/src/lib/plugin/BasePlugin.ts:321-335`, `packages/core/src/lib/plugin/BasePlugin.ts:481-495`). | `3/3/3/3/3/3/3/3 = 24/40` — product formats exist, canonical state persistence remains Plite-owned. | `5/5/5/5/5/5/4/5 = 39/40` — strict versioned Plite persistence stays canonical while Plate formats remain host policy. | superior — Plite’s strict versioned persistence is decisively superior; Wordgard’s uncovered defect proves why codec laws matter. | Keep versioned structural persistence; product codecs remain noncanonical host formats. | `@platejs/plite`; Plate owns host format policy only. | Joint Plite Plan and Plate Plan. | No execution packet; P-DOC-4/5 use `plate-plan` for product codec ownership. | DOC-001, DOC-011, DOC-013, DOC-017. | P-DOC-2 preserves JSON; P-DOC-4/5 add host round trips. | `5/5/5/5/5/5/5/5 = 40/40` — strict canonical persistence plus proved product codecs closes owner clarity. | `+1` — owner clarity and product codec proof. | Surpass | Keep | Codec packets adopt strict slice input/output; canonical JSON unchanged. | Delete no versioned codec; delete dead/parallel Plate serializers in P-DOC-4/5. | Malformed/unknown version tests, round trips, schema mismatch, history/Yjs persistence, product codec round trips. | Any internal split must preserve JSON bytes/semantics; product codecs must never become canonical state persistence. **Reversal evidence:** Donor persistence must pass malformed-version rejection, schema identity, named-root, history, and Yjs round trips on a fixture where current versioned JSON fails, with stable bytes and no class identity; otherwise structural persistence remains canonical. Reference scope: surpass — Reject Wordgard persistence.. Verdict scope: keep — Keep Plite; rearchitect Plate host codecs separately. |
| DOC-024 | Document-change/history integration | **Current owner: `../wordgard/src/history`.** Its state field maps non-history transactions through both branches, groups/isolate events, serializes done/undone `ChangeSet` plus selections, and rehydrates them against the active schema (`../wordgard/src/history/history.ts:37-95`). | `4/4/3/4/3/3/3/3 = 27/40` — cohesive change/history integration with mapping and JSON, but single-document changes, unversioned payloads, and no named-root or schema-revision identity. | **Current owner: `@platejs/plite-history`.** Canonical inverse batches include effects, selections, named roots, schema identity, revision, and version-4 JSON; state lazily rebases (`packages/plite-history/src/history.ts:24-65`, `packages/plite-history/src/history-state.ts:222-320`, `packages/plite-history/src/history-state.ts:376-425`). | `5/5/5/5/5/5/4/5 = 39/40` — versioned canonical history is complete and Plate adds only product wiring. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate wires history as product behavior but uses Plite `DocumentChange`; it does not define another persistence algebra (`packages/plite-history/src/history.ts:1-15`, `packages/core/src/lib/editor/BaseEditor.ts:86-89`). | `3/3/3/3/3/4/4/4 = 27/40` — product integration value, no rival kernel. | `5/5/5/5/5/5/4/5 = 39/40` — Plite’s versioned, root-aware history integration subsumes Wordgard’s useful branch-mapping lifecycle. | superior — Wordgard is real reverse evidence for keeping change mapping, selection persistence, and history isolation at the state-field integration boundary; Plite surpasses it with canonical inverse batches, named roots, schema revision, and a versioned envelope. This row does not reopen the HC change-algebra decision. | Keep `@platejs/plite-history` over canonical `DocumentChange` and schema identity; preserve Wordgard-proven mapping/isolation/selection invariants as integration tests, not as a second history or change owner. | `@platejs/plite-history`; HC remains owner of generic change law. | Plite Plan. | No execution packet; `architecture-cleanup` updates private imports in P-DOC-2. | DOC-011, DOC-017, DOC-020, DOC-021. | P-DOC-2 and P-DOC-1 adoption. | `5/5/5/5/5/5/5/5 = 40/40` — readonly and private-import adoption closes the history integration point without duplicating HC. | `+1` — private import and readonly clarity over the current combined owner. | Surpass | Keep | History adopts readonly types/internal imports; Plate API behavior unchanged; HC decisions remain untouched. | Delete nothing in history; remove only obsolete public root-change imports during P-DOC-2. | History persistence contract, depth/retention, non-history mapping, isolation, selection/effect inversion, schema invalidation, and undo/redo browser tests. | Internal change splitting could break the exact mapping/serialization lifecycle Wordgard proves valuable; stop if non-history rebases, isolation, selections, effects, or version-4 round trips diverge. Reference scope: surpass — Surpass the donor’s real branch-mapping and JSON integration with versioned named-root history. |
| DOC-025 | Document-change/collaboration integration | **Current owner: `../wordgard/src/collab`.** Its authority-versioned adapter receives ordered updates, acknowledges local changes, transforms remote changes and effects over an unconfirmed queue, then marks the transaction remote and outside history (`../wordgard/src/collab/collab.ts:108-171`). | `4/4/3/4/3/3/3/3 = 27/40` — concrete rebase and lifecycle invariants, but one central authority, numeric versions, single-document `ChangeSet`, and no schema envelope or CRDT persistence. | **Current owner: `@platejs/yjs` over `@platejs/plite`.** Yjs lowers canonical `DocumentChange`, imports Yjs events as changes, and persists schema metadata (`packages/yjs/src/core/change-bridge.ts:21-77`, `packages/yjs/src/core/change-bridge.ts:111-241`, `packages/yjs/src/core/event-change-bridge.ts:1-77`, `packages/yjs/src/core/schema-metadata.ts:10-16`). | `5/5/5/4/5/5/4/5 = 38/40` — canonical bridge is strong; multi-peer ordering remains adapter-owned. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate supplies plugin/product wiring around the Yjs package, while the generic contract stays Plite (`packages/yjs/src/core/change-bridge.ts:1-6`, `packages/core/src/lib/editor/BaseEditor.ts:86-89`). | `4/4/4/4/4/5/4/5 = 34/40` — useful product integration without duplicate CRDT law. | `5/5/5/5/5/5/4/5 = 39/40` — adapter plus canonical kernel cover Wordgard’s queue/rebase lifecycle and add schema-aware CRDT persistence. | superior — Wordgard disproves the prior absence claim and supplies concrete integration invariants: ordered authority versions, local acknowledgement, unconfirmed-change transformation, effect mapping, and remote history exclusion. Plite/Yjs still wins on canonical multi-root changes, schema metadata, event import, and CRDT ownership; this row does not duplicate the HC kernel decision. | Keep canonical Yjs lowering/import and adapter-owned ordering; preserve the donor-proven acknowledgement, mapping, and history-exclusion laws. P-DOC-2 may expose only an intent-specific internal construction bridge, never a second public change algebra. | Generic contract Plite; adapter `@platejs/yjs`; Plate owns product wiring; HC retains change-law ownership. | Joint Plite/Yjs boundary under Plite Plan. | `architecture-cleanup` under `plite-plan` via P-DOC-2. | DOC-011, DOC-017, DOC-021, DOC-023. | P-DOC-2. | `5/5/5/5/5/5/5/5 = 40/40` — a narrow internal Yjs bridge removes root-kernel leakage while retaining explicit remote/local lifecycle laws. | `+1` — narrower internal ownership over the current combined owner. | Surpass | Keep | Yjs event import moves off public `ChangeSet`; remote acknowledgement/rebase/history-exclusion tests become explicit; public Plate wiring and HC law remain unchanged. | Delete Yjs imports of public root-change internals once the narrow bridge lands; do not delete adapter-owned lifecycle handling. | Canonical/event bridge, authority/order rejection, local acknowledgement, unconfirmed rebase and effect mapping, schema identity, remote history exclusion, structural soak, and history-collaboration proof. | A too-wide internal bridge would preserve P-DOC-2 leakage; a too-narrow one could lose donor-proven acknowledgement/rebase/history-exclusion invariants. Stop on either failure and keep the current public bridge until the intent-specific adapter passes. **Reversal evidence:** A donor-proven acknowledgement, unconfirmed-rebase, effect-mapping, or remote-history-exclusion law must be impossible through the intent-specific Yjs bridge, and two independent adapters must require the same wider change contract; only then reopen the public boundary. Reference scope: surpass — Surpass the donor’s real authority-queue integration with schema-aware Yjs while retaining its rebase/history invariants.. Verdict scope: keep — Keep/adopt internal bridge. |
| DOC-026 | Generic host codecs and Plate product adoption | Wordgard DOM parse/serialize is directly coupled to its schema (`../wordgard/src/doc/parse.ts:13-64`, `../wordgard/src/doc/serialize.ts:15-64`). | `3/3/2/3/2/2/3/3 = 21/40`. | Plite DOM already owns slice-native MIME-keyed host codecs and exact clipboard slices (`packages/plite-dom/src/plugin/host-codec.ts:36-155`, `packages/plite-dom/src/plugin/dom-clipboard-runtime.ts:113-210`). | `5/5/5/4/5/5/5/5 = 39/40`. | Plate compiles decode-only parser declarations and separately registers Markdown encode (`packages/core/src/lib/plugins/ParserPlugin.ts:67-127`, `packages/markdown/src/lib/MarkdownPlugin.ts:55-111`). | `3/3/4/3/3/4/3/4 = 27/40`. | `5/5/5/4/4/5/4/5 = 37/40`. | superior — Plite DOM is correct; Plate ownership is split. | Declare inferred MIME-keyed `codecs` inline on `createBasePlugin`; plugin identity supplies owner/key and normal schema target. Preserve exact `ContentSlice`; add no helper/compiler type. | Generic runtime `@platejs/plite-dom`; declarations `@platejs/core` and feature plugins. | Plate Plan with Plite boundary review. | `plate-plan` via P-DOC-4. | DOC-013, DOC-023, DOC-027, DOC-030, and P-DOC-1. | P-DOC-5 and format-family adoption. | `5/5/5/5/5/5/5/5 = 40/40`. | `+3`. | Reject | Rearchitect | Markdown first, then import/export plugins, apps, kits, docs, examples, and clipboard proof; Plite DOM stays stable. | Delete parallel parser/serializer registration and manual Markdown registration; reject `definePlateCodec`, duplicate key, and ordinary targets. | Inference/conflict/lifecycle tests, exact open-slice round trips, clipboard/browser proof, and payload benchmark. | Conflict/fallback order can regress; stop on dual registration or openness loss. |
| DOC-027 | Plate parser surface and open slices | **Current owner: `../wordgard/src/doc`.** `parse.slice` returns tokens with open context (`../wordgard/src/doc/parse.ts:36-64`, `../wordgard/src/doc/parse.ts:437-484`, `../wordgard/src/doc/parse.ts:526-555`). | `4/4/3/3/2/2/3/4 = 25/40` — preserves openness, but exposes tokens and guesses schema context. | **Current owner: `@platejs/plite-dom`.** Plite `HostCodec.parse` returns an exact `ContentSlice`, and insertion fits it once (`packages/plite-dom/src/plugin/host-codec.ts:70-109`, `packages/plite-dom/src/plugin/host-codec.ts:626-695`). | `5/5/5/4/5/5/5/5 = 39/40` — correct generic contract. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate `Parser.deserialize` returns `readonly Descendant[]`; `ParserPlugin` wraps nonempty results with `ContentSlice.closed`, erasing open context (`packages/core/src/lib/plugin/BasePlugin.ts:321-335`, `packages/core/src/lib/plugins/ParserPlugin.ts:67-127`). | `3/4/4/3/4/4/3/4 = 29/40` — useful product pipeline with an unnecessarily narrow return type. | `4/5/4/4/4/5/4/4 = 34/40` — the Plate boundary prevents the generic substrate’s full score. | superior — Wordgard preserves open context but with the wrong representation; Plite has the right representation; Plate must expose it. | Replace Plate `parser` with `PlateCodec.decode: ContentSlice or null`; closed callers explicitly use `ContentSlice.closed`; never accept an array-or-slice union. | `@platejs/core`, compiled to `@platejs/plite-dom`. | Plate Plan. | `plate-plan` via P-DOC-4. | DOC-013, DOC-026, DOC-030. | P-DOC-5 and all format migrations. | `5/5/5/5/5/5/5/5 = 40/40` — slice-native Plate decode restores exact openness and one lifecycle. | `+6` — restores exact open transport and one product lifecycle. | Adopt | Rearchitect | Migrate Markdown first, then every parser plugin, pipeline transform, app/example, kit, and downstream extension. | Delete `Parser`, forced `ContentSlice.closed`, and fragment-array transform contracts after migration; no compatibility bridge. | Type inference; closed/open slice unit round trips; clipboard insertion; Markdown browser import/paste; invalid fit publishes nothing. | Broad parser-plugin break; dual APIs would make ownership worse, so migration must be vertical. **Reversal evidence:** The `PlateCodec.decode` migration is reversed if a bounded parser corpus loses open context, inference, invalid-fit atomicity, Markdown import, or browser paste behavior and no single `ContentSlice` return can restore parity; the existing parser remains until that owner defect is solved. Reference scope: adopt — Adopt explicit slice transport; reject Wordgard tokens and parent guessing.. Verdict scope: rearchitect — Public API rearchitecture. |
| DOC-028 | HTML node codec claims and runtime | Wordgard compiles numeric precedence, element/attribute rules, and wrapper repair (`../wordgard/src/doc/parse.ts:66-239`, `../wordgard/src/doc/parse.ts:247-555`). | `5/4/3/3/2/4/4/4 = 29/40`. | Plite DOM owns generic host lifecycle while fitting remains Plite core (`packages/plite-dom/src/plugin/host-codec.ts:96-155`, `packages/plite-dom/src/plugin/host-codec.ts:626-695`). | `2/3/3/3/3/4/3/4 = 25/40`. | Plate has rich HTML rules but implicit reverse order and decode-only ownership (`packages/core/src/internal/plugin/prepareParserRegistry.ts:55-150`, `packages/core/src/internal/plugin/html-parser-runtime.ts:84-245`). | `4/4/4/3/4/5/4/4 = 32/40`. | `5/5/4/4/4/5/4/4 = 35/40`. | superior — Plate is broader; Wordgard's explicit order exposes a lifecycle gap. | Declare one inferred inline `host.html` contribution on each owning plugin with explicit claims and stable priority. Infer owner/key/normal target; fitting stays in Plite and React rendering stays separate. | `@platejs/core` plus product plugins. | Plate Plan. | `plate-plan` via P-DOC-5. | P-DOC-4, DOC-009/010, and DOC-030. | Bounded plugin-family migrations. | `5/5/5/4/5/5/5/5 = 39/40`. | `+4`. | Adopt | Rearchitect | Core runtime then basic nodes/marks, links/lists, tables/media, annotations, apps, and docs. | Delete old HTML registry/runtime at zero readers; reject `definePlateHtmlNodeCodec`, duplicate key, and ordinary target. | Rule composition/property tests, HTML round trips, browser paste/copy, and large-payload benchmark. | Mark accumulation must not become a false conflict; stop on output or precedence drift. |
| DOC-029 | Rendering, serializer, and host output | **Current owner: `../wordgard/src/doc`.** `Elt` IR, escaping, shape holes, line breaks, and ranked mark-wrapper stacks generate DOM/HTML (`../wordgard/src/doc/shape.ts:18-264`, `../wordgard/src/doc/serialize.ts:109-200`). | `5/4/3/3/2/3/4/4 = 28/40` — cohesive host output, but core-coupled and not React/product extensible. | **Current owner: `@platejs/plite-dom`.** Plite provides generic host serialization through exact slices, not product rendering policy (`packages/plite-dom/src/plugin/host-codec.ts:81-109`, `packages/plite-dom/src/plugin/host-codec.ts:697-730`). | `3/4/4/4/4/5/4/5 = 33/40` — correct generic boundary, intentionally lacks product output rules. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate React/static rendering is a separate product owner (`packages/core/src/static/renderStaticHtml.tsx:20-77`); serializer types exist under `parsers.*` (`packages/core/src/lib/plugin/BasePlugin.ts:359-367`, `packages/core/src/lib/plugin/BasePlugin.ts:481-495`), but bounded `rg -n \"serializer\" packages/core/src` finds no runtime reader. | `4/4/4/4/4/5/4/4 = 33/40` — strong rendering, dead/parallel serialization declaration. | `5/5/4/4/4/5/4/5 = 36/40` — correct rendering split, incomplete codec encode ownership. | superior — Wordgard’s IR is internally neat, but React/product rendering and transport serialization are different responsibilities; Plate should not collapse them. **Concrete reversal evidence:** one typed `Elt`-style IR would have to render React, static HTML, clipboard, and export with identical nested-mark law while its dependency graph contains no UI-to-persistence or persistence-to-React imports; the current split has no such portable IR proof. | Keep React/static rendering; move clipboard/export string serialization into bidirectional Plate codecs; compile mark wrappers as product codec rules. Reverse toward a shared IR only after a four-host corpus and dependency-boundary audit prove identical semantics without cross-owner imports. | React/static owner `@platejs/core`; transport codecs `@platejs/core` on Plite DOM. | Plate Plan. | `plate-plan` via P-DOC-4 and P-DOC-5. | DOC-026, DOC-028, DOC-030. | P-DOC-4 handles formats; P-DOC-5 handles HTML nodes. | `5/5/5/5/5/5/5/5 = 40/40` — live codec encoders replace dead declarations without coupling React rendering. | `+4` — live encoder owner, deletion, and proof. | Reject | Cut | Markdown/format plugins migrate in P-DOC-4; HTML plugin families in P-DOC-5; React components remain unchanged. | Delete unused `parsers.*.serializer` and `parsers.html.serializer` after zero declarations/readers; delete manual Markdown host serializer. | Encode/decode type tests, mark nesting/composition, exact slice round trips, static rendering regression, clipboard/browser and payload proof. | Confusing static HTML rendering with clipboard/export codecs would couple UI to persistence; keep separate owners. **Reversal gate:** the same IR must pass React/static/clipboard/export nested-mark fixtures and a forbidden-import audit; any cross-owner import or divergent output rolls the IR back to separate owners. Reference scope: reject — Reject Elt as core; adopt mark-wrapper compilation only inside HTML codec; keep React policy.. Verdict scope: cut — Cut dead declarations and rearchitect codec serialization. |
| DOC-030 | Codec/rule precedence, target ownership, and conflicts | **Current owner: `../wordgard/src/doc`.** Parser rules carry numeric precedence and compile/cache by schema (`../wordgard/src/doc/parse.ts:146-239`). | `4/4/3/3/3/3/3/3 = 26/40` — explicit order, but identity-coupled and weak diagnostics/lifecycle. | **Current owner: `@platejs/plite-dom`.** Host codec target conflicts are explicit by format, direction, element/property target, owner, and key; configuration validation compiles them (`packages/plite-dom/src/plugin/host-codec.ts:353-553`). | `5/5/5/4/5/5/5/5 = 39/40` — explicit format/direction/schema claims and configuration conflicts are strong, with product composition left to Plate. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate derives parser targets from compiled plugin bindings, but HTML element choice still depends on reverse plugin order (`packages/core/src/lib/plugins/ParserPlugin.ts:27-65`, `packages/core/src/internal/plugin/html-parser-runtime.ts:211-245`, `packages/core/src/internal/plugin/prepareParserRegistry.ts:191-254`). | `3/3/4/3/3/4/3/3 = 26/40` — partial target ownership, implicit HTML precedence. | `4/4/4/4/4/5/4/4 = 33/40` — Plite conflict law is narrowed by Plate’s implicit rule order. | superior — Plite has the right generic claims; Wordgard proves explicit order is valuable; Plate must compile both without importing donor identity. | Compile claims per format/direction/schema target and stable priority tuple; reject equal-priority noncomposable overlap before publication. | Generic claims `@platejs/plite-dom`; product claim compilation `@platejs/core`. | Plate Plan with Plite DOM boundary review. | `plate-plan` via P-DOC-4 and P-DOC-5. | DOC-009, DOC-010, DOC-011, DOC-026. | P-DOC-4 establishes lifecycle; P-DOC-5 adds HTML rule composition. | `5/5/5/5/5/5/5/5 = 40/40` — compiled claims and stable priority remove implicit ownership decisions. | `+7` — deterministic composition, lifecycle, ownership, and proof. | Adopt | Rearchitect | Core compiler, every codec/rule plugin, injected rules, apps and custom extension examples migrate. | Delete implicit reverse-order decisions and any parallel target lists after compiled claims own all directions. | Conflict/unknown-target/equal-priority tests, deterministic permutation property law, revision invalidation, HTML/Markdown browser proof. | Overeager conflicts can reject valid mark accumulation; composability must be modeled, not guessed. **Reversal evidence:** The compiled conflict model is reversed if valid mark/property accumulation still fails deterministic permutations after explicit composability metadata, while current rule composition preserves every round trip; do not ship a compiler that rejects valid product schemas. Reference scope: adopt — Adopt explicit precedence; keep Plite conflict model; reject incidental array order.. Verdict scope: rearchitect — Rearchitect Plate compilation. |
| DOC-031 | Diagnostics and failure isolation | **Current owner: `../wordgard/src/doc`.** Two broad error subclasses plus useful nominal-duplication messages (`../wordgard/src/doc/error.ts:2-6`, `../wordgard/src/doc/schema.ts:241-243`). | `2/2/3/3/1/1/2/2 = 16/40` — messages exist, but failures lack structured owner/phase/lifecycle. | **Current owner: `@platejs/plite` and `@platejs/plite-dom`.** Plite emits immutable schema diagnostics, validation locations, and host-codec lifecycle errors with owner/format/phase (`packages/plite/src/core/schema-compiler.ts:243-275`, `packages/plite/src/core/editor-schema.ts:98-101`, `packages/plite-dom/src/plugin/host-codec.ts:36-54`). | `5/5/5/4/5/5/4/5 = 38/40` — immutable schema and host lifecycle diagnostics are strong, with minor cross-owner clarity debt. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate model/parser compilation adds plugin-key and target diagnostics at configuration time (`packages/core/src/internal/plugin/compilePlateModel.ts:318-365`, `packages/core/src/lib/plugins/ParserPlugin.ts:27-65`). | `4/4/4/4/4/5/4/4 = 33/40` — product owner context exists, codec order/conflict detail remains incomplete. | `5/5/5/4/5/5/4/5 = 38/40` — structured schema/codec diagnostics isolate failures but fitter and codec owner detail is incomplete. | superior — Current structured lifecycle errors are stronger; Wordgard’s duplicate-type hint is evidence against nominal architecture. | Keep immutable diagnostics; codec/fitter packets report owner, phase, format/target, schema revision, and cause at their existing lifecycle boundary. | Plite schema/DOM and Plate compiler at their respective boundaries. | Joint Plite Plan and Plate Plan. | No execution packet; P-DOC-3 uses `plite-plan` and P-DOC-4/5 use `plate-plan`. | DOC-011, DOC-014, DOC-026, DOC-030. | P-DOC-3, P-DOC-4, P-DOC-5. | `5/5/5/5/5/5/5/5 = 40/40` — owner/phase/revision diagnostics close the failure-isolation gaps. | `+2` — fitter/codec failure context and publication isolation. | Surpass | Keep | New compiled owners use existing lifecycle reporting and immutable diagnostic patterns. | Delete generic/duplicate parser-order errors replaced by compiled owner diagnostics. | Configuration failure atomicity, malformed input, codec phase delegation, unfit slice no-publication tests. | Diagnostics must not retain editors/large payloads or leak mutable callbacks. **Reversal evidence:** Immutable diagnostics must retain an editor or large payload, miss the responsible owner/phase on the malformed-input corpus, or obscure a cause that donor-local errors identify with bounded retention; that observed failure reopens diagnostic placement. Reference scope: surpass — Reject donor error taxonomy; retain one useful message idea only.. Verdict scope: keep — Keep/extend. |
| DOC-032 | Caches, locality, memory, and structural sharing | **Current owner: `../wordgard/src/doc`.** Apply/schema/rule caches plus a strong `Map<Doc,...>` position cache (`../wordgard/src/doc/change.ts:107-153`, `../wordgard/src/doc/schema.ts:12-15`, `../wordgard/src/doc/schema.ts:323-338`, `../wordgard/src/doc/parse.ts:146-176`, `../wordgard/src/doc/pos.ts:265-272`). | `3/3/3/3/1/1/2/1 = 17/40` — some reuse, but strong document retention and no locality benchmark. | **Current owner: `@platejs/plite`.** Weak prepared-slice caches, lazy snapshot indexes/segment compaction, and explicit slice-fit/content locality benchmarks (`packages/plite/src/core/content-slice.ts:22-25`, `packages/plite/src/core/content-slice.ts:327-395`, `packages/plite/src/core/snapshot-index.ts:1196-1264`, `benchmarks/editor/benchmarks/plite-content-slice-value-benchmark.ts:127-230`, `benchmarks/editor/benchmarks/plite-fit-content-locality-benchmark.ts:221-280`). | `5/5/4/5/5/5/4/5 = 38/40` — weak caches, lazy indexes, and measured locality are strong, with minor type and owner debt. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate prepared parser registries cache by plugin list and model revision with weak/editor-owned maps (`packages/core/src/internal/plugin/prepareParserRegistry.ts:55-66`, `packages/core/src/internal/plugin/prepareParserRegistry.ts:191-254`). | `3/3/3/3/3/4/3/4 = 26/40` — reasonable product cache, explicitly consolidated by P-DOC-4. | `5/5/4/5/5/5/4/5 = 38/40` — weak/revision caches and measured locality are strong while owner consolidation remains. | superior — Plite has better retention discipline and measured locality; Wordgard’s strong cache is a warning. | Preserve weak/revision-keyed caches; bind fitter/codec caches to immutable publication objects and discard atomically. | Plite core/DOM and Plate compiled model. | Joint Plite Plan and Plate Plan. | No execution packet; owning packets use `architecture-cleanup`, `plite-plan`, or `plate-plan`. | DOC-011, DOC-014, DOC-019, DOC-026. | All changed packets. | `5/5/5/5/5/5/5/5 = 40/40` — one weak revision-bound cache per owner closes type and retention gaps. | `+2` — explicit owner and retention gates. | Surpass | Keep | Packet owners move caches with their compiled artifact; no global document-keyed map. | Delete old monolith/parser caches only when replacement cache identity and invalidation are proved. | Retention/GC-sensitive tests where available; slice/change/fitter/clipboard locality benchmarks; revision invalidation. | Module moves can accidentally multiply caches or retain editor snapshots; benchmark and heap/retention audits are required. **Reversal evidence:** Heap and locality proof must show revision-keyed weak caches materially regress repeated fit, change, or clipboard workloads while a bounded strong-cache design releases every obsolete snapshot after reconfiguration; only then reconsider cache ownership. Reference scope: surpass — Reject donor caches; surpass.. Verdict scope: keep — Keep and consolidate. |
| DOC-033 | Tests, generated laws, browser proof, and benchmarks | **Current owner: `../wordgard/src/doc`.** Deterministic examples plus unseeded random OT loops and browser parse/serialize tests; no assigned benchmark or shrinker (`../wordgard/test/test-change.ts:23-547`, `../wordgard/test/webtest-serialize.ts:8-259`). | `4/3/2/2/1/2/3/3 = 20/40` — valuable cases, but nondeterministic and incomplete persistence/host coverage. | **Current owner: `@platejs/plite`.** Seeded generated change, content-slice, and fitter laws plus history/Yjs/DOM suites and locality benchmarks (`packages/plite/test/document-change-laws.test.ts:455-799`, `packages/plite/test/content-slice-laws.test.ts:81-197`, `packages/plite/test/slice-fit-laws.test.ts:300-609`, `benchmarks/editor/benchmarks/plite-content-slice-value-benchmark.ts:127-230`). | `5/5/5/5/5/5/4/5 = 39/40` — broad, reproducible architecture proof. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate has product parser/HTML/plugin tests and browser surfaces, but current split lacks one bidirectional codec conflict/round-trip proof owner (`packages/core/src/lib/plugins/ParserPlugin.ts:67-127`, `packages/core/src/internal/plugin/html-parser-runtime.ts:211-245`). | `4/4/4/3/4/5/4/4 = 32/40` — good product coverage with codec architecture gaps. | `5/5/5/5/5/5/4/5 = 39/40` — seeded laws and benchmarks are broad but packet-specific public and codec proof is missing. | superior — Current proof is stronger; Wordgard cases may be mined only where they add a current law. | Each changed packet adds focused unit, generated laws, browser proof if host-facing, and benchmark only where runtime/locality can change. | Proof stays with each owning package and apps/plite/browser harness. | Owning Plite Plan or Plate Plan per packet. | Owning packet skills: `plite-plan`, `plate-plan`, `testing`, and `performance` where scoped. | Every changed concept. | P-DOC-1 through P-DOC-5. | `5/5/5/5/5/5/5/5 = 40/40` — packet-specific unit, generated, browser, and benchmark gates complete proof ownership. | `+1` — closes public-type and codec conflict/browser gaps. | Surpass | Gate | Tests move with owners; new proof is packet-specific, not one ceremonial suite. | Delete no behavioral laws; delete architecture-only exposure tests only when the old API is intentionally cut. | Detailed in each dossier. | False confidence from broad suites is the risk; every packet requires symptom/owner-specific proof. **Reversal evidence:** A donor fixture must expose a reproducible current semantic, host, or locality failure that the packet's focused unit, generated-law, browser, and benchmark gates all miss; then adopt that fixture and revise the deficient proof gate. Reference scope: surpass — Surpass Wordgard proof; adopt only unique cases after deduplication.. Verdict scope: gate — Keep/extend. |
| DOC-034 | Physical module ownership and public export hygiene | **Current owner: `../wordgard/src/doc`.** Thirteen document files give recognizable local owners, though DOM remains wrongly coupled to schema; barrel exports every public mechanism (`../wordgard/src/doc/index.ts:22-66`). | `4/4/3/3/3/2/4/3 = 26/40` — good navigation, wrong package boundaries. | **Current owner: `@platejs/plite`.** `document-change.ts` contains token/index/root-change/change/builder/classification owners, `editor-schema.ts` mixes schema API and fitter, and root index exports `ChangeSet` (`packages/plite/src/core/document-change.ts:96-230`, `packages/plite/src/core/document-change.ts:1210-1566`, `packages/plite/src/core/document-change.ts:3237-3333`, `packages/plite/src/core/document-change.ts:5267-5832`, `packages/plite/src/index.ts:33-39`, `packages/plite/src/core/editor-schema.ts:105-180`). | `5/5/5/5/4/5/1/5 = 35/40` — semantics/proof excellent, ownership/navigation poor. | **Current owner: `@platejs/core` plus the cited Plate product package when present.** Plate splits parser, serializer declarations, HTML registry/runtime, Markdown manual codec, and static rendering (`packages/core/src/lib/plugin/BasePlugin.ts:321-367`, `packages/core/src/lib/plugin/BasePlugin.ts:481-495`, `packages/core/src/lib/plugins/ParserPlugin.ts:67-127`, `packages/markdown/src/lib/MarkdownPlugin.ts:55-111`). | `4/4/4/4/4/5/3/4 = 32/40` — capable but split product ownership. | `5/5/5/5/4/5/2/5 = 36/40` — behavior is strong; public/internal ownership remains needlessly hard to navigate. | superior — Wordgard’s file cohesion is worth adopting, not its DOM/core or nominal package architecture. | Split Plite private `core/change/*` and `core/slice-fit/*`; compile one Plate codec owner; remove old exports/owners in the same vertical packets. | Plite internal modules and Plate core codec compiler. | Plite Plan for P-DOC-2/3; Plate Plan for P-DOC-4/5. | `architecture-cleanup` under the owning plan; `plate-plan` for public codec redesign. | P-DOC-1 type names; DOC-014-016 and DOC-026-030. | P-DOC-2, P-DOC-3, P-DOC-4, P-DOC-5. | `5/5/5/5/5/5/5/5 = 40/40` — cohesive private modules and one Plate codec owner remove duplicate and export leaks. | `+4` — physical ownership, lifecycle, deletion, and DX. | Adopt | Cut | Full routing is specified in packet dossiers; no source implementation belongs in this audit. | Delete old definitions, exports, docs, registries, and compatibility owners only after each vertical packet’s adoption gate. | Package graph/typecheck, export guards, unchanged behavioral laws/benchmarks, product browser proof. | Cross-module cycles, dual owners, and half-migrated public APIs; packets must be vertical and reversible by commit. **Reversal evidence:** The module split is reversed if the package graph gains a cycle, import depth or cache count increases, a private export leaks, or behavior/benchmark proof changes despite vertical migration; retain the current colocation until ownership can move atomically. Reference scope: adopt — Adopt cohesion; reject Wordgard’s public/package boundaries.. Verdict scope: cut — Move/cut/rearchitect. |

#### Reverse-evidence tests for keep/reject rows

- **DOC-001:** Reverse only if Wordgard can express named-root structural JSON and pass current persistence/history/Yjs laws without class identity.
- **DOC-002:** Reverse only if a live compiled-fact or reconfiguration law fails and a structural, nonnominal Wordgard mechanism fixes it.
- **DOC-003:** Reverse only on a reproducible property persistence, inference, lifecycle, or merge failure that Wordgard’s mark algebra actually solves.
- **DOC-005:** Reverse only on a canonicalization/default/text-join failure not expressible by the current schema-aware constructor.
- **DOC-006:** Reverse only if Plite’s lazy runtime identity violates an injectivity/move/history law and nominal identity can solve it across package copies and persistence.
- **DOC-008:** Reverse only on a typed traversal/text-output law that current root-aware `NodeApi` cannot express and Wordgard can.
- **DOC-009:** Reverse only if structural contribution composition fails a product schema case that nominal identity solves without breaking persisted identity or reconfiguration.
- **DOC-010:** Reverse only if a current group/query/target/content law fails and the donor algebra supplies a structural, cycle-safe solution.
- **DOC-011:** Reverse only if current semantic fingerprints/revisions fail durable history or reconfiguration while the donor weak/nominal cache succeeds.
- **DOC-012:** Reverse only on a wrapper/default/correction construction case that current compiled plans cannot represent; a fixture may be adopted without changing ownership.
- **DOC-013:** Reverse only if an exact openness/round-trip/variant law fails in `ContentSlice` and requires public tokens rather than a private preparation fix.
- **DOC-017:** Reversal requires a source-current Wordgard multi-root lifecycle stronger than `DocumentChange`; none exists in `../wordgard/src/doc/index.ts:22-66`.
- **DOC-018:** Reverse only if opaque atomic specs block a required valid transaction and donor construction admits it without permitting invalid publication.
- **DOC-019:** Reverse only if a structural-sharing/classification/runtime-ID law fails and Wordgard’s one-entry apply cache fixes it under the same root model.
- **DOC-020:** Reverse only on a seeded compose/invert/associativity counterexample that Wordgard passes under the same roots, properties, and schema context.
- **DOC-021:** Reverse only on a reproducible transform/rebase/convergence failure Wordgard fixes under equivalent roots, properties, correction, and history replay.
- **DOC-022:** Reverse only on a root-aware mapping/anchor/runtime-ID law that Plite fails and donor token mapping solves without public global offsets.
- **DOC-023:** Reverse only if strict versioned Plite round trips fail a durable-format case Wordgard passes; Wordgard’s live modification-key defect (`../wordgard/src/doc/change.ts:204-231`, `../wordgard/src/doc/change.ts:554-559`) is contrary evidence.
- **DOC-024:** Wordgard’s real history field maps non-history transactions, groups/isolates events, and persists changes plus selections (`../wordgard/src/history/history.ts:37-95`). Reverse only if those invariants expose a current Plite-history failure that survives named roots, schema identity, effects, and version-4 round trips.
- **DOC-025:** Wordgard’s real authority adapter acknowledges local changes, rebases remote changes/effects over unconfirmed work, and excludes remote transactions from history (`../wordgard/src/collab/collab.ts:108-171`). Reverse only if an accepted invariant cannot be expressed through the canonical Plite/Yjs bridge without widening the public change algebra.
- **DOC-031:** Reverse only if a structured owner/phase failure cannot isolate an error and the donor’s two-class taxonomy demonstrably can.
- **DOC-032:** Reverse only with retention/locality measurements showing the donor strong document cache beats weak/revision caches without retaining documents.
- **DOC-033:** Reverse the proof verdict only if a donor test exposes an unrepresented live law; that adopts the case, not the donor architecture.

## Normalized STATE ledger

Score order is `semantics/composition/types/runtime/lifecycle/host-fitness/ownership-DX/proof`, each dimension `0–5`, total `/40`. STATE-001 is intentionally limited to atomic state/read/update lifecycle; readonly public document/location types are owned by DOC-004/DOC-007 so the master ledger does not score that decision twice.

| ID | Mechanism | Wordgard shape and evidence | Wordgard score | Current Plite shape and evidence | Plite score | Current Plate shape and evidence | Plate score | Current combined score | Comparison | Proposed shape | Target owner | Decision owner | Execution skill | Dependencies | Dependent packets | Target score | Gain | Reference disposition | Local verdict | Adoption | Deletion | Proof | Risk |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| STATE-001 | Atomic editor state, read view, update draft, and publication | Current Wordgard owner: `GardState`. It stores an immutable document/configuration/selection/field array, derives facets lazily, and publishes through `update`/`applyTransaction`; HTML/string/DOM ingress is mixed into creation at `../wordgard/src/state/state.ts:10-209`. | `4/4/4/4/4/3/3/3=29` — coherent immutable snapshots, but state creation owns host parsing, one document, and lightly proved lifecycle. | Current Plite owner: public state/update runtime. `state.read` is immutable, `state.transaction` creates pure specs, and `editor.update` exposes a transaction-local draft before one commit at `packages/plite/src/interfaces/editor.ts:1060-1154`; rollback/atomic visibility is proved at `packages/plite/test/transaction-contract.ts:135-302`. | `5/5/5/5/5/5/5/5=40` — atomic draft isolation, rollback, and one canonical commit are explicit and proved. | Current Plate owner: no independent state kernel; `packages/core/src/lib/editor/withPlite.ts:320-412` compiles Plate product plugins into Plite extensions and consumes the Plite state/update lifecycle. | `4/4/5/4/4/5/4/4=34` — strong typed product adapter, but it correctly delegates generic state semantics and carries less direct substrate proof. | `5/5/5/5/5/5/5/5=40` — Plite supplies complete state law while Plate adds product configuration without a second state object. | superior — Plite is genuinely stronger, not merely broader: it adds isolated drafts, rollback, roots, commits, and explicit owner boundaries. Reverse only if a current atomicity/rollback law fails. | Keep the current `state.read` / `state.transaction` / `editor.update` split. DOC-004 separately makes published values readonly; do not introduce `GardState`. | `packages/plite` | Plite Plan | No execution packet; `plite-plan` P-DOC-1 owns readonly adoption. | Canonical `DocumentChange`, selection protocol, extension registry; DOC-004/DOC-007 own value types | P-DOC-1 consumes this lifecycle without changing it | `5/5/5/5/5/5/5/5=40` — current lifecycle already reaches the target; readonly type truth is scored in DOC. | `+0` — no state-lifecycle deficit remains. | Surpass | Keep | Preserve APIs; Plate and hosts adopt only DOC readonly types. | No current owner deleted; permanently reject a second `GardState` and HTML parsing inside state construction. | Existing transaction atomicity, rollback, stale-spec, and commit contracts; browser N/A because no host behavior changes. | Main risk is a future caller mutating published nodes; DOC-004 owns that prevention. Evidence that reverses keep: a reproducible partial-publication or rollback failure. |
| STATE-002 | State/document/selection persistence and ingress ownership | Current Wordgard owner: `GardState.create`, `.toJSON`, and `.fromJSON`. It accepts JSON, HTML strings, or DOM and serializes document, selection, and opt-in fields at `../wordgard/src/state/state.ts:10-39` and `../wordgard/src/state/state.ts:215-250`. | `3/3/3/3/3/2/3/3=23` — useful convenience, but parsing, state, field persistence, and selection identity are coupled and unversioned. | Current Plite owners: selection/effect/value codecs and strict state ingress. Versioned selection/effect/value envelopes and descriptor policy live at `packages/plite/src/interfaces/editor.ts:222-325`; registered value decoding is strict at `packages/plite/src/core/value-codec.ts:234-420`. | `5/5/5/5/5/5/5/4=39` — generic persistence is strict and versioned; proof is broad but distributed across value, selection, field, history, and Yjs suites. | Current Plate owner: product parsing, not persistence algebra. `packages/core/src/lib/plugins/ParserPlugin.ts:18-127` resolves product parser input before handing structural content to Plite; no independent Plate state envelope exists in audited `packages/core/src`. | `4/4/5/4/4/5/4/4=34` — correct product ingress ownership and typing, with persistence delegated to Plite. | `5/5/5/5/5/5/5/4=39` — strict Plite envelopes plus Plate-owned parsing beat the donor coupling; one point remains for distributed proof discoverability. | superior — Plite/Plate are genuinely stronger: format parsing and generic persistence have separate owners. Reverse only if a durable round trip cannot preserve a registered selection/field/effect. | Keep strict Plite codecs and Plate-owned format ingress; never accept DOM/HTML as a generic state constructor input. P-DOC-4 owns the improved Plate codec surface. | Plite codec registry; Plate parser/codec consumers | Plite Plan for generic codecs; Plate Plan for product ingress | `plate-plan` via P-DOC-4. | Schema identity, selection kinds, state-field/effect descriptors | P-DOC-4 and P-DOC-5 | `5/5/5/5/5/5/5/5=40` — one slice-native Plate codec API closes proof/ownership discoverability without changing state. | `+1` — product ingress consolidation only. | Surpass | Keep | Plate parsers/codecs migrate under P-DOC-4; state/history/Yjs retain strict envelopes. | Reject `DocSource` HTML/DOM/string ingress in state and any duplicate Plate persistence envelope. | Value/selection/effect/field/history/Yjs JSON round trips and malformed-input diagnostics; browser only in P-DOC-4 format proof. | Risk is parsing policy leaking into Plite state. Reverse evidence: a generic non-product ingress law that cannot use `ContentSlice`/codecs. Verdict scope: keep — keep; bridge to DOC codec packet. |
| STATE-003 | Transaction specification, sibling/sequential composition, and commit construction | Current Wordgard owner: `Transaction`. It merges sibling or sequential specs, lazily resolves next state, maps selection/effects, and permits extenders/appenders at `../wordgard/src/state/transaction.ts:5-187` and `../wordgard/src/state/transaction.ts:351-397`. | `4/4/4/4/3/3/4/4=30` — coherent composition and tests, but appenders add hidden post-resolution mutation and the model is single-document. | Current Plite owner: pure `state.transaction` specs plus live `editor.update` drafts at `packages/plite/src/interfaces/editor.ts:1087-1154`; stale/cross-editor/continuation guards are proved at `packages/plite/test/command-spec.test.ts:1174-1395`. | `5/5/5/5/5/5/5/5=40` — explicit pure versus live paths, one editor binding, canonical commit, and exhaustive guards. | Current Plate owner: product transaction groups and command handlers. `packages/core/src/lib/plugin/BasePlugin.ts:550-576` declares typed shortcuts/input rules/transaction groups that execute through the Plite transaction owner. | `4/4/5/4/4/5/5/4=35` — excellent product composition/DX, but generic atomicity remains delegated and Plate proof is feature-distributed. | `5/5/5/5/5/5/5/5=40` — Plite supplies complete semantics and Plate adds typed product composition without a second resolver. | superior — Plite is genuinely stronger; Wordgard's compact merge appears cleaner because it omits root/schema/commit guards. Reverse only with a failing pure-spec composition law. | Keep the pure spec/live draft split and Plate transaction groups. Reject extenders/appenders; named corrections and command continuations own post-processing. | `packages/plite`; Plate product plugins consume | Plite Plan | No execution packet. | DocumentChange builder, command registry, schema/correction runtime | Feature-update packets consume unchanged transactions. | `5/5/5/5/5/5/5/5=40` — current split and proof already meet target. | `+0` — no accepted transaction change. | Surpass | Keep | None beyond feature-update adoption using current specs. | Never add `Transaction.extender`/`appender` or expose resolution helpers. | Command-spec and transaction contracts; browser N/A because no host behavior changes. | Risk is hidden second commit paths. Reverse evidence: a reproducible composition need that cannot be expressed as one spec or named continuation. |
| STATE-004 | Transaction annotations, effects, mapping, and update policy | Current Wordgard owner: `Transaction.Annotation` and `Transaction.Effect`; values use nominal type identity, optional position mapping, and built-in time/user-event/history/remote tags at `../wordgard/src/state/transaction.ts:189-348`. | `4/4/4/4/3/3/3/4=29` — typed and mappable, but identity-only persistence and no explicit collaboration/replay lifecycle. | Current Plite owners: effect descriptors and update tags. Descriptors declare history, collaboration, replay, map, invert, and codecs at `packages/plite/src/interfaces/editor.ts:271-325`; immutable clone/map/invert enforcement is at `packages/plite/src/core/transaction-values.ts:8-129`. | `5/5/5/5/5/5/5/5=40` — every cross-lifecycle behavior is explicit, registered, immutable, and proved. | Current Plate owner: no independent effect algebra; Plate plugins emit Plite transaction values through the adapter at `packages/core/src/lib/editor/withPlite.ts:320-412`. | `4/4/5/4/4/5/4/4=34` — strong typed consumer, correctly absent as a generic owner. | `5/5/5/5/5/5/5/5=40` — Plite owns the complete generic lifecycle and Plate does not duplicate it. | superior — Genuinely stronger: extra surface represents required history/collaboration/replay law, not accidental breadth. Reverse only if a registered descriptor cannot express an accepted effect lifecycle. | Keep current descriptors and update policy; product packages define only product effect values against the generic contract. | `packages/plite` | Plite Plan | No execution packet. | Value codecs, DocumentChange mapping, history and Yjs registries | HC collaboration/history packets retain this owner | `5/5/5/5/5/5/5/5=40` — no semantic gap. | `+0` — no change. | Surpass | Keep | None; accepted history/Yjs work must preserve descriptor contracts. | Reject nominal identity-only effects and unserialized shared values. | Existing effect map/invert/codec/history/collaboration tests; browser N/A for value algebra. | Risk is a product marking a shared effect replayable without codecs. Reverse evidence: failing registered effect round trip. |
| STATE-005 | Canonical change builder and finalization | Current Wordgard owner: transaction resolution delegates to `ChangeSet` specs and composes resulting changes at `../wordgard/src/state/transaction.ts:93-136` and `../wordgard/src/state/transaction.ts:351-397`. | `4/4/4/4/3/3/3/3=28` — solid composition, but no multi-root builder/finalization boundary or strict public/private split. | Current Plite owner: `DocumentChangeBuilder`, indexed drafts, validation, prepared adoption, and one finalization boundary at `packages/plite/src/core/document-change.ts:6229-6550` and `packages/plite/src/core/document-change.ts:6870-7164`. | `5/5/5/5/5/5/5/5=40` — canonical construction and finalization cover roots, properties, validation, and atomic publication. | Current Plate owner: no change builder; product transaction groups call Plite updates through `packages/core/src/lib/editor/withPlite.ts:320-412`. | `4/4/5/4/4/5/4/4=34` — correct absence as generic owner; product APIs remain typed. | `5/5/5/5/5/5/5/5=40` — the combined stack has one mutation truth. | superior — Plite is genuinely stronger. Wordgard's builder path is shorter because it omits roots/properties/commit consumers. Reverse only if a canonical builder law fails. | Keep the canonical builder; P-DOC-2 makes it private/internal while leaving `DocumentChange` public. | `packages/plite` | Plite Plan | `architecture-cleanup` under `plite-plan` via P-DOC-2. | Indexed document, schema construction, readonly inputs from P-DOC-1 | P-DOC-3 and Yjs adoption | `5/5/5/5/5/5/5/5=40` — semantic target already met; only ownership moves in DOC. | `+0` — state semantics unchanged. | Surpass | Keep | Plite/Yjs internal imports adopt P-DOC-2; Plate unchanged. | P-DOC-2 removes public builder/kernel leakage; no state helper deletion. | Builder/change laws, history/Yjs integration, public-surface tests; browser N/A. | Risk is bypassing finalization via a leaked internal import. Reverse evidence: an external consumer with a generic need that `DocumentChange` cannot express. Verdict scope: keep — keep; move internally under DOC. |
| STATE-006 | Change compose, invert, and durable serialization | Current Wordgard owner: transaction/change integration composes changes but persistence remains the Wordgard unversioned change encoding at `../wordgard/src/state/transaction.ts:351-397` and `../wordgard/src/doc/change.ts:204-231`. | `4/4/4/4/4/3/3/4=30` — serious algebra, but single-root and the mark-modification JSON reader/writer disagree. | Current Plite owner: `DocumentChange` create/apply/compose/invert/strict versioned JSON at `packages/plite/src/core/document-change.ts:5267-5849`. | `5/5/5/5/5/5/5/5=40` — one versioned multi-root algebra feeds commits, history, selection, and Yjs. | Current Plate owner: absent as an independent algebra; Plate consumes canonical commits through `packages/core/src/lib/editor/withPlite.ts:320-412`. | `4/4/5/4/4/5/4/4=34` — correct delegation with typed product calls. | `5/5/5/5/5/5/5/5=40` — one complete mutation/persistence owner. | superior — Genuinely stronger; current consumers and strict codecs justify the extra implementation. Reverse only with a failing compose/invert/JSON law. | Keep `DocumentChange`; P-DOC-2 removes `ChangeSet` from the public surface. | `packages/plite` | Plite Plan | `architecture-cleanup` under `plite-plan` via P-DOC-2. | Schema identity, DocumentChange builder | History/Yjs consumers and P-DOC-3 | `5/5/5/5/5/5/5/5=40` — semantics already complete. | `+0` — public ownership cleanup scored in DOC. | Surpass | Keep | Internal Plite/history/Yjs adopt private bridge; Plate unchanged. | Delete public `ChangeSet` only under P-DOC-2 gates. | Generated compose/invert/round-trip laws, history persistence, Yjs bridge; browser N/A. | Risk is durable JSON drift during module moves. Reverse evidence: reproducible algebra or persistence mismatch. Verdict scope: keep — keep; cut lower algebra publicly. |
| STATE-007 | Transform, rebase, and position mapping | Current Wordgard owner: `mergeTransaction` distinguishes sibling transform from sequential composition and maps selection/effects at `../wordgard/src/state/transaction.ts:351-397`. | `4/4/4/4/3/3/3/4=29` — correct pairwise idea, but single-root and lacking property/runtime-ID consumers. | Current Plite owner: `DocumentChange.transform`, move/property conflicts, and root-aware mapping at `packages/plite/src/core/document-change.ts:3539-3801` and `packages/plite/src/core/document-change.ts:5581-5780`. | `5/5/5/5/5/5/5/5=40` — structural multi-root mapping feeds selection, history, collaboration, and commits with generated proof. | Current Plate owner: no transform algebra; product features consume Plite change mapping through `packages/core/src/lib/editor/withPlite.ts:320-412`. | `4/4/5/4/4/5/4/4=34` — correct product-only role. | `5/5/5/5/5/5/5/5=40` — one generic transform truth, no duplicate Plate protocol. | superior — Genuinely stronger; Wordgard's simplicity comes from a narrower change vocabulary. Reverse only if a current transform/convergence case fails. | Keep pairwise transform in Plite; adapters own multi-peer ordering. HC packets prove collaborative use without adding an authority queue. | `packages/plite`; adapter ordering in `packages/yjs` | Plite Plan | `tdd` under `plite-plan` via HP-02. | DocumentChange, property policies, effect descriptors | HP-02/HP-03 history chain | `5/5/5/5/5/5/5/5=40` — no generic change. | `+0` — proof is owned by HC. | Surpass | Keep | HC differential proof exercises the owner; no new API. | Reject Wordgard authority queue in core. | Transform/rebase generated laws and HC seeded multi-peer proof; browser only for collaboration product proof. | Risk is position bias divergence under concurrency. Reverse evidence: minimized failing seed trace. Reference scope: surpass — adopt principle; surpass implementation. |
| STATE-008 | Structural corrections and normalization worklist | Current Wordgard owner: `Correction`. It scans change events, matches ancestors/marks, caches one plan, and emits sequential extender changes at `../wordgard/src/state/correction.ts:5-167`. | `4/4/4/3/3/3/4/4=29` — clear event matching, but tied to extenders and only one cached scan. | Current Plite owner: correction worklist. Stable targets are remapped by runtime identity, reclassified after mutation, bounded, and cycle-detected at `packages/plite/src/editor/correct-document.ts:36-454`. | `5/5/5/5/5/5/5/5=40` — deterministic bounded convergence and rollback are explicit. | Current Plate owner: product correction contributions compiled through the plugin/schema adapter at `packages/core/src/internal/plugin/compilePlateModel.ts:318-547`; table is a product correction consumer. | `5/5/5/5/5/5/5/4=39` — correct product contribution owner; proof is package-distributed. | `5/5/5/5/5/5/5/5=40` — generic worklist plus product contributions cover the full lifecycle. | superior — Plite is genuinely stronger; Plate is broader because it legitimately owns product invariants. Reverse only if a donor correction case exposes non-convergence or a missing event. | Keep the Plite worklist; TABLE-P2 may replace table-local whole-table repair with focused plans without changing generic correction law. | `packages/plite`; product rules in Plate packages | Plite Plan for substrate; Plate Plan for feature corrections | `major-task` plus `tdd` under `plate-plan` via TABLE-P2. | Runtime IDs, DocumentChange classification, schema contributions | TABLE-P2 | `5/5/5/5/5/5/5/5=40` — generic target already met. | `+0` — table locality is scored in TABLE. | Surpass | Keep | Table adopts its canonical planner; other Plate plugins unchanged. | Reject appenders/extenders and duplicate generic correction loops. | Correction convergence/cycle/rollback laws; table property proof in TABLE-P2; browser N/A for generic worklist. | Risk is non-terminating product correction. Reverse evidence: minimized cycle or missed stable target. |
| STATE-009 | State fields, persistence, history, and collaboration policy | Current Wordgard owner: `GardState.Field`. Fields declare create/update/compare/provide and optional JSON, with instance slot assignment at `../wordgard/src/state/state.ts:316-420`. | `4/4/4/4/4/3/4/4=31` — capable, but nominal slot identity and incomplete history/collaboration policy. | Current Plite owner: keyed frozen state-field descriptors with versioned persistence, history/collaboration policy, and invertible transition effects at `packages/plite/src/core/state-field.ts:14-149`. | `5/5/5/5/5/5/5/5=40` — stable keys and all lifecycle policies are explicit and proved. | Current Plate owner: no independent field runtime; feature plugins contribute Plite-backed state through `packages/core/src/lib/editor/withPlite.ts:320-412`. | `4/4/5/4/4/5/4/4=34` — correct consumer role; product proof is feature-local. | `5/5/5/5/5/5/5/5=40` — one generic field lifecycle with product extensions. | superior — Genuinely stronger, not merely broader. Reverse only if a keyed field cannot express an accepted feature transition. | Keep keyed fields and explicit codecs/policies; no `GardState.Field` compatibility layer. | `packages/plite` | Plite Plan | No execution packet. | Effect/value codecs, history and Yjs descriptor registries | HC proof consumes unchanged fields | `5/5/5/5/5/5/5/5=40` — complete current contract. | `+0` — no change. | Surpass | Keep | None; collaboration/history packets preserve the field contract. | Reject instance-slot identity and unversioned field JSON. | Field/facet persistence, reconfiguration, history/collaboration tests; browser N/A. | Risk is descriptor key collision or unregistered codec. Reverse evidence: failing field reconfiguration/round trip. |
| STATE-010 | Facet declaration and provider aggregation | Current Wordgard owner: `GardState.Facet`. It supports `of`, `compute`, `computeN`, `from`, equality, static/dynamic providers, and custom combination at `../wordgard/src/state/state.ts:422-550`. | `5/5/5/4/4/3/4/5=35` — excellent ergonomics and tests, but anonymous instance identity and hidden dependencies weaken lifecycle. | Current Plite owner: keyed immutable facet descriptors/providers with explicit `of`/`compute` and stable aggregation at `packages/plite/src/interfaces/editor.ts:327-371` and `packages/plite/src/core/facet.ts:203-233`. | `5/4/5/5/5/5/5/5=39` — deliberately smaller API improves identity/lifecycle; one composition point is withheld for fewer convenience combinators. | Current Plate owner: plugin options/facets compile into Plite extensions through `packages/core/src/lib/editor/withPlite.ts:320-412`; no second facet runtime exists. | `4/4/5/4/4/5/4/4=34` — correct delegation and good product typing. | `5/4/5/5/5/5/5/5=39` — current explicit dependency model is safer; missing sugar is not a semantic gap. | superior — Plite is genuinely stronger on lifecycle/ownership while Wordgard is more convenient. Reverse only if two real generic consumers require the same missing combinator without hiding dependencies. | Keep explicit keyed facets; do not add `computeN`, `from`, static facet magic, or arbitrary `combineConfig`. | `packages/plite` | Plite Plan | No execution packet. | Extension registry and explicit facet dependencies | None | `5/4/5/5/5/5/5/5=39` — target intentionally preserves explicit composition tradeoff. | `+0` — convenience is not sufficient value. | Reject | Keep | None. | Non-adopt Wordgard sugar/identity model; no current code deletion. | Provider order/equality/reconfiguration tests; browser N/A. | Risk is under-declared dependency. Reverse evidence: repeated boilerplate across independent substrate consumers with equal proof. Reference scope: reject — reject donor sugar; surpass lifecycle. |
| STATE-011 | Facet dependency cache and invalidation | Current Wordgard owner: facet reader/dependency slots. It records direct reads automatically, resolves dynamic/static slots, and detects cycles at `../wordgard/src/state/state.ts:865-1082`. | `4/4/4/4/4/3/3/5=31` — strong tests and ergonomics, but hidden read tracking is fragile under refactoring and instance identity. | Current Plite owner: explicit document/root/selection/schema/field/facet dependency revisions and transaction-local caches at `packages/plite/src/core/facet.ts:94-162` and `packages/plite/src/core/facet.ts:235-359`; draft rollback isolation is proved at `packages/plite/test/facet-draft-contract.test.ts:20-190`. | `5/5/5/5/5/5/5/5=40` — invalidation inputs and rollback are explicit, deterministic, and proved. | Current Plate owner: compiled plugins declare dependencies before Plite publication at `packages/core/src/internal/plugin/compilePlateModel.ts:122-267`; no independent cache owner exists. | `4/4/5/4/4/5/4/4=34` — correct compiler consumer with less direct cache proof. | `5/5/5/5/5/5/5/5=40` — explicit revision truth plus Plate compilation is complete. | superior — Genuinely stronger; Wordgard's automatic reads appear cleaner but make dependencies invisible. Reverse only if explicit declarations cannot express a valid dynamic dependency. | Keep revision-keyed explicit dependencies and draft-local caches. | `packages/plite` | Plite Plan | No execution packet. | Commit revisions, state fields, schema and selection revisions | None | `5/5/5/5/5/5/5/5=40` — current target. | `+0` — no change. | Reject | Keep | None. | Never add automatic access recording or shared mutable cache state. | Facet draft/commit invalidation, rollback, cycle tests; browser N/A. | Risk is stale cache from an omitted dependency. Reverse evidence: reproducible valid dependency that cannot be declared. Reference scope: reject — reject implicit tracking; surpass proof. |
| STATE-012 | Extension compilation, precedence, dependencies, and conflicts | Current Wordgard owner: `Configuration` and recursive `Extension`. It flattens/deduplicates by object identity, applies priority wrappers, fields that provide extensions, and compartments at `../wordgard/src/state/state.ts:590-802`. | `4/4/3/4/4/3/3/4=29` — compact and flexible, but duplicate package instances and anonymous values undermine identity and diagnostics. | Current Plite owner: keyed extension compiler with dependency, peer, conflict, stable order, and atomic candidate validation at `packages/plite/src/core/editor-extension.ts:701-905` and `packages/plite/src/core/editor-extension.ts:1240-1321`. | `5/5/5/5/5/5/5/5=40` — deterministic keyed compilation and failure isolation are complete. | Current Plate owner: Plate plugin compiler lowers product plugins to the Plite model at `packages/core/src/internal/plugin/compilePlateModel.ts:318-547`. | `5/5/5/5/5/5/5/5=40` — named product ownership, strict target/conflict compilation, and full Plite adoption. | `5/5/5/5/5/5/5/5=40` — both layers have the correct compiler responsibilities. | superior — Genuinely stronger; Wordgard's smaller graph omits stable identity and product schema conflicts. Reverse only with a deterministic composition requirement the current graph rejects incorrectly. | Keep both compilers and their ownership boundary. | `packages/plite` compiler; `packages/core` product compiler | Plite Plan for substrate; Plate Plan for product policy | No execution packet. | Stable descriptor keys, schema contribution registry | P-DOC-4/CODEC compilation reuses lifecycle | `5/5/5/5/5/5/5/5=40` — current complete target. | `+0` — no change. | Surpass | Keep | Codec/render/shortcut packets publish through existing model revisions. | Reject identity precedence wrappers, recursive anonymous configuration, and a second compiler. | Permutation/conflict/dependency/reconfiguration tests; browser only for packets changing product behavior. | Risk is partial candidate publication; existing atomic compiler prevents it. Reverse evidence: a failing deterministic permutation. |
| STATE-013 | Transactional reconfiguration, revision, and migration | Current Wordgard owner: `Configuration`/`Compartment`. Reconfiguration reuses slots/field values and may rebuild documents when schema changes at `../wordgard/src/state/state.ts:618-802`. | `4/4/4/4/4/3/4/5=32` — good slot reuse and tests, but no strict schema identity, candidate rollback, or one-migration law. | Current Plite owner: candidate configuration staging, at most one explicit schema migration, validation, atomic publication, and rollback at `packages/plite/src/core/public-state.ts:6410-6479`. | `5/5/5/5/5/5/5/5=40` — revision, migration, rollback, and stale-spec behavior are explicit and exhaustively tested. | Current Plate owner: dynamic plugin model is compiled then installed through `packages/core/src/lib/editor/withPlite.ts:320-570`. | `5/5/5/5/5/5/5/5=40` — product reconfiguration uses the correct atomic substrate. | `5/5/5/5/5/5/5/5=40` — no split-brain owner. | superior — Genuinely stronger; Wordgard's compartment reuse is narrower and lacks durable schema identity. Reverse only with a failing rollback/migration law. | Keep current transactional publication. New fitter and codec artifacts bind to the same revision; existing render invalidation remains on canonical commit/runtime-ID truth. | `packages/plite`; compiled Plate consumers | Plite Plan | No execution packet; consuming packets use their owning `plite-plan` or `plate-plan` skill. | Schema identity/migration and extension compiler | P-DOC-3, P-DOC-4/5, and existing render invalidation proof. | `5/5/5/5/5/5/5/5=40` — current lifecycle is the target. | `+0` — dependent packets adopt it. | Surpass | Keep | Fitter/codecs/render plan use revision-keyed immutable publications. | Delete no current lifecycle; reject independent caches without revision keys. | Full extension-configuration suite and dependent packet invalidation tests; browser for dynamic codec/render behavior only. | Risk is document/schema split-brain. Reverse evidence: candidate failure mutates live state. |
| STATE-014 | Schema membership and contribution compilation | Current Wordgard owner: state `schemaElement` facet plus nominal `Schema`. State aggregates elements, while the model compiles containment/defaults at `../wordgard/src/state/state.ts:804-823` and `../wordgard/src/doc/schema.ts:11-321`. | `4/4/4/4/3/3/3/4=29` — useful compiled membership, but nominal types, one root, and limited property/contribution lifecycle. | Current Plite owner: schema compiler for roots, groups, content, properties, targets, defaults, wrapper plans, ownership, identities, and diagnostics at `packages/plite/src/core/schema-compiler.ts:243-519` and `packages/plite/src/core/schema-compiler.ts:1207-1637`. | `5/5/5/5/5/5/5/5=40` — complete generic schema semantics and generated proof. | Current Plate owner: product schema facade and installed-plugin references compile to one Plite contribution at `packages/core/src/lib/editor/withPlite.ts:414-570`. | `5/5/5/5/5/5/5/5=40` — full product declaration/targeting without substrate policy. | `5/5/5/5/5/5/5/5=40` — generic and product layers are both complete. | superior — Genuinely stronger. Wordgard appears compact because it omits roots, property targets, identities, deltas, and plugin conflict law. Reverse only with a failing accepted grammar/property/root case. | Keep Plite schema compilation and Plate product declarations. | `packages/plite`; product declarations in Plate packages | Plite Plan and Plate Plan by layer | No execution packet. | Extension compiler and product plugin model | P-DOC-3 fitter and P-DOC-4 codecs consume compiled schema | `5/5/5/5/5/5/5/5=40` — current target. | `+0` — no generic change. | Surpass | Keep | Dependent packets consume schema claims; no catalog migration. | Reject nominal type identity and product schema in Plite. | Schema generated laws, diagnostics, target-model and reconfiguration tests; browser N/A for compiler itself. | Risk is product policy leaking into generic schema. Reverse evidence: accepted generic grammar law missing from Plite. |
| STATE-015 | Product schema catalog for blocks, marks, media, and tables | Current Wordgard owner: monolithic `src/types` catalog with 38 declarations for documents, blocks, lists, marks, media, tables, spans, alignment, and direction at `../wordgard/src/types/index.ts:1-76` and `../wordgard/src/types/schema.ts:7-405`. | `4/3/4/4/3/4/3/3=28` — convenient coverage, but fixed policy, runtime name collision, and one package owner. | Current Plite owner: deliberately absent product catalog; generic schema vocabulary is the owner at `packages/plite/src/interfaces/schema.ts:99-484`. | `0/0/0/0/0/0/0/0=0` — absence is correct because product node vocabulary would violate substrate ownership. | Current Plate owners: feature packages. Headings are package-owned at `packages/basic-nodes/src/lib/BaseHeadingPlugin.ts:21-136`, media at `packages/media/src/lib/image/BaseImagePlugin.ts:33-70`, and tables at `packages/table/src/lib/BaseTablePlugin.ts:2263-2394`. | `5/5/5/5/5/5/5/4=39` — richer independently adoptable features; proof is broad but distributed. | `5/5/5/5/5/5/5/4=39` — correct product ownership and greater capability; one point remains for consolidated release proof. | superior — Plate is genuinely stronger and legitimately broader. Wordgard is only cleaner because one fixed catalog avoids package/plugin composition. Reverse only with a proven cross-feature product invariant requiring a shared owner. | Keep feature-owned Plate schemas. Direction becomes a new Plate feature; tables/lists use their dedicated packets. | Owning Plate feature packages | Plate Plan | No execution packet; consuming product packets use `plate-plan`. | Plite schema contribution API and installed product plugins | PRODUCT Packet 4/5 and TABLE-P1–P5 | `5/5/5/5/5/5/5/5=40` — packet-specific proof closes the distributed proof point. | `+1` — proof/adoption cohesion, not a monolithic catalog. | Reject | Keep | Add direction in basic styles; rename structural list; rearchitect table internally. | Never copy the 38-type catalog or move product vocabulary into Plite. | Per-feature schema/codec/browser/release proof under product/table packets. | Risk is duplicate product-type ownership. Reverse evidence: a real product contract that cannot stay feature-owned. Reference scope: reject — reject monolith; surpass product capability. Verdict scope: keep — keep/move only within existing feature owners. |
| STATE-016 | Selection representation, extension kinds, and codecs | Current Wordgard owner: `GardSelection` class hierarchy and `SelectionType` registry with numeric anchor/head, text/node/resolved variants, and name-based JSON at `../wordgard/src/state/selection.ts:6-430`. | `4/3/4/4/3/3/3/4=28` — extensible and tested, but class/number/single-root identity is unsuitable for structural persistence. | Current Plite owner: immutable plain-data selection protocol, module-augmentable kind map, strict versioned codecs at `packages/plite/src/interfaces/selection.ts:6-105` and `packages/plite/src/core/selection-protocol.ts:52-299`. | `5/5/5/5/5/5/5/5=40` — structural typing, mapping hooks, roots, codecs, and proof are complete. | Current Plate owner: product selection kinds only; table registers its structural kind through `packages/table/src/lib/BaseTablePlugin.ts:1989-2028` and `packages/table/src/lib/BaseTablePlugin.ts:5012-5048`. | `5/5/5/5/5/5/5/4=39` — correct extension ownership; table proof has one product-level gap addressed by TABLE-P3. | `5/5/5/5/5/5/5/5=40` — generic protocol plus product kind reaches full target. | superior — Genuinely stronger; Wordgard's classes are narrower, not cleaner for JSON/collaboration. Reverse only if an accepted selection cannot be expressed as immutable kind data plus protocol methods. | Keep Plite selection protocol; TABLE-P3 reuses it and deletes only duplicate table derivation. | `packages/plite`; product kinds in Plate packages | Plite Plan; Plate Plan for product kind | `tdd` under `plate-plan` via TABLE-P3. | Value codecs, roots, DocumentChange mapping | TABLE-P3 | `5/5/5/5/5/5/5/5=40` — current generic target. | `+0` — table proof scored in TABLE. | Surpass | Keep | Table adopts `TableSelectionView`; other product kinds unchanged. | Reject selection subclasses/global numeric positions. | Selection immutability/codec/validation tests plus TABLE-P3 mapping/browser proof. | Risk is class instances entering JSON state. Reverse evidence: failing custom selection codec/mapping case. |
| STATE-017 | Selection mapping, deletion fallback, roots, and runtime identity | Current Wordgard owner: text/node selections map numeric positions and search for a nearby fallback after deletion at `../wordgard/src/state/selection.ts:212-367`. | `4/4/4/4/3/3/3/4=29` — useful deletion fallback, but one global numeric space and no moved-node identity. | Current Plite owner: selection mapping protocol handles paths/points/ranges across named roots, associations, drop/nearest, and runtime IDs at `packages/plite/src/core/selection-protocol.ts:301-748`; deletion/move proof is at `packages/plite/test/selection-rebase-contract.ts:36-213`. | `5/5/5/5/5/5/5/5=40` — root-aware identity-preserving mapping and proof are complete. | Current Plate owner: no generic mapper; product selections register their mapping rules, exemplified by table at `packages/table/src/lib/BaseTablePlugin.ts:5012-5048`. | `4/4/5/4/4/5/4/4=34` — correct product extension role. | `5/5/5/5/5/5/5/5=40` — one generic mapper with product codecs. | superior — Genuinely stronger; Wordgard lacks roots/runtime identities. Reverse only with a minimized deletion/move fallback failure. | Keep Plite mapper; product selections delegate. | `packages/plite` | Plite Plan | `tdd` under `plate-plan` via TABLE-P3; no generic packet. | DocumentChange mapping and SnapshotIndex | TABLE-P3, HC history proof | `5/5/5/5/5/5/5/5=40` — complete. | `+0` — no change. | Surpass | Keep | Table/history/Yjs proof consumes existing mapper. | Reject global positions and bespoke product remapping outside protocol. | Selection rebase/move/root tests; table and collaboration integration; browser only for DOM/model selection consumers. | Risk is losing runtime identity on moves. Reverse evidence: failing move/delete/root seed. |
| STATE-018 | Logical word and grapheme navigation | Current Wordgard owner: `wordAt`/`skipWord` use `Intl.Segmenter`; tests cover forward/backward punctuation, whitespace, blocks, and RTL at `../wordgard/src/state/selection.ts:433-574` and `../wordgard/test/test-selection.ts:161-219`. | `4/4/4/4/3/3/3/5=30` — valuable cases and strong local proof, but host ICU makes semantics environment-dependent. | Current Plite owner: deterministic Unicode word profile and structural cross-leaf movement at `packages/plite/src/utils/string.ts:77-180` and `packages/plite/src/editor/positions.ts:186-337`; current tests cover English, apostrophes, emoji, and direction at `packages/plite/test/utils/string.ts:158-205`. | `4/4/5/5/5/5/5/4=37` — deterministic, typed, root/leaf-aware; donor exposes missing punctuation/block/RTL/CJK/combining coverage. | Current Plate owner: no word-boundary algorithm; product commands consume Plite movement through `packages/core/src/lib/editor/withPlite.ts:320-412`. | `4/4/5/5/4/5/4/4=35` — correct consumer role with no duplicate segmentation. | `4/4/5/5/5/5/5/4=37` — architecture is superior, proof distribution remains incomplete. | superior — Plite is genuinely stronger; adopt donor cases, not implementation. Reverse the keep-only source decision only if an adopted deterministic case fails. | Preserve public movement API and production segmenter. Add deterministic table-driven donor plus CJK/combining/emoji/cross-leaf cases; patch production only for a failing accepted law. | `packages/plite` | Plite Plan | `tdd` under `plite-plan` via STATE-P1. | Current Unicode profile and movement commands | STATE-P2 may share fixtures; PRODUCT direction consumes proof | `5/5/5/5/5/5/5/5=40` — complete deterministic semantics and proof without host ICU. | `+3` — semantics/composition/proof close. | Adopt | Gate | Translate fixtures into Plite tests; Plate adoption is N/A because no product API changes. | No current deletion; hard non-adoption of `Intl.Segmenter`, `wordAt`, and donor runtime. | Focused string tests, cross-leaf transaction cases, property generation over punctuation/combining/CJK/emoji; browser N/A because this packet asserts logical model movement only. | A new case may reveal behavior change. Stop and split a changeset packet if documented movement changes. Reference scope: adopt — adopt cases only. Verdict scope: gate — gate/add proof. |
| STATE-019 | Structural textblock flattening and index cache | Current Wordgard owner: `TextblockMap`. It flattens structure with U+FFFC, stores section tables, caches by `WeakMap<Plot,...>`, and feeds word/visual movement at `../wordgard/src/state/textblock.ts:5-224`. | `4/4/4/4/3/2/3/2=26` — locally cohesive, but it conflates structural text, word semantics, DOM visual order, and single-document identity. | Current Plite owners: structural document/snapshot indexes and logical position utilities; model word movement is at `packages/plite/src/editor/positions.ts:186-337`, while DOM geometry is separately owned at `packages/plite-dom/src/plugin/dom-geometry.ts:408-596`. | `5/5/5/5/5/5/5/4=39` — correct split, structural sharing, and broad proof; discoverability across owners costs one proof/DX point. | Current Plate owner: no structural textblock index; product features consume Plite model/DOM APIs through `packages/core/src/lib/editor/withPlite.ts:320-412`. | `4/4/5/4/4/5/4/4=34` — correct absence. | `5/5/5/5/5/5/5/4=39` — separate model and host facts are safer than one flattening map. | superior — Genuinely stronger architecture; Wordgard only appears simpler because it conflates layers. Reverse only with a measured current locality or mapping failure that one generic projection would solve. | Keep split structural-index and flat DOM-intent owners; C09 records that the current public geometry calls need no facade. | `packages/plite` structural index and `packages/plite-dom` geometry | Plite Plan | No execution; PV-06 records the keep decision. | SnapshotIndex, logical segments, DOM mapping | STATE-P2 and existing geometry proof. | `5/5/5/5/5/5/5/4=39` — intentional split is target; no new score claim without measured gap. | `+0` — no accepted abstraction. | Reject | Keep | None. | Never create `TextblockMap`, a geometry namespace, or a second flattened position ontology. | Existing index/geometry tests; STATE-P2 browser proof; benchmark only if a measured index change is later proposed. | Risk is rebuilding a competing coordinate system. Reverse evidence: profiler plus correctness failure attributable to current split. Verdict scope: keep — keep split owners. |
| STATE-020 | Bidi order and browser-native visual caret geometry | Current Wordgard owner: `BidiSpan`/`computeOrder` plus `TextblockMap`. It implements a reduced UAX #9, incomplete bracket table, shared scratch arrays, and tests mixed LTR/RTL runs at `../wordgard/src/state/bidi.ts:1-409`, `../wordgard/src/state/textblock.ts:139-152`, and `../wordgard/test/test-selection.ts:102-159`. | `3/3/4/3/2/2/2/4=23` — useful fixtures, but incomplete algorithm, shared state, and model-side approximation of browser layout. | Current Plite owners: browser plus `plite-dom` geometry; direction-aware range edges and grapheme measurement are at `packages/plite-dom/src/plugin/dom-geometry.ts:408-596` and `packages/plite-dom/src/plugin/dom-geometry.ts:1041-1217`; React routes native keyboard selection at `packages/plite-react/src/editable/keyboard-input-strategy.ts:596-652`. | `5/5/5/5/5/5/5/4=39` — correct host ownership and strong units, but donor strings reveal missing real-browser mixed-bidi traversal proof. | Current Plate owner: product direction is absent in audited Plate packages; alignment exists at `packages/basic-styles/src/lib/BaseTextAlignPlugin.ts:14-79`. Plate consumes generic DOM geometry but lacks a direction feature. | `4/4/5/5/4/5/4/4=35` — strong product host layer, one real feature/proof gap. | `5/5/5/5/5/5/5/4=39` — architecture is stronger; native matrix proof is incomplete. | superior — Plite is genuinely stronger and Wordgard's model algorithm is unsafe. Adopt fixtures only. Reverse host delegation only with a stable cross-browser invariant the browser cannot expose. | Add native mixed-bidi caret proof in Plite. PRODUCT Packet 4 adds explicit Plate ltr/rtl writing direction with absence meaning auto; no model bidi algorithm. | `packages/plite-dom` for host facts; Plate Basic Styles for product direction | Plite Plan for STATE-P2; Plate Plan for direction | `testing` under `plite-plan` via STATE-P2; `plate-plan` owns Product Packet 4. | DOM mapping/geometry and native selection | PRODUCT Packet 4 consumes the proof; C09 remains no execution. | `5/5/5/5/5/5/5/5=40` — native DOM/model synchronization is proved across supported engines. | `+1` — proof dimension only. | Adopt | Gate | Plite browser app adopts fixtures; Plate direction later consumes the proven host behavior. | Never port `BidiSpan`, `computeOrder`, shared scratch arrays, or `TextblockMap`. | Focused Chromium native movement plus closure browser matrix; unit bridge tests only for missing invariant; property/fuzz N/A because browser is the oracle; benchmark N/A because no runtime algorithm changes. | Engines may choose different visual offsets. Assert DOM/model synchronization, not unstable exact sequences. Reference scope: adopt — adopt fixtures only; reject algorithm. Verdict scope: gate — gate/add browser proof. |
| STATE-021 | Pure command fallback and `around` pipeline | Current Wordgard owner: `Command` facet and dispatcher. Function identity selects ordered handlers; commands may return specs or perform side effects at `../wordgard/src/command/command.ts:4-96`. | `4/4/4/3/3/3/3/4=28` — concise fallback and binding, but no stable IDs, explicit continuation, recursion guard, or pure-only enforcement. | Current Plite owner: named frozen descriptors and registry with `handle`, single-use `around`/`next`, recursion/depth protection, and one semantic commit at `packages/plite/src/core/command-registry.ts:52-318`. | `5/5/5/5/5/5/5/5=40` — deterministic typed pipeline and reference-model proof are complete. | Current Plate owner: product handlers/input rules compose through Plite; input-rule middleware is at `packages/core/src/lib/plugins/input-rules/internal/InputRulesPlugin.ts:137-279`. | `5/5/5/5/5/5/5/5=40` — product policy uses the correct generic pipeline. | `5/5/5/5/5/5/5/5=40` — one command owner plus product middleware meets target. | superior — Genuinely stronger. Wordgard's function-token shape is simpler because it omits diagnostics, reconfiguration, capability types, and recursion safety. Reverse only if a pure product intent cannot be expressed through current descriptors. | Keep the Plite command substrate. PRODUCT Packet 1 proves ordinary Plate behavior through inferred plugin updates and uses commands only for headless/interception/preview jobs. | `packages/plite`; product handlers in Plate packages | Plite Plan for substrate; Plate Plan for product commands | `plate-plan` via Product Packets 1 and 2. | TransactionSpec and extension registry | PRODUCT Packets 1/2 and PT-01/PT-02 consume the kept substrate only where a command is justified. | `5/5/5/5/5/5/5/5=40` — current substrate is target. | `+0` — product adoption scored in PRODUCT. | Surpass | Keep | Plate feature packages adopt direct update portals and keep Plite commands for advanced command jobs; Plite stays unchanged. | Reject function identity, side-effecting command defaults, and any Action registry. | Command reference-model, recursion, continuation, atomic commit, product parity/browser focus proof. | Risk is double dispatch from a second action registry. Stop if actions do not reuse Plite commands. |
| STATE-022 | Typed product phrases and localization | Current Wordgard owner: `PhraseSet` and four English dictionaries. Facet overrides, typed refs, `$` interpolation, and reverse record merge live at `../wordgard/src/phrases/phraseset.ts:3-85`; a wrong table label ships at `../wordgard/src/phrases/phrases.ts:89-104`. | `3/3/4/3/3/2/3/1=22` — typed keys and overrides, but no locale, fallback, plural/select/date/number, SSR, async catalog, or proof. | Current Plite owner: deliberately absent; application wording ownership is explicit at `packages/plite/src/core/screen-reader-announcement.ts:7-17`. | `0/0/0/0/0/0/0/0=0` — absence is correct because product wording cannot belong in the substrate. | Current Plate owners: the app dictionary at `apps/www/src/i18n/getI18nValues.ts:92-186` and feature-local emoji strings at `packages/emoji/src/lib/types.ts:46-55` and `packages/emoji/src/lib/constants.ts:106-134`. Bounded audit: exact `rg` searches for `MessageCatalog`, `Intl.MessageFormat`, `formatMessage`, `PluralRules`, `@formatjs`, and `intl-messageformat` across 1,693 TS/TSX/MD/MDX files under `packages/plite/src`, `packages/core/src`, `packages/emoji/src`, `apps/www/src`, and `content/docs` returned 0 matches. Narrow conclusion: those current sources expose no shared ICU contract identifiable by those API/runtime tokens; other apps, generated files, and dependency internals were not searched. | `3/2/3/3/2/5/2/2=22` — correct high-level ownership but fragmented lifecycle and weak shared proof. | `3/2/3/3/2/5/2/2=22` — different tradeoff; no justified shared core mechanism in the bounded audited sources. | different tradeoff — Wordgard is not better: its cohesion hides an incomplete i18n system. Plate is more fragmented but correctly product-owned. Reverse defer only with two real consumers and named ICU/SSR/a11y requirements; expand the bounded audit before any broader absence claim. | Default: no code. If admitted, an application-owned adapter exposes `MessageCatalog<TKey> { locale; has; format }` over a real ICU runtime; it never becomes a Plite facet or Plate-core English catalog. | Application/registry product owner | Product owner, then Plate Plan only if a reusable package boundary is accepted | No execution packet; future accepted product work routes to `plate-plan` only after STATE-P3. | Two independent consumers, installed ICU runtime, locale/fallback/SSR/a11y requirements | A future app migration packet only after gate acceptance | `4/4/5/4/4/5/4/4=34` — theoretical target earns types/lifecycle/proof only with real ICU adoption and two consumers. | `+12` theoretical; `+0` authorized now because evidence gate is unmet. | Defer | Gate | None now. If accepted: app catalog, feature options, registry labels, SSR and accessibility adoption. | Never add `PhraseSet`/English dictionaries to Plite or Plate core; no current deletion until a real app migration exists. | Gate proof: locale fallback, ICU plural/select/interpolation, SSR/client parity, accessible-name coverage. Browser applies only after acceptance; benchmark N/A unless catalog loading becomes a performance claim. | Missing evidence changes ownership and scope. The zero-match result is bounded to the 1,693 named source/docs files, not the whole repository or dependency graph. Closure condition: two consumers, named requirements, installed runtime, expanded audit, and accepted product owner. Reference scope: defer — reject donor; defer shared adapter. |

### Master ledger

| ID | Mechanism | Wordgard shape and evidence | Wordgard score | Current Plite shape and evidence | Plite score | Current Plate shape and evidence | Plate score | Current combined score | Comparison | Proposed shape | Target owner | Decision owner | Execution skill | Dependencies | Dependent packets | Target score | Gain | Reference disposition | Local verdict | Adoption | Deletion | Proof | Risk |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| HC-001 | History extension and configuration owner | **Current Wordgard owner:** `src/history/history.ts`. `history()` bundles field, facet, commands, and menu; depth/timer/join policy is reduced at `../wordgard/src/history/history.ts:10-35`, `../wordgard/src/history/history.ts:98-111`. | `4/4/3/4/3/3/3/4 = 28/40` — compact/correct, but weak typing, ownership, and deterministic policy. | **Current Plite owner:** `@platejs/plite-history`. Typed state/transaction/options/tags and factory are at `packages/plite-history/src/history-extension.ts:61-151`, `packages/plite-history/src/history-extension.ts:606-616`. | `5/5/5/4/5/5/5/5 = 39/40` — typed single owner; only runtime-efficiency evidence is not perfect. | **Current Plate owner:** core adapter/install. `packages/core/src/lib/plugins/HistoryPlugin.ts:1-7` and `packages/core/src/lib/plugins/getCorePlugins.ts:23-43`, `packages/core/src/lib/plugins/getCorePlugins.ts:54-85` delegate without reimplementation. | `4/4/4/4/4/5/5/4 = 34/40` — clean adoption, but little Plate-local behavior/proof. | `5/5/5/4/5/5/5/5 = 39/40` — Plite owns semantics and Plate stays thin; v4 truth is the remaining gap. | superior — Plite surpasses Wordgard through typed ownership and deterministic transaction policy; Plate correctly adapts instead of reimplementing. | Keep one typed Plite history extension; correct its public v4 truth; do not import timer facets or menu UI. | `@platejs/plite-history`; Plate core is consumer. | Plite Plan | `plite-plan` then `task` for HP-01 | HC-002, HC-003, canonical `EditorCommit` | HP-01; HP-02 consumes this owner | `5/5/5/5/5/5/5/5 = 40/40` — exact docs plus preserved owner yields full clarity/proof. | `+1/40` | Surpass | Keep | Plite keeps `history()` and typed APIs; Plate keeps the thin plugin/install path. | Delete 0 current owners; explicitly reject Wordgard timer/config and menu colocation. | `packages/plite-history/test/index.spec.ts:105-189`; `packages/plite-history/test/package-readme-contract.spec.ts:1-38`; source-first typecheck. | Risk: stale docs can make a sound API look version-confused. Reversal: reconsider configuration only if a current consumer cannot express grouping through explicit history policy and supplies deterministic tests. |
| HC-002 | Batch and branch representation | **Current Wordgard owner:** private `Branch` in history. It stores inverse/effects/start selection/mapping/depth at `../wordgard/src/history/history.ts:171-259`; serialization mutates resolved heads at `../wordgard/src/history/history.ts:71-81`. | `4/4/3/4/3/3/3/4 = 28/40` — sound linked model, but single-doc, mutable resolution, and weaker types/ownership. | **Current Plite owner:** `Batch`/history state. Canonical changes, both selections, roots, revision/schema, immutable stacks are at `packages/plite-history/src/history.ts:24-65` and `packages/plite-history/src/history-state.ts:111-220`, `packages/plite-history/src/history-state.ts:401-426`. | `5/5/5/5/5/5/5/5 = 40/40` — complete immutable multi-root representation with proof. | **Current Plate owner:** bounded absence; Plate intentionally declares no representation and delegates at `packages/core/src/lib/plugins/HistoryPlugin.ts:1-7`. | `3/3/4/4/3/4/4/3 = 28/40` — correct absence, but no Plate-local representation value/proof. | `5/5/5/5/5/5/5/5 = 40/40` — one canonical representation is already ideal end to end. | superior — Plite is strictly richer, immutable, multi-root, and schema-aware. | Preserve the canonical immutable batch as the only history record, including during Yjs collaboration. | `@platejs/plite-history` | Plite Plan | `plite-plan` verification; `tdd` when HP-02 extends laws | HC-003, HC-005, `EditorCommit` | HP-02, HP-03 | `5/5/5/5/5/5/5/5 = 40/40` — target equals the already ideal owner. | `+0/40` | Surpass | Keep | Yjs replay must consume these batches through normal canonical commits; Plate remains representation-free. | Delete 0 from this owner; HP-03 deletes the competing Yjs history record instead. | `packages/plite-history/test/history-branch-contract.spec.ts:1-155`; `packages/plite-history/test/history-persistence-contract.spec.ts:1-811`. | Risk: a second adapter-owned record can diverge from this batch. Reversal: replace only if a benchmark proves immutable revisions untenable while preserving all current laws and API shape. |
| HC-003 | Capture, inversion, and reversible effects | **Current Wordgard owner:** history event capture. `eventFromTransaction` inverts changes and gathers inverted effects at `../wordgard/src/history/history.ts:261-272`; effect typing/persistence are weak. | `4/4/3/4/3/3/3/4 = 28/40` — good inversion hook, but erased effects and weak persistence/type boundaries. | **Current Plite owner:** commit/effect/history pipeline. Lazy inverse/effects and validation live at `packages/plite/src/interfaces/editor.ts:2500-2570`, `packages/plite/src/core/commit.ts:967-1020`, `packages/plite-history/src/history-extension.ts:317-436`, and `packages/plite/src/core/transaction-values.ts:8-114`. | `5/5/5/4/5/5/5/5 = 39/40` — canonical and typed; collaborative runtime proof costs one point. | **Current Plate owner:** bounded consumer through `HistoryPlugin`/toolbar at `apps/www/src/registry/ui/history-toolbar-button.tsx:1-44`; no alternate inversion. | `4/4/4/4/4/5/4/4 = 33/40` — correct reuse, limited Plate-specific proof. | `5/5/5/4/5/5/5/5 = 39/40` — one canonical pipeline, with end-to-end collab proof outstanding. | superior — Plite adopts the reversible-effect idea and surpasses it with canonical, typed, codec-aware commits. | Keep canonical inversion/effect descriptors; prove the same replay path under collaboration. | Plite core and `@platejs/plite-history` | Plite Plan | `plite-plan` plus `tdd` | HC-002, HC-005, HC-026 | HP-02, HP-03 | `5/5/5/5/5/5/5/5 = 40/40` — differential effect proof closes the remaining runtime gap. | `+1/40` | Surpass | Keep | Yjs transports shared effects but does not redefine inversion; Plate uses standard history controls. | Delete 0 here; HP-03 removes duplicate Yjs replay ownership. | `packages/plite-history/test/history-contract.ts:1-1946`; `packages/plite-history/test/history-persistence-contract.spec.ts:1-811`; HP-02 differential effect counts. | Risk: undo plus shared-effect delivery can duplicate or omit an effect. Reversal: split ownership only if a minimized law proves a descriptor cannot be replayed canonically; a second public stack remains forbidden. |
| HC-004 | History grouping policy | **Current Wordgard owner:** history state/config. It groups by timer, changed-range adjacency, user-event regex/composition, or caller predicate at `../wordgard/src/history/history.ts:274-334`. | `4/5/4/4/3/4/4/5 = 33/40` — flexible/correct tests, but wall-clock nondeterminism and broad hooks weaken library law. | **Current Plite owner:** semantic merge policy. Root/runtime/path groups and compatible merges are at `packages/plite-history/src/history-merge-policy.ts:16-371`; explicit controls are at `packages/plite-history/src/history-extension.ts:103-151`. | `5/5/5/5/5/5/5/5 = 40/40` — deterministic, typed, efficient, and exhaustively proven. | **Current Plate owner:** bounded consumer; core installs Plite policy and has no timer at `packages/core/src/lib/plugins/getCorePlugins.ts:54-85`. | `4/4/4/4/4/5/5/4 = 34/40` — correct delegation, less Plate-local proof. | `5/5/5/5/5/5/5/5 = 40/40` — canonical deterministic grouping already owns the whole stack. | superior — Wordgard is flexible but nondeterministic and can overmerge; Plite's semantic/explicit policy is reproducible. | Keep deterministic semantic grouping and explicit `newBatch`/merge/skip controls; reject elapsed-time grouping. | `@platejs/plite-history` | Plite Plan | `plite-plan` verification | HC-002, canonical changed indexes | HP-02 exercises grouping during collab | `5/5/5/5/5/5/5/5 = 40/40` — target preserves the ideal current policy. | `+0/40` | Reject | Keep | All consumers use transaction history policy; docs describe behavior, not legacy timer knobs. | Delete 0 current code; adopt 0 Wordgard grouping code. | `packages/plite-history/test/history-contract.ts:1-1946`; `packages/plite-history/test/document-state-history-contract.ts:1-712`. | Risk: broad explicit merge can still merge unrelated paths if caller abuses it. Reversal: add a grouping dimension only with deterministic commit metadata and generated grouping laws, never wall-clock time. |
| HC-005 | Skipped-change mapping and lazy rebase | **Current Wordgard owner:** history branch. Skipped transactions queue both branches at `../wordgard/src/history/history.ts:57-61`; lazy transform/maps are at `../wordgard/src/history/history.ts:202-246`. | `4/5/3/4/3/4/3/5 = 31/40` — strong rebase law, but single-doc/weak type and owner model. | **Current Plite owner:** history state. Mapping journals, canonical transforms, both selections/effects, and both-stack queueing are at `packages/plite-history/src/history-state.ts:222-374`, `packages/plite-history/src/history-state.ts:532-569`. | `5/5/5/5/5/5/5/5 = 40/40` — immutable multi-root mapping is complete and proven. | **Current Plate owner:** core history consumer; toolbar reads canonical depths at `apps/www/src/registry/ui/history-toolbar-button.tsx:1-44`. | `4/4/4/4/4/5/4/4 = 33/40` — correct reuse, limited product-local proof/ownership. | `5/5/5/5/5/5/5/5 = 40/40` — current combined mapping law is already ideal. | superior — Plite preserves Wordgard's strongest law and extends it to immutable, revisioned, multi-root batches. | Make this mapping path sufficient for all remote Yjs imports and collaborative undo; no CRDT-local history compensation. | `@platejs/plite-history`, using Plite `DocumentChange.transform` | Plite Plan | `tdd` through HP-02 | HC-002, HC-013, HC-019 | HP-02, HP-03 | `5/5/5/5/5/5/5/5 = 40/40` — target preserves one proven mapping owner. | `+0/40` | Surpass | Keep | Yjs remote imports retain `history-skip`; Plate adopts only canonical history controls. | Delete 0 mappings; HP-03 deletes Yjs's parallel stack once this law passes structural/offline cases. | `packages/plite-history/test/history-contract.ts:932-1071`; `packages/plite/test/collab-history-runtime-contract.ts:457-585`; HP-02 seeded model runner. | Risk: concurrent root lifecycle changes currently fail closed and may block undo. Reversal: retain a private adapter correction only if a minimized canonical transform law cannot represent the case; do not retain public dual history. |
| HC-006 | Undo/redo replay and selection/DOM policy | **Current Wordgard owner:** history pop. It applies inverse/effects, restores start selection, and tags replay at `../wordgard/src/history/history.ts:336-347`. | `4/4/3/4/3/4/4/5 = 31/40` — correct/simple replay with strong tests, but one selection and weaker typing. | **Current Plite owner:** history extension/selection. Replay policy is at `packages/plite-history/src/history-extension.ts:153-315`, `packages/plite-history/src/history-extension.ts:479-600`; root-aware restoration is at `packages/plite-history/src/history-selection.ts:15-112`. | `5/5/5/4/5/5/5/5 = 39/40` — complete typed replay; collaborative runtime proof costs one point. | **Current Plate owner:** history toolbar at `apps/www/src/registry/ui/history-toolbar-button.tsx:1-44`. | `5/5/5/4/5/5/5/5 = 39/40` — correct accessible consumption; runtime efficiency remains unbenchmarked. | `5/5/5/4/5/5/5/5 = 39/40` — one strong replay path, with collab/browser proof pending. | superior — Plite/Plate surpass Wordgard with before/after root metadata, native text repair, DOM policy and accessible command state. | Route every local collaborative undo/redo through this replay path, then lower its canonical commit through Yjs. | `@platejs/plite-history`; Plate toolbar consumer | Plite Plan for semantics; Plate Plan for product adoption | `tdd`, then `plate-ui` for HP-04 | HC-003, HC-005, HC-019, HC-024 | HP-02, HP-03, HP-04 | `5/5/5/5/5/5/5/5 = 40/40` — one-owner browser/differential proof closes the gap. | `+1/40` | Surpass | Keep | Yjs removes its command surface; Plate keeps the standard history toolbar in collaboration demos. | Delete `tx.yjs.undo/redo` in HP-03; delete 0 Plite replay code. | `packages/plite-history/test/screen-reader-announcement-history-contract.ts:1-55`; `packages/plite/test/collab-history-runtime-contract.ts:457-550`; Browser in HP-04. | Risk: a remote topology change can restore a stale selection or wrong root. Reversal: adjust root-aware mapping/restoration when a minimized trace fails; never select Yjs as a second public history owner. |
| HC-007 | Depth, clipping, revision, and cache | **Current Wordgard owner:** `Branch`/`HistoryState`. Approximate threshold clipping is at `../wordgard/src/history/history.ts:171-193`, `../wordgard/src/history/history.ts:248-258`, `../wordgard/src/history/history.ts:349-355`. | `3/4/3/4/3/3/3/3 = 26/40` — workable but approximate, mutable, and weakly cached/proven. | **Current Plite owner:** history state. Exact max depth, immutable snapshots, mapping coalescing, revision/cache are at `packages/plite-history/src/history-state.ts:111-260`, `packages/plite-history/src/history-state.ts:322-530`. | `5/5/5/5/5/5/5/5 = 40/40` — exact bounded immutable/cache behavior with tests. | **Current Plate owner:** bounded toolbar consumer at `apps/www/src/registry/ui/history-toolbar-button.tsx:1-44`; no duplicate cache. | `4/4/4/4/4/5/4/4 = 33/40` — correct delegation, limited host stress proof. | `5/5/5/5/5/5/5/5 = 40/40` — ideal current combined storage/cache owner. | superior — Plite is exact, immutable, and cache-safe; Wordgard's threshold is deliberately approximate. | Preserve exact bounded immutable stacks and revision-keyed lazy resolution. | `@platejs/plite-history` | Plite Plan | `plite-plan` verification | HC-002, HC-005 | HP-02 stress uses it | `5/5/5/5/5/5/5/5 = 40/40` — target retains exact current law. | `+0/40` | Surpass | Keep | No consumer changes; HP-02 asserts depths after every peer event. | Delete 0; reject Wordgard's threshold clipping. | `packages/plite-history/test/history-branch-contract.spec.ts:13-37`; `packages/plite-history/test/history-soak-contract.slow.ts:1-245`. | Risk: unbounded mapping journals or stale cache identity under long offline sessions. Reversal: change storage only after memory benchmarks preserve exact depth and immutable observer identity. |
| HC-008 | Persistence version, schema, and effect codecs | **Current Wordgard owner:** history field serializer. It stores inverse/start selection only, drops effects, and lacks version/schema at `../wordgard/src/history/history.ts:71-95`. | `2/3/2/3/2/2/3/3 = 20/40` — lossy, weakly typed/versioned, and only shape-validated. | **Current Plite owner:** history v4 codec. Exact schema/intermediate/effect checks are at `packages/plite-history/src/history.ts:49-65` and `packages/plite-history/src/history-codec.ts:58-265`; `packages/plite-history/src/history-codec.ts:221` wrongly says v3. | `5/5/5/4/5/5/3/5 = 37/40` — strong codec; stale owner truth lowers clarity/ownership. | **Current Plate owner:** Plite docs consumer. Stale v3 claims are at `content/docs/plite/libraries/plite-history/history.mdx:63` and `content/docs/plite/libraries/plite-history/history-editor.mdx:105`. | `4/4/4/4/4/5/3/3 = 31/40` — runtime-safe, documentation/proof drift. | `5/5/5/4/5/5/3/5 = 37/40` — strict runtime, but combined owner truth remains contradictory. | superior — Runtime Plite vastly surpasses Wordgard; owner truth is degraded by stale v3 prose/error. | Keep strict v4 only and make every README/docs/error statement exact; add no migration language or widened decoder. | `@platejs/plite-history`; Plite docs | Plite Plan | `docs-creator` plus `task` in HP-01 | HC-003, schema/effect registry | HP-01; HP-05 relies on truthful proof docs | `5/5/5/5/5/5/5/5 = 40/40` — exact v4 truth closes ownership/proof gaps without runtime change. | `+3/40` | Surpass | Rearchitect | Plite README/docs/error adopt v4; Plate-facing docs link the same owner. | Delete stale `version 3` literals only; preserve `DocumentChange` v3 references because that is a separate format. | `packages/plite-history/test/history-persistence-contract.spec.ts:1-811`; `packages/plite-history/test/package-readme-contract.spec.ts:1-38`; Browser-load both Plite history docs routes. | Risk: a careless text fix can widen decode or mislabel another v3 format. Reversal: revert the truth patch as one unit if codec/docs contracts disagree; never accept v3 history without a designed migration. Verdict scope: rearchitect owner truth only. |
| HC-009 | Activation, reconfiguration, and failure isolation | **Current Wordgard owner:** direct history field lifecycle at `../wordgard/src/history/history.ts:37-95`; no schema migration/atomic reconfiguration. | `3/3/3/4/2/3/3/3 = 24/40` — simple, but weak lifecycle/library/proof guarantees. | **Current Plite owner:** history/registry/Yjs staged lifecycle at `packages/plite-history/src/history-extension.ts:437-478`, `packages/plite/src/core/extension-registry.ts:620-700`, and `packages/yjs/src/core/extension.ts:94-228`. | `5/5/5/4/5/5/5/5 = 39/40` — atomic typed lifecycle; broad browser runtime proof is missing. | **Current Plate owner:** thin `BaseYjsPlugin` plus apps/plite browser host at `packages/yjs/src/lib/BaseYjsPlugin.ts:1-12` and `apps/plite/tests/plite-browser/donor/examples/yjs-collaboration.test.ts:5-77`. | `4/4/4/4/5/5/5/4 = 35/40` — clean adapter and one real failure row, not full lifecycle coverage. | `5/5/5/4/5/5/5/5 = 39/40` — strong atomic owner, narrow product proof. | superior — Plite/Yjs surpass Wordgard through staged failure and exact registry/schema checks; product failure proof is narrow. | Keep atomic activation/reconfiguration; add real provider/schema failure-path browser proof. | Lifecycle owner by extension: `@platejs/plite-history` for history and `@platejs/yjs` for collaboration | Plite Plan | `testing` in HP-05 | HC-008, HC-020, HC-021 | HP-05 lifecycle proof | `5/5/5/5/5/5/5/5 = 40/40` — reconnect/reconfigure proof closes the runtime gap. | `+1/40` | Surpass | Keep | Apps/plite exercises rollback; Plate remains a thin config consumer. | Delete 0 runtime code; replace weak mount-only proof with lifecycle assertions. | `packages/plite-history/test/history-branch-contract.spec.ts:103-154`; `packages/yjs/test/schema-identity-contract.spec.ts:1-645`; HP-05 browser reconnect/reconfigure rows. | Risk: failed reconfigure can partially swap editor/doc/provider state. Reversal: restore the previous staged controller as a unit if new lifecycle proof exposes partial mutation. |
| HC-010 | History public API, Plate installation, UI, and docs | **Current Wordgard owner:** history package API/menu at `../wordgard/src/history/history.ts:98-169`, `../wordgard/src/history/history.ts:358-380` and `../wordgard/src/history/index.ts:1-4`; generic state and UI are mixed. | `3/3/3/4/3/3/2/4 = 25/40` — usable but erased field typing and poor ownership split. | **Current Plite owner:** headless `History`/`history` API at `packages/plite-history/src/index.ts:1-2`, `packages/plite-history/src/history.ts:24-121`, and `packages/plite-history/src/history-extension.ts:61-101`, `packages/plite-history/src/history-extension.ts:606-616`. | `5/5/5/4/5/5/5/5 = 39/40` — precise typed API; runtime efficiency not benchmark-perfect. | **Current Plate owner:** core plugin/toolbar/docs at `packages/core/src/lib/plugins/HistoryPlugin.ts:1-7`, `packages/core/src/lib/plugins/getCorePlugins.ts:54-85`, and `apps/www/src/registry/ui/history-toolbar-button.tsx:1-44`. | `5/5/5/4/5/5/5/4 = 38/40` — correct product ownership; docs proof drifts. | `5/5/5/4/5/5/5/5 = 39/40` — right package/product split with documentation gap. | superior — Plite/Plate have the right package/product split; Wordgard mixes generic history and menu product policy. | Preserve typed headless history in Plite and UI/docs in Plate; make version truth exact. | Plite history API; Plate core/registry adoption | Plite Plan for API, Plate Plan for UI | `docs-creator`/`task` HP-01; `plate-ui` HP-04 | HC-001, HC-006, HC-008 | HP-01, HP-04 | `5/5/5/5/5/5/5/5 = 40/40` — exact docs/product proof closes the gap. | `+1/40` | Surpass | Move | Plate core/toolbar continue consuming `HistoryPlugin` and `usePliteHistory`; docs adopt v4 and one-owner undo. | Delete 0 current API; HP-03 deletes Yjs command duplication; do not import Wordgard menu exports. | `packages/plite-history/test/index.spec.ts:105-189`; `packages/plite-history/test/package-readme-contract.spec.ts:1-38`; toolbar Browser proof in HP-04. | Risk: public docs can expose two undo APIs despite one toolbar. Reversal: add a Plate adapter method only if it remains a thin alias to canonical history and improves inference; never add state duplication. Verdict scope: move product UI to Plate, keep API. |
| HC-011 | Central-authority collaboration state/config/API admission | **Current Wordgard owner:** collab field/config/API. Version/synced doc/unconfirmed/client/effects are at `../wordgard/src/collab/collab.ts:4-31`; public shapes are at `../wordgard/src/collab/collab.ts:73-106`. | `4/4/4/4/3/2/4/4 = 29/40` — coherent authority API, but limited durability/hack resistance. | **Current Plite owner:** bounded absence in protocol-neutral core; commits/effects only at `packages/plite/src/interfaces/editor.ts:1679-1695`, `packages/plite/src/interfaces/editor.ts:2500-2570`. | `1/2/3/4/3/2/4/3 = 22/40` — no feature capability, but deliberate ownership boundary and efficient neutral core. | **Current Plate owner:** app boundary docs/static demo at `content/docs/(plugins)/(collaboration)/yjs.mdx:160-174` and `apps/www/src/registry/examples/collaboration-demo.tsx:8-42`; no authority adapter. | `0/0/1/0/1/0/1/0 = 3/40` — bounded absence, not an implemented protocol. | `1/2/3/4/3/2/4/3 = 22/40` — authority feature absent; core boundary is correct but capability score stays low. | different tradeoff — Wordgard is stronger only for its chosen numbered-authority protocol; importing it without a consumer would pollute a protocol-neutral core. | Keep an explicit non-admission boundary: create a separate authority adapter only when a real consumer supplies version, identity, ack, persistence, retry, and auth laws. | Plite core owns the boundary; a future adapter owns any admitted protocol. | Plite Plan | `major-task` only after consumer evidence | HC-013; real authority consumer requirements | No current packet; an admitted adapter would precede its own Plate adoption packet. | `1/2/3/4/3/2/4/3 = 22/40` — explicit non-admission is the accepted target until a complete consumer-backed authority adapter has an owner. | `+0/40` | Reject | Gate | Current Plite/Plate adopt only the boundary and pairwise change primitive; no API adoption. | Delete 0 because no speculative API exists; do not copy `CollabState`/`Config`. | Current absence verified by `packages/plite/src/interfaces/editor.ts:1679-1695`, `packages/plite/src/interfaces/editor.ts:2500-2570`; any future packet must add deterministic ack/retry/persistence tests before code. | Risk: a future product may need central authority and fork ad hoc. Reversal: admit a separate adapter when a named consumer proves Yjs is unsuitable and supplies the complete protocol contract. |
| HC-012 | Authority update collapse, versions, acknowledgements | **Current Wordgard owner:** collab receive/send queue. Collapse is at `../wordgard/src/collab/collab.ts:62-71`; version validation/recognition/transform/send are at `../wordgard/src/collab/collab.ts:108-166`. | `4/5/4/4/3/2/4/4 = 30/40` — correct compact algorithm, but missing durable retry/idempotency/multi-device hardening. | **Current Plite owner:** bounded absence; pairwise transform/compose only at `packages/plite/src/core/document-change.ts:5577-5722`. | `1/2/3/4/3/2/4/3 = 22/40` — no authority protocol, but neutral primitive/ownership are intentional. | **Current Plate owner:** bounded app-provider documentation at `content/docs/(plugins)/(collaboration)/yjs.mdx:160-174`; no authority implementation. | `0/0/1/0/1/0/1/0 = 3/40` — feature absent by design. | `1/2/3/4/3/2/4/3 = 22/40` — no authority capability; safe non-admission beats partial copying. | different tradeoff — Wordgard's algorithm is coherent but incomplete for durable retries/multi-device identity; absence is correct until HC-011 admits an owner. | Keep protocol mechanics outside core; any future adapter must define contiguous version, idempotent ack, retry, persistence, and multi-device identity together. | Future authority adapter, gated by Plite core boundary | Plite Plan | `major-task` after HC-011 evidence | HC-011, HC-013 | None in HP-01–05; future authority packet depends on HC-011 approval. | `1/2/3/4/3/2/4/3 = 22/40` — safe non-admission is the accepted target while HC-011 has no admitted consumer or executable packet. | `+0/40` | Reject | Gate | No current adoption; retain `DocumentChange.transform` as the only reusable primitive. | Delete 0; do not copy `collapseUpdates`, version queue, or sendable API. | Future proof must cover dropped/duplicated/out-of-order acknowledgements, restart persistence, two clients sharing identity, and minimized convergence traces. | Risk: importing only the happy path would create silent lost updates. Reversal: implement only after the HC-011 consumer and protocol evidence exist; otherwise the non-admission decision stands. |
| HC-013 | Pairwise transform, rebase, and effect mapping | **Current Wordgard owner:** `ChangeSet` plus collab/history callers at `../wordgard/src/collab/collab.ts:108-152` and `../wordgard/src/history/history.ts:202-221`. | `4/5/3/4/3/4/3/5 = 31/40` — strong transform correctness/proof, but single-doc typing and owner boundaries lag. | **Current Plite owner:** core `DocumentChange`; transform/compose/correction/map/apply/invert are at `packages/plite/src/core/document-change.ts:5577-5849`; effect positions at `packages/plite/src/interfaces/editor.ts:271-315`. | `5/5/5/4/5/5/5/5 = 39/40` — typed multi-root primitive with strong laws; runtime breadth costs one point. | **Current Plate owner:** bounded adapter consumer via `packages/yjs/src/lib/BaseYjsPlugin.ts:1-12`; no transform policy. | `4/4/4/4/4/5/4/4 = 33/40` — correct absence, limited Plate-local proof. | `5/5/5/4/5/5/5/5 = 39/40` — canonical primitive and adapter ownership are sound. | superior — Plite adopts Wordgard's core law and surpasses it with typed structural multi-root changes and explicit adapter ordering. | Keep one protocol-neutral pairwise transform primitive; fix any HP-02 failures as canonical laws, not Yjs-specific history hacks. | Plite core `DocumentChange` | Plite Plan | `tdd` in HP-02 | Schema, HC-016, effect descriptors | HP-02, HP-03, HP-05 | `5/5/5/5/5/5/5/5 = 40/40` — seeded collaborative laws close runtime proof. | `+1/40` | Adopt | Keep | History and Yjs consume this primitive; Plate remains unaware. | Delete 0; HP-03 deletes duplicate split repair only after equivalent laws exist. | `packages/plite/test/document-change-laws.test.ts:1-800`; `packages/plite/test/document-change.test.ts:1851-2691`; HP-02 seeded peer model. | Risk: concurrent root lifecycle changes fail closed or structural intention diverges. Reversal: add a narrowly typed transform law from a minimized trace; never move protocol ordering into core. Reference scope: adopt principle, surpass implementation. |
| HC-014 | Collaboration protocol/product boundary | **Current Wordgard owner:** collab package; it excludes server/communication at `../wordgard/src/collab/index.ts:1-4` but assumes central authority at `../wordgard/src/collab/collab.ts:4-177`. | `3/3/3/3/2/2/3/3 = 22/40` — boundary is stated, but protocol/product responsibilities remain partially coupled. | **Current Plite owner:** protocol-neutral core plus `@platejs/yjs`; app boundary is explicit at `packages/yjs/README.md:157-181`. | `5/5/5/4/5/5/5/5 = 39/40` — excellent layer ownership; runtime proof not perfect. | **Current Plate owner:** app/provider docs at `content/docs/(plugins)/(collaboration)/yjs.mdx:160-205`; current example does not enact it. | `5/5/5/4/5/5/5/4 = 38/40` — correct doctrine, weaker demonstrated proof. | `5/5/5/4/5/5/5/5 = 39/40` — architecture is right; product adoption remains. | superior — Current ownership is better than Wordgard's partial separation; product adoption/proof is the gap. | Preserve core/adapter/app layering and demonstrate it through an app-owned provider-backed Plate example. | Plite core; `@platejs/yjs`; Plate app each owns its layer. | Plite Plan for boundary, Plate Plan for adoption | `plate-ui`/`testing` in HP-04 | HC-011, HC-015, HC-021 | HP-04, HP-05 | `5/5/5/5/5/5/5/5 = 40/40` — real product adoption closes proof. | `+1/40` | Adopt | Keep | Plate registry/docs adopt a real app-owned provider example; Yjs keeps transport-neutral structural provider interface. | Replace the static example; delete 0 core boundary code. | `packages/yjs/test/provider-contract.spec.ts:1-971`; Browser two-peer proof on the standalone collaboration demo in HP-04. | Risk: demo code can accidentally become product transport policy or ship credentials. Reversal: remove the demo provider implementation if it cannot remain app-local and credential-free; keep the documented ownership boundary. Reference scope: adopt boundary, surpass architecture. |
| HC-015 | Yjs extension, public state/transaction API, Plate adapter | **Current Wordgard owner:** collab state/functions at `../wordgard/src/collab/collab.ts:4-60`, `../wordgard/src/collab/collab.ts:108-177`; no CRDT lifecycle. | `2/3/3/3/2/2/3/4 = 22/40` — small/tested, but lacks provider/schema/awareness/hardening. | **Current Plite owner:** `@platejs/yjs` types/extension/controller at `packages/yjs/src/core/types.ts:4-210`, `packages/yjs/src/core/extension.ts:20-228`, and `packages/yjs/src/core/controller.ts:107-404`; duplicate methods are at `packages/yjs/src/core/types.ts:180-201`. | `5/5/5/4/5/5/5/5 = 39/40` — rich typed API/lifecycle; duplicate history ownership remains. | **Current Plate owner:** thin `BaseYjsPlugin`/`YjsPlugin` and docs at `packages/yjs/src/lib/BaseYjsPlugin.ts:1-12`, `packages/yjs/src/react/YjsPlugin.tsx:1-6`, and `content/docs/(plugins)/(collaboration)/yjs.mdx:175-196`. | `5/5/5/4/5/5/5/4 = 38/40` — clean adapters, but docs expose the ownership defect. | `5/5/5/4/5/5/5/5 = 39/40` — strong API except competing undo. | superior — Yjs vastly surpasses Wordgard's lifecycle/API, but its public undo methods violate single ownership. | Keep provider/awareness/schema/effect state and commands; remove `YjsTx.undo/redo` so history is external and canonical. | `@platejs/yjs` for transport API; `@platejs/plite-history` for undo | Plite Plan | `hard-cut` plus `tdd` in HP-03 | HC-006, HC-019, HC-024 | HP-02 gates HP-03; HP-04/05 adopt final API | `5/5/5/5/5/5/5/5 = 40/40` — one public owner removes the final API defect. | `+1/40` | Surpass | Rearchitect | Plate/docs/tests move normal undo calls to `editor.update.history.undo()`/`redo()`; `tx.history.*` remains only for atomic composition; provider/awareness consumers stay unchanged. | HP-03 deletes two methods, deferred handlers, controller branches, exports and docs; no compatibility alias. | `packages/yjs/src/lib/BaseYjsPlugin.api.spec.ts:1-126`; `packages/yjs/test/provider-contract.spec.ts:1-971`; HP-02/03 compile and replay gates. | Risk: hidden consumers or deferred handlers retain the removed API. Reversal: roll back HP-03 as one commit if public type scans or replay laws fail; do not restore a partial alias. Verdict scope: rearchitect public transaction API. |
| HC-016 | Yjs document encoding, identity, virtual projection, set merge | **Current Wordgard owner:** bounded absence; collab stores one `Plot.Doc`/`ChangeSet` queue at `../wordgard/src/collab/collab.ts:4-20`. | `0/0/0/0/0/0/0/0 = 0/40` — no corresponding encoding capability. | **Current Plite owner:** Yjs document bridge at `packages/yjs/src/core/document.ts:30-193`, `packages/yjs/src/core/document.ts:400-1180`, `packages/yjs/src/core/document.ts:1438-1882` plus set encoding at `packages/yjs/src/core/set-valued-attributes.ts:5-99`. | `5/5/5/4/4/5/4/5 = 37/40` — strong identity/correctness; large complexity and proof ownership cost points. | **Current Plate owner:** bounded adapter consumer via `packages/yjs/src/lib/BaseYjsPlugin.ts:1-12`; no encoding policy. | `4/4/4/4/4/5/4/4 = 33/40` — correct reuse, no direct product proof. | `5/5/5/4/4/5/4/5 = 37/40` — capable bridge, complexity/product proof remain. | superior — Current Yjs has no Wordgard equivalent and is substantially stronger; complexity and end-to-end product proof are the remaining costs. | Keep one Yjs projection/identity owner; remove only history-specific split metadata after reference analysis. | `@platejs/yjs` document bridge | Plite Plan | `tdd`/`testing` in HP-02/03/05 | Plite schema, HC-013, HC-018 | HP-02, HP-03, HP-05 | `5/5/5/5/4/5/5/5 = 39/40` — reference cleanup and proof improve efficiency/ownership while complexity remains real. | `+2/40` | Surpass | Keep | No Plate encoding adoption; tests/proof adopt canonical identity checks. | HP-03 deletes only `SPLIT_UNDO_TEXT_ATTRIBUTE` and repair-only paths proven unreferenced; preserve shared projection helpers. | `packages/yjs/test/attributes-contract.spec.ts:1-171`; `packages/yjs/test/document-id-contract.spec.ts:1-84`; `packages/yjs/test/set-node-contract.spec.ts:1-219`; `packages/yjs/test/structural-soak-contract.slow.ts:1-1069`. | Risk: overbroad deletion can remove a shared projection primitive or change Yjs identities. Reversal: retain any symbol with a non-history reference or failing identity law; require a source-reference graph before cut. |
| HC-017 | Outbound canonical-change lowering and mirror | **Current Wordgard owner:** collab send queue at `../wordgard/src/collab/collab.ts:42-71`, `../wordgard/src/collab/collab.ts:154-166`; no CRDT projection/mirror check. | `2/3/3/3/2/2/3/4 = 22/40` — basic send composition, but no identity/mirror/failure hardening. | **Current Plite owner:** Yjs change/event bridge/controller at `packages/yjs/src/core/change-bridge.ts:118-241`, `packages/yjs/src/core/controller.ts:406-598`, and `packages/yjs/src/core/event-change-bridge.ts:1863-2740`. | `5/5/5/5/5/5/4/5 = 39/40` — exact fast lowering/rollback/trace; concentrated ownership costs one point. | **Current Plate owner:** thin `BaseYjsPlugin` and static demo at `packages/yjs/src/lib/BaseYjsPlugin.ts:1-12` and `apps/www/src/registry/examples/collaboration-demo.tsx:19-42`. | `4/4/4/4/4/5/4/4 = 33/40` — correct adapter, missing real product exercise. | `5/5/5/5/5/5/4/5 = 39/40` — strong bridge; product/owner proof remains. | superior — Yjs surpasses Wordgard with canonical lowering, identity preservation, exact mirror checks, rollback, and trace. | Keep this as the only outbound path, including Plite history replay commits after HP-03. | `@platejs/yjs` change/event bridge | Plite Plan | `tdd` in HP-02/03; `testing` HP-05 | HC-013, HC-016, HC-024 | HP-02, HP-03, HP-05 | `5/5/5/5/5/5/5/5 = 40/40` — one-owner replay plus product proof closes ownership. | `+1/40` | Surpass | Keep | Plite history replay adopts normal lowering; Plate proof app exercises it. | Delete 0 bridge code; delete Yjs-specific undo branch that coordinates beside it. | `packages/yjs/test/canonical-change-contract.spec.ts:1-323`; `packages/yjs/test/canonical-replacement-contract.spec.ts:1-269`; `packages/yjs/scripts/benchmark-event-change-bridge.ts:13-279`. | Risk: an undo commit can hit whole-root fallback and change identities. Reversal: add a minimized lowering law or keep a narrowly private correction until it passes; never restore public dual stacks. |
| HC-018 | Inbound event translation, index, and fallback | **Current Wordgard owner:** bounded absence; collab receives formed changes at `../wordgard/src/collab/collab.ts:108-152`. | `0/0/0/0/0/0/0/0 = 0/40` — no event/projection capability. | **Current Plite owner:** Yjs event bridge/replacement at `packages/yjs/src/core/event-change-bridge.ts:53-3010` and `packages/yjs/src/core/replacement.ts:104-506`. | `5/5/5/5/5/5/3/5 = 38/40` — correct/fast/proven, but 3,010-line ownership is complex. | **Current Plate owner:** bounded adapter consumer; static demo at `apps/www/src/registry/examples/collaboration-demo.tsx:19-42` proves no runtime import. | `4/4/4/4/4/5/4/4 = 33/40` — correct reuse, weak product evidence. | `5/5/5/5/5/5/3/5 = 38/40` — robust bridge with concentrated owner/product gap. | superior — No Wordgard counterpart; current behavior is strong but concentrated in a 3,010-line owner and product proof is thin. | Keep the bridge and trace contract; simplify only after extraction preserves exact traces, fallback rate and benchmark. | `@platejs/yjs` event bridge | Plite Plan | `performance` plus `testing` only when a measured cleanup is accepted | HC-016, HC-019, HC-030 | HP-02 and HP-05; no cleanup packet currently | `5/5/5/5/5/5/4/5 = 39/40` — proof/owner clarity improves without speculative rewrite. | `+1/40` | Surpass | Keep | Apps/plite proof adopts fallback/identity assertions; Plate remains an adapter consumer. | Delete 0 now; no module split without a named responsibility and benchmark-neutral extraction. | `packages/yjs/test/remote-import-contract.slow.ts:1-1574`; `packages/yjs/test/structural-soak-contract.slow.ts:1-1069`; `packages/yjs/scripts/benchmark-event-change-bridge.ts:13-279`. | Risk: fallback can silently dominate or indexed translation can read stale projection state. Reversal: stop any cleanup if exact trace/fallback/benchmark output changes; retain current owner until a measured packet exists. |
| HC-019 | Trusted remote atomic import, history skip, selection | **Current Wordgard owner:** collab receive path at `../wordgard/src/collab/collab.ts:108-152`. | `4/4/3/4/3/4/3/5 = 30/40` — strong atomic/rebase intent, weaker types/multi-root ownership. | **Current Plite owner:** Yjs editor adapter plus Plite history at `packages/yjs/src/core/editor-adapter.ts:28-146` and `packages/plite-history/src/history-extension.ts:479-600`. | `5/5/5/5/5/5/5/5 = 40/40` — exact atomic canonical import and mapping. | **Current Plate owner:** adapter/toolbar consumer; static demo and toolbar are at `apps/www/src/registry/examples/collaboration-demo.tsx:19-42` and `apps/www/src/registry/ui/history-toolbar-button.tsx:1-44`. | `5/5/5/4/5/5/5/4 = 38/40` — correct consumption, missing real product proof. | `5/5/5/5/5/5/5/5 = 40/40` — canonical remote interaction is already ideal. | superior — Plite/Yjs adopt Wordgard's law and surpass it with atomic canonical import, tags, root-aware selection, and strict adapter trust. | Preserve atomic remote import and make it the sole collaboration-to-history interaction. | Yjs editor adapter plus Plite history | Plite Plan | `tdd` and `testing` | HC-005, HC-013, HC-018 | HP-02, HP-03, HP-04, HP-05 | `5/5/5/5/5/5/5/5 = 40/40` — target retains the ideal path. | `+0/40` | Adopt | Keep | Plate's real demo adopts the same adapter; no product-specific remote mutation path. | Delete 0; HP-03 removes the parallel Yjs history path, not remote import. | `packages/yjs/test/editor-adapter-contract.spec.ts:1-33`; `packages/plite/test/collab-canonical-reconcile-contract.ts:1-156`; HP-04 Browser convergence. | Risk: malformed remote selection/effects can partially mutate state if trust boundary is bypassed. Reversal: reject and roll back the entire remote transaction; do not add partial fallback mutation. Reference scope: adopt law, surpass implementation. |
| HC-020 | Room schema metadata and reconfiguration | **Current Wordgard owner:** bounded absence; collab config has only version/client/effects at `../wordgard/src/collab/collab.ts:23-31`, `../wordgard/src/collab/collab.ts:73-89`. | `0/1/1/2/1/0/1/1 = 7/40` — almost no schema capability or hardening. | **Current Plite owner:** Yjs schema metadata/controller at `packages/yjs/src/core/schema-metadata.ts:10-157` and `packages/yjs/src/core/controller.ts:606-634`, `packages/yjs/src/core/controller.ts:922-989`. | `5/5/5/4/5/5/5/5 = 39/40` — exact fail-closed room contract; lifecycle browser proof remains. | **Current Plate owner:** thin config plus apps/plite browser row at `apps/plite/tests/plite-browser/donor/examples/yjs-collaboration.test.ts:5-77`. | `5/5/5/4/5/5/4/4 = 37/40` — real schema proof, but one lifecycle row. | `5/5/5/4/5/5/5/5 = 39/40` — strong exact owner, incomplete runtime breadth. | superior — Yjs has no Wordgard counterpart and correctly fail-closes; browser lifecycle coverage is incomplete. | Keep exact room claims and add disconnect/reconnect/reconfigure rollback proof. | `@platejs/yjs` schema metadata/controller | Plite Plan | `testing` in HP-05 | Compiled Plite schema, HC-009, HC-021 | HP-05 schema-lifecycle proof | `5/5/5/5/5/5/5/5 = 40/40` — lifecycle proof closes runtime gap. | `+1/40` | Surpass | Keep | Apps/plite and Plate demo expose mismatch/recovery state; apps still own room identity. | Delete 0 schema code; replace narrow proof with full lifecycle rows. | `packages/yjs/test/schema-identity-contract.spec.ts:1-645`; focused Browser row plus HP-05 reconnect scenario. | Risk: failed reconfiguration can leave room metadata and editor schema out of sync. Reversal: retain prior controller/claim atomically if any staged step rejects. |
| HC-021 | Provider lifecycle, seed, snapshot, unsafe rollback | **Current Wordgard owner:** bounded transport absence; `../wordgard/src/collab/index.ts:1-4` excludes it and `../wordgard/test/test-collab.ts:11-80` supplies a dummy server. | `0/1/1/1/1/0/2/2 = 8/40` — explicit boundary, almost no lifecycle capability. | **Current Plite owner:** Yjs provider lifecycle/controller at `packages/yjs/src/core/provider-lifecycle-adapter.ts:15-275` and `packages/yjs/src/core/controller.ts:406-486`, `packages/yjs/src/core/controller.ts:868-1081`. | `5/5/5/4/5/5/5/5 = 39/40` — broad atomic lifecycle; live reconnect proof costs one point. | **Current Plate owner:** app-provider docs/static demo at `content/docs/(plugins)/(collaboration)/yjs.mdx:160-205` and `apps/www/src/registry/examples/collaboration-demo.tsx:19-42`. | `5/5/5/4/5/5/4/4 = 37/40` — correct owner doctrine, missing enacted provider. | `5/5/5/4/5/5/5/5 = 39/40` — strong runtime, product adoption missing. | superior — Yjs surpasses Wordgard by owning a provider-neutral lifecycle; Plate adoption/proof is missing. | Keep provider lifecycle in Yjs and build a credential-free app-owned development provider example plus real reconnect proof. | Yjs lifecycle adapter; Plate app owns concrete provider | Plite Plan for runtime, Plate Plan for example | `testing` HP-05; `plate-ui` HP-04 | HC-014, HC-020, HC-029 | HP-04, HP-05 | `5/5/5/5/5/5/5/5 = 40/40` — provider product/reconnect proof closes the gap. | `+1/40` | Surpass | Keep | Plate demo supplies/tears down provider; apps/plite tests seed, disconnect, reconnect, and recover. | Delete static no-provider demo in HP-04; delete 0 provider runtime. | `packages/yjs/test/provider-contract.spec.ts:1-971`; HP-04 two-peer Browser; HP-05 reconnect/leak proof. | Risk: seed races first sync, stale listeners double-import, or rollback leaves a ghost local batch. Reversal: fail closed to previous controller/provider and remove demo provider if teardown cannot be deterministic. |
| HC-022 | Awareness and relative selections | **Current Wordgard owner:** bounded absence; collab state at `../wordgard/src/collab/collab.ts:4-31` has no presence. | `0/0/0/0/0/0/0/0 = 0/40` — no corresponding capability. | **Current Plite owner:** Yjs awareness/selection/adapter at `packages/yjs/src/core/awareness.ts:13-77`, `packages/yjs/src/core/selection.ts:14-95`, and `packages/yjs/src/core/awareness-adapter.ts:19-299`. | `5/5/5/4/5/5/5/5 = 39/40` — typed fail-soft awareness; runtime/pixels proof remains. | **Current Plate owner:** docs plus null overlay at `content/docs/(plugins)/(collaboration)/yjs.mdx:175-195` and `apps/www/src/registry/ui/remote-cursor-overlay.tsx:1-5`. | `4/4/5/4/4/4/3/3 = 31/40` — API doctrine exists, actual product adoption/proof does not. | `5/5/5/4/5/5/4/5 = 38/40` — strong core weakened by Plate ownership gap. | superior — Core Yjs strongly surpasses Wordgard; Plate has not adopted the capability it documents. | Keep awareness core and connect it to a real Plate cursor surface with stale-selection cleanup. | `@platejs/yjs` for awareness; Plate registry for rendering | Plate Plan for adoption | `plate-ui` plus `testing` in HP-04 | HC-021, HC-023 | HP-04, HP-05 | `5/5/5/5/5/5/5/5 = 40/40` — real pixels/lifecycle close product gap. | `+2/40` | Surpass | Bridge | Plate overlay/demo consumes existing remote cursor hooks; no new awareness model. | Replace null overlay only; delete 0 Yjs awareness code. | `packages/yjs/test/awareness-contract.spec.ts:1-293`; `packages/yjs/test/selection-contract.spec.ts:1-206`; HP-04 Browser cursor pixels and stale deletion. | Risk: stale/deleted relative positions crash rendering or local peer echoes as remote. Reversal: drop invalid decorations fail-soft and keep core awareness if product rendering must be rolled back. |
| HC-023 | React cursor subscription/geometry and Plate overlay | **Current Wordgard owner:** bounded absence; `../wordgard/src/collab/index.ts:1-4` exports protocol helpers only. | `0/0/0/0/0/0/0/0 = 0/40` — no React/cursor capability. | **Current Plite owner:** Yjs React subscriptions/hooks/geometry at `packages/yjs/src/react/index.ts:77-110`, `packages/yjs/src/react/index.ts:379-606`. | `5/5/5/4/5/5/5/5 = 39/40` — correct typed lifecycle; DOM runtime cost not perfect. | **Current Plate owner:** registry no-op/docs at `apps/www/src/registry/ui/remote-cursor-overlay.tsx:1-5` and `content/docs/examples/collaboration-example.mdx:1-51`. | `1/2/3/2/2/1/1/1 = 13/40` — exported surface exists but renders nothing and has no proof. | `4/4/5/4/4/3/3/3 = 30/40` — reusable hook helps, fake product owner dominates. | superior — Plite React already owns the hard subscription/geometry logic; Plate's product surface is fake. | Implement the Plate overlay as presentation over existing hooks; render two-peer cursors in the real collaboration demo. | Plate registry/UI; Yjs React remains data owner | Plate Plan | `plate-ui` plus `testing` in HP-04 | HC-022, HC-031 | HP-04; HP-05 closes browser reliability | `5/5/5/5/5/5/5/5 = 40/40` — real rendering/proof completes the stack. | `+10/40` | Surpass | Rearchitect | Plate registry, collaboration kit/example, apps/www and docs adopt the existing hook; downstream registry copy gets a real component. | Replace the five-line null component; remove docs claims only if pixels cannot ship. | `packages/yjs/test/react-contract.spec.tsx:1-534`; Browser scroll/resize/zoom/unmount/multi-root cursor proof and screenshots in HP-04. | Risk: geometry drifts across root/scroll coordinate spaces or listeners leak. Reversal: roll back only the Plate renderer while retaining Yjs hooks; do not invent a second cursor state model. Verdict scope: rearchitect Plate adoption. |
| HC-024 | One canonical collaborative history owner | **Current Wordgard owner:** one history stack; remote mapping is at `../wordgard/src/history/history.ts:37-69`, `../wordgard/src/history/history.ts:202-246` and collab adds no stack at `../wordgard/src/collab/collab.ts:108-152`. | `4/5/3/4/3/4/4/5 = 32/40` — one-owner correctness is strong, though types/lifecycle are narrower. | **Current Plite owner:** conflicting Plite history plus Yjs manager/split stack at `packages/yjs/src/core/controller.ts:107-327`, `packages/yjs/src/core/controller.ts:829-849` and `packages/yjs/src/core/types.ts:180-201`. | `3/3/4/3/3/4/2/4 = 26/40` — tests exist, but duplicate semantics/ownership reduce most dimensions. | **Current Plate owner:** conflicting toolbar/docs at `apps/www/src/registry/ui/history-toolbar-button.tsx:1-44` and `content/docs/(plugins)/(collaboration)/yjs.mdx:167-196`. | `2/2/4/3/2/3/2/2 = 20/40` — two user answers and weak product proof. | `3/3/4/3/3/4/2/4 = 26/40` — duplicate owners dominate the combined score. | inferior — Wordgard's one-owner law is architecturally cleaner; current dual ownership is Plite/Yjs's largest defect despite strong tests. | Make `@platejs/plite-history` the only public/user undo owner; lower replay commits through the normal Yjs bridge; remote imports stay history-skipped and mapped. | `@platejs/plite-history` | Plite Plan | `tdd` HP-02, then `hard-cut` HP-03 | HC-005, HC-006, HC-013, HC-017–019, HC-025 | HP-02 gates HP-03; HP-04/05 depend on final API | `5/5/5/4/5/5/5/5 = 39/40` — one owner and proof maximize clarity; bridge runtime remains nontrivial. | `+13/40` | Adopt | Cut | Yjs/Plate/tests/docs move normal user undo to `editor.update.history.undo()`/`redo()`; `tx.history.*` remains only inside atomic updates; no compatibility alias. | HP-03 deletes Yjs undo/redo API, manager, split history and private stack contract after HP-02 passes. | HP-02 seeded differential oracle compares documents, Yjs projections, convergence, selections, effects, depths and reconnect after every step; HP-03 full package/browser/benchmark closure. | Risk: remote structural/offline undo can lose intent or identity. Reversal: a minimized failure adds a canonical law and blocks deletion; only whole-packet rollback may restore old code temporarily, never two blessed public owners. Reference scope: adopt one-owner law. Verdict scope: cut, then rearchitect. |
| HC-025 | Split-history special case and private Yjs stack pin | **Current Wordgard owner:** bounded absence; ordinary mapped history owns structures at `../wordgard/src/history/history.ts:171-246`. | `0/0/0/0/0/0/0/0 = 0/40` — no private CRDT history liability. | **Current Plite owner:** Yjs private-stack/split subsystem at `packages/yjs/src/core/undo-manager-adapter.ts:5-118`, `packages/yjs/src/core/split-history-adapter.ts:67-826`, `packages/yjs/src/core/split-history.ts:18-448`, and exact pin `packages/yjs/package.json:57-75`. | `3/2/3/3/2/4/1/5 = 23/40` — well-tested/hardened locally, but complex, private, duplicated, and poorly owned. | **Current Plate owner:** indirect Yjs command/docs consumer at `content/docs/(plugins)/(collaboration)/yjs.mdx:167-196`; no direct split owner. | `1/1/2/2/1/2/1/2 = 12/40` — exposes consequence without owning semantics/proof. | `3/2/3/3/2/4/1/5 = 23/40` — private-stack dependency dominates. | superior — The subsystem is locally sophisticated and well-tested, but duplicates canonical structural/history semantics and depends on private Yjs internals. | Express structural undo as canonical history/change laws; remove private stack access and split metadata. | Plite core/history after deletion | Plite Plan | `hard-cut` plus `tdd` in HP-03 | HC-013, HC-016, HC-024; HP-02 green | HP-02, HP-03 | `5/5/5/5/5/5/5/5 = 40/40` — deletion plus canonical laws removes the liability. | `+17/40` | Reject | Cut | Structural laws move to Plite tests; Yjs uses normal bridge; Plate changes docs/API. | Delete three files, repair-only symbols/tests, exact-pin contract, and controller branches. | `packages/yjs/test/split-history-contract.spec.ts:1-62`; `packages/yjs/test/split-node-contract.spec.ts:1-386`; `packages/yjs/test/structural-soak-contract.slow.ts:1-1069`; HP-02 replacements. | Risk: deletion can break offline intent/remove shared helpers. Reversal: retain symbols with non-history references/failing canonical laws; whole HP-03 rollback only. |
| HC-026 | Shared-effect declaration, mapping, inversion, transport | **Current Wordgard owner:** history/collab effect hooks at `../wordgard/src/history/history.ts:127-132` and `../wordgard/src/collab/collab.ts:23-31`, `../wordgard/src/collab/collab.ts:47-71`. | `3/4/3/4/2/3/3/4 = 26/40` — right concept/mapping, but ephemeral, weakly typed/persisted. | **Current Plite owner:** generic Plite descriptors plus Yjs log at `packages/plite/src/interfaces/editor.ts:271-315`, `packages/plite/src/core/transaction-values.ts:8-114`, and `packages/yjs/src/core/shared-effect-log.ts:21-579`. | `5/5/5/4/5/5/5/5 = 39/40` — typed durable split of concerns; live runtime proof pending. | **Current Plate owner:** thin configuration/docs consumer at `packages/yjs/README.md:116-155`. | `5/5/5/4/5/5/4/4 = 37/40` — correct reuse, less product proof/ownership. | `5/5/5/4/5/5/5/5 = 39/40` — sound generic/transport split. | superior — Plite/Yjs adopt Wordgard's idea and surpass it with strict generic semantics plus durable adapter transport. | Keep generic descriptors in Plite and durable transport in Yjs; replay exactly once. | Plite effect registry and Yjs shared-effect log | Plite Plan | `tdd`/`testing` in HP-02/05 | HC-003, HC-019, HC-027 | HP-02, HP-05 | `5/5/5/5/5/5/5/5 = 40/40` — exact-once live proof closes the gap. | `+1/40` | Adopt | Keep | History/Yjs proof adopts exact-once/order assertions; Plate stays thin. | Delete 0 effect owners; HP-03 deletes duplicate Yjs-history replay only. | `packages/plite/test/collab-document-state-contract.ts:1-138`; `packages/yjs/test/shared-effect-compaction-contract.spec.ts:1-1046`; HP-02 oracle. | Risk: history and log both deliver. Reversal: fix canonical descriptor/log law from a minimized trace; keep generic semantics outside Yjs. Reference scope: adopt concept, surpass implementation. |
| HC-027 | Shared-effect replay order and codec failure isolation | **Current Wordgard owner:** collab effect mapping at `../wordgard/src/collab/collab.ts:47-71`, `../wordgard/src/collab/collab.ts:108-152`; no durable sequence/codec restart. | `2/3/3/3/2/2/3/4 = 22/40` — useful mapping, weak durability/isolation/hardening. | **Current Plite owner:** Yjs shared-effect log/controller at `packages/yjs/src/core/shared-effect-log.ts:593-844` and `packages/yjs/src/core/controller.ts:719-766`. | `5/5/5/4/5/5/5/5 = 39/40` — strong per-source isolation; live reconnect proof missing. | **Current Plate owner:** bounded thin plugin/docs consumer at `packages/yjs/src/lib/BaseYjsPlugin.ts:1-12`. | `5/5/5/4/5/5/4/3 = 36/40` — semantics reused, little product evidence. | `5/5/5/4/5/5/5/5 = 39/40` — strong runtime, network proof gap. | superior — Yjs substantially surpasses Wordgard; the gap is network/browser/reconnect proof. | Preserve per-source isolation and prove codec recovery/exact-once reconnect. | `@platejs/yjs` shared-effect log | Plite Plan | `testing` in HP-05 | HC-021, HC-026, descriptor registry | HP-05 reconnect proof | `5/5/5/5/5/5/5/5 = 40/40` — live source-isolation proof completes it. | `+1/40` | Surpass | Keep | Apps/plite adds two sources/failure/reconnect; docs report executable behavior. | Delete 0 runtime; delete false claims without proof. | `packages/yjs/test/shared-effect-compaction-contract.spec.ts:1-1046`; HP-05 source-isolation row. | Risk: one codec blocks all or reconnect duplicates. Reversal: stop only offending source; retain data until decode/ack. |
| HC-028 | Shared-effect authority, acknowledgements, compaction, retirement | **Current Wordgard owner:** bounded absence at `../wordgard/src/collab/collab.ts:4-177`. | `0/0/0/0/0/0/0/0 = 0/40` — no durable authority/compaction capability. | **Current Plite owner:** Yjs shared-effect log at `packages/yjs/src/core/shared-effect-log.ts:21-336`, `packages/yjs/src/core/shared-effect-log.ts:846-1010`, `packages/yjs/src/core/shared-effect-log.ts:1181-1302`. | `5/5/5/4/5/5/4/5 = 38/40` — strict safe semantics; distributed owner/runtime proof costs points. | **Current Plate owner:** app authority boundary in `packages/yjs/README.md:145-179`; no distributed product proof. | `5/5/5/4/5/5/3/3 = 35/40` — correct policy ownership, weak executable evidence. | `5/5/5/4/5/5/4/5 = 38/40` — strong simulated law, not production-proven. | superior — No Wordgard counterpart; current semantics are strong but proof remains simulated. | Keep compaction law; add executable provider/restart/authority proof before claims. | Yjs log; app authority/persistence owner | Plite Plan plus Plate/app proof owner | `testing` in HP-05 | HC-021, HC-026, HC-027 | HP-05 authority proof | `5/5/5/5/5/5/4/5 = 39/40` — live proof improves runtime confidence; authority complexity remains. | `+1/40` | Surpass | Keep | Apps/plite/live provider owns proof; docs state obligations only. | Delete 0 runtime; narrow unsupported proof language. | `packages/yjs/test/shared-effect-compaction-contract.spec.ts:1-1046`; HP-05 authority/ack soak. | Risk: premature compaction loses effects/two authorities conflict. Reversal: disable compaction while retaining append-only log. |
| HC-029 | Multi-root collaboration binding | **Current Wordgard owner:** single `CollabState.syncedDoc` at `../wordgard/src/collab/collab.ts:11-20`; no root model. | `1/2/2/3/2/1/3/3 = 17/40` — implicit single-doc behavior, little type/lifecycle hardening. | **Current Plite owner:** multi-root core plus one-root Yjs extension at `packages/plite/src/core/document-change.ts:5267-5380`, `packages/yjs/src/core/extension.ts:70-205`, and `packages/yjs/README.md:170-179`. | `4/4/5/4/4/4/4/4 = 33/40` — typed explicit binding, limited broader-root proof. | **Current Plate owner:** per-editor plugin host; no multi-root example at `apps/www/src/registry/examples/collaboration-demo.tsx:19-42`. | `4/4/5/4/4/4/4/4 = 33/40` — correct host model, no product proof. | `4/4/5/4/4/4/4/5 = 34/40` — explicit binding with strong types; isolation proof/owner clarity remain. | superior — Current per-root adapter is better than Wordgard; broader room binding is unjustified. | Keep one-root-per-extension; prove isolation; admit broader only for a real host. | Yjs extension; Plite core multi-root | Plite Plan | `testing` HP-05; future `major-task` | HC-013, HC-016, HC-020 | HP-05 root-isolation proof | `5/5/5/4/5/5/4/5 = 38/40` — isolation/fail-closed proof improves without speculative aggregation. | `+4/40` | Surpass | Gate | Apps/plite adds sibling-root isolation; docs state binding. | Delete 0; no speculative aggregation. | `packages/plite-history/test/history-contract.ts:587-705`; `packages/yjs/test/schema-identity-contract.spec.ts:1-645`; HP-05 isolation. | Risk: sibling-root bleed. Reversal: fail ambiguous activation; broaden only with exact host requirements. Verdict scope: gate broader API. |
| HC-030 | Trace, benchmark, diagnostics, production proof | **Current Wordgard owner:** unseeded tests at `../wordgard/test/test-history.ts:304-321` and `../wordgard/test/test-collab.ts:282-308`. | `2/2/2/3/2/2/3/2 = 18/40` — useful stress, but irreproducible and no browser/benchmark artifact. | **Current Plite owner:** Yjs trace/benchmark plus docs at `packages/yjs/src/core/event-change-bridge.ts:2742-3010`, `packages/yjs/scripts/benchmark-event-change-bridge.ts:13-279`, `benchmarks/targets/slate-v2.json:255-275`, and `content/docs/plite/libraries/plite-yjs.mdx:193-211`. | `5/5/5/5/4/5/4/4 = 37/40` — excellent narrow trace/perf; false soak/owner gap lowers quality. | **Current Plate owner:** apps/plite two browser rows at `apps/plite/tests/plite-browser/donor/examples/yjs-collaboration.test.ts:5-77` and `apps/plite/tests/plite-browser/donor/examples/yjs-hocuspocus.test.ts:5-20`. | `3/3/4/3/3/3/2/2 = 23/40` — some real browser behavior, missing cursor/offline/undo story. | `5/5/5/5/4/5/4/3 = 36/40` — strong packages, weak end-to-end truth. | superior — Plite/Yjs surpass Wordgard, but false soak docs/shallow browser cap confidence. | Make every claim executable/registered; add seeded provider/history rows. | Proof owner: Plite release contracts; browser host: `apps/plite` | Plite Plan | `testing` plus `performance` HP-05 | HC-018, HC-021, HC-024, HC-032 | HP-05 after HP-02/03/04 | `5/5/5/5/5/5/5/5 = 40/40` — registered full-stack proof. | `+4/40` | Surpass | Rearchitect | CI/release/docs use registered commands/seeds; Plate supplies pixels. | Delete nonexistent claim or build/register it; strengthen mount-only row. | Existing benchmark, Yjs tests, HP-05 browser/soak/leaks. | Risk: fake gates/irreproducible flakes. Reversal: quarantine only with tracked replacement/artifact; narrow claims immediately. Verdict scope: rearchitect proof truth. |
| HC-031 | Plate collaboration docs, example, and product boundary | **Current Wordgard owner:** mixed history menu plus declared collab boundary at `../wordgard/src/history/history.ts:98-111`, `../wordgard/src/history/history.ts:358-380` and `../wordgard/src/collab/index.ts:1-4`. | `2/2/2/3/2/2/1/3 = 17/40` — poor UI/state ownership, modest boundary clarity. | **Current Plite owner:** real Yjs/provider/cursor APIs at `packages/yjs/README.md:157-181` and `packages/yjs/src/react/index.ts:379-606`. | `4/4/5/4/4/5/4/4 = 34/40` — strong capability, complex adapter and limited product proof. | **Current Plate owner:** static demo/null overlay/docs at `apps/www/src/registry/examples/collaboration-demo.tsx:1-42`, `apps/www/src/registry/ui/remote-cursor-overlay.tsx:1-5`, `content/docs/(plugins)/(collaboration)/yjs.mdx:7-17`, and `content/docs/examples/collaboration-example.mdx:1-51`. | `2/2/4/3/3/1/1/1 = 17/40` — claims exceed implementation; ownership/proof fail. | `3/3/5/4/4/3/2/2 = 26/40` — real headless capability, fake product layer. | superior — Plite capability is real; Plate's advertised surface is not. | Provider-backed example, real overlay, standard history, honest docs. | Plate registry/apps/www/docs | Plate Plan | `plate-ui`, `components`, `testing` HP-04 | HC-014, HC-021–024 | HP-04, then HP-05 | `5/5/5/5/5/5/5/5 = 40/40` — full real product adoption. | `+14/40` | Adopt | Rearchitect | Plate kit/registry/apps/docs adopt existing APIs. | Replace static/null; remove duplicate undo/unsupported claims. | Component plus Browser two peers/cursors/undo/errors/cleanup. | Risk: transport policy/credentials or fake peers. Reversal: remove demo provider/narrow claims; retain headless capability. Reference scope: adopt boundary only. |
| HC-032 | Proof architecture and release contracts | **Current Wordgard owner:** 52 unit cases at `../wordgard/test/test-history.ts:41-580` and `../wordgard/test/test-collab.ts:11-320`; no browser/benchmark/replay artifact owner. | `4/4/3/3/2/3/3/4 = 26/40` — useful laws, but unseeded/no lifecycle/product proof. | **Current Plite owner:** history/Yjs package proof and benchmark at `packages/plite-history/test/history-contract.ts:1-1946`, `packages/plite-history/test/history-persistence-contract.spec.ts:1-811`, `packages/plite-history/test/index.spec.ts:22-63`, `packages/plite-history/test/index.spec.ts:157-189`, and `packages/yjs/test/package-config-contract.spec.ts:212-243`. | `5/5/5/5/4/5/4/5 = 38/40` — broad deterministic proof; false soak/owner clarity costs points. | **Current Plate owner:** two browser rows plus null product at `apps/plite/tests/plite-browser/donor/examples/yjs-collaboration.test.ts:5-77`, `apps/plite/tests/plite-browser/donor/examples/yjs-hocuspocus.test.ts:5-20`, and `apps/www/src/registry/ui/remote-cursor-overlay.tsx:1-5`. | `3/3/4/3/3/3/2/2 = 23/40` — narrow browser and misleading pixels. | `5/5/5/5/4/5/4/4 = 37/40` — package strength, end-to-end proof gap. | superior — Package proof surpasses Wordgard; product/release truth does not. | Layered deterministic unit/property/browser/benchmark gates with exact owners/artifacts. | Plite/Yjs proof; apps/plite/Plate release | Combined Plans | `testing` plus `performance` | All changed HC, especially 024/030/031 | HP-01–05; HP-05 closure | `5/5/5/5/5/5/5/5 = 40/40` — every claim becomes executable. | `+3/40` | Surpass | Rearchitect | Packages/apps/docs/fixtures/CI adopt one proof story. | Delete false claim/private tests only with replacements. | HP-01 contracts; HP-02 model; HP-03 package/browser/bench; HP-04 Browser; HP-05 full closure. | Risk: green units mask broken pixels/commands. Reversal: revert packet or narrow claims; never waive missing proof. Verdict scope: rearchitect closure gates. |

### Normalized 28-concept ledger

| ID | Mechanism | Wordgard shape and evidence | Wordgard score | Current Plite shape and evidence | Plite score | Current Plate shape and evidence | Plate score | Current combined score | Comparison | Proposed shape | Target owner | Decision owner | Execution skill | Dependencies | Dependent packets | Target score | Gain | Reference disposition | Local verdict | Adoption | Deletion | Proof | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PRODUCT-001 | Pure command descriptor and result | Owner: Wordgard command core. A command is a callable identity whose default implementation returns a transaction-like result or false; it is compact but admits arbitrary function behavior and has weak nominal identity. Evidence: `../wordgard/src/command/command.ts:4-55`. Score reason: good semantic intent, modest type/runtime discipline, thin proof. | `3/3/3/3/3/3/4/2 = 24`; middling across all dimensions because the callable token is ergonomic but not a frozen, named, pure public contract. | Owner: `packages/plite` command definition. Commands are frozen named descriptors with typed input/editor capability, private identity, and pure spec production. Evidence: `packages/plite/src/core/command-definition.ts:18-31`, `packages/plite/src/core/command-definition.ts:53-112`. Score reason: complete generic law; host fitness alone remains one point below perfect because DOM focus belongs outside core. | `5/5/5/5/5/4/5/5 = 39`; exact identity, typing, runtime, lifecycle, DX, and tests are complete; core intentionally delegates mounted-host concerns. | Owner: Plate core plus feature packages. Plate compiles plugin product behavior but product entry points are still often transaction groups or UI callbacks. Evidence: `packages/core/src/lib/plugin/BasePlugin.ts:550-576`. Score reason: typed composition and runtime are strong; a uniform public product-command descriptor is absent. | `2/3/4/4/4/4/3/4 = 28`; product semantics and DX lag while compilation, typing, and tests are sound. | `5/5/5/5/5/4/5/5 = 39`; Plite already supplies the generic command law, so Plate's missing product publication costs only host/product adoption, not substrate correctness. | superior — Superior to Wordgard: named frozen purity beats callable identity; reverse evidence is Wordgard's shorter callable API, but it does not offset weaker identity and purity. | Keep the Plite descriptor/result law unchanged. Ordinary Plate behavior uses the owning plugin's inferred updates; define a command only for a proved headless, interception, or preview job. | Current and target substrate owner: `packages/plite`; product descriptor owner per command: its Plate feature package; React binding owner: `packages/plite-react`. | Plite command-law decisions: Plite Plan; product publication decisions: Plate Plan. | `plite-plan --deep` for keep gate; `plate-plan --deep` for Packet 1 adoption. | Current Plite command definition and registry; Packet 1 must not introduce another dispatcher. | Packets 1 and 2 consume the kept substrate; Packet 7 proves and documents it. | `5/5/5/5/5/5/5/5 = 40`; host proof closes the sole current point without changing core ownership. | `+1`; gain comes from end-to-end mounted-host proof and Plate product adoption, not a new command model. | Surpass | Keep | Downstream owners: Plate core compilation, basic nodes, basic styles, link, media, list packages, history UI, registry controls, apps/www examples, apps/plite proof app, docs, fixtures, and tests adopt typed feature portals through Packets 1, 2, and 7. Yjs/codecs keep consuming committed document changes, not commands. | Delete no Plite command primitive. Packets 1–2 delete migrated registry string-key/raw mutation entry points and duplicated feature state after parity proof; transaction groups used for composition remain. | Current law: `packages/plite/src/core/command-definition.ts:53-112` and `packages/plite/src/core/command-registry.ts:38-130`. Target: compile-time input/capability tests, one spec/commit, mounted-root dispatch, focus restoration, and toolbar/shortcut/programmatic parity. | Medium adoption breadth; high risk only if a generic `Action` layer becomes a second dispatcher or leaks UI labels/icons into packages. Reference scope: surpass. Surpass and keep. Reverse evidence retained: Wordgard demonstrates the value of a tiny bound invocation, informing direct feature-portal ergonomics only.. Verdict scope: keep. Keep Plite; reject Wordgard function identity as public command identity. |
| PRODUCT-002 | Ordered fallback handlers | Owner: Wordgard command core. The editor tries handlers in priority order until one returns a result. Evidence: `../wordgard/src/command/command.ts:19-55`. Score reason: fallback is explicit and useful, but continuation, cycle law, and lifecycle publication are not first-class. | `4/4/3/4/3/3/3/3 = 27`; strong basic semantics/composition, weaker typing, host separation, ownership, and proof. | Owner: `packages/plite` command registry. Immutable handler pipelines support priority, scoped requirements, deterministic fallback, collision checks, and atomic application. Evidence: `packages/plite/src/core/command-registry.ts:38-130`, `packages/plite/src/core/command-registry.ts:295-318`. Score reason: all generic laws are explicit; host integration is intentionally external. | `5/5/5/5/5/4/5/5 = 39`; only host fitness is delegated to React/DOM. | Owner: Plate feature plugins compiled by Plate core. Plugins contribute ordered product behavior into Plite pipelines, including feature handlers such as code block and list behavior. Evidence: `packages/code-block/src/lib/withCodeBlock.ts:156-245`, `packages/list/src/lib/withList.ts:343-422`. Score reason: product fallback is mature but publication is distributed across feature owners. | `4/4/5/5/5/4/4/4 = 35`; excellent type/runtime/lifecycle, slightly diffuse semantic ownership and proof. | `5/5/5/5/5/4/5/5 = 39`; Plite owns deterministic fallback and Plate supplies product handlers without duplicating the registry. | superior — Superior: Plite makes the ordered pipeline immutable and diagnosable. Reverse evidence: Wordgard's simple first-success loop is easier to read locally, but cannot express the same lifecycle/collision guarantees. | Keep one Plite-owned fallback pipeline for real commands. Ordinary feature updates never install a parallel resolver. | Current and target owner: `packages/plite` registry; contribution owner per handler: its Plate feature package through Plate core compilation. | Plite Plan owns fallback law; Plate Plan owns feature-handler adoption. | `plite-plan --deep` keep review; `plate-plan --deep` Packets 1–2. | PRODUCT-001 descriptor identity; Plate model compilation. | Packets 1–2 rely on fallback; Packet 7 guards collision and parity laws. | `5/5/5/5/5/5/5/5 = 40`; mounted-host proof completes the stack. | `+1`; host integration proof only. | Surpass | Keep | Downstream owners: all Plate plugin handlers, input rules, link/list/code-block behavior, registry feature updates, apps/plite command proof, docs, and tests use one pipeline. History, Yjs, and codecs remain downstream of the resulting transaction/change. | Delete any Packet 1 prototype that registers a parallel `Action` resolver. Delete duplicate feature fallback arrays only when their owning plugin handler has parity tests. | Current registry contracts: `packages/plite/src/core/command-registry.ts:38-130`. Product examples: `packages/code-block/src/lib/withCodeBlock.ts:156-245`. Target proof covers priority, false fallback, collision diagnostics, one commit, and handler removal/reconfigure. | High architectural risk if an `Action` abstraction silently reimplements ordering; otherwise low runtime risk. Reference scope: surpass. Surpass and keep; Wordgard remains a readability oracle for first-success semantics, not an API donor.. Verdict scope: keep. Keep current Plite pipeline; reject a separate product fallback registry. |
| PRODUCT-003 | Explicit middleware and delegation | Owner: Wordgard command core. Handlers can decline, but there is no explicit `next`/`around` continuation contract. Evidence: `../wordgard/src/command/command.ts:19-55`. Score reason: behavior can be chained only implicitly, so recursion, post-processing, and delegation law are weak. | `1/1/2/2/1/1/2/1 = 11`; the missing continuation model depresses semantics, composition, lifecycle, host fit, and proof. | Owner: `packages/plite` registry. `handle` and `around` are distinct; `next` is single-use, `next.after` is explicit, and cycles/depth overflow are rejected before one atomic apply. Evidence: `packages/plite/src/core/command-registry.ts:132-293`. Score reason: complete middleware law with intentional host separation. | `5/5/5/5/5/4/5/5 = 39`; only mounted-host proof sits outside core. | Owner: Plate core and feature plugins. Input rules, code block, lists, and links use Plite middleware for product interception/delegation. Evidence: `packages/core/src/lib/plugins/input-rules/internal/InputRulesPlugin.ts:137-279`, `packages/link/src/lib/BaseLinkPlugin.ts:467-502`. Score reason: strong runtime/host integration; handler APIs vary by product owner. | `5/5/4/5/4/5/4/4 = 36`; semantics/runtime/host are excellent, while product API uniformity and lifecycle proof can improve. | `5/5/5/5/5/4/5/5 = 39`; the generic Plite law dominates and Plate already consumes it. | superior — Decisively superior. Reverse evidence is only Wordgard's lower conceptual surface; that simplicity comes from omitting necessary delegation law. | Preserve `handle`/`around` for justified commands; ordinary feature updates need no middleware wrapper. Do not copy Wordgard's decline-only shape. | Current and target owner: `packages/plite`; Plate feature packages own only product policies contributed into it. | Plite Plan owns middleware law; Plate Plan owns any caller migration. | `plite-plan --deep`; `plate-plan --deep` only for affected product commands. | PRODUCT-001 and PRODUCT-002; current registry cycle/single-use law. | Packets 1–2 consume middleware; Packet 7 reruns law and browser proof. | `5/5/5/5/5/5/5/5 = 40`; mounted-host integration closes the remaining point. | `+1`; no API expansion, only full-stack proof. | Reject | Keep | Downstream owners: Plate input-rule runtime, code-block, list, link, future direction feature updates, apps/plite proof rows, documentation, and regression tests. Yjs/codecs observe final transactions only. | Delete nothing from Plite. Delete any `Action`-specific `next` wrapper introduced during Packets 1–2; all continuation must use current registry middleware. | Current proof owner: registry tests and live implementation at `packages/plite/src/core/command-registry.ts:132-293`; target proof adds product-handler around/fallback parity and one-commit assertions. | High if product code invents nested dispatch or calls `next` twice; guarded by existing registry law. Reference scope: reject. Reject Wordgard shape; keep and surpass with Plite. Reverse evidence explicitly rejected because smaller surface is not equivalent behavior.. Verdict scope: keep. Keep current middleware unchanged. |
| PRODUCT-004 | Bound product intent and feature entry points | Wordgard binds a command input for menus and separately derives selected/enabled state (`../wordgard/src/command/command.ts:57-96`, `../wordgard/src/command/menu.ts:10-151`). | `4/4/3/4/3/4/4/2 = 28`. | Plite has typed commands and stable mounted-root dispatch; commands are justified for headless, interception, or preview jobs (`packages/plite/src/interfaces/editor.ts:1700-1820`, `content/docs/plite/concepts/06-commands.mdx:40-115`). | `5/4/5/5/4/4/4/4 = 35`. | Plate already exposes inferred plugin update groups and feature hooks, but some controls still use raw string keys (`packages/basic-nodes/src/lib/BaseBoldPlugin.ts:1-35`, `packages/basic-styles/src/lib/BaseTextAlignPlugin.ts:14-79`, `apps/www/src/registry/ui/mark-toolbar-button.tsx:9-20`). | `4/3/3/4/4/5/2/3 = 28`. | `5/4/5/5/4/5/4/4 = 36`. | superior — current primitives are stronger; Wordgard reveals inconsistent feature entry points. | Use each feature plugin's inferred `update` methods and existing typed React hooks. Add a Plite command only for a proved headless/interception/preview job. Reject a generic Action descriptor, hook, registry, or state algebra. | Each Plate feature package; app UI state/layout remains registry-owned. | Plate Plan; Plite vetoes generic substrate expansion. | `plate-plan --deep` Packet 1. | PRODUCT-001–003 and current update/hook contracts. | Packet 2 adoption; PT-01 shortcuts; Packets 3/4/6 and Packet 7 proof. | `5/5/5/5/5/5/5/4 = 39`. | `+3`. | Adopt | Rearchitect | Marks, headings, styles, list, link, media, history UI, registry controls, apps, docs, fixtures, and tests adopt feature portals only where duplication is removed. | Delete migrated raw string dispatch and duplicate selectors; keep justified transaction groups; prohibit Action machinery. | Inferred input corpus; same `DocumentChange` from toolbar/shortcut/programmatic calls; one undo; read-only/focus browser proof. | High adoption breadth; stop on a second dispatcher, `Action` identity system, or forced command wrapper. |
| PRODUCT-005 | Generic semantic command catalog and host dispatch | Owner: Wordgard commands. A broad catalog covers insertion, deletion, blocks, marks, movement, selection, and stubs for history. Evidence: `../wordgard/src/command/commands.ts:20-150`, `../wordgard/src/command/commands.ts:155-207`, `../wordgard/src/command/commands.ts:213-291`, `../wordgard/src/command/commands.ts:292-419`, `../wordgard/src/command/commands.ts:420-567`. Score reason: broad product usefulness, but core and product policy share one module. | `4/4/3/4/3/4/3/4 = 29`; solid coverage/proof, weaker type, lifecycle, and ownership boundaries. | Owner: `packages/plite` editor commands. Generic commands cover insert/delete/select/move/node/slice/block/mark behavior using canonical transaction/schema/fitter owners. Evidence: `packages/plite/src/core/editor-commands.ts:486-734`. Score reason: complete generic catalog with exact ownership and proof. | `5/5/5/5/5/5/5/5 = 40`; no generic gap is evidenced. | Owner: Plate product packages. Product semantics layer onto generic Plite commands through installed plugins, input rules, transaction groups, and feature APIs. Evidence: `packages/core/src/internal/plugin/compilePlateModel.ts:318-547`, `packages/core/src/lib/plugins/input-rules/internal/InputRulesPlugin.ts:51-279`. Score reason: strong product policy and host fit, slightly distributed ownership/DX. | `4/4/5/5/5/5/4/4 = 36`; excellent technical qualities, one point off semantics/composition/ownership/proof because entry points vary. | `5/5/5/5/5/5/5/5 = 40`; Plite generic catalog plus Plate product handlers already forms the right split. | superior — Superior. Reverse evidence: Wordgard's one-file discoverability is useful, but combining generic editing law and product feature policy is the wrong owner boundary. | Keep generic catalog in Plite; add Plate product descriptors only where policy exceeds the generic catalog; improve discoverability with docs/JSDoc, not owner collapse. | Generic owner: `packages/plite`; product owner per feature update: its Plate package; discovery owner: Plite/Plate docs. | Plite Plan for generic catalog; Plate Plan for product descriptors. | `plite-plan --deep` keep; `plate-plan --deep` Packets 1–2. | PRODUCT-001–004; Plite transaction/schema/fitter laws. | Packets 1–2 and 7. | `5/5/5/5/5/5/5/5 = 40`; retain perfect current combined architecture. | `+0`; packet work improves product API cohesion without changing this already-perfect owner split. | Reject | Keep | Downstream owners: Plate feature packages, input rules, history, React controls, apps/plite command scenarios, docs, fixtures, and tests. Yjs and codecs continue consuming model changes and serialized documents. | Delete no Plite catalog command. Delete only duplicated Plate product mutation entry points named by Packets 1–2 after adoption. | Current source proof: `packages/plite/src/core/editor-commands.ts:486-734`; target proof is gap-led only—each proposed product command must prove it cannot be expressed as the generic command alone and must preserve one atomic apply. | Medium namespace inflation risk if Plate publishes aliases for generic commands; prevent via owner review. Reference scope: reject. Reject Wordgard product/core mixing; retain its catalog as an observable behavior index only.. Verdict scope: keep. Keep Plite catalog; selectively publish Plate product commands. |
| PRODUCT-006 | Text insertion, line break, and Enter intent | Owner: Wordgard commands/helpers. Dedicated commands and structural helpers implement text insertion, line breaks, Enter splitting, and block policy. Evidence: `../wordgard/src/command/commands.ts:20-150`, `../wordgard/src/command/helper.ts:7-350`. Score reason: cohesive observable semantics and tests, but tied to Wordgard tree/selection internals. | `5/4/4/4/3/4/4/4 = 32`; excellent semantics, good composition/types/runtime/proof, weaker reconfiguration. | Owner: `packages/plite` generic command catalog and transaction engine. Insert, split, replace, and selection-aware operations are semantic commands over canonical specs. Evidence: `packages/plite/src/core/editor-commands.ts:486-734`. Score reason: complete generic behavior and proof. | `5/5/5/5/5/5/5/5 = 40`; all dimensions complete. | Owner: Plate block packages and input-rule runtime. Paragraph/heading/code-block/quote/hr product policies and Enter interception contribute through plugins. Evidence: `packages/core/src/lib/plugins/paragraph/BaseParagraphPlugin.ts:5-29`, `packages/code-block/src/lib/withCodeBlock.ts:156-245`, `packages/core/src/lib/plugins/input-rules/internal/InputRulesPlugin.ts:137-279`. Score reason: behavior is strong, with minor API/proof dispersion. | `5/5/4/5/4/5/4/4 = 36`; semantics/composition/runtime/host perfect, product types/lifecycle/DX/proof slightly distributed. | `5/5/5/5/5/5/5/5 = 40`; the combined generic/product stack is already complete. | superior — Superior. Reverse evidence: Wordgard's focused Enter corpus can expose missing observable cases, but its tree algorithms cannot safely replace current Plite laws. | Keep current insertion/Enter owners. Route ordinary Plate block behavior through existing plugin updates; add a command only when a concrete advanced job requires it. | Generic owner: `packages/plite`; product Enter-policy owner per behavior: its paragraph, code-block, list, or input-rule Plate package. | Plite Plan for any generic failing law; Plate Plan for product entry-point migration. | `plite-plan --deep` gap gate; `plate-plan --deep` Packet 2. | PRODUCT-001–005; current schema/transaction/fitter. | Packet 2 may migrate product callers; Packet 7 harvests only uncovered laws. | `5/5/5/5/5/5/5/5 = 40`; preserve current maximum. | `+0`; no architecture change justified. | Adopt | Keep | Downstream owners: Plate block/list packages, shortcuts, input rules, apps/plite browser cases, docs, examples, fixtures, and tests. History/Yjs/codecs receive the same committed change stream. | Delete no insertion/Enter implementation. Delete duplicated UI/raw product entry points only if Packet 2 adopts a product descriptor and parity passes. | Current implementation: `packages/plite/src/core/editor-commands.ts:486-734`; target gap test translates one Wordgard observable without copying its token/tree mechanics, then runs focused package and browser proof for view-dependent Enter cases. | High semantic risk from transplanting foreign tree laws; low risk if Wordgard is used strictly as a black-box oracle. Reference scope: adopt. Behavior oracle only; reject direct algorithm port because reverse evidence shows current canonical spec/fitter ownership.. Verdict scope: keep. Keep and gate gaps with proof. |
| PRODUCT-007 | Deletion, joining, splitting, and correction | Owner: Wordgard commands/helpers. Detailed cases cover selection deletion, joins, splits, correction, and structural boundaries. Evidence: `../wordgard/src/command/commands.ts:155-207`, `../wordgard/src/command/commands.ts:292-419`, `../wordgard/src/command/helper.ts:7-350`, `../wordgard/src/command/helper.ts:353-641`. Score reason: excellent behavior corpus, less explicit lifecycle/host ownership. | `5/4/4/4/3/4/4/5 = 33`; proof and semantics lead, lifecycle remains weaker. | Owner: `packages/plite` generic commands plus transaction/schema/fitter. Deletion, fragment deletion, slice replacement, selection movement, and structural specs share canonical normalization. Evidence: `packages/plite/src/core/editor-commands.ts:486-734`. Score reason: full semantic/runtime/lifecycle/proof law. | `5/5/5/5/5/5/5/5 = 40`; no source-backed architecture gap. | Owner: Plate feature packages for product boundary behavior, especially list, code block, and link middleware. Evidence: `packages/list/src/lib/withList.ts:343-422`, `packages/code-block/src/lib/withCodeBlock.ts:156-245`, `packages/link/src/lib/BaseLinkPlugin.ts:467-502`. Score reason: runtime/host policies are strong; behavior proof and entry-point cohesion vary by package. | `4/4/4/5/4/5/4/4 = 34`; strong runtime/host, good but distributed semantics/types/lifecycle/DX/proof. | `5/5/5/5/5/5/5/5 = 40`; Plite supplies complete generic law and Plate supplies product overrides. | superior — Superior. Reverse evidence: Wordgard's broad tests are valuable candidate laws; direct code transfer would violate current schema/position/selection ownership. | Freeze architecture; run a row-by-row proof gap harvest. Add a local test only where a current owner demonstrably fails the same observable behavior. | Generic owner: `packages/plite`; product-boundary owner per behavior: its affected Plate package; proof owner follows the failing behavior. | Plite Plan for kernel law; Plate Plan for plugin policy. | `plite-plan --deep` or `plate-plan --deep` selected by the proven failing owner; Packet 7 coordinates. | Current Plite command/schema/fitter and Plate plugin handlers. | Packet 7; Packet 2 only if a product command entry point is accepted independently. | `5/5/5/5/5/5/5/5 = 40`; retain current maximum. | `+0`; only proof coverage may increase, not architecture score. | Adopt | Gate | Downstream owners: Plite tests, affected Plate package tests, apps/plite browser proof for view-dependent rows, docs only if public behavior is clarified, fixtures for minimal failing documents. History/Yjs/codecs remain regression consumers. | Delete nothing unless a proven duplicate local handler is superseded by the canonical owner and all focused tests pass. | Translate observable inputs/outcomes from `../wordgard/test/test-commands.ts:130-863`; first reproduce against current Plite/Plate, then add minimal unit/property/browser proof at the actual owner. | Very high risk of false parity because document, position, and selection models differ; require black-box reproduction before any change. Reference scope: adopt. Use Wordgard tests as oracle; reject algorithm port. Reverse evidence must be a reproducible current failure, not source resemblance.. Verdict scope: gate. Keep current owners; gate any gap before work. |
| PRODUCT-008 | Block type, wrap, unwrap, and auto-join | Owner: Wordgard commands/helpers. Commands set block types, wrap/unwrap structures, and auto-join adjacent compatible nodes. Evidence: `../wordgard/src/command/commands.ts:213-419`, `../wordgard/src/command/helper.ts:353-641`. Score reason: broad coherent behavior and proof, but product rules and generic structural mechanics are interleaved. | `5/4/4/4/3/4/3/5 = 32`; excellent semantics/proof, weaker lifecycle and owner split. | Owner: `packages/plite` command/schema/fitter. Generic node, slice, block, and mark commands produce canonical specs; schemas validate target structure. Evidence: `packages/plite/src/core/editor-commands.ts:486-734`, `packages/plite/src/core/schema-compiler.ts:1339-1475`. Score reason: generic mechanics are complete; discoverability is one point short of perfect. | `5/5/5/5/5/5/4/5 = 39`; owner/DX alone is slightly diffuse across catalog/schema/fitter. | Owner: Plate block/list packages. Installed plugins define paragraph/headings/quotes/code blocks/hr and both list representations; product handlers own wrap/unwrap/autojoin policy. Evidence: `packages/core/src/lib/plugins/paragraph/BaseParagraphPlugin.ts:5-29`, `packages/basic-nodes/src/lib/BaseHeadingPlugin.ts:9-137`, `packages/list/src/lib/withList.ts:343-422`. Score reason: types/runtime/host are excellent, product entry and proof are distributed. | `4/4/5/5/4/5/4/4 = 35`; strong technical surface, modest composition/lifecycle/DX gaps. | `5/5/5/5/5/5/5/5 = 40`; combined ownership covers generic mechanics and product policy cleanly. | superior — Superior. Reverse evidence: Wordgard's auto-join cases are useful proof candidates; its coupled implementation is not a better owner model. | Keep current owners. Standardize inferred block/list update methods and feature hooks where that deletes caller duplication; harvest only failing Wordgard laws. | Generic owner: `packages/plite`; product owner per behavior: its basic-nodes, code-block, list, or list-structural package. | Plite Plan for structural kernel; Plate Plan for product APIs. | `plate-plan --deep` Packet 2; `plite-plan --deep` only after a reproduced generic gap. | PRODUCT-001–005; installed schemas; list-model choice. | Packets 2, 5, and 7. | `5/5/5/5/5/5/5/5 = 40`; preserve maximum. | `+0`; API adoption does not change the combined architecture score. | Adopt | Keep | Downstream owners: block/list packages, static and React kits, turn-into/list controls, apps/www demos, apps/plite proofs, docs, examples, fixtures, and tests. Codecs/Yjs/history must retain identical document changes. | Delete migrated raw toolbar `setNodes`/string-type callbacks after Packet 2 parity; keep generic Plite specs and feature transaction groups used for composition. | Current generic proof source: `packages/plite/src/core/editor-commands.ts:486-734`; current product owners: `packages/list/src/lib/withList.ts:343-422`. Target proof compares command, shortcut, toolbar, and input-rule output plus wrap/unwrap/autojoin fixtures. | High semantic risk if flat and structural list behavior is conflated; packet tests must name the list model. Reference scope: adopt. Behavior oracle; reject direct helper port. Reverse evidence is limited to specific black-box laws.. Verdict scope: keep. Keep mechanics; commandize product intent only. |
| PRODUCT-009 | Selection movement and view-dependent navigation | Owner: Wordgard commands/helpers. Selection and motion commands include direction, word, line, and view-sensitive behavior. Evidence: `../wordgard/src/command/commands.ts:420-560`, `../wordgard/src/command/helper.ts:353-641`. Score reason: useful breadth, but model/view ownership and browser proof are under-specified. | `4/3/3/4/3/4/3/2 = 26`; respectable semantics/runtime, weak composition/types/ownership/proof for view behavior. | Owner: `packages/plite` model selection plus `packages/plite-react`/DOM host layer. Core owns semantic selection; mounted hosts own DOM mapping and focus. Evidence: `packages/plite/src/core/editor-commands.ts:486-734`, `content/docs/plite/concepts/16-selection-and-dom.mdx:12-31`, `content/docs/plite/concepts/16-selection-and-dom.mdx:74-113`, `content/docs/plite/concepts/16-selection-and-dom.mdx:147-173`. Score reason: owner split and tests are explicit; final point is broader cross-browser proof. | `5/5/5/5/5/5/4/5 = 39`; ownership/DX is the only point below perfect because the behavior crosses model/DOM packages. | Owner: Plate feature/UI packages only when product policy modifies navigation. No audited universal Plate movement layer should replace Plite host law. Evidence: `packages/code-block/src/lib/withCodeBlock.ts:156-245`. Score reason: a few feature policies exist, but generic semantics/types/proof are intentionally not duplicated. | `2/2/3/3/3/4/2/1 = 20`; low standalone score is correct because Plate is not the generic selection owner. | `5/5/5/5/5/5/4/5 = 39`; combined stack retains the Plite owner split. | superior — Superior. Reverse evidence: Wordgard names useful view scenarios, but its direct port would collapse model/DOM ownership and still lack current browser proof. | Keep Plite selection/DOM ownership. Use Wordgard only to seed a failing-browser matrix row; route product exceptions to the owning Plate plugin. | Model owner: `packages/plite`; mounted DOM/React owner: `packages/plite-react` and Plite DOM adapters; product exception owner: affected Plate package. | Plite Plan; Plate Plan only for a proven product exception. | `plite-plan --deep`; Packet 7 browser harvest. | Current selection and DOM mapping laws; browser reproduction. | Packet 4 may depend on this for writing-direction navigation; Packet 7 closes proof. | `5/5/5/5/5/5/5/5 = 40`; explicit cross-browser ownership/proof closes DX. | `+1`; browser proof and ownership docs, not a new movement API. | Reject | Keep | Downstream owners: Plite React/DOM, apps/plite browser runner, Plate code-block/list/direction exceptions, browser fixtures, docs, and tests. History/Yjs/codecs are unaffected unless a model change is proven. | Delete no selection command. Delete a feature-local workaround only after the canonical owner passes its original regression in Chromium, Firefox, and WebKit. | Current owner evidence: `content/docs/plite/concepts/16-selection-and-dom.mdx:12-31`. Target proof covers left/right, word, line, Home/End, extension, multi-root, and mixed-direction cases in real browsers; unit proof alone is insufficient. | High host variance and false confidence from synthetic DOM; browser matrix is mandatory for changed view behavior. Reference scope: reject. Reject direct port; retain Wordgard test names as candidate oracle. Reverse evidence must reproduce in current browser runtime.. Verdict scope: keep. Keep current model/host split. |
| PRODUCT-010 | Undo and redo intent | Owner: Wordgard command catalog. `undo` and `redo` are exported but return false stubs. Evidence: `../wordgard/src/command/commands.ts:562-567`. Score reason: names exist without working semantics, integration, or proof. | `0/1/2/1/1/1/2/0 = 8`; only minimal composition/type/DX credit for API presence. | Owner: `packages/plite-history`. Real semantic history commands and transaction methods route through the history extension. Evidence: `packages/plite-history/src/history-extension.ts:226-254`, `packages/plite-history/src/history-extension.ts:385-435`. Score reason: complete runtime law and proof; host UI is separate. | `5/5/5/5/5/4/5/5 = 39`; one host-fitness point remains for product UI adoption. | Owner: Plate history integration and registry UI consumers. Plate can expose history controls over installed Plite History, but product action publication is not yet uniform. Score reason: behavior is real and host-fit, while public action ownership/proof are distributed. Evidence: `packages/core/src/internal/plugin/compilePlateModel.ts:318-547`. | `4/4/4/4/4/5/3/4 = 32`; good behavior/host, lower unified types/ownership. | `5/5/5/5/5/4/5/5 = 39`; generic history is complete and only product control adoption remains. | superior — Superior by a mile. Reverse evidence is merely the familiar Wordgard names; stubbed commands provide no behavioral counterweight. | Keep Plite History as sole owner. Normal UI and programmatic calls use `editor.update.history.undo()`/`redo()`; atomic composition alone uses `tx.history.*`. | Current/target behavior owner: `packages/plite-history`; product control owner: Plate registry/history integration. | Plite Plan for history law; Plate Plan for direct control adoption. | `plate-plan --deep` Packet 2; `plite-plan --deep` keep gate. | PRODUCT-001–004; installed Plite History extension. | Packets 2 and 7. | `5/5/5/5/5/5/5/5 = 40`; UI feature-update parity closes host fit. | `+1`; typed UI/programmatic adoption. | Reject | Keep | Downstream owners: history toolbar controls, shortcuts, apps/www examples, apps/plite proof, docs, tests, and Yjs collaboration regression. Codecs remain unchanged. | Delete history UI wrappers that bypass the direct Plite History update after call-site parity; delete no history engine or transaction API. | Current proof target: `packages/plite-history/src/history-extension.ts:226-254`. Packet 2 proves enabled state, undo/redo one-step behavior, mounted focus, and collaboration-safe history routing. | Medium risk of double history boundaries if a wrapper creates an extra update; every control must invoke the existing history update exactly once. |
| PRODUCT-011 | Menu and action item contract | Owner: Wordgard menu layer. Items combine command binding with selected, enabled, hidden/sensitivity, label, description, and update facts. Evidence: `../wordgard/src/command/menu.ts:10-151`. Score reason: cohesive product state contract and solid proof surface, but UI metadata and execution are coupled. | `4/4/4/4/4/4/4/4 = 32`; consistently strong, not best-in-class because owner boundaries are blurred. | Owner: `packages/plite` command descriptors and `packages/plite-react` selector/dispatch hooks. Generic dispatch exists, but product active/enabled/hidden facts intentionally do not. Evidence: `packages/plite-react/src/hooks/use-plite-runtime.tsx:968-975`, `packages/plite-react/src/hooks/use-plite-runtime.tsx:1067-1116`. Score reason: excellent types/runtime, incomplete standalone product contract by design. | `4/3/5/5/4/4/3/1 = 29`; generic facilities are strong; product composition, ownership, and dedicated proof are absent. | Owner: Plate feature packages and registry controls. Controls infer state locally and often bind raw node types or update calls. Evidence: `apps/www/src/registry/ui/mark-toolbar-button.tsx:9-20`, `apps/www/src/registry/ui/list-toolbar-button.tsx:29-210`, `apps/www/src/registry/ui/link-toolbar-button.tsx:13-24`. Score reason: host/UI fit is strong, but state/action logic is duplicated and stringly. | `4/3/3/4/4/5/2/3 = 28`; good semantics/runtime/lifecycle/host, weak unified types/ownership. | `4/3/5/5/4/5/3/3 = 32`; equal total to Wordgard, with stronger technical foundation but the same product cohesion gap. | equivalent — Equivalent total, different strengths. Reverse evidence is decisive: Wordgard's explicit state/action split is better than current scattered controls, while local React/typed dispatch is better than its coupled menu object. | Use feature-owned update methods for mutation and existing typed hooks/selectors for active/enabled/hidden state. Labels, icons, and layout stay app-owned. Reject a generic Action descriptor. | feature update owner: each Plate feature package; dispatch owner: Plite; React binding owner: Plite React; presentation owner: app registry. | Plate Plan. Plite Plan reviews only substrate boundary. | `plate-plan --deep` Packet 1. | PRODUCT-001–004; selector stability; installed-plugin refs. | Packets 1–3, 4, and 6; Packet 7. | `5/5/5/5/5/5/5/4 = 39`; target unifies state/feature update while preserving host boundaries; one proof point remains until full adoption. | `+7`; largest gain comes from composition, ownership, lifecycle, and typed UI state. | Adopt | Rearchitect | Downstream owners: basic nodes/styles, list/link/media/history feature updates, fixed/turn-into/color controls, kits, apps/www, apps/plite, docs, examples, fixtures, tests, accessibility/focus owners. Yjs/codecs are unchanged consumers. | Delete per-control active/enabled calculations and raw string/update dispatch only after each feature portal is adopted. Delete any `Action` fields for labels, icons, parent, rank, or DOM rendering during review. | Pilot proof: type inference for bound input, frozen descriptor, selector update granularity, read-only/hidden/disabled/active states, one command/undo step, React focus/browser proof. Current reverse evidence: `apps/www/src/registry/ui/list-toolbar-button.tsx:29-210`. | High risk of creating a disguised global menu registry; enforce headless package ownership and explicit imports. Reference scope: adopt. Adopt state/update split; reject combined menu metadata/execution object. Reverse evidence: current local controls show concrete duplicated state and string dispatch. |
| PRODUCT-012 | Menu topology, repeated catalogs, and overflow | Wordgard resolves an implicit ranked menu graph with templates and parent links (`../wordgard/src/command/menu.ts:197-486`). | `5/5/4/4/4/4/5/4 = 35`. | Plite deliberately owns no product menu topology (`content/docs/plite/concepts/09-rendering.mdx:6-9`, `content/docs/plite/concepts/09-rendering.mdx:136-170`). | `0/0/0/0/0/0/0/0 = 0`. | apps/www uses visible but duplicated fixed-toolbar and turn-into JSX catalogs (`apps/www/src/registry/ui/fixed-toolbar-buttons.tsx:50-168`, `apps/www/src/registry/ui/turn-into-toolbar-button.tsx:43-205`). | `3/2/3/4/3/5/2/2 = 24`. | `3/2/3/4/3/5/2/2 = 24`. | inferior — product topology is weaker, but Wordgard's implicit registration is the wrong cure. | Colocate repeated app-owned JSX and ordinary component props. Keep groups, separators, and overflow explicit. Reject a toolbar data DSL, IDs, renderer, validator, freezer, package registration, parents, and ranks. | apps/www registry UI. | Plate Plan. | `plate-plan --deep` Packet 3. | Current component and feature inventory. | Packet 7 proof/docs. | `5/5/5/5/4/5/4/3 = 36`. | `+12`. | Adopt | Rearchitect | Fixed toolbar, turn-into, overflow, kits, demos, mobile/desktop layouts, accessibility proof, and docs adopt colocated JSX. | Delete only duplicated arrays/raw rows after parity; reject any generated `Action` tree or implicit registration. | Component order/feature-absence assertions plus keyboard, ARIA, focus, overflow, and desktop/mobile captures. | Stop if colocation changes order or grows into a hidden DSL/plugin marketplace. |
| PRODUCT-013 | Custom-control lifecycle | Owner: Wordgard menu controls. `render` returns imperative DOM/focus and uses manual done/enabled hooks. Evidence: `../wordgard/src/command/menu.ts:154-195`. Score reason: explicit lifecycle but framework-host ownership, state, and accessibility are manual. | `3/3/3/3/3/4/3/3 = 25`; balanced but mediocre due to imperative lifecycle burden. | Owner: `packages/plite-react` for mounted root/dispatch and app framework for components. Plite intentionally exposes rendering ownership boundaries rather than a custom-control DOM contract. Evidence: `content/docs/plite/concepts/09-rendering.mdx:6-9`, `content/docs/plite/concepts/09-rendering.mdx:136-170`. Score reason: good generic host hooks, but no standalone control framework by design. | `3/3/4/4/4/4/3/1 = 26`; sound types/runtime/lifecycle, little direct product proof. | Owner: Plate registry React components and Radix primitives. Controls own React state, focus, accessibility, and feature-specific composition. Evidence: `apps/www/src/registry/ui/font-color-toolbar-button.tsx:74-194`, `apps/www/src/registry/ui/turn-into-toolbar-button.tsx:43-205`. Score reason: excellent semantics/composition/types/runtime/host/DX; lifecycle/proof are slightly short of perfect. | `5/5/5/5/4/5/5/4 = 38`; current React ownership decisively beats imperative DOM. | `5/5/5/5/4/5/5/4 = 38`; Plate supplies the correct product host architecture. | superior — Superior. Reverse evidence: Wordgard's explicit focus return reminds local controls to prove focus, but its DOM contract is categorically worse for Plate React. | Keep custom controls as explicit React components referenced by app JSX. Use framework focus callbacks, ordinary props, and owning plugin updates; define no generic custom-control protocol. | Target owner: apps/www registry/component owner; generic mounted-root dispatch remains `packages/plite-react`. | Plate Plan. | `plate-plan --deep` Packets 3 and 6. | Packet 1 feature updates; Packet 3 layout. | Packets 3, 6, and 7. | `5/5/5/5/5/5/5/4 = 39`; lifecycle improves through framework focus without inventing abstraction; broad proof remains one point. | `+1`; focus/lifecycle cleanup only. | Reject | Keep | Downstream owners: registry custom controls, color/link/media popovers, toolbar layout, apps/www demos, browser accessibility/focus tests. No Plite core, codec, Yjs, or history adoption. | Delete timer/manual focus workarounds per migrated control after browser focus proof; add no generic control object to delete later. | Browser proof for open/close focus, keyboard traversal, disabled/read-only behavior, mounted-root dispatch, and screen-reader names. Current control evidence: `apps/www/src/registry/ui/font-color-toolbar-button.tsx:74-194`. | Medium focus/accessibility regression risk; low model risk. Reference scope: reject. Reject imperative DOM contract; retain its explicit focus concern as a proof requirement. Reverse evidence confirms React is the stronger local host owner.. Verdict scope: keep. Keep React ownership. |
| PRODUCT-014 | Schema declaration, compilation, validation, and reconfiguration | Owner: Wordgard schema bundles. Bundles aggregate nodes, marks, commands, input rules, menu, and theme; schema tests validate assembled behavior. Evidence: `../wordgard/src/schema/bundle.ts:12-54`, `../wordgard/test/schema.ts:8-174`, `../wordgard/test/test-schema.ts:7-76`. Score reason: cohesive feature authoring, but declaration, product UI, and runtime concerns share one owner and reconfiguration is limited. | `4/3/3/4/2/3/4/3 = 26`; good semantics/runtime/DX, weaker composition/types/lifecycle/host/proof. | Owner: `packages/plite` schema definition/compiler/contribution registry. Immutable declarations cover grammars, roots, properties, targets, unknown policy, deltas, compilation, validation, revision reuse, and runtime reconfiguration. Evidence: `packages/plite/src/interfaces/schema.ts:99-484`, `packages/plite/src/core/schema-definition.ts:39-855`, `packages/plite/src/core/schema-contribution-registry.ts:19-193`, `packages/plite/src/core/schema-compiler.ts:22-152`. Score reason: complete generic schema law. | `5/5/5/5/5/5/5/5 = 40`; every dimension is fully owned and proved. | Owner: Plate core compilation plus feature plugins. `compilePlateModel` turns installed plugin declarations and refs into a Plite contribution and publishes the compiled model. Evidence: `packages/core/src/internal/plugin/compilePlateModel.ts:40-78`, `packages/core/src/internal/plugin/compilePlateModel.ts:122-267`, `packages/core/src/internal/plugin/compilePlateModel.ts:318-547`. Score reason: full semantics/types/runtime/host, lifecycle and DX/proof slightly distributed. | `5/5/5/5/4/5/4/4 = 37`; reconfiguration/ownership/proof are one point below Plite core. | `5/5/5/5/5/5/5/5 = 40`; Plite compilation plus Plate product contributions is already the strongest architecture. | superior — Superior. Reverse evidence: Wordgard's feature-bundle ergonomics informs kit discoverability, but coupling UI/menu/theme into schema would regress local ownership. | Keep Plite schema and Plate compilation unchanged. Feature updates remain plugin-owned; toolbar layout and Action identity stay out of schema. | Generic owner: `packages/plite`; product compilation owner: Plate core; declarations owner: each Plate feature package. | Plite Plan for schema law; Plate Plan for compilation boundary. | `plite-plan --deep` keep audit; `plate-plan --deep` Packet 1 integration review. | Current schema definition/compiler/contribution registry and Plate model compiler. | Packets 1, 2, 4, 5, and 7 consume this substrate. | `5/5/5/5/5/5/5/5 = 40`; preserve maximum. | `+0`; no schema redesign justified. | Surpass | Keep | Downstream owners: every Plate feature declaration, static/client kits, apps/plite compiled-model proofs, codecs, Yjs, history, docs, fixtures, and tests. Toolbar UI remains explicitly outside schema adoption. | Delete no compiler/registry. Reject and delete any Packet 1 prototype that stores labels/icons/layout or mutable `Action` state in schema contributions. | Current law evidence: `packages/plite/src/core/schema-definition.ts:39-855`, `packages/core/src/internal/plugin/compilePlateModel.ts:318-547`. Target proof reruns reconfigure, immutable revision, duplicate/collision, installed-ref, codec, and collaboration regressions only where touched. | High blast radius if product UI leaks into schema; low risk when existing ownership is preserved. Reference scope: surpass. Surpass and keep; reject Wordgard bundle as generic schema architecture. Reverse evidence is ergonomic only and belongs in kits/docs.. Verdict scope: keep. Keep current schema/compile owners. |
| PRODUCT-015 | Feature bundles and app kits | Owner: Wordgard schema bundle/features. Feature functions assemble schema declarations, commands, bindings, menu buttons, input rules, and theme in one return value. Evidence: `../wordgard/src/schema/bundle.ts:12-54`, `../wordgard/src/schema/block.ts:12-356`, `../wordgard/src/schema/mark.ts:10-187`. Score reason: cohesive adoption but package product policy, UI placement, and schema/runtime ownership are mixed. | `4/4/3/4/3/4/4/4 = 30`; good semantics/composition/runtime/DX/proof, weaker type/lifecycle boundary. | Owner: Plite extensions/schema contributions, with no app kit policy. Plite supplies typed contribution primitives and leaves rendering/composition to hosts. Evidence: `packages/plite/src/core/schema-contribution-registry.ts:19-193`, `content/docs/plite/concepts/09-rendering.mdx:6-9`. Score reason: strong types/runtime/lifecycle, intentionally limited product semantics/host packaging. | `3/3/5/5/5/3/4/3 = 31`; generic substrate scores high technically but does not pretend to own app kits. | Owner: apps/www registry static/client kits plus owning Plate packages. Explicit kits compose plugins/components/shortcuts/UI, including base and client editor kits. Evidence: `apps/www/src/registry/components/editor/editor-base-kit.tsx:1-45`, `apps/www/src/registry/components/editor/editor-kit.tsx:43-97`, `content/docs/(guides)/feature-kits.mdx:1-51`. Score reason: excellent product composition and host fit; package/app ownership and proof can be clearer. | `5/5/5/5/5/5/4/4 = 38`; only ownership discoverability and complete proof are one point short. | `5/5/5/5/5/5/4/4 = 38`; Plite substrate plus explicit Plate/app kits is stronger than a monolithic bundle. | superior — Superior. Reverse evidence: Wordgard's one-import feature ergonomics is real, but local kits already achieve it without moving toolbar order/theme into packages. | Keep explicit package plugins plus app-owned kits. Kits import plugins and controls deliberately; packages never auto-register toolbar items or action catalogs. | Package behavior owner: respective Plate package; kit/composition owner: apps/www registry; substrate owner: Plite. | Plate Plan. | `plate-plan --deep` Packets 2–3. | PRODUCT-011–014; accepted feature update/layout APIs. | Packets 2–4, 6, and 7. | `5/5/5/5/5/5/5/5 = 40`; precise kit ownership and end-to-end proof close both points. | `+2`; ownership/DX and proof. | Reject | Keep | Downstream owners: static/client registry kits, apps/www demos, apps/plite proof imports from apps/www, docs/install snippets, examples, fixtures, and tests. Plate packages export headless behavior/feature updates; codecs, Yjs, and history adopt only when their plugins are explicitly in a kit. | Delete duplicated kit-local `Action` metadata after Packet 2; delete duplicated toolbar catalogs after Packet 3; keep explicit kit arrays and package boundaries. | Typecheck base/client kit composition, absent-feature behavior, SSR/static versus client ownership, demo rendering, and install snippets. Current ownership evidence: `apps/www/src/registry/components/editor/editor-base-kit.tsx:1-45`. | Medium risk of circular package-to-registry imports; dependency direction must remain app to package. Reference scope: reject. Reject package-owned product menu bundle; keep explicit kit ergonomics. Reverse evidence supports better docs/JSDoc, not coupling. |
| PRODUCT-016 | Paragraph, heading, code block, blockquote, and horizontal rule | Owner: Wordgard block bundle. Schema tags, commands, bindings, menu items, and input behavior are assembled together. Evidence: `../wordgard/src/schema/block.ts:12-143`, `../wordgard/src/schema/block.ts:287-356`. Score reason: broad usable feature set and proof, but UI/config concerns couple to document behavior. | `4/4/4/4/3/4/4/5 = 32`; strong across the board, lifecycle is the main weakness. | Owner: Plite generic schema/commands. Core supplies generic nodes, block/mark commands, and immutable schema targets but not Plate block vocabulary. Evidence: `packages/plite/src/core/editor-commands.ts:486-734`, `packages/plite/src/interfaces/schema.ts:99-484`. Score reason: excellent types/runtime/lifecycle; product semantics/host packaging are intentionally partial. | `3/3/5/5/5/3/4/2 = 30`; high substrate quality, lower standalone product scope and direct proof. | Owner: Plate core paragraph, basic-nodes headings/quote/hr, and code-block packages. Each feature owns typed schema/parser/render/product behavior; app kits compose them. Evidence: `packages/core/src/lib/plugins/paragraph/BaseParagraphPlugin.ts:5-29`, `packages/basic-nodes/src/lib/BaseHeadingPlugin.ts:9-137`, `packages/basic-nodes/src/lib/BaseBlockquotePlugin.ts:9-133`, `packages/basic-nodes/src/lib/BaseHorizontalRulePlugin.ts:4-23`, `packages/code-block/src/lib/BaseCodeBlockPlugin.ts:25-153`. Score reason: complete product behavior and host fit, with one proof point remaining. | `5/5/5/5/5/5/5/4 = 39`; only exhaustive proof is short of perfect. | `5/5/5/5/5/5/5/4 = 39`; Plate product owners on Plite substrate are decisively stronger. | superior — Superior. Reverse evidence: Wordgard's compact bundle and behavior tests remain useful oracles; direct port would discard richer current parser/schema/plugin ownership. | Keep feature implementations. Packet 1 pilots the existing heading plugin update portal and typed hook; Packet 2 adopts only callers with proved duplication. | Generic owner: Plite; paragraph owner: Plate core; heading/quote/hr owner: basic-nodes; code owner: code-block; kit/UI owner: registry. | Plate Plan. | `plate-plan --deep` Packets 1–2. | PRODUCT-001–005, PRODUCT-011, PRODUCT-014. | Packets 1–2 and 7. | `5/5/5/5/5/5/5/5 = 40`; uniform feature-entry proof closes the sole point. | `+1`; proof/API cohesion. | Reject | Keep | Downstream owners: basic block packages, static/client kits, turn-into toolbar, input rules, apps/www demos, apps/plite proofs, HTML/Markdown codecs, docs, fixtures, tests, history, and Yjs regression. | Delete migrated raw `setNodes`/type-string control callbacks and duplicated active selectors after feature-update parity; keep feature transforms and parsers. | Unit/type proof for each feature update target and installed plugin; integration parity among toolbar/shortcut/input/programmatic calls; browser focus/read-only; codec round trips remain identical. Source owners: `packages/basic-nodes/src/lib/BaseHeadingPlugin.ts:9-137`. | Medium public API breadth; low behavior risk if descriptors call current owners exactly once. Reference scope: reject. Reject direct port; keep Wordgard as bundle/test oracle. Reverse evidence is ergonomic only.. Verdict scope: keep. Keep implementations; add semantic entry points. |
| PRODUCT-017 | Strong, emphasis, code, underline, strike, superscript, and subscript marks | Owner: Wordgard mark bundle. Mark schemas, commands, shortcuts, and menu bindings are declared together. Evidence: `../wordgard/src/schema/mark.ts:10-187`. Score reason: compact complete product feature, but schema/action/UI boundaries are coupled. | `4/4/4/4/3/4/4/4 = 31`; consistently strong with lifecycle lag. | Owner: Plite generic mark toggle/spec/schema facilities. Core provides generic mark semantics and typed schema targets, not Plate mark names. Evidence: `packages/plite/src/core/editor-commands.ts:486-734`, `packages/plite/src/interfaces/schema.ts:99-484`. Score reason: excellent generic law with less standalone product scope/proof. | `4/4/5/5/5/4/4/3 = 34`; strong substrate, correctly incomplete as a product bundle. | Owner: `packages/basic-nodes` mark plugins and registry kits/UI. Individual plugins own type/schema/render; a bundle composes them. Evidence: `packages/basic-nodes/src/lib/BaseBoldPlugin.ts:5-35`, `packages/basic-nodes/src/lib/BaseItalicPlugin.ts:5-31`, `packages/basic-nodes/src/lib/BaseBasicMarksPlugin.ts:11-22`. Score reason: complete behavior/types/runtime/host; one proof point remains. | `5/5/5/5/5/5/5/4 = 39`; implementation is nearly ideal. | `5/5/5/5/5/5/5/4 = 39`; combined stack owns all product and generic concerns. | superior — Superior. Reverse evidence: Wordgard's bound mark actions validate the Packet 1 ergonomics gap, not a need to replace mark plugins. | Keep mark plugins; pilot the existing bold update portal and hook in Packet 1, then adopt other marks only where the same direct shape deletes duplication. | Generic owner: Plite; product owner: basic-nodes marks; UI/kit owner: registry. | Plate Plan. | `plate-plan --deep` Packets 1–2. | PRODUCT-001–005, PRODUCT-011, PRODUCT-014. | Packets 1–2, 3, and 7. | `5/5/5/5/5/5/5/5 = 40`; feature update/caller parity adds the missing proof. | `+1`; proof and entry cohesion. | Reject | Keep | Downstream owners: basic-marks static/client kits, mark toolbar, shortcuts, apps/www demos, apps/plite proofs, HTML/Markdown codecs, docs/examples/fixtures/tests, history, and Yjs regression. | Delete `MarkToolbarButton` string `nodeType` and duplicated mark state for each migrated feature update after parity; keep current mark plugins/transforms. | Bold pilot proves inferred command input, active/read-only state, toolbar/shortcut/programmatic identical change, one undo step, SSR/client rendering, browser focus. Current string API evidence: `apps/www/src/registry/ui/mark-toolbar-button.tsx:9-20`. | Low behavior risk; medium API churn if every mark publishes inconsistent feature-update naming. Reference scope: reject. Reject direct port; adopt only bound-action ergonomics. Reverse evidence confirms current mark schema/render ownership is stronger.. Verdict scope: keep. Keep mark implementation. |
| PRODUCT-018 | Input rules and shortcuts | Owner: Wordgard feature bundles. Input rules and bindings ship alongside schema/commands/menu. Evidence: `../wordgard/src/schema/bundle.ts:12-54`, `../wordgard/src/schema/block.ts:287-356`, `../wordgard/src/schema/mark.ts:10-187`. Score reason: product locality is good; generic interception/lifecycle rules are less explicit. | `4/4/4/4/3/4/3/3 = 29`; solid feature ergonomics, weaker lifecycle/ownership/proof. | Owner: Plite command middleware and host key/input dispatch. Generic command law supports safe interception and one semantic update. Evidence: `packages/plite/src/core/command-registry.ts:132-293`. Score reason: technically complete middleware, but product input vocabulary belongs outside core. | `4/4/5/5/5/4/5/4 = 36`; generic law scores high; product semantics and host-specific proof are intentionally external. | Owner: Plate core input-rule runtime and feature plugin presets. Typed descriptors, matching, query, mode, transform, and undo operate through Plite command middleware. Evidence: `packages/core/src/lib/plugins/input-rules/types.ts:14-301`, `packages/core/src/lib/plugins/input-rules/internal/InputRulesPlugin.ts:51-279`. Score reason: mature product/runtime law with strong ownership and proof. | `5/5/4/5/5/5/5/4 = 38`; callback inference/proof leave two points. | `5/5/5/5/5/5/5/5 = 40`; Plite middleware plus Plate typed runtime is complete. | superior — Superior. Reverse evidence: Wordgard's co-located presets aid discoverability, already matched by Plate feature ownership; no architecture transplant is warranted. | Keep input-rule runtime and shortcut owners. Shortcuts route to the owning plugin update or a justified command; matcher/runtime remains unchanged. | Generic middleware owner: Plite; input-rule runtime owner: Plate core; preset owner: each Plate feature package. | Plate Plan, with Plite Plan protecting middleware law. | `plate-plan --deep` Packet 2. | PRODUCT-001–005 and accepted feature feature updates. | Packets 2 and 7. | `5/5/5/5/5/5/5/5 = 40`; retain current maximum. | `+0`; migration is optional deduplication, not an architecture score change. | Surpass | Keep | Downstream owners: all feature input-rule presets, shortcut handlers, apps/www kits/demos, apps/plite proofs, docs/examples/fixtures/tests, history undo, Yjs regression. Codecs are unchanged. | Delete a duplicated rule-local feature transform only after it dispatches the accepted owning update with identical one-commit/undo behavior. Keep matcher/query/runtime and transaction-prefix owners. | Focused tests cover trigger/query/mode, handler fallback, at-most-once continuation, inferred callback types, undo, composition/IME, and browser shortcut/input parity. Current source: `packages/core/src/lib/plugins/input-rules/internal/InputRulesPlugin.ts:137-279`. | Medium risk of nested command dispatch or altered IME/undo boundaries; stop if one feature route creates more than one apply. Reference scope: surpass. Surpass and keep. Reverse evidence supports only local preset discoverability.. Verdict scope: keep. Keep; deduplicate transforms selectively. |
| PRODUCT-019 | List representation and editing behavior | Owner: Wordgard structural list feature. List/list-item schema plus wrap/unwrap/join behavior forms one nested representation. Evidence: `../wordgard/src/schema/list.ts:10-68`, `../wordgard/src/command/commands.ts:292-419`. Score reason: strong coherent model and tests, but it offers only one product representation. | `5/5/4/4/3/4/4/5 = 34`; excellent semantics/composition/proof, weaker type/lifecycle/host. | Owner: Plite generic schema/command mechanics. Plite supports the structural operations required by either product model without choosing a list representation. Evidence: `packages/plite/src/core/editor-commands.ts:486-734`, `packages/plite/src/interfaces/schema.ts:99-484`. Score reason: excellent substrate, modest product semantics/host fit. | `3/4/5/5/5/4/4/4 = 34`; technically strong and properly product-neutral. | Owner: `packages/list` for flat metadata lists and `packages/list-classic` for structural containers/items. Evidence: `packages/list/src/lib/BaseListPlugin.tsx:41-112`, `packages/list/src/lib/BaseListPlugin.tsx:263-315`, `packages/list-classic/src/lib/BaseListPlugin.ts:27-105`, `packages/list-classic/src/lib/BaseListPlugin.ts:107-259`. Score reason: two valid product models with strong runtime/host behavior; temporal naming and model discoverability hurt ownership/DX. | `5/4/4/5/4/5/3/4 = 34`; semantics/runtime/host strong, name/ownership and proof less so. | `5/5/5/5/5/5/4/5 = 39`; combined stack covers both product jobs; only naming/DX is below perfect. | superior — Superior because local users can choose flat or structural documents. Reverse evidence: Wordgard confirms structural lists are first-class, proving `classic` is a misleading name rather than proving flat lists should disappear. | Keep both models. Hard rename `@platejs/list-classic` to `@platejs/list-structural` and the top plugin to `StructuralListPlugin`; ship no aliases or behavior rewrite. Publish model-specific inferred updates, not a generic list Action. | Generic owner: Plite; flat owner: `packages/list`; structural owner after rename: `packages/list-structural`; app model choice: registry kits. | Plate Plan and release-lanes decision for public break. | `plate-plan --deep` Packet 5; `changeset`; release-lanes for publication. | Current list tests/codecs/docs; package rename mechanics. Independent of Packets 1–4 for behavior, but Packet 2 must use final names. | Packet 5; Packet 2 feature update adoption waits on final structural names where overlapping; Packet 7 closes docs. | `5/5/5/5/5/5/5/5 = 40`; honest names and complete model proof close ownership/DX. | `+1`; naming/ownership repair. | Adopt | Rename | Downstream owners: package names/exports, plugins/components/kits, registry imports, apps/www demos/routes, apps/plite proofs, HTML/Markdown codecs, migration-free document fixtures, docs, tests, workspace/release configuration. History/Yjs must prove behavior unchanged. | Delete every `list-classic` package/import/export/component/kit/docs-route name and ambiguous structural `ListPlugin` after all consumers use `list-structural`/`StructuralListPlugin`. Delete no flat or structural behavior and add no alias tail. | Source-first types/tests for both models; structural normalization/input/codec suites; flat transforms unchanged; registry install/docs links; lexical old-name audit; browser list demos. Current model evidence: `content/docs/(plugins)/(elements)/list-classic.mdx:12-32`, `content/docs/(plugins)/(styles)/list.mdx:12-184`. | High public breaking/release churn; low behavior risk only if packet stays mechanical. Stop on any serialized-document or transform diff. Reference scope: adopt. Adopt Wordgard structural model as evidence for a named variant; reject replacing flat lists or copying algorithms. Reverse evidence is the current flat model's distinct arbitrary-block metadata behavior.. Verdict scope: rename. Hard rename structural owner; keep both models. |
| PRODUCT-020 | Alignment and writing direction | Wordgard models alignment and auto/ltr/rtl direction but also scans bidi in the model (`../wordgard/src/schema/block.ts:145-285`). | `5/5/4/4/4/4/4/5 = 35`. | Plite DOM/React owns browser bidi facts; Plite `TextDirection` already means forward/backward traversal (`packages/plite/src/types/types.ts:1-18`, `packages/plite-dom/src/plugin/dom-geometry.ts:68-102`). | `3/3/5/5/5/5/4/4 = 34`. | Plate alignment is strong, but the bounded audit found no persisted writing-direction feature (`packages/basic-styles/src/lib/BaseTextAlignPlugin.ts:14-79`). | `4/4/5/5/4/5/4/4 = 35`. | `4/4/5/5/4/5/4/4 = 35`. | equivalent — browser ownership is better, but Plate lacks the product field. | Add `WritingDirection` with ltr/rtl values and absence meaning auto; publish `BaseWritingDirectionPlugin`/`WritingDirectionPlugin` with inferred `update.set/clear`, HTML `dir`, and explicit UI. | `packages/basic-styles`; registry owns kits/UI. | Plate Plan; Plite only if browser proof reproduces a generic missing fact. | `plate-plan --deep` Packet 4. | Current targeted-property/HTML conventions and C12 browser baseline. | Packet 7; conditional Plite follow-up only on reproduced host failure. | `5/5/5/5/5/5/5/5 = 40`. | `+5`. | Adopt | Bridge | Basic-styles, kits, toolbar, apps/www, apps/plite browser proof, HTML codec, docs, fixtures, history/Yjs regression. | No current feature deletion; reject Plate `TextDirection`, stored auto, Action/mandatory command wrappers, and model bidi scanning. | Value/default omission/types; HTML round trip; mixed-script browser matrix; no document-wide scan. | Stop if the field cannot round-trip or generic host behavior is missing without an accepted owner. |
| PRODUCT-021 | Link schema, safety, and transforms | Owner: Wordgard link feature. Mark-based links include href/title/tooltip-ish data, prompt command, and paste-over-selection behavior. Evidence: `../wordgard/src/schema/link.ts:8-80`, `../wordgard/src/schema/link.ts:99-170`. Score reason: useful concise interaction model, weaker URL safety, typing, and proof. | `4/4/3/4/3/4/3/2 = 27`; solid semantics/composition/runtime, weaker type/lifecycle/ownership/proof. | Owner: Plite generic inline/schema/command mechanics. Core supplies substrate without choosing Plate's link element policy. Evidence: `packages/plite/src/interfaces/schema.ts:99-484`, `packages/plite/src/core/editor-commands.ts:486-734`. Score reason: excellent generic types/runtime/lifecycle, modest standalone product semantics/host/proof. | `3/3/5/5/5/4/4/3 = 32`; correct headless substrate score. | Owner: `packages/link`. Inline element schema, URL validation/sanitization, safe host attributes, parser, transforms, middleware, input rules, and product options share one package. Evidence: `packages/link/src/lib/BaseLinkPlugin.ts:27-223`, `packages/link/src/lib/BaseLinkPlugin.ts:225-502`, `content/docs/(plugins)/(elements)/link.mdx:110-218`. Score reason: complete product mechanism and proof. | `5/5/5/5/5/5/5/5 = 40`; every dimension is current-source complete. | `5/5/5/5/5/5/5/5 = 40`; combined owner split is perfect. | superior — Superior. Reverse evidence: Wordgard's tooltip/paste cases can challenge behavior, but its mark/prompt architecture and weaker safety do not justify replacement. | Keep link schema, safety, transforms, and current feature APIs. Consolidate callers on the owning plugin update/hook; add a command only for a proved interception or preview job. | Generic owner: Plite; product owner: `packages/link`; floating UI/toolbar owner: registry/Plate React surfaces. | Plate Plan. | `plate-plan --deep` Packet 2 and Packet 7 gap harvest. | PRODUCT-001–005, PRODUCT-011, current link package. | Packets 2 and 7. | `5/5/5/5/5/5/5/5 = 40`; preserve maximum. | `+0`; API publication must not alter link architecture. | Reject | Keep | Downstream owners: link package, floating/toolbar UI, kits, apps/www demos, apps/plite proofs, HTML/Markdown codecs, docs/examples/fixtures/tests, history/Yjs regression. | Delete raw link-toolbar mutation/prompt wrappers only after feature-update parity; keep validator, sanitizer, transforms, middleware, and UI. | Current owner evidence: `packages/link/src/lib/BaseLinkPlugin.ts:27-223`, `packages/link/src/lib/BaseLinkPlugin.ts:225-502`. Target proof includes unsafe URL rejection, paste-over-selection, edit/unlink, tooltip/title policy, one undo step, focus, codec round trip. | High security blast radius if a caller bypasses validation; every entry must call current link owner. Reference scope: reject. Reject direct port; retain Wordgard tooltip/paste behavior as oracle. Reverse evidence favors current safety and inline-element ownership. |
| PRODUCT-022 | Link UI, tooltip, shortcut, and paste policy | Owner: Wordgard link/menu feature. A dialog command, tooltip field, keyboard binding, and URI paste-over-selection form one product interaction. Evidence: `../wordgard/src/schema/link.ts:8-80`, `../wordgard/src/schema/link.ts:99-170`. Score reason: strong product cohesion and host awareness, but prompt/menu coupling and proof are modest. | `4/4/3/4/4/5/4/3 = 31`; host fit is excellent; typing and proof trail. | Owner: Plite commands and React mounted-root binding only. Generic dispatch/focus exists, while link UI policy correctly does not. Evidence: `packages/plite-react/src/hooks/use-plite-runtime.tsx:1067-1116`. Score reason: strong generic type/runtime/lifecycle, low standalone product/UI semantics and proof. | `3/3/5/5/5/4/3/2 = 30`; technically strong substrate, intentionally incomplete product layer. | Owner: `packages/link` plus registry floating/toolbar UI. Link transforms, middleware, input presets, floating UI, and toolbar control provide richer local behavior. Evidence: `packages/link/src/lib/BaseLinkPlugin.ts:225-502`, `apps/www/src/registry/ui/link-toolbar-button.tsx:13-24`, `content/docs/(plugins)/(elements)/link.mdx:150-218`. Score reason: semantics/composition/runtime/host/DX are strong; action typing/lifecycle/proof can improve. | `5/5/4/5/4/5/5/4 = 37`; two type/lifecycle points and one proof point remain. | `5/5/5/5/5/5/5/4 = 39`; Plite fills generic type/lifecycle, leaving broad interaction proof. | superior — Superior. Reverse evidence: Wordgard's tooltip and paste-over-selection scenarios can improve proof; its prompt/mark UI is weaker than current floating React UI. | Keep current UI. Make toolbar, shortcut, and paste callers reach the same validated link plugin route and typed hook without a generic Action layer. | Product behavior owner: `packages/link`; dispatch owner: Plite; UI owner: registry/floating link components. | Plate Plan. | `plate-plan --deep` Packet 2. | PRODUCT-004, PRODUCT-011, PRODUCT-021. | Packets 2, 3, and 7. | `5/5/5/5/5/5/5/5 = 40`; unified feature update and full interaction proof close the point. | `+1`; proof/entry cohesion. | Adopt | Move | Downstream owners: link toolbar/floating UI, shortcuts/input/paste handlers, kits, apps/www demos, apps/plite browser proofs, docs/examples/fixtures/tests, history/Yjs/codecs. | Delete direct toolbar/prompt dispatch and duplicate enabled/active state after feature-update parity. Keep current floating UI, sanitizer, transforms, and paste middleware. | Focused unit proof for feature state and URL policy; browser proof for open/edit/unlink/paste, selection retention, tooltip/title display, shortcut, focus restore, read-only, one undo step. Current docs: `content/docs/(plugins)/(elements)/link.mdx:150-218`. | High security risk if any caller bypasses URL validation; medium focus/selection risk. Reference scope: adopt. Use Wordgard as interaction oracle; reject its UI architecture. Reverse evidence preserves current sanitizer and floating UI.. Verdict scope: move. Keep; migrate callers to the owning plugin route. |
| PRODUCT-023 | Image/media schema, insertion, upload, and drop | Owner: Wordgard image feature. Inline image/figure schemas, insertion, drop upload, and upload callbacks are bundled. Evidence: `../wordgard/src/schema/image.ts:9-35`, `../wordgard/src/schema/image.ts:38-173`, `../wordgard/src/schema/image.ts:175-228`. Score reason: cohesive upload behavior and proof, but side effects and inline/block product policy share the model feature. | `4/4/3/4/3/5/4/5 = 32`; excellent host/proof, weaker type/lifecycle and side-effect boundary. | Owner: Plite generic schema/command/transaction mechanics. Core can represent media nodes and serializable placeholder intent but does not own `File`, upload, or product UI. Evidence: `packages/plite/src/interfaces/schema.ts:99-484`, `packages/plite/src/core/editor-commands.ts:486-734`. Score reason: strong generic law, less product/host behavior. | `3/4/5/5/5/4/4/4 = 34`; excellent technical substrate with correct product neutrality. | Owner: `packages/media` for image/media schema and placeholder reservation; apps/www kit/UI for product upload; caption/resizable packages for adjacent behavior. Evidence: `packages/media/src/lib/image/BaseImagePlugin.ts:14-73`, `packages/media/src/lib/media/types.ts:8-31`, `packages/media/src/react/media/useMediaToolbarButton.ts:16-38`, `packages/media/src/react/placeholder/PlaceholderPlugin.tsx:90-180`, `apps/www/src/registry/components/editor/plugins/media-kit.tsx:23-45`. Score reason: product/runtime/host/proof are strong; action typing/lifecycle and owner discoverability can improve. | `5/5/4/5/4/5/4/5 = 37`; types/lifecycle/ownership are one point short. | `5/5/5/5/5/5/5/5 = 40`; combined schema, placeholder, upload, and UI ownership is complete. | superior — Superior, with a deliberate tradeoff: Wordgard supports inline images; current Plate block media plus placeholders has safer upload identity. Reverse evidence does not establish an inline-image requirement. | Keep block media and placeholder pipeline. Packet 2 may expose serializable `insertMediaUrl` and `reserveUpload` intent; host upload controller retains `File`, progress, cancellation, and finalization. | Generic model owner: Plite; schema/placeholder owner: `packages/media`; upload controller/UI owner: app registry; caption/resizing retain their packages. | Plate Plan. | `plate-plan --deep` Packet 2. | PRODUCT-004, PRODUCT-011, PRODUCT-014; current placeholder identity and upload controller. | Packets 2 and 7. | `5/5/5/5/5/5/5/5 = 40`; preserve perfect combined shape. | `+0`; commandization is owner clarification, not an architecture gain. | Adopt | Rearchitect | Downstream owners: media package, placeholder plugin, media kit/UI, upload controller, caption/resizable, apps/www demos, apps/plite proof, HTML/Markdown codecs, docs/examples/fixtures/tests, history/Yjs. | Delete raw URL insertion callbacks after feature-update parity. Delete no placeholder/caption/resize owner. Never put `File`, progress callbacks, promises, or network effects in a pure command descriptor. | Unit: schema props, placeholder ordering/identity, validation, pure URL/reservation intent. Integration/browser: drop/paste/dialog upload, progress/cancel/failure, one undo policy, caption/resize, focus. Current evidence: `packages/media/src/react/media/useMediaToolbarButton.ts:16-38`. | High side-effect and data-loss blast radius if command purity or placeholder identity changes; stop on duplicate/lost upload nodes. Reference scope: adopt. Reject inline-image parity; retain upload/drop behavior oracle. Reverse evidence is current stable placeholder identity and separate product UI.. Verdict scope: rearchitect. Keep placeholder pipeline; commandize pure entry points only. |
| PRODUCT-024 | Image dialog, caption, and resizing | Owner: Wordgard image dialog. Imperative dialog state, captioned figure handling, and a position-mapped resize field form one UI/model feature. Evidence: `../wordgard/src/schema/imagedialog.ts:9-114`, `../wordgard/src/schema/imagedialog.ts:116-280`. Score reason: complete host interaction, but imperative UI and position identity are tied to Wordgard's model. | `4/4/3/4/4/5/4/4 = 32`; strong product/host/lifecycle, modest types and framework portability. | Owner: Plite generic model/React host only. It supplies node/schema/dispatch facts but no image dialog or resize policy. Evidence: `packages/plite-react/src/hooks/use-plite-runtime.tsx:1067-1116`. Score reason: excellent generic type/runtime/lifecycle, limited standalone product semantics/proof. | `3/3/5/5/5/4/4/2 = 31`; correct substrate score. | Owner: `packages/caption`, `packages/resizable`, `packages/media`, and registry media UI. Caption is a targeted feature property; resize is element-relative and committed on finish; React renders figure/caption/toolbar. Evidence: `packages/caption/src/lib/BaseCaptionPlugin.ts:39-106`, `packages/resizable/src/components/Resizable.tsx:22-116`, `apps/www/src/registry/ui/media-image-node.tsx:23-83`. Score reason: complete composition/runtime/host/proof with one lifecycle point. | `5/5/5/5/4/5/5/5 = 39`; reconfiguration/lifecycle is the sole point below perfect. | `5/5/5/5/5/5/5/5 = 40`; combined owners cover model, UI, caption, and resize cleanly. | superior — Superior. Reverse evidence: Wordgard proves dialog/resize behaviors matter; its imperative dialog and mapped position field are worse for current React/element ownership. | Keep React media UI, caption plugin, and resizable component. Consolidate pure media entry points on owning plugin updates/functions without merging owners or adding Action state. | Media schema owner: `packages/media`; caption owner: `packages/caption`; resize owner: `packages/resizable`; UI owner: registry. | Plate Plan. | `plate-plan --deep` Packet 2 keep/adoption review. | PRODUCT-023; current element identity and React control lifecycle. | Packets 2 and 7. | `5/5/5/5/5/5/5/5 = 40`; preserve current combined maximum. | `+0`; no redesign needed. | Reject | Keep | Downstream owners: caption/resizable/media packages, media image node, kits, demos, apps/plite browser proof, codecs, docs/examples/fixtures/tests, history/Yjs. | Delete no current owner. Delete a raw dialog insertion callback only if Packet 2 feature-update parity covers it; never merge caption/resize into media command state. | Browser proof for dialog submit/cancel/focus, caption edit, resize commit/cancel, selection identity, keyboard, responsive rendering, undo, upload coexistence. Current owners: `packages/caption/src/lib/BaseCaptionPlugin.ts:39-106`, `packages/resizable/src/components/Resizable.tsx:22-116`. | Medium UI/focus/selection risk; high risk if position-based foreign identity is copied. Reference scope: reject. Reject imperative dialog/position field; retain observable dialog/caption/resize cases. Reverse evidence favors current element ownership. |
| PRODUCT-025 | Color and background schema/transforms | Owner: Wordgard color feature. Color marks, palette values, commands, UI, and recent/used behavior are bundled. Evidence: `../wordgard/src/schema/color.ts:8-36`, `../wordgard/src/schema/color.ts:37-109`, `../wordgard/src/schema/color.ts:111-324`. Score reason: cohesive product feature, but a fixed palette and UI state leak into schema ownership. | `4/4/3/4/3/4/4/3 = 29`; sound behavior, weaker type/lifecycle/proof and policy boundary. | Owner: Plite generic mark/schema/command law. Core supports typed mark properties and commands but owns no palette or color UI. Evidence: `packages/plite/src/core/editor-commands.ts:486-734`, `packages/plite/src/interfaces/schema.ts:99-484`. Score reason: strong generic mechanics, intentionally modest product/host/proof. | `3/4/5/5/5/4/4/3 = 33`; technically strong substrate. | Owner: `packages/basic-styles` font color/background plugins. Typed mark schema, HTML parsing/rendering, default cleanup, and transforms are documented; app UI supplies palette. Evidence: `packages/basic-styles/src/lib/BaseFontColorPlugin.ts:5-36`, `packages/basic-styles/src/lib/BaseFontBackgroundColorPlugin.ts:5-32`, `content/docs/(plugins)/(styles)/font.mdx:15-40`, `content/docs/(plugins)/(styles)/font.mdx:94-173`. Score reason: product/schema/host ownership is excellent; final proof point remains. | `5/5/5/5/5/5/5/4 = 39`; only exhaustive proof is short. | `5/5/5/5/5/5/5/4 = 39`; combined stack is nearly complete and keeps palette out of schema. | superior — Superior. Reverse evidence: Wordgard's integrated palette is convenient, but package-owned fixed colors would be a product-policy regression. | Keep basic-styles schema/transforms and use inferred font/background `update.set/clear`; palettes and recent state stay app-owned. | Generic owner: Plite; product schema/feature update owner: `packages/basic-styles`; palette/UI owner: registry. | Plate Plan. | `plate-plan --deep` Packets 1 and 6. | PRODUCT-004, PRODUCT-011, current font plugins. | Packet 1 parameterized pilot may use font color; Packet 6 UI cleanup; Packet 7. | `5/5/5/5/5/5/5/5 = 40`; feature update and UI proof close the point. | `+1`; proof/entry cohesion. | Reject | Keep | Downstream owners: basic-styles package, font/background controls, kits, demos, apps/plite proof, HTML codec, docs/examples/fixtures/tests, history/Yjs. Markdown and other codecs explicitly record policy. | Delete stringly font/background mutation calls after feature-update parity; keep schemas/transforms and app palette. | Unit/type proof for set/clear/default cleanup/targets/HTML parse-render; integration proves one undo step and shared toolbar/programmatic result. Current owners: `packages/basic-styles/src/lib/BaseFontColorPlugin.ts:5-36`. | Low model risk; medium public API consistency risk between foreground/background updates. Reference scope: reject. Reject fixed palette in schema owner; keep Wordgard color interactions as UI oracle. Reverse evidence favors current app-owned palette.. Verdict scope: keep. Keep schema/transforms. |
| PRODUCT-026 | Color-picker UI and recent colors | Wordgard has a cohesive imperative ARIA grid with palette/recent/focus behavior (`../wordgard/src/schema/color.ts:37-324`). | `5/4/3/4/4/5/5/4 = 34`. | Plite React supplies generic focus/dispatch only and correctly owns no color store (`packages/plite-react/src/hooks/use-plite-runtime.tsx:1067-1116`). | `2/2/4/4/4/4/3/1 = 24`. | The registry picker scans document text on open and restores focus with a timer (`apps/www/src/registry/ui/font-color-toolbar-button.tsx:33-72`, `apps/www/src/registry/ui/font-color-toolbar-button.tsx:74-194`). | `5/4/4/4/3/5/4/3 = 32`. | `5/4/4/4/3/5/4/3 = 32`. | inferior — accessibility is good, but scan/focus/state ownership is not. | Use basic-styles plugin updates. Normal prop is `colors`; customization adds controlled `recentColors`/`onRecentColorsChange`. The host may memoize document colors and merge them into `colors`. | Basic-styles owns schema/updates; registry/app owns picker, palettes, and recent state. | Plate Plan. | `plate-plan --deep` Packet 6. | Current plugin updates, picker primitives, and framework focus lifecycle. | Packet 7. | `5/5/5/5/4/5/5/4 = 38`. | `+6`. | Adopt | Rearchitect | Both controls, toolbar JSX, kits, demos, browser/a11y/performance proof, and docs adopt ordinary props; codecs/history/Yjs verify unchanged data. | Delete open-time scan, focus timer, raw mutation, and duplicate selectors; reject Action props, package stores, and callback-reader interfaces. | Set/clear and controlled-prop laws; ARIA/focus browser proof; 5,000-block zero-traversal benchmark. | Stop on focus/selection/undo regression, document traversal, cross-editor state leak, or package-level storage. |
| PRODUCT-027 | Command/schema proof corpus and fixtures | Owner: Wordgard tests. Large command fixtures cover editing behavior; schema tests cover bundle assembly. Evidence: `../wordgard/test/test-commands.ts:130-863`, `../wordgard/test/webtest-commands.ts:27-35`, `../wordgard/test/schema.ts:8-174`, `../wordgard/test/test-schema.ts:7-76`. Score reason: strong observable corpus, but fixtures encode foreign model assumptions and lifecycle breadth is limited. | `4/4/4/4/2/3/3/5 = 29`; proof is excellent; lifecycle/host/ownership are weaker. | Owner: Plite package/browser proof owners. Command, extension, schema, and React hooks have focused contract suites. Evidence: `packages/plite/test/extension-methods-contract.ts:314-470`, `packages/plite/test/extension-configuration.test.ts:1677-1819`, `packages/plite-react/test/use-plite-root-command-hooks.test.tsx:189-236`. Score reason: complete proof architecture and ownership. | `5/5/5/5/5/5/5/5 = 40`; every dimension has current proof. | Owner: each Plate package plus apps/www/apps/plite integration/browser proof. Coverage is substantial but distributed by feature; changed product actions/UI need new parity rows. Score reason: runtime/host proof is strong, while cross-entry/generated law and ownership consistency vary. Evidence: `packages/link/src/lib/BaseLinkPlugin.ts:225-502`, `packages/core/src/lib/plugins/input-rules/internal/InputRulesPlugin.ts:137-279`. | `4/4/4/5/4/5/4/4 = 34`; strong runtime/host, good but uneven other dimensions. | `5/5/5/5/5/5/5/5 = 40`; combined Plite proof already reaches maximum. | superior — Superior. Reverse evidence: Wordgard's corpus can expose a missing observable row; its fixture representation cannot be treated as a target API or copied wholesale. | Maintain a provenance ledger of candidate Wordgard laws. First reproduce each against current owners; harvest only uncovered observable behavior using native fixtures/APIs and browser proof for view-dependent cases. | Proof owner follows behavior: Plite package for kernel law, Plate package for product law, apps/plite/browser for host law. | Plite Plan or Plate Plan selected by reproduced owner; Packet 7 coordinates. | `plite-plan --deep` and `plate-plan --deep` Packet 7. | Completed behavior packets and source-backed gap reproduction. | Packet 7 is terminal; all Packets 1–6 depend on its closure gate for final acceptance. | `5/5/5/5/5/5/5/5 = 40`; retain maximum while expanding only evidence-backed rows. | `+0`; more proof may increase confidence, not architecture score. | Adopt | Gate | Downstream owners: Plite/Plate unit tests, generated/property suites, apps/plite browser runner, apps/www demos, codecs, history, Yjs, docs examples, minimal fixtures, benchmarks where claims exist. | Delete temporary foreign-shaped fixtures after translating them to native minimal cases; delete duplicate tests that assert the same law at the wrong owner. | Current proof evidence: `packages/plite/test/extension-methods-contract.ts:314-470`. Target gate records provenance, reproduction, owner, native fixture, expected result, and proof tier for every harvested row. | High false-equivalence and maintenance risk; no row enters local suites without current failure and correct owner. Reference scope: adopt. Harvest only uncovered observable laws; reject copied implementation/fixtures. Reverse evidence requires a current failing test. |
| PRODUCT-028 | Product docs, examples, and adoption truth | Owner: Wordgard repository README and diagnostic demo. The README gives installation plus one browser-editor composition example using schema, history, and menu (`../wordgard/README.md:1-24`); the mapped demo exercises a public declaration/runtime mismatch rather than a normal product example (`../wordgard/demo/demo.ts:1-50`). Score reason: useful concise entry and a real type diagnostic exist, but lifecycle, advanced/host adoption, and runnable proof are thin. | `2/2/1/2/1/2/2/1 = 13`; brief semantics/composition/host/DX guidance earns credit, while the diagnostic type failure, missing lifecycle breadth, and lack of adoption proof cap types/runtime/lifecycle/proof. | Owner: Plite docs and apps/plite proof. Current concepts/walkthroughs document command definitions, execution, schema, selection/DOM, and rendering ownership. Evidence: `content/docs/plite/concepts/06-commands.mdx:41-89`, `content/docs/plite/walkthroughs/05-executing-commands.mdx:87-231`, `content/docs/plite/concepts/19-schema.mdx:6-140`. Score reason: exact current architecture and usage are well documented; final proof completeness is one point short. | `5/5/5/5/5/5/5/4 = 39`; only complete adoption proof remains. | Owner: Plate docs, registry examples, and package JSDoc. Feature kits, list models, links, alignment, fonts, and demos document current product surfaces, though changed packets require coordinated updates. Evidence: `content/docs/(guides)/feature-kits.mdx:1-51`, `content/docs/(plugins)/(elements)/list-classic.mdx:12-32`, `content/docs/(plugins)/(styles)/list.mdx:12-184`. Score reason: semantics/composition/runtime/host/DX are strong; types/lifecycle/proof vary across product docs. | `5/5/4/5/4/5/5/4 = 37`; public docs are strong but adoption completeness is uneven. | `5/5/5/5/5/5/5/4 = 39`; Plite and Plate together document current owner boundaries with one closure-proof point. | superior — Current Plite/Plate docs and runnable examples are substantially broader and more reliable. Reverse evidence: Wordgard’s README is admirably concise and its demo exposes a concrete public type defect, so both remain useful documentation/proof references. | Update current-state reference/docs/examples only for accepted Packets 1–6. Include simple, advanced, extension-author, and host-app usage where the API applies; remove obsolete names/snippets at the same time. | Plite docs own generic command/schema law; Plate package docs/JSDoc own product APIs; registry docs/examples own app composition; apps/plite owns runnable proof. | Plate Plan and Plite Plan for their respective docs; Packet 7 final owner. | `plate-plan --deep` and `plite-plan --deep` Packet 7; `docs-creator` for final prose. | Accepted APIs and final package names from Packets 1–6; verified runnable examples. | Packet 7 is terminal. | `5/5/5/5/5/5/5/5 = 40`; exact adoption/deletion/runnable proof closes the point. | `+1`; proof/adoption truth. | Surpass | Gate | Downstream owners: Plite concepts/walkthroughs, Plate plugin docs/JSDoc, feature-kit docs, registry demos/routes, apps/plite proof app, install snippets, fixtures/tests, codecs/history/Yjs notes only when behavior/public API changes. | Delete stale rejected `Action` snippets, duplicated toolbar catalogs in docs, every old structural-list name after Packet 5, and temporary migration examples. Keep docs for rejected/unchanged current owners accurate. | Link checker, snippet typecheck, registry install resolution, runnable demos, apps/plite browser routes, lexical old-name audit, and exact source citation validation. | High misinformation risk if docs lead implementation or describe rejected packets; Packet 7 runs only after APIs/names freeze. Reference scope: surpass. Current Plite/Plate documentation, examples, and proof surpass the thin donor surface; retain Wordgard’s concise setup example and declaration diagnostic as reference evidence.. Verdict scope: gate. Update accepted packet docs; make no historical/changelog claims. |

#### Bounded absence audits

These audits were rerun against the live checkout on 2026-07-23. They support only the narrow claims stated in PRODUCT-012 and PRODUCT-020.

**PRODUCT-012 — named Plite menu topology**

```bash
rg -n -i "defineMenu|menuTopology|menuItem|toolbarLayout|overflowItem|itemRank|parentMenu" packages/plite/src packages/plite-react/src content/docs/plite
```

Scope: Plite core source, Plite React source, and Plite documentation. Result: 0 matching lines. This does not claim that hosts cannot render menus or that unrelated packages contain no toolbar code; it establishes that the audited Plite public/runtime/docs surface has no named product-menu topology mechanism.

**PRODUCT-020 — Plate product direction**

```bash
rg -n -i "BaseTextDirectionPlugin|TextDirectionPlugin|textDirection|writingDirection|directionPlugin" packages/basic-styles/src apps/www/src/registry "content/docs/(plugins)/(styles)"
```

Scope: the owning Plate styles package, registry source, and style-plugin docs. Result: 0 matching lines. This establishes only the absence of a named persisted Plate direction plugin/action/control in the bounded product surface.

**PRODUCT-020 — existing Plite host bidi behavior**

```bash
rg -n -i "computedDirection|getTextDirection|\brtl\b|\bltr\b" packages/plite-dom/src packages/plite-react/src
```

Scope: Plite DOM and Plite React source. Result: 30 matching lines. The matches include computed/declared CSS-direction geometry (`packages/plite-dom/src/plugin/dom-geometry.ts:68-102`) and keyboard text-direction classification (`packages/plite-react/src/editable/keyboard-input-strategy.ts:84-151`). Therefore Packet 4 starts as a Plate product feature; it does not presume missing generic bidi substrate.

#### TABLE and META master-ledger partitions

Score order is semantics/composition/types/runtime/lifecycle/host-fitness/ownership-DX/proof. Every total is `/40`; gain is target minus current combined.

| ID | Mechanism | Wordgard shape and evidence | Wordgard score | Current Plite shape and evidence | Plite score | Current Plate shape and evidence | Plate score | Current combined score | Comparison | Proposed shape | Target owner | Decision owner | Execution skill | Dependencies | Dependent packets | Target score | Gain | Reference disposition | Local verdict | Adoption | Deletion | Proof | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TABLE-001 | Persisted table/cell/span representation | Current owner: Wordgard `types/schema.ts` table declarations. Evidence: `../wordgard/src/types/schema.ts:134-218`. Shape/lifecycle: Nominal cell/header/row/table tags carry positive-integer `ColSpan` and `RowSpan` marks for the lifetime of a document. Score basis: coherent span invariants, but class/mark identity is not structural JSON | `4/3/3/4/3/3/4/4=28` — coherent span invariants, but class/mark identity is not structural JSON | Current owner: Plite schema/property substrate; no table vocabulary; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite/src/interfaces/schema.ts:92-179`. Shape/lifecycle: Structural JSON properties are compiled generically and remain table-neutral. Score basis: strong generic typing and lifecycle, with table semantics deliberately absent; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — strong generic typing and lifecycle, with table semantics deliberately absent; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate `@platejs/table` plus shared element types. Evidence: `packages/utils/src/lib/plate-types.ts:88-125`; `packages/table/src/lib/BaseTablePlugin.ts:366-423`. Shape/lifecycle: Table cells persist both camel-case span fields and HTML-shaped `attributes.colspan`/`attributes.rowspan` aliases. Score basis: broad consumers and JSON hosting are strong; duplicate persisted spellings weaken semantics, typing, and ownership | `4/3/3/4/4/5/3/4=30` — broad consumers and JSON hosting are strong; duplicate persisted spellings weaken semantics, typing, and ownership | `4/4/5/5/5/5/4/5=37` — Plite supplies safe JSON/property machinery, but Plate still has two persisted span vocabularies. | superior | `TTableCellElement` keeps only `colSpan?: number` and `rowSpan?: number`; HTML codecs alone translate lowercase attributes. Target basis: one structural representation removes split semantics without constraining Plite | `@platejs/table` model and codec internals | Plate Plan | `plate-plan` → `major-task` with `tdd` | Current Plite structural JSON, schema-property, immutable snapshot, path, and atomic transaction contracts. | TABLE-P1; prerequisite for TABLE-P2, TABLE-P3, TABLE-P4, TABLE-P5. | `5/5/5/5/5/5/5/5=40` — one structural representation removes split semantics without constraining Plite | +3 | Adopt | Rearchitect | TABLE-P1 migrates `@platejs/table` schema/codecs/API/selectors, React hooks, registry/static nodes, fixtures, docs, DOCX/HTML callers, and downstream typed JSON; Plite, history, and Yjs retain generic contracts and add canonical-field round trips. | Delete `attributes.colspan`, `attributes.rowspan`, their normalization branches, duplicate fixtures/docs, and compatibility-only tests after every codec and downstream JSON caller adopts canonical fields. | TABLE-P1 codec/type/model laws, grid diagnostic determinism, hot/cold compilation, retained-memory threshold, 19 package specs, and the plugin type contract. | A missed importer silently drops spans; blast radius is persisted documents, DOCX/HTML exchange, history, and Yjs. Stop on any round-trip divergence and roll back TABLE-P1 as one pre-release unit. Reversal evidence: restore a second persisted span spelling only if a versioned corpus proves the canonical camel-case model and boundary codecs cannot preserve an existing document losslessly. |
| TABLE-002 | Table capability compilation and policy boundary | Current owner: Wordgard `tables()` extension bundle. Evidence: `../wordgard/src/table/table.ts:45-95`. Shape/lifecycle: `tables(config)` composes schema, theme, selection, correction, paste/drop, and menu once; configuration is fixed by extension construction. Score basis: compact and locally legible, but generic runtime and product UI ownership are mixed | `4/4/4/4/3/4/4/4=31` — compact and locally legible, but generic runtime and product UI ownership are mixed | Current owner: Plite extension/compiler substrate; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite/src/core/editor-extension.ts:701-905`; `packages/plite/src/core/editor-extension.ts:1240-1321`. Shape/lifecycle: Typed extension compilation, dependency ordering, activation, and reconfiguration are generic. Score basis: reference-quality substrate; no table policy belongs here; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — reference-quality substrate; no table policy belongs here; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate `BaseTablePlugin`. Evidence: `packages/table/src/lib/BaseTablePlugin.ts:2030-2435`; `packages/table/src/lib/BaseTablePlugin.ts:4450-5179`. Shape/lifecycle: One 5,179-line owner compiles model, APIs, selections, commands, correction, codecs, React-facing options, and product policy. Score basis: feature breadth is strong; physical ownership and discoverability are poor | `4/3/4/4/4/5/3/4=31` — feature breadth is strong; physical ownership and discoverability are poor | `5/4/5/5/5/5/4/5=38` — Combined lifecycle is strong, but the giant Plate owner makes change isolation and deletion auditing unnecessarily hard. | superior | Keep one public Plate table plugin while splitting private grid, mutation, selection, codec, and presentation modules with explicit dependency direction. Target basis: preserves one install surface while making each invariant and proof owner obvious | `@platejs/table` private modules behind the existing public plugin | Plate Plan | `plate-plan` → `architecture-cleanup` then `major-task` | Current Plite structural JSON, schema-property, immutable snapshot, path, and atomic transaction contracts. | TABLE-P1; prerequisite for TABLE-P2, TABLE-P3, TABLE-P4, TABLE-P5. | `5/5/5/5/5/5/5/5=40` — preserves one install surface while making each invariant and proof owner obvious | +2 | Surpass | Rearchitect | TABLE-P1 migrates `@platejs/table` schema/codecs/API/selectors, React hooks, registry/static nodes, fixtures, docs, DOCX/HTML callers, and downstream typed JSON; Plite, history, and Yjs retain generic contracts and add canonical-field round trips. | Delete the monolithic internal ownership after all exports remain routed through the public plugin; no new public subpackage or duplicate plugin is retained. | TABLE-P1 codec/type/model laws, grid diagnostic determinism, hot/cold compilation, retained-memory threshold, 19 package specs, and the plugin type contract. | A physical split can introduce cyclic imports or duplicate registration; blast radius is every table install. Stop on compiler-order or API-contract drift and revert the module move without retaining wrappers. Reversal evidence: collapse an extracted owner only if the dependency graph proves that owner cannot remain acyclic without duplicate plugin registration or a second public install surface. |
| TABLE-003 | Canonical compiled grid projection | Current owner: Wordgard `TableMap`. Evidence: `../wordgard/src/table/tablemap.ts:38-168`; `../wordgard/src/table/tablemap.ts:176-233`. Shape/lifecycle: One immutable slot map exposes dimensions, anchor cells, cell ends, rectangle queries, and problems; it is cached by immutable table identity. Score basis: single precise projection is simple and efficient, though single-root numeric positions limit host breadth | `5/5/4/5/4/3/5/4=35` — single precise projection is simple and efficient, though single-root numeric positions limit host breadth | Current owner: Plite snapshots/paths; bounded absence of table projection; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite/src/interfaces/editor.ts:1623-1633`; `packages/plite/src/interfaces/node.ts:25-175`. Shape/lifecycle: Plite supplies immutable snapshots, path queries, and runtime identity but intentionally defines no table grid. Score basis: correct layer boundary; zero table-specific capability; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — correct layer boundary; zero table-specific capability; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate overlapping grid owners. Evidence: `packages/table/src/lib/BaseTablePlugin.ts:118-211`; `packages/table/src/lib/BaseTablePlugin.ts:252-315`; `packages/table/src/lib/BaseTablePlugin.ts:1368-1455`; `packages/table/src/lib/BaseTablePlugin.ts:1599-1631`; `packages/table/src/lib/BaseTablePlugin.ts:1685-1876`. Shape/lifecycle: `_cellIndices`, adjacent lookup, general grid, ID/index lookup, and merge-range grid compute overlapping geometry with different caches. Score basis: broad behavior exists, but duplicated truth lowers correctness, lifecycle, and DX | `3/2/3/3/2/4/2/4=23` — broad behavior exists, but duplicated truth lowers correctness, lifecycle, and DX | `3/2/3/3/2/4/2/4=23` — Plate’s duplicate projections dominate the combined result; generic Plite snapshots cannot reconcile contradictory table geometry. | inferior | Private `compileTableGrid(state, tablePath): TableGrid` returns immutable slots, anchors, reverse ID/path indexes, dimensions, and problems for every table consumer. Target basis: one projection removes five competing geometry truths and enables deterministic proof | `@platejs/table/internal/grid` | Plate Plan | `plate-plan` → `major-task` with `tdd` | Current Plite structural JSON, schema-property, immutable snapshot, path, and atomic transaction contracts. | TABLE-P1; prerequisite for TABLE-P2, TABLE-P3, TABLE-P4, TABLE-P5. | `5/5/5/5/5/5/5/5=40` — one projection removes five competing geometry truths and enables deterministic proof | +17 | Adopt | Rearchitect | TABLE-P1 migrates `@platejs/table` schema/codecs/API/selectors, React hooks, registry/static nodes, fixtures, docs, DOCX/HTML callers, and downstream typed JSON; Plite, history, and Yjs retain generic contracts and add canonical-field round trips. | Delete `_cellIndices`, `computeCellIndices`, `indexTableCells`, `adjacentTableCellLookup`, `getTableGrid`, `getTableMergeGridByRange`, and `findCellByIndexes` only after the last consumer migrates. | TABLE-P1 codec/type/model laws, grid diagnostic determinism, hot/cold compilation, retained-memory threshold, 19 package specs, and the plugin type contract. | A wrong occupied-slot or reverse index corrupts every command and selection; blast radius is all tables. Stop on any differential mismatch against old readers and revert before deleting old owners. Reversal evidence: abandon the canonical grid only if generated valid and malformed span cases cannot match every existing reader while meeting the hot-read threshold. |
| TABLE-004 | Grid cache ownership and invalidation | Current owner: Wordgard `WeakMap<Plot, MapData>`. Evidence: `../wordgard/src/table/tablemap.ts:38-43`; `../wordgard/src/table/tablemap.ts:163-168`. Shape/lifecycle: Immutable table identity keys one GC-governed weak cache; `TableMap.get` reuses `MapData` and wraps it with the current table start. Score basis: simple GC-governed identity lifetime, but no hit/miss metrics, retained-memory measurement, or performance threshold | `5/5/4/5/4/3/5/3=34` — simple GC-governed identity lifetime, but no hit/miss metrics, retained-memory measurement, or performance threshold | Current owner: Plite immutable snapshot lifecycle; no table cache; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite/src/interfaces/editor.ts:1623-1633`. Shape/lifecycle: Snapshot publication makes identity-scoped derivation viable without defining table policy. Score basis: good substrate but not a complete table cache; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — good substrate but not a complete table cache; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate mixed weak and mutable option caches. Evidence: `packages/table/src/lib/BaseTablePlugin.ts:169-211`; `packages/table/src/lib/BaseTablePlugin.ts:252-315`; `packages/table/src/lib/BaseTablePlugin.ts:4492-4547`. Shape/lifecycle: Weak maps coexist with `_cellIndices` option state and transaction-path invalidation. Score basis: overlapping cache lifecycles create stale-data and retention risk | `2/2/3/3/2/4/2/3=21` — overlapping cache lifecycles create stale-data and retention risk | `3/3/4/4/3/4/3/4=28` — Plite immutability helps, but Plate’s multiple invalidation protocols remain the effective architecture. | inferior | The grid compiler owns one `WeakMap<TableElement, TableGridData>`; metrics never retain keys, and reconfiguration replaces the compiler/cache instance. Target basis: one GC-governed weak-cache law closes stale reads and makes hot/cold performance measurable without inventing strong retention | `@platejs/table/internal/grid` | Plate Plan | `plate-plan` → `performance` with `tdd` | Current Plite structural JSON, schema-property, immutable snapshot, path, and atomic transaction contracts. | TABLE-P1; prerequisite for TABLE-P2, TABLE-P3, TABLE-P4, TABLE-P5. | `5/5/5/5/5/5/5/5=40` — one GC-governed weak-cache law closes stale reads and makes hot/cold performance measurable without inventing strong retention | +12 | Adopt | Cut | TABLE-P1 migrates `@platejs/table` schema/codecs/API/selectors, React hooks, registry/static nodes, fixtures, docs, DOCX/HTML callers, and downstream typed JSON; Plite, history, and Yjs retain generic contracts and add canonical-field round trips. | Delete mutable option cache state, path-based invalidation, and all secondary WeakMaps after hot/cold parity and retained-memory gates pass. | TABLE-P1 codec/type/model laws, grid diagnostic determinism, hot/cold compilation, retained-memory threshold, 19 package specs, and the plugin type contract. | Strong-key metrics or debug indexes could defeat weak lifetime; blast radius is long-lived editors. Stop on retained-memory growth or stale-hit evidence and run uncached while fixing the owner. Reversal evidence: restore explicit invalidation or a non-weak owner only if reconfiguration and retained-memory proof shows the GC-governed cache cannot provide fresh reads within the memory threshold. |
| TABLE-005 | Typed table invariant diagnosis | Current owner: Wordgard `Problem` records emitted by `computeMap`. Evidence: `../wordgard/src/table/tablemap.ts:22-35`; `../wordgard/src/table/tablemap.ts:176-224`. Shape/lifecycle: Grid compilation reports collision, missing slots, and overlong row spans before correction. Score basis: reusable typed diagnosis is strong; vocabulary and proof are narrow | `5/5/4/5/4/3/5/4=35` — reusable typed diagnosis is strong; vocabulary and proof are narrow | Current owner: Plite generic validation/correction boundary; no table diagnoses; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite/src/interfaces/editor.ts:1005-1019`. Shape/lifecycle: Plite can validate and publish diagnostics generically but owns no table problem type. Score basis: correctly absent table policy; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — correctly absent table policy; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate repair-first algorithm. Evidence: `packages/table/src/lib/BaseTablePlugin.ts:1457-1563`; `packages/table/src/lib/BaseTablePlugin.ts:4928-5011`. Shape/lifecycle: Repair clones/replaces table structure and separately repairs indices without exposing one reusable diagnostic list. Score basis: behavior breadth exists, but diagnosis, correction, and query truth are coupled | `3/2/3/3/2/4/2/4=23` — behavior breadth exists, but diagnosis, correction, and query truth are coupled | `3/2/3/3/2/4/2/4=23` — The combined system can repair many cases but cannot share deterministic diagnosed truth across commands, tests, and tooling. | inferior | `compileTableGrid` returns `readonly TableProblem[]`; correction consumes but never mutates that list, and commands fail on specified fatal problems. Target basis: separating diagnosis from mutation improves semantics, testability, and failure isolation | `@platejs/table/internal/grid` | Plate Plan | `plate-plan` → `major-task` with `tdd` | Current Plite structural JSON, schema-property, immutable snapshot, path, and atomic transaction contracts. | TABLE-P1; prerequisite for TABLE-P2, TABLE-P3, TABLE-P4, TABLE-P5. | `5/5/5/5/5/5/5/5=40` — separating diagnosis from mutation improves semantics, testability, and failure isolation | +17 | Adopt | Rearchitect | TABLE-P1 migrates `@platejs/table` schema/codecs/API/selectors, React hooks, registry/static nodes, fixtures, docs, DOCX/HTML callers, and downstream typed JSON; Plite, history, and Yjs retain generic contracts and add canonical-field round trips. | Delete repair-local anonymous problem inference and tests coupled only to clone internals once typed diagnostics cover each invalid shape. | TABLE-P1 codec/type/model laws, grid diagnostic determinism, hot/cold compilation, retained-memory threshold, 19 package specs, and the plugin type contract. | Misclassifying a repairable table as fatal blocks editing; misclassifying fatal as repairable corrupts content. Blast radius is malformed tables; stop on diagnostic nondeterminism and revert the compiler/repair pair together. Reversal evidence: return diagnosis to command-local guards only if generated malformed grids cannot produce a deterministic typed problem set that separates fatal from repairable states. |
| TABLE-006 | Deterministic table correction | Current owner: Wordgard focused problem-to-change correction. Evidence: `../wordgard/src/table/correct.ts:10-68`. Shape/lifecycle: A transaction extender converts typed problems into cell/span insert/remove changes. Score basis: focused and readable, but only 5 direct cases and donor transaction semantics | `5/4/4/4/3/3/4/4=31` — focused and readable, but only 5 direct cases and donor transaction semantics | Current owner: Plite atomic transaction and correction substrate; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite/src/interfaces/editor.ts:1679-1695`; `packages/plite/src/core/public-state.ts:4115-4168`. Shape/lifecycle: Pure transaction specs and canonical finalization can publish correction atomically. Score basis: strong generic lifecycle and typing; table algorithm absent; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — strong generic lifecycle and typing; table algorithm absent; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate clone-and-replace repair. Evidence: `packages/table/src/lib/BaseTablePlugin.ts:1457-1563`; `packages/table/src/lib/BaseTablePlugin.ts:4928-5011`. Shape/lifecycle: Normalization repairs grid, sizes, and indices through whole-table replacement and additional passes. Score basis: broad behavior, but locality and one-owner semantics are weaker | `4/3/4/3/3/4/3/4=28` — broad behavior, but locality and one-owner semantics are weaker | `4/4/5/4/4/4/4/5=34` — Generic Plite atomicity lifts Plate above Wordgard overall, while Plate’s correction algorithm remains less local and less diagnosable. | different tradeoff | `planTableCorrection(grid): TableMutationPlan` emits focused operations from immutable problems; a single Plite transaction publishes or rejects the entire repair. Target basis: combines donor locality with stronger atomicity, IDs, roots, history, and Yjs | `@platejs/table/internal/mutation` | Plate Plan | `major-task` with `tdd` | TABLE-P1 canonical fields, `TableGrid`, and typed problems. | TABLE-P2; prerequisite for TABLE-P3, TABLE-P4, TABLE-P5. | `5/5/5/5/5/5/5/5=40` — combines donor locality with stronger atomicity, IDs, roots, history, and Yjs | +6 | Surpass | Rearchitect | TABLE-P2 migrates all Base/React table commands and correction, registry actions, fixtures, history undo/redo, and Yjs replay to one mutation planner. | Delete whole-table repair replacement, separate size/index repair passes, and tests that only protect those internal passes after semantic parity. | TABLE-P2 focused command cases, generated valid/invalid span grids, correction convergence, inverse laws, command-sequence fuzz, history/Yjs replay, and sparse/dense operation thresholds. | A non-convergent repair loop can repeatedly rewrite customer data; blast radius is any malformed or imported table. Stop on non-idempotence, cycle, or partial publication and restore the previous normalizer before release. Reversal evidence: prefer donor-style local repair again only if the atomic plan fails convergence or exceeds the sparse and dense operation thresholds on the same generated corpus. |
| TABLE-007 | Structural cell-selection value and codec | Current owner: Wordgard nominal `CellSelection` class and bespoke JSON. Evidence: `../wordgard/src/table/cellselection.ts:100-141`; `../wordgard/src/table/cellselection.ts:222-240`. Shape/lifecycle: Anchor/head numeric positions reconstruct a class selection and extension-owned commands/decorations. Score basis: coherent donor API, but nominal identity and single-root positions weaken persistence/host fit | `4/3/3/4/3/3/4/4=28` — coherent donor API, but nominal identity and single-root positions weaken persistence/host fit | Current owner: Plite structural selection protocol; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite/src/interfaces/selection.ts:27-41`; `packages/plite/src/core/selection-protocol.ts:196-230`; `packages/plite/src/core/selection-protocol.ts:508-542`. Shape/lifecycle: Selection kinds are structural JSON with registered codec, validation, mapping, and root-aware lifecycle. Score basis: reference-quality generic selection substrate; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — reference-quality generic selection substrate; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate `table-cell` selection kind. Evidence: `packages/table/src/lib/BaseTablePlugin.ts:1989-2028`; `packages/table/src/lib/BaseTablePlugin.ts:5012-5048`. Shape/lifecycle: A structural `Range` extension carries `kind` and cell ranges and delegates codec/mapping to Plite. Score basis: correct product specialization; proof is slightly narrower than generic substrate | `5/5/5/5/5/5/5/4=39` — correct product specialization; proof is slightly narrower than generic substrate | `5/5/5/5/5/5/5/5=40` — Plite plus Plate already strictly surpass the donor class and reach the target contract. | superior | Keep the public structural/versioned `table-cell` selection unchanged; only its derived cell set moves to `TableSelectionView`. Target basis: no public redesign is justified; the packet protects the existing strong contract | Plite selection protocol plus `@platejs/table` selection kind | Plite Plan proof audit → Plate Plan adoption | `plite-plan` proof audit then `task` | TABLE-P1 grid and TABLE-P2 stable mutation mapping. | TABLE-P3; prerequisite for TABLE-P4 and TABLE-P5. | `5/5/5/5/5/5/5/5=40` — no public redesign is justified; the packet protects the existing strong contract | +0 | Reject | Keep | TABLE-P3 preserves Plite’s generic selection protocol and migrates Plate selection construction, selectors, navigation, React decoration, registry selected state, history, and Yjs codecs to `TableSelectionView`. | No public selection deletion; remove only duplicate derived geometry after TABLE-P3 consumers adopt `TableSelectionView`. | TABLE-P3 selection codec/map/drop/nearest laws, 30 donor cell-selection cases as oracles, direction and edge cases, pointer/keyboard/IME proof, Chromium plus browser matrix, and selected-render locality. | Accidentally changing persisted selection shape breaks history/Yjs. Blast radius is all saved or collaborative table selections; stop on codec-version drift and keep the current selection spec. Reversal evidence: reconsider the donor selection value only if the current versioned `table-cell` codec cannot map, drop, and restore a selection through history and Yjs without information loss. |
| TABLE-008 | Anchor/head bounding rectangle geometry | Current owner: Wordgard one-pass union of endpoint cell rectangles. Evidence: `../wordgard/src/table/tablemap.ts:89-109`; `../wordgard/src/table/cellselection.ts:165-183`. Shape/lifecycle: `rectBetween` takes the bounding union of anchor/head cell rectangles once, and `cellsInRect` returns anchors starting inside; there is no repeated closure over every intersecting span. Score basis: simple, exact for donor semantics, and directly covered; it is narrower than Plate’s iterative merge-range behavior | `5/5/4/5/4/3/5/5=36` — simple, exact for donor semantics, and directly covered; it is narrower than Plate’s iterative merge-range behavior | Current owner: Plite bounded absence of table geometry; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite/src/interfaces/selection.ts:27-41`. Shape/lifecycle: Plite intentionally owns selection protocol, not table rectangle policy. Score basis: correct layer boundary; zero table-specific behavior; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — correct layer boundary; zero table-specific behavior; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate iterative merge-range traversal. Evidence: `packages/table/src/lib/BaseTablePlugin.ts:1685-1876`. Shape/lifecycle: Plate repeatedly expands a table merge grid around spans, separate from other grid projections. Score basis: broader product behavior but duplicated geometry and cache ownership | `4/3/4/4/3/5/3/4=30` — broader product behavior but duplicated geometry and cache ownership | `4/3/4/4/3/5/3/4=30` — Wordgard is cleaner but narrower; Plate is broader but structurally duplicated, so this is a different tradeoff rather than donor behavioral superiority. | different tradeoff | `TableGrid.rectBetween(anchorId, headId)` explicitly defines endpoint-bound union; any product-required span closure is a separate named operation on the same grid, never an implicit duplicate loop. Target basis: one owner preserves semantic clarity while supporting Plate’s broader behavior | `@platejs/table/internal/grid` and selection policy | Plate Plan | `plate-plan` → `major-task` with `tdd` | TABLE-P1 grid and TABLE-P2 stable mutation mapping. | TABLE-P3; prerequisite for TABLE-P4 and TABLE-P5. | `5/5/5/5/5/5/5/5=40` — one owner preserves semantic clarity while supporting Plate’s broader behavior | +10 | Adopt | Rearchitect | TABLE-P3 preserves Plite’s generic selection protocol and migrates Plate selection construction, selectors, navigation, React decoration, registry selected state, history, and Yjs codecs to `TableSelectionView`. | Delete `getTableMergeGridByRange` and all independent rectangle expansion after endpoint union and optional closure callers are explicitly mapped. | TABLE-P3 selection codec/map/drop/nearest laws, 30 donor cell-selection cases as oracles, direction and edge cases, pointer/keyboard/IME proof, Chromium plus browser matrix, and selected-render locality. | Conflating endpoint union with recursive closure changes selected cells around merged spans; blast radius is merge/delete/copy commands. Stop on donor/current differential ambiguity and require an explicit product-policy decision before deletion. Reversal evidence: reject endpoint-bound union only if merged-span command oracles prove recursive closure is the sole valid selection meaning rather than a separately named product operation. |
| TABLE-009 | Selection normalization at cell/table boundaries | Current owner: Wordgard transaction-extender normalization. Evidence: `../wordgard/src/table/cellselection.ts:186-219`; `../wordgard/test/test-cellselection.ts:122-149`. Shape/lifecycle: Cross-cell ranges become cell selections, direction is preserved, cell-edge cursors remain valid, and adjacent tables are escaped. Score basis: strong bounded behavior and 30 total cell-selection cases | `5/4/4/4/3/4/4/5=33` — strong bounded behavior and 30 total cell-selection cases | Current owner: Plite generic validation/mapping; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite/src/core/selection-protocol.ts:508-542`; `packages/plite/src/core/selection-protocol.ts:677-716`. Shape/lifecycle: Root-aware selection protocol maps and validates without table policy. Score basis: strong substrate; table normalization correctly absent; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — strong substrate; table normalization correctly absent; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate table clamp/derive policy. Evidence: `packages/table/src/lib/BaseTablePlugin.ts:1916-2028`; `packages/table/src/lib/BaseTablePlugin.ts:4492-4547`. Shape/lifecycle: Commands clamp invalid selections and derive structural table-cell selections. Score basis: correct breadth, but geometry still reads overlapping owners | `4/4/4/4/4/5/4/4=33` — correct breadth, but geometry still reads overlapping owners | `5/5/5/5/5/5/5/5=40` — Generic Plite guarantees plus Plate product policy already surpass Wordgard; only grid adoption remains. | superior | Keep current normalization semantics and route every geometry read through one `TableSelectionView` derived from `TableGrid`. Target basis: preserves behavior while removing duplicate geometry | `@platejs/table` selection policy on Plite selection | Plate Plan | `task` with `tdd` | TABLE-P1 grid and TABLE-P2 stable mutation mapping. | TABLE-P3; prerequisite for TABLE-P4 and TABLE-P5. | `5/5/5/5/5/5/5/5=40` — preserves behavior while removing duplicate geometry | +0 | Adopt | Keep | TABLE-P3 preserves Plite’s generic selection protocol and migrates Plate selection construction, selectors, navigation, React decoration, registry selected state, history, and Yjs codecs to `TableSelectionView`. | Delete grid-independent boundary lookups and stale selected-cell caches; keep public normalization behavior and regression cases. | TABLE-P3 selection codec/map/drop/nearest laws, 30 donor cell-selection cases as oracles, direction and edge cases, pointer/keyboard/IME proof, Chromium plus browser matrix, and selected-render locality. | Boundary regression can strand a native selection between cells; blast radius is keyboard/pointer table editing. Stop on direction, edge-cursor, or adjacent-table mismatch and retain current policy until the grid result agrees. Reversal evidence: replace the current normalization policy only if direction, edge-cursor, and adjacent-table cases remain wrong when driven by a correct `TableSelectionView`. |
| TABLE-010 | Selection mapping through document changes | Current owner: Wordgard bespoke map-and-reconstruct. Evidence: `../wordgard/src/table/cellselection.ts:131-141`. Shape/lifecycle: Numeric endpoints map through `ChangeSet`, adjust around table/row boundaries, and reconstruct or fall back near the head. Score basis: sound donor behavior, but coupled to nominal selection and numeric positions | `4/4/4/4/3/3/4/4=30` — sound donor behavior, but coupled to nominal selection and numeric positions | Current owner: Plite association-aware selection mapper; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite/src/core/selection-protocol.ts:508-542`; `packages/plite/src/core/selection-protocol.ts:677-716`. Shape/lifecycle: The generic protocol maps outer and nested ranges with root/schema validation. Score basis: reference-quality generic mapping; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — reference-quality generic mapping; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate registered table selection spec. Evidence: `packages/table/src/lib/BaseTablePlugin.ts:5012-5048`. Shape/lifecycle: Plate delegates outer and per-cell ranges to Plite’s mapper. Score basis: correct delegation and structural persistence | `5/5/5/5/5/5/5/4=39` — correct delegation and structural persistence | `5/5/5/5/5/5/5/5=40` — The current combined mapping strictly surpasses Wordgard and should remain unchanged. | superior | Keep Plite mapping and Plate’s registered selection spec; TABLE-P3 changes only the derived selection view. Target basis: avoids a pointless bespoke table mapper | Plite selection protocol; Plate table spec | Plite Plan proof audit → Plate Plan adoption | `plite-plan` proof audit then `task` | TABLE-P1 grid and TABLE-P2 stable mutation mapping. | TABLE-P3; prerequisite for TABLE-P4 and TABLE-P5. | `5/5/5/5/5/5/5/5=40` — avoids a pointless bespoke table mapper | +0 | Surpass | Keep | TABLE-P3 preserves Plite’s generic selection protocol and migrates Plate selection construction, selectors, navigation, React decoration, registry selected state, history, and Yjs codecs to `TableSelectionView`. | No mapping API deletion; delete only any caller that remaps table cell geometry outside the registered spec. | TABLE-P3 selection codec/map/drop/nearest laws, 30 donor cell-selection cases as oracles, direction and edge cases, pointer/keyboard/IME proof, Chromium plus browser matrix, and selected-render locality. | A duplicate mapper can disagree on association or root identity; blast radius is history/Yjs selection restoration. Stop if TABLE-P3 introduces any second mapping path. Reversal evidence: introduce table-specific mapping only if the registered selection spec reproducibly loses association or root identity under history or Yjs and a focused mapper fixes that case. |
| TABLE-011 | Keyboard/pointer navigation and DOM projection | Current owner: Wordgard one table-selection extension. Evidence: `../wordgard/src/table/cellselection.ts:9-99`; `../wordgard/src/table/cellselection.ts:122-157`; `../wordgard/src/table/cellselection.ts:222-240`. Shape/lifecycle: One imperative extension owns decoration, DOM range, arrows, row-side movement, triple-click, focus, and dispatch. Score basis: locally coherent but mixes model, DOM, commands, and presentation in one owner | `4/3/3/4/3/4/3/3=27` — locally coherent but mixes model, DOM, commands, and presentation in one owner | Current owner: Plite DOM selection substrate; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite-dom/src/plugin/dom-editor.ts:775-843`; `packages/plite-dom/src/plugin/dom-editor.ts:846-930`. Shape/lifecycle: Generic root-aware DOM/model mapping and dispatch remain product-neutral. Score basis: strong host substrate and correct boundary; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — strong host substrate and correct boundary; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate headless plus React table behavior. Evidence: `packages/table/src/lib/BaseTablePlugin.ts:1916-2028`; `packages/table/src/react/TablePlugin.tsx:1-233`. Shape/lifecycle: Headless selection semantics and React event/render adaptation are split and broader than Wordgard. Score basis: genuine host/product breadth; grid reads need consolidation | `5/4/4/5/4/5/4/4=35` — genuine host/product breadth; grid reads need consolidation | `5/5/5/5/5/5/5/5=40` — The combined host architecture is superior; donor ownership is rejected while current behavior is retained. | superior | Keep generic DOM dispatch in Plite and product navigation in Plate; inject `TableSelectionView` into headless/React handlers. Target basis: preserves the correct layer split and removes only geometry duplication | Plite DOM substrate plus `@platejs/table/react` | Plate Plan | `task` with `testing` | TABLE-P1 grid and TABLE-P2 stable mutation mapping. | TABLE-P3; prerequisite for TABLE-P4 and TABLE-P5. | `5/5/5/5/5/5/5/5=40` — preserves the correct layer split and removes only geometry duplication | +0 | Reject | Keep | TABLE-P3 preserves Plite’s generic selection protocol and migrates Plate selection construction, selectors, navigation, React decoration, registry selected state, history, and Yjs codecs to `TableSelectionView`. | Delete only table navigation branches that recompute grid/span geometry; retain React/native adapters and public commands. | TABLE-P3 selection codec/map/drop/nearest laws, 30 donor cell-selection cases as oracles, direction and edge cases, pointer/keyboard/IME proof, Chromium plus browser matrix, and selected-render locality. | Moving DOM policy into Plite would pollute substrate; blast radius is every editor host. Stop if any table key/pointer rule enters generic Plite APIs. Reversal evidence: promote a navigation rule into Plite only if at least two independent non-Plate hosts require identical behavior and generic DOM dispatch cannot express it by injection. |
| TABLE-012 | Selected-cell query/cache API | Current owner: Wordgard derives from one `TableMap`. Evidence: `../wordgard/src/table/tablecommands.ts:59-63`. Shape/lifecycle: Selected rectangle and cells are read on demand from one map with no secondary result cache. Score basis: simple derivation, though donor queries are narrow | `4/4/4/4/3/3/4/4=30` — simple derivation, though donor queries are narrow | Current owner: Plite immutable read snapshots only; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite/src/interfaces/node.ts:25-175`; `packages/plite/src/interfaces/editor.ts:1623-1633`. Shape/lifecycle: Generic reads support snapshot-scoped derivation without table selectors. Score basis: good substrate, incomplete table feature by design; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — good substrate, incomplete table feature by design; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate overlapping selection caches/selectors. Evidence: `packages/table/src/lib/BaseTablePlugin.ts:425-613`; `packages/table/src/lib/BaseTablePlugin.ts:1110-1304`. Shape/lifecycle: `selectionQueryCache`, selected IDs/elements/tables, grids, borders, and bounding boxes cache overlapping results. Score basis: wide API surface but weak single-owner lifecycle | `3/2/3/3/2/5/2/4=24` — wide API surface but weak single-owner lifecycle | `3/3/4/4/3/5/3/4=29` — Current breadth is useful, yet duplicate result caches make combined architecture inferior to a single derived view. | inferior | One immutable `TableSelectionView` stores the grid, selected anchors, rectangle, IDs, entries, and bounds for a state/selection identity. Target basis: one snapshot-scoped derivation replaces overlapping cache invalidation | `@platejs/table/internal/selection` | Plate Plan | `plate-plan` → `major-task` | TABLE-P1 grid and TABLE-P2 stable mutation mapping. | TABLE-P3; prerequisite for TABLE-P4 and TABLE-P5. | `5/5/5/5/5/5/5/5=40` — one snapshot-scoped derivation replaces overlapping cache invalidation | +11 | Adopt | Cut | TABLE-P3 preserves Plite’s generic selection protocol and migrates Plate selection construction, selectors, navigation, React decoration, registry selected state, history, and Yjs codecs to `TableSelectionView`. | Delete `selectionQueryCache` and selected ID/element/table/grid variants after public APIs project from `TableSelectionView`. | TABLE-P3 selection codec/map/drop/nearest laws, 30 donor cell-selection cases as oracles, direction and edge cases, pointer/keyboard/IME proof, Chromium plus browser matrix, and selected-render locality. | Stale selected entries drive wrong UI and destructive commands; blast radius is selected-table actions. Stop on snapshot/selection identity mismatch and fall back to uncached derivation. Reversal evidence: retain an overlapping selected-cell cache only if snapshot-keyed `TableSelectionView` derivation misses the selected-render locality threshold without any stale-read failure. |
| TABLE-013 | Private table command context and guards | Current owner: Wordgard `tableContext`. Evidence: `../wordgard/src/table/tablecommands.ts:9-63`. Shape/lifecycle: Each command resolves the table, selected cells, map, tags, and rectangle preconditions. Score basis: concise typed context, but numeric/single-root and public helper leakage | `4/4/4/4/3/3/4/4=30` — concise typed context, but numeric/single-root and public helper leakage | Current owner: Plite query and transaction substrate; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite/src/interfaces/node.ts:25-175`; `packages/plite/src/interfaces/editor.ts:1679-1695`. Shape/lifecycle: Generic state reads and specs can host a private product context. Score basis: strong substrate; no table guard policy; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — strong substrate; no table guard policy; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate scattered table lookups. Evidence: `packages/table/src/lib/BaseTablePlugin.ts:425-613`; `packages/table/src/lib/BaseTablePlugin.ts:1599-1631`; `packages/table/src/lib/BaseTablePlugin.ts:2091-2201`. Shape/lifecycle: Entries, grid, selection, IDs, and command preconditions are assembled by separate helpers/API surfaces. Score basis: broad but harder to reason about atomically | `3/2/4/4/3/5/2/4=27` — broad but harder to reason about atomically | `4/3/5/5/4/5/4/5=35` — Plite makes Plate safe overall, but scattered table preconditions remain weaker than one compiled context. | superior | Private `TableContext = { table, grid, selection }` is built once per command from one immutable state; it never becomes public without a proven consumer. Target basis: central guards remove repeated queries while keeping product policy in Plate | `@platejs/table/internal/context` | Plate Plan | `plate-plan` → `architecture-cleanup` | Current Plite structural JSON, schema-property, immutable snapshot, path, and atomic transaction contracts. | TABLE-P1; prerequisite for TABLE-P2, TABLE-P3, TABLE-P4, TABLE-P5. | `5/5/5/5/5/5/5/5=40` — central guards remove repeated queries while keeping product policy in Plate | +5 | Adopt | Rearchitect | TABLE-P1 migrates `@platejs/table` schema/codecs/API/selectors, React hooks, registry/static nodes, fixtures, docs, DOCX/HTML callers, and downstream typed JSON; Plite, history, and Yjs retain generic contracts and add canonical-field round trips. | Delete redundant command-local entry/grid/selection resolution and any public helper with no external consumer after call-site inventory. | TABLE-P1 codec/type/model laws, grid diagnostic determinism, hot/cold compilation, retained-memory threshold, 19 package specs, and the plugin type contract. | A context captured across mutations becomes stale; blast radius is all table commands. Stop if context survives beyond one state/spec build and enforce snapshot identity. Reversal evidence: return to independent command queries only if snapshot-identity tests prove a private `TableContext` cannot be confined to one immutable command build. |
| TABLE-014 | Row insertion across spans | Current owner: Wordgard table command. Evidence: `../wordgard/src/table/tablecommands.ts:150-180`. Shape/lifecycle: extends crossing row spans and inserts missing cells; lifecycle is one returned pure command spec. Score basis: clear bounded algorithm with deterministic model cases | `5/4/4/4/3/3/4/4=31` — clear bounded algorithm with deterministic model cases | Current owner: Plite transaction/query substrate; no table mutation policy; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite/src/interfaces/editor.ts:1679-1695`; `packages/plite/src/core/public-state.ts:4115-4168`. Shape/lifecycle: Atomic specs and canonical finalization host product operations without defining rows, columns, headers, merge, split, or creation. Score basis: strong generic lifecycle and types; table capability correctly absent; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — strong generic lifecycle and types; table capability correctly absent; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate `BaseTablePlugin` commands/API. Evidence: `packages/table/src/lib/BaseTablePlugin.ts:2091-2201`; `packages/table/src/lib/BaseTablePlugin.ts:4450-4660`. Shape/lifecycle: Richer public options, sizing, selections, React callers, and package tests implement the product behavior over overlapping geometry helpers. Score basis: broader and better adopted than Wordgard, but planner ownership is fragmented | `5/4/4/5/4/5/4/5=36` — broader and better adopted than Wordgard, but planner ownership is fragmented | `5/5/5/5/5/5/5/5=40` — Plate product breadth plus Plite atomic publication already surpasses the donor; the remaining work is single-owner geometry/planning. | superior | retain Plate API and rebase row insertion on `TableGrid` plus one mutation plan. Target basis: one grid/context and one atomic planner preserve breadth while removing duplicate geometry | `@platejs/table/internal/mutation` behind existing Plate commands | Plate Plan | `major-task` with `tdd` | TABLE-P1 canonical fields, `TableGrid`, and typed problems. | TABLE-P2; prerequisite for TABLE-P3, TABLE-P4, TABLE-P5. | `5/5/5/5/5/5/5/5=40` — one grid/context and one atomic planner preserve breadth while removing duplicate geometry | +0 | Adopt | Keep | TABLE-P2 migrates all Base/React table commands and correction, registry actions, fixtures, history undo/redo, and Yjs replay to one mutation planner. | Delete row-insert span arithmetic outside the planner. | TABLE-P2 focused command cases, generated valid/invalid span grids, correction convergence, inverse laws, command-sequence fuzz, history/Yjs replay, and sparse/dense operation thresholds. | An off-by-one span update creates non-rectangular tables; blast radius is inserted rows. Stop on any differential command, invariant, selection, history, or Yjs failure; publish nothing and restore the prior command path before release. Reversal evidence: keep the prior row-insert geometry reader only if generated span cases expose a planner mismatch that cannot be fixed without changing the public insertion result. |
| TABLE-015 | Row deletion with span preservation | Current owner: Wordgard table command. Evidence: `../wordgard/src/table/tablecommands.ts:183-233`. Shape/lifecycle: relocates cells entering deleted rows, shrinks spans, and removes a fully selected table; lifecycle is one returned pure command spec. Score basis: clear bounded algorithm with deterministic model cases | `5/4/4/4/3/3/4/5=32` — clear bounded algorithm with deterministic model cases | Current owner: Plite transaction/query substrate; no table mutation policy; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite/src/interfaces/editor.ts:1679-1695`; `packages/plite/src/core/public-state.ts:4115-4168`. Shape/lifecycle: Atomic specs and canonical finalization host product operations without defining rows, columns, headers, merge, split, or creation. Score basis: strong generic lifecycle and types; table capability correctly absent; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — strong generic lifecycle and types; table capability correctly absent; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate `BaseTablePlugin` commands/API. Evidence: `packages/table/src/lib/BaseTablePlugin.ts:1457-1563`; `packages/table/src/lib/BaseTablePlugin.ts:4928-5011`; `packages/table/src/lib/BaseTablePlugin.remove.spec.tsx:416-512`; `packages/table/src/lib/BaseTablePlugin.merge.spec.tsx:211-398`. Shape/lifecycle: Richer public options, sizing, selections, React callers, and package tests implement the product behavior over overlapping geometry helpers. Score basis: broader and better adopted than Wordgard, but planner ownership is fragmented | `5/4/4/5/4/5/4/5=36` — broader and better adopted than Wordgard, but planner ownership is fragmented | `5/5/5/5/5/5/5/5=40` — Plate product breadth plus Plite atomic publication already surpasses the donor; the remaining work is single-owner geometry/planning. | superior | retain Plate semantics and route relocation/span edits through one planner. Target basis: one grid/context and one atomic planner preserve breadth while removing duplicate geometry | `@platejs/table/internal/mutation` behind existing Plate commands | Plate Plan | `major-task` with `tdd` | TABLE-P1 canonical fields, `TableGrid`, and typed problems. | TABLE-P2; prerequisite for TABLE-P3, TABLE-P4, TABLE-P5. | `5/5/5/5/5/5/5/5=40` — one grid/context and one atomic planner preserve breadth while removing duplicate geometry | +0 | Adopt | Keep | TABLE-P2 migrates all Base/React table commands and correction, registry actions, fixtures, history undo/redo, and Yjs replay to one mutation planner. | Delete duplicate row-delete occupancy scans and span repair branches. | TABLE-P2 focused command cases, generated valid/invalid span grids, correction convergence, inverse laws, command-sequence fuzz, history/Yjs replay, and sparse/dense operation thresholds. | Incorrect relocation loses cell content; blast radius is deleted rows and spanning neighbors. Stop on any differential command, invariant, selection, history, or Yjs failure; publish nothing and restore the prior command path before release. Reversal evidence: keep the prior row-deletion relocation path only if inverse and history/Yjs laws show the planner cannot preserve spanning-neighbor content and identity. |
| TABLE-016 | Column insertion across spans | Current owner: Wordgard table command. Evidence: `../wordgard/src/table/tablecommands.ts:68-91`. Shape/lifecycle: extends a crossing colspan or inserts a cell in each row; lifecycle is one returned pure command spec. Score basis: clear bounded algorithm with deterministic model cases | `5/4/4/4/3/3/4/4=31` — clear bounded algorithm with deterministic model cases | Current owner: Plite transaction/query substrate; no table mutation policy; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite/src/interfaces/editor.ts:1679-1695`; `packages/plite/src/core/public-state.ts:4115-4168`. Shape/lifecycle: Atomic specs and canonical finalization host product operations without defining rows, columns, headers, merge, split, or creation. Score basis: strong generic lifecycle and types; table capability correctly absent; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — strong generic lifecycle and types; table capability correctly absent; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate `BaseTablePlugin` commands/API. Evidence: `packages/table/src/lib/BaseTablePlugin.ts:2091-2201`; `packages/table/src/lib/BaseTablePlugin.ts:4450-4660`. Shape/lifecycle: Richer public options, sizing, selections, React callers, and package tests implement the product behavior over overlapping geometry helpers. Score basis: broader and better adopted than Wordgard, but planner ownership is fragmented | `5/4/4/5/4/5/4/5=36` — broader and better adopted than Wordgard, but planner ownership is fragmented | `5/5/5/5/5/5/5/5=40` — Plate product breadth plus Plite atomic publication already surpasses the donor; the remaining work is single-owner geometry/planning. | superior | retain Plate API/sizing and plan geometry plus width-vector changes together. Target basis: one grid/context and one atomic planner preserve breadth while removing duplicate geometry | `@platejs/table/internal/mutation` behind existing Plate commands | Plate Plan | `major-task` with `tdd` | TABLE-P1 canonical fields, `TableGrid`, and typed problems. | TABLE-P2; prerequisite for TABLE-P3, TABLE-P4, TABLE-P5. | `5/5/5/5/5/5/5/5=40` — one grid/context and one atomic planner preserve breadth while removing duplicate geometry | +0 | Surpass | Keep | TABLE-P2 migrates all Base/React table commands and correction, registry actions, fixtures, history undo/redo, and Yjs replay to one mutation planner. | Delete column-insert geometry and size updates outside the planner. | TABLE-P2 focused command cases, generated valid/invalid span grids, correction convergence, inverse laws, command-sequence fuzz, history/Yjs replay, and sparse/dense operation thresholds. | Geometry/size divergence renders columns against wrong data; blast radius is the whole table. Stop on any differential command, invariant, selection, history, or Yjs failure; publish nothing and restore the prior command path before release. Reversal evidence: split width updates from column insertion only if atomic geometry-plus-width plans fail sizing round trips or sparse-operation thresholds while the prior path passes. |
| TABLE-017 | Column deletion with span preservation | Current owner: Wordgard table command. Evidence: `../wordgard/src/table/tablecommands.ts:95-147`. Shape/lifecycle: shrinks crossing spans, deletes covered anchors, and contains a live `userevent` typo at line 103; lifecycle is one returned pure command spec. Score basis: strong cases but the live metadata typo lowers types/runtime trust | `5/4/3/3/3/3/3/5=29` — strong cases but the live metadata typo lowers types/runtime trust | Current owner: Plite transaction/query substrate; no table mutation policy; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite/src/interfaces/editor.ts:1679-1695`; `packages/plite/src/core/public-state.ts:4115-4168`. Shape/lifecycle: Atomic specs and canonical finalization host product operations without defining rows, columns, headers, merge, split, or creation. Score basis: strong generic lifecycle and types; table capability correctly absent; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — strong generic lifecycle and types; table capability correctly absent; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate `BaseTablePlugin` commands/API. Evidence: `packages/table/src/lib/BaseTablePlugin.ts:2091-2201`; `packages/table/src/lib/BaseTablePlugin.ts:4450-4660`. Shape/lifecycle: Richer public options, sizing, selections, React callers, and package tests implement the product behavior over overlapping geometry helpers. Score basis: broader and better adopted than Wordgard, but planner ownership is fragmented | `5/4/4/5/4/5/4/5=36` — broader and better adopted than Wordgard, but planner ownership is fragmented | `5/5/5/5/5/5/5/5=40` — Plate product breadth plus Plite atomic publication already surpasses the donor; the remaining work is single-owner geometry/planning. | superior | use donor cases as oracles but implement a typed atomic Plate deletion plan. Target basis: one grid/context and one atomic planner preserve breadth while removing duplicate geometry | `@platejs/table/internal/mutation` behind existing Plate commands | Plate Plan | `major-task` with `tdd` | TABLE-P1 canonical fields, `TableGrid`, and typed problems. | TABLE-P2; prerequisite for TABLE-P3, TABLE-P4, TABLE-P5. | `5/5/5/5/5/5/5/5=40` — one grid/context and one atomic planner preserve breadth while removing duplicate geometry | +0 | Adopt | Keep | TABLE-P2 migrates all Base/React table commands and correction, registry actions, fixtures, history undo/redo, and Yjs replay to one mutation planner. | Delete duplicate column-delete scans and the misspelled dead metadata path. | TABLE-P2 focused command cases, generated valid/invalid span grids, correction convergence, inverse laws, command-sequence fuzz, history/Yjs replay, and sparse/dense operation thresholds. | A wrong covered-anchor set deletes content; blast radius is selected and spanning columns. Stop on any differential command, invariant, selection, history, or Yjs failure; publish nothing and restore the prior command path before release. Reversal evidence: retain the prior column-deletion owner only if generated covered-anchor cases prove the typed plan cannot preserve content, identities, and the inverse law together. |
| TABLE-018 | Header-cell toggle | Current owner: Wordgard table command. Evidence: `../wordgard/src/table/tablecommands.ts:25-57`. Shape/lifecycle: toggles selected tags and chooses headers for a mixed selection; lifecycle is one returned pure command spec. Score basis: clear bounded algorithm with deterministic model cases | `4/4/4/4/3/4/4/4=31` — clear bounded algorithm with deterministic model cases | Current owner: Plite transaction/query substrate; no table mutation policy; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite/src/interfaces/editor.ts:1679-1695`; `packages/plite/src/core/public-state.ts:4115-4168`. Shape/lifecycle: Atomic specs and canonical finalization host product operations without defining rows, columns, headers, merge, split, or creation. Score basis: strong generic lifecycle and types; table capability correctly absent; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — strong generic lifecycle and types; table capability correctly absent; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate `BaseTablePlugin` commands/API. Evidence: `packages/table/src/lib/BaseTablePlugin.ts:2091-2201`; `packages/table/src/lib/BaseTablePlugin.ts:4450-4660`. Shape/lifecycle: Richer public options, sizing, selections, React callers, and package tests implement the product behavior over overlapping geometry helpers. Score basis: broader and better adopted than Wordgard, but planner ownership is fragmented | `5/5/5/5/5/5/5/4=39` — broader and better adopted than Wordgard, but planner ownership is fragmented | `5/5/5/5/5/5/5/4=39` — Plate product breadth plus Plite atomic publication already surpasses the donor; the remaining work is single-owner geometry/planning. | superior | keep Plate product command and source its selection/schema keys from compiled context. Target basis: one grid/context and one atomic planner preserve breadth while removing duplicate geometry | `@platejs/table/internal/mutation` behind existing Plate commands | Plate Plan | `major-task` with `tdd` | TABLE-P1 canonical fields, `TableGrid`, and typed problems. | TABLE-P2; prerequisite for TABLE-P3, TABLE-P4, TABLE-P5. | `5/5/5/5/5/5/5/5=40` — one grid/context and one atomic planner preserve breadth while removing duplicate geometry | +1 | Reject | Keep | TABLE-P2 migrates all Base/React table commands and correction, registry actions, fixtures, history undo/redo, and Yjs replay to one mutation planner. | Delete only duplicate context/selection reads; no public command deletion. | TABLE-P2 focused command cases, generated valid/invalid span grids, correction convergence, inverse laws, command-sequence fuzz, history/Yjs replay, and sparse/dense operation thresholds. | Wrong compiled key changes cell semantics; blast radius is selected cells. Stop on any differential command, invariant, selection, history, or Yjs failure; publish nothing and restore the prior command path before release. Reversal evidence: adopt a broader donor toggle path only if compiled schema keys cannot express every current header-row, header-column, and selected-cell mode without semantic drift. |
| TABLE-019 | Rectangular cell merge | Current owner: Wordgard table command. Evidence: `../wordgard/src/table/tablecommands.ts:235-262`. Shape/lifecycle: requires multiple cells and a non-overlapping rectangle, moves content, sets spans, and deletes other anchors; lifecycle is one returned pure command spec. Score basis: clear bounded algorithm with deterministic model cases | `5/4/4/4/3/3/4/5=32` — clear bounded algorithm with deterministic model cases | Current owner: Plite transaction/query substrate; no table mutation policy; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite/src/interfaces/editor.ts:1679-1695`; `packages/plite/src/core/public-state.ts:4115-4168`. Shape/lifecycle: Atomic specs and canonical finalization host product operations without defining rows, columns, headers, merge, split, or creation. Score basis: strong generic lifecycle and types; table capability correctly absent; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — strong generic lifecycle and types; table capability correctly absent; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate `BaseTablePlugin` commands/API. Evidence: `packages/table/src/lib/BaseTablePlugin.ts:2091-2201`; `packages/table/src/lib/BaseTablePlugin.ts:4450-4660`. Shape/lifecycle: Richer public options, sizing, selections, React callers, and package tests implement the product behavior over overlapping geometry helpers. Score basis: broader and better adopted than Wordgard, but planner ownership is fragmented | `5/4/4/5/4/5/4/5=36` — broader and better adopted than Wordgard, but planner ownership is fragmented | `5/5/5/5/5/5/5/5=40` — Plate product breadth plus Plite atomic publication already surpasses the donor; the remaining work is single-owner geometry/planning. | superior | keep Plate product rules and validate/apply merge through one planner with schema-fit content. Target basis: one grid/context and one atomic planner preserve breadth while removing duplicate geometry | `@platejs/table/internal/mutation` behind existing Plate commands | Plate Plan | `major-task` with `tdd` | TABLE-P1 canonical fields, `TableGrid`, and typed problems. | TABLE-P2; prerequisite for TABLE-P3, TABLE-P4, TABLE-P5. | `5/5/5/5/5/5/5/5=40` — one grid/context and one atomic planner preserve breadth while removing duplicate geometry | +0 | Adopt | Keep | TABLE-P2 migrates all Base/React table commands and correction, registry actions, fixtures, history undo/redo, and Yjs replay to one mutation planner. | Delete independent merge occupancy matrices and span arithmetic. | TABLE-P2 focused command cases, generated valid/invalid span grids, correction convergence, inverse laws, command-sequence fuzz, history/Yjs replay, and sparse/dense operation thresholds. | A false rectangle or failed content fit loses content; blast radius is merged cells. Stop on any differential command, invariant, selection, history, or Yjs failure; publish nothing and restore the prior command path before release. Reversal evidence: retain the old merge geometry owner only if rectangle and schema-fit property tests prove the canonical planner cannot merge losslessly and produce an inverse-capable result. |
| TABLE-020 | Merged-cell split | Current owner: Wordgard table command. Evidence: `../wordgard/src/table/tablecommands.ts:264-289`. Shape/lifecycle: clears spans, creates default cells, preserves content in the first cell, and restores a cell selection; lifecycle is one returned pure command spec. Score basis: clear bounded algorithm with deterministic model cases | `5/4/4/4/3/3/4/5=32` — clear bounded algorithm with deterministic model cases | Current owner: Plite transaction/query substrate; no table mutation policy; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite/src/interfaces/editor.ts:1679-1695`; `packages/plite/src/core/public-state.ts:4115-4168`. Shape/lifecycle: Atomic specs and canonical finalization host product operations without defining rows, columns, headers, merge, split, or creation. Score basis: strong generic lifecycle and types; table capability correctly absent; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — strong generic lifecycle and types; table capability correctly absent; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate `BaseTablePlugin` commands/API. Evidence: `packages/table/src/lib/BaseTablePlugin.ts:2091-2201`; `packages/table/src/lib/BaseTablePlugin.ts:4450-4660`. Shape/lifecycle: Richer public options, sizing, selections, React callers, and package tests implement the product behavior over overlapping geometry helpers. Score basis: broader and better adopted than Wordgard, but planner ownership is fragmented | `5/4/4/5/4/5/4/5=36` — broader and better adopted than Wordgard, but planner ownership is fragmented | `5/5/5/5/5/5/5/5=40` — Plate product breadth plus Plite atomic publication already surpasses the donor; the remaining work is single-owner geometry/planning. | superior | keep Plate sizing/header semantics and implement split as the inverse-capable planner operation. Target basis: one grid/context and one atomic planner preserve breadth while removing duplicate geometry | `@platejs/table/internal/mutation` behind existing Plate commands | Plate Plan | `major-task` with `tdd` | TABLE-P1 canonical fields, `TableGrid`, and typed problems. | TABLE-P2; prerequisite for TABLE-P3, TABLE-P4, TABLE-P5. | `5/5/5/5/5/5/5/5=40` — one grid/context and one atomic planner preserve breadth while removing duplicate geometry | +0 | Adopt | Keep | TABLE-P2 migrates all Base/React table commands and correction, registry actions, fixtures, history undo/redo, and Yjs replay to one mutation planner. | Delete independent split insertion loops and span arithmetic. | TABLE-P2 focused command cases, generated valid/invalid span grids, correction convergence, inverse laws, command-sequence fuzz, history/Yjs replay, and sparse/dense operation thresholds. | Wrong insertion order or identity breaks selection/history; blast radius is the split rectangle. Stop on any differential command, invariant, selection, history, or Yjs failure; publish nothing and restore the prior command path before release. Reversal evidence: retain the old split path only if merge/split inverse laws prove the planner cannot restore cell order, stable identities, sizing, and header state together. |
| TABLE-021 | Invariant-safe table creation | Current owner: Wordgard table menu/factory. Evidence: `../wordgard/src/table/menu.ts:95-110`. Shape/lifecycle: dimension picker creates default cells/rows from schema defaults; lifecycle is one returned pure command spec. Score basis: clear bounded algorithm with deterministic model cases | `4/4/4/4/3/4/4/3=30` — clear bounded algorithm with deterministic model cases | Current owner: Plite transaction/query substrate; no table mutation policy; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite/src/interfaces/editor.ts:1679-1695`; `packages/plite/src/core/public-state.ts:4115-4168`. Shape/lifecycle: Atomic specs and canonical finalization host product operations without defining rows, columns, headers, merge, split, or creation. Score basis: strong generic lifecycle and types; table capability correctly absent; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — strong generic lifecycle and types; table capability correctly absent; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate `BaseTablePlugin` commands/API. Evidence: `packages/table/src/lib/BaseTablePlugin.ts:2091-2201`; `packages/table/src/lib/BaseTablePlugin.ts:4450-4660`. Shape/lifecycle: Richer public options, sizing, selections, React callers, and package tests implement the product behavior over overlapping geometry helpers. Score basis: broader and better adopted than Wordgard, but planner ownership is fragmented | `5/5/5/5/5/5/5/4=39` — broader and better adopted than Wordgard, but planner ownership is fragmented | `5/5/5/5/5/5/5/5=40` — Plate product breadth plus Plite atomic publication already surpasses the donor; the remaining work is single-owner geometry/planning. | superior | keep Plate JSON factories and centralize invariant-safe creation in the mutation planner. Target basis: one grid/context and one atomic planner preserve breadth while removing duplicate geometry | `@platejs/table/internal/mutation` behind existing Plate commands | Plate Plan | `major-task` with `tdd` | TABLE-P1 canonical fields, `TableGrid`, and typed problems. | TABLE-P2; prerequisite for TABLE-P3, TABLE-P4, TABLE-P5. | `5/5/5/5/5/5/5/5=40` — one grid/context and one atomic planner preserve breadth while removing duplicate geometry | +0 | Reject | Keep | TABLE-P2 migrates all Base/React table commands and correction, registry actions, fixtures, history undo/redo, and Yjs replay to one mutation planner. | Delete duplicate table-creation loops after registry and APIs call the planner. | TABLE-P2 focused command cases, generated valid/invalid span grids, correction convergence, inverse laws, command-sequence fuzz, history/Yjs replay, and sparse/dense operation thresholds. | Factory defaults can violate compiled schema or sizing policy; blast radius is newly inserted tables. Stop on any differential command, invariant, selection, history, or Yjs failure; publish nothing and restore the prior command path before release. Reversal evidence: introduce a donor-style builder only if current JSON factories cannot generate schema-valid rectangular tables across every supported sizing and header configuration. |
| TABLE-022 | Table-content classification and slice fitting | Current owner: Wordgard table classifier plus local fit helper. Evidence: `../wordgard/src/table/tablepaste.ts:10-38`; `../wordgard/src/table/tablepaste.ts:221-240`. Shape/lifecycle: Closed tables, open rows/cells, and ordinary content route through a local fitter before insertion. Score basis: explicit classification is valuable; local fitting duplicates generic substrate | `4/4/4/4/3/3/4/4=30` — explicit classification is valuable; local fitting duplicates generic substrate | Current owner: Plite canonical slice-fit API; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite/src/interfaces/editor.ts:498-510`; `packages/plite/src/core/public-state.ts:2122-2190`. Shape/lifecycle: `ContentSlice` fitting is schema-aware and transaction-safe for all products. Score basis: reference-quality generic fitter; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — reference-quality generic fitter; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate implicit table detection in replacement handler. Evidence: `packages/table/src/lib/BaseTablePlugin.ts:4660-4888`. Shape/lifecycle: Plate calls `state.slice.fitContent`, then detects and rebuilds table content inside one large handler. Score basis: correct generic reuse but implicit classification and coupled mutation reduce testability | `4/3/4/4/3/5/3/4=30` — correct generic reuse but implicit classification and coupled mutation reduce testability | `5/5/5/5/5/5/5/5=40` — Plite’s fitter makes combined semantics superior, while Plate still needs an explicit table-owned classifier. | superior | Private `classifyTableSlice(slice)` returns an exact non-table, row, cell, or table source; every table branch continues to use Plite `fitContent`. Target basis: keeps one generic fitter and makes product classification independently provable | `@platejs/table/internal/paste`; Plite fitter unchanged | Plite Plan proof audit → Plate Plan | `plite-plan` proof audit then `major-task` | TABLE-P1 grid, TABLE-P2 planner, TABLE-P3 selection view, unchanged Plite slice/transaction contracts, `@platejs/csv` parser ownership, and `@platejs/table` clipboard-export ownership. | TABLE-P4; prerequisite for TABLE-P5. | `5/5/5/5/5/5/5/5=40` — keeps one generic fitter and makes product classification independently provable | +0 | Adopt | Rearchitect | TABLE-P4 keeps Plite `ContentSlice`, fitter, transactions, history, Yjs, and host codecs generic; keeps `@platejs/csv` as CSV-to-table AST decoder and `@platejs/table` as CSV/TSV selection exporter; routes decoded HTML/model/CSV table nodes through one table-owned prepared source before mutation; migrates copy/cut/paste/drop, React drag, registry demos, fixtures, tests, and docs without collapsing format ownership. | Delete local/duplicate fit helpers and implicit inserted-table detection after every table ingress calls the classifier. | TABLE-P4 classifier units, 13 donor paste cases as oracles, `@platejs/csv` parser/API specs, table CSV/TSV export proof, rectangularization/growth/boundary property tests, four-boundary fuzz, format round trips, same/cross-table and multi-root moves, history/Yjs replay, native Chromium clipboard/drop, and locality thresholds. | Misclassification sends table structure through ordinary paste or vice versa; blast radius is pasted content. Stop on any classifier/fitter differential and retain current handler until a typed case is added. Reversal evidence: return classification to handler branches only if the pure classifier cannot distinguish non-table, row, cell, and table sources without mutable editor state or ambiguous output. |
| TABLE-023 | Source-grid repair and rectangularization | Current owner: Wordgard pure source preparation. Evidence: `../wordgard/src/table/tablepaste.ts:42-95`. Shape/lifecycle: Short rows are filled and rectangular source content repeats or clips to the destination size. Score basis: simple and reusable, but single-model and narrow proof | `5/5/4/4/3/3/5/4=33` — simple and reusable, but single-model and narrow proof | Current owner: Plite bounded absence of table preparation; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite/src/core/content-slice.ts:27-176`. Shape/lifecycle: Plite owns detached immutable slices, not table row/column policy. Score basis: correct boundary; zero table-specific preparation; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — correct boundary; zero table-specific preparation; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate repair coupled to insertion. Evidence: `packages/table/src/lib/BaseTablePlugin.ts:1457-1563`; `packages/table/src/lib/BaseTablePlugin.ts:4660-4888`. Shape/lifecycle: Source and target grids are repaired while the replacement handler builds a new table. Score basis: behavior exists but cannot be reused or proved independently | `4/3/4/4/3/5/3/4=30` — behavior exists but cannot be reused or proved independently | `4/3/4/4/3/5/3/4=30` — The current Plate path is broader but architecturally inferior because preparation and mutation share one owner. | inferior | Pure `prepareTablePaste` diagnoses/rectangularizes source content and returns `PreparedTablePaste` before any editor mutation. Target basis: separate pure preparation supports property tests and atomic failure | `@platejs/table/internal/paste` | Plate Plan | `major-task` with `tdd` | TABLE-P1 grid, TABLE-P2 planner, TABLE-P3 selection view, unchanged Plite slice/transaction contracts, `@platejs/csv` parser ownership, and `@platejs/table` clipboard-export ownership. | TABLE-P4; prerequisite for TABLE-P5. | `5/5/5/5/5/5/5/5=40` — separate pure preparation supports property tests and atomic failure | +10 | Adopt | Rearchitect | TABLE-P4 keeps Plite `ContentSlice`, fitter, transactions, history, Yjs, and host codecs generic; keeps `@platejs/csv` as CSV-to-table AST decoder and `@platejs/table` as CSV/TSV selection exporter; routes decoded HTML/model/CSV table nodes through one table-owned prepared source before mutation; migrates copy/cut/paste/drop, React drag, registry demos, fixtures, tests, and docs without collapsing format ownership. | Delete repair-during-insert source matrices and source-normalization branches after all formats return `PreparedTablePaste`. | TABLE-P4 classifier units, 13 donor paste cases as oracles, `@platejs/csv` parser/API specs, table CSV/TSV export proof, rectangularization/growth/boundary property tests, four-boundary fuzz, format round trips, same/cross-table and multi-root moves, history/Yjs replay, native Chromium clipboard/drop, and locality thresholds. | A bad fill/repeat/clip policy duplicates or drops cells; blast radius is pasted data. Stop on source-dimension or content-order mismatch and publish no transaction. Reversal evidence: perform source repair during mutation only if pure preparation cannot preserve source order and dimensions across fill, repeat, clip, and malformed-span property cases. |
| TABLE-024 | Target growth and boundary-span isolation | Current owner: Wordgard explicit target preparation. Evidence: `../wordgard/src/table/tablepaste.ts:100-165`. Shape/lifecycle: Rows/columns grow and spans crossing left, right, top, and bottom replacement boundaries are isolated before insertion. Score basis: clear four-boundary behavior with strong focused cases | `5/5/4/4/3/3/5/5=34` — clear four-boundary behavior with strong focused cases | Current owner: Plite bounded absence of table target geometry; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite/src/interfaces/editor.ts:498-510`. Shape/lifecycle: Generic fitter has no table span/growth policy. Score basis: correct layer boundary; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — correct layer boundary; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate duplicate occupied/anchor matrices. Evidence: `packages/table/src/lib/BaseTablePlugin.ts:4660-4888`. Shape/lifecycle: The replacement handler reconstructs affected anchors/unit cells while rebuilding the table. Score basis: broad behavior, but duplicate matrices and whole-table construction weaken locality | `4/3/4/4/3/5/3/4=30` — broad behavior, but duplicate matrices and whole-table construction weaken locality | `4/3/4/4/3/5/3/4=30` — Wordgard’s isolated behavior is architecturally cleaner; current combined system is inferior on table-specific ownership. | inferior | A pure target plan derived from source/target `TableGrid`s returns growth and four-boundary split operations before atomic application. Target basis: one planner removes duplicate matrices and makes each boundary fuzzable | `@platejs/table/internal/paste` plus mutation planner | Plate Plan | `major-task` with `tdd` | TABLE-P1 grid, TABLE-P2 planner, TABLE-P3 selection view, unchanged Plite slice/transaction contracts, `@platejs/csv` parser ownership, and `@platejs/table` clipboard-export ownership. | TABLE-P4; prerequisite for TABLE-P5. | `5/5/5/5/5/5/5/5=40` — one planner removes duplicate matrices and makes each boundary fuzzable | +10 | Adopt | Cut | TABLE-P4 keeps Plite `ContentSlice`, fitter, transactions, history, Yjs, and host codecs generic; keeps `@platejs/csv` as CSV-to-table AST decoder and `@platejs/table` as CSV/TSV selection exporter; routes decoded HTML/model/CSV table nodes through one table-owned prepared source before mutation; migrates copy/cut/paste/drop, React drag, registry demos, fixtures, tests, and docs without collapsing format ownership. | Delete insert-handler occupied/anchor matrices, boundary special cases, and whole-table reconstruction after planner parity. | TABLE-P4 classifier units, 13 donor paste cases as oracles, `@platejs/csv` parser/API specs, table CSV/TSV export proof, rectangularization/growth/boundary property tests, four-boundary fuzz, format round trips, same/cross-table and multi-root moves, history/Yjs replay, native Chromium clipboard/drop, and locality thresholds. | A missed boundary leaves overlapping spans or overwrites anchors; blast radius is the target table. Stop on any post-plan grid problem and reject the paste without publication. Reversal evidence: retain a bounded legacy boundary matrix only if four-boundary fuzz proves source and target grids cannot derive a non-overlapping growth and split plan. |
| TABLE-025 | Atomic table-paste application and final selection | Current owner: Wordgard staged `ChangeSet` composition. Evidence: `../wordgard/src/table/tablepaste.ts:169-218`. Shape/lifecycle: Multiple staged changes remap intermediate positions and construct a final cell selection. Score basis: stable staged reasoning, but intermediate numeric mapping and donor lifecycle are narrow | `5/4/4/4/3/3/4/4=31` — stable staged reasoning, but intermediate numeric mapping and donor lifecycle are narrow | Current owner: Plite atomic transaction publication; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite/src/interfaces/editor.ts:1679-1695`; `packages/plite/src/core/public-state.ts:4115-4168`. Shape/lifecycle: One immutable transaction spec finalizes canonical changes and selection or publishes nothing. Score basis: reference-quality lifecycle and failure isolation; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — reference-quality lifecycle and failure isolation; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate whole-table install. Evidence: `packages/table/src/lib/BaseTablePlugin.ts:4660-4888`. Shape/lifecycle: Plate prepares a replacement table and sets it with final selection inside one Plite transaction. Score basis: atomic but coarse; stable cell identity and locality are weaker | `4/3/4/4/3/5/3/4=30` — atomic but coarse; stable cell identity and locality are weaker | `5/5/5/5/5/5/5/5=40` — Plite atomicity makes combined behavior superior, but Plate’s whole-table replacement remains an avoidable locality/identity cost. | different tradeoff | `TableMutationPlan` holds focused operations plus final selection and stable before/after cell identities; one Plite transaction applies it atomically. Target basis: retains atomic publication while improving locality and identity | `@platejs/table/internal/mutation` on Plite transactions | Plite Plan proof audit → Plate Plan | `plite-plan` proof audit then `major-task` | TABLE-P1 grid, TABLE-P2 planner, TABLE-P3 selection view, unchanged Plite slice/transaction contracts, `@platejs/csv` parser ownership, and `@platejs/table` clipboard-export ownership. | TABLE-P4; prerequisite for TABLE-P5. | `5/5/5/5/5/5/5/5=40` — retains atomic publication while improving locality and identity | +0 | Adopt | Rearchitect | TABLE-P4 keeps Plite `ContentSlice`, fitter, transactions, history, Yjs, and host codecs generic; keeps `@platejs/csv` as CSV-to-table AST decoder and `@platejs/table` as CSV/TSV selection exporter; routes decoded HTML/model/CSV table nodes through one table-owned prepared source before mutation; migrates copy/cut/paste/drop, React drag, registry demos, fixtures, tests, and docs without collapsing format ownership. | Delete whole-table paste installation and intermediate private insertion path after focused-plan benchmark and identity parity. | TABLE-P4 classifier units, 13 donor paste cases as oracles, `@platejs/csv` parser/API specs, table CSV/TSV export proof, rectangularization/growth/boundary property tests, four-boundary fuzz, format round trips, same/cross-table and multi-root moves, history/Yjs replay, native Chromium clipboard/drop, and locality thresholds. | Focused operations can expose intermediate invalidity or remap selection incorrectly; blast radius is target content/history. Stop if finalization cannot keep intermediates private and retain whole-table atomic replacement. Reversal evidence: restore whole-table replacement only if focused operations cannot keep invalid intermediates private or preserve stable before/after identities and final selection. |
| TABLE-026 | Table drop/move semantics | Current owner: Wordgard transform-aware insert-then-clear move handler. Evidence: `../wordgard/src/table/tablepaste.ts:242-264`; `../wordgard/src/state/transaction.ts:133-135`; `../wordgard/src/state/transaction.ts:375-395`. Shape/lifecycle: The target transaction is computed first; a second spec clears cells at original source positions. The table handler does not adjust the drop position itself because `Transaction.merge` resolves and transforms the clear spec through the insertion; the FIXME concerns acquiring a multi-cell drag selection. Score basis: explicit transform-aware route; multi-cell capture and direct drag proof remain weak | `3/3/3/3/2/4/3/2=23` — explicit transform-aware route; multi-cell capture and direct drag proof remain weak | Current owner: Plite/React generic drag and atomic spec lifecycle; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite-react/src/editable/clipboard-input-strategy.ts:654-728`; `packages/plite/src/interfaces/editor.ts:1679-1695`. Shape/lifecycle: Generic drag captures source range, resolves drop, deletes/moves through transaction intent, and remains table-neutral. Score basis: strong host lifecycle; table-specific identity proof absent; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — strong host lifecycle; table-specific identity proof absent; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate generic host plus table replacement behavior. Evidence: `packages/table/src/lib/BaseTablePlugin.ts:4660-4888`; `packages/plite-react/src/editable/clipboard-input-strategy.ts:654-728`. Shape/lifecycle: Table fragments can flow through the broader clipboard/drop host, but no focused same/cross-table table-move contract is named. Score basis: broader than donor yet under-proved for table topology | `4/4/4/4/4/5/4/4=33` — broader than donor yet under-proved for table topology | `5/5/5/5/5/5/5/5=40` — Current host architecture is superior, but table-specific drop correctness is an evidence gap. | superior | Prepare source and target identities before mutation, reject self-overlap explicitly, then apply one table mutation plan for same-table, cross-table, and cross-root moves. Target basis: keeps generic drag low and makes table topology/product policy explicit | `@platejs/table/internal/paste` on Plite React drag intent | Plate discovery → Plite Plan proof → Plate adoption | `plite-plan` proof audit then `major-task` | TABLE-P1 grid, TABLE-P2 planner, TABLE-P3 selection view, unchanged Plite slice/transaction contracts, `@platejs/csv` parser ownership, and `@platejs/table` clipboard-export ownership. | TABLE-P4; prerequisite for TABLE-P5. | `5/5/5/5/5/5/5/5=40` — keeps generic drag low and makes table topology/product policy explicit | +0 | Reject | Gate | TABLE-P4 keeps Plite `ContentSlice`, fitter, transactions, history, Yjs, and host codecs generic; keeps `@platejs/csv` as CSV-to-table AST decoder and `@platejs/table` as CSV/TSV selection exporter; routes decoded HTML/model/CSV table nodes through one table-owned prepared source before mutation; migrates copy/cut/paste/drop, React drag, registry demos, fixtures, tests, and docs without collapsing format ownership. | Delete no generic drag owner; delete table-specific insert-then-clear or bypass paths only after focused move proof and one prepared-plan route. | TABLE-P4 classifier units, 13 donor paste cases as oracles, `@platejs/csv` parser/API specs, table CSV/TSV export proof, rectangularization/growth/boundary property tests, four-boundary fuzz, format round trips, same/cross-table and multi-root moves, history/Yjs replay, native Chromium clipboard/drop, and locality thresholds. | A future table-specific route could mishandle self-overlap or root identity despite generic transaction transformation. Blast radius is moved table content. Stop on any differential identity/root mismatch and retain the proven generic host path. Reversal evidence: add a table-specific move route only if a concrete same-table, cross-table, or cross-root case fails the generic transformed transaction and the focused route preserves identities, roots, and history/Yjs replay. |
| TABLE-027 | Clipboard formats and table ingress | Current owner: Wordgard model-slice-only paste. Evidence: `../wordgard/src/table/tablepaste.ts:10-38`; `../wordgard/src/table/tablepaste.ts:221-240`. Shape/lifecycle: Table paste consumes Wordgard model slices; no HTML/CSV/TSV product-format owner exists here. Score basis: narrow and simple, but incomplete for product interchange | `2/2/3/3/2/3/3/2=20` — narrow and simple, but incomplete for product interchange | Current owner: Plite DOM host-codec protocol; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite-dom/src/plugin/host-codec.ts:353-553`; `packages/plite-dom/src/plugin/host-codec.ts:626-720`; `packages/plite-dom/src/plugin/dom-clipboard-runtime.ts:113-210`. Shape/lifecycle: MIME/source/schema claims compile generically and clipboard transport prefers exact internal fragments. Score basis: reference-quality generic codec boundary; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — reference-quality generic codec boundary; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate `@platejs/csv` ingress plus `@platejs/table` export/model handlers. Evidence: `packages/csv/src/lib/CsvPlugin.ts:28-46`; `packages/csv/src/lib/internal/deserializeCsv.ts:75-169`; `packages/table/src/lib/BaseTablePlugin.ts:2532-2556`; `packages/table/src/lib/BaseTablePlugin.ts:4660-4888`; `packages/csv/src/lib/CsvPlugin.spec.ts:25-81`; `packages/csv/src/lib/deserializer/utils/deserializeCsv.spec.ts:25-227`; `packages/table/src/lib/BaseTablePlugin.clipboard.spec.tsx:280-322`. Shape/lifecycle: `@platejs/csv` owns configurable plain-text CSV detection and CSV-to-table AST construction; `@platejs/table` separately owns selected-table CSV/TSV export and model-table replacement. The table replacement handler does not own CSV parsing. Score basis: genuinely broader with correct split product ownership; prepared table ingress must preserve that split | `5/5/4/5/4/5/4/4=36` — genuinely broader with correct split product ownership; prepared table ingress must preserve that split | `5/5/5/5/5/5/5/5=40` — The combined system strictly surpasses donor format breadth: Plite owns generic transport, `@platejs/csv` owns CSV decoding, and `@platejs/table` owns table export and mutation. | superior | Keep Plite transport, `@platejs/csv` decoding, and `@platejs/table` CSV/TSV export; after any decoder produces canonical table nodes, only the table owner classifies and converts them into `PreparedTablePaste` before mutation. Target basis: one table mutation ingress preserves format-owner boundaries without duplicating decoding | Plite DOM transport, `@platejs/csv`, and `@platejs/table/internal/paste` | Plate Plan | `task` with `testing` | TABLE-P1 grid, TABLE-P2 planner, TABLE-P3 selection view, unchanged Plite slice/transaction contracts, `@platejs/csv` parser ownership, and `@platejs/table` clipboard-export ownership. | TABLE-P4; prerequisite for TABLE-P5. | `5/5/5/5/5/5/5/5=40` — one table mutation ingress preserves format-owner boundaries without duplicating decoding | +0 | Reject | Keep | TABLE-P4 keeps Plite `ContentSlice`, fitter, transactions, history, Yjs, and host codecs generic; keeps `@platejs/csv` as CSV-to-table AST decoder and `@platejs/table` as CSV/TSV selection exporter; routes decoded HTML/model/CSV table nodes through one table-owned prepared source before mutation; migrates copy/cut/paste/drop, React drag, registry demos, fixtures, tests, and docs without collapsing format ownership. | Delete only table-mutation branches that bypass `PreparedTablePaste` and any duplicate format-to-table normalization proven by call-site inventory; retain Plite transport, `CsvPlugin`, CSV parser options/API, table CSV/TSV export, and supported formats. | TABLE-P4 classifier units, 13 donor paste cases as oracles, `@platejs/csv` parser/API specs, table CSV/TSV export proof, rectangularization/growth/boundary property tests, four-boundary fuzz, format round trips, same/cross-table and multi-root moves, history/Yjs replay, native Chromium clipboard/drop, and locality thresholds. | Changing owner order can make CSV plain text bypass a higher-priority internal fragment or make table export disagree with CSV import. Blast radius is clipboard interchange. Stop on parser-claim, AST, round-trip, or sanitization drift and retain the current separate owners. Reversal evidence: merge format decoding into the table owner only if canonical-node handoff cannot preserve parser precedence, sanitization, and CSV/TSV round trips with separate owners. |
| TABLE-028 | Dimension picker, menu, and product table UI | Current owner: Wordgard imperative DOM menu/control. Evidence: `../wordgard/src/table/menu.ts:15-110`; `../wordgard/src/table/menu.ts:128-254`. Shape/lifecycle: A dimension picker, keyboard/ARIA behavior, menu items, and table commands live in the headless table bundle; line 15 says screen-reader behavior was not tested. Score basis: coherent interaction idea, wrong owner and weak accessibility proof | `4/4/3/3/3/4/3/2=26` — coherent interaction idea, wrong owner and weak accessibility proof | Current owner: Plite bounded absence of product UI; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite-react/src/components/plite.tsx:153-216`. Shape/lifecycle: Plite React hosts generic editor composition but intentionally defines no table menu/picker. Score basis: zero table UI is the correct substrate boundary; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — zero table UI is the correct substrate boundary; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate React/registry UI. Evidence: `apps/www/src/registry/components/editor/plugins/table-base-kit.tsx:1-20`; `apps/www/src/registry/components/editor/plugins/table-kit.tsx:1-22`; `apps/www/src/registry/ui/table-toolbar-button.tsx:1-102`. Shape/lifecycle: Product kits, toolbar, rendered nodes, resize/border/background controls, and registry examples own the UI lifecycle. Score basis: genuinely broader and correctly product-owned; final accessibility proof remains | `5/5/5/5/4/5/5/4=38` — genuinely broader and correctly product-owned; final accessibility proof remains | `5/5/5/5/4/5/5/4=38` — Plate is materially stronger, not merely more opinionated; donor UI placement is rejected. | superior | Keep product UI in Plate/apps, consume canonical grid/commands, and close keyboard, focus, role, label, and screen-reader proof. Target basis: correct ownership plus proof reaches target without a low-level menu API | Plate registry and `@platejs/table/react` | Plate Plan | `plate-ui` with `testing` | TABLE-P1 through TABLE-P4 complete with deletion gates closed. | TABLE-P5 release-closure packet. | `5/5/5/5/5/5/5/5=40` — correct ownership plus proof reaches target without a low-level menu API | +2 | Reject | Gate | TABLE-P5 migrates Base/React sizing and presentation, kits, registry UI/static nodes/toolbars, apps/www examples, apps/plite proof, docs, changeset, package exports, fixtures, DOCX consumers, and release gates. | Delete old geometry reads and stale field docs/examples; do not port Wordgard imperative menu/control code. | TABLE-P5 package/type tests, accessibility roles/labels/focus, pointer/keyboard/resize, Chromium and closure matrix, table performance thresholds, source-first checks, and final deleted-owner searches. | A11y regressions can make table insertion/controls unusable; blast radius is registry consumers. Stop release on role/label/focus or keyboard failure and keep existing UI until proof passes. Reversal evidence: add a low-level menu API only if two non-Plate hosts demonstrate the same keyboard, focus, role, and label contract and cannot implement it against canonical commands. |
| TABLE-029 | HTML/DOM table codec policy | Current owner: Wordgard schema-owned DOM shapes. Evidence: `../wordgard/src/types/schema.ts:134-218`. Shape/lifecycle: Cell/header tags and span marks define DOM parse/serialize policy in the model schema. Score basis: coherent but couples model, HTML, and nominal types | `4/4/4/4/3/4/3/3=29` — coherent but couples model, HTML, and nominal types | Current owner: Plite generic host-codec claims; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite-dom/src/plugin/host-codec.ts:353-553`; `packages/plite-dom/src/plugin/host-codec.ts:626-720`. Shape/lifecycle: Format/direction/schema claims compile generically with conflicts and lifecycle checks. Score basis: reference-quality generic boundary; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — reference-quality generic boundary; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate HTML deserializers plus duplicate model fields. Evidence: `packages/table/src/lib/BaseTablePlugin.ts:366-423`; `packages/table/src/lib/BaseTablePlugin.ts:2363-2435`. Shape/lifecycle: Plate product plugins parse/render table HTML, but lowercase DOM attributes leak into persisted model aliases. Score basis: correct owner and host breadth, weakened by duplicate persisted representation | `4/4/4/4/4/5/4/4=33` — correct owner and host breadth, weakened by duplicate persisted representation | `5/5/5/5/5/5/5/5=40` — Generic Plite codec ownership makes the combined boundary strong; Plate field leakage remains the sole material gap. | superior | Plate codecs translate HTML `rowspan`/`colspan` to canonical camel-case JSON and serialize back; DOM spellings never persist. Target basis: preserves external HTML while making model truth singular | Plite DOM codec protocol plus `@platejs/table` codec adapters | Plate Plan | `plate-plan` → `task` with `tdd` | Current Plite structural JSON, schema-property, immutable snapshot, path, and atomic transaction contracts. | TABLE-P1; prerequisite for TABLE-P2, TABLE-P3, TABLE-P4, TABLE-P5. | `5/5/5/5/5/5/5/5=40` — preserves external HTML while making model truth singular | +0 | Surpass | Rearchitect | TABLE-P1 migrates `@platejs/table` schema/codecs/API/selectors, React hooks, registry/static nodes, fixtures, docs, DOCX/HTML callers, and downstream typed JSON; Plite, history, and Yjs retain generic contracts and add canonical-field round trips. | Delete lowercase persisted span aliases, dual-read normalization, stale codec fixtures, and docs showing both representations after adoption. | TABLE-P1 codec/type/model laws, grid diagnostic determinism, hot/cold compilation, retained-memory threshold, 19 package specs, and the plugin type contract. | Codec precedence or alias removal can alter imported/exported spans; blast radius is clipboard, HTML, DOCX, persistence, and collaboration. Stop on round-trip or conflict diagnostic drift and roll back with TABLE-P1. Reversal evidence: persist a DOM-style span alias only if an existing document corpus cannot be migrated losslessly through versioned codecs and conflict diagnostics. |
| TABLE-030 | Sizing, borders, background, margin, and responsive state | Current owner: Wordgard capability mostly absent. Evidence: `../wordgard/src/table/table.ts:9-42`. Shape/lifecycle: A fixed theme supplies basic borders/layout; there is no rich sizing, border model, background, margin, resize store, or responsive product lifecycle. Score basis: clean only because the product surface is narrow | `1/1/2/2/1/2/2/1=12` — clean only because the product surface is narrow | Current owner: Plite bounded absence of table presentation; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite-react/src/components/plite.tsx:153-216`. Shape/lifecycle: Generic React host composition stays table-neutral. Score basis: zero product state is the correct substrate boundary; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — zero product state is the correct substrate boundary; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate rich product state/UI. Evidence: `packages/table/src/lib/BaseTablePlugin.ts:955-1367`; `packages/table/src/lib/BaseTablePlugin.ts:2030-2217`; `packages/table/src/react/TablePlugin.tsx:1-233`. Shape/lifecycle: Column/row sizes, borders, background, margin, resize stores/hooks, static/rendered nodes, and product options are lifecycle-owned in Plate. Score basis: genuinely broader and nearly target-quality | `5/5/5/5/4/5/5/5=39` — genuinely broader and nearly target-quality | `5/5/5/5/4/5/5/5=39` — Plate’s richer product architecture decisively surpasses Wordgard; only geometry consolidation is needed. | superior | Keep all Plate presentation breadth and route geometry reads/writes through `TableGrid` plus the mutation planner. Target basis: retains product value while removing duplicate geometry | `@platejs/table` and Plate registry | Plate Plan | `task` with `performance` | TABLE-P1 through TABLE-P4 complete with deletion gates closed. | TABLE-P5 release-closure packet. | `5/5/5/5/5/5/5/5=40` — retains product value while removing duplicate geometry | +1 | Surpass | Keep | TABLE-P5 migrates Base/React sizing and presentation, kits, registry UI/static nodes/toolbars, apps/www examples, apps/plite proof, docs, changeset, package exports, fixtures, DOCX consumers, and release gates. | Delete old sizing/UI geometry readers after they consume canonical grid; retain public product options and rendering. | TABLE-P5 package/type tests, accessibility roles/labels/focus, pointer/keyboard/resize, Chromium and closure matrix, table performance thresholds, source-first checks, and final deleted-owner searches. | Geometry consolidation can change resize rounding or border bounds; blast radius is rendered tables. Stop on visual/size/performance regression and retain current presentation adapters until parity. Reversal evidence: retain a presentation-specific geometry reader only if browser size, border, responsive, and locality proof shows the canonical grid cannot reproduce current rendering within thresholds. |
| TABLE-031 | Table proof architecture | Current owner: Wordgard deterministic model corpus. Evidence: `../wordgard/test/test-table-correction.ts:1-41`; `../wordgard/test/test-table-commands.ts:1-212`; `../wordgard/test/test-cellselection.ts:1-179`; `../wordgard/test/test-table-paste.ts:1-124`. Shape/lifecycle: Exactly 5 correction, 33 command, 30 cell-selection, and 13 paste cases; no generated table laws, fuzz, browser/IME/accessibility matrix, or benchmark. Score basis: crisp cases but narrow proof classes | `4/4/4/4/2/3/4/4=29` — crisp cases but narrow proof classes | Current owner: Plite law/browser infrastructure; bounded absence of a Plite-owned table-specific capability. Evidence: `packages/plite/test/document-change-laws.test.ts:455-799`; `packages/plite/test/slice-fit-laws.test.ts:300-609`; `apps/plite/package.json:7-17`. Shape/lifecycle: Seeded laws, slice fitting, strict Chromium/matrix runners, history/Yjs contracts, and benchmark gates are reusable. Score basis: reference-quality infrastructure, not yet table-specific; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | `0/0/0/0/0/0/0/0=0` — reference-quality infrastructure, not yet table-specific; the independently scored table capability is absent in Plite, so generic substrate credit appears only in the current combined score | Current owner: Plate table proof estate. Evidence: `packages/table/src/lib/BaseTablePlugin.grid.spec.tsx:1-450`; `packages/table/src/react/TablePlugin.navigation.spec.tsx:1-741`; `packages/table/type-tests/table-plugin-contracts.ts:1-35`; `apps/plite/tests/plite-browser/donor/examples/tables.test.ts:1-534`; `apps/www/scripts/run-table-perf.mts:1-349`. Shape/lifecycle: Exactly 19 package spec files plus one type contract, React integration, one browser donor file, registry examples, and a perf script cover broad behavior. Score basis: broad and strong, but missing generated arbitrary-span and grid-cache locality contracts | `5/5/5/5/4/5/5/4=38` — broad and strong, but missing generated arbitrary-span and grid-cache locality contracts | `5/5/5/5/5/5/5/5=40` — Combined proof already surpasses Wordgard; the target gap exists only for newly accepted grid/planner claims. | superior | Attach generated span/correction/mutation/paste laws, browser/IME/a11y rows, history/Yjs round trips, and hot/cold/retained-memory thresholds to TABLE-P1 through TABLE-P5. Target basis: claim-matched proof closes every accepted architecture gap | Affected Plite proof owners, `@platejs/table`, apps/plite, and registry | Plate Plan with Plite Plan for generic claims | `testing` plus `performance` | TABLE-P1 through TABLE-P4 complete with deletion gates closed. | TABLE-P5 release-closure packet. | `5/5/5/5/5/5/5/5=40` — claim-matched proof closes every accepted architecture gap | +0 | Adopt | Gate | TABLE-P5 migrates Base/React sizing and presentation, kits, registry UI/static nodes/toolbars, apps/www examples, apps/plite proof, docs, changeset, package exports, fixtures, DOCX consumers, and release gates. | Delete or replace tests that assert removed helper/cache/whole-table internals; retain observable behavior cases and the 19-spec/type/browser estate. | TABLE-P5 package/type tests, accessibility roles/labels/focus, pointer/keyboard/resize, Chromium and closure matrix, table performance thresholds, source-first checks, and final deleted-owner searches. | Green unit tests can hide browser, collaboration, or locality regressions; blast radius is every changed table packet. Stop each packet at its narrow proof gate and never widen claims beyond passing evidence. Reversal evidence: remove a donor-derived proof family only if mutation testing shows an existing current law catches the same seeded regression at the same package, browser, collaboration, and locality boundary. |
| META-001 | Package topology and public entry points | Current owner: Wordgard package/build metadata. Evidence: `../wordgard/package.json:7-18`; `../wordgard/bin/packages.ts:24-33`. Shape/lifecycle: One root export plus 10 subpath exports; recursive discovery finds the 10 source packages containing `index.ts`. Score basis: compact, but one npm package couples model, state, DOM, UI, history, collaboration, and product policy | `3/3/3/4/2/3/3/2=23` — compact, but one npm package couples model, state, DOM, UI, history, collaboration, and product policy | Current owner: Plite package owners. Evidence: `pnpm-workspace.yaml:37-40`; `packages/plite/package.json:35-63`. Shape/lifecycle: Workspace packages expose explicit ESM/type contracts and source-first type/test scripts. Score basis: clear independent substrate ownership and package lifecycle | `5/5/5/5/5/5/5/5=40` — clear independent substrate ownership and package lifecycle | Current owner: Plate feature package owners. Evidence: `packages/table/package.json:20-47`. Shape/lifecycle: Product features remain independently adoptable packages with explicit Plite/core dependencies. Score basis: correct product/package ownership and release surface | `5/5/5/5/5/5/5/5=40` — correct product/package ownership and release surface | `5/5/5/5/5/5/5/5=40` — Separate workspace owners already meet the target and avoid Wordgard’s package coupling. | superior | Keep current package topology; reject collapsing Plite, DOM, React, history, Yjs, Plate features, and registry into one package. Target basis: existing ownership is complete | Existing Plite and Plate package owners | Plite Plan and Plate Plan | No execution packet; evidence-backed keep. | Current workspace/export contracts. | None; no accepted META packet. | `5/5/5/5/5/5/5/5=40` — existing ownership is complete | +0 | Reject | Keep | No adoption; preserve current package manifests, exports, source-first checks, and owner boundaries. | No deletion; do not import Wordgard’s monolithic topology. | Package export/typecheck contracts already prove the current topology. | A future convenience barrel could recreate cross-owner coupling; reverse only with a concrete consumer and unchanged independent package contracts. Reversal evidence: collapse package owners only when a concrete consumer requires atomic versioning and the proposal preserves independent export, typecheck, and tree-shaking contracts. |
| META-002 | Declaration/runtime build and tree shaking | Current owner: Wordgard custom build owner. Evidence: `../wordgard/bin/build.ts:13-84`; `../wordgard/bin/build.ts:129-314`; `../wordgard/bin/test-dead-code.ts:5-46`; `../wordgard/demo/demo.ts:5-50`; `../wordgard/tsconfig.json:1-19`; `../wordgard/bin/tsconfig.json:1-8`. Shape/lifecycle: TypeScript output is rewritten for namespace IIFEs/purity and bundled per subpath. Root `tsconfig.json` is mapped to this build/type concept; script-only `bin/tsconfig.json` is explicitly excluded as compiler plumbing. Demo source comments document a `Pos.Plot.node` declaration/runtime mismatch; this audit did not execute the demo, so it is not runtime-verified. Score basis: clever dead-code handling, but namespace rewriting and source-documented declaration drift weaken types and lifecycle | `3/2/2/3/2/3/2/3=20` — clever dead-code handling, but namespace rewriting and source-documented declaration drift weaken types and lifecycle | Current owner: Plite package build owner. Evidence: `packages/plite/package.json:35-63`. Shape/lifecycle: Ordinary typed ESM exports, side-effect metadata, tsdown build, tests, and two source-first typecheck projects. Score basis: simple, typed, and release-aligned | `5/5/5/5/5/5/5/5=40` — simple, typed, and release-aligned | Current owner: Plate package build owner. Evidence: `packages/table/package.json:20-40`. Shape/lifecycle: Explicit ESM/react exports and package-owned build/test/typecheck scripts. Score basis: ordinary package contracts without namespace mangling | `5/5/5/5/5/5/5/5=40` — ordinary package contracts without namespace mangling | `5/5/5/5/5/5/5/5=40` — Current Plite/Plate build architecture strictly surpasses the source-documented donor defect shape. | superior | Keep ordinary ESM/declaration builds and focused type contracts; reject namespace-output rewriting. Target basis: existing build and type ownership is complete | Release/package owners | Plite Plan and Plate Plan | No execution packet; evidence-backed keep. | Existing package build/type contracts. | None; no accepted META packet. | `5/5/5/5/5/5/5/5=40` — existing build and type ownership is complete | +0 | Reject | Keep | No adoption; retain package type tests and source-first typechecks. | No deletion; donor build machinery is not imported. | Existing package build/typecheck plus focused declaration contracts; demo comments remain hypothesis until executed. | Treating source comments as runtime proof would overclaim; reverse only after a reproducible current-package declaration defect. Reversal evidence: adopt namespace-output rewriting only after a minimal current-package reproduction proves ordinary ESM declarations cannot express the required runtime export while preserving tree shaking. |
| META-003 | Random document/change generation | Current owner: Wordgard test generator. Evidence: `../wordgard/test/generate.ts:49-184`. Shape/lifecycle: Schema-constrained documents and nine edit classes feed unseeded algebra/model loops. Score basis: valuable distributions, but no deterministic seed, shrink, replay artifact, multi-root, history, or Yjs lifecycle | `4/4/3/3/2/2/4/4=26` — valuable distributions, but no deterministic seed, shrink, replay artifact, multi-root, history, or Yjs lifecycle | Current owner: Plite law-test owners. Evidence: `packages/plite/test/document-change-laws.test.ts:455-799`; `packages/plite/test/content-slice-laws.test.ts:81-197`; `packages/plite/test/slice-fit-laws.test.ts:300-609`. Shape/lifecycle: Seeded fast-check laws cover changes, slices, fitting, associativity, transforms, and malformed inputs. Score basis: mature deterministic law infrastructure; host/device breadth is separate | `5/5/5/5/5/4/5/5=39` — mature deterministic law infrastructure; host/device breadth is separate | Current owner: Plate feature-test owners. Evidence: `packages/table/src/lib/BaseTablePlugin.grid.spec.tsx:1-450`; `packages/table/src/react/TablePlugin.navigation.spec.tsx:1-741`. Shape/lifecycle: Product tests cover concrete table/grid/navigation behavior but are not a generic random document generator. Score basis: broader product behavior, narrower generator reuse | `3/3/3/4/4/3/4/4=28` — broader product behavior, narrower generator reuse | `5/5/5/5/5/4/5/5=39` — Plite laws already surpass the donor; only uncovered donor distributions merit translation. | superior | Translate only demonstrably absent distributions into deterministic seeded/shrunk laws owned by the affected feature packet. Target basis: one-point proof gain comes from missing distributions, not donor generator code | Affected Plite law or Plate feature-test owner | Owning Plite Plan or Plate Plan packet | `tdd` inside the accepted feature packet; no standalone META packet. | A proved coverage gap in an accepted concept. | TABLE-P2 or TABLE-P4 only when its generated span/paste distribution is accepted; otherwise none. | `5/5/5/5/5/5/5/5=40` — one-point proof gain comes from missing distributions, not donor generator code | +1 | Adopt | Gate | Adopt selected test cases/distributions into current law runners; no runtime/package adoption. | Delete no current proof; do not import the donor generator or unseeded loops. | Deterministic seed, shrink, replay artifact, law oracle, and affected package/browser proof. | A copied generator can encode donor-only semantics; stop unless each distribution maps to a current invariant and fails before the target change. Reversal evidence: reject a harvested distribution when it cannot name a current invariant, produce a deterministic failing seed, shrink that seed, and replay it in the owning packet. |
| META-004 | Browser proof harness | Current owner: Wordgard custom browser harness. Evidence: `../wordgard/bin/run-tests.js:1-31`; `../wordgard/bin/run-testserver.ts:1-5`; `../wordgard/bin/test-headless.ts:1-54`; `../wordgard/bin/testserver.ts:1-62`. Shape/lifecycle: Custom server/headless scripts build and execute browser modules with a narrow browser target. Score basis: works for donor tests but lacks the current matrix, artifact, release, and package/browser split | `3/3/3/3/2/3/3/3=23` — works for donor tests but lacks the current matrix, artifact, release, and package/browser split | Current owner: Plite browser-proof owner. Evidence: `apps/plite/package.json:7-17`; `apps/plite/playwright.config.ts:1-121`; `package.json:42-47`. Shape/lifecycle: Dedicated Chromium, smoke, project, and matrix lanes feed strict Plite checks. Score basis: reference-quality current browser/release proof | `5/5/5/5/5/5/5/5=40` — reference-quality current browser/release proof | Current owner: Plate adoption proof owner. Evidence: `apps/plite/tests/plite-browser/donor/examples/tables.test.ts:1-534`; `packages/table/src/react/TablePlugin.navigation.spec.tsx:1-741`. Shape/lifecycle: Product examples and React integration feed the shared browser app and package proofs. Score basis: strong integration, correctly downstream of Plite harness | `4/4/4/5/4/5/4/4=34` — strong integration, correctly downstream of Plite harness | `5/5/5/5/5/5/5/5=40` — Current proof architecture decisively surpasses the custom donor harness. | superior | Keep apps/plite/browser matrix and harvest only missing observable cases into owning packets. Target basis: existing harness already meets target | Plite browser owner plus affected Plate package | Plite Plan for harness; Plate Plan for product rows | No standalone META packet; `testing` in the affected packet. | An accepted browser-visible behavior gap. | Feature packet only; no META packet. | `5/5/5/5/5/5/5/5=40` — existing harness already meets target | +0 | Adopt | Keep | Adopt only missing behavior rows into current Browser/Playwright owners. | Delete no current harness; do not import donor server/headless plumbing. | Focused Chromium during packets and closure browser matrix for release-quality claims. | Porting harness code would create a second proof owner; reverse only if the current runner cannot express a required browser behavior. Reversal evidence: import donor harness machinery only if a named observable browser behavior cannot be expressed in `apps/plite` or the closure matrix and the donor route demonstrates it reproducibly. |
| META-005 | Architecture teaching example and declaration smoke | Current owner: Wordgard demo source. Evidence: `../wordgard/demo/index.html:1-8`; `../wordgard/demo/demo.ts:5-50`; `../wordgard/demo/flower.jpg`. Shape/lifecycle: A minimal host accompanies source comments/code reproducing a declaration mismatch; runtime logs are documented in comments but were not executed in this audit. Binary `demo/flower.jpg` is explicitly excluded because it encodes no independent architecture mechanism. Score basis: not a representative editor example and not current runtime proof | `2/2/1/2/1/2/2/2=14` — not a representative editor example and not current runtime proof | Current owner: Plite proof/example app. Evidence: `apps/plite/src/app/page.tsx:1-20`; `apps/plite/src/app/examples/plite/[example]/client.tsx:1-90`. Shape/lifecycle: The proof app imports source-owned examples, navigation, and components from apps/www. Score basis: single-source examples with runnable browser ownership | `5/5/5/5/5/5/5/5=40` — single-source examples with runnable browser ownership | Current owner: Plate apps/www example owner. Evidence: `apps/www/src/app/(app)/examples/plite/plite-example-registry.ts:1-93`; `apps/www/src/app/(app)/examples/plite/plite-example-loaders.tsx:1-101`. Shape/lifecycle: Product examples and loaders are registry-owned and reused by apps/plite. Score basis: complete product teaching/adoption ownership | `5/5/5/5/5/5/5/5=40` — complete product teaching/adoption ownership | `5/5/5/5/5/5/5/5=40` — Current shared examples and browser proof strictly surpass the donor demo shape. | superior | Keep examples single-sourced in apps/www and use focused compile/type contracts for declaration bugs. Target basis: existing ownership and proof are complete | apps/www examples plus apps/plite proof | Plate Plan and Plite Plan | No execution packet; evidence-backed keep. | Current shared example registry and type-contract owners. | None; no accepted META packet. | `5/5/5/5/5/5/5/5=40` — existing ownership and proof are complete | +0 | Reject | Keep | No adoption; a confirmed declaration bug would become a focused package type test, not a demo runtime. | No deletion; do not copy donor demo shape. | Typecheck contract plus runnable apps/plite example when behavior is browser-visible. | Source-comment evidence can be stale; reverse only after executing a minimal current reproduction. Reversal evidence: add a donor-style architecture demo or declaration smoke only after a minimal current compile reproduction exposes a defect that focused type contracts and the single-sourced runnable example cannot catch. |
| META-006 | Bulk regex source codemod | Current owner: Wordgard repository script. Evidence: `../wordgard/bin/mass-change.ts:5-22`. Shape/lifecycle: An arbitrary CLI regular expression replaces text across every discovered package and test TypeScript file and writes matches in place. Score basis: compact but unscoped, syntax-unaware, weakly typed, destructive, and untested; it is not a performance workload | `2/1/2/2/1/1/1/1=11` — compact but unscoped, syntax-unaware, weakly typed, destructive, and untested; it is not a performance workload | Current owner: audited Plite/root script surfaces; bounded absence of a global regex codemod. Evidence: `package.json:30-50`; `packages/plite/package.json:56-63`. Shape/lifecycle: The cited declared scripts are owner-scoped lint, typecheck, build, and proof workflows; they declare no `mass-change` equivalent. Score basis: strong safety/ownership in the bounded owner surfaces; absence outside those surfaces is not claimed | `5/5/5/5/5/5/5/4=39` — strong safety/ownership in the bounded owner surfaces; absence outside those surfaces is not claimed | Current owner: audited Plate table package scripts; bounded absence of a global regex codemod. Evidence: `packages/table/package.json:31-40`. Shape/lifecycle: The cited package scripts are scoped lint/build/test/typecheck workflows and declare no donor-equivalent destructive helper. Score basis: strong safety/ownership in the bounded product owner; repository-wide absence is not claimed | `5/5/5/5/5/5/5/4=39` — strong safety/ownership in the bounded product owner; repository-wide absence is not claimed | `5/5/5/5/5/5/5/4=39` — The bounded root, Plite, and table-package audit proves scoped owner workflows but does not prove repository-wide tooling absence, so the combined score remains 39. | superior | Require every accepted migration codemod to be syntax-aware, dry-run capable, target-bounded, idempotence-tested, owner-scoped, and deleted at its packet gate. Target basis: an explicit repository policy and per-migration proof close the one-point bounded-audit gap without claiming global current absence | Repository tooling owner for the specific migration | Owning Plite Plan or Plate Plan packet | No execution packet; evidence-backed gate/keep. | A concrete accepted migration with exact file and AST scope. | None; no META packet. | `5/5/5/5/5/5/5/5=40` — an explicit repository policy and per-migration proof close the one-point bounded-audit gap without claiming global current absence | +1 | Surpass | Gate | No adoption of `mass-change`; a future accepted migration may add a temporary private AST codemod with dry-run proof. | Delete no current tooling; temporary codemod deletion is mandatory in its owning migration packet after adoption. | Dry-run diff, syntax parse, bounded target list, idempotence, fixture tests, and post-rewrite type/lint/test gates. | A broad regex can corrupt unrelated code; blast radius is every package and test file. Stop before writes unless targets are explicit, and roll back the owning migration as one unit. Reversal evidence: permit a regex rewrite only when bounded fixtures prove syntax-equivalent matches, dry-run output, idempotence, an explicit target list, and deletion at the owning packet gate. |

VIEW-025 bounded Plite absence audit: `rg -n '\b(PlitePanel|PliteDialog|PliteMenu|PanelFacet|DialogEffect|MenuBar|Menubar)\b' packages/plite/src packages/plite-react/src content/docs/plite` returned zero matches (ripgrep exit 1). The scope covers Plite core, Plite React, and current Plite public docs; it supports absence of a generic panel/dialog/menu API, not absence of lower-level anchors, widgets, or React composition.

| ID | Mechanism | Wordgard shape and evidence | Wordgard score | Current Plite shape and evidence | Plite score | Current Plate shape and evidence | Plate score | Current combined score | Comparison | Proposed shape | Target owner | Decision owner | Execution skill | Dependencies | Dependent packets | Target score | Gain | Reference disposition | Local verdict | Adoption | Deletion | Proof | Risk |
|----|-----------|-----------------------------|----------------|-----------------------------------|-------------|-----------------------------------|-------------|------------------------|------------|----------------|--------------|----------------|-----------------|--------------|-------------------|--------------|------|-----------------------|---------------|----------|----------|-------|------|
| VIEW-001 | Editor/view host lifecycle | Current owner: Wordgard editor. One imperative owner constructs root/content/live-region DOM, connects input/observer/plugins/Tile, dispatches immediately, then flushes; plugin failure deactivates the instance. Evidence: `../wordgard/src/editor/editor.ts:108-182`, `../wordgard/src/editor/editor.ts:892-985`, `../wordgard/src/editor/editor.ts:1051-1132`. | `4/3/3/3/4/2/3/3 = 62.5`; reason: coherent single-root lifecycle, but weak host separation and thin proof. | Current owner: split between `@platejs/plite-dom` and `@platejs/plite-react`. `dom()` installs API/commit hooks with rollback cleanup, while `EditableDOMRuntime` owns scheduler, observer, input, repair, and root state. Evidence: `packages/plite-dom/src/plugin/with-dom.ts:109-224`, `packages/plite-react/src/editable/editable-dom-runtime.ts:212-380`. | `4/4/5/4/4/5/3/4 = 82.5`; reason: typed cleanup and host fitness are strong, but split lifecycle ownership hurts coherence. | Current owner: Plate core is a consumer, not an independent lifecycle owner. It builds `<Editable>` and product wrappers/effects. Evidence: `packages/core/src/react/components/PlateContent.tsx:92-185`; bounded audit found no Plate lifecycle kernel. | `3/4/4/3/4/4/4/3 = 72.5`; reason: product composition is sound, but lifecycle semantics correctly remain delegated. | `4/4/5/4/5/5/4/4 = 87.5`; reason: Plite supplies the generic runtime and Plate composes it, with one remaining owner split. | superior — but less locally coherent. | One `DOMRootRuntime` per root with states detached, mounting, active, replacing, destroying, destroyed; React supplies commit fences and bindings only. | `@platejs/plite-dom`; React adapter in `@platejs/plite-react` | Plite Plan | `plite-plan` | VIEW-003, VIEW-004, VIEW-013 | PV-02, PV-03, PV-06, PV-07 | `5/5/5/5/5/5/5/5 = 100.0`; reason: one typed root owner closes lifecycle, ownership, and proof gaps. | `+12.5` | Surpass | Rearchitect | PV-01 moves generic lifecycle/observer ownership; Plate callers keep `<PlateContent>`. History, Yjs, and codecs are unaffected because commit/value law does not change. | PV-01 deletes duplicate root lifecycle ownership and React-owned generic observer wiring after parity. | `packages/plite-react/test/editable-dom-runtime-contract.test.tsx:1-848`; root replacement/destruction, queued work, rollback, and multi-root browser proof. Benchmark N/A: lifecycle is event-bound. | Critical root regression; rollback PV-01 before dependents. Reverse only if extraction demonstrably requires React semantics. |
| VIEW-002 | Commit publication and view-state invalidation | Current owner: Wordgard editor `ViewState`. It keeps current/flushed state, pending transactions, geometry cache, and mapped targets; dispatch updates state before DOM flush. Evidence: `../wordgard/src/editor/viewstate.ts:45-119`, `../wordgard/src/editor/editor.ts:165-305`. | `4/3/3/4/3/3/3/2 = 62.5`; reason: coherent single-root publication, but duplicate current/flushed truth and weak proof reduce safety. | Current owner: Plite React provider/runtime invalidation. Commits publish in version order, schema invalidation resolves runtime IDs, and live reads prefer transaction state. Evidence: `packages/plite-react/src/components/plite.tsx:153-216`, `packages/plite-react/src/editable/schema-runtime-invalidation.ts:10-55`, `packages/plite-react/src/editable/runtime-live-state.ts:17-83`. | `5/4/5/5/4/5/3/4 = 87.5`; reason: canonical versioned truth is strong, while ownership remains distributed. | Current owner: Plate core consumer. `PlateContent` consumes canonical editor revisions and creates no competing view state. Evidence: `packages/core/src/react/components/PlateContent.tsx:92-122`. | `4/4/4/4/4/4/3/4 = 77.5`; reason: correct consumer boundary, but no independent substrate score is warranted. | `5/4/5/5/5/5/4/4 = 92.5`; reason: canonical publication is complete across layers; only local DX and render-plan proof remain. | superior | Keep version-ordered publication and runtime-ID invalidation; expose no second flushed-state model. | Plite core and `@platejs/plite-react` | Plite Plan | No execution packet | VIEW-001 | PV-07 publication/invalidation proof; C10 is independent preview cleanup. | `5/5/5/5/5/5/4/5 = 97.5`; reason: focused invalidation proof closes composition/proof without a second render plan. | `+5.0`. | Surpass | Keep | Existing Plite and Plate callers remain unchanged. | None; a new state layer would duplicate canonical commit truth. | Existing provider/runtime selector/schema-invalidation contracts plus PV-07 publication-order and runtime-ID rows. | Wordgard is locally shorter because it has one root. Stop if proof exposes stale snapshots; do not answer with a second render plan. |
| VIEW-003 | DOM phase scheduler | Current owner: Wordgard editor queues. Two function queues dedupe by function identity; flush loops at most five times and warns. Evidence: `../wordgard/src/editor/editor.ts:185-235`, `../wordgard/src/editor/editor.ts:354-370`. | `3/2/2/3/2/3/3/1 = 47.5`; reason: useful batching, but untyped phases, identity keys, and sparse proof are weak. | Current owner: `@platejs/plite-dom`. Typed model, DOM-read, DOM-write, and selection-repair phases have timings, keys, cancellation, diagnostics, a pass cap, and per-root registration. Evidence: `packages/plite-dom/src/plugin/dom-phase-scheduler.ts:9-48`, `packages/plite-dom/src/plugin/dom-phase-scheduler.ts:59-117`, `packages/plite-dom/src/plugin/dom-phase-scheduler.ts:122-180`. | `5/5/5/5/5/5/4/5 = 97.5`; reason: phase law and proof are complete; only naming/discoverability trails perfect. | Current owner: absent in Plate by bounded audit; Plate is a scheduler consumer through `<Editable>`. Evidence: `packages/core/src/react/components/PlateContent.tsx:122-185`. | `0/0/0/0/0/0/0/0 = 0.0`; reason: Plate correctly has no independent scheduler implementation. | `5/5/5/5/5/5/4/5 = 97.5`; reason: the Plite owner fully supplies this law without Plate duplication. | superior | Keep the scheduler unchanged; `DOMRootRuntime` receives it instead of reimplementing queues. | `@platejs/plite-dom` | Plite Plan | No execution packet | VIEW-001 | PV-01, PV-03, PV-06 | `5/5/5/5/5/5/5/5 = 100.0`; reason: lifecycle integration makes the owner fully discoverable without changing scheduler law. | `+2.5` | Surpass | Keep | PV-01 reuses the installed scheduler API. | Delete nothing; the scheduler remains canonical. | `packages/plite-dom/test/dom-phase-scheduler.test.ts:1-327`; property rows cover ordering, key replacement, and limits. Browser/benchmark N/A: deterministic unit law is authoritative. | Reverse only if per-root registration cannot survive lifecycle extraction; never replace it with Wordgard queues. |
| VIEW-004 | DOM observation, mutation ownership, integrity repair | Current owner: Wordgard editor `DOMObserver`. It tracks attributes, text, children, selection, scroll, resize, and dark mode, then maps mutations to dirty Tile sections. Evidence: `../wordgard/src/editor/domobserver.ts:8-244`. | `4/3/3/4/4/3/3/3 = 67.5`; reason: broad lifecycle coverage, but mutation authority and repair proof are implicit. | Current owner: `@platejs/plite-react`. The observer declares owners/evidence/diagnostics, filters nested and noneditable DOM, snapshots selection, reverses unauthorized changes, pauses for host commits, and caps repair. Evidence: `packages/plite-react/src/editable/dom-integrity-observer.ts:1-46`, `packages/plite-react/src/editable/dom-integrity-observer.ts:54-215`, `packages/plite-react/src/editable/dom-integrity-observer.ts:217-270`. | `5/4/5/5/5/5/3/5 = 92.5`; reason: semantics and proof are excellent, but generic policy sits in the React package. | Current owner: absent in Plate by bounded audit; Plate supplies product renderers only. Evidence: `packages/core/src/react/components/PlateContent.tsx:122-185`. | `1/2/2/2/2/2/3/3 = 42.5`; reason: Plate has consumer integration but intentionally no mutation-repair kernel. | `5/4/5/5/5/5/4/5 = 95.0`; reason: behavior is complete across layers; package ownership is the residual flaw. | superior — semantics and proof; wrong package owner. | Put the pure observer/repair kernel in `DOMRootRuntime`; React calls only host-commit fences. | `@platejs/plite-dom`; adapter `@platejs/plite-react` | Plite Plan | `plite-plan` | VIEW-001, VIEW-003, VIEW-005, VIEW-010 | PV-02, PV-03, PV-07 | `5/5/5/5/5/5/5/5 = 100.0`; reason: pure ownership plus retained parity proof closes composition and DX. | `+5.0` | Surpass | Move | PV-01 moves pure policy; React/Plate renderers retain mutation evidence. | Delete generic observer/repair ownership from `plite-react` and duplicate root glue after parity. | `packages/plite-react/test/dom-integrity-observer-contract.test.ts:1-433`; `apps/plite/tests/plite-browser/donor/examples/dom-integrity.test.ts:1-96`; generated authorized/unauthorized permutations. | High selection-loss risk; rollback PV-01 atomically. Reverse only if a rule needs React fiber state beyond host-commit fences. |
| VIEW-005 | Model-to-DOM identity and mapping | Current owner: Wordgard editor Tile/DOM helpers. Numeric positions route through a Tile tree and `.wgTile` expando to resolve DOM/model boundaries. Evidence: `../wordgard/src/editor/dom.ts:3-86`, `../wordgard/src/editor/tile.ts:34-151`, `../wordgard/src/editor/tile.ts:302-535`. | `4/4/3/4/4/2/3/4 = 70.0`; reason: mapping is coherent but single-root numeric identity and expandos limit host fitness. | Current owner: `@platejs/plite-dom`. Root-aware `DOMApi` exposes typed node, point, range, event, and rect resolution; roots are keyed and a frozen capability delegates mappings. Evidence: `packages/plite-dom/src/plugin/dom-editor.ts:107-170`, `packages/plite-dom/src/plugin/dom-editor.ts:775-843`, `packages/plite-dom/src/plugin/dom-editor.ts:2148-2234`. | `5/5/5/5/5/5/4/5 = 97.5`; reason: typed multi-root identity and proof are complete; API breadth slightly hurts DX. | Current owner: absent in Plate by bounded audit; Plate consumes the installed DOM API, including focus. Evidence: `packages/core/src/react/components/PlateContent.tsx:191-215`. | `2/3/3/2/3/3/3/3 = 55.0`; reason: consumer integration exists, but Plate has no independent mapping law. | `5/5/5/5/5/5/4/5 = 97.5`; reason: Plite fully owns identity while Plate correctly delegates it. | superior | Keep root keys, runtime IDs, and weak-map identity; PV-06 may organize geometry calls but cannot replace identity. | `@platejs/plite-dom` | Plite Plan | No execution packet | VIEW-001, VIEW-022 | PV-01, PV-06 | `5/5/5/5/5/5/5/5 = 100.0`; reason: the facade closes discoverability without altering proven identity. | `+2.5` | Surpass | Keep | `editor.api.dom` remains canonical. | Reject Wordgard expando, numeric view identity, and global scratch range; no current deletion. | `packages/plite-react/test/selection-controller-contract.ts:1-1875`; `apps/plite/tests/plite-browser/donor/examples/dom-coverage-boundaries.test.ts:1-352`. | Reverse only if round-trip tests find an unsupported mapping class; Wordgard remains unacceptable for multi-root. |
| VIEW-006 | DOM selection import/export/reconciliation | Current owner: Wordgard editor selection/Tile. It reads and writes DOM selection with pending mapping and bias; Tile resolves endpoints. Evidence: `../wordgard/src/editor/selection.ts:6-35`, `../wordgard/src/editor/tile.ts:406-535`. | `4/4/3/4/4/3/3/4 = 72.5`; reason: solid single-root mapping, but projection, root locality, and proof are limited. | Current owner: `@platejs/plite-react`, backed by Plite DOM mapping. The controller projects content-root selections, imports targets, exports with scheduler/coverage guards, and handles shadow quirks. Evidence: `packages/plite-react/src/editable/selection-controller.ts:74-180`, `packages/plite-react/src/editable/selection-controller.ts:858-920`, `packages/plite-react/src/editable/selection-controller.ts:1300-1360`, `packages/plite-react/src/editable/selection-reconciler.ts:907-963`. | `5/5/5/5/5/5/3/5 = 95.0`; reason: behavior/proof are excellent, while reconciliation ownership remains spread across files/layers. | Current owner: absent in Plate by bounded audit; Plate passes product handlers/props through `<Editable>`. Evidence: `packages/core/src/react/components/PlateContent.tsx:107-122`. | `3/3/3/3/3/4/3/4 = 65.0`; reason: correct consumer boundary, with no separate selection kernel to score. | `5/5/5/5/5/5/4/5 = 97.5`; reason: Plite provides the complete multi-root law and Plate does not duplicate it. | superior | Keep algorithms; PV-06 exposes cohesive geometry/mapping without merging selection state machines. | `@platejs/plite-dom` plus private `@platejs/plite-react` reconciliation | Plite Plan | No execution packet | VIEW-004, VIEW-005, VIEW-007, VIEW-022 | PV-03, PV-06 | `5/5/5/5/5/5/5/5 = 100.0`; reason: facade ownership closes navigation/DX while preserving all laws. | `+2.5` | Surpass | Keep | Packet internals call the same controller; no public migration. | Delete nothing; mapping and reconciliation remain canonical. | `packages/plite-react/test/selection-controller-contract.ts:1-1875`; `apps/plite/tests/plite-browser/donor/examples/shadow-dom.test.ts:1-362`; native-selection browser proof. | Reverse only on a concrete selection-law regression; Wordgard is simpler because it omits projection and multiple roots. |
| VIEW-007 | Geometry, coordinates, movement, and scrolling | Wordgard exposes compact single-root coordinate/movement helpers (`../wordgard/src/editor/coords.ts:7-62`, `../wordgard/src/editor/selection.ts:39-148`). | `4/3/3/4/3/3/3/4 = 67.5`. | Plite DOM already exposes flat intent methods while private React caret adapters own rendered-boundary movement (`packages/plite-dom/src/plugin/dom-editor.ts:107-170`, `packages/plite-react/src/editable/caret-engine.ts:640-742`). | `5/4/5/5/4/5/3/5 = 90.0`. | Plate floating consumes the flat range API and owns only product policy (`packages/floating/src/hooks/useFloatingToolbar.ts:20-84`, `packages/floating/src/hooks/useFloatingToolbar.ts:165-193`). | `2/2/3/2/2/3/3/3 = 50.0`. | `5/4/5/5/5/5/4/5 = 95.0`. | superior — current behavior and call sites already beat Wordgard. | Keep flat methods on `editor.api.dom`; specialized caret/coverage adapters remain private. Reject a geometry namespace and caller migration. | Existing `@platejs/plite-dom` API. | Plite Plan. | No execution; PV-06 records the decision. | Current mapping/caret contracts. | None. | `5/4/5/5/5/5/4/5 = 95.0`. | `+0`. | Surpass | Keep | None. | None; prohibit facade wrappers. | Existing geometry contracts and representative callers are sufficient for the keep decision. | Future regrouping must prove a deleted responsibility and better real call site. |
| VIEW-008 | Event dispatch, precedence, target ownership | Current owner: Wordgard editor `InputState`. Event observers precede handlers; facet listeners and keyboard, mouse, clipboard, and input handlers share target state. Evidence: `../wordgard/src/editor/input.ts:17-225`, `../wordgard/src/editor/input.ts:573-842`. | `4/3/3/4/4/3/3/3 = 67.5`; reason: precedence is coherent, but types, ownership outcomes, and proof are limited. | Current owner: `@platejs/plite-react` editing kernel. Typed event families, kernel states, target owners, outcomes, selection policy, and traces define decisions. Evidence: `packages/plite-react/src/editable/editing-kernel.ts:48-107`, `packages/plite-react/src/editable/editing-kernel.ts:1174-1277`, `packages/plite-react/src/editable/editing-kernel.ts:1279-1326`. | `5/4/5/5/5/5/2/5 = 90.0`; reason: behavior and proof are strong, but generic event law is React-owned and hard to navigate. | Current owner: Plate core is a product-handler consumer. It composes DOM handlers into Editable props and has no generic kernel. Evidence: `packages/core/src/react/components/PlateContent.tsx:107-122`; bounded audit found no Plate input runtime. | `4/4/5/4/4/4/4/4 = 82.5`; reason: typed product composition is strong, while generic runtime properly remains delegated. | `5/5/5/5/5/5/3/5 = 95.0`; reason: end-to-end semantics are excellent; generic owner placement is the remaining defect. | superior — semantics/proof; generic law is React-owned. | Pure `DOMInputRuntime` owns frames and decisions; React translates synthetic events; Plate registers product handlers. | `@platejs/plite-dom`; adapters in Plite React and Plate | Plite Plan then Plate Plan | `plite-plan → plate-plan` | VIEW-001, VIEW-004, VIEW-009, VIEW-010 | PT-01, PT-02, PV-07 | `5/5/5/5/5/5/5/5 = 100.0`; reason: pure ownership and adapter parity close composition and DX gaps. | `+5.0` | Surpass | Move | PV-03 moves pure classifiers/state; React and Plate adapters preserve precedence. | Delete duplicate React-owned decision types after adapter migration. | `packages/plite-react/test/editing-kernel-contract.ts:1-1184`; generated event-order traces; focused browser IME, keyboard, and clipboard rows. | Critical event-order risk; rollback PV-03. Reverse only if decisions require React lifecycle beyond normalized input. |
| VIEW-009 | Semantic input intents and command dispatch | Current owner: Wordgard editor input. `beforeinput` directly maps history, insertion, deletion, formatting, alignment, and product commands. Evidence: `../wordgard/src/editor/input.ts:545-571`, `../wordgard/src/editor/input.ts:694-842`. | `3/3/2/4/4/3/2/3 = 60.0`; reason: direct behavior works, but DOM law and product policy are entangled. | Current owner: `@platejs/plite-react` editing kernel. Typed commands still include product format, block, and mark variants plus built-in bold/italic mapping. Evidence: `packages/plite-react/src/editable/editing-kernel.ts:101-186`, `packages/plite-react/src/editable/editing-kernel.ts:913-983`, `packages/plite-react/src/editable/editing-kernel.ts:998-1028`. | `4/4/5/5/5/5/2/5 = 87.5`; reason: typed runtime is mature, but product leakage depresses ownership and DX. | Current owner: Plate core product command middleware and shortcut compiler. Input rules and compiled routes already own schema/plugin behavior. Evidence: `packages/core/src/lib/plugins/input-rules/internal/InputRulesPlugin.ts:182-278`, `packages/core/src/internal/plugin/resolvePlugins.ts:791-921`. | `4/4/5/4/4/4/4/4 = 82.5`; reason: product ownership is correct, though dispatcher integration is not yet singular. | `5/5/5/5/5/5/3/5 = 95.0`; reason: generic and product capabilities exist; their boundary is still leaky. | superior — typing, same ownership leak. | Plite emits generic host-command intents by input type; Plate maps formatting, marks, and blocks through plugin commands. | `@platejs/plite-dom` intent kernel; `@platejs/core` product mappings | Plite Plan then Plate Plan | `plite-plan → plate-plan` | VIEW-008, VIEW-014, VIEW-015 | PV-03, PT-01, PT-02, PV-07 | `5/5/5/5/5/5/5/5 = 100.0`; reason: one generic dispatch boundary and Plate-owned product commands close ownership and proof. | `+5.0` | Surpass | Rearchitect | PV-03 introduces generic intent; PT-01 adopts host commands/shortcuts; PT-02 proves rule dispatch. | Delete Plite format/block/mark variants and built-in bold/italic mappings after PT-01. | Editing-kernel contract, Plate shortcut/input-rule specs, Markdown shortcuts, and IME exact-once command law. | Critical product behavior risk; rollback PT-01 then PV-03. Reverse only for a command proven universal DOM law. Reference scope: Surpass generic dispatch; reject product leakage. |
| VIEW-010 | IME/composition ownership and duplicate suppression | Current owner: Wordgard editor input/Tile. Safari-aware composition state reuses DOM targets and isolates composition; widget/Android cases remain unresolved. Evidence: `../wordgard/src/editor/input.ts:138-188`, `../wordgard/src/editor/input.ts:468-543`, `../wordgard/src/editor/tile.ts:859-897`, `../wordgard/src/editor/tile.ts:1160-1187`. | `4/4/2/4/4/3/3/3 = 67.5`; reason: useful platform handling, but weak typing and unresolved edge cases limit confidence. | Current owner: split across `@platejs/plite-react` composition state and runtime events. Sessions use global environment flags, mutation traces, and a final input-rule callback. Evidence: `packages/plite-react/src/editable/composition-state.ts:1-49`, `packages/plite-react/src/editable/runtime-composition-events.ts:18-179`, `packages/plite-react/src/editable/runtime-before-input-events.ts:242-290`. | `5/5/5/5/5/5/2/5 = 92.5`; reason: behavior/proof are deep, but state and product callback ownership are fragmented. | Current owner: Plate input rules consume the text-command bridge; no independent IME kernel exists. Evidence: `packages/core/src/lib/plugins/input-rules/internal/InputRulesPlugin.ts:221-278`; bounded audit found no Plate composition state machine. | `2/3/3/2/3/3/3/4 = 57.5`; reason: product rule integration exists, but generic IME semantics correctly remain below Plate. | `5/5/5/5/5/5/3/5 = 95.0`; reason: proven behavior is strong; consolidated ownership and exact-once boundary remain. | superior — behavior/proof; state is fragmented. | One per-root epoch machine with idle, native-composing, model-composing, final-input-ready, committing, repairing, and settled states. | `@platejs/plite-dom`; React adapter; Plate rule bridge | Plite Plan then Plate Plan | `plite-plan → plate-plan` | VIEW-003, VIEW-004, VIEW-008, VIEW-009, VIEW-013 | PT-02, PV-07 | `5/5/5/5/5/5/4/5 = 97.5`; reason: one state owner and exact-once proof close fragmentation; public DX intentionally remains internal. | `+2.5` | Surpass | Rearchitect | PV-03 consolidates pure state; PT-02 routes one final text command through Plate middleware. | Delete derivable duplicate flags and direct callback bridge after PT-02; retain platform adapters. | `packages/plite-react/test/composition-state-contract.test.ts:1-2003`; `packages/browser/test/core/playwright-ime.test.ts:1-548`; generated order permutations; raw-device proof required for device claims. | Critical double-commit/history risk; rollback PT-02 then PV-03. Reverse only if generated traces prove two lifecycles necessary. |
| VIEW-011 | Mouse selection, drag/drop, auto-scroll | Current owner: Wordgard editor input/drop-cursor. Mouse selection, auto-scroll, drag policy, and mapped drop position share `InputState`. Evidence: `../wordgard/src/editor/input.ts:230-428`, `../wordgard/src/editor/dropcursor.ts:17-84`. | `4/3/3/4/4/3/3/3 = 67.5`; reason: coherent state, but single-root coupling and sparse proof constrain reuse. | Current owner: `@platejs/plite-react` root interaction hooks. Root-scoped mouse/drag handlers and explicit auto-scroll target selection separate mechanics. Evidence: `packages/plite-react/src/editable/runtime-focus-mouse-events.ts:30-361`, `packages/plite-react/src/editable/runtime-drag-events.ts:19-166`, `packages/plite-react/src/editable/drag-auto-scroll-target.ts:34-187`. | `5/4/5/5/5/5/3/5 = 92.5`; reason: root-safe runtime/proof are strong; ownership is spread across hooks. | Current owner: Plate core/apps own visual DnD through render slots; generic interaction stays Plite. Evidence: `packages/core/src/react/components/PlateContent.tsx:124-185`. | `3/4/4/3/3/4/4/4 = 72.5`; reason: product composition is correct, but this is consumer/presentation ownership only. | `5/5/5/5/5/5/4/5 = 97.5`; reason: generic interaction and product visuals compose cleanly with proven multi-root behavior. | superior | Keep root-scoped interaction control and Plate visual ownership. | Plite React interaction; Plate/apps visuals | Plite Plan | No execution packet | VIEW-006, VIEW-007, VIEW-022 | PT-03 uses geometry only | `5/5/5/5/5/5/4/5 = 97.5`; reason: current architecture already meets the justified target. | `+0.0` | Surpass | Keep | No migration. | Delete nothing; root-scoped interaction remains canonical. | Existing root-interaction/drag contracts and multi-root/coverage browser rows. Benchmark N/A: correctness dominates; huge-document drag covers runtime. | Reverse only if cross-root drag proof fails; Wordgard is merely narrower. |
| VIEW-012 | Clipboard transport and host codecs | Current owner: Wordgard editor clipboard. Facets filter input/output and own open-slice metadata, parsing, table wrappers, Trusted Types, and WebKit spaces. Evidence: `../wordgard/src/editor/clipboard.ts:5-167`. | `4/4/3/4/3/3/3/4 = 70.0`; reason: broad codec behavior, but transport and schema policy are coupled. | Current owner: `@platejs/plite-dom` clipboard runtime/host codecs. Typed payload read/write/insert and phased schema-target registration separate transport from host policy. Evidence: `packages/plite-dom/src/plugin/dom-clipboard-runtime.ts:117-214`, `packages/plite-dom/src/plugin/dom-clipboard-runtime.ts:310-322`, `packages/plite-dom/src/plugin/dom-clipboard-runtime.ts:492-543`, `packages/plite-dom/src/plugin/host-codec.ts:36-112`, `packages/plite-dom/src/plugin/host-codec.ts:532-735`. | `5/5/5/5/5/5/4/5 = 97.5`; reason: transport law, typing, lifecycle, and proof are complete; API breadth costs one DX point. | Current owner: `@platejs/core` DOM plugin. Plate compiles schema/product parser behavior over host codecs. Evidence: `packages/core/src/lib/plugins/dom/DOMPlugin.ts:1-242`. | `5/5/5/4/4/4/5/5 = 92.5`; reason: product ownership and proof are strong; lifecycle/runtime are delegated to Plite. | `5/5/5/5/5/5/5/5 = 100.0`; reason: transport and application policy already have complete, non-duplicated owners. | superior | Keep the codec protocol and Plate schema adapters. | `@platejs/plite-dom` transport; `@platejs/core` application codecs | Plite Plan then Plate Plan | No execution packet | VIEW-005, VIEW-008, VIEW-022 | No dependent packet; current codec proof closes locally. | `5/5/5/5/5/5/5/5 = 100.0`; reason: current combined ownership already meets target. | `+0.0` | Surpass | Keep | No migration. | Delete nothing; the codec protocol remains canonical. | `packages/plite-dom/test/host-codec.test.ts:1-1008`; `apps/plite/tests/plite-browser/donor/examples/paste-html.test.ts:1-2267`. | Reverse only if open-context round-trip proof fails; never transplant Wordgard facets wholesale. |
| VIEW-013 | Browser realm facts and quirks | Wordgard derives UA/version flags at import time from global navigator/document (`../wordgard/src/editor/browser.ts:1-27`). | `2/2/2/3/2/1/2/1 = 37.5`. | Plite DOM exports import-time flags and React also reads globals directly (`packages/plite-dom/src/utils/environment.ts:1-69`, `packages/plite-react/src/plugin/with-react.ts:122-130`). | `3/3/4/4/3/2/2/4 = 62.5`. | Plate hotkeys and mark affinity consume process-global facts (`packages/core/src/lib/utils/hotkeys.ts:57-73`, `packages/core/src/lib/plugins/affinity/queries/getMarkBoundaryAffinity.ts:56-61`). | `1/1/2/1/1/1/2/2 = 27.5`. | `4/3/4/4/3/3/3/4 = 70.0`. | superior only in guards/proof; both current global shapes are wrong for multiple realms. | Resolve frozen semantic facts privately per mounted root; tests inject private overrides and Plate receives only the specific fact needed. Remove realm-wrong exports and publish no capability/profile API. | Private mounted-root runtime in `@platejs/plite-dom`. | Plite Plan. | `plite-plan` PV-02. | VIEW-001, VIEW-005, VIEW-008, VIEW-010. | PV-03 and PV-07. | `5/5/5/5/5/5/4/5 = 97.5`. | `+27.5`. | Reject | Rearchitect | Plite DOM/React internals and two Plate consumers only; application product APIs stay unchanged. | Delete authoritative import-time UA flags/direct global reads; reject exported fact/profile types and `editor.api.dom.capabilities`. | SSR import, two-window/iframe/shadow, private override, hotkey, affinity, IME, and language proof. | Wrong-realm facts break input/selection; stop on public profile leakage or cross-realm divergence. |
| VIEW-014 | Keymap compilation and shortcut routing | Current owner: Wordgard editor keymap. Typed bindings include platform, scope, default behavior, a cached ordered map, AltGraph fallback, and default commands. Evidence: `../wordgard/src/editor/keymap.ts:44-118`, `../wordgard/src/editor/keymap.ts:240-365`. | `4/4/3/4/4/3/4/2 = 70.0`; reason: compile-once routing is clean, but product defaults and limited proof weaken separation. | Current owner: `@platejs/plite-dom` hotkey utilities. A generic matcher is mixed with hard-coded product/default predicates including bold and italic. Evidence: `packages/plite-dom/src/utils/hotkeys.ts:15-80`, `packages/plite-dom/src/utils/hotkeys.ts:86-117`. | `3/2/4/3/3/4/2/4 = 62.5`; reason: matching/tests are useful, but product leakage and no compiled lifecycle hurt architecture. | Current owner: Plate core shortcut compiler and React effects. Routes/conflicts/priorities compile centrally, but one effect renders per shortcut. Evidence: `packages/core/src/internal/plugin/resolvePlugins.ts:791-921`, `packages/core/src/react/components/EditorHotkeysEffect.tsx:11-93`. | `4/4/5/3/3/4/3/4 = 75.0`; reason: types/semantics are strong, while runtime fanout and owner navigation remain weak. | `4/4/5/4/4/4/3/4 = 80.0`; reason: combined matcher/compiler is capable, but duplicate effects and product defaults remain. | superior — typing; Wordgard compile-once runtime is cleaner. | Keep the generic matcher in Plite; Plate compiles all active shortcuts into one root dispatcher ordered by scope, priority, plugin, and declaration. | `@platejs/plite-dom` matcher; `@platejs/core` dispatcher | Plate Plan | `plate-plan` | VIEW-008, VIEW-009, VIEW-013 | PV-07 shortcut closure | `5/5/5/5/5/5/5/5 = 100.0`; reason: one dispatcher plus product-owned declarations closes every current gap. | `+20.0` | Adopt | Rearchitect | PT-01 migrates `EditorHotkeysEffect` consumers without changing declarations. | Delete effect fanout and Plite product predicates after one-dispatcher proof. | `packages/plite-dom/test/hotkeys.ts:1-339`; `packages/core/src/internal/plugin/resolvePlugins.spec.tsx:1-1219`; AltGraph, layout, conflict, and reconfiguration browser proof. | High preventDefault/priority risk; rollback PT-01. Reverse only if one dispatcher cannot preserve ordering. Reference scope: Adopt compile-once shape; reject defaults. |
| VIEW-015 | Input-rule declaration, compilation, application | Current owner: Wordgard editor input-rule module. Facets, regex/apply helpers, schema/history builders, appended-transaction scanning, and first-match execution are one feature. Evidence: `../wordgard/src/editor/inputrule.ts:6-35`, `../wordgard/src/editor/inputrule.ts:45-93`, `../wordgard/src/editor/inputrule.ts:96-213`. | `4/4/3/4/4/3/4/2 = 70.0`; reason: coherent rule ergonomics, but substrate/product coupling and limited proof remain. | Current owner: `@platejs/plite-react` callback plumbing only. The root installs a callback returning false; Plite owns no declaration/compiler. Evidence: `packages/plite-react/src/editable/runtime-root-engine.ts:180-216`. | `1/1/2/1/1/1/1/2 = 25.0`; reason: this is a thin bridge, not a rule system, and it duplicates command routing. | Current owner: `@platejs/core` input-rule types, compiler, and middleware. Inferred contexts/builders, priority indexes, and command middleware are complete. Evidence: `packages/core/src/lib/plugins/input-rules/types.ts:14-180`, `packages/core/src/lib/plugins/input-rules/types.ts:289-342`, `packages/core/src/internal/plugin/resolvePlugins.ts:924-1000`, `packages/core/src/lib/plugins/input-rules/internal/InputRulesPlugin.ts:137-278`. | `5/5/5/5/5/5/5/5 = 100.0`; reason: Plate already fully owns declaration, compilation, application, lifecycle, DX, and proof. | `5/5/5/5/5/5/5/5 = 100.0`; reason: Plate's complete owner dominates the combined product behavior; Plite needs only generic command transport. | superior | Keep Plate API; all Plite model-owned text commits dispatch one canonical insert command, then remove the callback route. | `@platejs/core`; generic command path in Plite | Plite Plan then Plate Plan | `plite-plan → plate-plan` | VIEW-009, VIEW-010 | PV-07 IME closure | `5/5/5/5/5/5/5/5 = 100.0`; reason: current product law is already perfect; target only removes duplicate plumbing. | `+0.0` | Surpass | Keep | PT-02 adopts the canonical IME command path; declarations stay unchanged. | Delete `ApplyInputRules` callback type/plumbing and false root callback after exact-once proof. | `packages/core/src/react/utils/inputRules.spec.tsx:1-670`; `apps/plite/tests/plite-browser/donor/examples/markdown-shortcuts.test.ts:1-521`; IME plus undo integration. | Critical double-rule/undo risk; rollback PT-02. Reverse deletion only for a non-command source proven to need the callback. |
| VIEW-016 | React render tree, identity, and reconciliation | Wordgard's Tile hierarchy owns imperative DOM identity/reuse (`../wordgard/src/editor/tile.ts:13-193`, `../wordgard/src/editor/tile.ts:673-1118`). | `5/5/3/5/5/2/4/4 = 82.5`. | Plite React already renders by runtime ID with memoized groups and strong host proof (`packages/plite-react/src/components/editable-text-blocks.tsx:547-713`, `packages/plite-react/src/components/editable-text-blocks.tsx:960-1063`). | `5/4/5/5/5/5/3/5 = 92.5`. | Plate correctly supplies wrappers/render slots and delegates rendering to `Editable` (`packages/core/src/react/plugin/PlatePlugin.ts:362-410`, `packages/core/src/react/components/PlateContent.tsx:107-185`). | `3/4/4/3/4/4/4/4 = 75.0`. | `5/5/5/5/5/5/4/5 = 97.5`. | superior — current React host model is stronger; Wordgard is only more locally compact. | Keep existing runtime-ID rendering, segment plans, render props, and Plate wrapper ownership. Do not add a second compiled root render plan or materialization compiler. | `@platejs/plite-react`; Plate retains product render slots. | Plite Plan and Plate Plan keep boundary. | No execution for VIEW-016; PV-04 may delete only preview classification. | Current render, coverage, and runtime-ID contracts. | PV-07 proof only. | `5/5/5/5/5/5/4/5 = 97.5`. | `+0`. | Surpass | Keep | None. | None; reject duplicate plan assembly and public policy callbacks. | Existing segment-plan/render-profiler/coverage and browser contracts remain authoritative. | Any proposed plan must prove a deleted responsibility and preserve custom rendering/performance. |
| VIEW-017 | Preview-only segment classification | Wordgard Tile subclasses classify actual rendered structure (`../wordgard/src/editor/tile.ts:781-1118`). | `3/3/2/4/3/2/3/3 = 57.5`. | Plite's type-name classifier only writes a preview data attribute; it does not drive materialization or coverage (`packages/plite-react/src/dom-strategy/classify-segment-kind.ts:3-65`, `packages/plite-react/src/dom-strategy/segment-placeholder.tsx:211-231`). | `4/4/4/5/4/5/2/4 = 80.0` — renderer is sound; the diagnostic label lies. | Plate render facts exist but are not consumers of this preview label (`packages/core/src/react/plugin/PlatePlugin.ts:362-410`). | `4/4/5/5/4/5/4/4 = 87.5`. | `5/5/5/5/4/5/4/4 = 92.5`. | superior — local rendering is stronger; only a preview heuristic is defective. | Delete type-name regex classification and the semantic preview attribute; use one neutral private marker only if an exact test/consumer requires it. Add no render plan or public policy callback. | Preview placeholder internals in `@platejs/plite-react`. | Plite Plan. | `plite-plan` PV-04. | Current preview caller audit. | PV-07 focused closure. | `5/5/5/5/5/5/5/5 = 100.0`. | `+7.5`. | Reject | Cut | Only private preview placeholder/tests. | Delete classifier, regexes, caller, and semantic attribute; reject a compiler/policy replacement. | Focused preview markup/a11y plus misleading-name render/coverage equivalence. | If actual render/coverage changes, stop: the caller audit was incomplete and a new decision is required. |
| VIEW-018 | Decoration representation and range mapping | Current owner: Wordgard editor decoration module. Class-based point/range decorations, interval sets, iterators, changed-range comparison, wrappers, and widgets share one representation. Evidence: `../wordgard/src/editor/decoration.ts:10-106`, `../wordgard/src/editor/decoration.ts:380-539`, `../wordgard/src/editor/decoration.ts:567-1079`. | `5/5/4/5/5/2/4/4 = 85.0`; reason: representation/runtime are excellent, but imperative host coupling limits reuse. | Current owner: `@platejs/plite-react` already exposes the intentional three-level API: one-Editable `decorate`, provider-owned decoration sources/hooks, and narrow projected-entry reads; constructors stay private. Evidence: `packages/plite-react/src/index.ts:59-66`, `packages/plite-react/src/index.ts:140-145`, `packages/plite-react/src/index.ts:157-161`, `packages/plite-react/src/components/plite.tsx:240-257`, `packages/plite-react/src/components/editable-text-blocks.tsx:642-690`. | `5/5/5/5/5/5/5/5 = 100.0`; reason: representation, lifecycle, host levels, ownership, and public proof are already complete. | Current owner: Plate core is a decorate/render consumer through `PlateContentProps`. Evidence: `packages/core/src/react/components/PlateContent.tsx:19-26`, `packages/core/src/react/components/PlateContent.tsx:107-122`. | `4/4/5/4/4/4/4/4 = 82.5`; reason: typed product consumption is strong, while generic representation stays delegated. | `5/5/5/5/5/5/5/5 = 100.0`; reason: Plite representation plus Plate product rendering already form a complete stack. | superior | Keep local `Editable.decorate`, provider decoration sources, source hooks, and projected-entry reads; reject a duplicate universal overlay API. | `@platejs/plite-react` | Plite Plan | No execution packet | VIEW-002, VIEW-005, VIEW-019, VIEW-022 | PV-07 surface closure | `5/5/5/5/5/5/5/5 = 100.0`; reason: the current layered API is already the target. | `+0.0` | Surpass | Keep | No migration; Yjs and app examples keep the public decoration-source hooks. | None; PV-05 may clean private naming under VIEW-019 only. | Projection, source-fault, async-decoration IME, multi-root ranges, public-surface, and huge-document metrics. | Low keep risk. Reverse only if a concrete consumer cannot fit local decorate, provider sources, or projected-entry reads. |
| VIEW-019 | Overlay source compilation, invalidation, fault isolation | Current owner: Wordgard editor decoration compiler. It compiles wrappers, compares changed ranges, walks heaps, and reuses nodes. Evidence: `../wordgard/src/editor/decoration.ts:403-441`, `../wordgard/src/editor/decoration.ts:960-1389`. | `4/5/4/5/5/2/4/3 = 80.0`; reason: excellent incremental runtime, but imperative host coupling and proof breadth lag. | Current owner: `@platejs/plite-react`. Full compilation, keyed invalidation, retry, and fault isolation are private; the root exposes typed source handles/readers, while surface tests forbid constructors. One private full-control `PliteProjectionStore` name collides with the narrower public reader interface, and a duplicate private `PliteProjectionEntry` alias exists. Evidence: `packages/plite-react/src/projection-store.ts:39-46`, `packages/plite-react/src/projection-store.ts:138-159`, `packages/plite-react/src/projection-store.ts:528-548`, `packages/plite-react/src/hooks/use-plite-projection-entries.tsx:5-27`, `packages/plite-react/test/surface-contract.tsx:937-959`. | `5/5/5/5/5/5/4/5 = 97.5`; reason: runtime, encapsulation, and public proof are complete; only the private name collision costs DX. | Current owner: Plate core is an adapter consumer. It passes `decorate` and owns no projection constructor/store. Evidence: `packages/core/src/react/components/PlateContent.tsx:19-26`. | `4/4/5/4/4/4/4/4 = 82.5`; reason: product adapter is typed, while compilation correctly stays below Plate. | `5/5/5/5/5/5/5/5 = 100.0`; reason: the public stack and private compilation boundary are already complete. | superior — runtime, encapsulation, and public API; one private name collision remains. | Keep all public APIs and private kernels; rename the private full-control store to `CompiledProjectionStore` and delete the duplicate private entry alias. | `@platejs/plite-react` | Plite Plan | `plite-plan` | VIEW-002, VIEW-018, VIEW-020, VIEW-021 | PV-07 projection closure | `5/5/5/5/5/5/5/5 = 100.0`; reason: private naming cleanup closes local DX without a public or runtime change. | `+0.0` | Surpass | Rename | PV-05 updates only private projection/decoration/annotation/widget imports and tests; Plate, Yjs, apps, docs, and public exports do not adopt anything. | Delete the private full-store name `PliteProjectionStore` and duplicate private `PliteProjectionEntry` alias after internal typecheck; retain `createPliteProjectionStore`, mapped-store kernel, fault boundary, metrics, dirtiness, scope, readers, and all root exports. | `packages/plite-react/test/surface-contract.tsx:937-959`; projection, annotation, widget, mapped-store, fault-boundary contracts, and package typecheck. Browser/benchmark N/A: type/name-only cleanup changes no runtime. | Low type/export drift risk; rollback PV-05 on surface/type failure. Reverse rename only if collision is proven intentional and navigable. |
| VIEW-020 | Widgets, annotations, anchored UI data | Current owner: Wordgard editor decoration/widgets. Imperative widget values have DOM lifecycle and wrapper sources position them. Evidence: `../wordgard/src/editor/decoration.ts:10-104`, `../wordgard/src/editor/decoration.ts:454-539`, `../wordgard/src/editor/decoration.ts:1197-1389`. | `4/4/3/5/5/2/4/3 = 75.0`; reason: capable lifecycle/data model, but imperative DOM ownership limits host fitness. | Current owner: `@platejs/plite-react` intentionally separates annotation identity/projection from hook-owned node/selection widget UI; both reuse private mapped/fault kernels. Evidence: `packages/plite-react/src/annotation-store.ts:277-364`, `packages/plite-react/src/widget-store.ts:208-282`, `packages/plite-react/src/index.ts:188-192`, `packages/plite-react/src/index.ts:225-233`. | `5/5/5/5/5/5/5/5 = 100.0`; reason: identity, anchors, lifecycle, host composition, ownership, and proof are complete. | Current owner: Plate floating owns product toolbar visibility and position. Evidence: `packages/floating/src/hooks/useFloatingToolbar.ts:20-84`, `packages/floating/src/hooks/useFloatingToolbar.ts:86-193`. | `5/5/5/4/4/5/5/4 = 92.5`; reason: product policy and host fitness are excellent; generic lifecycle remains delegated. | `5/5/5/5/5/5/5/5 = 100.0`; reason: annotation/widget primitives and product component policy have complete, non-overlapping owners. | superior | Keep annotation and widget owners distinct, keep public hooks, and reject imperative widget DOM lifecycle. | `@platejs/plite-react`; UI in Plate/apps | Plite Plan then Plate Plan | No execution packet | VIEW-018, VIEW-019, VIEW-026 | PT-03, PV-07 | `5/5/5/5/5/5/5/5 = 100.0`; reason: current combined behavior is already the target. | `+0.0` | Surpass | Keep | No migration; PV-05 may rename the private shared projection-store type only. | None for annotation/widget APIs or constructors; they are already private or intentional public hooks. | `packages/plite-react/test/widget-layer-contract.tsx:1-890`; annotation contracts, persistent anchors, toolbar browser proof, and keyed-wake metrics. | Low keep risk. Reverse only for a proven non-React host, then add a host adapter without merging annotation/widget ownership. |
| VIEW-021 | Selective subscriptions and render performance | Current owner: Wordgard editor Tile/ViewState. Changed-range imperative reuse exists, but no editor benchmark/generated suite proves it. Evidence: `../wordgard/src/editor/tile.ts:673-1118`, `../wordgard/src/editor/viewstate.ts:45-119`. | `4/4/3/5/4/2/4/4 = 75.0`; reason: runtime reuse is strong, but host separation and benchmark evidence are weak. | Current owner: `@platejs/plite-react` mapped stores, memoized text blocks, and render profiler. Keyed subscriptions and runtime-ID groups expose measurable wake/render counts. Evidence: `packages/plite-react/src/mapped-view-store.ts:14-110`, `packages/plite-react/src/components/editable-text-blocks.tsx:990-1063`, `packages/plite-react/src/render-profiler.ts:1-87`. | `5/5/5/5/5/5/4/5 = 97.5`; reason: selective runtime and benchmark proof are complete; only internal navigation costs one DX point. | Current owner: Plate core is a consumer; plugin slots do not replace Plite subscriptions. Evidence: `packages/core/src/react/components/PlateContent.tsx:124-185`. | `4/4/4/4/4/4/4/4 = 80.0`; reason: Plate composes the proven substrate but owns no independent subscription law. | `5/5/5/5/5/5/4/5 = 97.5`; reason: current Plite proof governs the combined stack without duplication. | superior — and measured. | Keep current performance architecture; PV-04 must meet existing profiler budgets. | `@platejs/plite-react` | Plite Plan | No execution packet | VIEW-002, VIEW-016 | PV-04, PV-07 | `5/5/5/5/5/5/4/5 = 97.5`; reason: current measured architecture is the justified target, not a speculative 100. | `+0.0` | Surpass | Keep | No API migration. | Delete nothing; measured subscriptions remain canonical. | `packages/plite-react/test/render-profiler-contract.test.tsx:1-82`; `apps/plite/tests/plite-browser/donor/examples/huge-document.test.ts:1-3404`. | Reverse only if profiler budgets regress; Wordgard has no benchmark evidence to override current proof. |
| VIEW-022 | Multi-root, projections, content roots, hidden/virtualized DOM | Current owner: Wordgard editor root/DOM/Tile. Its custom-root assumptions are single-root and numeric-position oriented. Evidence: `../wordgard/src/editor/editor.ts:108-139`, `../wordgard/src/editor/dom.ts:268-276`. | `1/2/2/2/2/1/2/1 = 32.5`; reason: the shape cannot express current multi-root, partial-DOM, or projection requirements. | Current owner: `@platejs/plite-react` projection/boundary graphs plus Editable roots. Owner/root/path identity, root-local ranges, and named roots are first-class. Evidence: `packages/plite-react/src/projection-graph.ts:5-60`, `packages/plite-react/src/projection-graph.ts:298-364`, `packages/plite-react/src/view-boundary-graph.ts:24-108`, `packages/plite-react/src/view-boundary-graph.ts:199-253`, `packages/plite-react/src/components/editable-text-blocks.tsx:2077-2111`. | `5/5/5/5/5/5/4/5 = 97.5`; reason: semantics, runtime, host fit, and proof are complete; graph navigation costs one DX point. | Current owner: Plate core is a root-surface consumer and creates no duplicate graph. Evidence: `packages/core/src/react/components/PlateContent.tsx:107-185`. | `4/4/4/4/4/4/4/4 = 80.0`; reason: Plate correctly composes roots while delegating generic graph law. | `5/5/5/5/5/5/5/5 = 100.0`; reason: Plite graph ownership plus Plate composition completely satisfy the product requirement. | superior — decisively superior | Keep first-class root keys, projection graph, content roots, and partial DOM. | Plite core, DOM, and React by layer | Plite Plan | No execution packet | VIEW-001, VIEW-005 through VIEW-007, VIEW-016 through VIEW-021 | All PV packets must preserve | `5/5/5/5/5/5/5/5 = 100.0`; reason: current combined architecture already meets target. | `+0.0` | Reject | Keep | No migration. | Reject all Wordgard single-root/numeric-identity mechanisms. | `apps/plite/tests/plite-browser/donor/examples/multi-root-document.test.ts:1-1227`; shadow, coverage, and huge-document proof. | Reverse only if multi-root requirements are removed, contradicting current product requirements. Reference scope: Reject reference. |
| VIEW-023 | Accessibility, focus, read-only, announcements | Current owner: Wordgard editor root/focus code. It owns live-region DOM, attributes, direction, announcements, focus, and a Safari context-menu workaround. Evidence: `../wordgard/src/editor/editor.ts:108-139`, `../wordgard/src/editor/editor.ts:307-352`, `../wordgard/src/editor/editor.ts:481-498`. | `3/3/3/3/3/2/3/2 = 55.0`; reason: useful basics, but transport and product message policy are fused with little proof. | Current owner: `@platejs/plite-react` live-region transport and selection reconciliation. Commit effects own polite status DOM; reconciler owns focus/blur. Evidence: `packages/plite-react/src/components/editor-announcement-live-region.tsx:22-89`, `packages/plite-react/src/editable/selection-reconciler.ts:230-260`. | `5/4/5/5/5/5/3/5 = 92.5`; reason: transport/runtime/proof are strong, but message-policy ownership is implicit. | Current owner: Plate core product policy. `PlateContent` resolves disabled/readOnly and autofocus behavior. Evidence: `packages/core/src/react/components/PlateContent.tsx:19-36`, `packages/core/src/react/components/PlateContent.tsx:191-215`. | `4/4/4/4/4/4/4/4 = 80.0`; reason: product behavior is present and correctly above transport, but the typed boundary is incomplete. | `5/5/5/5/5/5/3/5 = 95.0`; reason: behavior/proof are excellent; explicit transport-policy ownership is missing. | superior — behavior/proof; message-policy owner is implicit. | Plite owns transport/focus DOM law; Plate owns announcement text/timing and enabled policy. | Plite React transport; `@platejs/core` policy | Plite Plan then Plate Plan | `plite-plan → plate-plan` | VIEW-001, VIEW-006, VIEW-013 | PV-07 accessibility closure | `5/5/5/5/5/5/5/5 = 100.0`; reason: typed producer/transport ownership and parity proof close the gap. | `+5.0` | Surpass | Bridge | PT-03 types the boundary and migrates any low-level product message producer found by audit. | Delete product message policy below Plate; retain live-region transport and commit effect. | `packages/plite-react/test/screen-reader-announcement.test.tsx:1-159`; `apps/plite/tests/plite-browser/donor/examples/read-only.test.ts:1-125`; focus/shadow proof. | Medium a11y risk; rollback producer migration. Reverse only for a message proven generic editor law. |
| VIEW-024 | Placeholder, drop cursor, custom caret | Current owner: Wordgard editor placeholder/drop-cursor/draw-cursor/theme modules. Placeholder is a decoration, drop cursor is mapped state, and custom caret hides native presentation. Evidence: `../wordgard/src/editor/placeholder.ts:4-41`, `../wordgard/src/editor/dropcursor.ts:5-94`, `../wordgard/src/editor/drawcursor.ts:4-84`, `../wordgard/src/editor/theme.ts:74-115`. | `4/4/3/4/4/2/4/2 = 67.5`; reason: mechanisms are cohesive, but substrate and product presentation are entangled. | Current owner: `@platejs/plite-react` structural placeholder and projected selection. Inert DOM and non-native selection fallback include some built-in presentation. Evidence: `packages/plite-react/src/components/plite-placeholder.tsx:26-90`, `packages/plite-react/src/view-selection-decoration.ts:39-60`, `packages/plite-react/src/view-selection-decoration.ts:309-357`. | `5/4/4/5/5/5/3/5 = 90.0`; reason: structural runtime/proof are strong, but styling ownership and API cohesion can improve. | Current owner: Plate core/apps product render slots. Plate passes placeholder/renderPlaceholder and owns visual composition. Evidence: `packages/core/src/react/components/PlateContent.tsx:19-26`, `packages/core/src/react/components/PlateContent.tsx:124-185`. | `4/5/5/4/4/5/5/5 = 92.5`; reason: product presentation ownership and proof are excellent; structural runtime remains delegated. | `5/5/5/5/5/5/4/5 = 97.5`; reason: combined split is right; a few presentation defaults still sit too low. | superior | Keep structural placeholder/projected-selection fallback; Plate owns appearance/drop indicator; reject a general custom-caret export. | Plite React structure; Plate/apps visuals | Plate Plan | `plate-plan` | VIEW-007, VIEW-011, VIEW-018 through VIEW-020, VIEW-023 | PV-07 visual closure | `5/5/5/5/5/5/5/5 = 100.0`; reason: moving only non-structural defaults closes ownership/DX without weakening DOM law. | `+2.5` | Adopt | Bridge | PT-03 moves proven presentation defaults and product drop visuals while keeping DOM invariants in Plite. | Delete non-structural Plite presentation defaults after Plate adoption; add no general custom-caret API. | `apps/plite/tests/plite-browser/donor/examples/placeholder.test.ts:1-345`; `apps/plite/tests/plite-browser/donor/examples/visual-native-selection-smoke.test.ts:1-433`. | Medium visual/a11y risk; rollback style move. Reverse only if a style is required for DOM correctness in every host. Reference scope: Adopt behavior only; reject custom caret. |
| VIEW-025 | Panels, dialogs, menus | Current owner: Wordgard editor UI modules. Panel lifecycle/groups, dialog effects/forms, and menu controls/navigation/theme live in the editor package. Evidence: `../wordgard/src/editor/panel.ts:5-205`, `../wordgard/src/editor/dialog.ts:8-185`, `../wordgard/src/editor/menubar.ts:7-562`. | `5/4/3/4/5/2/4/1 = 70.0`; reason: cohesive product UI, but substrate placement and sparse proof make it unsuitable as generic law. | Current owner: intentionally absent in Plite. The bounded Plite source audit found no generic panel/dialog/menu API. | `0/0/0/0/0/0/0/0 = 0.0`; reason: absence is correct because these are product UI concepts, not a missing substrate feature. | Current owner: Plate core/apps/registry UI. Plugin render slots and ordered before/above/after Editable composition own UI. Evidence: `packages/core/src/react/plugin/PlatePlugin.ts:362-410`, `packages/core/src/react/components/PlateContent.tsx:124-185`. | `5/5/5/4/5/5/5/4 = 95.0`; reason: ownership/composition are excellent; runtime/proof remain product-specific. | `5/5/5/4/5/5/5/4 = 95.0`; reason: Plate's correct product owner fully supplies the combined behavior without Plite pollution. | superior — ownership and composition. | Keep Plate/app/registry UI; create no Wordgard-shaped generic UI layer. | Plate packages, kits, registry, and apps | Plate Plan | No execution packet | VIEW-020, VIEW-023 | No dependent packet; Plate UI ownership is already current. | `5/5/5/4/5/5/5/4 = 95.0`; reason: no accepted packet or bounded missing law justifies scoring above the current proven Plate shape. | `+0.0` | Adopt | Keep | Existing UI stays. | None; reject new Plite exports. | `packages/core/src/react/components/PlateContent.spec.tsx:1-425`; existing product browser/UI tests. Benchmark N/A: UI mount behavior is not substrate throughput. | Reverse only for a concrete UI-free generic anchor/lifecycle need independently accepted by Plite, never a panel API. |
| VIEW-026 | Tooltip, hover, anchored overlay UI | Current owner: Wordgard editor tooltip manager. It owns geometry, measurement, overlap, DOM lifecycle, async hover state, and leave tracking. Evidence: `../wordgard/src/editor/tooltip.ts:21-98`, `../wordgard/src/editor/tooltip.ts:99-524`, `../wordgard/src/editor/tooltip.ts:542-833`. | `5/5/3/5/5/2/4/2 = 77.5`; reason: strong product behavior, but imperative DOM ownership and limited proof weaken host fitness. | Current owner: Plite DOM/React primitives. Selection rect and widget anchors exist; product tooltip policy intentionally does not. Evidence: `packages/plite-react/src/widget-store.ts:25-94`, `packages/plite-dom/src/plugin/dom-editor.ts:127-138`. | `2/2/3/3/3/4/3/3 = 57.5`; reason: primitives are adequate, while the low score correctly reflects absence of product policy. | Current owner: Plate floating. Floating toolbar owns selection, focus, readOnly, open, and click-outside policy. Evidence: `packages/floating/src/hooks/useFloatingToolbar.ts:20-84`, `packages/floating/src/hooks/useFloatingToolbar.ts:86-193`. | `5/5/5/4/5/5/5/5 = 97.5`; reason: product semantics, ownership, host fit, and proof are excellent; runtime depends on lower geometry. | `5/5/5/5/5/5/5/5 = 100.0`; reason: Plite primitives and Plate policy form a complete split. | superior — split. | Keep geometry/anchors low and async hover/component policy in Plate/apps. | Plite DOM/React primitives; Plate floating/apps UI | Plate Plan | No execution packet | VIEW-007, VIEW-019, VIEW-020 | No dependent packet; overlay policy ownership is already current. | `5/5/5/5/5/5/5/5 = 100.0`; reason: current combined architecture already meets target. | `+0.0` | Adopt | Keep | No migration. | Delete nothing; the current primitive/product split remains. | `apps/plite/tests/plite-browser/donor/examples/hovering-toolbar.test.ts:1-255`; widget/geometry unit proof. | Reverse only if generic anchor data cannot express a concrete overlay; never move hover timers/components into Plite. |
| VIEW-027 | Theme, styles, CSP, host presentation | Current owner: Wordgard editor theme. Facets/builders inject editor UI, caret, placeholder, and drop-cursor styles. Evidence: `../wordgard/src/editor/theme.ts:4-191`. | `4/4/3/4/4/2/3/1 = 62.5`; reason: coherent product skin, but substrate coupling, ownership, and proof are weak. | Current owner: `@platejs/plite-react` structural components. They own required attributes plus some defaults such as placeholder overlay presentation. Evidence: `packages/plite-react/src/components/plite-placeholder.tsx:43-90`. | `2/2/3/3/3/4/3/3 = 57.5`; reason: structural law exists, but presentation defaults blur the package boundary. | Current owner: Plate core/apps presentation. Render props, classes, and plugin slots own host styling. Evidence: `packages/core/src/react/components/PlateContent.tsx:19-26`, `packages/core/src/react/plugin/PlatePlugin.ts:362-410`. | `5/5/5/4/5/5/5/4 = 95.0`; reason: product ownership and composition are excellent; proof is distributed across UI surfaces. | `5/5/5/5/5/5/4/5 = 97.5`; reason: the combined boundary is nearly complete; a few defaults and explicit structural rationale remain. | superior — ownership. | Plite retains only structural CSS invariants; Plate/apps own theme, components, and CSP policy. | Plite React structure; Plate/apps presentation | Plate Plan | No execution packet | VIEW-016, VIEW-023 through VIEW-026 | PT-03 audits placeholder only | `5/5/5/5/5/5/5/5 = 100.0`; reason: explicit structural inventory and visual proof close ownership/DX. | `+2.5` | Reject | Keep | No broad migration; PT-03 removes only proven non-structural placeholder defaults. | No theme deletion beyond PT-03 named style fields. | Surface, placeholder, and browser styling proof. Benchmark N/A: presentation is not throughput law. | Reverse only if a style is required for selection/input correctness in every host. Reference scope: Reject substrate theme. |
| VIEW-028 | Browser proof, diagnostics, release contracts | Current owner: Wordgard editor test fixtures. Seven `webtest-*` modules contain 143 top-level `it`/`test` cases across commands, composition, content, coordinates, editor behavior, DOM resolution, and serialization; they do not provide an editor benchmark/generated/fuzz/release gate. Evidence: `../wordgard/test/webtest-commands.ts:1-35`, `../wordgard/test/webtest-composition.ts:1-182`, `../wordgard/test/webtest-content.ts:1-510`, `../wordgard/test/webtest-coords.ts:1-176`, `../wordgard/test/webtest-editor.ts:1-113`, `../wordgard/test/webtest-resolve-dom.ts:1-118`, `../wordgard/test/webtest-serialize.ts:1-259`. | `2/3/2/3/2/2/3/3 = 50.0`; reason: the direct case inventory is substantial, but diagnostics, generative laws, performance budgets, and release gates remain thin. | Current owner: Plite package/browser proof infrastructure. Package contracts, scheduler/observer diagnostics, generated traces, huge documents, shadow, multi-root, and IME gates are explicit. Evidence: `packages/browser/test/core/proof.test.ts:1-258`, `packages/browser/test/core/release-proof.test.ts:1-219`. | `5/5/5/5/5/5/4/5 = 97.5`; reason: proof architecture is release-grade; ownership navigation alone trails perfect. | Current owner: Plate product proof in apps/plite and package specs. Markdown shortcuts are one live product row. Evidence: `apps/plite/tests/plite-browser/donor/examples/markdown-shortcuts.test.ts:1-521`. | `5/5/5/4/4/5/4/5 = 92.5`; reason: product proof is deep, while lifecycle/runtime gates are shared with Plite. | `5/5/5/5/5/5/5/5 = 100.0`; reason: generic and product proof together cover every scored dimension. | superior — decisively superior | Keep proof architecture; add packet-specific laws and machine-checkable deletion gates only. | `packages/browser`, package tests, and `apps/plite` | Plite Plan | `plite-plan` | All changed VIEW concepts | Release/closure only | `5/5/5/5/5/5/5/5 = 100.0`; reason: current combined proof already meets target; PV-07 preserves it for changed packets. | `+0.0` | Surpass | Gate | PV-07 adds capability, IME, render, and overlay boundaries; Plate rows remain in apps/plite. | Delete tests only when they assert removed APIs; replace them in the same packet. | Unit, generated/property/fuzz, round-trip, browser, IME, benchmark, and release proof are enumerated in PV-07. | False confidence is the risk; rollback failing source packets, never weaken proof. Reverse only when a flaky row is replaced by stronger evidence. |

## Mandatory current-versus-target dossiers and vertical packets

These dossiers cover every changed or adopted concept. Each names the actual
current Wordgard, Plite, and Plate shapes; the target API or internal shape;
ownership and lifecycle; implementation/adoption/deletion scope; all relevant
proof classes with scoped reasons where a class does not apply; hard deletion
and exit gates; failure modes; and rollback. The canonical C01-C33
reconciliation later removes alias duplication without discarding any owner.

### P-DOC-1 — Readonly document and location truth

- **Concept IDs:** DOC-004, DOC-007, DOC-032, and DOC-033. It also closes the residual type gap recorded by DOC-001, DOC-006, DOC-008, and DOC-022 without changing those mechanisms.
- **Decision owner:** Plite Plan.
- **Execution skill:** `plite-plan` in accepted execution mode; use `typescript-advanced-types` only as a worker for inference failures, never as decision owner.
- **Final owner:** `@platejs/plite` public interfaces; every other package remains a consumer.
- **Prerequisites:** A generated inventory of every exported node/value/root/path/point/range/selection/snapshot/commit/slice type and every direct write to a published value. The inventory is the entry gate because a partial readonly conversion would make the API less honest, not more.
- **Dependent packets:** P-DOC-2 consumes the final readonly names. P-DOC-4 and P-DOC-5 compile codec contexts on those names. All Plate packages are downstream adoption, not blockers to defining the owner.
- **Entry condition:** Current runtime freeze/alias behavior is captured by focused tests, and all exported mutable publication types and consumer write sites have named owners.
- **Exact implementation scope:** Make the existing `Value`, `Element.children`, text/element properties, `EditorDocumentValue`, `InitialValue`, `SnapshotInput`, `Path`, `Point`, `Range`, selection variants, named roots, `EditorSnapshot`, commits, `ContentSlice`, schema/codec state views, and state-read return values readonly. Keep mutable JavaScript literals and builder/update inputs ergonomic through structural assignability; do not add a parallel public mutable-input taxonomy. Fix inference at the owning generic rather than annotating callbacks. Snapshot and validate input once at editor/slice/codec ingress.
- **Current shape:** Wordgard advertises readonly nominal instances; Plite enforces immutable runtime snapshots behind mutable-looking public types; Plate inherits those types without another publication boundary.
- **Current Wordgard shape and lifecycle:** `Plot`/`Leaf` class fields and child arrays look readonly (`../wordgard/src/doc/node.ts:319-395`, `../wordgard/src/doc/node.ts:468-518`), then nominal instances flow through schema/change/parse. There is no separate mutable construction input, schema-revision publication, named-root snapshot, or host-safe JSON boundary.
- **Current Plite shape and lifecycle:** External slices are detached and frozen (`packages/plite/src/core/content-slice.ts:67-176`) and runtime paths are frozen in indexes (`packages/core/src/internal/plugin/pipeTransformInitialValue.ts:53-78`), but `Value`, children, paths, and snapshots advertise mutability (`packages/plite/src/interfaces/editor.ts:129`, `packages/plite/src/interfaces/element.ts:11-17`, `packages/plite/src/interfaces/path.ts:1-8`, `packages/plite/src/interfaces/editor.ts:1623-1633`). Publication already assumes old snapshots never mutate.
- **Current Plate shape and lifecycle:** `BaseEditor` inherits Plite `Value` (`packages/core/src/lib/editor/BaseEditor.ts:1-2`, `packages/core/src/lib/editor/BaseEditor.ts:86-89`); plugin transforms accept/return that mutable-looking type (`packages/core/src/internal/plugin/pipeTransformInitialValue.ts:81-136`). Plate has no independent snapshot boundary to repair the contract.
- **Target public TypeScript:**

```ts
export type Value = readonly Element[];

export type Path = readonly number[];

export type EditorDocumentValue<V extends Value = Value> = Readonly<{
  children: V;
  meta?: Readonly<Record<string, unknown>>;
  roots?: Readonly<Record<RootKey, V>>;
}>;

export type InitialValue<V extends Value = Value> =
  | V
  | EditorDocumentValue<V>;
```

`Element`, `Text`, locations, selections, snapshots, commits, and slices carry
the same deep readonly law. The winning API changes existing truthful nouns;
it does not add `EditorDocumentSnapshot`, `EditorDocumentInput`, or a public
`DeepMutableInput` helper.

- **Simple application usage:**

```ts
const initialValue = [
  { type: 'p', children: [{ text: 'Hello' }] },
] satisfies Value;

const editor = createEditor({ initialValue });
const snapshot = editor.read((state) => state.runtime.snapshot());
// snapshot.children[0] = ... is a type error and frozen at runtime.
```

- **Advanced multi-root usage:**

```ts
const input = {
  children: [{ type: 'p', children: [{ text: 'Main' }] }],
  roots: {
    comments: [{ type: 'comment-thread', children: [{ text: 'Review' }] }],
  },
} satisfies InitialValue;

const editor = createEditor({ document: input });
editor.update((tx) => tx.text.insert('!', { at: { path: [0, 0], root: 'comments' } }));
```

- **Extension-author usage:** Read callbacks infer readonly nodes/locations; writes use transaction groups. A plugin that needs a mutable external host value copies only at that host boundary:

```ts
defineEditorExtension({
  name: 'indexer',
  onCommit({ commit }) {
    index(commit.after.children);
  },
});
```

- **Host usage:** `HostCodecParseContext.state`, `HostCodecSerializeContext.slice`, clipboard payloads, and DOM/React render props expose readonly snapshots. Browser APIs that require mutable arrays receive `[...slice.content]`; this copy is visible and local.
- **Compiled/internal representation:** Runtime nodes stay ordinary frozen structural objects. `SnapshotIndex` maps external runtime IDs to readonly paths. Prepared slices and compiled schema artifacts retain weak identity caches; no readonly wrapper class is introduced.
- **Target invariants:** Published document values and locations are deeply readonly; mutable input crosses one snapshot boundary; no caller mutates state to request an edit; runtime identity stays outside JSON; old snapshots remain observationally stable; root keys remain explicit.
- **Reconfiguration/runtime lifecycle:** Configuration candidates compile against detached readonly input; successful publication swaps schema/document/index views atomically. Failed configuration or validation publishes nothing. Reconfiguration invalidates compiled indexes/views, never mutates an old snapshot.
- **Target shape:** Structural JSON remains the public representation; the type system matches the existing immutable runtime law with fewer concepts than the first draft. Ordinary literals continue to satisfy `Value`/`InitialValue`; mutation remains an implementation detail before ingress.
- **Public breaks:** Any consumer that assigns into `Value`, node properties, children, `Path`, `Point`, `Range`, selections, snapshots, or commits fails typecheck. Mutable construction remains ordinary local JavaScript/TypeScript and crosses the existing `InitialValue` or update boundary. No mutable compatibility aliases and no new public input wrapper.
- **Plite adoption:** `packages/plite`, `plite-history`, `plite-dom`, `plite-react`, `plite-hyperscript`, and `yjs` adopt readonly reads while retaining the existing `InitialValue`/`SnapshotInput` ingress. Internal algorithms copy only when they genuinely construct.
- **Plate adoption:** `packages/core` plugin contracts and every product package update inferred node/location/value types; callbacks remain inference-first. Initial-value transforms explicitly return input values that are snapshotted before publication.
- **Downstream adoption:** Apps, kits, docs, fixtures, registry source, and external TypeScript callers follow compile errors. CI-generated templates are not manually edited.
- **Deletion scope:** Mutable publication aliases; writable array/object fields on published values; casts used only to recover readonly truth; direct state-node assignment helpers. Reject/delete any draft `EditorDocumentSnapshot`, `EditorDocumentInput`, or public `DeepMutableInput` surface. This packet must not delete update/builder ergonomics.
- **Focused unit proof:** Compile-time rejection of node/path/snapshot mutation; inference for application values and plugin callbacks; runtime input-alias detachment; deep freeze; unchanged runtime ID/path lookup; named-root snapshot reads.
- **Generated/property/fuzz laws:** Generate mutable JSON inputs, publish them, mutate every reachable input alias, and prove snapshot JSON/IDs/selection remain unchanged. Generate paths/ranges and prove every API returns frozen, value-equal locations without aliasing mutable inputs.
- **Browser proof:** Required: focused apps/plite editing, selection, clipboard copy/paste, React render, and named-root/projected-root smoke. This is type-led, but host packages are broad adopters and need runtime proof.
- **Benchmark:** N/A for a type-only substep. If implementation adds deep cloning beyond the existing ingress snapshots, run large-document publication, content-slice value, history retention, and clipboard payload benchmarks and reject measurable regression; the target should not add per-read cloning.
- **Failure modes:**
  1. Callback/node inference widens to generic `Descendant` or requires annotations. **Blast radius:** every Plite/Plate plugin and downstream TypeScript caller. **Stop/rollback:** stop at the first owning-generic regression, repair inference before continuing, and revert P-DOC-1 entirely if the inference corpus cannot stay annotation-free.
  2. Readonly conversion adds per-read or recursive publication cloning. **Blast radius:** large-document editing, history retention, React rendering, clipboard, and collaboration latency. **Stop/rollback:** stop on benchmark/allocation regression beyond the existing gate; remove the new cloning path or revert the packet, never weaken readonly truth with casts.
  3. A DOM/React/Yjs host mutates a readonly view or receives a frozen value where a mutable host object is required. **Blast radius:** browser input/rendering or remote synchronization. **Stop/rollback:** stop on focused host proof failure, move the copy to that external boundary, and revert the packet if a bounded copy cannot isolate the host.
  4. Input alias mutation changes a published snapshot. **Blast radius:** document integrity, history, identity indexes, and replay. **Stop/rollback:** immediate stop; revert all publication-type changes until snapshot detachment passes the generated alias law.
- **Exit condition:** All affected packages typecheck; focused and strict Plite handoff pass; no published mutable type or direct state-node write remains; browser smoke passes.
- **Hard deletion gate:** A bounded export/type scan returns zero mutable publication aliases, and the compile corpus proves simple/advanced/plugin/host usage without casts.
- **Rollback answer:** Revert the entire packet. Do not keep half-readonly aliases or a compatibility layer; runtime persisted formats and change JSON are unchanged, so rollback is code/type-only.

### P-DOC-2 — Private change kernel, one public `DocumentChange`

- **Concept IDs:** DOC-015, DOC-016, DOC-032, DOC-033, and DOC-034. It preserves DOC-017 through DOC-023 semantics.
- **Decision owner:** Plite Plan.
- **Execution skill:** `architecture-cleanup` under an accepted `plite-plan`; route public-break decisions back to Plite Plan rather than improvising during file moves.
- **Final owner:** Public `DocumentChange` in `@platejs/plite`; private token/index/root-change/builder/classification modules in `@platejs/plite/internal`; the Yjs adapter owns only its bridge call.
- **Prerequisites:** P-DOC-1 final type names, or an explicit decision to land the purely mechanical module split first. Inventory all imports of `ChangeSet`, `DocumentSlice`, `IndexedDocument`, builders, sections/data, and `fromSections`, including tests/docs/Yjs.
- **Dependent packets:** P-DOC-3 consumes the final private builder/change modules. History/Yjs are required adopters inside this packet, not later cleanup.
- **Entry condition:** Existing public export surface, persisted `DocumentChange` JSON, generated laws, history/Yjs contracts, module graph, and change benchmarks are captured.
- **Exact implementation scope:** Split `document-change.ts` into private token, document-index, root-change, mapping/transform, classification, builder, and public `DocumentChange` modules. Remove public `ChangeSet` and all token/index/builder exports. Give Yjs the narrowest intent-specific internal factory needed to import event sections. Preserve every algorithm, ordering rule, version, and serialized representation.
- **Current shape:** Wordgard and Plite both expose compact root-change machinery; Plite additionally has the correct canonical multi-root `DocumentChange`, while Plate already consumes only that higher-level algebra.
- **Current Wordgard shape and lifecycle:** One public `ChangeSet` exposes sentinel section arrays and raw slices (`../wordgard/src/doc/change.ts:109-168`, `../wordgard/src/doc/change.ts:489-670`). Callers may fit/correct, apply, compose, transform, invert, or serialize it. It is single-root and its modification JSON round trip is defective (`../wordgard/src/doc/change.ts:204-231`, `../wordgard/src/doc/change.ts:554-559`).
- **Current Plite shape and lifecycle:** Private-prepared tokens, indexes, `ChangeSet`, mapping, classification, `DocumentChange`, and builder coexist in one file (`packages/plite/src/core/document-change.ts:96-230`, `packages/plite/src/core/document-change.ts:1210-1566`, `packages/plite/src/core/document-change.ts:3237-4470`, `packages/plite/src/core/document-change.ts:5267-5832`, `packages/plite/src/core/document-change.ts:6270-7164`). Root index still exports `ChangeSet` (`packages/plite/src/index.ts:33-39`).
- **Current Plate shape and lifecycle:** Plate observes commits/transactions and derives `DocumentChange` for initial transforms (`packages/core/src/internal/plugin/pipeTransformInitialValue.ts:118-130`). No product package needs the root-section class.
- **Target public TypeScript:**

```ts
import { DocumentChange } from '@platejs/plite';

const change = DocumentChange.between(before, after);
const next = change.apply(before);
const inverse = change.invert(before);
const encoded = change.toJSON();
const decoded = DocumentChange.fromJSON(encoded);
```

`ChangeSet`, `DocumentSlice`, `IndexedDocument`, section arrays, and builders are not root exports.

- **Simple application usage:** Applications continue to edit through transactions:

```ts
editor.update((tx) => {
  tx.text.insert('hello');
});
```

They receive canonical commits; they never construct root sections.

- **Advanced usage:** Persistence/collaboration tooling may compare, compose, invert, transform, map, and encode `DocumentChange`, always against full document snapshots:

```ts
const local = DocumentChange.between(base, localValue);
const remote = DocumentChange.between(base, remoteValue);
const { a: localPrime, b: remotePrime } =
  DocumentChange.transform(local, remote, base);
```

- **Extension-author usage:** An extension observes `commit.change: DocumentChange` and maps its own anchor/effect with public mapping APIs. It cannot inspect compact sections.
- **Host/adapter usage:** Yjs uses an internal intent-specific bridge, not the whole root class:

```ts
import { createInternalRootChangeFromSections } from '@platejs/plite/internal';

const imported = createInternalRootChangeFromSections({
  root,
  before,
  sections,
  propertyDeltas,
});
```

The bridge returns a `DocumentChange`; its section input is adapter-private and may change with the Yjs importer.

- **Compiled/internal representation:**

```text
packages/plite/src/core/change/
  tokens.ts
  document-index.ts
  root-change.ts
  mapping.ts
  transform.ts
  classification.ts
  builder.ts
  document-change.ts
```

`RootChange` retains compact sections/data; `PreparedTokenSlice` retains lazy token preparation; `DocumentIndex` retains binary cursor/index operations; `ChangeDraft` owns canonical construction. Internal modules may export through `@platejs/plite/internal` only when a sibling package has a named use.

- **Target invariants:** `DocumentChange` is the only public mutation/replay/persistence algebra; JSON version/shape is stable; compact representation is private; multi-root/property semantics are unchanged; mapping/classification order is unchanged; history/Yjs consume canonical changes; no public API can build invalid sections.
- **Reconfiguration/runtime lifecycle:** A `DocumentChange` remains schema-independent structural data but validation/application occurs against the owning snapshot/schema context. Schema identity remains in history/configuration envelopes. Module split adds no cache or publication lifecycle.
- **Target shape:** Preserve the current strong algebra, remove lower-level public coupling, and make physical ownership navigable.
- **Public breaks:** `import { ChangeSet } from '@platejs/plite'`, public section/data inspection, and public `fromSections` stop compiling. There is no alias or deprecation bridge.
- **Plite adoption:** Core, schema fitter, selection/effect mapping, snapshot index, history, DOM, and tests use private modules or public `DocumentChange` according to ownership.
- **Plate adoption:** No semantic migration. Any accidental Plate `ChangeSet` import found by the entry inventory must move to public transaction/commit APIs.
- **Downstream adoption:** Yjs event import adopts the narrow internal bridge; docs teach only `DocumentChange`; external advanced callers rewrite around full document changes.
- **Deletion scope:** Root `ChangeSet` export; public docs/smoke rows; public `sections`, `data`, `fromSections`; old monolith definitions after module moves; any compatibility re-export.
- **Focused unit proof:** Public import surface rejects `ChangeSet`; each moved internal module retains focused tests; JSON bytes/round trips match; classification, mapping, relocation, property delta, root lifecycle, and builder outputs are unchanged.
- **Generated/property/fuzz laws:** All seeded apply/round-trip/invert/compose/associativity/transform laws in `packages/plite/test/document-change-laws.test.ts:455-799`; add equivalence properties comparing pre-split fixtures to post-split public outputs.
- **Browser proof:** Required focused apps/plite smoke for edit, undo/redo, clipboard insert, and collaboration because every browser consumer crosses the moved kernel. No new visual claim.
- **Benchmark:** Required: document-change apply/compose/transform, huge-document locality, history retention/depth, and Yjs lowering gates. Module boundaries must not add allocations or eager preparation.
- **Failure modes:**
  1. The module split introduces a circular dependency or duplicate singleton/cache. **Blast radius:** Plite initialization, every edit, history, DOM, and Yjs. **Stop/rollback:** stop when the package graph/typecheck or identity tests fail; revert the complete module move rather than add a cycle-breaking public facade.
  2. `DocumentChange` JSON bytes, version, or decode behavior drift. **Blast radius:** stored history, replay, collaboration payloads, and downstream persistence. **Stop/rollback:** immediate stop on golden/round-trip mismatch and revert P-DOC-2; no data migration belongs in this packet.
  3. The narrow Yjs bridge changes section/property lowering or root selection. **Blast radius:** remote convergence and synchronized documents. **Stop/rollback:** stop on canonical/event/soak failure, revert bridge and split together, and do not re-export `ChangeSet` as a shortcut.
  4. Private preparation becomes eager after extraction. **Blast radius:** huge-document editing and history retention. **Stop/rollback:** stop on allocation/locality benchmark regression; restore lazy ownership or revert the packet.
- **Exit condition:** All package/type/tests and strict Plite handoff pass; public export guard passes; history/Yjs/browser proof passes; benchmark artifacts meet existing thresholds.
- **Hard deletion gate:** Bounded imports outside `packages/plite/src/core/change/**` and explicitly approved `@platejs/plite/internal` bridges return zero `ChangeSet`, `DocumentSlice`, `IndexedDocument`, section/data, or builder use; root package exports only `DocumentChange`.
- **Rollback answer:** Revert the whole module/export packet. Persisted `DocumentChange` JSON never changes, so stored data requires no migration. Do not restore a compatibility alias without a new Plite Plan decision.

### P-DOC-3 — One compiled slice-fitter owner

- **Concept IDs:** DOC-014, DOC-031, DOC-032, DOC-033, and DOC-034. It must preserve DOC-012, DOC-013, and DOC-017 through DOC-022 behavior.
- **Decision owner:** Plite Plan.
- **Execution skill:** `architecture-cleanup` under an accepted `plite-plan`, with `performance` as a proof worker for locality gates.
- **Final owner:** Private `packages/plite/src/core/slice-fit/*`, compiled and exposed only through the existing editor schema/state/transaction APIs.
- **Prerequisites:** P-DOC-2’s private builder/change boundary; an explicit dependency map of every fit-specific type, helper, cache, candidate family, schema query, canonical constructor, and call site currently inside `editor-schema.ts`.
- **Dependent packets:** P-DOC-4 and P-DOC-5 rely on unchanged insertion fitting and reuse its browser proof. They do not import the private fitter.
- **Entry condition:** Exact fixture outputs, generated laws, schema-revision behavior, no-publication failures, and fitter/locality benchmarks are green and recorded before movement.
- **Exact implementation scope:** Move fit-only frontier state, candidate definitions, costs, tie order, structural/local classification, boundary programs, wrapper/canonical construction coordination, and prepared variant reuse out of `editor-schema.ts`. Compile one immutable fitter from one `CompiledEditorSchema` revision. Keep state-read `fit`/`fitContent` and transaction `slice.replace` signatures and behavior unchanged. Leave generic schema query/validation/property APIs in `editor-schema.ts`.
- **Current shape:** Wordgard has recognizable but split fitter state machines; Plite has stronger deterministic fitting buried in the schema owner; Plate correctly delegates all contextual fitting.
- **Current Wordgard shape and lifecycle:** `ChangeFitter` is a named mutable state machine with structural levels, deletion context, wrapping, leave costs, and synchronization (`../wordgard/src/doc/change.ts:831-1092`); eager replacement fitting is separate (`../wordgard/src/doc/change.ts:1182-1332`). Parser placement also performs schema fitting (`../wordgard/src/doc/parse.ts:397-455`). It is locally legible but has three owners, one root, and no revision publication.
- **Current Plite shape and lifecycle:** Public slice APIs are correct (`packages/plite/src/interfaces/editor.ts:493-510`, `packages/plite/src/interfaces/editor.ts:850-877`). Fit input/result contracts, deterministic candidate frontier, costs/tie order, and revision authority are mixed with schema API code (`packages/plite/src/core/editor-schema.ts:105-180`, `packages/plite/src/core/editor-schema.ts:439-750`, `packages/plite/src/core/editor-schema.ts:1041-1070`).
- **Current Plate shape and lifecycle:** Plate product middleware may rewrite a slice but delegates the fit and atomic replacement to Plite; code blocks are the concrete example (`packages/code-block/src/lib/withInsertFragmentCodeBlock.ts:18-66`). Plate must not grow a product fitter.
- **Target internal TypeScript:**

```ts
type FitTarget =
  | Readonly<{ kind: 'range'; range: Range; root: RootKey }>
  | Readonly<{ kind: 'root'; root: RootKey }>;

type FitResult = Readonly<{
  change: DocumentChange;
  provenance: FitProvenance;
  selection?: Selection;
}>;

interface CompiledSliceFitter {
  fitDocument(input: Readonly<{
    draft: ChangeDraft;
    slice: ContentSlice;
    target: FitTarget;
  }>): FitResult | null;

  fitContent(input: Readonly<{
    parent: Element;
    root: RootKey;
    slice: ContentSlice;
  }>): readonly Descendant[] | null;
}

function compileSliceFitter(
  schema: CompiledEditorSchema
): CompiledSliceFitter;
```

- **Simple application usage:** Unchanged:

```ts
editor.update((tx) => {
  tx.slice.replace(ContentSlice.closed(fragment));
});
```

- **Advanced usage:** Preview an atomic spec without publishing, then dispatch it:

```ts
const spec = editor.read((state) =>
  state.slice.fit(slice, { at: selection })
);
if (spec) editor.update(spec);
```

- **Extension-author usage:** Product middleware composes around `editorCommands.replaceSlice`, modifies only the immutable `ContentSlice`, and calls `next` (`packages/code-block/src/lib/withInsertFragmentCodeBlock.ts:18-66`). No extension sees candidate costs/tokens.
- **Host usage:** Plite DOM parses exact slices, then `insertHostData` dispatches `replaceSlice` once (`packages/plite-dom/src/plugin/host-codec.ts:626-695`). Clipboard/parser code never guesses a parent or calls fitter internals.
- **Compiled representation:** One frozen artifact contains candidate-family descriptors, stable family/tie ordering, boundary/content programs, wrapper plans, construction references, and the owning schema identity/revision. Per-call frontier/search state is ephemeral. Prepared content variants remain weakly cached by `ContentSlice`; no editor/document strong map.
- **Target invariants:** Same public fit result for every input; no mutation or publication on failure; one canonical construction authority; stable candidate/tie order; exact open-depth preservation; explicit root context; compiled artifact belongs to exactly one schema revision; no product policy.
- **Reconfiguration/runtime lifecycle:** Compile the fitter during schema candidate preparation; validate it before publication; publish schema and fitter atomically; discard the old fitter/cache when the schema revision changes; a stale transaction spec is rejected by the existing publication lifecycle.
- **Target shape:** The fitter becomes a recognizable private compiled subsystem, not a public abstraction. Wordgard’s cohesion is adopted; its algorithms and split owners are not.
- **Public breaks:** None. Any new public export is a packet failure.
- **Plite adoption:** `createEditorSchema`, state slice reads, transaction slice replacement, schema construction, clipboard insertion, and tests delegate to the compiled fitter. Internal imports use P-DOC-2 builder/change modules.
- **Plate adoption:** None beyond proof. Existing slice middleware and commands keep the same API and inference.
- **Downstream adoption:** Apps and plugins require no source change; apps/plite supplies focused browser proof.
- **Deletion scope:** Every fit-specific type/helper/frontier/cache/candidate implementation in `editor-schema.ts` after delegation; any duplicated wrapper/canonicalization helper whose behavior is already supplied by compiled schema construction. “No deletion yet” is not allowed: the packet exits only after old owners are gone.
- **Focused unit proof:** Fixture-by-fixture output equivalence; candidate tie order; wrapper/isolating/defining/root cases; malformed slice throws; unfit slice returns false and publishes nothing; revision swap uses the new fitter.
- **Generated/property/fuzz laws:** Preserve `packages/plite/test/slice-fit-laws.test.ts:300-609`; generate schemas/slices/targets and prove deterministic output, immutable input, valid result, convergence after mapping, and no publication on failure.
- **Browser proof:** Required focused apps/plite copy/paste, open inline/block slices, table/code block insertion, selection placement, named root, and projected-root cases. Native Chrome is N/A because the packet changes no browser-native transfer API; ordinary Browser proof is enough.
- **Benchmark:** Required: `benchmarks/editor/benchmarks/plite-fit-content-locality-benchmark.ts:221-280`, content-slice value, correction worklist, schema construction, and huge-document insertion. Preserve locality and allocation thresholds.
- **Failure modes:**
  1. Candidate family or tie order changes during extraction. **Blast radius:** paste/drop/insert output and final selection across all schemas. **Stop/rollback:** stop on the first fixture/generated output delta, restore exact order, and revert P-DOC-3 if equivalence cannot be proved.
  2. A fitter survives its schema revision or reads a stale construction plan. **Blast radius:** transactional reconfiguration can publish schema-invalid documents. **Stop/rollback:** immediate stop on revision test failure; revert the compiled publication change and keep the old single owner until atomic invalidation is correct.
  3. Schema helpers are copied into the fitter instead of referenced. **Blast radius:** construction/default/wrapper laws diverge between validation and insertion. **Stop/rollback:** stop when the deletion/definition scan finds two owners; remove the copy or revert the extraction.
  4. Frontier preparation or search loses locality. **Blast radius:** large paste and huge-document latency. **Stop/rollback:** stop at benchmark threshold breach; restore lazy structures or revert the packet, never accept the regression as cleanup cost.
- **Exit condition:** Public API diff is empty; all fit/schema/change/history/Yjs tests pass; focused browser proof and benchmarks pass; `editor-schema.ts` contains only schema APIs plus one fitter delegation boundary.
- **Hard deletion gate:** Bounded symbol/import scan finds one definition for every candidate/frontier/cost/boundary helper, all under `core/slice-fit/**`; no fit cache survives outside the compiled artifact/content-slice owner.
- **Rollback answer:** Revert the internal extraction as one packet. No public or persisted migration exists. Never keep both fitters behind a flag: dual behavior would destroy determinism.

### P-DOC-4 — One slice-native Plate product codec architecture

- **Concept IDs:** DOC-026, DOC-027, DOC-029, DOC-030, DOC-031, DOC-032, DOC-033, and the Plate half of DOC-034.
- **Decision owner:** Plate Plan, with Plite Plan review only if implementation proves a missing generic host-codec primitive. The source audit found no such gap.
- **Execution skill:** `plate-plan` in accepted execution mode; use `tdd` for the first vertical format and `components` only if authoring types need React-facing integration.
- **Final owner:** Public product codec API and compiler in `@platejs/core`; generic host runtime remains `@platejs/plite-dom`; format meaning remains in each product plugin.
- **Prerequisites:** P-DOC-1 readonly types if already scheduled; otherwise the codec API must use readonly contexts from day one. Inventory every `plugin.parser`, `parsers.<format>.serializer`, manual `hostCodecs` registration, parser pipeline transform, format query, schema target, app/docs use, and custom plugin fixture.
- **Dependent packets:** P-DOC-5 builds the HTML node-rule compiler on this lifecycle. Every non-HTML format plugin migration is part of this packet’s exit gate.
- **Entry condition:** Current Markdown parse/query/serialize, clipboard fallback, schema-target conflicts, parser transforms, revision cache, and browser copy/paste behavior have focused tests. The inventory names every current non-HTML format owner.
- **Exact implementation scope:** Add one inferred MIME-keyed `codecs` object to `BasePlugin`; compile installed declarations to Plite DOM `HostCodec` registrations; derive owner identity and ordinary element/property claims from the owning plugin and compiled Plate model; allow explicit `scope: 'document'` only for whole-schema formats; make decode return `ContentSlice | null`; make encode consume an exact slice; fold parser data/fragment transforms into codec decode composition; migrate Markdown and every non-HTML format parser/serializer; remove `Parser`, generic `parsers.*.serializer`, manual product `hostCodecs`, and `ParserPlugin`’s forced closed conversion. Do not add `definePlateCodec`, a duplicate public codec `key`, ordinary-path `targets`, or redesign HTML node rules here.
- **Current shape:** Wordgard has one bidirectional but core-coupled DOM codec; Plite DOM has the right generic slice/MIME lifecycle; Plate splits decode, encode, transforms, and manual host registration across separate owners.
- **Current Wordgard shape and lifecycle:** Schema node/mark shapes compile into one DOM parser/serializer pair (`../wordgard/src/doc/shape.ts:362-469`, `../wordgard/src/doc/parse.ts:146-239`, `../wordgard/src/doc/serialize.ts:109-200`). It is bidirectional and ordered, but DOM is embedded in the document package, parsing mutates context, and slice parents are guessed.
- **Current Plite shape and lifecycle:** `HostCodec` already accepts readonly state/source, returns exact `ContentSlice`, serializes exact slices, claims schema resources, reports owner/format/phase failures, rejects conflicts at configuration, caches by extension registry, and fits once at insertion (`packages/plite-dom/src/plugin/host-codec.ts:36-155`, `packages/plite-dom/src/plugin/host-codec.ts:353-565`, `packages/plite-dom/src/plugin/host-codec.ts:626-730`).
- **Current Plate shape and lifecycle:** `Parser.deserialize` returns an array (`packages/core/src/lib/plugin/BasePlugin.ts:321-335`); `ParserPlugin` prepares the model-derived target and forces `ContentSlice.closed` (`packages/core/src/lib/plugins/ParserPlugin.ts:27-127`); parser registries cache by plugin list/model revision (`packages/core/src/internal/plugin/prepareParserRegistry.ts:55-66`, `packages/core/src/internal/plugin/prepareParserRegistry.ts:191-254`). Markdown parses through `parser` but serializes through a manual host extension (`packages/markdown/src/lib/MarkdownPlugin.ts:55-111`). Serializer declarations exist without a core runtime reader (`packages/core/src/lib/plugin/BasePlugin.ts:359-367`, `packages/core/src/lib/plugin/BasePlugin.ts:481-495`; bounded `rg -n "serializer" packages/core/src`).
- **Target public TypeScript:** The authoring type is inferred through
  `createBasePlugin`; no helper call or public compiler representation appears
  on the normal path. A reusable extracted declaration earns an exported helper
  type only after a real second call site proves inline inference insufficient.

- **Simple application/plugin usage:**

```ts
const MarkdownPlugin = createBasePlugin({
  key: 'markdown',
  codecs: {
    'text/markdown': {
      scope: 'document',
      decode: ({ data, plugin, state }) =>
        ContentSlice.closed(decodeMarkdown(data, { plugin, state })),
      encode: ({ plugin, slice, state }) =>
        encodeMarkdown(slice.content, { plugin, state }),
    },
  },
});
```

- **Advanced multi-format usage:**

```ts
const DataPlugin = createBasePlugin({
  key: 'records',
  codecs: {
    'text/csv': {
      priority: 20,
      query: ({ source }) => !source.files.length,
      decode: ({ data, state }) =>
        ContentSlice.closed(parseRows(data, state.schema)),
      encode: ({ slice }) => serializeRows(slice.content),
    },
    'application/json': {
      decode: ({ data }) => ContentSlice.fromJSON(JSON.parse(data)),
      encode: ({ slice }) => JSON.stringify(slice),
    },
  },
});
```

- **Extension-author usage:** A configured codec callback receives the same immutable `plugin.options`, compiled references, editor state view, exact source formats/files, and lifecycle identity on every direction. It returns data only; it does not install extensions manually or call insertion APIs.
- **Host usage:** Plate compiles declarations into one Plite DOM registration:

```ts
type CompiledPlateCodec = Readonly<{
  owner: string;
  format: string;
  parseClaims: readonly HostCodecSchemaTarget[];
  serializeClaims: readonly HostCodecSchemaTarget[];
  order: readonly [pluginPriority: number, codecPriority: number, owner: string];
  parse?: HostCodec['parse'];
  query?: HostCodec['query'];
  serialize?: HostCodec['serialize'];
}>;
```

Clipboard calls only `insertHostData`/`writeHostFragmentData`; parsed slices fit once through Plite. React/static rendering does not implement `encode`.

- **Compiled representation:** The Plate model compiler resolves the owner from the plugin key, the format from the object key, ordinary target bindings from that plugin's schema contribution, whole-schema scope, direction, priority, and stable owner identity. It freezes private `CompiledPlateCodec[]`, validates unknown scope/noncomposable claims, and publishes one `hostCodecs` extension. Cache identity is the compiled Plate model revision plus installed plugin list.
- **Target invariants:** One MIME-keyed declaration owns decode and encode for a format within one plugin; decode always returns exact slice or null; ordinary targets derive from the owner plugin's schema bindings; whole-document scope is explicit; equal-priority competing claims fail before publication; format fallback is deterministic; fitting occurs once in Plite; React rendering stays separate; callback state/options/source are readonly; helper wrappers never duplicate identity.
- **Reconfiguration/runtime lifecycle:** Candidate plugin configuration compiles schema/model first, then codecs against that candidate; conflicts or callback descriptor errors reject the candidate atomically. Successful publication swaps model and codec registry together. Runtime callback failure reports plugin/key/format/direction and delegates to the next format registration without mutating editor state.
- **Target shape:** Plate authors one inline product-facing codec declaration under its owning plugin; Plite DOM remains the generic MIME/slice/lifecycle engine. This takes Wordgard’s bidirectional cohesion and explicit order without adding a second descriptor factory or moving product DOM/Markdown policy into Plite.
- **Public breaks:** `parser`, parser data/fragment transforms, `parsers.<format>.serializer`, and manual product `hostCodecs` registration stop being supported. Decode callbacks return `ContentSlice`, never arrays. No dual API or compatibility wrapper.
- **Plite adoption:** No semantic or public Plite change. `plite-dom` may gain only internal typing hooks proven necessary by implementation; any proposed generic API expansion returns to Plite Plan.
- **Plate adoption:** `packages/core` adds declarations/compiler/runtime and deletes parser owners. Markdown is the first vertical proof; every current non-HTML importer/exporter migrates before packet exit.
- **Downstream adoption:** Plate plugins, custom format plugins, kits, registry source, apps/www docs/examples, apps/plite proof, fixtures, and downstream callers migrate. CI-owned templates are regenerated only by CI.
- **Deletion scope:** `Parser` type and `BasePlugin.parser`; generic `parsers.*.serializer`; `ParserPlugin`’s format registry and forced close; data/fragment pipeline owners superseded by codec composition; Markdown manual host extension; stale docs/tests; any draft `definePlateCodec`, public codec `key`, or ordinary `targets` field. HTML `parsers.html` remains a private, explicitly named temporary owner only until P-DOC-5, because its node-rule model requires composability. Its hard removal gate is P-DOC-5’s zero-declaration scan.
- **Focused unit proof:** Inline callback inference for plugin-owned and document-scoped codecs; unknown scope/direction and competing-claim diagnostics; stable order; query delegation; callback error isolation; configuration revision invalidation; closed/open slice decode/encode; Markdown parity.
- **Generated/property/fuzz laws:** Generate codec/plugin permutations and prove stable ordering independent of object enumeration; generate disjoint/overlapping claims and prove only noncomposable conflicts fail; generate valid slices and prove encode/decode preserves openness/content for round-trippable codecs; fuzz malformed host data and prove no publication.
- **Browser proof:** Required: Markdown plain-text/Markdown copy/paste, MIME preference/fallback, exact open inline/block slices, code blocks, named/projected roots, configuration replacement, and error delegation in apps/plite. Native Chrome is required only for platform clipboard format retention that Browser cannot expose; document that boundary instead of lowering the claim.
- **Benchmark:** Required: clipboard large-payload parse/serialize, registry compilation/reconfiguration, and content-slice insertion. No regression in payload size, callback count, or duplicate fitting.
- **Failure modes:**
  1. Compiled priority changes MIME preference or fallback. **Blast radius:** every paste/import path and format plugin. **Stop/rollback:** stop on ordering/browser mismatch, restore the captured order law, and revert P-DOC-4 if one registry cannot reproduce it deterministically.
  2. A migrated decoder closes an open slice or fitting runs twice. **Blast radius:** inline/block paste structure, tables/code blocks, and selection placement. **Stop/rollback:** immediate stop on openness/callback-count proof; repair the codec return or revert that whole vertical migration before merging.
  3. Claim compilation rejects valid disjoint/composable product codecs or permits competing whole-schema owners. **Blast radius:** editor configuration and all format handling. **Stop/rollback:** stop before publication, refine claim composition in the compiler, and revert the packet if deterministic configuration cannot be proved.
  4. Old parser and new codec both register a format. **Blast radius:** duplicate callbacks, nondeterministic fallback, and double serialization. **Stop/rollback:** hard stop; delete the old owner in the same change or revert the new registration. Dual ownership never ships.
- **Exit condition:** Every non-HTML product format uses the inline MIME-keyed codec declaration; Markdown has one registration; parser/serializer tests and browser proof pass; typecheck and Plate/Plite handoff gates pass; old generic parser surface and rejected descriptor helpers are gone.
- **Hard deletion gate:** Bounded scans return zero `BasePlugin.parser`, zero `ParserPlugin`, zero non-HTML `parsers.*.serializer`, and zero product-installed `hostCodecs` for migrated formats. The only temporary old owner allowed is HTML node declarations, named and removed by P-DOC-5.
- **Rollback answer:** Revert the complete codec compiler plus migrated formats before P-DOC-5 starts. Never leave both parser and codec registration live, even behind priority; that would make fallback and ownership unknowable.

### P-DOC-5 — Compiled bidirectional HTML node codec

- **Concept IDs:** DOC-028, DOC-029, DOC-030, DOC-031, DOC-032, DOC-033, and the remaining Plate half of DOC-034.
- **Decision owner:** Plate Plan.
- **Execution skill:** `plate-plan` in accepted execution mode; use `tdd` for rule-model laws and `browser:control-in-app-browser` for ordinary proof, escalating to Chrome only for native clipboard behavior.
- **Final owner:** HTML document codec compiler/runtime in `@platejs/core`; HTML node/mark meaning in each Plate product plugin; MIME/slice lifecycle in `@platejs/plite-dom`; React rendering remains `@platejs/core`/product UI.
- **Prerequisites:** P-DOC-4’s codec lifecycle, target claims, readonly callback contexts, and one published host-codec registry. Complete inventory of every `parsers.html` declaration, injected HTML parser, static/export serializer, HTML helper, and browser fixture.
- **Dependent packets:** Product plugin-family migrations are substeps of this packet, not deferred cleanup. No later packet is allowed to own deletion of the old HTML registry.
- **Entry condition:** Current HTML parse fixtures, plugin ordering, mark accumulation, data attributes, voids, line breaks, lists/tables/media/annotations, static rendering, clipboard, and large-payload baselines are recorded. Every rule has a target plugin and intended encode behavior or an explicit decode-only product decision.
- **Exact implementation scope:** Add one inferred `host.html` contribution to the owning plugin under P-DOC-4; compile all installed contributions into one private document-level `text/html` codec; infer owner and normal target from the plugin/schema binding; model composable mark/property accumulation separately from exclusive element/document claims; compile stable priority/order and reject unresolved overlap; migrate every HTML declaration and injected rule; implement encode traversal/mark wrapping; keep contextual fitting in Plite; keep React/static presentation separate; remove old HTML parser types, prepared registry, runtime, implicit reverse order, serializer declarations, and any draft descriptor helper in the same landed packet.
- **Current shape:** Wordgard compiles ordered bidirectional shapes in core; Plite DOM owns generic host lifecycle; Plate owns richer product rules but only decode is live and precedence is implicit.
- **Current Wordgard shape and lifecycle:** Node/mark `Shape` values compile into parser rules and serializer wrappers (`../wordgard/src/doc/shape.ts:362-469`, `../wordgard/src/doc/parse.ts:146-239`, `../wordgard/src/doc/serialize.ts:109-200`). Numeric precedence and a wrapper stack are coherent. However, parse context is mutable, parent placement is guessed, DOM belongs to core schema, and no React/multi-format/configuration publication boundary exists.
- **Current Plite shape and lifecycle:** Plite DOM owns the generic exact-slice HTML host boundary, conflict diagnostics, callback failure isolation, and insertion (`packages/plite-dom/src/plugin/host-codec.ts:36-155`, `packages/plite-dom/src/plugin/host-codec.ts:353-553`, `packages/plite-dom/src/plugin/host-codec.ts:626-730`). Plite core owns fitting. Neither package should know Plate’s `<strong>`, table, media, or annotation policy.
- **Current Plate shape and lifecycle:** Product plugins declare decode-only rules such as bold (`packages/basic-nodes/src/lib/BaseBoldPlugin.ts:5-30`). `prepareParserRegistry` freezes rules and caches them by model revision (`packages/core/src/internal/plugin/prepareParserRegistry.ts:55-150`, `packages/core/src/internal/plugin/prepareParserRegistry.ts:191-254`). Element parsing chooses the first match in reverse plugin order while leaf marks accumulate in reverse order (`packages/core/src/internal/plugin/html-parser-runtime.ts:211-245`); recursive DOM conversion mutates/interprets children (`packages/core/src/internal/plugin/html-parser-runtime.ts:278-440`). Static HTML is React rendering, a separate presentation owner (`packages/core/src/static/renderStaticHtml.tsx:20-77`).
- **Target public TypeScript:** `createBasePlugin` infers the rule callbacks,
  owner, and target. The inline contribution is part of P-DOC-4's single
  `text/html` codec, not a second host registry. No
  `definePlateHtmlNodeCodec`, duplicate public `key`, or ordinary `target`
  field exists.

- **Simple mark-plugin usage:**

```ts
const BoldPlugin = createBasePlugin({
  key: 'bold',
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  host: {
    html: {
      match: [
        { tag: ['STRONG', 'B'] },
        { style: { fontWeight: ['600', '700', 'bold'] } },
      ],
      decode: () => ({ bold: true }),
      encode: ({ value }) => (value.bold ? { tag: 'strong' } : null),
    },
  },
});
```

- **Advanced element-plugin usage:**

```ts
const TablePlugin = createBasePlugin({
  key: 'table',
  schema: tableSchema,
  host: {
    html: {
      priority: 40,
      match: [{ tag: ['TABLE'] }],
      decode: ({ element }) => ({
        type: 'table',
        ...(element.dataset.layout
          ? { layout: element.dataset.layout }
          : {}),
      }),
      encode: ({ node }) => ({
        attributes: node.layout
          ? { 'data-layout': String(node.layout) }
          : {},
        tag: 'table',
      }),
    },
  },
});
```

Child traversal, open-slice construction, escaping, void handling, and wrapper composition are runtime responsibilities, not repeated in each plugin.

- **Extension-author usage:** The normal contribution targets its owning plugin automatically. An injected contribution names an explicit installed plugin reference only when it genuinely extends another plugin's schema claim. A comment/suggestion extension may contribute a composable property wrapper to a paragraph/text target; it cannot silently win because it appears later in the plugin array.
- **Host usage:** P-DOC-4 compiles all HTML node contributions into exactly one `HostCodec`:

```ts
defineHostCodec({
  key: 'plate:html',
  format: 'text/html',
  schema: compiledClaims,
  parse: ({ data, state }) =>
    compiledHtmlCodec.decode(data, state),
  serialize: ({ slice, state }) =>
    compiledHtmlCodec.encode(slice, state),
});
```

The result is an exact `ContentSlice`; `insertHostData` fits it once.

- **Compiled representation:**

```ts
type CompiledPlateHtmlRule = Readonly<{
  claim: CompiledSchemaClaim;
  compose: 'element-exclusive' | 'property-accumulate' | 'wrapper-stack';
  decode?: CompiledHtmlDecode;
  encode?: CompiledHtmlEncode;
  match: CompiledHtmlMatcher;
  order: readonly [
    pluginPriority: number,
    rulePriority: number,
    ownerKey: string,
  ];
  owner: string;
}>;
```

One frozen artifact holds tag/attribute/style indexes, element-exclusive winners, property accumulators, serializer lookup by compiled schema target, wrapper order, and the owning Plate model revision. Match compilation is data-only; callback execution receives immutable state/options.

- **Target invariants:** One HTML host codec; plugin identity supplies stable owner and ordinary target; exclusive element claims cannot overlap unresolved; property marks compose deterministically; wrapper order is stable; decode and encode share the same target identity; exact slices preserve openness; escaping/attributes are centralized; fitting happens once in Plite; React presentation is not serialization; configuration failures publish nothing; helper wrappers never duplicate rule identity.
- **Reconfiguration/runtime lifecycle:** During candidate Plate model compilation, resolve plugin references and schema targets, compile matcher/serializer indexes, detect conflicts, and freeze the artifact. Publish model plus HTML codec atomically. On reconfiguration, replace the entire artifact and invalidate the old weak cache. Runtime rule failure is reported with owner/key/direction/DOM context and delegates only where the compiled claim permits.
- **Target shape:** Wordgard’s explicit rule compilation and mark wrapper stack are adopted as principles. Plate retains richer product rules and React UI; Plite retains host and fit law. Nominal shapes, mutable parse context, parent guessing, and implicit array order are rejected.
- **Public breaks:** `parsers.html.deserializer`, `parsers.html.serializer`, injected parser projections, old HTML rule types, and order-by-plugin-position stop compiling. Plugins declare bidirectional node codecs. Decode-only is allowed only when the product truly has no representable encode path and its type documents that loss; it cannot claim round-trip support.
- **Plite adoption:** None. Plite DOM receives one compiled `HostCodec`; Plite core fits the returned slice.
- **Plate adoption:** Core compiler/runtime and every plugin with HTML rules migrate: basic nodes/marks, links, lists, tables, media, code blocks, indentation/alignment/font properties, comments/suggestions, and any injected rules.
- **Downstream adoption:** Kits, registry source, docs/examples, apps/www, apps/plite, static/export callers, custom plugin fixtures, and external plugin authors migrate. React components keep existing render contracts.
- **Deletion scope:** `HtmlDeserializer`/`HtmlSerializer` plugin declarations; `prepareParserRegistry` HTML rule owner; `html-parser-runtime` old traversal/matching pipeline; reverse-order decisions; injected parser projections; dead serializer declarations; any draft `definePlateHtmlNodeCodec`, public rule `key`, or ordinary `target`; architecture-only tests/docs. The packet is prepared as one branch and lands only after all families migrate, so no dual global registry ships.
- **Focused unit proof:** Tag/style/attribute matching; exclusive conflicts; composable property accumulation; stable priority/owner tie order; wrapper nesting; voids/line breaks/data attributes; unknown targets; candidate revision invalidation; failure isolation; decode-only claim diagnostics; each major plugin family.
- **Generated/property/fuzz laws:** Generate plugin/rule permutations and prove identical compiled order/output; generate composable mark sets and prove decode/encode normalization and wrapper stability; fuzz DOM trees/attributes/styles and prove no mutation, no throw outside reported lifecycle, schema-valid slices or null, and deterministic output; round-trip representable schema nodes.
- **Browser proof:** Required: apps/plite HTML copy/paste for inline marks, blocks, lists, tables, code blocks, media, annotations, open slices, named roots, projected roots, and configuration replacement. Use Browser for normal DOM/clipboard proof. Use Chrome plus Computer only for native clipboard flavor retention, platform-produced HTML, or permission UI that Browser cannot inspect.
- **Benchmark:** Required: large HTML payload parse/serialize, matcher lookup, wrapper-heavy marks, table/media documents, clipboard payload, registry compilation, and huge-document insertion. Compare callback counts and allocations as well as wall time.
- **Failure modes:**
  1. Conflict compilation treats composable mark/property rules as exclusive. **Blast radius:** bold/italic/font/annotation combinations and editor configuration. **Stop/rollback:** stop on permutation/composition failure, repair claim mode before migrating further, and revert P-DOC-5 if accumulation cannot remain deterministic.
  2. Encode/decode target identity or wrapper order drifts. **Blast radius:** clipboard/export round trips, nested marks, tables/media, and downstream stored HTML. **Stop/rollback:** stop on family round-trip/golden mismatch; revert the entire unpublished migration branch or landed packet, never patch output with plugin-order hacks.
  3. Old and new HTML registries both decide a node. **Blast radius:** all HTML paste, duplicated marks, and nondeterministic elements. **Stop/rollback:** hard stop before merge; finish atomic migration/deletion or revert the new compiler. No runtime flag permits both.
  4. Matcher compilation or traversal regresses large payloads. **Blast radius:** paste latency and browser responsiveness. **Stop/rollback:** stop at matcher/callback/allocation threshold breach; fix indexing/traversal or revert the packet.
  5. Static React rendering is accidentally reused as codec encode policy. **Blast radius:** UI components become persistence dependencies and headless export breaks. **Stop/rollback:** stop on owner/import audit failure; restore independent static rendering and codec serialization or revert.
- **Exit condition:** Every HTML rule is migrated; one compiled HTML codec owns both directions; product tests/typecheck and strict handoff pass; browser/native-required proof passes; benchmark gates pass; React static output remains independently green.
- **Hard deletion gate:** Bounded scans return zero `parsers.html`, zero old `HtmlDeserializer`/`HtmlSerializer` declarations, zero `prepareParserRegistry`/old HTML runtime ownership, and zero implicit `reverse()` order decisions. Exactly one `text/html` host codec is published.
- **Rollback answer:** Revert the entire unlanded/landed packet to the old HTML registry. During development, migrate bounded plugin families behind the unpublished compiler branch; never ship or merge a state where old and new global registries both decide HTML.

### Normalized STATE packet dossiers

#### STATE-P1 — deterministic logical word-boundary proof

- **Concept IDs:** STATE-018. STATE-016/017 are preserved invariants, not changed concepts.
- **Decision owner:** Plite Plan.
- **Execution skill:** `tdd`, then `testing`.
- **Final owner:** `packages/plite/test` for donor-derived cases; `packages/plite/src/utils/string.ts` or `packages/plite/src/editor/positions.ts` only if an accepted case exposes a production defect.
- **Prerequisites:** Current deterministic Unicode profile at `packages/plite/src/utils/string.ts:77-180`; current structural movement at `packages/plite/src/editor/positions.ts:186-337`; a frozen translation ledger for `../wordgard/test/test-selection.ts:161-219`.
- **Dependent packets:** STATE-P2 may share grapheme fixtures. PRODUCT Packet 4 consumes the proven logical/host split but does not depend on production changes.
- **Entry condition:** Every donor word test is classified as equivalent, newly valuable, or incompatible with the deterministic Plite profile; expected offsets are manually verified against the string itself rather than copied as an opaque donor oracle.
- **Exact implementation scope:** Add table-driven punctuation, surrounding-whitespace, forward/backward block-boundary, RTL logical-run, CJK scalar, combining-mark, emoji ZWJ/tag/keycap, adjacent formatted-leaf, and inline-void cases. Production changes are out of scope unless a case demonstrates a documented Plite semantic defect.
- **Current shape:** Wordgard uses host-dependent segmentation over global positions; Plite owns deterministic logical segmentation and structural mapping; Plate correctly has no duplicate segmenter.
- **Target shape:** Keep Plite's public/runtime architecture and close only the deterministic proof gap with donor-derived and generated cases.

**Current Wordgard shape**

- Owner/API: `wordAt` and `skipWord` call `Intl.Segmenter` and return distances through global numeric positions at `../wordgard/src/state/selection.ts:516-574`.
- Lifecycle: segmentation data is obtained from the current host ICU at runtime; command movement consumes it immediately.
- Strength: compact logic and unusually useful forward/backward cases at `../wordgard/test/test-selection.ts:161-219`.
- Limitation: output can vary by engine/ICU version and the implementation does not own Plite's structural leaves, roots, or selection protocol.

**Current Plite shape**

- Owner/API: selection movement already exposes the product-neutral `unit: 'word'` contract; deterministic classification lives at `packages/plite/src/utils/string.ts:77-180`.
- Internal flow: string distances are mapped over structural leaves by `packages/plite/src/editor/positions.ts:186-337` and `packages/plite/src/editor/positions.ts:523-604`, then one selection transaction commits.
- Lifecycle: no host-global segmenter data; behavior is fixed by the repository Unicode profile and updates only when that owner intentionally changes.
- Current proof: `packages/plite/test/utils/string.ts:158-205` covers English, apostrophes, emoji, and direction but not all donor punctuation/block cases.

**Current Plate shape**

- Owner: no word segmentation algorithm in audited Plate core; `packages/core/src/lib/editor/withPlite.ts:320-412` installs/consumes Plite commands.
- Lifecycle/callers: product shortcuts or controls invoke generic movement; Plate neither caches nor reinterprets word boundaries.
- Absence verdict: correct. A Plate segmenter would duplicate generic model semantics.

**Target shape and usage**

Public API is unchanged:

```ts
editor.update((tx) => {
  tx.selection.move({ distance: 1, unit: 'word' });
});
```

Test-only internal representation:

```ts
type WordBoundaryCase = Readonly<{
  label: string;
  text: string;
  forward: readonly number[];
  backward: readonly number[];
}>;
```

- Simple app usage: unchanged movement commands.
- Advanced usage: custom commands compose the same Plite selection transaction; there is no exported segmenter service.
- Extension-author usage: unchanged command middleware around the semantic movement command.
- Host usage: none; logical word movement remains host-independent.
- Compiled representation: N/A. Cases are static proof data; production uses the existing Unicode tables.
- Invariants: every step is positive; forward steps consume the string once; reverse steps consume it once backward; no step splits a grapheme/emoji sequence; structural mapping preserves boundaries across leaves.
- Configuration/reconfiguration: N/A because this packet adds no configuration.
- Runtime characteristics: unchanged unless proof exposes a defect; no `Intl.Segmenter`, allocation, or cache is added.

- **Target score:** `5/5/5/5/5/5/5/5=40`; deterministic semantics plus complete focused proof close STATE-018's `+3`.
- **Public breaks:** None.
- **Plite adoption:** New focused test rows; production owner touched only on a proven failing law.
- **Plate adoption:** N/A; no Plate API or behavior owner changes.
- **Downstream adoption:** No caller changes. Docs change only if a production semantic correction changes documented movement.
- **Deletion scope:** No current code deletion. Hard non-adoption of Wordgard `Intl.Segmenter`, `wordAt`, numeric positions, and runtime algorithm.
- **Focused unit proof:** `packages/plite/test/utils/string.ts` plus focused cross-leaf/inline-void transaction cases.
- **Generated/property/fuzz laws:** Generate strings from whitespace, punctuation, combining sequences, CJK, RTL, and emoji clusters; assert positive progress, full consumption, reverse consistency where the profile promises it, and no grapheme split. Every failure prints a deterministic seed and minimized string.
- **Browser proof:** N/A. This packet claims logical model movement independent of browser visual order; STATE-P2 owns native visual proof.
- **Benchmark:** N/A unless production changes. Pure test-data adoption makes no runtime performance claim.
- **Exit condition:** Every accepted case passes deterministically on the current runtime; any source fix has its own behavior explanation and changeset decision.
- **Hard deletion gate:** Not a current-code deletion. The gate is a source audit proving no `Intl.Segmenter` or donor segmentation implementation was added.
- **Rollback answer:** Revert new test rows if an expected value is proven wrong. If a production fix was necessary, revert that fix and its new semantic claim together; do not weaken tests to preserve a bug.
- **Failure modes:** (1) copied offsets encode donor ICU rather than Plite law, limited to false test failures; stop and manually recompute; (2) a case changes documented movement, affecting every editor caller; stop and split a behavior packet; (3) generated data permits zero-length steps, risking infinite movement loops; reject the generator and keep production unchanged.

#### STATE-P2 — browser-native mixed-bidi caret proof

- **Concept IDs:** STATE-020, preserving STATE-016/017 selection invariants.
- **Decision owner:** Plite Plan.
- **Execution skill:** `testing` with Browser; `game-playtest` is not applicable.
- **Final owner:** `apps/plite/tests/plite-browser/donor/examples/plaintext.test.ts` or the current equivalent plaintext browser owner; add `packages/plite-dom/test/bridge.ts` only for a missing generic DOM/model invariant.
- **Prerequisites:** Existing direction-aware geometry at `packages/plite-dom/src/plugin/dom-geometry.ts:408-596`; native keyboard routing at `packages/plite-react/src/editable/keyboard-input-strategy.ts:596-652`; classified fixture strings from `../wordgard/test/test-selection.ts:102-159`.
- **Dependent packets:** PRODUCT Packet 4 writing direction. C09 is already a
  no-execution keep decision; this proof does not reopen a geometry facade.
- **Entry condition:** A runnable Plite plaintext example accepts explicit `dir`/container direction and exposes DOM/model selection snapshots after native keyboard events.
- **Exact implementation scope:** Add native ArrowLeft/ArrowRight traversal for mixed Hebrew/Latin, punctuation/brackets, isolates, an inline-format split, and a grapheme in both LTR and RTL containers. Assert DOM/model agreement after each native step and full cleanup.
- **Current shape:** Wordgard predicts visual order in the model; Plite delegates visual order to browser geometry and imports native selection; Plate lacks a direction product feature but owns no bidi engine.
- **Target shape:** Preserve browser-native visual order and add cross-engine
  DOM/model synchronization proof; PRODUCT Packet 4 separately adds explicit
  Plate `ltr`/`rtl` writing direction with absence meaning auto.

**Current Wordgard shape**

- Owner/API: `BidiSpan`, `computeOrder`, and `TextblockMap` flatten model content, implement a reduced UAX #9, and predict visual movement at `../wordgard/src/state/bidi.ts:1-409` and `../wordgard/src/state/textblock.ts:139-224`.
- Lifecycle: a cached textblock map derives order from model text; shared scratch arrays participate in ordering.
- Strength: mixed-direction fixtures at `../wordgard/test/test-selection.ts:102-159`.
- Limitations: incomplete bracket data, unreachable logical-position admission, no browser-layout authority, and no cross-engine proof.

**Current Plite shape**

- Owner/API: `plite-dom` measures DOM ranges, graphemes, and direction-aware edges at `packages/plite-dom/src/plugin/dom-geometry.ts:408-596` and `packages/plite-dom/src/plugin/dom-geometry.ts:1041-1217`.
- Host flow: native keyboard events run through `packages/plite-react/src/editable/keyboard-input-strategy.ts:596-652`; DOM selection is imported into the structural Plite selection protocol.
- Lifecycle: visual order is measured per mounted root/DOM state, not persisted in model state.
- Current proof: unit geometry/bridge coverage exists, but no complete donor mixed-bidi native traversal row exists.

**Current Plate shape**

- Owner: no generic bidi engine; Plate alignment exists at `packages/basic-styles/src/lib/BaseTextAlignPlugin.ts:14-79`.
- Product gap: audited Plate packages have no explicit text-direction feature; PRODUCT Packet 4 owns that product property/UI.
- Lifecycle: Plate renderers consume DOM/model selection; they should not predict bidi order.

**Target shape and usage**

Public model API remains unchanged. Test-only host fixture:

```ts
type NativeCaretFixture = Readonly<{
  label: string;
  direction: 'ltr' | 'rtl';
  text: string;
  stableOffsets?: readonly number[];
}>;
```

Simple app usage after the dependent Plate packet:

```tsx
<PlateContent dir="auto" />
```

- Advanced usage: a product may set explicit block/root `dir`; native movement still belongs to the browser.
- Extension-author usage: none in this packet; no bidi callback or span API is exported.
- Host usage: Browser sends native key events and captures both DOM and model selection.
- Compiled representation: N/A. The browser layout engine is the visual-order owner; fixtures are static proof inputs.
- Invariants: DOM and model selection agree after every step; no grapheme is split; root direction does not leak; focus and cleanup remain local.
- Configuration/reconfiguration: direction changes rerender through current host state; no cached model bidi state survives.
- Runtime characteristics: zero production runtime change unless a failing host invariant reveals a separate accepted bug.

- **Target score:** `5/5/5/5/5/5/5/5=40`; the only current deficit is real-browser proof.
- **Public breaks:** None.
- **Plite adoption:** Add browser proof and, only for a proven invariant gap, a focused bridge unit.
- **Plate adoption:** N/A in this packet; PRODUCT Packet 4 owns feature/schema/UI adoption.
- **Downstream adoption:** Browser matrix/release proof recognizes the new row; no application caller changes.
- **Deletion scope:** No current code deletion. Hard reject Wordgard `BidiSpan`, `computeOrder`, `TextblockMap`, shared scratch state, and any model visual-order cache.
- **Focused unit proof:** Existing `packages/plite-dom/test/dom-geometry.test.ts` and `packages/plite-dom/test/bridge.ts` only if a missing invariant is isolated.
- **Generated/property/fuzz laws:** N/A for exact visual order because browser layout is the oracle. A small deterministic fixture matrix is valid; random model-expected visual offsets would manufacture a second bidi engine.
- **Browser proof:** Required focused Chromium row, then `pnpm check:plite:browser-matrix` at release-quality closure. Assert exact offsets only for cross-engine-stable cases; otherwise assert DOM/model synchronization and grapheme integrity.
- **Benchmark:** N/A because no production algorithm changes and the packet makes no throughput claim.
- **Exit condition:** Full fixture traversal passes in LTR and RTL containers, model/DOM stay synchronized, and no console/runtime errors or leaked roots remain.
- **Hard deletion gate:** Source audit confirms no donor bidi algorithm/model cache entered Plite or Plate.
- **Rollback answer:** Remove the proof row only if the fixture assertion is proven platform-invalid; retain any newly discovered generic invariant as a minimized separate test. Production code changes, if separately authorized, revert with their proof.
- **Failure modes:** (1) browser engines choose different stable visual offsets; narrow exact assertions to invariant synchronization; (2) synthetic key dispatch bypasses native behavior; stop until Browser proves trusted/native events; (3) a DOM/model mismatch affects all visual navigation; block PRODUCT Packet 4 and open a focused Plite DOM diagnosis.

#### STATE-P3 — product localization admission gate

- **Concept IDs:** STATE-022.
- **Decision owner:** Application/registry product owner; Plate Plan only after admission.
- **Execution skill:** No implementation skill now. If admitted: `plate-plan`, then `task`/`testing`.
- **Final owner:** Application/registry localization adapter or a feature-local product package. Never `packages/plite` and never a Plate-core English catalog.
- **Prerequisites:** At least two independently shipped consumers; named locale/fallback/ICU/plural/select/date/number/SSR/accessibility requirements; a selected installed ICU-capable runtime.
- **Dependent packets:** None now. After acceptance, a new app migration packet must name its two consumers and deletion list.
- **Entry condition:** The product owner supplies all prerequisite evidence and accepts which application/package owns catalogs and runtime loading.
- **Exact implementation scope:** Current run: document rejection/defer only. Future admitted scope: define one adapter, migrate one vertical feature and its SSR/client/a11y proof, then decide whether a second consumer justifies a shared product package.
- **Current shape:** Wordgard has an incomplete editor-core phrase facet; Plite deliberately owns no wording; Plate/app strings are product-owned but fragmented.
- **Target shape:** No code now. If admitted, one application-owned ICU adapter serves two proven consumers without entering Plite or Plate core.

**Current Wordgard shape**

- Owner/API: `PhraseSet.define/ref/get/full/partial/didChange` plus four English dictionaries at `../wordgard/src/phrases/phraseset.ts:3-85` and `../wordgard/src/phrases/phrases.ts:3-104`.
- Lifecycle: extension/facet overrides merge records; interpolation replaces `$` tokens.
- Strength: typed references and override precedence.
- Limitations: no locale identity, fallback, ICU formatting, async catalog, SSR contract, or direct tests; `../wordgard/src/phrases/phrases.ts:89-104` includes a wrong table label.

**Current Plite shape**

- Owner: deliberate absence. `packages/plite/src/core/screen-reader-announcement.ts:7-17` makes applications responsible for localized announcement text.
- Lifecycle: Plite transports semantic announcements/effects but does not choose language or wording.
- Verdict: correct boundary; no missing substrate.

**Current Plate shape**

- Owners: app dictionary at `apps/www/src/i18n/getI18nValues.ts:92-186`; feature-local emoji strings at `packages/emoji/src/lib/types.ts:46-55` and `packages/emoji/src/lib/constants.ts:106-134`.
- Lifecycle: app/feature-owned values are loaded and rendered locally; no common locale/fallback/SSR contract exists.
- Weakness: fragmented product DX, but current evidence does not prove that a shared editor package is the right owner.

**Bounded current-source audit**

Exact query:

```sh
rg -n --glob '*.ts' --glob '*.tsx' --glob '*.md' --glob '*.mdx' \
  -e 'MessageCatalog' -e 'Intl\.MessageFormat' -e 'formatMessage' \
  -e 'PluralRules' -e '@formatjs' -e 'intl-messageformat' \
  packages/plite/src packages/core/src packages/emoji/src apps/www/src content/docs
```

- Scope: the current 1,693 TS, TSX, MD, and MDX files under the five named Plite, Plate core, emoji, www-app, and docs source roots.
- Result: zero matches; `rg` exited 1 because no searched token occurred.
- Narrow conclusion: these named current sources expose no shared ICU catalog/runtime contract identifiable by the six searched API/runtime tokens. This does not claim absence in other apps, generated files, package manifests, installed dependency internals, or the wider ecosystem; a future admission packet must expand the audit around its named consumers and selected runtime.

**Conditional target shape and usage**

```ts
export type MessageValues = Readonly<Record<string, unknown>>;

export interface MessageCatalog<TKey extends string> {
  readonly locale: string;
  has(key: TKey): boolean;
  format(key: TKey, values?: MessageValues): string;
}
```

Simple app usage:

```tsx
<EditorProvider messages={catalog} />
```

Advanced usage:

```ts
const catalog = adaptIcuCatalog({
  fallbackLocale: 'en',
  locale: requestLocale,
  messages,
});
```

- Extension-author usage: feature options accept typed message keys or formatted strings; extensions never import a global English catalog.
- Host/internal usage: SSR and client receive the same locale/catalog identity; lazy catalog loading is app-owned.
- Compiled representation: the chosen ICU runtime may compile messages, but Plite and Plate core store no phrase map.
- Invariants: deterministic fallback, locale identity, ICU plural/select correctness, accessible names use the same catalog, no hidden English default in substrate.
- Configuration/reconfiguration: locale/catalog replacement is an application state transition; it does not recompile the editor schema.
- Runtime characteristics: defined only after choosing the real library/loading strategy; no performance claim now.

- **Target score:** Conditional `4/4/5/4/4/5/4/4=34`; it earns lifecycle/proof only after real consumers and ICU runtime exist.
- **Public breaks:** None now. Future app/provider props are product API only.
- **Plite adoption:** N/A and prohibited; only semantic transport remains.
- **Plate adoption:** N/A until gate acceptance. Future feature options may consume the app catalog.
- **Downstream adoption:** If accepted, both named apps/features, registry labels, accessible names, SSR loader, tests, and docs migrate together.
- **Deletion scope:** None now. Future deletion must name the replaced dictionaries/feature constants after both vertical consumers pass; “no deletion yet” is justified because there is no accepted owner or replacement. Temporary owner is the existing app/feature-local dictionaries. Dependent packet is the future accepted app migration. Hard removal gate is two migrated consumers plus lexical/reference zero for replaced catalogs.
- **Focused unit proof:** If accepted: key typing, fallback, interpolation/plural/select, missing-key diagnostics.
- **Generated/property/fuzz laws:** If accepted: locale/fallback permutation properties and arbitrary ICU values; fuzz malformed catalog payloads at the adapter boundary.
- **Browser proof:** N/A now. If accepted: SSR hydration parity, locale switch, and accessible-name checks are required.
- **Benchmark:** N/A now; only required if async loading/catalog compilation makes a latency or memory claim.
- **Exit condition:** Current run exits with no code and the evidence gate documented. Future implementation exits only after two consumers and all proof pass.
- **Hard deletion gate:** No shared adapter ships with one consumer, no installed ICU runtime, or no explicit SSR/a11y contract. Donor `PhraseSet` remains rejected.
- **Rollback answer:** Current no-code decision needs no rollback. A future adapter rolls back per migrated app before removing local dictionaries; no compatibility layer enters Plite.
- **Failure modes:** (1) a shared API serves one app and becomes premature core policy; stop at local app owner; (2) server/client locale mismatch causes hydration/accessibility drift; block rollout; (3) hidden English fallback leaks into generic packages; reject the adapter boundary.

### HP-01 — make history v4 owner truth exact

- **Concept IDs:** HC-001, HC-008, HC-010, HC-032.
- **Decision owner:** Plite Plan.
- **Execution skill:** `docs-creator` for latest-state documentation, then `task` for the codec error/tests.
- **Final owner:** `@platejs/plite-history` owns the format and error; Plite documentation owns reference prose.
- **Prerequisites:** None. Runtime v4 is already canonical at `packages/plite-history/src/history.ts:49-65` and `packages/plite-history/src/history-codec.ts:250-265`.
- **Dependent packets:** HP-05 consumes truthful proof/docs. HP-02/03 can execute independently but should not ship with stale v3 owner truth.
- **Entry condition:** `packages/plite-history/src/history-codec.ts:221`, `packages/plite-history/README.md:49`, `content/docs/plite/libraries/plite-history/history.mdx:63`, and `content/docs/plite/libraries/plite-history/history-editor.mdx:105` say v3 while encoder/type say v4.
- **Wordgard current actual shape/lifecycle/owner/evidence:** `historyField_` owns direct encode/decode of inverse changes and one selection at `../wordgard/src/history/history.ts:71-95`; there is no version, schema fingerprint, effect codec, staged decode, or migration lifecycle.
- **Plite current actual shape/lifecycle/owner/evidence:** `History.toJSON/fromJSON` delegates to the strict v4 codec; decode verifies exact schema and each intermediate state before returning an immutable value, then `tx.history.restore` applies it atomically at `packages/plite-history/src/history-codec.ts:58-265` and `packages/plite-history/src/history-extension.ts:386-478`.
- **Plate current actual shape/lifecycle/owner/evidence:** Plate core installs history but owns no format at `packages/core/src/lib/plugins/HistoryPlugin.ts:1-7`; Plite-facing docs are the stale consumer evidence listed in the entry condition.
- **Current public TypeScript:**

  ```ts
  const json = History.toJSON(editor);
  const decoded = History.fromJSON(editor, json);
  editor.update((tx) => tx.history.restore(decoded));
  ```

- **Current internal TypeScript:** `HistoryJSON` is structurally `{ version: 4; schema; undos; redos }` at `packages/plite-history/src/history.ts:49-65`; `decodeHistory` rejects non-v4/schema mismatch before batch decode at `packages/plite-history/src/history-codec.ts:58-141`.
- **Target public/internal TypeScript:** No API/type/runtime change. The same API and `version: 4` representation remain; only the stale error/prose and their contracts change.
- **Simple usage:** persist and restore ordinary text undo stacks with exact v4 JSON.
- **Advanced usage:** persist multi-root selections and reversible effects only when their registered codecs validate.
- **Extension-author usage:** register effect codec/map/invert/replay semantics in the Plite descriptor owner; do not write a custom history serializer.
- **Host-app usage:** store the v4 envelope with the matching compiled schema identity; reject rather than coerce a mismatch.
- **Compiled representation/invariants:** immutable decoded history; exact `version === 4`; exact schema ID/version/fingerprint; every batch applies to the prior intermediate document; every effect descriptor exists and decodes.
- **Reconfiguration/runtime:** decode is side-effect free; restore is one tagged observable transaction and rolls back with the enclosing update.
- **Exact implementation scope:** change the v3 error string and the three v3 history-format statements; strengthen README/docs contracts to assert v4 and reject v3 wording. Do not edit `DocumentChange` v3 documentation because it is a different format.
- **Current shape:** Sound v4 runtime with contradictory current documentation/error.
- **Target shape:** One exact v4 story in types, encoder, decoder, errors, README, docs, and tests.
- **Public breaks:** None. No accepted data shape, export, or signature changes.
- **Plite adoption:** `packages/plite-history` README/error/tests and the two Plite history docs adopt v4 wording.
- **Plate adoption:** No Plate runtime change. Browser-load the docs because `content/**` changes require rendered verification.
- **Downstream adoption:** Hosts continue using v4; no migration work.
- **Deletion scope:** Delete the four stale v3 history literals. No production code or format version is deleted.
- **Focused unit proof:** `packages/plite-history/test/history-persistence-contract.spec.ts:1-811`, `packages/plite-history/test/package-readme-contract.spec.ts:1-38`, and focused codec/docs contract assertions.
- **Generated/property/fuzz laws:** Not applicable because no semantic or representation change occurs; existing persistence laws remain the runtime guard.
- **Browser proof:** Required for the two edited docs routes: both render, show v4, and produce no console/build errors.
- **Benchmark:** Not applicable because runtime code paths and data size are unchanged.
- **Exit condition:** Runtime/type/error/README/docs all say v4; focused tests/typecheck/lint pass; targeted search finds no history-format v3 claim outside intentionally separate `DocumentChange` v3 material.
- **Hard deletion gate:** The stale literals may be deleted only in the same patch that makes the relevant contracts assert v4, preventing drift from returning.
- **Rollback answer:** Revert the truth-only packet as one unit if a contract exposes an overlooked current format owner. Do not widen decode as a rollback.

### HP-02 — differential one-owner collaborative-history warrant

- **Concept IDs:** HC-003, HC-005, HC-006, HC-013, HC-016–019, HC-024–027, HC-029, HC-032.
- **Decision owner:** Plite Plan.
- **Execution skill:** `tdd`; use `performance` only for the existing event-bridge budget.
- **Final owner:** Test/model ownership lives with `@platejs/plite-history` plus `@platejs/yjs` support; production semantics remain Plite core/history and the Yjs bridge.
- **Prerequisites:** Current package tests green; exact current reference behavior captured before any deletion. HP-01 is preferred first but not a semantic dependency.
- **Dependent packets:** HP-03 is forbidden until this packet passes. HP-04 uses the final command owner; HP-05 promotes the accepted cases to release proof.
- **Entry condition:** Current test support exposes both `undoYjsPeer` and `undoEditorHistory` at `packages/yjs/test/support/collaboration.ts:279-325`, while product code/docs disagree about the owner.
- **Wordgard current actual shape/lifecycle/owner/evidence:** One mapped history stack survives remote skipped changes at `../wordgard/src/history/history.ts:37-69`, `../wordgard/src/history/history.ts:202-246`; the dummy authority exercises undo/conflict convergence at `../wordgard/test/test-collab.ts:128-223`.
- **Plite current actual shape/lifecycle/owner/evidence:** Plite history maps skipped commits on both stacks at `packages/plite-history/src/history-state.ts:263-374`, `packages/plite-history/src/history-state.ts:532-569`; Yjs separately owns `Y.UndoManager` and split repair at `packages/yjs/src/core/controller.ts:107-327`; test support already creates history peers and exposes both command paths at `packages/yjs/test/support/collaboration.ts:149-174`, `packages/yjs/test/support/collaboration.ts:279-325`.
- **Plate current actual shape/lifecycle/owner/evidence:** Plate toolbar uses Plite history at `apps/www/src/registry/ui/history-toolbar-button.tsx:1-44`; Yjs docs say `tx.yjs.undo/redo` at `content/docs/(plugins)/(collaboration)/yjs.mdx:167-196`; the Plate demo proves neither path.
- **Test-only TypeScript representation:**

  ```ts
  type CollaborativeHistoryBackend = 'current-yjs' | 'plite-history';

  type CollaborativeHistoryStep =
    | { peer: string; kind: 'edit'; operation: CanonicalTestOperation }
    | { peer: string; kind: 'disconnect' | 'reconnect' | 'sync' | 'undo' | 'redo' }
    | { kind: 'reconfigure'; schema: TestSchemaIdentity };

  type CollaborativeHistoryTrace = {
    readonly seed: number;
    readonly steps: readonly CollaborativeHistoryStep[];
  };
  ```

- **Replacement responsibility of the new test abstraction:** One trace runner replaces duplicated per-test peer choreography and the split command helpers at `packages/yjs/test/support/collaboration.ts:279-325`; it does not become a production API.
- **Simple usage:** local insert, remote insert before/after it, local undo/redo, assert all peers and depths after every step.
- **Advanced usage:** seeded offline split/merge/move/wrap/unwrap/lift/property/set/root/effect traces with reconnect, redo invalidation and explicit whole-diff fallback.
- **Extension-author usage:** register reversible/shared test effects and assert map/invert/codec/replay exactly once through both backends.
- **Host-app usage:** drive the same accepted trace through the apps/plite browser host after unit/model convergence passes.
- **Compiled representation/invariants:** compare canonical editor documents, serialized Yjs projections, stable Yjs node identities where required, all-peer state vectors, before/after selections, undo/redo depths, effect order/count, room schema claim, provider state, trace/fallback reason, and replayable seed after every step.
- **Reconfiguration/runtime:** include rejected schema joins, atomic failed reconfiguration, disconnect/reconnect queues, cleanup, and controller teardown; a rejected operation must leave documents/history/provider claim unchanged.
- **Exact implementation scope:** extend `packages/yjs/test/support/collaboration.ts` or a tightly colocated test helper; add differential contract cases beside `packages/yjs/test/structural-soak-contract.slow.ts` and Plite collaboration/history contracts; add no production abstraction unless a minimized failure demonstrates a missing canonical law.
- **Current shape:** Two independently tested undo owners with no same-trace oracle.
- **Target shape:** One deterministic model proves Plite-history-only replay is observationally equal or better for every supported collaborative operation.
- **Public breaks:** None; test-only.
- **Plite adoption:** Plite history/core accept only minimized canonical laws discovered by the runner.
- **Plate adoption:** No production change. A focused apps/plite browser row consumes the accepted simple trace.
- **Downstream adoption:** Seed/trace fixtures become reusable release evidence; no downstream API change.
- **Deletion scope:** This packet deletes no production code because the current Yjs path is the comparison oracle.
- **Private temporary owner:** Existing `YjsController`/`Y.UndoManager`/split adapter remain private current-reference owners.
- **Reason for temporary retention:** They are required to compare behavior and prevent deleting unmodeled offline structural semantics.
- **Dependent removal packet:** HP-03.
- **Hard removal gate for the temporary owner:** Every accepted operation/seed passes Plite-only; all failure traces are minimized and either fixed as canonical laws or explicitly unsupported with fail-closed behavior; browser and benchmark budgets pass.
- **Focused unit proof:** deterministic local/remote text/property/selection/effect cases across both backends.
- **Generated/property/fuzz laws:** seeded generated operations; prefix minimization; print seed and full trace; invariants checked after every step, not only final convergence.
- **Browser proof:** One focused Chromium trace after unit/model green: independent peers, remote edit, local undo/redo, disconnect/reconnect, visible histories, no runtime errors.
- **Benchmark:** Run the registered event-change bridge target; Plite-only replay must not breach existing thresholds or materially raise fallback rate. No new benchmark unless a measured replay hotspot appears.
- **Exit condition:** Differential suite green for simple/advanced/offline/multi-root/effect scenarios; no unexplained mismatch; trace artifacts reproducible; focused package/type/browser/benchmark gates green.
- **Hard deletion gate:** HP-03 cannot start while any Plite-only mismatch, non-reproducible seed, missing operation family, or benchmark regression remains.
- **Rollback answer:** Test-only changes can be reverted without runtime effect. A failing Plite-only trace blocks HP-03 and keeps current runtime temporarily; it is not permission to bless dual public ownership.
- **Failure modes:**
  1. Remote insert/delete rebases the saved inverse onto the wrong range. **Blast radius:** user or remote text loss across every peer. **Stop/rollback:** stop at the first divergent step, preserve seed/trace, add a canonical transform/history law; do not begin HP-03.
  2. Offline split/merge/move/wrap/lift undo reconnects with duplicated/dropped Yjs identities. **Blast radius:** structural corruption, stale relative selections, future divergence. **Stop/rollback:** block deletion, minimize the structural prefix, fix canonical lowering/mapping or retain the narrowly implicated private correction until proven.
  3. Redo after a remote topology change targets a stale path or wrong root. **Blast radius:** partial mutation or cross-root corruption. **Stop/rollback:** require atomic failure/no mutation, add root/path replay law, keep current runtime until green.
  4. Reversible/shared effects deliver twice or not at all. **Blast radius:** duplicated comments/tasks/host state. **Stop/rollback:** compare descriptor/log counts, isolate the source, and block HP-03.
  5. Provider failure rolls back the document but leaves a history batch. **Blast radius:** next undo mutates an unrelated state. **Stop/rollback:** restore editor/provider/history snapshot atomically and block deletion.

### HP-03 — hard-cut Yjs-owned history

- **Concept IDs:** HC-005, HC-006, HC-015–019, HC-024, HC-025, HC-026, HC-029, HC-032.
- **Decision owner:** Plite Plan.
- **Execution skill:** `hard-cut` owns deletion; `tdd` owns replacement laws and regression proof.
- **Final owner:** `@platejs/plite-history` owns all user undo/redo. `@platejs/yjs` remains the transport/schema/provider/awareness/shared-effect adapter.
- **Prerequisites:** HP-02 exit condition and hard deletion gate are green; every Yjs undo call/export/reference is inventoried; shared encoding versus repair-only references are classified.
- **Dependent packets:** HP-04 updates Plate product/docs to the final command; HP-05 closes release proof.
- **Entry condition:** Differential evidence proves Plite-only history preserves supported local intention, Yjs projection/identity, convergence, selections, effects, depth and reconnect semantics.
- **Wordgard current actual shape/lifecycle/owner/evidence:** One `HistoryState` owns undo/redo and maps over collab receive changes at `../wordgard/src/history/history.ts:37-69`, `../wordgard/src/history/history.ts:171-246`; its collab module has no competing stack at `../wordgard/src/collab/collab.ts:108-152`.
- **Plite current actual shape/lifecycle/owner/evidence:** Plite history is canonical and installed, while Yjs controller additionally owns `Y.UndoManager`, split adapter and public undo methods at `packages/yjs/src/core/controller.ts:107-327`, `packages/yjs/src/core/controller.ts:786-852`, `packages/yjs/src/core/types.ts:180-201`, and `packages/yjs/src/core/undo-manager-adapter.ts:5-118`.
- **Plate current actual shape/lifecycle/owner/evidence:** Toolbar calls Plite history at `apps/www/src/registry/ui/history-toolbar-button.tsx:1-44`; Yjs docs instruct `tx.yjs.undo/redo` at `content/docs/(plugins)/(collaboration)/yjs.mdx:167-196`.
- **Current public TypeScript:**

  ```ts
  editor.update((tx) => tx.yjs.undo());
  editor.update((tx) => tx.yjs.redo());
  editor.update.history.undo();
  editor.update.history.redo();
  ```

- **Target public TypeScript:**

  ```ts
  editor.update.history.undo();
  editor.update.history.redo();
  ```

- **Current internal TypeScript:** `YjsController` creates `Y.UndoManager`, a `YjsUndoManagerAdapter`, split metadata and custom `undo/redo`; remote imports are independently tagged `history-skip`.
- **Target internal TypeScript:** `YjsController` has no undo manager or history origin. A Plite replay emits a normal canonical `EditorCommit`; the existing outbound bridge lowers it; remote Yjs imports remain one `history-skip` transaction and map Plite history.
- **Simple usage:** keyboard/toolbar undo after a local text edit uses `editor.update.history.undo()`.
- **Advanced usage:** the identical command handles offline structural changes, remote interleaving, multi-root view selection and reversible/shared effects.
- **Extension-author usage:** extensions mark remote/system transactions with canonical history policy and register effect descriptors; they cannot attach another history manager to Yjs.
- **Host-app usage:** collaboration hosts install history plus Yjs; provider/auth/persistence stay app-owned; controls read only Plite undo/redo depth.
- **Compiled representation/invariants:** one immutable Plite `Batch`; replay's canonical inverse applies to the current mapped document; one redo stack; normal Yjs lowering; stable identities where the operation permits; no raw Yjs stack metadata.
- **Reconfiguration/runtime:** provider/schema reconnect/reconfigure never swaps history owner; failed outbound replay rolls back the enclosing editor update and cannot leave a ghost history batch.
- **Exact implementation scope:** remove `YjsTx.undo/redo` and deferred handlers; remove controller fields/origins/branches; delete `packages/yjs/src/core/undo-manager-adapter.ts`, `packages/yjs/src/core/split-history.ts`, `packages/yjs/src/core/split-history-adapter.ts`; remove repair-only attributes/symbols after reference proof; update exports/tests/support/docs; relax exact Yjs pin only under normal package policy.
- **Current shape:** Two public commands, stacks, grouping/replay models, and structural repair owners.
- **Target shape:** One Plite history owner; Yjs transports the resulting canonical commit.
- **Public breaks:** `YjsTx.undo()` and `YjsTx.redo()` are removed without compatibility aliases. This requires a changeset for `@platejs/yjs`.
- **Plite adoption:** Canonical history laws found by HP-02 land in Plite history/core; no Yjs-specific API is added.
- **Plate adoption:** Standard history toolbar remains; Yjs docs/examples use
  `editor.update.history.undo()`/`redo()` for normal calls and `tx.history.*`
  only inside atomic updates; `BaseYjsPlugin` stays thin.
- **Downstream adoption:** Test helpers, apps/plite examples, registry/docs, and any package source references replace Yjs undo calls with history commands.
- **Deletion scope:** Exact files/symbols above; split repair metadata/markers and private-stack tests; exact-pin contract used only for raw stacks; public docs/API examples.
- **Focused unit proof:** all HP-02 fixed vectors; history package contracts; Yjs provider/remote-import/split/merge/move/wrap/unwrap/lift tests rewritten around canonical history.
- **Generated/property/fuzz laws:** every HP-02 seed plus generated offline structural prefixes; no unexplained fallback/identity/depth/effect mismatch.
- **Browser proof:** focused Chromium two-peer remote edit plus local undo/redo, offline reconnect and visible depths; full Plite browser matrix at closure.
- **Benchmark:** existing registered 10k event-bridge benchmark must remain within threshold; measure fallback count for replay commits.
- **Exit condition:** zero `tx.yjs.undo/redo`, `Y.UndoManager`, raw `undoStack/redoStack`, split-history file/export/repair-only attribute references; package/type/lint/check/browser/benchmark green; docs use one owner.
- **Hard deletion gate:** source-reference graph proves each removed helper is history-only; HP-02 is green; public changeset exists; generated barrels updated if exports change.
- **Rollback answer:** Revert HP-03 as one atomic commit if post-cut proof exposes a supported regression. Never restore only aliases or half the private stack; fix the canonical law, rerun HP-02, then recut.
- **Failure modes:**
  1. Plite inverse lowers to a content-equivalent whole-root replacement that changes Yjs identities. **Blast radius:** remote cursor anchors and later structural edits across every peer. **Stop/rollback:** stop release, revert all HP-03, preserve trace, add identity-preserving lowering law.
  2. Remote update maps the undo stack differently from the deleted split repair. **Blast radius:** local undo deletes remote content or diverges on reconnect. **Stop/rollback:** revert HP-03 atomically and reopen the minimized HP-02 trace; no partial alias.
  3. Removed repair-only attribute is actually read by general document projection. **Blast radius:** split/merge documents decode incorrectly even without undo. **Stop/rollback:** source-reference gate must prevent deletion; if missed, restore that shared symbol only as a projection owner and rename/rehome it, not the history subsystem.
  4. Hidden package consumer fails compile on removed methods. **Blast radius:** downstream build break. **Stop/rollback:** changeset and migration to history are mandatory; revert whole cut only if an in-repo owner cannot migrate.
  5. Provider write rejection leaves history depth changed. **Blast radius:** future undo applies to wrong state. **Stop/rollback:** atomic rollback assertion blocks merge; restore pre-packet controller until fixed.

### HP-04 — real Plate collaboration surface

- **Concept IDs:** HC-006, HC-010, HC-014, HC-021–024, HC-031, HC-032.
- **Decision owner:** Plate Plan.
- **Execution skill:** `plate-ui` and `components` for the registry surface; `testing` for component/Browser proof.
- **Final owner:** Plate registry/apps/www/docs own presentation and the development host; `@platejs/yjs/react` remains cursor data/geometry owner; the app owns its concrete provider.
- **Prerequisites:** HP-03 final undo API accepted. Existing Yjs React hooks/provider contracts remain green.
- **Dependent packets:** HP-05 turns the product scenarios into release gates.
- **Entry condition:** `apps/www/src/registry/examples/collaboration-demo.tsx:1-42` is static, `apps/www/src/registry/ui/remote-cursor-overlay.tsx:1-5` returns `null`, and docs claim collaboration/cursors.
- **Wordgard current actual shape/lifecycle/owner/evidence:** Generic history wrongly includes menu buttons at `../wordgard/src/history/history.ts:98-111`, `../wordgard/src/history/history.ts:358-380`; collab correctly excludes server/communication at `../wordgard/src/collab/index.ts:1-4`; no React/provider/cursor surface exists.
- **Plite current actual shape/lifecycle/owner/evidence:** `@platejs/yjs/react` exposes external-store provider/awareness/cursor hooks and geometry at `packages/yjs/src/react/index.ts:379-606`; Yjs provider lifecycle and app boundary are at `packages/yjs/src/core/provider-lifecycle-adapter.ts:15-275` and `packages/yjs/README.md:157-181`.
- **Plate current actual shape/lifecycle/owner/evidence:** The registry owns a static boundary banner/editor and null overlay while docs imply real behavior at `apps/www/src/registry/examples/collaboration-demo.tsx:1-42`, `apps/www/src/registry/ui/remote-cursor-overlay.tsx:1-5`, and `content/docs/examples/collaboration-example.mdx:1-51`.
- **Target public TypeScript:**

  ```tsx
  <Plate editor={editor}>
    <EditorContainer>
      <Editor />
      <RemoteCursorOverlay />
    </EditorContainer>
  </Plate>
  ```

- **Target internal TypeScript:**

  ```tsx
  const editor = useEditorRef();
  const [positions] = useYjsRemoteCursorOverlayPositions(editor);

  return positions.map(({ clientId, cursor, rect }) =>
    rect ? <RemoteCaret key={clientId} cursor={cursor} rect={rect} /> : null
  );
  ```

- **Simple usage:** one host supplies a Y.Doc/provider wrapper, editor, standard history controls, and `<RemoteCursorOverlay />`.
- **Advanced usage:** two independent peers, connection/sync status, remote selections/carets, disconnect/reconnect, schema rejection/recovery, local undo after remote edit.
- **Extension-author usage:** configure `YjsPlugin` with app-owned doc/provider/root/schema; cursor presentation reads existing hooks and cannot mutate awareness internals.
- **Host-app usage:** host owns room name, auth, persistence, provider URL/options and cleanup. Demo provider is credential-free, development-only, and explicitly not exported as production policy.
- **Compiled representation/invariants:** peer cursor data remains `YjsRemoteCursor`; geometry comes from `useYjsRemoteCursorOverlayPositions`; local peer is excluded; invalid relative ranges render nothing; DOM layout refresh and teardown follow existing hook lifecycle.
- **Reconfiguration/runtime:** provider/status/schema errors remain visible without replacing the editor; unmount disconnects provider, destroys demo Y.Doc/listeners, and cancels geometry listeners/animation frame.
- **Exact implementation scope:** replace the two registry files; wire Yjs/history plugins in the example; add app-local provider/peer host as needed; update collaboration docs/example docs and registry dependencies; add component/browser tests and captures.
- **Current shape:** Honest boundary text but no actual collaboration or cursor pixels.
- **Target shape:** Runnable app-owned provider integration proving actual remote content, cursor UI, lifecycle/error state and canonical history.
- **Public breaks:** Registry component behavior changes from no-op to rendering; preserve the zero-prop component API where practical. No Yjs package API break.
- **Plite adoption:** Consume existing Yjs React hooks, provider state and canonical history; add no duplicate data model.
- **Plate adoption:** Plate core/plugin/kit/registry/apps/www/docs use the real component/example and standard history toolbar.
- **Downstream adoption:** Registry copy consumers receive a functional overlay and explicit provider integration contract; no credentials or server package are bundled.
- **Deletion scope:** Replace static demo and null overlay; remove duplicate Yjs undo wording; delete unsupported cursor/provider claims only if the matching behavior cannot ship.
- **Focused unit proof:** overlay rendering for valid/null/deleted cursors; stable keys/colors/data; cleanup; provider status/error presentation.
- **Generated/property/fuzz laws:** Not applicable to visual layout itself; underlying selection/property laws remain Yjs package tests. Random DOM geometry is not a meaningful property oracle.
- **Browser proof:** Required on standalone `/blocks/collaboration-demo-demo`: independent peers, remote text convergence, remote caret/selection pixels, local-peer exclusion, scroll/resize, responsive layout, disconnect/reconnect, local undo after remote edit, schema error, unmount/console clean, screenshots.
- **Benchmark:** Not applicable to product rendering unless profiling shows overlay cost. Existing Yjs event benchmark remains HP-05's runtime guard.
- **Exit condition:** Demo truly exchanges Yjs updates between independent peers; overlay renders; docs match behavior/boundary; Browser evidence and component/type/lint tests pass; teardown leak check passes.
- **Hard deletion gate:** Do not delete the static/null fallbacks until the real example renders in Browser and registry dependency metadata points to every required component.
- **Rollback answer:** Roll back the Plate surface and narrow docs claims if provider/overlay cannot be made deterministic. Keep headless Yjs hooks/runtime untouched.
- **Failure modes:**
  1. Demo uses one editor/state disguised as two peers. **Blast radius:** product proof is meaningless and consumers copy a fake integration. **Stop/rollback:** require distinct editors/Y.Docs/provider endpoints and state-vector exchange; reject packet if absent.
  2. Cursor geometry uses the wrong root/scroll coordinate space. **Blast radius:** every remote caret is misplaced after scroll/resize/multi-root rendering. **Stop/rollback:** block handoff on pixel assertions; revert overlay only while retaining core hooks.
  3. Provider/awareness/listener cleanup leaks on unmount/reconfigure. **Blast radius:** duplicate updates, memory/socket leaks, flaky docs. **Stop/rollback:** leak assertion blocks merge; restore static surface if cleanup cannot be deterministic.
  4. Demo provider accidentally includes credentials or becomes exported transport policy. **Blast radius:** security/product coupling for downstream registry users. **Stop/rollback:** remove provider implementation, retain only explicit injection boundary, and narrow demo claims.

### HP-05 — executable collaboration proof and release closure

- **Concept IDs:** HC-009, HC-016–023, HC-026–032.
- **Decision owner:** Plite Plan for package/benchmark/browser-runtime gates; Plate Plan for product/docs adoption.
- **Execution skill:** `testing`; `performance` for benchmark analysis.
- **Final owner:** `@platejs/yjs` test/benchmark owners, apps/plite browser proof owner, and Plate docs/release owner.
- **Prerequisites:** HP-02 accepted; HP-03 final API landed; HP-04 real surface landed; HP-01 truth fix landed.
- **Dependent packets:** None. This is closure.
- **Entry condition:** Docs advertise `bun scripts/proof/yjs-hocuspocus-production-soak.mjs` at `content/docs/plite/libraries/plite-yjs.mdx:193-211`, but package contracts prove it is absent at `packages/yjs/test/package-config-contract.spec.ts:212-243`; browser proof lacks cross-page live provider/cursor/offline/one-owner history coverage.
- **Wordgard current actual shape/lifecycle/owner/evidence:** 52 unit cases include unseeded random loops at `../wordgard/test/test-history.ts:304-321` and `../wordgard/test/test-collab.ts:282-308`; there is no provider/browser/benchmark/seed artifact owner.
- **Plite current actual shape/lifecycle/owner/evidence:** Plite history/Yjs own broad deterministic package laws and a registered event benchmark at `packages/yjs/scripts/benchmark-event-change-bridge.ts:13-279` and `benchmarks/targets/slate-v2.json:255-275`; the alleged production soak has no executable owner.
- **Plate current actual shape/lifecycle/owner/evidence:** apps/plite has one four-peer schema/convergence row and one provider-controls mount row at `apps/plite/tests/plite-browser/donor/examples/yjs-collaboration.test.ts:5-77` and `apps/plite/tests/plite-browser/donor/examples/yjs-hocuspocus.test.ts:5-20`; apps/www has no proven real collaboration surface before HP-04.
- **Proof manifest TypeScript:**

  ```ts
  type CollaborationProofArtifact = {
    readonly seed: number;
    readonly trace: readonly CollaborativeHistoryStep[];
    readonly fallbackCounts: Readonly<Record<string, number>>;
    readonly finalStateVectors: readonly string[];
    readonly leakedProviders: number;
    readonly leakedSubscriptions: number;
  };
  ```

- **Replacement responsibility of the proof artifact:** It replaces unseeded/non-replayable failure reporting and unsupported prose claims; it is test output, not public runtime API.
- **Simple usage proof:** two peers exchange a text update; local canonical history undoes/redoes after a remote edit; both converge.
- **Advanced usage proof:** disconnect/reconnect, queued structural edits, schema reject/recover, cursor deletion, shared-effect unknown codec/recovery/ack/compaction, provider cleanup, fallback trace.
- **Extension-author proof:** custom reversible/shared effect descriptors map/decode/replay once and fail source-locally.
- **Host-app proof:** app-owned provider injects room/auth-free test config, survives reconnect, reports status/schema errors and tears down without leaks.
- **Compiled representation/invariants:** same canonical/Yjs/selection/effect/depth/schema invariants as HP-02 plus provider listener/doc leak counts, registered command identity, fallback counts and benchmark samples.
- **Reconfiguration/runtime:** rejected joins/reconfiguration are atomic; reconnect does not duplicate listeners/events; compaction cannot run without fenced authority/acks/snapshots.
- **Exact implementation scope:** extend exact Yjs/apps-plite browser tests; create and register the production soak in the correct owner or delete its docs claim; tighten package-config/docs contracts; preserve/update benchmark target; connect HP-04 Browser story; document exact release commands.
- **Current shape:** Strong package proof, narrow browser proof, and one false production command.
- **Target shape:** Every claim maps to an executable registered owner, deterministic artifact, and release gate.
- **Public breaks:** None; test/docs/CI only unless a discovered runtime defect requires its own reviewed packet.
- **Plite adoption:** Yjs/history package tests, apps/plite browser runner and benchmark registry own the gates.
- **Plate adoption:** apps/www collaboration route and docs provide runtime pixels and accurate command/proof descriptions.
- **Downstream adoption:** CI/release scripts invoke only registered commands; contributors receive seeds/traces on failure.
- **Deletion scope:** Delete the nonexistent command claim if no real soak is built; replace obsolete Yjs-private-history tests only after HP-03 canonical replacements; remove mount-only assertions where stronger rows subsume them.
- **Focused unit proof:** all affected history/Yjs package contracts, provider/schema/effect/react contracts and public type smoke.
- **Generated/property/fuzz laws:** HP-02 seeded traces in package closure; each failure prints seed/minimized prefix/artifact.
- **Browser proof:** focused Chromium during iteration; full `pnpm check:plite:browser-matrix` at closure; cross-page/independent provider when the real soak owner supports it; cursor/offline/undo/error/leak assertions.
- **Benchmark:** existing event-bridge registered target is mandatory; compare median/tail/fallback count. Add no new benchmark unless a distinct provider/replay cost center is measured.
- **Exit condition:** `pnpm check:plite`, full browser matrix, registered benchmark/soak, docs contracts, leak audit and HP-04 Browser proof pass; every docs command exists; no private Yjs history reference remains.
- **Hard deletion gate:** Delete old tests/claims only when replacement gate is registered and demonstrated green in the same packet. Never count a README command as proof.
- **Rollback answer:** If a new release gate is flaky, retain its seed/artifact and either fix it or temporarily quarantine it with an explicit tracked replacement; narrow claims immediately. Do not restore removed private history solely to make proof green.
- **Failure modes:**
  1. Soak/docs command exists only locally or is not registered in CI/release. **Blast radius:** all production-confidence claims are false. **Stop/rollback:** remove the claim and block closure until owner/command/target are checked.
  2. Browser row shares one provider/editor process and passes without real exchange. **Blast radius:** reconnect/convergence regressions escape release. **Stop/rollback:** require independent peers/state vectors and observed remote update; reject the row otherwise.
  3. Random failure omits seed/minimized trace. **Blast radius:** high-cost irreproducible regressions across history/Yjs. **Stop/rollback:** test fails its artifact contract; do not merge or retry until green.
  4. Reconnect leaks listeners/docs and duplicates later updates. **Blast radius:** memory growth and content/effect duplication in long-lived hosts. **Stop/rollback:** leak count must be zero; revert lifecycle change or block release.
  5. Average benchmark passes while fallback count or tail latency regresses. **Blast radius:** large documents become unpredictably slow. **Stop/rollback:** compare exact trace/fallback and tail threshold; block release despite average.

#### No-execution admission dossiers

##### HC-011 — Central-authority adapter admission gate

- **Current donor/Plite/Plate shapes:** Wordgard owns a concrete versioned authority state/config/API with synced document, unconfirmed changes, client identity, effects, and public adapter methods (`../wordgard/src/collab/collab.ts:4-31`, `../wordgard/src/collab/collab.ts:73-106`). Plite deliberately owns only protocol-neutral commits, effects, and pairwise change algebra (`packages/plite/src/interfaces/editor.ts:1679-1695`, `packages/plite/src/interfaces/editor.ts:2500-2570`). Plate documents app/provider ownership and has no authority adapter (`content/docs/(plugins)/(collaboration)/yjs.mdx:160-174`, `apps/www/src/registry/examples/collaboration-demo.tsx:8-42`).
- **Proposed shape, owner, and lifecycle:** Keep the non-admission boundary. A separate adapter may exist only after one named consumer supplies version, identity, acknowledgement, persistence, retry, authorization, restart, and multi-device laws; Plite core owns only the admission boundary.
- **Routing and no-execution reason:** No packet is accepted. A future consumer-backed proposal routes to `major-task` under `plite-plan`, then receives its own Plate adoption packet if admitted.
- **Adoption, deletion, and proof:** Adopt no donor API or runtime. Delete nothing because no speculative current API exists. Admission proof must cover deterministic acknowledgement/retry/persistence, duplicated/out-of-order traffic, restart, authorization, and multi-device identity before code.
- **Hard gate and reversal evidence:** Yjs must be demonstrably unsuitable for the named consumer and the complete protocol contract must exist. Until then, copying `CollabState` or `Config` fails the gate; that consumer evidence is the only reversal condition.

##### HC-012 — Authority queue/version/acknowledgement admission gate

- **Current donor/Plite/Plate shapes:** Wordgard collapses updates and validates, recognizes, transforms, and sends authority-versioned changes (`../wordgard/src/collab/collab.ts:62-71`, `../wordgard/src/collab/collab.ts:108-166`). Plite owns protocol-neutral pairwise transform/compose only (`packages/plite/src/core/document-change.ts:5577-5722`); Plate owns no authority queue (`content/docs/(plugins)/(collaboration)/yjs.mdx:160-174`).
- **Proposed shape, owner, and lifecycle:** Keep queue mechanics outside core. If HC-011 admits an adapter, that adapter must own contiguous versions, idempotent acknowledgement, retry, persistence, and multi-device identity as one lifecycle rather than copying the donor happy path piecemeal.
- **Routing and no-execution reason:** No HP-01–05 packet is accepted. A future adapter packet depends on HC-011 approval and routes through `major-task` under `plite-plan`.
- **Adoption, deletion, and proof:** Retain only `DocumentChange.transform` as the reusable primitive. Delete nothing. Future proof must generate dropped, duplicated, delayed, and out-of-order acknowledgements, restart persistence, shared identities, and minimized convergence traces.
- **Hard gate and reversal evidence:** No partial queue/version API may enter core. HC-011 consumer admission plus a complete durable protocol is the exact reversal condition; without both, safe non-admission remains final.

### Product execution packets

The packets are vertical. Each proposed abstraction has a named current responsibility to replace; no packet may land as an additive facade over the same caller path.

#### PRODUCT Packet 1 — Plugin-owned product-intent pilot

**Concept IDs:** PRODUCT-001, PRODUCT-002, PRODUCT-003, PRODUCT-004, PRODUCT-005, and PRODUCT-011. PRODUCT-004 changes only at current stringly/duplicated callers; PRODUCT-001/002/003/005 and the existing inferred Plate plugin portal are explicit keep constraints.

**Decision owner:** Plate Plan decides each feature's public intent surface. Plite Plan has a hard veto if a caller migration changes command identity, registry ordering, middleware, command result, or atomic apply.

**Execution skill:** `plate-plan --deep`; `tdd` for implementation; `autoreview` before handoff. Use `plite-plan --deep` only when a reproduced headless/interception/preview job cannot use the current command contract.

**Final owner:** Each Plate feature package owns its inferred `editor.plugin(Plugin).update.*` methods and feature-specific React hook/state. `packages/plite` remains the only conditional command runtime owner. The registry owns labels, icons, ordering, and rendered controls.

**Prerequisites:** The live plugin update portal remains accepted (`packages/core/src/lib/plugin/BasePlugin.ts:958-1076`, `packages/core/src/lib/plugin/getEditorPlugin.spec.ts:128-181`); `defineCommand` remains an advanced conditional tool, not the default product wrapper (`packages/plite/src/core/command-definition.ts:53-112`, `content/docs/plite/concepts/06-commands.mdx:40-115`). Select one simple mark (`bold`), one block (`heading`), and one parameterized property (`textAlign`).

**Dependent packets:** Packet 2 product adoption, Packet 3 toolbar JSX cleanup, Packet 4 writing direction, Packet 6 color UI, and Packet 7 proof/docs.

**Entry condition:** For each pilot, inventory the current plugin update method, feature hook/state reader, shortcut route, registry caller, and duplicate transform/selector. A candidate must delete a real stringly or duplicate caller. If the normal call needs a descriptor, ID, state algebra, registry, or wrapper hook, stop: that is the rejected Action design.

**Exact implementation scope:** Use the existing `BaseBoldPlugin`, heading plugin, and `TextAlignPlugin` inferred update groups as the three normal public intents; make the matching React controls accept typed plugin refs or feature hooks instead of raw string keys where that deletes duplication; compile shortcuts directly to the owning update/API route; migrate exactly the pilot registry buttons and programmatic test callers; add current-state JSDoc/docs and native fixtures. Add a Plite command for a pilot only if a concrete headless/interception/preview test fails without it. Do not add `definePlateAction`, `PlateAction`, `usePlateAction`, an action registry/state algebra, or migrate lists, links, media, history, or every mark in this packet.

**Current shape:** Plite already owns advanced frozen commands and atomic dispatch. Plate already owns inferred feature updates such as bold and alignment (`packages/basic-nodes/src/lib/BaseBoldPlugin.ts:1-35`, `packages/basic-styles/src/lib/BaseTextAlignPlugin.ts:1-79`), while some registry controls still bind string types/direct generic updates and duplicate state. The missing work is caller adoption, not a descriptor layer.

**Current Wordgard actual shape, lifecycle, owner, and evidence:** Wordgard command core creates callable command identity and binds an opaque parameter; menu items separately expose select/enable/active/update facts (`../wordgard/src/command/command.ts:19-96`, `../wordgard/src/command/menu.ts:10-151`). Creation and binding happen in feature modules; menu resolution later consumes the object. The command/menu layers jointly own behavior and product state.

**Current Plite actual shape, lifecycle, owner, and evidence:** `defineCommand` creates a frozen named descriptor backed by private runtime state; extension publication compiles immutable handler registrations; dispatch prepares input, evaluates ordered `handle`/`around` pipelines, rejects recursion/collisions, and applies one spec (`packages/plite/src/core/command-definition.ts:18-112`, `packages/plite/src/core/command-registry.ts:38-318`). React resolves the mounted root, optionally restores focus, and calls `editor.update.command` (`packages/plite-react/src/hooks/use-plite-runtime.tsx:1067-1116`). Plite owns every generic lifecycle step.

**Current Plate actual shape, lifecycle, owner, and evidence:** Feature plugins expose transaction groups and shortcuts through `BasePlugin` (`packages/core/src/lib/plugin/BasePlugin.ts:550-576`). Bold owns a `tx.marks.toggle` transform (`packages/basic-nodes/src/lib/BaseBoldPlugin.ts:5-35`); alignment owns `tx.nodes.set/unset` (`packages/basic-styles/src/lib/BaseTextAlignPlugin.ts:14-79`). Registry controls currently bind string types or direct update calls (`apps/www/src/registry/ui/mark-toolbar-button.tsx:9-20`, `apps/www/src/registry/ui/turn-into-toolbar-button.tsx:142-205`). Feature behavior is correct; public intent/state and caller ownership are fragmented.

**Target shape:** One package-owned plugin update method expresses the ordinary intent; a feature hook reads only the facts its control needs; the registry supplies presentation. Shortcuts invoke the same update route. A command descriptor exists only for a proved advanced job and delegates to the same owning transaction group. There is no second identity/state system and one resulting `DocumentChange`.

**Public TypeScript:** The normal path is the plugin portal already generated
from `extendTx`; callback and method inputs must infer:

```ts
editor.plugin(BaseBoldPlugin).update.toggle();
editor.plugin(BaseH1Plugin).update.toggle();
editor.plugin(TextAlignPlugin).update.set('center');

const state = useMarkToolbarButtonState({ plugin: BoldPlugin });
const { props } = useMarkToolbarButton(state);
```

The hook may restore focus through the existing editor DOM API or component
framework lifecycle. It does not invent command identity. Explicit callback
annotations or a fallback `nodeType: string` on the migrated path are failed
API.

**Internal TypeScript:** The owning plugin already contributes the behavior:

```ts
export const BaseBoldPlugin = createBasePlugin({
  key: KEYS.bold,
  // schema/parser/render
}).extendTx(({ type }) => (tx) => ({
  toggle: () => {
    tx.marks.toggle(type);
  },
}));
```

The invariant is that UI, shortcut, and programmatic paths reach that one
transaction owner. If a real advanced job requires a Plite descriptor, its
handler calls this same update/transaction owner; it never creates a second
product abstraction.

**Usage — simple:** A toolbar passes `BoldPlugin` to the typed mark hook,
renders `pressed`/disabled state, and invokes the returned props.

**Usage — advanced:** A custom control reads its feature state with
`useEditorSelector`, calls `editor.plugin(Plugin).update.method(input)`, and
owns labels/swatches/order locally.

**Usage — extension author:** A feature package adds an inferred `extendTx`
method and, only when reusable React state is nontrivial, a feature hook. It
uses `defineCommand` only for documented headless/interception/preview needs.

**Usage — host app:** Keyboard, toolbar, automation, and tests call the same
typed plugin method. A command palette maps its own IDs to explicit functions.
It does not discover package actions globally.

**Compiled representation, invariants, reconfiguration, and runtime:** Compiled
representation remains the current inferred Plate extension update group and,
where independently justified, Plite's opaque command registration. Invariants:
one feature owner, inferred inputs, no string dispatch on migrated callers,
side-effect-free state reads, at-most-one apply, labels/icons absent from
packages, and no parallel ID/state registry. Reconfiguration republishes the
plugin portal atomically. Runtime is selector read, current mounted root,
plugin update, and one apply.

**Public breaks:** The pilot should reuse existing plugin exports and inferred
updates. A migrated registry component prop may change from `nodeType: string`
to a typed plugin reference; because registry UI is app-owned, treat this as an
internal app break unless exported registry contracts prove otherwise. No
generic Plate or Plite public abstraction is added.

**Plite adoption:** None in source; reason: ordinary product behavior does not
need a Plite descriptor. Plite adopts regression coverage only when a pilot
uses its existing advanced command path.

**Plate adoption:** Bold, heading, and basic-styles keep or tighten their
existing inferred update methods; the shared/feature React hooks and exact
three registry controls migrate to typed plugin refs.

**Downstream adoption:** apps/www pilot controls and demos, apps/plite
browser proof importing apps/www examples, affected kits, package JSDoc/docs,
fixtures/tests, and history/Yjs/codec regressions consume the same resulting
document change. Codecs and Yjs gain no new API; they prove output stability.

**Deletion scope:** After each pilot control passes parity, delete its raw
string-key/direct generic update callback and duplicated active/enabled
selector. The owning plugin method/hook replaces those responsibilities. Keep
the feature transaction groups for composition. Reject/delete
`definePlateAction`, `PlateAction`, `usePlateAction`, action IDs/state
algebras/registries, package labels/icons, and custom dispatchers.

**Focused unit proof:** Type inference for each plugin method and hook; typed
plugin-ref rejection for absent/incompatible features; pressed/disabled state;
exact one apply and undo step; bold/heading/alignment current transform output;
shortcut equivalence; reconfigure/removal behavior. Existing Plite descriptor
identity/fallback tests run only for a pilot that proves the advanced need.

**Generated/property/fuzz laws:** Generate valid/invalid alignment values and
read-only/selection states; the public plugin update either does nothing under
documented guards or produces the same `DocumentChange` as the existing
transform. Generate plugin reconfiguration sequences and fuzz selector calls
to prove no stale owner or mutation.

**Browser proof:** Required. On the standalone affected apps/www demo, click
the three migrated controls, invoke keyboard and programmatic plugin-update
paths, verify identical content/selection, one undo, active/disabled/read-only
state, mounted-root targeting, focus restoration, multi-root isolation, and no
console errors. Use Browser; control/focus behavior is host-visible.

**Benchmark:** No new runtime abstraction exists. Assert the migrated hook adds
no document traversal or whole-editor subscription and compare control
render/execute counts against baseline. A broad editor benchmark is N/A.

**Failure modes:** (1) UI and shortcut call different transforms, causing
different changes or two undo steps; blast radius: migrated
history/collaboration consumers; stop on change/apply mismatch and roll back
the caller migration. (2) a hook captures stale plugin/editor state across
reconfiguration; blast radius: pressed/disabled UI and multi-root controls;
stop on reconfigure failure and remove the cache. (3) an Action/ID registry
reappears; blast radius: all product routing; stop immediately and delete it.
(4) plugin method input loses inference; blast radius: parameterized product
APIs; stop if callback annotations or string casts are needed. (5) focus
targets the wrong root; blast radius: mounted controls; stop on multi-root
browser failure and repair the feature hook/framework focus path.

**Exit condition:** All three vertical pilots compile without callback
annotations or string dispatch, use their existing plugin update owner, produce
byte/structure-equivalent document changes and one undo step across
toolbar/shortcut/programmatic paths, pass focused unit/generated/browser proof,
and have current-state JSDoc. Decision owners confirm no Action layer or
generic Plite source change is needed.

**Hard deletion gate:** A pilot migration is not accepted until its raw
string/generic dispatch and duplicate state selector are deleted in the same
packet. Any `PlateAction`/`usePlateAction` proposal or unchanged duplicate
caller fails the packet.

**Rollback answer:** Revert the three caller/hook prop migrations as one
packet; existing plugin transaction groups remain intact, so rollback restores
the exact current behavior without document migration. No persisted data
changes.

#### PRODUCT Packet 2 — Plugin-owned product-intent adoption

**Concept IDs:** PRODUCT-006, PRODUCT-008, PRODUCT-010, PRODUCT-015, PRODUCT-016, PRODUCT-017, PRODUCT-018, PRODUCT-019, PRODUCT-021, PRODUCT-022, PRODUCT-023, PRODUCT-024, and PRODUCT-025. PRODUCT-007/009 remain proof-only and are not silently bundled.

**Decision owner:** Plate Plan per owning feature package. Plite Plan decides only a reproduced kernel gap. Security-sensitive link URL behavior remains owned by the link package.

**Execution skill:** `plate-plan --deep`, then bounded package `task`/`tdd` packets; `autoreview` at each package boundary. Use `changeset` for public package exports.

**Final owner:** Each feature method and feature-specific hook stays with its
product package: basic nodes/marks, code-block, flat list, structural list under
its final Packet 5 name, link, basic styles, media, and Plate history
integration. Registry/kits own callers. Plite remains the conditional advanced
command owner.

**Prerequisites:** Packet 1 direct plugin-portal proof accepted; no Action
namespace exists; structural-list public names decided before migrating
overlapping imports; media side-effect boundary written down; link entry points
demonstrably call current validation/sanitization.

**Dependent packets:** Packet 3 consumes the final control components; Packet
4 and Packet 6 use the same direct plugin-portal rule; Packet 7 closes
docs/proof. Packet 5 can run independently but its final names block structural
list public examples.

**Entry condition:** The pilot proves one simple, one block, and one
parameterized plugin update without string dispatch, a second registry, stale
selectors, double apply, or focus regression. Each package supplies an
inventory mapping current callers to one existing behavior owner and named
deletion.

**Exact implementation scope:** Publish or tighten inferred plugin update
methods and feature hooks only where a current public intent lacks them:
remaining basic marks; paragraph/heading/quote/code-block/hr type changes; flat
and structural list toggles with model-specific names; link create/edit/unlink
state; font/background set/clear; pure media URL insertion and serializable
placeholder reservation. Keep Plite History's existing direct undo/redo API.
Migrate corresponding toolbar/shortcut/programmatic callers only when that
deletes a duplicate transform or string route. Preserve parsers, schema,
middleware, upload controllers, caption/resize, history engine, and both list
models. A Plite command remains optional and job-led, never mandatory wrapping.

**Current shape:** Plite supplies the complete generic command/history substrate, and Plate packages supply mature feature transforms, schema, parsers, middleware, upload, and UI; callers nevertheless enter those owners through inconsistent transaction groups, raw registry callbacks, string keys, and duplicated state selectors.

**Current Wordgard actual shape, lifecycle, owner, and evidence:** Wordgard feature bundles co-publish command, schema, binding, menu, and input behavior for blocks/marks/lists/links/media/colors (`../wordgard/src/schema/bundle.ts:12-54`, `../wordgard/src/schema/block.ts:12-356`, `../wordgard/src/schema/mark.ts:10-187`, `../wordgard/src/schema/list.ts:10-68`, `../wordgard/src/schema/link.ts:8-170`, `../wordgard/src/schema/image.ts:9-228`, `../wordgard/src/schema/color.ts:8-324`). This yields one obvious caller path, but merges product UI and model ownership.

**Current Plite actual shape, lifecycle, owner, and evidence:** Generic commands and immutable handler publication already cover insert/delete/select/node/block/mark/history mechanics (`packages/plite/src/core/editor-commands.ts:486-734`, `packages/plite-history/src/history-extension.ts:226-254`). Extensions compile/reconfigure command pipelines; React binds mounted roots. No product package catalog belongs in Plite.

**Current Plate actual shape, lifecycle, owner, and evidence:** Feature packages own correct schema/transform/middleware behavior, while registry controls directly call transaction groups or string types. Blocks/marks are composed in kits (`apps/www/src/registry/components/editor/plugins/basic-blocks-base-kit.tsx:25-35`, `apps/www/src/registry/components/editor/plugins/basic-marks-base-kit.tsx:17-27`); list/link/media/color owners are evidenced in PRODUCT-019/021–026. Lifecycle is plugin compile, installed editor transform, direct UI caller, apply; public intent is fragmented.

**Target shape:** Every accepted user intent has one package-owned inferred
plugin update method or feature API calling the existing transform. Shortcuts,
toolbar, tests, and host automation share it. React hooks package focus and
state only where that is a real feature concern. Transaction groups remain the
compositional implementation API. A headless/interceptable/previewable intent
may additionally expose a Plite command, but ordinary calls do not route
through a descriptor wrapper.

**Public TypeScript:** Representative accepted shape:

```ts
editor.plugin(ListPlugin).update.toggle({ listStyleType: 'disc' });
editor.plugin(StructuralListPlugin).update.toggle();
editor.plugin(BaseLinkPlugin).update.upsert({ text, url });
editor.plugin(BasePlaceholderPlugin).update.insert('image', {
  id,
  name,
});

editor.plugin(FontColorPlugin).update.set(value);
editor.update.history.undo();
```

There is no generic `executeProductAction(id: string)`, action catalog, or
mandatory descriptor. Host automation imports plugin refs/functions; app
command palettes may map their own IDs to explicit calls.

**Internal TypeScript:** Each plugin contributes an inferred transaction group:

```ts
BaseLinkPlugin.extendTx(({ editor }) => (tx) => ({
  upsert: (input) => {
    // current validation and owning link transform
  },
}));
```

Media reservation input is serializable metadata only. The host upload
controller converts a `File` to metadata, calls the owning placeholder update,
performs I/O, then calls the existing finalization owner. History controls call
`editor.update.history.undo/redo` directly.

**Usage — simple:** Import one plugin and its feature hook into a toolbar
button; render current state and call its update once.

**Usage — advanced:** A host command palette combines explicit functions over
installed plugin refs, supplies dynamic link/media/color input, and controls
presentation without package auto-registration.

**Usage — extension author:** Define an inferred plugin update for ordinary
semantic behavior. Define a product command only for a proved
headless/interception/preview job; delegate it to the same feature owner.

**Usage — host app:** A non-React host calls plugin updates directly; React
hosts use feature hooks or `useEditorSelector`; upload I/O stays in host
controllers; feature absence fails at the typed plugin portal, never dynamic
global discovery.

**Compiled representation, invariants, reconfiguration, and runtime:** Plate
model publication compiles existing plugin update groups and shortcuts;
independently justified commands use Plite's current immutable pipeline.
Invariants: one feature owner per intent; model-specific list names; link
validation cannot be bypassed; media inputs stay serializable; history API
unchanged; input rules do not nested-dispatch; absent plugins cannot execute;
no action identity/state catalog. Reconfiguration replaces plugin publication
atomically. Runtime remains feature state read, one plugin update, one apply.

**Public breaks:** Add or tighten feature-owned plugin update exports and
possible typed registry props only where inventory proves a missing owner.
Structural-list names follow Packet 5 and are a deliberate hard break there.
Existing transaction APIs stay public unless separately accepted; no Plite
break and no document format migration.

**Plite adoption:** No source/API adoption for ordinary features. Add
package-level integration tests against current transactions/history. A
reproduced command-runtime failure exits this packet and routes separately.

**Plate adoption:** Basic nodes/marks, code-block, list/list-structural, link,
basic styles, media, and history-facing Plate owners expose/retain inferred
updates and feature hooks; registry controls and shortcuts migrate to explicit
plugin refs; kits import final plugins/components explicitly.

**Downstream adoption:** apps/www demos and affected registry controls;
apps/plite proof imports; HTML/Markdown/other codecs for unchanged output; Yjs
and history for one-change/one-undo/collaboration behavior;
docs/JSDoc/examples; native fixtures/unit/property/browser tests. Upload host
controllers adopt only reservation/finalization intent, never move I/O into
editor transactions.

**Deletion scope:** Per migrated feature, delete raw registry mutation
callbacks, string node-type dispatch, duplicate active/enabled selectors, and
rule-local duplicate transforms. Delete no feature
parser/schema/renderer, Plite generic command, transaction group needed for
composition, list model, link sanitizer, media
placeholder/caption/resize, upload controller, or history engine. Delete any
Action wrapper/prototype. Any new feature method that leaves the same duplicate
caller untouched fails its subpacket.

**Focused unit proof:** Per owner: inferred input/editor type; absent-plugin
rejection; current transform equality; read-only/state selectors; one
apply/undo; reconfigure/remove plugin; link safety; model-specific list
behavior; media reservation ordering/identity; history enabled/undo/redo;
input-rule prefix/continuation. Handler fallback applies only to an
independently justified command.

**Generated/property/fuzz laws:** Generate valid/invalid feature inputs,
selections, installed-feature combinations, and reconfiguration sequences.
Assert either documented no change or equivalence to the current owning
transform. Link fuzz retains sanitizer rejection; list fuzz never crosses model
representation; media metadata remains serializable and unique.

**Browser proof:** Required for every migrated visible control and shortcut. Test mounted-root focus, selection retention, read-only/disabled/active state, multi-root isolation, toolbar/keyboard/programmatic parity, link floating UI and unsafe URLs, list transforms in each model, media dialog/drop/upload placeholder lifecycle, color set/clear, history one-step behavior, and zero console errors. Use focused demos first; broad matrix only at closure.

**Benchmark:** N/A for pure mark/block/history caller migrations because they
reuse current transforms. Media asserts no extra scan or duplicate upload
reservation; Packet 6 owns the color no-traversal benchmark. Source/runtime
inspection must show no second registry/index.

**Failure modes:** (1) a caller wrapper changes transaction grouping, creating
multiple undo/Yjs events; blast radius: every migrated feature and
collaboration; stop on apply/change-count mismatch and revert that package's
callers. (2) a link entry bypasses sanitizer; blast radius: rendered unsafe
URLs; stop immediately and roll back the link migration. (3) a media update
captures `File`/promise/progress or loses placeholder identity; blast radius:
upload loss/duplication and non-serializable state; stop on type/runtime
violation. (4) flat/structural list methods stay ambiguously named; blast
radius: document structure corruption; stop on cross-model fixture diff and
wait for Packet 5 names. (5) input rules nested-dispatch, changing IME/undo;
blast radius: typing; stop on prefix/continuation or browser composition
failure. (6) a stale hook/plugin ref survives removal; blast radius:
reconfiguration exceptions; stop on removal proof and fix the current-revision
portal.

**Exit condition:** Every accepted package has one feature update/state owner,
all inventoried callers migrated, named duplicates deleted, current
transform/document/codec behavior preserved, one apply/undo/Yjs event, no
Action layer, and focused unit/generated/browser proof. Any feature without a
concrete deletion remains outside this packet.

**Hard deletion gate:** Each package subpacket must delete its mapped raw
caller/state duplication before completion. Link/media/history/list old paths
cannot remain as silent registry fallbacks. Transaction groups remain with
documented composition callers. `definePlateAction`, `PlateAction`,
`usePlateAction`, and action registries must remain absent.

**Rollback answer:** Roll back package-by-package by restoring
registry/shortcut callers and removing only newly added redundant feature
methods/hooks; current transforms/schemas remain, so no data migration is
needed. If a public export already shipped, issue a revert release rather than
preserving a broken alias.

#### PRODUCT Packet 3 — Explicit app-owned toolbar JSX

**Concept IDs:** PRODUCT-011, PRODUCT-012, PRODUCT-013, and PRODUCT-015.
PRODUCT-012 is the primary changed concept; PRODUCT-011 supplies typed feature
methods, PRODUCT-013 preserves React control ownership, and PRODUCT-015
preserves explicit app kits.

**Decision owner:** Plate Plan. The apps/www registry UI owner decides product
order and presentation. Plate package owners may review feature-control usage
but cannot auto-place themselves.

**Execution skill:** `plate-plan --deep`, `components`, `tdd`, Browser verification, then `autoreview`.

**Final owner:** One colocated apps/www registry React component owns explicit
toolbar structure. Existing registry controls own rendering and state. Plate
packages own feature behavior only. Plite owns nothing in the layout.

**Prerequisites:** Packet 1 direct plugin-portal rule accepted; a complete
inventory of fixed toolbar, turn-into, more/overflow, responsive variants,
feature gates, separators, controls, labels/icons, shortcuts, and test/demo
consumers; current visual and DOM baseline captured.

**Dependent packets:** Packet 7 proof/docs. Packet 2 may tighten additional
controls, but no catalog conversion is required.

**Entry condition:** Every current toolbar item maps to one explicit React
component in visible JSX. Any proposal for a layout schema, IDs, renderer,
validator, freezer, package discovery, parents, ranks, or condition DSL stops
the packet.

**Exact implementation scope:** Colocate the fixed-toolbar composition and any
genuinely shared turn-into/more constants with their owning React controls;
render the current order/groups/separators/overflow as ordinary JSX; preserve
labels/icons/shortcuts/responsive behavior; delete only duplicated arrays and
raw string rows proven redundant; add structural, accessibility, visual, and
focus proof. Do not build a data type/renderer, generic package, plugin
marketplace, schema contribution, or global registry.

**Current shape:** A bounded audit of Plite core, Plite React, and Plite docs
returned 0 matches for seven named menu-topology symbols, while Plite docs
assign UI to hosts. Plate registry React controls are strong; some fixed
toolbar, turn-into, and overflow catalogs/string rows are duplicated. Explicit
JSX itself is the correct owner and is not a defect.

**Current Wordgard actual shape, lifecycle, owner, and evidence:** Wordgard menu resolver discovers global facets, parent backlinks, templates, ranks, groups, separators, suppression, and overflow, then builds imperative menu entries (`../wordgard/src/command/menu.ts:197-385`, `../wordgard/src/command/menu.ts:387-486`). Feature packages can influence global layout. Lifecycle is registration followed by resolution and DOM rendering; menu core owns topology.

**Current Plite actual shape, lifecycle, owner, and evidence:** Plite is headless and explicitly leaves rendering/UI ownership to host frameworks (`content/docs/plite/concepts/09-rendering.mdx:6-9`, `content/docs/plite/concepts/09-rendering.mdx:136-170`). The exact PRODUCT-012 audit queried `defineMenu`, `menuTopology`, `menuItem`, `toolbarLayout`, `overflowItem`, `itemRank`, and `parentMenu` across `packages/plite/src`, `packages/plite-react/src`, and `content/docs/plite`; it returned 0 matching lines. The claim is narrowly that this Plite surface has no named product-menu topology, not that hosts lack UI.

**Current Plate actual shape, lifecycle, owner, and evidence:** apps/www hard-codes fixed toolbar JSX and a separate turn-into catalog (`apps/www/src/registry/ui/fixed-toolbar-buttons.tsx:50-168`, `apps/www/src/registry/ui/turn-into-toolbar-button.tsx:43-205`). React controls have strong host behavior, but order/catalog/state wiring is duplicated. Lifecycle is module JSX render plus per-control editor subscriptions; app registry owns it.

**Target shape:** One readable React component imports explicit controls and
renders them in source order. Small repeated groups may be ordinary React
components. Product composition stays visible in JSX; there is no second
configuration or compile lifecycle.

**Public TypeScript:** This is app-local JSX, not a package public API:

```tsx
export function FixedToolbarButtons() {
  return (
    <>
      <HistoryToolbarButton />
      <ToolbarSeparator />
      <TurnIntoToolbarButton />
      <AlignToolbarButton />
      <FontColorToolbarButton colors={brandColors} />
      <MoreToolbarButton />
    </>
  );
}
```

Labels/icons/shortcut hints remain ordinary control props or component-owned
facts. Packages cannot auto-place controls or assign numeric ranks.

**Internal TypeScript:** There is no layout representation. React keys exist
only where JSX arrays require them. Existing popover/overflow components retain
their own measurement and focus lifecycle.

**Usage — simple:** Import a control and place it in the JSX.

**Usage — advanced:** Extract a real repeated React group, compose
desktop/mobile variants explicitly, or move that component into the existing
overflow component.

**Usage — extension author:** N/A; packages do not register app UI. An
extension author exports feature behavior/components only when that package
actually owns them and documents manual host adoption.

**Usage — host app:** A downstream host composes its own JSX; no Plate package
requires the apps/www arrangement or renderer.

**Compiled representation, invariants, reconfiguration, and runtime:** None
beyond React's normal element tree. Invariants: source order is product order;
no package discovery/rank; no editor mutation during module evaluation; each
control owns its narrow subscriptions; app configuration chooses ordinary JSX
branches. Runtime renders the explicit controls directly.

**Public breaks:** apps/www registry component props/imports may change only
where deduplication requires it. No layout API, Plate package, or Plite public
break. Registry source-copy consumers remain downstream; CI owns generated
templates.

**Plite adoption:** None; toolbar composition is app product policy.

**Plate adoption:** Registry UI owns the React composition; feature packages
keep behavior; static/client editor kits import the final toolbar component
explicitly.

**Downstream adoption:** Fixed toolbar, turn-into, more/overflow controls,
mobile/desktop variants, apps/www demos, apps/plite proof, registry source
consumers, component docs/examples, visual/accessibility/focus tests. Package
docs state that hosts arrange their own UI. History/Yjs/codecs do not adopt
composition and only regress resulting editor behavior.

**Deletion scope:** Delete only duplicate fixed-toolbar/turn-into/more arrays
and raw string rows after explicit JSX covers the same owner. Keep
feature-specific control components. Delete/reject any attempted layout data
union, renderer, definition helper, validation/freezing layer, global action
registry, plugin contribution, parent backlink, or rank field.

**Focused unit proof:** Rendered source order/groups/separators;
hidden/disabled/active state; missing feature; overflow; control identity; no
editor mutation at module evaluation; selector subscription isolation. There
are no layout IDs, nesting rules, or freeze validators to test.

**Generated/property/fuzz laws:** N/A for static JSX topology. Generate only
feature-presence/state combinations for shared control logic and assert
unrelated source order and availability remain stable.

**Browser proof:** Required. Capture current and target fixed/turn-into/more UI on standalone demos at desktop and mobile widths. Verify keyboard traversal, roving/tab order, accessible names, disabled/read-only/active state, popover open/close focus, overflow, responsive behavior, feature absence, mounted-root dispatch, and no console errors.

**Benchmark:** Render/update profiling must show subscriptions limited to each
control's facts and no document traversal or layout registry scan. Large editor
benchmark is N/A.

**Failure modes:** (1) refactoring JSX changes order or popover identity; blast
radius: toolbar interaction; stop on structural/browser mismatch and keep the
original explicit component boundary. (2) a shared control subscribes to the
whole editor/document; blast radius: typing performance; stop on render-count
regression and narrow the hook. (3) a control loses focus/ARIA behavior; blast
radius: color/link/media/turn-into accessibility; stop on Browser failure and
restore that component. (4) a data layout or package discovery layer
reappears; blast radius: every host/dependency direction; stop and delete it.
(5) registry source generation drifts; blast radius: downstream copied
components; stop until source registry/CI ownership is confirmed.

**Exit condition:** One explicit JSX composition represents every scoped item
with visual/order/accessibility/focus parity; only proven duplicate catalogs
and raw string rows are deleted; no layout DSL/renderer or package
auto-registration exists; focused tests and desktop/mobile Browser proof pass.

**Hard deletion gate:** No new renderer lands. A deduplication change cannot
land while the old duplicate remains authoritative, and it cannot replace
readable JSX with `defineToolbarLayout`, `group`, `actionItem`,
`controlItem`, IDs, or a renderer.

**Rollback answer:** Restore the prior fixed/turn-into JSX modules and undo
only the colocation/deduplication. Feature APIs and document data are
unaffected.

#### PRODUCT Packet 4 — Writing direction product feature

**Concept IDs:** PRODUCT-009, PRODUCT-014, PRODUCT-018, and PRODUCT-020. PRODUCT-020 changes; PRODUCT-009 is conditional browser/DOM proof, PRODUCT-014 preserves schema ownership, and PRODUCT-018 covers shortcut/input integration if accepted.

**Decision owner:** Plate Plan owns product semantics, property, codec/render,
plugin updates, kits, UI, and docs. Plite Plan owns a conditional generic
DOM/navigation capability only after a live browser failure proves it is not
expressible in the Plate feature/host.

**Execution skill:** `plate-plan --deep`, `tdd`, Browser matrix, `autoreview`; conditional `plite-plan --deep` for a reproduced generic host gap; `changeset` for package API.

**Final owner:** `packages/basic-styles` owns
`BaseWritingDirectionPlugin`, `WritingDirection`, inferred updates, and
parser/render policy. Registry owns toolbar and kits. Plite React/DOM owns only
a proven generic mounted-root/navigation fact. Codec owners explicitly accept
or reject direction round-trip.

**Prerequisites:** Packet 1 direct plugin-portal rule; current basic-styles
target/property conventions; accepted persistence rule (absence means auto);
exact HTML and non-HTML codec policy; baseline real-browser navigation capture
for mixed LTR/RTL and multi-root documents.

**Dependent packets:** Packet 7 docs/proof. A conditional Plite DOM subpacket, if opened, must finish or be deleted before Packet 4 exits.

**Entry condition:** Decision owner approves: persisted/public
`WritingDirection` values are only `ltr` and `rtl`; absence/`clear()` means
auto; HTML parses/serializes `dir`; browser owns Unicode bidi layout; no
document scan/model-side bidi state; target element types are configured like
alignment; unsupported codecs report policy rather than silently promise
parity.

**Exact implementation scope:** Add `WritingDirection`, plugin/property
targeting, parser/render attribute mapping, inferred `set`/`clear` updates,
static and client kit entries, explicit toolbar control, focused demo,
current-state docs/JSDoc, HTML fixtures, codec policy tests, history/Yjs
regressions, and Chromium/Firefox/WebKit navigation matrix. Do not add a normal
command wrapper, Action layer, automatic text scanning, or persisted computed
direction. Open a private proof-only Plite DOM experiment only if the browser
matrix reveals a generic missing host fact.

**Current shape:** Plite already has generic bidi host behavior: a bounded Plite DOM/React audit returned 30 direction matches in geometry and keyboard logic. A separate bounded Plate styles/registry/docs audit returned 0 matches for five named direction-product symbols. The evidenced gap is a persisted Plate direction property/plugin/update/UI/codec policy, not generic bidi navigation.

**Current Wordgard actual shape, lifecycle, owner, and evidence:** Wordgard block feature scans text with bidi logic, stores direction state, and exposes auto/ltr/rtl bindings/buttons (`../wordgard/src/schema/block.ts:145-285`). Feature bundle owns schema, computation, command, and menu lifecycle from text scan through render/control.

**Current Plite actual shape, lifecycle, owner, and evidence:** Plite schema supports typed targeted properties and immutable compilation; selection/DOM docs split model selection from mounted host mapping (`packages/plite/src/interfaces/schema.ts:99-484`, `content/docs/plite/concepts/16-selection-and-dom.mdx:12-31`, `content/docs/plite/concepts/16-selection-and-dom.mdx:74-113`). The exact host audit queried computed direction, text-direction classification, RTL, and LTR across `packages/plite-dom/src` and `packages/plite-react/src`; it returned 30 lines. Current owners include computed/declared CSS-direction geometry (`packages/plite-dom/src/plugin/dom-geometry.ts:68-102`) and keyboard text classification/movement (`packages/plite-react/src/editable/keyboard-input-strategy.ts:84-151`, `packages/plite-react/src/editable/keyboard-input-strategy.ts:600-630`, `packages/plite-react/src/editable/keyboard-input-strategy.ts:840-865`). Plite owns generic host facts, not the proposed product property.

**Current Plate actual shape, lifecycle, owner, and evidence:** `BaseTextAlignPlugin` owns a targeted string property, preserves it across allowed type changes, removes the default, parses HTML style, injects render props, and exposes `tx.set` (`packages/basic-styles/src/lib/BaseTextAlignPlugin.ts:14-79`). Alignment docs show package/kit usage (`content/docs/(plugins)/(styles)/text-align.mdx:11-25`, `content/docs/(plugins)/(styles)/text-align.mdx:119-175`). The exact product audit queried `BaseTextDirectionPlugin`, `TextDirectionPlugin`, `textDirection`, `writingDirection`, and `directionPlugin` across `packages/basic-styles/src`, `apps/www/src/registry`, and style docs; it returned 0 lines. The bounded absence is a named Plate product feature, not browser/Plite bidi support.

**Target shape:** Writing direction follows alignment's
target/property/transaction architecture but renders/parses semantic HTML
`dir`. The model stores only explicit `ltr`/`rtl`; omitted property means auto.
The plugin's inferred update changes/clears it atomically. Browser layout
computes bidi; only a measured generic navigation/mapping gap moves to Plite
DOM.

**Public TypeScript:** Proposed package surface:

```ts
export type WritingDirection = 'ltr' | 'rtl';

export const BaseWritingDirectionPlugin = createBasePlugin({
  key: KEYS.writingDirection,
  // targeted element property; absence means auto
}).extendTx(({ editor, plugin, type }) => (tx) => ({
  set: (value: WritingDirection, options?) => {},
  clear: (options?) => {},
}));

editor.plugin(WritingDirectionPlugin).update.set('rtl');
editor.plugin(WritingDirectionPlugin).update.clear();
```

The implementation must infer `options`/transaction callback types from live APIs; explicit callback annotations are not accepted as a type-system patch.

**Internal TypeScript:** Property declaration uses current
`own.elementProperty(property.string(), { target, typeChange:
'preserve-if-allowed' })` conventions, validates only stored `ltr`/`rtl`, and
injects an HTML `dir` attribute only for a stored value. The feature hook reads
the targeted current block; codec adapters consume the same property through
their current owner APIs.

**Usage — simple:** Add `BaseWritingDirectionPlugin`/client counterpart to the
basic-styles kit and place explicit auto/ltr/rtl controls in app JSX; auto calls
`clear()`.

**Usage — advanced:** Configure `targetPluginKeys` for paragraph/headings/quotes; programmatically set a selection of target blocks; render separate roots with independent direction.

**Usage — extension author:** A custom block opts into direction by passing an installed plugin reference/key through current target configuration; it does not implement its own direction field.

**Usage — host app:** HTML host round-trips `dir`; React host renders mixed-script roots and uses browser-native navigation. Non-HTML hosts choose explicit preservation/omission policy in their codec.

**Compiled representation, invariants, reconfiguration, and runtime:** Plate
compilation contributes one targeted element property to the immutable Plite
schema plus parser/render and inferred transaction methods. Invariants: stored
value is absent/ltr/rtl only; `auto` is an app choice and never persists;
targets are installed and allowed; type changes preserve only when target
remains valid; computed bidi state never enters model; one update yields one
commit; each root renders independently. Reconfiguration changing targets
recompiles schema and validates existing values through current policy. Runtime
reads current block state, calls set/clear, renderer emits `dir`, and browser
owns layout/navigation.

**Public breaks:** Additive basic-styles exports and kit/plugin behavior. Documents may begin carrying an explicit direction property for ltr/rtl; this is an intentional document/codec surface and requires a changeset. No Plite break unless the conditional subpacket is separately accepted. Markdown has no claimed native direction round-trip; the docs must say whether raw HTML is the only preservation route.

**Plite adoption:** None initially. Conditional path: if real-browser proof demonstrates a generic selection/DOM mapping failure independent of Plate direction policy, open a separate Plite Plan with the exact failing root/movement fact. A private Packet 4 proof module may temporarily own instrumentation only; it is not exported.

**Plate adoption:** basic-styles static/client plugins, target configs,
inferred updates/feature hook, kits, toolbar, docs, demo, HTML codec
integration, fixtures/tests.

**Downstream adoption:** apps/www basic-styles kits and direction demo/control; apps/plite browser matrix; HTML codec; Markdown and other codec policy tests/docs; paragraph/heading/quote/custom target fixtures; history one-step regression; Yjs synchronization; docs/examples/install snippets; accessibility and browser navigation proof.

**Deletion scope:** Delete no current Plate direction product feature because the bounded product audit found none. Do not delete existing Plite DOM geometry or React keyboard bidi behavior. The new plugin replaces ad hoc per-app `dir` attributes for adopted editor blocks, which must be inventoried and deleted if any live occurrences are found during implementation. The private temporary proof owner is the Packet 4 local browser instrumentation module; reason: classify any remaining browser failure against existing host owners; dependent Packet 7; hard removal gate: promote only a proven missing generic fact into an accepted Plite DOM packet or delete all instrumentation before Packet 4 exit. No new scanner or computed-direction cache may remain.

**Focused unit proof:** Value validation and default omission; target
selection; set/clear; type-change preservation/removal; installed-ref typing;
parser/render mapping; reconfiguration; toolbar active/enabled/read-only; one
transaction/undo; malformed `dir` handling; multi-block selection policy.

**Generated/property/fuzz laws:** Generate mixed allowed/disallowed target trees, absent/ltr/rtl values, type changes, schema reconfiguration, and malformed HTML attributes. Assert stored domain, omission of auto, parse/render idempotence for supported HTML, no mutation outside targets, and stable round-trip. Generate mixed Unicode strings only to exercise browser fixtures; never use a model scanner as oracle.

**Browser proof:** Mandatory matrix in Chromium, Firefox, and WebKit: mixed Arabic/Hebrew/Latin paragraphs; nested inline marks/links; left/right, word, line, Home/End, selection extension; copy/paste; IME where runner supports it; LTR and RTL editor roots; independent multi-root direction; toolbar state/focus/read-only; HTML import/render; no console errors. Unit DOM mocks cannot close the packet.

**Benchmark:** Required invariant benchmark/assertion: setting/rendering direction is proportional to targeted blocks and performs no full-document text scan. Compare open/render/navigation baseline on a large mixed-script fixture; reject a persistent model-side bidi pass.

**Failure modes:** (1) `auto` is persisted and becomes stale when text changes;
blast radius: every direction document/codec; stop on omission/property law
failure and remove the plugin data path. (2) HTML codec/render disagree or
unsupported codecs silently drop explicit ltr/rtl; blast radius: data loss
across import/export; stop before publication and either implement owner proof
or declare/reject that codec adoption. (3) browser movement differs across
engines and app code patches it locally; blast radius: selection corruption;
stop and route the exact generic fact to Plite Plan. (4) target
reconfiguration leaves invalid properties; blast radius: schema/documents;
stop on compile/reconfigure proof and fix target law. (5) Yjs/history emits
extra changes; blast radius: collaboration/undo; stop on event-count mismatch
and revert the update/control integration.

**Exit condition:** `WritingDirection`, package plugin/update API,
schema/property, HTML policy, UI/kits/docs all exist; the conflicting Plate
`TextDirection` name and all Action machinery remain absent;
focused/generated/codec/history/Yjs tests pass; full browser matrix passes or
an accepted conditional Plite packet resolves the exact generic gap; zero model
scanning; temporary instrumentation removed.

**Hard deletion gate:** Any discovered app-local direction field/`dir` patch for adopted blocks is deleted when the package owner lands. Conditional instrumentation cannot ship. A direction plugin that coexists with a model bidi scanner or stores `auto` fails the gate.

**Rollback answer:** Before public release, remove plugin/kit/UI and direction
document fixtures; documents with explicit direction produced only by
development are disposable. After release, rollback requires a deliberate
changeset/codec strategy for persisted `ltr`/`rtl`; do not silently strip user
data. A conditional Plite change rolls back independently if it has no document
representation.

#### PRODUCT Packet 5 — Structural-list hard rename

**Concept IDs:** PRODUCT-019 and PRODUCT-028. PRODUCT-019 supplies the two-model decision; PRODUCT-028 owns complete public adoption and deletion truth.

**Decision owner:** Plate Plan for package/API/owner naming; release-lanes for package publication; registry/docs owners for routes/components. The decision is hard rename, not a compatibility period.

**Execution skill:** `plate-plan --deep`, `hard-cut`, `changeset`, `registry-changelog` only where release policy requires it, Browser verification, and `autoreview`.

**Final owner:** `@platejs/list-structural` owns structural list
schema/behavior. `@platejs/list` remains the flat property-model owner.
Registry structural kits/components/routes use `list-structural`. Serialized
structural node values remain owned by the structural package and do not change
in this mechanical packet.

**Prerequisites:** Complete live inventory of package directory/name, root workspace dependencies, exports, imports, source identifiers, `KEYS`/`NODES` code names versus serialized values, registry manifests/components/kits/examples/values/routes, docs/localizations, tests/fixtures, apps/plite imports, build/release/changeset config, and immutable/generated-history exclusions. Baseline structural and flat behavior/codec fixtures must pass before rename.

**Dependent packets:** Packet 2 must use final structural action names when it touches lists. Packet 7 closes docs/install/runnable proof. The rename is otherwise independent of Packets 1, 3, 4, and 6.

**Entry condition:** The decision owner approves all target names and a no-alias cut. Serialized element type strings (`ul`, `ol`, `li`, `lic`, and current task-list values) are recorded byte-for-byte and frozen as behavior invariants; any request to change them becomes a separate document migration and stops this packet.

**Exact implementation scope:** Move package/directory/manifest/repository
metadata to `packages/list-structural` and `@platejs/list-structural`; rename
public `BaseListPlugin`/`ListPlugin` to
`BaseStructuralListPlugin`/`StructuralListPlugin`; rename structural-only
option/transaction/config types and code constants that contain `Classic` to
`Structural` while preserving their runtime node values; update barrels
through `pnpm brl`; update imports/dependencies/workspace config; rename
registry kit/node/toolbar/demo/value identifiers and docs/routes to
`list-structural`; update apps/plite proof and all current
docs/localizations/install snippets; add a major changeset; delete old live
names and aliases. Do not change transform code, normalization law, schema
content, parser/render, input rules, or document node values. Do not edit
CI-controlled `templates/**`; CI regeneration owns them.

**Current shape:** Plate has two valid list owners—flat `@platejs/list` and nested `@platejs/list-classic`—on the same Plite substrate; the structural implementation and serialized values are sound, but its temporal package/plugin/registry/docs names obscure representation and propagate through the workspace.

**Current Wordgard actual shape, lifecycle, owner, and evidence:** Wordgard has one clearly structural list/list-item schema plus wrap/unwrap/join commands (`../wordgard/src/schema/list.ts:10-68`, `../wordgard/src/command/commands.ts:292-419`). Feature owner/name directly communicates representation; schema install creates the nested list lifecycle.

**Current Plite actual shape, lifecycle, owner, and evidence:** Plite owns representation-neutral schema/commands/fitter and can compile either product model (`packages/plite/src/interfaces/schema.ts:99-484`, `packages/plite/src/core/editor-commands.ts:486-734`). No Plite name or runtime changes.

**Current Plate actual shape, lifecycle, owner, and evidence:** `packages/list` represents flat list metadata on arbitrary blocks (`packages/list/src/lib/BaseListPlugin.tsx:41-112`, `packages/list/src/lib/BaseListPlugin.tsx:263-315`). `packages/list-classic` represents nested list containers/items with structural transforms (`packages/list-classic/src/lib/BaseListPlugin.ts:27-259`). Current docs describe different jobs (`content/docs/(plugins)/(elements)/list-classic.mdx:12-32`, `content/docs/(plugins)/(styles)/list.mdx:12-184`), but `classic` falsely frames the structural model as temporal legacy. The package/plugin/key/registry names propagate across 100+ live references.

**Target shape:** Two peers named by representation: `@platejs/list` for flat
styling/metadata and `@platejs/list-structural` for nested structural lists.
Public top plugins say `StructuralList`; app kits/routes say
`list-structural`. Runtime schema and serialized documents are unchanged.

**Public TypeScript:** Target imports:

```ts
import {
  BaseStructuralListPlugin,
  type StructuralListConfig,
} from '@platejs/list-structural';
import {
  StructuralListPlugin,
} from '@platejs/list-structural/react';

const StructuralListKit = [
  StructuralListPlugin.configure({
    options: { validLiChildren: [CustomBlockPlugin] },
  }),
];
```

There are no `@platejs/list-classic`, structural `BaseListPlugin`,
`ListPlugin`, or `ListConfig` aliases. Flat imports from `@platejs/list`
remain unchanged.

**Internal TypeScript:** Rename structural code identities such as `ListPluginOptions`/`ListPluginTransaction` and `KEYS.listClassic` to structure-specific names while preserving node-key values used in documents. `NODES.ulClassic`/`NODES.olClassic` code properties may be renamed only if their values remain exactly `'ul'`/`'ol'`; task-list value `'action_item'` likewise remains. Tests snapshot descriptor keys separately from document types so a code-name rename cannot silently migrate data.

**Usage — simple:** Install `@platejs/list-structural` and add
`StructuralListPlugin`/registry `list-structural-kit`.

**Usage — advanced:** Configure valid list-item children and structural input rules through the renamed plugin; import flat `@platejs/list` separately when a host wants the property model.

**Usage — extension author:** Target structural list/item plugin refs through renamed exports; do not inspect package-name strings or rely on aliases.

**Usage — host app:** Choose one or both models explicitly in kits; serializers/parsers stay model-specific; persisted structural documents load unchanged.

**Compiled representation, invariants, reconfiguration, and runtime:** The compiled schema, command handlers, transactions, and rendered element types are byte/structurally equivalent before and after rename. Invariants: same plugin graph behavior, same `ul`/`ol`/`li`/`lic`/task node values, same correction/input/clipboard/HTML/Markdown laws, no alias exports/package redirects, no automatic document conversion, no flat-model changes. Reconfiguration uses renamed plugin refs but produces the same schema contribution. Runtime behavior is unchanged; only module and descriptor identities approved by the plan change.

**Public breaks:** Major package rename and public symbol/import/registry route break. Consumers must replace imports and registry names atomically. No compatibility alias, deprecation wrapper, dual package publication, or runtime document migration. A changeset and coordinated release are mandatory.

**Plite adoption:** None; reason: generic schema/command mechanics and document representation do not change. Plite tests only prove compiled output equivalence if package integration touches them.

**Plate adoption:** Package directory/manifest/exports/types/tests, root dependency map, structural plugin identities, all consuming Plate packages, registry manifests/kits/UI/examples/values, docs/localizations/routes, apps/www and apps/plite imports, release metadata and changeset.

**Downstream adoption:** HTML/Markdown serializers and fixtures, history/Yjs regression, docs navigation/search/install snippets, component registry source rows, all example imports, tests, workspace filters, CI package matrices, release tooling. `templates/**` is not manually adopted; CI regeneration consumes corrected source registry inputs. Immutable historical changelog records may retain old text only on an exact decision-owner allowlist and never as a live import/route/dependency.

**Deletion scope:** Delete `packages/list-classic`, `@platejs/list-classic`, structural `BaseListPlugin`/`ListPlugin` ambiguity, live `*Classic*` structural code identifiers, registry `list-classic-*` names/routes/files, current docs/install/import references, and all compatibility aliases. The new package replaces the exact current structural owner; it does not create a third list model. Preserve serialized node string values and immutable historical evidence approved on the allowlist.

**Focused unit proof:** Before/after exported type surface (expected renamed diff only); schema descriptor/node-type snapshots; every existing structural test under the moved package; flat list tests unchanged; plugin configuration/type inference; input rules; delete/insert/split/join/normalize/clipboard; HTML/Markdown round trips; registry import/install resolution; no old live package/module symbols.

**Generated/property/fuzz laws:** Generate valid nested structural documents and editing sequences; normalized document/selection/change output must equal the pre-rename baseline. Generate flat documents and assert zero diff. Generate schema reconfiguration with custom list-item children and prove identical compiled targets. Fuzz import/export fixtures for serialized type stability.

**Browser proof:** Required on renamed standalone structural-list demo plus flat-list demo. Exercise bulleted/numbered/task lists, Tab/Shift-Tab, Enter/backspace/delete, paste, toolbar, undo/redo, HTML/Markdown round trip, reload fixture, and no console/import/route errors. Capture both models so the rename never masquerades as replacement.

**Benchmark:** N/A for a mechanical rename because no performance claim or algorithm change is allowed. Run existing list benchmarks if present only as a no-regression smoke, not as acceptance evidence for changed behavior.

**Failure modes:** (1) a `Classic` code-name rename changes a serialized node value; blast radius: persisted documents/codecs/Yjs; stop on snapshot/fixture diff and restore value before continuing. (2) an alias/package redirect survives; blast radius: indefinite dual ownership and release support; stop hard-cut and delete it rather than ship. (3) registry/docs route/import remains stale; blast radius: installation and generated consumers; stop before release on lexical/link/install failure. (4) flat and structural plugin imports become ambiguous; blast radius: wrong document model in apps; stop on type/import audit and require explicit `StructuralListPlugin`. (5) package move alters bundler exports or workspace resolution; blast radius: all consumers; stop on source-first typecheck/package export failure and roll back move.

**Exit condition:** New package/symbol/registry/docs names resolve everywhere; all old live names are absent except exact approved immutable-history allowlist; no alias exists; structural and flat behavior/serialized outputs match baseline; changeset/release inputs are complete; Browser demos and install links pass.

**Hard deletion gate:** The new package cannot coexist with
`packages/list-classic` or `@platejs/list-classic`. Every live old
import/export/dependency/route/registry identifier must be deleted in the same
release packet. `list-structural`/`StructuralList*` drafts and every runtime or
type alias also fail the gate.

**Rollback answer:** Before publication, revert the mechanical move and consumer renames as one commit; documents are unaffected. After publishing the major rename, rollback means publish a corrected release under the chosen owner or yank according to release policy—do not resurrect a compatibility alias. Because serialized values never changed, document rollback is N/A.

#### PRODUCT Packet 6 — Color-control state, focus, and performance cleanup

**Concept IDs:** PRODUCT-011, PRODUCT-013, PRODUCT-025, and PRODUCT-026.
PRODUCT-026 is the changed UI mechanism; PRODUCT-025 preserves package
schema/update ownership; PRODUCT-011 preserves direct plugin intent;
PRODUCT-013 preserves React lifecycle.

**Decision owner:** Plate Plan and apps/www registry UI owner. `packages/basic-styles` reviews action/schema boundaries; Plite React reviews only mounted-root/focus reuse.

**Execution skill:** `plate-plan --deep`, `components`, `tdd`, Browser verification, focused performance proof, then `autoreview`.

**Final owner:** Basic-styles owns font/background schema and inferred updates.
apps/www registry owns palette, optional controlled recent values, picker
React/ARIA, and focus. A host that wants document-derived colors computes them
outside the component. Plite React/DOM owns generic mounted-root focus.

**Prerequisites:** Packet 1 direct plugin-portal rule; live inventory of both
foreground/background picker callers and shared UI primitives; current
palette/visual/keyboard/focus baseline; explicit product decision whether
recent colors are local component state or controlled app state; 5,000-block
fixture.

**Dependent packets:** Packet 7 docs/proof. Packet 3 consumes the final explicit controls/layout but does not own their internal state.

**Entry condition:** Product owner accepts: default picker never scans the
document; recent colors record explicit successful user choices; a product
that wants document-used colors computes/memoizes them outside and passes the
result as ordinary colors; palette is app config; closing uses framework focus
handling; setting/clearing calls one typed plugin update and one undo step.

**Exact implementation scope:** Reuse/tighten basic-styles inferred
font/background set/clear updates; accept `colors` plus optional controlled
`recentColors`/`onRecentColorsChange` props; default to bounded local recent
state when the app does not control it; migrate foreground/background controls
together; replace full-document color collection and timer focus;
implement/test ARIA grid keyboard navigation; preserve current visual palette;
add no-traversal performance proof and Browser accessibility/focus proof;
delete old scans/timer/raw dispatch/state duplication. Do not add a store
interface, subscription contract, or document-color callback prop.

**Current shape:** Basic-styles already owns correct typed color properties/transforms and Plite React owns mounted command focus; the registry picker owns good visuals but derives used colors by scanning document text nodes on open, restores focus with a timer, and mixes palette/recent/feature state in the control.

**Current Wordgard actual shape, lifecycle, owner, and evidence:** Wordgard color feature owns mark schema, fixed palette, an imperative picker, ARIA grid/navigation, recent/used state, enable/focus, and command binding (`../wordgard/src/schema/color.ts:8-324`). Menu open builds/control state; manual DOM callbacks own focus. Product cohesion is strong, ownership portability is weak.

**Current Plite actual shape, lifecycle, owner, and evidence:** Plite React supplies typed mounted-root command dispatch and focus policy (`packages/plite-react/src/hooks/use-plite-runtime.tsx:1067-1116`). It has no color picker/palette/recent store, correctly.

**Current Plate actual shape, lifecycle, owner, and evidence:** Basic-styles owns sound foreground/background schema and transforms (`packages/basic-styles/src/lib/BaseFontColorPlugin.ts:5-36`, `packages/basic-styles/src/lib/BaseFontBackgroundColorPlugin.ts:5-32`). Registry control scans text nodes for colors on open and uses delayed focus restoration (`apps/www/src/registry/ui/font-color-toolbar-button.tsx:33-72`, `apps/www/src/registry/ui/font-color-toolbar-button.tsx:74-194`). UI lifecycle is menu open, document scan, local selection, delayed close focus.

**Target shape:** Schema/updates remain package-owned. Picker receives ordinary
color values and optional controlled recent values from the app. Opening reads
props/local state only, never document nodes. Choosing/clearing calls one
plugin update, records a successful explicit color locally or through the
controlled callback, and closes with framework-native focus restoration. ARIA
grid behavior is deterministic React state.

**Public TypeScript:** Registry component shape:

```ts
<FontColorToolbarButton
  colors={brandColors}
/>

<FontColorToolbarButton
  colors={[...brandColors, ...memoizedDocumentColors]}
  recentColors={recentColors}
  onRecentColorsChange={setRecentColors}
/>
```

Foreground/background controls own distinct recent arrays. A clear control
calls the plugin's clear update and never records a color.

**Internal TypeScript:** Picker derives immutable cells from `colors` plus
recent values, dedupes/validates normalized color strings without document
reads, and binds `editor.plugin(FontColorPlugin).update.set(value)`/`clear()`.
Radix `onCloseAutoFocus` restores editor focus through the current mounted
root. Document-color selectors, if any, live entirely in the host.

**Usage — simple:** Pass static `colors`; select or clear a color. Bounded
recent choices stay local.

**Usage — advanced:** Control `recentColors` and
`onRecentColorsChange`; compute/memoize any document-used colors in the host
and merge them into `colors`. None enters plugin/schema config.

**Usage — extension author:** N/A for picker state; extension packages export
schema/updates, while the host owns product palette/storage. A custom color
plugin may expose compatible inferred updates.

**Usage — host app:** Compose foreground/background controls in the explicit toolbar layout, choose storage scope, and test accessibility/focus against its own popover framework.

**Compiled representation, invariants, reconfiguration, and runtime:** Only
existing color plugin schema/updates compile with the Plate model.
Colors/recent values are React inputs and never enter schema. Invariants: open
performs zero document traversal; recent records only successful explicit
choices; clear does not add a color; foreground/background values do not
bleed; color order is stable; update yields one commit/undo; focus returns to
the active root; unrelated document changes do not rerender the picker.
Plugin reconfiguration changes update availability; app colors/state change
without recompiling the editor.

**Public breaks:** Registry component props replace implicit used-color
behavior with `colors` and optional controlled recent-color props; component
registry consumers receive an intentional source-level change. Basic-styles
reuses/tightens its plugin updates rather than adding Action exports. No
document format, Plite, or codec break.

**Plite adoption:** None; existing mounted-root focus/DOM methods are
sufficient. Add regression proof only.

**Plate adoption:** Basic-styles plugin updates;
foreground/background registry controls; shared picker/grid primitives;
explicit toolbar JSX; kits/demos/docs.

**Downstream adoption:** apps/www registry sources and demos, apps/plite browser proof, component docs/examples, accessibility tests, 5,000-block fixture/benchmark, history/Yjs one-change regression. Codecs need no change because stored color properties remain identical.

**Deletion scope:** Delete `getEditorColorMarks`, default open-time
full-document text-node scan, 100 ms focus timer, raw string mutation calls, and
duplicated active/enabled state from both controls. Controlled/local recent
props replace implicit used-color derivation; `onCloseAutoFocus` replaces the
timer; typed plugin updates replace raw mutation. Delete/reject
`RecentColorStore`, subscriptions, `getDocumentColors`, Action props, and any
package-level palette/recent store.

**Focused unit proof:** Colors/recent merge/dedupe/order;
foreground/background isolation; successful record only; set/clear one
update/undo; read-only/disabled/active; no document selector call; controlled
callback semantics; focus callback; normalized color validation.

**Generated/property/fuzz laws:** Generate colors/recent streams with
duplicates, invalid values, large counts, foreground/background interleaving,
controlled-prop replacement, and selection changes. Assert stable first
occurrence/order, bounded recent count, no cross-control leak, no document read
or mutation on open, clear semantics, and one update on selection.

**Browser proof:** Mandatory for both controls: mouse and full keyboard grid navigation, Home/End if supported by accepted pattern, Enter/Space selection, Escape/click-away close, accessible names/roles/checked state, read-only, selection retention while popover owns focus, close focus to correct root, set/clear/undo, mobile/desktop layout, screen-reader snapshot, no console errors.

**Benchmark:** Mandatory. On a 5,000-block document, opening default foreground/background pickers invokes zero document-tree traversal and stays within the small static palette baseline. Record React render counts and host-computed document-color behavior separately; optional host composition cannot weaken the default claim.

**Failure modes:** (1) controlled/local recent updates cause selection/focus loss
and target a stale root; blast radius: all color edits; stop on multi-root
Browser failure and roll back the state binding. (2) default path still scans
through a helper; blast radius: large-document UI latency; stop on traversal
spy/benchmark and delete it. (3) recent values leak across
foreground/background/editors or grow unbounded; blast radius: product
state/privacy/memory; stop on isolation/bound failure and fix scoping. (4) an
update creates two undo steps or records a failed/read-only choice; blast
radius: history correctness; stop on apply/record proof. (5) ARIA grid
regression makes colors unreachable; blast radius: accessibility; stop UI
migration without restoring scan/timer.

**Exit condition:** Both controls use typed plugin updates and ordinary
colors/controlled recent props; all named scans/timer/raw dispatch/state
duplication and store/callback-reader abstractions are deleted; unit/generated/
browser/accessibility/performance proof passes; document/codec output is
unchanged.

**Hard deletion gate:** Packet cannot land with `getEditorColorMarks`, any
default document scan, the 100 ms focus timer, raw color update callback,
`RecentColorStore`, or `getDocumentColors` still reachable. Ordinary props and
framework focus replace those responsibilities in the same packet.

**Rollback answer:** Restore prior control rendering/state and direct transform
calls only as a short-lived revert; because the old scan/timer are known
defects, a rollback release must be followed by focused repair. Remove the new
props without data migration; stored colors are unchanged.

#### PRODUCT Packet 7 — Proof, adoption, deletion, and docs closure

**Concept IDs:** PRODUCT-027 and PRODUCT-028 are primary. Every accepted changed concept from PRODUCT-004, PRODUCT-011, PRODUCT-012, PRODUCT-019, PRODUCT-020, PRODUCT-022, PRODUCT-023, PRODUCT-025, and PRODUCT-026 must have a closure row; every keep/reject concept retains its reverse-evidence decision and owner.

**Decision owner:** Joint Plite Plan and Plate Plan for their owned laws; each feature/package owner signs its row; apps/plite/browser owner signs host proof; docs owner signs current-state documentation. Packet 7 cannot override a failed implementation gate.

**Execution skill:** `plite-plan --deep`, `plate-plan --deep`, `testing-review`, `docs-creator`, Browser verification, `autoreview`, and `autoclosure` only after all accepted implementation packets are applied.

**Final owner:** Proof stays with the behavior owner: Plite package tests for kernel law, Plate package tests for product law, apps/plite/browser for mounted-host law, codec package for serialization, history/Yjs package for integration, apps/www for registry visual/accessibility behavior, and docs/JSDoc for public use. No central product-proof package is created.

**Prerequisites:** Accepted Packets 1–6 are implemented or explicitly rejected/deferred with no source/docs claim. Their public/internal APIs, package names, document/codec policies, current owners, named deletions, proof commands, and browser routes are frozen. Every Wordgard candidate law has a provenance/reproduction decision.

**Dependent packets:** None. Packet 7 is terminal and blocks final plan `done`, release-quality claims, and stale-name/API deletion claims.

**Entry condition:** Each accepted packet supplies a closure manifest containing changed concept IDs, current owner, target owner, public break, adopted downstream owners, deleted responsibility, focused test command, browser route/matrix, benchmark claim if any, and rollback/data answer. A packet missing one field is not ready for closure.

**Exact implementation scope:** Reproduce and classify candidate Wordgard behavior rows; add only uncovered laws using native Plite/Plate fixtures; run focused source-first types/tests, generated/property laws, apps/plite/browser proof, codec/history/Yjs regressions, and targeted benchmarks; update package JSDoc and current-state Plite/Plate docs for accepted APIs only; update apps/www registry examples/install snippets/routes; remove stale action snippets, old structural-list names, deleted toolbar/color paths, temporary proof adapters/fixtures, and rejected experimental APIs; validate every source citation and ledger/packet field; record exact passes/failures/waivers with owners.

**Current shape:** Plite and Plate already have strong owner-local tests, apps/plite/browser proof, package docs, and registry examples, but coverage is distributed and the proposed packets have no completed cross-entry adoption/deletion ledger. Wordgard contributes command/schema tests, a concise install/editor README, and a diagnostic demo; its foreign fixture and declaration-failure shapes have not earned local ownership.

**Current Wordgard actual shape, lifecycle, owner, and evidence:** Wordgard's command corpus covers broad model behavior and schema bundle assembly (`../wordgard/test/test-commands.ts:130-863`, `../wordgard/test/webtest-commands.ts:27-35`, `../wordgard/test/schema.ts:8-174`, `../wordgard/test/test-schema.ts:7-76`). Its README supplies install and one browser-editor composition example (`../wordgard/README.md:1-24`); the mapped demo documents and executes a public declaration/runtime mismatch (`../wordgard/demo/demo.ts:1-50`). These are useful references, but the tests/diagnostic encode Wordgard's model and type failure rather than a broad adoption/proof surface.

**Current Plite actual shape, lifecycle, owner, and evidence:** Plite has command/extension/reconfiguration and React root-command contract suites (`packages/plite/test/extension-methods-contract.ts:314-470`, `packages/plite/test/extension-configuration.test.ts:1677-1819`, `packages/plite-react/test/use-plite-root-command-hooks.test.tsx:189-236`). Concepts/walkthroughs document commands, schema, selection/DOM, and rendering ownership (`content/docs/plite/concepts/06-commands.mdx:41-89`, `content/docs/plite/walkthroughs/05-executing-commands.mdx:87-231`, `content/docs/plite/concepts/19-schema.mdx:6-140`). Tests run at their owner and docs describe current substrate.

**Current Plate actual shape, lifecycle, owner, and evidence:** Feature proofs/docs are distributed across packages and registry. Current packages already own mature link/input/list/media/color behavior, but proposed feature-update/JSX/direction/rename/UI changes require cross-entry and downstream closure. Current feature-kit docs describe app composition (`content/docs/(guides)/feature-kits.mdx:1-51`).

**Target shape:** Every accepted law has one native proof owner and the minimum proof tier needed by the claim. Unit/property tests prove model/API law; codec tests prove supported round-trip; history/Yjs tests prove event/undo/collaboration invariants; Browser proves mounted DOM/focus/accessibility/navigation; benchmarks prove only stated performance claims. Docs/examples are executable current-state adoption truth. Temporary provenance/planning artifacts do not become runtime abstractions.

**Public TypeScript:** N/A; reason: Packet 7 introduces no public runtime API. Public snippets are exact uses of APIs accepted by Packets 1–6 and must typecheck. Representative simple/advanced/extension/host snippets appear in their owning docs, not a synthetic closure API.

**Internal TypeScript:** No central proof DSL. Native tests call package APIs directly. A temporary planning-only closure manifest may use a checked data shape in `docs/plans/artifacts/...`, but it is deleted or archived outside runtime/package exports after every row is resolved:

```ts
type ProductClosureRow = Readonly<{
  adoption: readonly string[];
  conceptIds: readonly string[];
  deletion: readonly string[];
  owner: string;
  proof: readonly string[];
  status: 'accepted' | 'deferred' | 'rejected';
}>;
```

If a reusable test helper is needed by three or more native tests, it lives in the owning test support module and replaces named duplicated fixture/setup code; otherwise inline it.

**Usage — simple:** A docs reader imports one action/plugin/package using a typechecked snippet and runs the matching standalone demo.

**Usage — advanced:** A host composes explicit JSX, multiple roots, direction
targets, controlled recent-color state, both list models, and a media upload
controller using accepted owner APIs.

**Usage — extension author:** Docs show defining/installing a product command handler, configuring targeted direction, exporting a headless action, and leaving UI placement to the host.

**Usage — host app:** Docs show non-React command dispatch, React mounted-root action binding, app-owned toolbar/palette/store, explicit codec policy, and independent flat/structural list choice.

**Compiled representation, invariants, reconfiguration, and runtime:** Packet 7 adds no compiled production representation. It verifies that accepted commands compile only into Plite pipelines, feature properties only into Plite schema through Plate compilation, toolbar/palette/recent state remain app data, and list package rename preserves compiled schema/document values. Invariants: one owner per law, one native proof row per distinct claim, no copied foreign fixture shape, reconfiguration tests for command/schema changes, one apply/undo/Yjs event, supported codecs round-trip, browser-only facts proven in browsers, no stale public names. Runtime proof exercises the real current editor and standalone demos.

**Public breaks:** None introduced by Packet 7. It documents and proves breaks owned by Packets 1–6, especially the structural-list package rename and any registry component prop change. If proof exposes an unplanned break, reopen the owning packet; do not normalize it in docs.

**Plite adoption:** Plite package tests/docs adopt only generic command/schema/reconfiguration laws actually touched or newly exposed by a reproduced gap. Plite React/DOM adopts mounted-root/browser proof. No product action/menu/direction policy moves into Plite.

**Plate adoption:** Each changed feature package gains focused tests/JSDoc;
Plate core gains inferred feature-update type proof only if Packet 1 changes an
owning generic; basic-styles gains direction/color proof; list-structural gains
renamed tests; link/media/history retain owner-specific regressions; registry
gains JSX/accessibility/visual proof.

**Downstream adoption:** Explicitly audit and record: Plite packages; Plite React/DOM; Plate core; every touched Plate plugin; static/client kits; registry source; apps/www standalone demos; apps/plite proof app importing apps/www examples; history; Yjs; HTML/Markdown/other touched codecs; docs; simple/advanced/extension/host examples; fixtures; unit/generated/property/fuzz tests; browser runners; targeted benchmarks; workspace/release/install metadata. A row marked unaffected states the exact reason and validating boundary.

**Deletion scope:** Delete temporary Wordgard-shaped fixtures after native reproduction, duplicate proof rows at the wrong owner, stale API snippets, old structural-list live names, deleted raw toolbar/color paths, rejected action/layout/scanner experiments, conditional Packet 4 instrumentation, and temporary closure manifest once incorporated into durable owner tests/docs. New native tests replace missing proof responsibilities; docs replace stale guidance; no runtime proof abstraction is added.

**Focused unit proof:** Re-run every packet's focused owner suite and source-first typecheck; action inference/identity/state/one apply; toolbar structure; direction schema/parser/reconfigure; list structural and flat behavior; color adapter; link safety; media placeholder; history; codec round-trip; Yjs event count; stale-name lexical checks; docs snippet/link/install resolution.

**Generated/property/fuzz laws:** Run accepted packet laws at their owner: command input/state/reconfiguration equivalence; toolbar tree IDs/order; direction targets/HTML attributes; structural-list pre/post rename document equivalence; palette/recent streams; link URL safety; media reservation identity. Seeds and minimized failures are recorded. N/A for prose-only docs fields because typechecked snippets/link/runnable demos are stronger than random text generation.

**Browser proof:** Mandatory for every changed visible/host behavior: pilot and adopted actions, explicit toolbar desktop/mobile/accessibility/focus, direction full browser matrix, both list-model demos after rename, color grid/focus/performance UI, link/media/history migrated callers. Use standalone `/blocks/[id]-demo` routes when available. If a surface truly has no runnable browser path, record the exact route absence and owner-approved N/A; source inspection alone cannot prove a browser claim.

**Benchmark:** Run only claimed benchmarks: feature-update adoption creates no
second registry; direction has no model/document scan; color open on 5,000
blocks has zero default traversal; toolbar subscriptions avoid whole-document
renders. Packet 5 rename and unchanged feature behavior have N/A performance
claims because algorithms must be identical; existing performance smoke may
still run.

**Failure modes:** (1) a copied Wordgard fixture passes while testing a different local law; blast radius: false architectural confidence; stop on owner/model mismatch and delete the row. (2) docs describe planned/rejected API or stale package name; blast radius: all adopters; stop release, revert docs, and reopen owning packet. (3) broad suites pass but required browser/codec/Yjs owner proof is absent; blast radius: host/data/collaboration correctness; stop closure and mark packet incomplete, never waive by inference. (4) generated test is flaky/unminimized; blast radius: CI trust; quarantine the seed only with owner record and do not count it as proof. (5) closure helper becomes runtime/public dependency; blast radius: new central ownership; stop and inline/move proof to actual owner.

**Exit condition:** All accepted packets satisfy their entry/exit/deletion gates; all owner-specific type/unit/generated/codec/history/Yjs/browser/benchmark proofs required by claims pass; apps/plite and apps/www runnable adoption is verified; docs/snippets/routes/install names match live source; stale/deleted names and temporary artifacts are gone; exact citations exist and line ends are within live EOF; unresolved rows are explicitly deferred/rejected, never implied complete.

**Hard deletion gate:** Final closure fails if any accepted new abstraction coexists with its named replaced caller/state/layout/package/focus/scan responsibility, if any compatibility alias survives Packet 5, if Packet 4 instrumentation remains, or if docs mention a deleted live API. Tests alone cannot waive deletion.

**Rollback answer:** Packet 7 itself is proof/docs and rolls back by reverting only incorrect tests/docs/helpers. A failed behavior packet rolls back through its own answer; Packet 7 must not weaken expectations to make it pass. Published structural-list or persisted direction breaks follow their release/data rollback policies, not a documentation workaround.

#### TABLE packet dossiers


##### TABLE-P1 — canonical fields, codecs, and grid compiler

- **Concept IDs:** TABLE-001–005, TABLE-013, TABLE-029. TABLE-002 is the private-module split; TABLE-004 is the cache/deletion gate.
- **Decision owner:** Plate Plan; Plite Plan verifies unchanged generic JSON, schema, snapshot, path, and transaction contracts.
- **Execution skill:** `plate-plan` → `architecture-cleanup`/`major-task` with `tdd` and `performance`.
- **Final owner:** `@platejs/table/internal/{grid,codec,context}` behind the existing public Plate plugin; Plite remains table-neutral.
- **Prerequisites:** Current Plite structural JSON, schema-property, immutable-snapshot, path/runtime-identity, and atomic-transaction contracts.
- **Dependent packets:** TABLE-P2, TABLE-P3, TABLE-P4, TABLE-P5.
- **Entry condition:** Inventory every `colSpan`, `rowSpan`, `attributes.colspan`, `attributes.rowspan`, `_cellIndices`, `adjacentTableCellLookup`, grid/merge-grid/index/selection-query consumer across packages, React, codecs, DOCX/HTML, AI inputs, docs, examples, fixtures, exports, tests, and downstream typed JSON.
- **Exact implementation scope:** Canonicalize persisted spans; keep one public plugin while splitting private grid/codec/context owners; compile one immutable grid/problem/context; adapt every read consumer; hard-delete old projections only after parity.
- **Current shape:** Wordgard: `tables(config)` fixes schema, correction, selection, paste/drop, and UI at extension construction (`../wordgard/src/table/table.ts:45-95`); nominal span marks live in schema (`../wordgard/src/types/schema.ts:134-218`); `WeakMap<Plot, MapData>` gives one GC-governed identity cache and `TableMap.get` wraps cached data with the current start (`../wordgard/src/table/tablemap.ts:22-43`; `../wordgard/src/table/tablemap.ts:44-168`; `../wordgard/src/table/tablemap.ts:163-168`; `../wordgard/src/table/tablemap.ts:176-233`). It is clean but class-identity-dependent, numeric/single-root, has no cache metrics or thresholds, and is unbenchmarked. Plite: structural schema/property contracts, immutable snapshots, paths, and atomic transactions are the correct generic substrate (`packages/plite/src/interfaces/schema.ts:92-179`; `packages/plite/src/interfaces/editor.ts:1623-1633`; `packages/plite/src/interfaces/editor.ts:1679-1695`); every independently scored table capability is boundedly absent. Plate: cell JSON has camel-case and HTML-shaped span spellings (`packages/utils/src/lib/plate-types.ts:88-125`; `packages/table/src/lib/BaseTablePlugin.ts:366-423`), while `_cellIndices`, adjacent lookup, grid, ID lookup, merge grid, selection queries, repair, and invalidation compete (`packages/table/src/lib/BaseTablePlugin.ts:118-211`; `packages/table/src/lib/BaseTablePlugin.ts:252-315`; `packages/table/src/lib/BaseTablePlugin.ts:425-613`; `packages/table/src/lib/BaseTablePlugin.ts:1368-1563`; `packages/table/src/lib/BaseTablePlugin.ts:1599-1631`; `packages/table/src/lib/BaseTablePlugin.ts:1685-1876`; `packages/table/src/lib/BaseTablePlugin.ts:4492-4547`).
- **Target shape:** Public JSON keeps only `TTableCellElement { colSpan?: number; rowSpan?: number }`; HTML codecs alone translate lowercase DOM attributes. Private `compileTableGrid(state: EditorState, tablePath: Path): TableGrid` returns immutable `anchors`, `slots`, `byId`, dimensions, and typed `problems`. Applications/extensions keep the Plate kit and commands; advanced/internal callers request one `TableContext` per immutable state/command; host codecs translate external HTML; Plite gains no public/table API. Every slot has one in-bounds anchor, reverse indexes are injective, diagnostics deterministic, and results snapshot-bound. Immutable table identity plus compiled configuration keys one `WeakMap<TableElement, TableGridData>`; metrics never retain keys and reconfiguration replaces compiler/cache. Cold compile is O(rows × columns), slot/ID/path reads O(1), and hot hits constant. Target `5/5/5/5/5/5/5/5=40`.
- **Public breaks:** Persisted/model `attributes.{colspan,rowspan}` disappear; HTML `rowspan`/`colspan` remain externally compatible through codecs.
- **Plite adoption:** No runtime API change; add canonical-field/schema/transaction round trips and prove generic snapshot/path/transaction behavior stays unchanged.
- **Plate adoption:** Schema, APIs, selectors, Base/React plugins, kits, registry/static renderers, table commands, and product codecs consume canonical fields and one grid/context.
- **Downstream adoption:** History/Yjs stable-ID and field round trips; DOM/HTML/DOCX/AI table codecs; apps/www and apps/plite; docs/examples/fixtures/tests; package exports and all downstream typed JSON callers.
- **Deletion scope:** Duplicate span aliases/normalizers; `CellIndices` option state; `_cellIndices`; `computeCellIndices`; `indexTableCells`; `adjacentTableCellLookup`; `findCellByIndexes`; old grid/merge-grid/selection-query projections; compatibility-only tests and stale docs/examples.
- **Focused unit proof:** Canonical JSON/HTML/type round trips; every typed problem; slot/ID/path queries; context guards; deterministic cold/hot compilation; differential old/new readers during migration.
- **Generated/property/fuzz laws:** Arbitrary valid/invalid span grids; one-anchor-per-slot, in-bounds rectangle, injective reverse-index, deterministic-diagnostic, and repair-input laws with replayable seeds/shrinks.
- **Browser proof:** Affected registry table demo verifies HTML import/export, rendering, selection, resize, and no console errors in Chromium; closure matrix only for release-quality cross-browser claims.
- **Benchmark:** Dense/sparse cold compile, hot hit, ID/path lookup, large-table locality, and retained-memory ceilings; caching ships only if it beats uncached compile without retention growth.
- **Exit condition:** One discoverable compiler/context owner serves every geometry read; canonical fields pass source-first package, history/Yjs, codec, registry, and browser proof.
- **Hard deletion gate:** Searches find zero deleted field/helper/projection reads or writes; old fields and projections leave in the same release chain; no dual persisted format or permanent bridge.
- **Rollback answer:** Before release, revert TABLE-P1 as one unit. After canonical JSON ships, move forward; never restore dual read/write. Failure modes: (1) a missed importer drops spans—blast radius persistence, HTML, DOCX, history, Yjs; stop on any round-trip difference. (2) a wrong slot/reverse index corrupts every command/selection—blast radius all table mutations; stop on any differential mismatch before deletion. (3) strong-key metrics/debug indexes defeat weak-cache lifetime—blast radius long-lived editors; stop on retained-memory breach and run the pure compiler uncached.

##### TABLE-P2 — correction and structural mutation planner

- **Concept IDs:** TABLE-006, TABLE-014–021.
- **Decision owner:** Plate Plan; Plite Plan protects the generic transaction/finalization boundary.
- **Execution skill:** `major-task` with `tdd`.
- **Final owner:** `@platejs/table/internal/mutation`, called by existing Plate commands; Plite remains transaction owner.
- **Prerequisites:** TABLE-P1 canonical fields, `TableGrid`, typed problems, and `TableContext`.
- **Dependent packets:** TABLE-P3, TABLE-P4, TABLE-P5.
- **Entry condition:** Existing correction/create/row/column/header/merge/split behavior is captured against the canonical grid; invalid-state policy and public command compatibility are accepted.
- **Exact implementation scope:** Pure correction and mutation planners emit stable operations plus final selection; one Plite transaction applies the complete plan; focused operations replace whole-table repair when benchmark-safe.
- **Current shape:** Wordgard: focused correction maps typed grid problems to changes (`../wordgard/src/table/correct.ts:10-68`); pure row/column/header/merge/split commands use `TableMap` (`../wordgard/src/table/tablecommands.ts:25-289`); creation uses schema defaults (`../wordgard/src/table/menu.ts:95-110`). Algorithms are readable but numeric/single-root, backed by only 5 correction and 33 command cases, include a live `userevent` typo (`../wordgard/src/table/tablecommands.ts:95-104`), and lack history/Yjs/browser proof. Plite: atomic transaction specs/finalization are generic (`packages/plite/src/interfaces/editor.ts:1679-1695`; `packages/plite/src/core/public-state.ts:4115-4168`); table policy is correctly absent. Plate: richer commands/options/sizing/React consumers exist, but correction clones whole tables and geometry/span arithmetic is distributed (`packages/table/src/lib/BaseTablePlugin.ts:1457-1563`; `packages/table/src/lib/BaseTablePlugin.ts:2091-2201`; `packages/table/src/lib/BaseTablePlugin.ts:4450-4660`; `packages/table/src/lib/BaseTablePlugin.ts:4928-5011`).
- **Target shape:** Private `TableMutationPlan = Readonly<{ operations: readonly TableOperation[]; selection?: TableCellSelection | Range }>` and `planTableMutation(context: TableContext, intent: TableIntent): TableMutationPlan | TableMutationDiagnostic` own correction/create/row/column/header/merge/split. Applications/extensions keep current commands; advanced product commands supply typed intents; internal correction uses the same planner; hosts never see raw operations. Plans read one snapshot-bound grid/context, use stable IDs/deterministic order, converge idempotently, schema-fit merge content, preserve split/create policy/sizing, and publish atomically. Reconfiguration recompiles schema keys before the next plan. Work scales with affected anchors/boundaries; a measured whole-table fallback stays private. Target `5/5/5/5/5/5/5/5=40`.
- **Public breaks:** Command names remain; invalid tables receive deterministic diagnostics/repair. Any future typed product-command break belongs to its own Plate packet.
- **Plite adoption:** No API/table-policy change; validate one atomic publication, final selection, root, history, and replay lifecycle for each Plate plan.
- **Plate adoption:** Base/React commands, correction, create/row/column/header/merge/split APIs, sizing, registry actions, and selection mapping consume one planner.
- **Downstream adoption:** Apps/www and apps/plite command examples; history undo/redo; Yjs replay; docs/examples/fixtures/tests; exports and all command callers.
- **Deletion scope:** Whole-table repair where focused plans win; repeated occupancy matrices; span arithmetic outside planner; separate creation loops; tests protecting only deleted internals.
- **Focused unit proof:** All 5 donor correction and 33 command cases as oracles; each intent/diagnostic; atomic failure; content/ID preservation; stable final selection; history undo/redo and Yjs replay.
- **Generated/property/fuzz laws:** Arbitrary valid/invalid spans; correction convergence/idempotence; insert/delete and merge/split inverse laws where defined; deterministic command-sequence fuzz with shrunk replay artifacts.
- **Browser proof:** Affected registry demo executes create/insert/delete/header/merge/split through pointer and keyboard paths in Chromium; closure matrix only for release-quality host claims.
- **Benchmark:** Sparse/dense affected-operation counts and latency against whole-table repair; focused path wins at the accepted threshold, otherwise the measured private fallback remains.
- **Exit condition:** Every structural command/correction reads one context, emits one plan, publishes atomically, and passes observable/history/Yjs proof.
- **Hard deletion gate:** Searches find no second geometry/span mutation algorithm or obsolete whole-table path beyond the explicitly measured private fallback.
- **Rollback answer:** Pre-release rollback is one planner/adopter unit; no dual command path survives. Failure modes: (1) correction cycles—blast radius malformed/imported tables; stop on the second non-idempotent pass and publish nothing. (2) relocation/delete loses content—blast radius selected/spanning neighbors; stop on content-multiset or ID-law failure. (3) merge/split/row/column restores the wrong selection/history root—blast radius undo/Yjs/multi-root editors; stop on replay mismatch before dependents.

##### TABLE-P3 — selection view and navigation adoption

- **Concept IDs:** TABLE-007–012. TABLE-007/TABLE-010 keep the structural codec/mapper; TABLE-008/TABLE-009/TABLE-011/TABLE-012 adopt the grid/view and delete duplicate geometry/caches.
- **Decision owner:** Plite Plan verifies generic selection; Plate Plan owns table selection/navigation policy.
- **Execution skill:** `plite-plan` proof audit → Plate `major-task` with `testing`.
- **Final owner:** `@platejs/table/internal/selection` plus the existing React adapter; Plite retains generic selection protocol/DOM mapping.
- **Prerequisites:** TABLE-P1 grid/context and TABLE-P2 stable mutation mapping.
- **Dependent packets:** TABLE-P4, TABLE-P5.
- **Entry condition:** Grid cell/path/ID queries and mutation mapping are stable; endpoint-union versus optional product closure semantics are explicitly decided and named.
- **Exact implementation scope:** Derive one snapshot/selection-scoped `TableSelectionView`; route construction, endpoint geometry, optional span closure, normalization, selectors, pointer/keyboard navigation, and React decoration through it; preserve public selection JSON/spec.
- **Current shape:** Wordgard: nominal `CellSelection` owns numeric anchor/head/ranges, bespoke JSON/map, normalization, navigation, DOM selection, decoration, and input handlers (`../wordgard/src/table/cellselection.ts:9-240`). `rectBetween` is one endpoint-cell rectangle union, never repeated closure over intersecting spans (`../wordgard/src/table/tablemap.ts:89-109`; `../wordgard/src/table/cellselection.ts:165-183`); exactly 30 cases cover it (`../wordgard/test/test-cellselection.ts:1-179`). Plite: structural selection kinds/codecs, root-aware mapping, and generic DOM mapping are strong (`packages/plite/src/interfaces/selection.ts:27-41`; `packages/plite/src/core/selection-protocol.ts:196-230`; `packages/plite/src/core/selection-protocol.ts:508-542`; `packages/plite/src/core/selection-protocol.ts:677-716`; `packages/plite-dom/src/plugin/dom-editor.ts:775-930`). Plate: structural `table-cell` correctly delegates codec/mapping to Plite (`packages/table/src/lib/BaseTablePlugin.ts:1989-2028`; `packages/table/src/lib/BaseTablePlugin.ts:5012-5048`), but rectangle/selected-query caches and navigation read overlapping geometry (`packages/table/src/lib/BaseTablePlugin.ts:425-613`; `packages/table/src/lib/BaseTablePlugin.ts:1685-2028`; `packages/table/src/react/TablePlugin.tsx:1-233`).
- **Target shape:** Preserve public `TableCellSelection = Range & Readonly<{ cells: readonly Range[]; kind: 'table-cell' }>`; private `readTableSelection(state: EditorState, tablePath: Path): TableSelectionView` returns immutable grid, ordered unique anchors, bounds, and current selection. Apps keep toolbar/editor selection APIs; extensions use Plate selectors/commands; advanced/internal callers read one view; React owns events/visuals but no geometry. Endpoint union and optional product span closure are separate named grid operations. The view is bound to one state+selection+grid identity; mapping stays in Plite; schema reconfiguration invalidates it. Enumeration is O(selected slots), cached projections O(1), with no mutable option cache. Target `5/5/5/5/5/5/5/5=40`.
- **Public breaks:** None to persisted selection; selectors leaking mutable option-cache identity become snapshot queries.
- **Plite adoption:** No product API; verify codec/validation/map/drop/nearest/root laws and generic DOM selection behavior remain unchanged.
- **Plate adoption:** Base selection spec/commands/selectors, navigation, React pointer/keyboard handling, decorations, and registry selected state consume one view.
- **Downstream adoption:** History/Yjs selection codecs; apps/www and apps/plite; DOM/React proof; fixtures/docs/examples and all table selection callers.
- **Deletion scope:** `selectionQueryCache`; selected ID/element/table/grid variants; duplicate merge-grid traversal; grid-independent span navigation; never delete Plite mapper or structural selection kind.
- **Focused unit proof:** All 30 donor cases as oracles; codec/validation/map/drop/nearest; endpoint union versus explicitly named closure; normalization, direction, edge cursor, adjacent-table, and stale-view cases.
- **Generated/property/fuzz laws:** Ordered/unique selected anchors; anchor/head reversal symmetry; version/root mapping; arbitrary span grids; generated selection/mutation sequences with replayable seeds.
- **Browser proof:** Pointer drag, arrows/tab/backspace, IME, DOM/model selection agreement, decoration/toolbar selected state, Chromium during iteration, and closure matrix for release-quality host claims.
- **Benchmark:** Selected-view cold/hot reads, O(selected slots) enumeration, large-table pointer/navigation latency, React selected-render locality, and retained-cache ceiling.
- **Exit condition:** Every table selection geometry read is grid/view-derived, generic Plite stays product-neutral, and DOM/model/history/Yjs agreement passes.
- **Hard deletion gate:** Searches find zero old cache/traversal/selectors and no duplicate rectangle implementation; all React/registry callers consume the view.
- **Rollback answer:** Keep browser-native policy in the React adapter; roll back TABLE-P3 without changing Plite or persisted selection. Failure modes: (1) endpoint union silently becomes recursive closure—blast radius merge/delete/copy selection; stop until product policy is explicit. (2) a stale view drives a destructive command—blast radius the selected table; stop on identity mismatch and use an uncached read. (3) codec/map drift breaks history/Yjs—blast radius persisted/collaborative selections; stop on any version/root replay failure.

##### TABLE-P4 — prepared table paste, drop, and clipboard

- **Concept IDs:** TABLE-022–027. TABLE-026 rejects Wordgard’s insert-then-clear move and gates same/cross-table/root adoption on proof.
- **Decision owner:** Plite Plan proves generic fitter/slice/history/Yjs/codec contracts; Plate Plan owns table classification/preparation/mutation.
- **Execution skill:** `plite-plan` proof audit → Plate `major-task` with `tdd` and browser proof.
- **Final owner:** `@platejs/table/internal/paste`; Plite fitter/slice/transaction/codec owners stay generic.
- **Prerequisites:** TABLE-P1 grid/IDs, TABLE-P2 planner, TABLE-P3 selection view, unchanged Plite slice/transaction contracts, `@platejs/csv` decoder ownership, and `@platejs/table` CSV/TSV export ownership.
- **Dependent packets:** TABLE-P5.
- **Entry condition:** Canonical source/target grids, mutation planner, stable cell IDs, and selection view are complete; format and move semantics are inventoried.
- **Exact implementation scope:** One pure table-node classifier; pure source repair/rectangularization/repeat/clip; pure target growth/boundary plan; one atomic mutation/final selection; owner-specific HTML/model/CSV decoders stay separate and only their decoded table nodes converge into the prepared type; CSV/TSV selection export stays in `@platejs/table`; same/cross-table/root move handles source/target identity before mutation.
- **Current shape:** Wordgard: one module classifies/fits content, repairs and rectangularizes source, repeats/clips, grows target, isolates all four span boundaries, stages insertion, and handles model slices (`../wordgard/src/table/tablepaste.ts:10-240`). Drop computes target insertion first, then creates a clear spec at original source positions; the handler does not adjust drop positions itself because `Transaction.merge` transforms the clear spec through insertion (`../wordgard/src/table/tablepaste.ts:242-264`; `../wordgard/src/state/transaction.ts:133-135`; `../wordgard/src/state/transaction.ts:375-395`). The FIXME concerns acquiring multi-cell drag selection. Exactly 13 paste cases exist (`../wordgard/test/test-table-paste.ts:1-124`). Plite: immutable `ContentSlice`, canonical fitting, atomic publication, and host codecs are generic (`packages/plite/src/core/content-slice.ts:27-176`; `packages/plite/src/interfaces/editor.ts:498-510`; `packages/plite/src/core/public-state.ts:2122-2190`; `packages/plite-dom/src/plugin/host-codec.ts:353-553`; `packages/plite-dom/src/plugin/dom-clipboard-runtime.ts:113-210`). Plate: `@platejs/csv` separately owns configurable plain-text CSV decoding to table AST (`packages/csv/src/lib/CsvPlugin.ts:28-46`; `packages/csv/src/lib/internal/deserializeCsv.ts:75-169`); `@platejs/table` owns CSV/TSV selection export (`packages/table/src/lib/BaseTablePlugin.ts:2532-2556`) and separately couples model-table detection, repair, source/target matrices, replacement, and final selection in its handler (`packages/table/src/lib/BaseTablePlugin.ts:1457-1563`; `packages/table/src/lib/BaseTablePlugin.ts:4660-4888`); React drag has broader source/drop lifecycle (`packages/plite-react/src/editable/clipboard-input-strategy.ts:654-728`).
- **Target shape:** Private `PreparedTablePaste = Readonly<{ grid: TableGrid; height: number; source: 'csv' | 'html' | 'model' | 'tsv'; width: number }>` and `prepareTablePaste(state: EditorState, slice: ContentSlice, options): PreparedTablePaste | TablePasteDiagnostic` normalize decoded table nodes before mutation. Plite transport stays generic; `CsvPlugin` remains CSV detector/decoder; `@platejs/table` remains CSV/TSV selection exporter and owns preparation/mutation. Apps keep copy/paste/drop; extension authors register format adapters with their existing owners; advanced callers may provide typed prepared sources through Plate; internal hosts apply one plan. Preparation is pure/detached/rectangular; boundary plans preserve one anchor per slot; source/target IDs are captured before same-table move; schema/codec reconfiguration invalidates preparation; one transaction owns final selection/history tags. Preparation is O(source slots), planning O(affected slots/boundaries), with focused apply and a measured private fallback. Target `5/5/5/5/5/5/5/5=40`.
- **Public breaks:** None in Plite; invalid Plate table fragments return a typed diagnostic and no legacy private insertion path remains.
- **Plite adoption:** No policy/API change; prove canonical fitter, `ContentSlice`, transaction, history/Yjs, and host-codec contracts for prepared table ingress.
- **Plate adoption:** `@platejs/csv` preserves parser options/API and feeds canonical table AST through generic transport; `@platejs/table` preserves CSV/TSV export while HTML/model/decoded-CSV table nodes, copy/cut/paste/drop, selection, Base handler, and React drag converge only at prepared table mutation.
- **Downstream adoption:** Apps/www/apps/plite CSV and table demos; CSV docs/examples; history undo/redo; concurrent Yjs replay; DOM codecs; fixtures/tests and downstream format callers.
- **Deletion scope:** Local/duplicate table fitters; source/target occupied matrices; whole-table paste special cases; table-mutation bypasses; insert-then-clear table move path; stale internal-only examples/tests. Never delete or absorb `CsvPlugin`, its parser/API/options, or table CSV/TSV export.
- **Focused unit proof:** Classifier/fitter cases; all 13 donor paste cases; `CsvPlugin` parser/API and deserializer suites (`packages/csv/src/lib/CsvPlugin.spec.ts:25-81`; `packages/csv/src/lib/deserializer/utils/deserializeCsv.spec.ts:25-227`); table CSV/TSV export (`packages/table/src/lib/BaseTablePlugin.clipboard.spec.tsx:280-322`); every diagnostic; same/cross-table/root/self-overlap move; atomic selection and sanitization.
- **Generated/property/fuzz laws:** Rectangularization/repeat/clip/growth; four-boundary arbitrary-span isolation; format round trips; generated move identities; undo/redo and concurrent Yjs replay with shrunk artifacts.
- **Browser proof:** Native Chromium clipboard and drag/drop prove CSV plain-text decoding, HTML/internal-model precedence, CSV/TSV export, same-table and cross-table moves; closure browser matrix for release claims.
- **Benchmark:** Large source/target preparation, focused versus whole-table apply, affected-slot locality, memory ceiling, and no second decode/fit pass.
- **Exit condition:** Every table ingress yields one prepared source and one mutation plan; format/move/history/Yjs/browser claims pass with no partial publication.
- **Hard deletion gate:** Searches find zero alternate table fitter, source/target matrix, bypass, or insert-then-clear move path.
- **Rollback answer:** Pure preparation permits pre-publication failure; roll back TABLE-P4 before release and never restore a dual paste route. Failure modes: (1) misclassification drops structure—blast radius pasted customer data; stop before publication. (2) same-table insertion shifts source and clearing erases target—blast radius moved cells; stop on ID overlap/order ambiguity and disable move. (3) boundary planning leaves overlapping spans—blast radius target table; reject on any post-plan problem. (4) codec precedence bypasses sanitization—blast radius security/import; stop release and retain the current codec route.

##### TABLE-P5 — product UI, sizing, accessibility, performance, and release closure

- **Concept IDs:** TABLE-028, TABLE-030, TABLE-031 plus every UI/codec consumer changed by TABLE-P1–P4.
- **Decision owner:** Plate Plan; Plite Plan owns only generic React/browser/law claim verification.
- **Execution skill:** `plate-ui`, `testing`, `performance`, and `task`.
- **Final owner:** `@platejs/table`, Plate registry/apps/www, and apps/plite proof; no product UI enters Plite.
- **Prerequisites:** TABLE-P1–P4 behavior, adoption, and hard-deletion gates closed.
- **Dependent packets:** None; this is release closure.
- **Entry condition:** Canonical model/grid/planner/selection/paste APIs are stable; registry/downstream inventory, performance thresholds, and supported browser matrix are accepted.
- **Exact implementation scope:** Route sizing/presentation geometry through the grid; update kits/registry/static renderers/docs/examples/fixtures/exports; close accessibility, browser, generated-law, history/Yjs, and performance proof; produce changeset/release evidence without locally generating CI-owned registry output.
- **Current shape:** Wordgard: imperative menu/dimension picker/theme is bundled with the table extension (`../wordgard/src/table/menu.ts:15-254`; `../wordgard/src/table/table.ts:9-42`); screen-reader behavior is explicitly untested (`../wordgard/src/table/menu.ts:15`); rich sizing/border/background/margin and benchmark contracts are absent. Plite: generic React host/browser/law infrastructure is correctly product-neutral (`packages/plite-react/src/components/plite.tsx:153-216`; `apps/plite/package.json:7-17`; `packages/plite/test/document-change-laws.test.ts:455-799`). Plate: rich sizing/presentation/React lifecycle (`packages/table/src/lib/BaseTablePlugin.ts:955-1367`; `packages/table/src/lib/BaseTablePlugin.ts:2030-2217`; `packages/table/src/react/TablePlugin.tsx:1-233`), kits/UI (`apps/www/src/registry/components/editor/plugins/table-base-kit.tsx:1-20`; `apps/www/src/registry/components/editor/plugins/table-kit.tsx:1-22`; `apps/www/src/registry/ui/table-toolbar-button.tsx:1-102`), exactly 19 package specs plus one type contract, browser donor proof, and a perf script (`packages/table/src/lib/BaseTablePlugin.grid.spec.tsx:1-450`; `packages/table/type-tests/table-plugin-contracts.ts:1-35`; `apps/plite/tests/plite-browser/donor/examples/tables.test.ts:1-534`; `apps/www/scripts/run-table-perf.mts:1-349`).
- **Target shape:** Applications keep `BaseTablePlugin.configure({ options: { initialTableWidth, minColumnWidth } })`, the Plate table kit, and product commands; advanced apps configure sizing/border/background/margin; extensions consume Plate APIs; internal host/render code reads immutable `TableRenderModel = Readonly<{ grid: TableGrid; selection: TableSelectionView; columnWidths: readonly number[]; rowHeights: readonly number[] }>` and never owns geometry. React consumes immutable projections, resize writes through the planner, roles/labels/focus remain stable, configuration rebuilds product projections without changing Plite, and UI failures cannot corrupt editor state. Render locality is unchanged or better, cache bounded, and geometry singular. Target `5/5/5/5/5/5/5/5=40`.
- **Public breaks:** Only canonical field/type breaks from TABLE-P1; command/UI names stay unless separately accepted. Generated registry output remains CI-owned.
- **Plite adoption:** Generic React host/browser/law infrastructure remains unchanged; prove only generic claims exercised by Plate.
- **Plate adoption:** Base/React plugins, sizing/presentation APIs, kits, registry UI/static nodes/toolbars, and product commands consume canonical projections.
- **Downstream adoption:** Apps/www examples, apps/plite route, docs, changeset, exports, fixtures, DOCX/HTML/AI callers, history/Yjs/codec proof, and downstream applications.
- **Deletion scope:** Old UI/sizing geometry reads; stale field docs/examples/fixtures; tests protecting removed helpers; obsolete manual registry artifacts; retain current product breadth.
- **Focused unit proof:** Exactly 19 package specs plus the type contract; sizing/border/background/margin; resize writes; presentation projections; error isolation and source-first typechecks.
- **Generated/property/fuzz laws:** Inherited grid/mutation/paste laws plus generated resize/size-vector bounds and configuration-rebuild invariants.
- **Browser proof:** Standalone registry demo verifies roles, labels, focus, keyboard/pointer/IME, resize, copy/paste/drop, rendering, and console; Chromium during iteration and full closure matrix before release-quality claims.
- **Benchmark:** Existing table perf owner measures hot/cold grid, render locality, selection/resize latency, large tables, and retained memory against accepted thresholds.
- **Exit condition:** Final registry route proves product breadth; accessibility/browser/history/Yjs/codec/type/performance gates are green; CI remains sole registry generator.
- **Hard deletion gate:** Searches find no old fields, caches, geometry, ingress, or UI sizing readers; generated registry output was not manually edited.
- **Rollback answer:** UI adapters can revert before canonical model release; after release, move forward and never restore deleted fields/caches. Failure modes: (1) canonical geometry changes resize/border pixels—blast radius every rendered table; stop on screenshot/size drift. (2) focus/ARIA regression blocks controls—blast radius keyboard/screen-reader users; stop release on any role/label/focus failure. (3) source/generated registry divergence breaks docs/apps—stop and fix source without manual generated edits. (4) hot-path gains retain snapshots—blast radius long sessions; stop on memory-ceiling breach.

<!-- BEGIN META NO-EXECUTION DOSSIERS -->

#### META no-execution adoption dossiers

##### No-execution adoption dossier — META-003 generated proof distributions

- **Current donor/Plite/Plate shapes:** Wordgard owns unseeded schema-constrained documents and nine edit classes (`../wordgard/test/generate.ts:49-184`). Plite already owns seeded change, slice, fit, associativity, transform, and malformed-input laws (`packages/plite/test/document-change-laws.test.ts:455-799`; `packages/plite/test/content-slice-laws.test.ts:81-197`; `packages/plite/test/slice-fit-laws.test.ts:300-609`). Plate owns concrete table/grid/navigation behavior tests (`packages/table/src/lib/BaseTablePlugin.grid.spec.tsx:1-450`; `packages/table/src/react/TablePlugin.navigation.spec.tsx:1-741`).
- **Proposed shape, owner, and lifecycle:** A donor distribution is translated only after it exposes a named gap in an accepted TABLE-P2 or TABLE-P4 invariant; the affected Plite law or Plate feature-test owner keeps the seeded/shrunk case for that packet’s proof lifecycle.
- **Routing and no-standalone-packet reason:** `tdd` runs inside the accepted feature packet. META-003 is an oracle-adoption dossier, not a packet alias, because it owns no runtime, package, or independent release surface.
- **Adoption and deletion:** Adopt the minimal distribution and failing case into current runners. Import no donor generator, unseeded loop, or donor schema model; delete no current proof.
- **Focused/generated/browser/benchmark applicability:** Focused proof reproduces the exact missing invariant; generated proof requires deterministic seed, shrink, replay artifact, and law oracle. Browser proof applies only when the accepted invariant is browser-observable. Benchmark proof applies only when the distribution carries an explicit locality or performance claim.
- **Hard gate and reversal evidence:** No adoption without a current invariant and a failing deterministic seed. Reversal evidence: reject the distribution when it cannot shrink and replay in the owning runner or when existing mutation-tested coverage catches the same failure.

##### No-execution adoption dossier — META-004 browser behavior rows

- **Current donor/Plite/Plate shapes:** Wordgard owns a custom server/headless browser harness (`../wordgard/bin/run-tests.js:1-31`; `../wordgard/bin/run-testserver.ts:1-5`; `../wordgard/bin/test-headless.ts:1-54`; `../wordgard/bin/testserver.ts:1-62`). Plite owns the Chromium, smoke, project, and closure-matrix lanes (`apps/plite/package.json:7-17`; `apps/plite/playwright.config.ts:1-121`; `package.json:42-47`). Plate table behavior already feeds that proof owner through browser and React integration cases (`apps/plite/tests/plite-browser/donor/examples/tables.test.ts:1-534`; `packages/table/src/react/TablePlugin.navigation.spec.tsx:1-741`).
- **Proposed shape, owner, and lifecycle:** Harvest only a missing observable behavior row into the existing Plite browser owner and affected Plate package; the row enters, proves, and retires with its feature packet and closure claim.
- **Routing and no-standalone-packet reason:** `testing` runs inside the affected feature packet. META-004 is an oracle-adoption dossier, not a packet alias, because the current harness already scores `40/40` and needs no code, package, or independent execution packet.
- **Adoption and deletion:** Adopt only the observable case and expected result. Delete no current harness; import no donor server, test server, or headless plumbing.
- **Focused/generated/browser/benchmark applicability:** Focused Chromium proves the accepted row; the closure matrix applies only to release-quality cross-browser claims. Generated proof applies only when the behavior is sequence-driven and has a seeded model. Benchmark proof applies only when the row makes an explicit latency or locality claim.
- **Hard gate and reversal evidence:** Reject any row that lacks a current behavior gap or cannot run in the current proof owner. Reversal evidence: import donor harness machinery only if a named observable behavior is impossible to express in `apps/plite` or the closure matrix and the donor route reproduces it.

##### No-execution adoption dossier — META-006 bounded codemod policy

- **Current donor/Plite/Plate shapes:** Wordgard owns an arbitrary repository-wide regex writer (`../wordgard/bin/mass-change.ts:5-22`). The bounded root and Plite script surfaces expose owner-scoped lint, typecheck, build, and proof commands but no equivalent global writer (`package.json:30-50`; `packages/plite/package.json:56-63`); the bounded table-package scripts are likewise scoped (`packages/table/package.json:31-40`).
- **Proposed shape, owner, and lifecycle:** No codemod exists now. A future accepted migration may create one private syntax-aware codemod under its repository/package owner, run an explicit dry-run and bounded adoption, then delete it at the same packet gate.
- **Routing and no-standalone-packet reason:** The owning Plite Plan or Plate Plan packet routes the migration. META-006 is a policy dossier, not a packet alias, because no concrete migration, AST scope, or executable change is accepted here.
- **Adoption and deletion:** Adopt no Wordgard code. A future migration may adopt the safety contract; delete its temporary codemod after the bounded rewrite and delete no unrelated current tooling.
- **Focused/generated/browser/benchmark applicability:** Focused fixture and dry-run diffs, syntax parsing, target-list checks, idempotence, and post-rewrite type/lint/test gates are mandatory. Generated proof may expand syntax fixtures when the transform has combinatorial forms. Browser proof applies only if rewritten behavior is browser-visible. Benchmark proof is not applicable unless the migration changes a measured hot path.
- **Hard gate and reversal evidence:** No writes without exact target and AST scope, dry-run review, idempotence, and rollback as one owning migration. Reversal evidence: permit a regex rewrite only when bounded fixtures prove syntax-equivalent matching and the same dry-run, target-list, idempotence, and deletion gates still pass.

<!-- END META NO-EXECUTION DOSSIERS -->

### PV-01 — Per-root DOM lifecycle and integrity owner

Changed concepts: VIEW-001 and VIEW-004.

Current Wordgard shape: `Wordgard` is the package owner and lifecycle object. It constructs root/content/live-region elements, connects input/observer/plugins/Tile, dispatches model state immediately, and schedules DOM flush (`../wordgard/src/editor/editor.ts:108-235`). `DOMObserver` translates native mutations and selection/scroll/resize into dirty sections (`../wordgard/src/editor/domobserver.ts:8-244`). Strength: one legible imperative owner. Limits: one root, custom renderer, implicit scheduler boundaries, global host assumptions.

Current Plite shape: `@platejs/plite-dom` owns extension activation/rollback/commit hooks (`packages/plite-dom/src/plugin/with-dom.ts:109-224`). `@platejs/plite-react` owns the actual imperative mounted runtime and constructs scheduler, observer, input, repair, mutation ownership, and root cells (`packages/plite-react/src/editable/editable-dom-runtime.ts:212-380`). The observer has excellent evidence/ownership/repair semantics (`packages/plite-react/src/editable/dom-integrity-observer.ts:1-270`) but the generic lifecycle is split across packages.

Current Plate shape: Plate core is a consumer, not a lifecycle owner; it builds `<Editable>` plus product effects/slots (`packages/core/src/react/components/PlateContent.tsx:92-185`). The bounded absence audit found no Plate scheduler/observer/runtime declaration.

Proposed private architecture:

```ts
// Private records/functions; not package exports.
type DOMRootRuntime = {
  readonly root: RootKey;
  readonly element: HTMLElement;
  readonly generation: number;
  readonly scheduler: DOMPhaseScheduler;
  readonly mapping: DOMMapping;
  readonly selection: DOMSelectionController;
  readonly input: DOMInputRuntime;
  beginHostCommit(): void;
  endHostCommit(): void;
  replaceElement(element: HTMLElement): void;
  destroy(): void;
};

function mountDOMRoot(
  editor: Editor,
  options: DOMRootRuntimeOptions
): DOMRootRuntime;
```

Application and extension usage stays `<Editable>`/`<PlateContent>` plus the
existing public DOM scheduler and intent APIs. Plite React's private host
adapter mounts the record, injects test scheduler/realm/diagnostic sinks, and
calls `beginHostCommit`/`endHostCommit` around binding publication. No
application receives lifecycle mutation access. The private compiled
representation is
`WeakMap<Editor, Map<RootKey, DOMRootRuntimeRecord>>`.

Invariants: one active record per editor/root; generation invalidates old work; destroy is idempotent; observer sees no host-owned mutation until `endHostCommit`; repair runs only through scheduler; root replacement cleans old mappings/listeners before activating new ones. Reconfiguration replaces the record transactionally and rolls back to the old record on activation failure. Runtime remains O(1) per lifecycle transition plus existing mutation work. Target score is `5/5/5/5/5/5/5/5 = 100` because this preserves current semantics/proof while repairing package ownership and local coherence.

| Packet field | Concrete value |
|---|---|
| concept IDs | VIEW-001, VIEW-004 |
| decision owner | Plite Plan |
| execution skill | `plite-plan` |
| final owner | `@platejs/plite-dom`; `@platejs/plite-react` owns only the React host adapter |
| prerequisites | Existing VIEW-003 scheduler and VIEW-005 mapping contracts green |
| dependent packets | PV-02, PV-03, PV-07 |
| entry condition | Focused lifecycle/observer tests pass unchanged; all runtime constructor and root-ref callers are enumerated |
| exact implementation scope | Move pure root record, observer policy, repair scheduling, mutation ownership, cleanup/generation logic from `packages/plite-react/src/editable/editable-dom-runtime.ts:212-380` and `packages/plite-react/src/editable/dom-integrity-observer.ts:1-542` behind the Plite DOM runtime; keep React hooks/event translation in Plite React |
| current shape | DOM extension lifecycle in Plite DOM; mounted imperative owner and observer in Plite React |
| target shape | One private root-runtime record in Plite DOM plus a thin private React commit/binding adapter |
| public breaks | None; internal owner move only |
| Plite adoption | Plite DOM installs/destroys per-root records; Plite React runtime delegates lifecycle, observer, repair, and scheduling |
| Plate adoption | None: Plate continues rendering `PlateContent`; reason: no Plate lifecycle API exists |
| downstream adoption | `apps/plite` fixtures keep `<Editable>`; no history, Yjs, codec, docs, kit, or registry API changes |
| deletion scope | Delete React-owned generic root cleanup, observer construction, duplicate mutation-owner wiring, and any parallel root-generation state after delegation |
| focused unit proof | `packages/plite-react/test/editable-dom-runtime-contract.test.tsx:1-848`; `packages/plite-react/test/dom-integrity-observer-contract.test.ts:1-433`; scheduler root cleanup |
| generated/property/fuzz laws | Random mount/replace/destroy/commit/mutation sequences: one active root record, no callback after generation change, idempotent cleanup |
| browser proof | Applicable: `apps/plite/tests/plite-browser/donor/examples/dom-integrity.test.ts:1-96`; focused shadow/multi-root root replacement and selection preservation |
| benchmark | N/A: lifecycle transitions are not a throughput hot path; forced-layout/render budgets must remain unchanged |
| exit condition | All current lifecycle/observer behavior passes with zero generic observer construction in Plite React |
| hard deletion gate | `rg` proves the deleted React lifecycle/observer responsibilities have one Plite DOM owner; root replacement/destroy proof passes |
| rollback answer | Meaningful: revert the owner move as one packet before PV-02/PV-03; no persisted data or public API migration exists |

Routing: prerequisite Plite packets none; dependent Plite packets PV-02/PV-03/PV-06/PV-07; dependent Plate packets PT-01/PT-02 indirectly through PV-03. React/DOM adoption is mandatory; history/collaboration/Yjs/codecs are unaffected because commits, selections, values, and payloads do not change. Docs only update internal ownership notes. Existing fixtures remain and gain root replacement cases.

Failure modes:

1. Old-root tasks run after replacement, corrupting selection in the new root. Blast radius: every multi-root/iframe editor. Stop on any generation-mismatch callback; rollback PV-01.
2. React commit mutations are misclassified as external and reversed. Blast radius: all rendered edits. Stop on one repair during a known React commit; rollback observer delegation.
3. Cleanup runs twice and removes the active root's listeners/scheduler. Blast radius: editor becomes inert after reconfiguration. Stop on listener/scheduler count divergence; rollback the lifecycle record move.

### PV-02 — Private per-root DOM host facts

Changed concept: VIEW-013.

Current Wordgard shape: the editor package reads global navigator/document once and exposes UA/version booleans (`../wordgard/src/editor/browser.ts:1-27`). Lifecycle is process/import scoped. Strength: cheap branches. Limits: false for iframe/multiple windows, uninjectable, version-driven.

Current Plite shape: `@platejs/plite-dom` exports import-time `IS_IOS`, `IS_APPLE`, `IS_ANDROID`, `IS_FIREFOX`, `IS_WEBKIT`, `IS_CHROME`, UC/WeChat, `CAN_USE_DOM`, and global beforeinput support; only Apple detection accepts a navigator (`packages/plite-dom/src/utils/environment.ts:1-69`). Plite React consumes those globals in selection/composition/placeholder paths (`packages/plite-react/src/editable/composition-state.ts:1-49`, `packages/plite-react/src/components/plite-placeholder.tsx:1-54`) and bypasses them with direct navigator reads for void layout, Android commit repair, Firefox selection replay, and Korean iOS backspace (`packages/plite-react/src/components/plite-void-shell.tsx:7-23`, `packages/plite-react/src/plugin/with-react.ts:122-130`, `packages/plite-react/src/editable/root-interaction-dom-selection-replay.ts:132-135`, `packages/plite-react/src/editable/keyboard-input-strategy.ts:488-496`).

Current Plate shape: Plate owns no independent resolver, but it does consume process-global platform facts: `createHotkey` branches on `IS_APPLE`, and mark-boundary affinity branches on `IS_FIREFOX` (`packages/core/src/lib/utils/hotkeys.ts:1-1`, `packages/core/src/lib/utils/hotkeys.ts:57-73`, `packages/core/src/lib/plugins/affinity/queries/getMarkBoundaryAffinity.ts:4-4`, `packages/core/src/lib/plugins/affinity/queries/getMarkBoundaryAffinity.ts:56-61`). Those branches need mounted-root truth, not a new public capability API.

Proposed internal architecture:

```ts
// Private to the mounted DOM runtime.
type DOMRootQuirk =
  | 'android-beforeinput-delete-is-uncancelable'
  | 'compositionend-precedes-final-input'
  | 'shadow-selection-needs-composed-range'
  | 'webkit-contextmenu-focus';

type ResolvedDOMRootFacts = Readonly<{
  platform: 'apple' | 'android' | 'other';
  engine: 'blink' | 'gecko' | 'webkit' | 'unknown';
  language: string;
  beforeInput: boolean;
  quirks: ReadonlySet<DOMRootQuirk>;
}>;

function resolveDOMRootFacts(
  root: Document | ShadowRoot,
  testOverrides?: Partial<ResolvedDOMRootFacts>
): ResolvedDOMRootFacts;
```

Simple and advanced application usage is unchanged: there is no capability
object to query. Tests inject private mount facts; Plite React and the two
Plate consumers receive only the specific fact needed through internal
event/root adapters. The private representation is cached per mounted realm
and replaced with the root generation. Extension authors keep using product
APIs such as hotkeys and affinity, never browser facts. This fixes ownership
without exporting an attractive nuisance.

| Packet field | Concrete value |
|---|---|
| concept IDs | VIEW-013 |
| decision owner | Plite Plan |
| execution skill | `plite-plan` |
| final owner | Private mounted-root runtime in `@platejs/plite-dom`; private React/Plate adapters |
| prerequisites | PV-01 root runtime exists |
| dependent packets | PV-03, PV-07 |
| entry condition | Every import of current environment flags and every direct navigator/userAgent/language read in Plite React or Plate core is classified as SSR invariant, root capability, or dead |
| exact implementation scope | Add a private resolver to the mounted DOM runtime; migrate Plite DOM/React selection, composition, input, placeholder, void layout, Android commit repair, Firefox replay, language, hotkey, and beforeinput consumers; feed only the required private facts to Plate hotkey and mark-affinity branches |
| current shape | Process-global constants in `packages/plite-dom/src/utils/environment.ts:1-69`; direct Plite React navigator reads; Plate core `IS_APPLE`/`IS_FIREFOX` consumers |
| target shape | Frozen private per-root facts with injectable test overrides and no public capability profile |
| public breaks | Remove browser-specific `IS_*` exports that are not true SSR invariants; publish no replacement capability API |
| Plite adoption | All DOM/input/selection/React consumers, including four direct navigator reads, resolve internally from the mounted root; tests inject private platform/engine/language facts |
| Plate adoption | `createHotkey` and `getMarkBoundaryAffinity` receive the one required fact through private editor/event context; their public product APIs do not change |
| downstream adoption | Applications using leaked flags move the behavior to the owning Plite/Plate API or keep an app-local platform decision; no app receives root facts |
| deletion scope | Delete authoritative import-time UA constants, direct global navigator reads, and Plate core process-global flag imports after callers reach zero; retain only narrowly named proven SSR invariants |
| focused unit proof | `packages/plite-dom/test/environment.ts:1-98`; `packages/core/src/lib/plugins/affinity/queries/getMarkBoundaryAffinity.spec.ts:1-130`; root replacement, hotkey, void-layout, replay, and language-profile tests |
| generated/property/fuzz laws | Random root/private-fact/override combinations are frozen, cached per realm, isolated across realms, and reset on replacement |
| browser proof | Applicable: iframe + shadow-root realm truth, Safari composition quirk, Android beforeinput behavior, Chromium baseline |
| benchmark | N/A: one cached private resolution per mount; assert no per-event UA parsing |
| exit condition | Zero runtime behavior in Plite React or Plate core reads process-global browser/language facts; cross-realm and Plate product tests pass |
| hard deletion gate | `rg` shows zero imports of deleted flags, zero direct navigator/userAgent/language reads outside the private resolver, and no exported capability/profile type or API; two-window tests observe distinct facts |
| rollback answer | Meaningful: restore old constants, direct reads, and Plate consumer imports as one packet; no stored data changes |

Adoption audit: Plite DOM/React and Plate core hotkey/affinity consumers are affected. Plite model, history, collaboration, Yjs, codecs, Plate plugin declarations/kits/registry, and application data are unaffected because capability truth is host-only and their public product contracts do not change. `apps/plite` gains iframe/shadow/profile fixtures. Exports and environment docs change intentionally.

Failure modes:

1. A root resolves facts from the parent window. Blast radius: iframe input/selection. Stop on two-window identity failure; rollback PV-02.
2. Server import evaluates DOM APIs. Blast radius: all SSR builds. Stop on no-navigator import contract failure; rollback resolver initialization.
3. Mounted-root facts change mid-composition without epoch cancellation. Blast radius: IME duplicate/lost input. Stop on root-replacement IME trace divergence; rollback and require PV-03 generation integration.
4. Plate hotkeys or Firefox mark affinity read facts from the wrong root. Blast radius: shortcuts and boundary marks in iframe/multi-window editors. Stop on Plate root matrix failure; rollback the Plate consumer migration with PV-02.

### PV-03 — Renderer-neutral input runtime and composition epoch

Changed concepts: VIEW-008, VIEW-009, VIEW-010.

Current Wordgard shape: the editor package compiles handler/observer facets and owns `InputState`, mouse/drag/clipboard/focus/composition, target ranges, beforeinput and input handlers (`../wordgard/src/editor/input.ts:17-225`, `../wordgard/src/editor/input.ts:230-842`). It directly maps native formatting/alignment to product commands (`../wordgard/src/editor/input.ts:545-571`). Tile preserves composition DOM (`../wordgard/src/editor/tile.ts:859-897`). Strength: one understandable owner. Limits: untyped product leakage, one root, incomplete Android/widget proof.

Current Plite shape: Plite React owns typed event families/owners/commands (`packages/plite-react/src/editable/editing-kernel.ts:48-186`), decision preparation (`packages/plite-react/src/editable/editing-kernel.ts:1174-1326`), composition event hooks (`packages/plite-react/src/editable/runtime-composition-events.ts:18-179`), and pending final-input publication (`packages/plite-react/src/editable/runtime-before-input-events.ts:242-290`). Semantics and proof are strong, but generic law is React-owned and product commands remain in the kernel.

Current Plate shape: Plate core owns product command middleware and input rules (`packages/core/src/lib/plugins/input-rules/internal/InputRulesPlugin.ts:137-278`) plus product shortcut routes (`packages/core/src/internal/plugin/resolvePlugins.ts:791-1000`). It compensates for missing generic host-command intent by depending on Plite's current command variants/callback.

Proposed private architecture:

```ts
// All three types remain implementation details.
type DOMInputIntent =
  | { kind: 'insert-text'; text: string; inputType: string }
  | { kind: 'insert-break'; variant: 'line' | 'block' }
  | { kind: 'delete'; direction: 'backward' | 'forward'; unit: 'character' | 'word' | 'line' }
  | { kind: 'history'; direction: 'undo' | 'redo' }
  | { kind: 'move-selection'; axis: 'character' | 'word' | 'line' | 'block'; extend: boolean }
  | { kind: 'host-command'; inputType: string };

type DOMInputDecision = Readonly<{
  owner: 'native' | 'model' | 'app' | 'defer';
  intent: DOMInputIntent;
  selection: SelectionPolicy;
  repair: RepairPolicy;
}>;

type CompositionEpoch = Readonly<{
  id: number;
  root: RootKey;
  generation: number;
  phase: 'native-composing' | 'model-composing' | 'final-input-ready' | 'committing' | 'repairing';
  anchor: Anchor<Selection> | null;
  owner: 'native' | 'model' | 'app';
  settledInputType: string | null;
}>;
```

Applications do nothing and receive no generic intent hook. Standard editing
maps private intents to canonical editor commands. Plate feature packages map
formatting and shortcuts to their inferred plugin updates or to an existing
command when interception/preview is a real requirement. React normalizes
events and delegates to the private runtime. One event-frame stack and one
optional composition epoch exist per root; an active epoch keeps its starting
revision. Runtime classification remains O(1) per event with no extra render.

Invariants: one owner per event; one final composition commit; one history unit; selection import/export policy is explicit; root generation mismatch cancels epoch; host-command never mutates model without an app handler. Target scores VIEW-008/009 at `100` and VIEW-010 at `97.5`; IME keeps an ownership-DX deduction because browser event diversity remains intrinsically complex.

| Packet field | Concrete value |
|---|---|
| concept IDs | VIEW-008, VIEW-009, VIEW-010 |
| decision owner | Plite Plan → Plate Plan |
| execution skill | `plite-plan` for PV-03; `plate-plan` for PT-01/PT-02 adoption |
| final owner | `@platejs/plite-dom` pure runtime/epoch; `@platejs/plite-react` event adapter; `@platejs/core` product mapping |
| prerequisites | PV-01 and PV-02 |
| dependent packets | PT-01, PT-02, PV-07 |
| entry condition | Current kernel/input/composition traces are captured; every command/input-rule callback caller is enumerated |
| exact implementation scope | Move pure event frame, ownership, intent classification, selection/repair decisions, and composition epoch to Plite DOM; adapt React hooks; introduce `host-command`; preserve current Android/repair adapters |
| current shape | Strong but fragmented React-owned kernel with product command variants |
| target shape | Private renderer-neutral root input runtime plus explicit composition epoch and ordinary Plate plugin updates/commands |
| public breaks | Product `format`, `set-block`, `toggle-mark` command variants and product `Hotkeys` predicates are removed only after PT-01; input-rule callback is removed after PT-02 |
| Plite adoption | Private DOM runtime owns decisions/epoch; React adapter delegates; canonical text/break/delete/history commands remain |
| Plate adoption | PT-01 maps product shortcuts to plugin updates or justified commands; PT-02 confirms input-rule middleware sees one text command |
| downstream adoption | No generic intent API migration; Plate plugins keep their product APIs; apps/plite traces update; history/Yjs consume unchanged commits |
| deletion scope | Delete React-owned duplicate decision types/state after move. Temporary private owner: a Plite React legacy product-command adapter; reason: PT-01/PT-02 must adopt first; dependent packets: PT-01/PT-02; removal gate: both exact-once product proof suites pass |
| focused unit proof | `packages/plite-react/test/editing-kernel-contract.ts:1-1184`; `packages/plite-react/test/composition-state-contract.test.ts:1-2003`; Android/input/repair contracts |
| generated/property/fuzz laws | Generate event-order permutations across composition/beforeinput/input/selectionchange/commit/repair/blur/destroy; assert one owner, one command, one history unit |
| browser proof | Applicable: `packages/browser/test/core/playwright-ime.test.ts:1-548`; shadow, async decorations, DOM coverage, Android-capable lane |
| benchmark | Applicable: event-trace overhead and huge-document typing latency must not regress; raw device timing only with device artifacts |
| exit condition | Pure kernel has no React imports; all trace rows match or intentionally improve; PT-01/PT-02 ready to remove temporary adapter |
| hard deletion gate | PT-01 and PT-02 pass, then `rg` proves no product command/default hotkey/input-rule callback remains in Plite input runtime and no intent/decision/epoch type is exported |
| rollback answer | Meaningful: revert PT-02, PT-01, then PV-03 in reverse order; composition/root data are ephemeral, so no persisted migration |

Adoption audit: Plite DOM/React, Plate core plugins, apps/plite, tests, exports, docs, and direct advanced handlers are affected. Plate kits/registry adopt only through existing plugin shortcuts/rules. History and Yjs are proof consumers: command/history/collab payloads must remain identical. Codecs are unaffected. Fixtures gain normalized event frames.

Failure modes:

1. Final composition event commits twice through tombstone and callback paths. Blast radius: all IME text/history. Stop on command count >1 or two history entries; rollback PT-02/PV-03.
2. A private host-command decision has no Plate feature route. Blast radius: formatting shortcuts/beforeinput silently stop. Stop on any product matrix gap; rollback PT-01 then PV-03.
3. Selection imports stale DOM before a model-owned command. Blast radius: edits land at wrong range. Stop on selection trace mismatch; rollback kernel move.
4. Android mutation ownership is lost during extraction. Blast radius: Android typing/deletion. Stop on Android contract or device artifact failure; rollback PV-03.

### PV-04 — Delete preview-only type-name classification

Changed concept: VIEW-017. VIEW-016 remains a keep constraint: React owns
rendering and no imperative renderer or second render plan is introduced.

Current Wordgard shape: the editor package's Tile tree is both compiled render
representation and DOM mapping owner; subclasses classify actual rendered
structure (`../wordgard/src/editor/tile.ts:13-193`,
`../wordgard/src/editor/tile.ts:673-1187`). That does not justify importing its
renderer architecture.

Current Plite shape: Plite React renders by runtime ID through typed render
props and memoized groups (`packages/plite-react/src/components/editable-text-blocks.tsx:547-713`,
`packages/plite-react/src/components/editable-text-blocks.tsx:960-1063`).
`classifySegmentKind` guesses table/list/void-like labels from type strings
(`packages/plite-react/src/dom-strategy/classify-segment-kind.ts:3-65`), but
the bounded caller audit shows the result only decorates preview output as
`data-plite-dom-strategy-kind` in
`packages/plite-react/src/dom-strategy/segment-placeholder.tsx:211-231` and
`packages/plite-react/src/dom-strategy/segment-placeholder.tsx:285-318`. It
does not choose materialization, coverage, grouping, or editor behavior.

Current Plate shape: Plate core owns schema/plugin render facts and wrappers
(`packages/core/src/react/plugin/PlatePlugin.ts:362-410`). No source-backed
consumer needs those facts compiled into a second render plan.

Target architecture: delete the semantic preview classifier and its data
attribute. If a preview test proves a marker is operationally required, keep
one neutral private marker such as `data-plite-dom-strategy-segment`; it must
not claim table/list/void semantics. Rendering, segment planning, coverage,
virtualization, and Plate plugin compilation remain unchanged. There is no new
public call site, configuration object, compiler, or advanced-caller migration.

| Packet field | Concrete value |
|---|---|
| concept IDs | VIEW-017; VIEW-016 is a no-change constraint |
| decision owner | Plite Plan |
| execution skill | `plite-plan` |
| final owner | Preview placeholder implementation in `@platejs/plite-react` |
| prerequisites | Current segment preview contract captured |
| dependent packets | PV-07 |
| entry condition | Every `classifySegmentKind` call and `data-plite-dom-strategy-kind` assertion is enumerated |
| exact implementation scope | Delete the regex classifier and semantic preview attribute; use a neutral private marker only if an exact preview consumer requires one |
| current shape | Correct runtime-ID renderer plus a preview-only type-name label |
| target shape | Current renderer with no fake structural oracle |
| public breaks | None |
| Plite adoption | Preview placeholder and its focused tests only |
| Plate adoption | None |
| downstream adoption | No app, plugin, kit, history, Yjs, codec, schema, or `domStrategy` caller migration |
| deletion scope | Delete `TABLE_TYPE_PATTERN`, `LIST_TYPE_PATTERN`, `VOID_LIKE_TYPE_PATTERN`, `matchesType`, `classifySegmentKind`, and the semantic preview attribute |
| focused unit proof | Segment placeholder markup and accessibility contracts |
| generated/property/fuzz laws | Misleading and renamed node types produce identical render/coverage behavior |
| browser proof | Focused staged-placeholder preview; table/list/void editing behavior remains unchanged |
| benchmark | Assert no additional scan or render wake; no new huge-document target |
| exit condition | Preview remains operable and no runtime path infers structural meaning from type-name text |
| hard deletion gate | Classifier file, regex constants, callers, and semantic data-attribute assertions are absent; no replacement compiler/policy is exported |
| rollback answer | Meaningful: restore the preview label only if an exact consumer is proven; never introduce a render-plan abstraction as rollback |

Adoption audit: only the private Plite React preview placeholder and its tests
are affected. Plate core/plugins/kits/registry, apps, Plite model/coverage/
virtualization, history, Yjs, collaboration, codecs, docs, and external callers
have no API or behavior migration.

Failure modes:

1. A test or diagnostic consumer depends on the semantic attribute. Blast
   radius: preview diagnostics only. Stop, identify the exact consumer, and
   replace the value with a neutral private marker.
2. Removing the classifier changes actual rendering, coverage, or selection.
   Blast radius: staged content. Stop immediately: that would disprove the
   bounded caller audit and require a new source-backed packet.
3. A replacement structural compiler appears during implementation. Blast
   radius: public API and render architecture. Reject the packet; the accepted
   outcome is deletion, not relocation.

### PV-05 — Private projection owner cleanup

Changed concept: VIEW-019. VIEW-018 and VIEW-020 are audited keeps with no execution.

Current Wordgard shape: `Decoration`, `PointSet`, `RangeSet`, wrappers, heaps/walkers, and changed-range comparison form one class-heavy editor-package compiler (`../wordgard/src/editor/decoration.ts:10-106`, `../wordgard/src/editor/decoration.ts:567-1079`, `../wordgard/src/editor/decoration.ts:1197-1389`). Strength: one locally named compiled renderer input. Limits: numeric positions, imperative widget DOM, and one view.

Current Plite shape: the public API intentionally separates local `Editable.decorate`, provider decoration sources, projected-entry reads, annotation identity, and widget UI (`packages/plite-react/src/index.ts:59-66`, `packages/plite-react/src/index.ts:140-161`, `packages/plite-react/src/index.ts:188-192`, `packages/plite-react/src/index.ts:225-240`). Raw constructors are already private and explicitly blocked by the surface contract (`packages/plite-react/src/internal/index.ts:1-1`, `packages/plite-react/test/surface-contract.tsx:937-959`). The real cleanup is private: the full-control type `PliteProjectionStore` (`packages/plite-react/src/projection-store.ts:138-159`) collides in name with the narrower public reader (`packages/plite-react/src/hooks/use-plite-projection-entries.tsx:13-27`), and `projection-store.ts` declares a duplicate `PliteProjectionEntry` alias (`packages/plite-react/src/projection-store.ts:39-46`).

Current Plate shape: Plate passes `decorate` through `PlateContent` and consumes Plite sources/widgets without owning compilation (`packages/core/src/react/components/PlateContent.tsx:19-26`, `packages/core/src/react/components/PlateContent.tsx:107-122`, `packages/floating/src/hooks/useFloatingToolbar.ts:20-193`). No Plate migration is justified.

Proposed private shape:

```ts
type CompiledProjectionStore<T = unknown> = {
  destroy(): void;
  getMetrics(): PliteProjectionStoreMetrics;
  getSnapshot(): PliteProjectionStoreSnapshot<T>;
  refresh(
    options?: PliteProjectionStoreRefreshOptions
  ): PliteProjectionRefreshResult;
  retry(): PliteProjectionRefreshResult;
};
```

Simple, advanced, extension-author, and host usage are unchanged because this type is private. `createPliteProjectionStore` keeps the same behavior and returns the renamed private compiled type; the canonical public `PliteProjectionEntry` remains in `use-plite-projection-entries.tsx`. Internal representation, invariants, reconfiguration, fault isolation, retry, keyed subscriptions, metrics, and runtime complexity are unchanged. The packet only removes a private name collision and duplicate alias.

| Packet field | Concrete value |
|---|---|
| concept IDs | VIEW-019 |
| decision owner | Plite Plan |
| execution skill | `plite-plan` |
| final owner | `@platejs/plite-react` private projection compiler |
| prerequisites | Current public-surface, projection, annotation, widget, mapped-store, and fault-boundary contracts green |
| dependent packets | PV-07 records the deletion/type gates; no runtime packet depends on PV-05 |
| entry condition | Enumerate every private import of the full-control `PliteProjectionStore`; snapshot root and `./internal` exports; confirm the duplicate entry alias has no distinct consumer |
| exact implementation scope | Rename only the private full-control store type in `packages/plite-react/src/projection-store.ts:138-159`, update private projection/decoration/annotation/widget/test imports, and delete the duplicate alias at `packages/plite-react/src/projection-store.ts:46-46` |
| current shape | Private full-control store and public read-only store share `PliteProjectionStore`; a second private `PliteProjectionEntry` aliases `PliteProjectionSlice` |
| target shape | Private `CompiledProjectionStore`; one canonical public `PliteProjectionStore` reader and one canonical public `PliteProjectionEntry` definition |
| public breaks | None; root exports, `./internal`, props, hooks, types, runtime values, and Plate adapters stay unchanged |
| Plite adoption | Private projection/decoration/annotation/widget implementation and tests update type imports only; no public caller migration |
| Plate adoption | None; reason: Plate consumes `decorate`/widgets and no renamed private type |
| downstream adoption | None for Yjs, collaboration, history, codecs, kits, registry, apps, docs, examples, fixtures, or external consumers; all remain on current public hooks/types |
| deletion scope | Delete the old private full-store type name and duplicate private entry alias only; retain constructors, mapped/fault kernels, metrics, dirtiness, scope, refresh types, readers, and every public export |
| focused unit proof | `packages/plite-react/test/surface-contract.tsx:937-959`; projection/selection, annotation, widget, mapped-store, fault-boundary contracts; Plite React typecheck and public-package smoke |
| generated/property/fuzz laws | N/A: type/name-only cleanup changes no executable law; existing projection/annotation/widget property suites must pass unchanged |
| browser proof | N/A: no runtime, DOM, React, Plate, or browser-facing code changes; any browser diff is a stop condition |
| benchmark | N/A: emitted runtime must be unchanged; build-output diff must contain no executable change |
| exit condition | Public export snapshots are unchanged, all private type references use `CompiledProjectionStore`, one canonical public entry definition remains, and every current contract passes |
| hard deletion gate | `projection-store.ts` has no private declaration named `PliteProjectionStore` or `PliteProjectionEntry`; root/`./internal` exports are byte-for-byte unchanged; constructors remain absent from public-surface proof |
| rollback answer | Meaningful: revert the private rename/alias deletion as one packet on any export, type, emitted-runtime, or contract drift; no data/state migration exists |

Adoption audit: only private Plite React projection/decoration/annotation/widget implementation and tests are affected. Plate core/plugins/kits/registry, apps/www, apps/plite, Yjs/collaboration, history, codecs, public docs/examples/fixtures, external consumers, root exports, and `./internal` are explicitly unaffected.

Failure modes:

1. The rename accidentally changes or removes the public read-only `PliteProjectionStore`. Blast radius: all typed projection readers and downstream builds. Stop on surface/public-package smoke drift; rollback PV-05.
2. Deleting the duplicate alias leaves an internal import pointing at the wrong entry shape. Blast radius: projection/annotation/widget type safety. Stop on Plite React typecheck or contract failure; rollback PV-05.
3. A mechanical edit touches constructor logic or emitted exports. Blast radius: overlay invalidation, fault isolation, or external API. Stop on executable build diff, browser diff, or export snapshot change; rollback PV-05.

### PV-06 — No-execution DOM geometry API review

Changed concept: VIEW-007.

Current Wordgard shape: the editor package exposes `coordsAtPos`, scroll/scale helpers, vertical movement and line boundaries over Tile DOM (`../wordgard/src/editor/coords.ts:7-62`, `../wordgard/src/editor/selection.ts:39-148`, `../wordgard/src/editor/dom.ts:90-209`). Strength: small navigable surface. Limits: single-root numeric positions, recursive scans, global DOM assumptions.

Current Plite shape: `@platejs/plite-dom` exposes mapping/rect/scroll methods directly on `DOMApi` (`packages/plite-dom/src/plugin/dom-editor.ts:107-170`) while geometry algorithms and Plite React caret/content-root/coverage adapters are distributed. Caret movement respects inline/void/model boundaries (`packages/plite-react/src/editable/caret-engine.ts:640-742`). Behavior and proof are stronger; navigation is worse.

Current Plate shape: Plate floating UI is a consumer of selection geometry and recomputes on editor version (`packages/floating/src/hooks/useFloatingToolbar.ts:20-84`, `packages/floating/src/hooks/useFloatingToolbar.ts:165-193`). Plate has no generic geometry implementation.

Best-API decision: keep the current flat intent methods on `editor.api.dom`.
They are already discoverable at the domain boundary and match their callers.
A `geometry` namespace would move names without deleting responsibility,
improve no real call site, and force broad migration. Specialized caret and
coverage adapters remain private. There is no implementation packet.

| Packet field | Concrete value |
|---|---|
| concept IDs | VIEW-007 |
| decision owner | Plite Plan |
| execution skill | None; accepted no-execution outcome |
| final owner | Existing flat `@platejs/plite-dom` API; private React caret/coverage adapters |
| prerequisites | None |
| dependent packets | None |
| entry condition | Completed source audit of the public methods and representative Plite/Plate callers |
| exact implementation scope | None |
| current shape | Correct algorithms across DOM API and multiple private React adapters |
| target shape | Current flat intent methods unchanged |
| public breaks | None |
| Plite adoption | None |
| Plate adoption | None |
| downstream adoption | None |
| deletion scope | None; explicitly reject a grouped facade and forwarding wrappers |
| focused unit proof | Existing `packages/plite-dom/test/dom-geometry.test.ts:1-312` and caller evidence support the keep decision |
| generated/property/fuzz laws | Existing geometry laws remain owner-local |
| browser proof | No new proof; existing selection/floating proof remains authoritative |
| benchmark | No new benchmark; no runtime change |
| exit condition | Canonical map and docs record the keep decision with no execution dependency |
| hard deletion gate | N/A; implementation must not add a geometry namespace or migrate callers |
| rollback answer | N/A: no code or data changes |

Adoption audit: none. Plite DOM/React, Plate floating, registry/apps, history,
Yjs, collaboration, codecs, docs, tests, and exports remain unchanged.

### PV-07 — Proof and deletion-gate closure

Changed concept: VIEW-028; gates VIEW-001, VIEW-004, VIEW-007-010, VIEW-013-020, VIEW-023-024.

Current Wordgard shape: direct editor tests cover lifecycle, composition, DOM resolution, content, coordinates, one command, and serialization; composition has unresolved widget/Enter/Android notes (`../wordgard/test/webtest-composition.ts:17-181`). There is no editor benchmark/generated/fuzz file.

Current Plite shape: package tests and `packages/browser` already provide contracts, artifact handling, release proof, scenarios, native traces, IME, selection, and browser helpers. Core proof and release contracts are executable (`packages/browser/test/core/proof.test.ts:1-258`, `packages/browser/test/core/release-proof.test.ts:1-219`). `apps/plite` includes generated editing and broad browser examples.

Current Plate shape: product behavior is proven in the same browser app, including Markdown shortcuts (`apps/plite/tests/plite-browser/donor/examples/markdown-shortcuts.test.ts:1-521`), placeholder (`apps/plite/tests/plite-browser/donor/examples/placeholder.test.ts:1-345`), and hovering toolbar (`apps/plite/tests/plite-browser/donor/examples/hovering-toolbar.test.ts:1-255`).

Proposed architecture: no new runtime abstraction. Extend the existing proof manifest so each changed concept declares focused unit, generated/property/fuzz, browser, benchmark, release, and deletion-gate evidence. Simple use is the existing focused package/browser commands. Advanced/release use reads a machine-checkable packet evidence record. Extension authors add product rows to apps/plite; host internals attach native traces/artifacts. The compiled representation is a proof record keyed by packet/concept with command, artifact, and deletion assertions. It changes only when packet scope changes; runtime cost is zero.

| Packet field | Concrete value |
|---|---|
| concept IDs | VIEW-028 plus every changed VIEW row |
| decision owner | Plite Plan |
| execution skill | `plite-plan` with Plate-owned proof rows supplied by `plate-plan` |
| final owner | `packages/browser`, package tests, `apps/plite` |
| prerequisites | Executable PV-01 through PV-05 and PT-01 through PT-03 implemented; PV-06 recorded as no execution |
| dependent packets | Release/closure only |
| entry condition | Every prior packet has focused proof and named deletion candidates |
| exact implementation scope | Add missing private-root-fact, event-order, preview-classifier deletion, overlay, and a11y/placeholder cases; retain existing geometry proof; wire proof records to release/deletion checks; replace API tests only for actually deleted exports |
| current shape | Strong proof spread across package/browser files; packet deletion evidence is manual |
| target shape | Existing proof infrastructure plus concept-keyed evidence and executable deletion assertions |
| public breaks | None |
| Plite adoption | Package tests and browser contracts declare concept/packet evidence |
| Plate adoption | Product shortcut/input-rule/a11y/placeholder rows attach to the same packet record |
| downstream adoption | apps/plite fixtures and CI proof commands; apps/www only if an affected example is the owning fixture; docs link commands/artifacts |
| deletion scope | Delete obsolete tests that import removed environment flags or private projection/classifier names only after replacement behavior tests exist; geometry API tests remain because the API remains |
| focused unit proof | Every packet-specific unit command listed in its dossier |
| generated/property/fuzz laws | Root lifecycle sequences, private realm-fact overrides, IME orders, misleading preview type names, and overlay invalidation; existing geometry laws remain unchanged |
| browser proof | Applicable: Chromium focused rows for each changed behavior; shadow/iframe/multi-root/IME; full matrix only for closure/release claim |
| benchmark | Mixed applicability: preview cleanup asserts no added scan/render wake; PV-06 adds no benchmark because it changes no code; PV-05 and root-fact cleanup have no new hot-loop claim |
| exit condition | All packet proof records pass, artifacts resolve, deletion assertions pass, full `pnpm check:plite` succeeds |
| hard deletion gate | Zero deleted API/helper/classifier imports; every deletion has a replacement concept and passing proof record |
| rollback answer | Meaningful: proof is not rolled back to make source pass; rollback the failing source packet. Revert only a demonstrably flaky proof after replacing it with stronger deterministic evidence |

Adoption audit: Plite packages, Plite DOM/React, Plate core/plugins, affected kits/registry, apps/www owners, apps/plite, history/Yjs proof where event/history/collab claims apply, codecs where paste claims apply, docs/examples/fixtures/tests/benchmarks/exports and downstream callers are all explicitly covered by their packet. Unaffected owners remain absent with packet-specific reasons.

Failure modes:

1. Proof record points to a test that never runs. Blast radius: false release confidence. Stop on package-script/attachment audit failure; fix PV-07, never waive.
2. Browser viewport is mislabeled real-device proof. Blast radius: false Android/iOS claim. Stop without Appium artifacts; remove claim.
3. Deletion assertion matches only public imports while private duplicate owner remains. Blast radius: architectural cleanup incomplete. Stop on bounded source audit; keep packet open.

### PT-01 — One Plate shortcut dispatcher and product host-command adoption

Changed concepts: VIEW-009 and VIEW-014.

Current Wordgard shape: `KeyBinding` is compiled/cached once with platform/scope/order/AltGraph fallback, then dispatches default product commands (`../wordgard/src/editor/keymap.ts:44-118`, `../wordgard/src/editor/keymap.ts:240-365`). Input maps formatting directly (`../wordgard/src/editor/input.ts:545-571`). Strength: one dispatcher. Limits: defaults and product policy in editor substrate; thin direct proof.

Current Plite shape: Plite DOM's `Hotkeys` mixes generic movement/editing with product bold/italic (`packages/plite-dom/src/utils/hotkeys.ts:15-117`), and Plite React returns product format commands (`packages/plite-react/src/editable/editing-kernel.ts:913-1028`).

Current Plate shape: Plate core compiles namespaced shortcut route validation and priority (`packages/core/src/internal/plugin/resolvePlugins.ts:791-921`) but `EditorHotkeysEffect` maps one `useHotkeys` effect per resolved entry (`packages/core/src/react/components/EditorHotkeysEffect.tsx:11-93`). Plugin declarations are correctly Plate-owned (`packages/core/src/react/plugin/PlatePlugin.ts:577-590`).

Proposed architecture:

```ts
type CompiledShortcut = Readonly<{
  id: string;
  match: CompiledHotkeyMatcher;
  scope: 'editable' | 'editor' | string;
  priority: number;
  pluginIndex: number;
  declarationIndex: number;
  run(ctx: PlateShortcutContext): boolean | void;
}>;

function compilePlateShortcuts(
  runtime: PlateRuntime
): readonly CompiledShortcut[];
```

Simple extension use remains
`shortcuts: { bold: { keys: 'mod+b', target: 'api' } }`. Advanced extensions
set scope/priority/custom handler. Plate installs one keydown dispatcher and
routes each compiled entry to its owning plugin update/API, or to a Plite
command only when that route needs command semantics. Any host-command
classification stays private to the input runtime. The compiled table is
frozen per Plate model revision and replaced atomically on reconfiguration.

| Packet field | Concrete value |
|---|---|
| concept IDs | VIEW-009, VIEW-014 |
| decision owner | Plate Plan |
| execution skill | `plate-plan` |
| final owner | `@platejs/core`; matcher remains `@platejs/plite-dom` |
| prerequisites | PV-02 private root facts and PV-03 private input decisions |
| dependent packets | PV-07 |
| entry condition | Resolved shortcut order/conflict/current handler behavior captured; all Plite product hotkey/command callers enumerated |
| exact implementation scope | Compile one shortcut table in Plate runtime; replace effect-per-shortcut mounting; install one root dispatcher; map product shortcuts to owning plugin updates/APIs or justified commands; migrate direct Plite product consumers |
| current shape | Typed Plate compilation plus per-entry effects; product defaults duplicated in Plite |
| target shape | One revisioned Plate dispatcher over the generic matcher and private input decisions |
| public breaks | Remove public Plite product `Hotkeys.isBold/isItalic` and product command variants; Plate shortcut declaration shape remains |
| Plite adoption | Kernel retains private host decisions plus generic matcher/navigation/editing laws |
| Plate adoption | Core runtime, plugin API routes, kits/registry shortcuts, apps/www examples |
| downstream adoption | Direct Plite product shortcut users install explicit app/plugin routes; apps/plite proof updates; docs state one root dispatcher |
| deletion scope | Delete `HotkeyEffect`, per-shortcut `useHotkeys` fanout, Plite bold/italic predicates and format/set-block/toggle-mark product variants after migration |
| focused unit proof | `packages/plite-dom/test/hotkeys.ts:1-339`; `packages/core/src/internal/plugin/resolvePlugins.spec.tsx:1-1219`; effect/listener count |
| generated/property/fuzz laws | Random shortcut conflicts/scopes/priorities/plugin orders yield deterministic compiled order and at most one handled feature route |
| browser proof | Applicable: Markdown shortcuts, formatting keys, preventDefault, AltGraph/international layout, dynamic reconfiguration, multi-root focus |
| benchmark | Applicable: listener count exactly one per root; dispatch overhead no worse than current sorted table for 1k shortcuts |
| exit condition | One root listener, route parity, private host-decision product behavior green, direct Plite product imports zero |
| hard deletion gate | `EditorHotkeysEffect` fanout and Plite product predicates/command variants are deleted; all Plate/product callers use compiled dispatcher |
| rollback answer | Meaningful: revert PT-01 and restore PV-03 private legacy adapter; no persisted state |

Adoption audit: Plate core/plugin API, affected plugins/kits/registry/apps/www, apps/plite, docs/examples/fixtures/tests/exports and direct callers are affected. Plite history/Yjs/collab/codecs are unaffected; only command origin changes, and command/history effects must match.

Failure modes:

1. Compiled ordering changes winner for conflicting shortcuts. Blast radius: all overlapping plugin keys. Stop on deterministic order diff; rollback PT-01.
2. Dispatcher prevents default when handler returns false. Blast radius: browser/native shortcuts. Stop on preventDefault contract failure; rollback listener.
3. Dynamic plugin revision leaves stale table. Blast radius: disabled/reconfigured plugins still execute. Stop on revision test; rollback compiler cache.

### PT-02 — Canonical input-rule command bridge

Changed concepts: VIEW-010 and VIEW-015.

Current Wordgard shape: appended transactions scan text around the changed block and apply the first matching rule (`../wordgard/src/editor/inputrule.ts:173-213`). Composition and input live in the same editor package (`../wordgard/src/editor/input.ts:468-543`, `../wordgard/src/editor/input.ts:694-798`).

Current Plite shape: beforeinput and pending composition final input receive an `ApplyInputRules` callback (`packages/plite-react/src/editable/runtime-before-input-events.ts:57-67`, `packages/plite-react/src/editable/runtime-before-input-events.ts:242-290`, `packages/plite-react/src/editable/runtime-before-input-events.ts:920-970`), while the root currently supplies `useCallback(() => false)` (`packages/plite-react/src/editable/runtime-root-engine.ts:180-216`).

Current Plate shape: Plate's input-rule owner is already strong: typed contexts/builders/indexes (`packages/core/src/lib/plugins/input-rules/types.ts:14-180`, `packages/core/src/lib/plugins/input-rules/types.ts:289-342`), compiled priority (`packages/core/src/internal/plugin/resolvePlugins.ts:924-1000`), and canonical command middleware (`packages/core/src/lib/plugins/input-rules/internal/InputRulesPlugin.ts:137-278`).

Proposed architecture: no new public rule API. Every model-owned insert-text/insert-break/insert-data intent dispatches the canonical editor command exactly once. Plate's existing `around(editorCommands.*)` middleware remains the only rule application owner. Simple extension usage remains current `inputRules: ({ rule }) => [...]`; advanced usage retains resolve/enabled/priority/continuation. Host internals lower the settled composition epoch into one canonical command. Compiled representation remains current `ResolvedInputRulesMeta`; reconfiguration remains Plate model revision. Runtime removes a callback branch and should be cheaper.

| Packet field | Concrete value |
|---|---|
| concept IDs | VIEW-010, VIEW-015 |
| decision owner | Plite Plan → Plate Plan |
| execution skill | `plite-plan → plate-plan` |
| final owner | Canonical command dispatch in Plite; input-rule declaration/compilation/middleware in `@platejs/core` |
| prerequisites | PV-03 composition epoch |
| dependent packets | PV-07 |
| entry condition | All current callback call sites and canonical command paths traced; input-rule/IME undo baseline captured |
| exact implementation scope | Route normal and settled-composition text/break/data through canonical editor commands; verify one Plate middleware pass; remove callback type/props/root false callback |
| current shape | Dead/parallel callback path beside the real Plate command middleware |
| target shape | One command path and one Plate rule owner |
| public breaks | Remove internal/publicly exported `ApplyInputRules` callback surface if exported; Plate input-rule API unchanged |
| Plite adoption | Beforeinput/composition/input runtimes dispatch canonical commands once |
| Plate adoption | Existing `InputRulesPlugin` remains; no plugin declaration migration |
| downstream adoption | Markdown/rich-text apps only update proof; history/Yjs verify one commit/undo/collab operation; codecs unchanged |
| deletion scope | Delete `ApplyInputRules` type, runtime props/calls, `runtime-root-engine.ts` false callback, and callback-specific tests after command proof |
| focused unit proof | `packages/core/src/react/utils/inputRules.spec.tsx:1-670`; Plite beforeinput/composition contracts; exactly-one middleware spy |
| generated/property/fuzz laws | Event/rule/continuation permutations produce at most one rule application and one continuation; selection/transaction atomicity holds |
| browser proof | Applicable: Markdown shortcuts + IME + undo/redo + paste/input-data cases |
| benchmark | N/A: removes a branch; assert no extra commits/renders |
| exit condition | Every model-owned input dispatches one command; Plate rules run once; callback symbol imports zero |
| hard deletion gate | Repository search finds no `ApplyInputRules` or false root callback; IME+undo+Markdown proof passes |
| rollback answer | Meaningful: revert PT-02 only; PV-03 private adapter remains until PT-02 gate, then is removed |

Adoption audit: Plite React input runtime, Plate core rules, apps/plite/browser proof, history/Yjs proof, tests and exports are affected. Plate plugin/kit/registry declarations, codecs, docs examples, and downstream API usage are otherwise unchanged.

Failure modes:

1. Both native and settled composition paths dispatch the command. Blast radius: duplicate IME text/rules/history. Stop on count >1; rollback PT-02.
2. Rule handles input but base command still runs. Blast radius: duplicated trigger text. Stop on Markdown/continuation failure; rollback command bridge.
3. Command grouping changes undo/collab transaction boundary. Blast radius: history and Yjs. Stop on one extra commit/history/collab operation; rollback PT-02.

### PT-03 — Accessibility transport and placeholder/drop presentation split

Changed concepts: VIEW-023 and VIEW-024.

Current Wordgard shape: editor package owns live-region DOM/message effects, focus/attrs, placeholder widget, drop cursor plugin, custom cursor layer, and theme presentation (`../wordgard/src/editor/editor.ts:108-139`, `../wordgard/src/editor/editor.ts:307-352`, `../wordgard/src/editor/placeholder.ts:4-41`, `../wordgard/src/editor/dropcursor.ts:5-94`, `../wordgard/src/editor/drawcursor.ts:4-84`). Strength: turnkey product. Limits: product policy in substrate and native caret suppression.

Current Plite shape: Plite React correctly owns live-region transport from commit effects (`packages/plite-react/src/components/editor-announcement-live-region.tsx:22-89`) and structural placeholder DOM, but the placeholder helper also owns opacity/position/presentation defaults (`packages/plite-react/src/components/plite-placeholder.tsx:26-90`). View-selection decoration is a legitimate partial-DOM fallback (`packages/plite-react/src/view-selection-decoration.ts:39-60`, `packages/plite-react/src/view-selection-decoration.ts:309-357`).

Current Plate shape: Plate core resolves read-only/autofocus (`packages/core/src/react/components/PlateContent.tsx:19-36`, `packages/core/src/react/components/PlateContent.tsx:191-215`) and passes placeholder/render slots (`packages/core/src/react/components/PlateContent.tsx:19-26`, `packages/core/src/react/components/PlateContent.tsx:124-185`). Registry editor CSS overrides Plite placeholder appearance; this is the correct product layer.

Proposed architecture:

```ts
// Plite transport remains.
editor.update(tx => {
  tx.effects.emit(screenReaderAnnouncementEffect, message);
});

// Add only when multiple Plate producers justify a shared update group.
editor.update.a11y.announce(message);
editor.update(tx => {
  tx.a11y.announce(message);
  tx.someOtherUpdate();
});
```

Simple Plate usage remains `<PlateContent placeholder="Write something…" />`.
Advanced apps use the existing `renderPlaceholder` slot and product CSS. If
multiple independent Plate producers need announcements, one inferred
`editor.update.a11y`/`tx.a11y` group wraps the existing local effect; otherwise
the sole producer emits the effect privately and no public facade is added.
Drop indicators remain ordinary plugin-slot React. Plite retains
`aria-hidden`, `contentEditable=false`, pointer inertness, required anchoring,
and projected-selection fallback. No new placeholder-props taxonomy is
introduced.

| Packet field | Concrete value |
|---|---|
| concept IDs | VIEW-023, VIEW-024 |
| decision owner | Plate Plan |
| execution skill | `plate-plan` |
| final owner | Plite React transport/structural DOM; Plate core/apps presentation and message policy |
| prerequisites | Current annotation/widget/decoration owners remain intact |
| dependent packets | PV-07 |
| entry condition | All announcement producers and placeholder/drop/caret presentation callers enumerated; browser screenshots/DOM contracts captured |
| exact implementation scope | Enumerate announcement producers; add an inferred Plate update/tx group only if at least two need one, otherwise keep the effect private; narrow Plite placeholder defaults to structural invariants; move default appearance/drop visuals to Plate/registry; retain projected selection |
| current shape | Correct low-level transport plus some presentation defaults; Plate already owns most product policy |
| target shape | Explicit transport/policy split with native caret primary and no query-shaped mutation API |
| public breaks | Plite placeholder no longer supplies product opacity/width/text decoration defaults; direct Plate producers use the accepted update group only if it exists; no custom local-caret API |
| Plite adoption | Keep live region, effect, structural placeholder and projected selection; narrow style helper |
| Plate adoption | Conditional core a11y update group, default placeholder component/styles, DnD/drop overlay and registry/apps |
| downstream adoption | apps/www registry editor styles, apps/plite placeholder/read-only/toolbar proof, docs/examples/fixtures; history keeps announcement effect `history: skip`; Yjs/collab stays local; codecs unaffected |
| deletion scope | Delete non-structural fields from `defaultPlaceholderStyle`, direct Plate construction of announcement effects after facade migration, and any product drop/caret presentation below Plate |
| focused unit proof | `packages/plite-react/test/screen-reader-announcement.test.tsx:1-159`; placeholder primitives/rendered shape; conditional Plate update-route tests |
| generated/property/fuzz laws | Announcement dedupe/order across commits; placeholder structural attributes invariant across custom renderers; random readOnly/focus transitions |
| browser proof | Applicable: placeholder, read-only, native selection, toolbar/drop indicator, shadow root |
| benchmark | N/A: presentation and local effect transport; assert no added render subscription |
| exit condition | Plate owns message/presentation policy; Plite owns only structural transport; native caret remains visible except projected-selection fallback |
| hard deletion gate | Search proves non-structural placeholder defaults/product drop-caret code below Plate are gone; direct effect producers collapse only when the shared update group is justified; `editor.api.a11y.announce` and a new public placeholder-props type remain absent |
| rollback answer | Meaningful: revert Plate producer/style migration; live-region effect and structural DOM never change, limiting blast radius |

Adoption audit: Plite React, Plate core and affected product plugins/kits/registry, apps/www, apps/plite, history announcement proof, docs/examples/fixtures/tests/exports and downstream style consumers are affected. Plite model, Yjs/collaboration transport, and codecs are unaffected.

Failure modes:

1. Style move removes positioning required for selection/IME. Blast radius: empty-editor caret/typing. Stop on placeholder DOM/IME failure; restore that field as a documented structural invariant.
2. A Plate announcement update emits a history/collab-visible effect. Blast radius: repeated remote/undo announcements. Stop on history/collab contract; remove or roll back the shared update group.
3. Product CSS fails to load and placeholder becomes unreadable/misplaced. Blast radius: Plate apps only. Stop on registry/apps visual proof; rollback style migration, not Plite transport.

##### No-execution adoption dossier — VIEW-025

- **Donor, Plite, and Plate shapes:** Wordgard product UI owns panel groups, dialog effects/forms, and menu navigation/theme (`../wordgard/src/editor/panel.ts:5-205`, `../wordgard/src/editor/dialog.ts:8-185`, `../wordgard/src/editor/menubar.ts:7-562`). The bounded Plite audit recorded above finds no generic panel/dialog/menu API. Plate already owns ordered UI composition through plugin render slots and `<PlateContent>` (`packages/core/src/react/plugin/PlatePlugin.ts:362-410`, `packages/core/src/react/components/PlateContent.tsx:124-185`).
- **Proposed owner and lifecycle:** Plate feature packages, kits, registry, and apps keep React/component lifecycle and product policy. Plite supplies only existing editor/React primitives; it gains no panel, dialog, or menu owner.
- **Routing and no-packet reason:** `Adopt` accepts the donor's product behavior category while rejecting its substrate placement. Current combined and target scores are both `95`; no source change, public break, migration, or executable packet is justified.
- **Adoption and deletion:** Existing Plate UI is the completed adoption. Delete nothing. Adding a generic Plite UI export is outside the accepted target.
- **Proof applicability:** Current unit authority is `packages/core/src/react/components/PlateContent.spec.tsx:1-425`. No new browser row runs for this no-code dossier; a future concrete Plate UI change owns its focused product browser proof. Benchmark is N/A because no substrate or hot-loop behavior changes.
- **Hard gate and reversal:** The bounded Plite audit must remain at zero generic panel/dialog/menu APIs, and Plate must remain the product owner. Reverse only when an accepted, UI-free anchor or lifecycle law cannot be represented by existing Plite primitives; that evidence may justify a narrow primitive, never a panel API.

##### No-execution adoption dossier — VIEW-026

- **Donor, Plite, and Plate shapes:** Wordgard's tooltip manager combines measurement, overlap, DOM lifecycle, hover timing, and leave tracking (`../wordgard/src/editor/tooltip.ts:21-98`, `../wordgard/src/editor/tooltip.ts:99-524`, `../wordgard/src/editor/tooltip.ts:542-833`). Plite already owns generic widget anchors and selection rectangles (`packages/plite-react/src/widget-store.ts:25-94`, `packages/plite-dom/src/plugin/dom-editor.ts:127-138`). Plate floating already owns selection/focus/read-only/open/click-outside product policy (`packages/floating/src/hooks/useFloatingToolbar.ts:20-84`, `packages/floating/src/hooks/useFloatingToolbar.ts:86-193`).
- **Proposed owner and lifecycle:** Plite DOM/React keeps root-local geometry and anchor data; Plate floating/apps keep async hover state, component lifecycle, and presentation. No timer or component lifecycle moves below Plate.
- **Routing and no-packet reason:** `Adopt` accepts the donor's product behavior while rejecting its imperative substrate placement. Current combined and target scores are both `100`; the existing owner split already satisfies the target, so no execution packet or public break exists.
- **Adoption and deletion:** Current Plite primitives plus Plate floating are the completed adoption. Delete nothing and add no generic tooltip/hover API.
- **Proof applicability:** Current browser authority is `apps/plite/tests/plite-browser/donor/examples/hovering-toolbar.test.ts:1-255`; widget lifecycle authority is `packages/plite-react/test/widget-layer-contract.tsx:1-890`. This no-code dossier runs no new browser row. Benchmark is N/A because no runtime path changes.
- **Hard gate and reversal:** Plite stays free of hover timers/components, and Plate must consume only root-local anchors/geometry. Reverse only if a concrete overlay cannot be expressed by current anchor data; then extend the smallest generic anchor fact with focused multi-root proof while leaving hover policy in Plate.

## Best API second-pass review

This section is the normative API correction pass required by R058. It does
not create another decision ledger: it changes the proposed-shape, adoption,
deletion, and proof cells of the existing canonical outcomes and packet
dossiers. Any earlier draft wording that proposes `PlateAction`,
`defineToolbarLayout`, public DOM capability profiles, a geometry namespace, a
materialization callback, or a recent-color store is rejected by this pass.

### Two-pass method and result

Pass one ignored the current implementation and wrote the smallest believable
normal, customization, and escape call sites. Pass two checked those targets
against live public types, exports, docs, representative callers, and runtime
owners:

- Plite explicitly teaches direct update methods for ordinary app behavior and
  reserves `defineCommand` for headless evaluation, extension interception, or
  pre-publication inspection
  (`content/docs/plite/concepts/06-commands.mdx:40-115`,
  `content/docs/plite/walkthroughs/05-executing-commands.mdx:80-231`).
- Plate already publishes inferred plugin-owned update groups, including bold
  and alignment
  (`packages/basic-nodes/src/lib/BaseBoldPlugin.ts:1-35`,
  `packages/basic-styles/src/lib/BaseTextAlignPlugin.ts:1-79`), and real callers
  already use `editor.plugin(...).update.*`
  (`apps/www/src/registry/ui/align-toolbar-button.tsx:60-74`,
  `packages/list/src/react/hooks/useListToolbarButton.ts:1-36`).
- Plite DOM already exposes flat intent methods such as
  `resolveDOMPoint`, `resolveDOMRange`, `resolveRangeRect`, and
  `scrollIntoView` (`packages/plite-dom/src/plugin/dom-editor.ts:107-170`);
  live product and app callers use those methods directly
  (`packages/footnote/src/internal/navigateToFootnote.ts:52-64`,
  `packages/core/src/react/plugins/navigation-feedback/transforms/navigate.ts:49-55`,
  `packages/yjs/src/react/index.ts:148-156`).
- The supposed structural materialization oracle is only used to write a
  preview `data-plite-dom-strategy-kind` attribute. It does not choose
  materialization, grouping, selection, or coverage
  (`packages/plite-react/src/dom-strategy/classify-segment-kind.ts:1-65`,
  `packages/plite-react/src/dom-strategy/segment-placeholder.tsx:211-231`,
  `packages/plite-react/src/dom-strategy/segment-placeholder.tsx:285-318`).
- Yjs currently publishes a second undo/redo surface
  (`packages/yjs/src/core/types.ts:180-201`,
  `packages/yjs/src/core/extension.ts:51-69`) while Plite History already
  publishes the normal direct API
  (`content/docs/plite/libraries/plite-history/history.mdx:149-166`).
- Plate product codecs are currently split across parser declarations and a
  manual Markdown host codec
  (`packages/core/src/lib/plugin/BasePlugin.ts:318-367`,
  `packages/core/src/lib/plugins/ParserPlugin.ts:27-127`,
  `packages/markdown/src/lib/MarkdownPlugin.ts:55-111`), while Plite DOM
  already owns the exact `ContentSlice` host boundary
  (`packages/plite-dom/src/plugin/host-codec.ts:36-155`,
  `packages/plite-dom/src/plugin/host-codec.ts:510-570`).
- Table cell JSON publicly carries both canonical camel-case fields and
  HTML-shaped lowercase aliases
  (`packages/utils/src/lib/plate-types.ts:88-125`,
  `packages/table/src/lib/BaseTablePlugin.ts:362-423`). `TableGrid`,
  mutation plans, selection views, and prepared paste remain private because
  ordinary callers already have domain commands.
- Plite already exports `TextDirection` for forward/backward traversal
  (`packages/plite/src/types/types.ts:1-18`,
  `packages/plite/src/interfaces/editor.ts:2621-2630`), so a second public
  `TextDirection` for `ltr`/`rtl` would be a semantic collision.

The result is a smaller target. The first pass correctly found the runtime,
codec, history, table, and ownership problems, but it invented public nouns
around several internal compilers. This pass deletes those nouns.

### Public-surface coverage reconciliation

Every canonical outcome is classified exactly once. `Public change` means a
real exported call shape or data contract changes. `Public removal` means the
best API is the surviving current owner with no replacement alias. `Existing
public surface` means implementation/adoption work uses an already-correct
call shape. `Internal`, `app-local`, `proof`, and `docs` are evidenced
exclusions from new package API design.

| Canonical outcome | Classification | Best API decision |
|---|---|---|
| C01 readonly publication | Public change | Make existing `Value`, `EditorDocumentValue`, `InitialValue`, locations, snapshots, commits, and slices readonly. Do not add `EditorDocumentSnapshot`, `EditorDocumentInput`, or `DeepMutableInput` vocabulary. |
| C02 private change kernel | Public removal | Keep `DocumentChange`; remove public `ChangeSet` machinery without replacement. |
| C03 compiled fitter owner | Internal | Preserve `ContentSlice` and current insert call sites; move only private fit machinery. |
| C04 product codecs | Public change | Inline inferred MIME-keyed `codecs` on `createBasePlugin`; owner and normal schema target derive from the plugin. No `definePlateCodec`, duplicate `key`, or public compiler type. |
| C05 HTML node codecs | Public change | Inline one inferred `host.html` contribution on the owning plugin. No `definePlateHtmlNodeCodec`, duplicate `key`, or ordinary `target`. |
| C06 DOM root runtime | Internal | Keep `<Editable>`/`<PlateContent>` unchanged; root runtime and generation tokens stay private. |
| C07 host capabilities | Public removal + internal | Remove realm-wrong `IS_*` exports where possible. Resolve semantic quirks per mounted root internally; do not publish `DOMHostCapabilities` or `editor.api.dom.capabilities()`. |
| C08 input/IME kernel | Internal | Keep normal editing and extension command call sites. Event intents, decisions, frames, epochs, and quirks stay private. |
| C09 DOM geometry | Existing public surface; no execution | Keep the flat intent methods already on `editor.api.dom`. Reject `editor.api.dom.geometry.*` and all caller migration. |
| C10 staged preview classification | Internal deletion | Delete type-name regex classification and the semantic preview attribute, or use one neutral internal value if a test proves the attribute is required. Reject a render-plan compiler and public policy callback. |
| C11 projection owner cleanup | Internal | Private rename/delete only; root exports remain identical. |
| C12 navigation | Proof | No API change; add only logical/native behavior proof. |
| C13 history v4 truth | Docs/error | No API or data change. |
| C14 collaborative-history differential | Proof | Test-only model and trace artifacts. |
| C15 one history owner | Public removal | Remove `tx.yjs.undo/redo`; normal call is `editor.update.history.undo()`/`redo()`. `tx.history.*` remains the atomic-composition form. |
| C16 collaboration surface | App-local component | Keep the zero-prop `<RemoteCursorOverlay />`; replace its no-op implementation with existing Yjs React data/geometry hooks. |
| C17 collaboration closure | Proof/docs | No new runtime API. |
| C18 product intent pilot | Existing public surface | Pilot plugin-owned inferred `update` methods and feature React hooks. Reject a generic `Action` descriptor, hook, state algebra, registry, and mandatory command wrapper. |
| C19 product intent adoption | Existing public surface | Migrate raw string/direct duplicate callers to each feature's plugin portal and hook. Add a Plite command only for a proved headless/interception/preview job. |
| C20 shortcut dispatcher | Existing public surface + internal | Keep current Plate shortcut declarations; compile one dispatcher that invokes the target plugin update/API. No action catalog. |
| C21 input-rule path | Internal | Keep Plate's current input-rule authoring API; remove the dead parallel callback route. |
| C22 toolbar composition | App-local | Keep explicit JSX/component composition. Colocate and deduplicate repeated catalogs; reject a data DSL, renderer, validator, freezer, IDs, and generated action tree. |
| C23 writing direction | Public change | Add `WritingDirection = 'ltr' \| 'rtl'`, where absence means auto; publish `BaseWritingDirectionPlugin`/`WritingDirectionPlugin` and inferred `update.set/clear`. |
| C24 structural-list rename | Public rename | Use `@platejs/list-structural`, `BaseStructuralListPlugin`, `StructuralListPlugin`, and `StructuralListConfig`; preserve serialized node values and ship no aliases. |
| C25 color UI | App-local props + existing public surface | Use basic-styles plugin updates. Component normal path is `colors`; optional controlled `recentColors`/`onRecentColorsChange` is the customization path. The host computes document colors outside. No store or callback-reader interface. |
| C26 UI ownership audit | Ownership gate | No generic UI API; presentation stays in Plate/apps. A11y announcements use the update lifecycle, never `editor.api`. |
| C27 table grid | Public data change + internal | Public JSON keeps only `colSpan`/`rowSpan`; HTML codecs translate lowercase attributes. `TableGrid` and diagnostics stay private. |
| C28 table mutation | Internal | Existing table commands remain public; plans/operations/diagnostics stay private unless a concrete external recovery job proves otherwise. |
| C29 table selection | Existing public surface + internal | Preserve public `TableCellSelection`; selection views/caches stay private. |
| C30 table ingress | Internal | Preserve clipboard/drop and codec APIs; prepared table sources stay private. |
| C31 table product adoption | Existing public surface | Keep table plugin commands/options; migrate internal consumers to one grid/planner. |
| C32 closure | Proof/docs | No runtime API. |
| C33 localization | No-code gate | Reject a generic/core phrase API; require independent product admission evidence. |

Coverage result: `33/33` canonical outcomes classified; `0` unexplained public
surfaces; `0` public abstractions justified only by their implementation.

### Winning public call sites

#### Document values, changes, history, and tables

Normal:

```ts
const initialValue = [
  { type: 'p', children: [{ text: 'Hello' }] },
] satisfies Value;

const editor = createEditor({ initialValue });
const snapshot = editor.read((state) => state.runtime.snapshot());

editor.update.history.undo();
editor.plugin(TablePlugin).update.insertRow();
```

Customization:

```ts
const editor = createEditor({
  initialValue: {
    children: main,
    roots: { comments },
  } satisfies InitialValue,
});

editor.update((tx) => {
  tx.history.undo();
  tx.effects.emit(localAuditEffect, { reason: 'host-shortcut' });
});
```

Escape: hosts serialize the existing `DocumentChange`/history envelopes or use
the existing transaction API. There is no mutable snapshot class, raw change
section API, Yjs undo escape, or public table planner.

#### Product codecs

Normal:

```ts
const MarkdownPlugin = createBasePlugin({
  key: 'markdown',
  codecs: {
    'text/markdown': {
      scope: 'document',
      decode: ({ data, plugin, state }) =>
        ContentSlice.closed(decodeMarkdown(data, { plugin, state })),
      encode: ({ plugin, slice, state }) =>
        encodeMarkdown(slice.content, { plugin, state }),
    },
  },
});
```

Customization:

```ts
const RecordsPlugin = createBasePlugin({
  key: 'records',
  codecs: {
    'application/json': {
      decode: ({ data }) => ContentSlice.fromJSON(JSON.parse(data)),
      encode: ({ slice }) => JSON.stringify(slice),
    },
    'text/csv': {
      priority: 20,
      decode: ({ data, state }) => decodeRows(data, state),
    },
  },
});
```

HTML extension contribution:

```ts
const BoldPlugin = createBasePlugin({
  key: 'bold',
  host: {
    html: {
      match: [
        { tag: ['STRONG', 'B'] },
        { style: { fontWeight: ['600', '700', 'bold'] } },
      ],
      decode: () => ({ bold: true }),
      encode: ({ value }) => (value.bold ? { tag: 'strong' } : null),
    },
  },
});
```

Escape: a host that is not Plate uses Plite DOM's existing `defineHostCodec`.
Plate plugin authors do not manually register host codecs. Extracted reusable
declarations get an exported helper type only after a real second call site
proves that inline inference is insufficient.

#### Product behavior

Normal:

```ts
editor.plugin(BaseBoldPlugin).update.toggle();
editor.plugin(TextAlignPlugin).update.set('center');
editor.plugin(StructuralListPlugin).update.toggle();
editor.plugin(WritingDirectionPlugin).update.set('rtl');
editor.plugin(FontColorPlugin).update.set('#2563eb');
```

Customization:

```tsx
const state = useMarkToolbarButtonState({ plugin: BoldPlugin });
const { props } = useMarkToolbarButton(state);

<FontColorToolbarButton
  colors={brandColors}
  recentColors={recentColors}
  onRecentColorsChange={setRecentColors}
/>
```

Escape: define and dispatch a Plite command only when the behavior must be
evaluated headlessly, intercepted by extensions, or inspected before
publication. A host command palette can map its own IDs to explicit functions;
Plate packages do not publish a parallel action identity/state system.

#### DOM, rendering, and app UI

Normal:

```ts
const rect = editor.api.dom.resolveRangeRect(range);
editor.api.dom.scrollIntoView(range);
```

```tsx
<FixedToolbar>
  <HistoryToolbarButton />
  <ToolbarSeparator />
  <TurnIntoToolbarButton />
  <AlignToolbarButton />
  <FontColorToolbarButton colors={brandColors} />
  <MoreToolbarButton />
</FixedToolbar>
```

Customization: raw Plite callers keep `domStrategy="auto"`, `"staged"`, or
the existing virtualized options
(`packages/plite-react/src/dom-strategy/create-segment-plan.ts:4-54`);
apps compose ordinary components/props. Internal tests inject root quirks.

Escape: none for engine detection, materialization callbacks, or toolbar data
trees. A concrete missing DOM intent earns one flat method named for that job,
not a catch-all geometry/profile namespace.

### P0-P3 API audit

| Priority | Finding | Decision and owner |
|---|---|---|
| P0 | Two public history owners can mutate the same collaborative document. | C14 proves equivalence; C15 removes Yjs undo/redo. Plite History remains the only owner. |
| P0 | Public mutable-looking snapshots contradict immutable runtime law. | C01 makes existing names readonly and tests alias detachment; no new wrapper/input taxonomy. |
| P0 | Plate decode/encode paths can lose exact slice openness or run two owners. | C04/C05 compile one inline product declaration to Plite DOM and hard-delete the old parser/serializer paths. |
| P0 | Table JSON carries two span vocabularies. | C27 keeps camel-case model fields only and translates HTML at the codec boundary. |
| P1 | Proposed `Action` descriptors duplicate feature updates, hooks, and conditional Plite commands. | Reject the abstraction; C18/C19 adopt existing plugin portals and feature hooks. |
| P1 | Proposed DOM capability and geometry APIs expose engine/compiler structure instead of user intent. | C07 stays private; C09 is no-code keep of flat intent methods. |
| P1 | Proposed materialization policy solves a preview attribute heuristic with a public compiler callback. | C10 deletes the heuristic/attribute; no render-plan API or Plate compiler. |
| P1 | Proposed toolbar DSL recreates JSX in data and adds a renderer/validator/freeze lifecycle. | C22 uses colocated explicit JSX and deletes only real duplication. |
| P1 | Proposed recent-color store and document-color callback push app state machinery into a component contract. | C25 uses ordinary controlled props; document-derived data is computed outside. |
| P1 | `editor.api.a11y.announce` models a state-changing update as a query/API call. | C26 exposes a Plate update/tx group only if multiple producers need it; otherwise the effect stays private. |
| P2 | `TextDirection` collides with an existing Plite traversal type. | C23 uses `WritingDirection`; absence means auto. |
| P2 | `list-structure`/`ListStructurePlugin` are awkward nouns. | C24 uses `list-structural`/`StructuralListPlugin`. |
| P2 | Codec helper wrappers duplicate identity and make inference worse. | C04/C05 infer owner/key/target from inline plugin declarations. |
| P3 | Docs could teach advanced commands, stores, or internals as the normal path. | C32 docs lead with direct plugin updates, controlled React props, current DOM intents, and the direct history API. |

### Rejected public machinery

The following names are prohibited targets unless a new, independently
accepted `best-api` review proves a real caller job that the winning call sites
cannot express:

- `EditorDocumentSnapshot`, `EditorDocumentInput`, and public
  `DeepMutableInput`;
- `definePlateCodec`, public codec `key` duplication, and ordinary-path
  `targets`;
- `definePlateHtmlNodeCodec`, public HTML rule `key`, and ordinary-path
  `target`;
- `DOMHostCapabilities`, `DOMQuirk`, and
  `editor.api.dom.capabilities()`;
- `DOMGeometry` and `editor.api.dom.geometry.*`;
- `DOMMaterializationPolicy`, `CompiledRootRenderPlan`, and public classifier
  callbacks;
- `definePlateAction`, `PlateAction`, `usePlateAction`, action registries, and
  action state algebras;
- `defineToolbarLayout`, `group`, `actionItem`, `controlItem`, and a toolbar
  layout renderer;
- `RecentColorStore`, `getDocumentColors`, and package-level palette/recent
  storage;
- Plate `TextDirection` for writing direction;
- `editor.api.a11y.announce`.

## Cross-lane synthesis, final architecture, ranking, and backlog

Planning evidence only. This section consolidates the current-source master ledger
into one target architecture and one executable backlog. It does not authorize
implementation and does not treat any historical plan as evidence.

### Decisive recommendation

Do not migrate Wordgard as an editor architecture.

The combined Plite + Plate direction is fundamentally stronger. The useful
Wordgard material is a small set of compiled mechanisms and behavior cases:

- one immutable table projection with typed problems;
- explicit parser/keymap ordering;
- a locally legible slice fitter and change algebra;
- mapped history with one undo owner;
- concise word, bidi, table, selection, and command cases;
- clear point/range/widget distinctions.

Adopt those ideas only where current source shows a gap. Reject Wordgard's
nominal document classes, global numeric positions, single root, public token
slices, function-identity configuration, state appenders, custom imperative
renderer, schema-coupled DOM, global browser flags, generic UI layer, central
English phrase catalog, and authority protocol without a real consumer.

The strongest take from the complete audit is:

1. The best donor mechanism is `TableMap`; Plate should replace its overlapping
   table projections and caches with one canonical `TableGrid`.
2. The worst current ownership error is dual collaborative history; Plite
   history must become the only undo/redo owner after differential proof.
3. The broadest substrate cleanup is one per-root DOM runtime in `plite-dom`,
   with private realm facts and a private renderer-neutral input/IME machine.
4. The highest-leverage Plate API work is direct inferred plugin updates plus
   one slice-native codec architecture.
5. Wordgard's state, renderer, schema catalog, phrases, package topology, and
   generic collaboration helper should not be ported.

### Cross-lane concept deduplication

Keep all **181** scored lane rows for evidence traceability:

- `DOC-001–034`: 34
- `STATE-001–022`: 22
- `HC-001–032`: 32
- `PRODUCT-001–028`: 28
- `TABLE-001–031`: 31
- `VIEW-001–028`: 28
- `META-001–006`: 6

Do not duplicate their decisions in separate architecture ledgers. They collapse
into these ten canonical ownership systems:

| Canonical system | Source concept families | Final owner and decision |
|---|---|---|
| Document truth | DOC-001–023, STATE-001–009/016–017, HC-002–009/013/019/024/026 | Plite structural JSON, readonly publication, `ContentSlice`, and `DocumentChange`; private token/change kernel |
| Schema and configuration | DOC-002–012/031, STATE-010–015, PRODUCT-014–018, TABLE-002 | Plite compiles generic schema/configuration laws; Plate declares product vocabulary |
| History and collaboration | DOC-024–025, HC-001–032 | Plite history is the only undo owner; Yjs is transport/projection/provider/awareness/shared-effect adapter; Plate owns product adoption |
| DOM host runtime | STATE-018–020, VIEW-001–015/022–024/028 | `plite-dom` owns root runtime, private realm facts, selection, existing flat geometry intents, input, IME, clipboard; React adapts commits/events |
| React rendering and overlays | VIEW-016–021/024/026–028 | `plite-react` owns structural rendering and data overlays; Plate supplies product UI, not a second render-plan compiler |
| Product behavior and UI | STATE-021–022, PRODUCT-001–013/020/026/028, VIEW-009/014–015/023–027 | Plite owns pure command dispatch; Plate feature packages own inferred update groups and justified commands; apps own JSX layout, words, icons, and presentation |
| Product codecs | DOC-026–030, VIEW-012, PRODUCT-014–018/021–025, TABLE-022/027/029 | Plite DOM owns generic host codecs and exact slices; Plate compiles format and HTML product codecs |
| Tables | STATE-015, PRODUCT-019, TABLE-001–031 | Entire feature remains Plate-owned over generic Plite selection/change/slice/history/Yjs laws |
| Proof | DOC-033, STATE-018/020, HC-030/032, PRODUCT-027–028, TABLE-031, VIEW-028, META-003–006 | Existing Plite proof system remains; donor cases enter only as deterministic missing laws |
| Package/release topology | DOC-034, PRODUCT-019/028, META-001–002/005 | Keep workspace packages and ordinary typed ESM; hard-cut misleading names and leaked internals |

This resolves apparent duplicates:

- DOC immutable values, STATE immutable state, and selection/table readonly
  views are one publication contract, not three APIs.
- DOC change algebra, STATE transaction composition, and HC history mapping are
  one `DocumentChange` pipeline, not competing mutation models.
- DOC codecs, VIEW clipboard, and TABLE paste are one exact-slice ingress chain,
  with product classification remaining in Plate.
- PRODUCT behavior, VIEW native host commands/shortcuts, and TABLE behavior use
  feature-owned plugin updates or a Plite command only when interception,
  headless evaluation, or preview is required.
- STATE bidi fixtures, PRODUCT direction, and VIEW geometry are linked proof and
  product packets; no model-side bidi engine is created.
- PRODUCT UI, VIEW panels/tooltips/placeholders, TABLE UI, and HC cursors remain
  app/Plate presentation, not generic editor packages.

### Coherent target architecture

#### Public architecture

```text
Application / registry
  explicit JSX toolbars, words/icons/theme, palette/recent state,
  provider/auth/persistence, product routes and examples
                         |
                         v
Plate feature packages
  inferred plugin-owned update groups
  commands only for headless/interceptable/previewable jobs
  inline MIME-keyed codecs and inline host.html contributions
  tables, structural lists, links, media, writing direction and product UI
                         |
                         v
Plite public substrate
  readonly Value / EditorDocumentValue / InitialValue and locations
  compiled schema state
  state/read/update/transaction lifecycle
  ContentSlice
  DocumentChange (only public change algebra)
  generic selection, command, effect, field and facet protocols
                         |
          +--------------+----------------+
          |              |                |
          v              v                v
   Plite History     Plite DOM/React    Yjs adapter
   one undo owner    flat DOM intents    transport only
                     React rendering
```

Public rules:

- Existing document values, roots, paths, points, ranges, selections, slices,
  snapshots, commits, and codec payloads become readonly structural data; no
  second snapshot/input vocabulary is added.
- `ContentSlice` is the only open-content transport.
- `DocumentChange` is the only public replay, persistence, mapping, composition,
  inversion, and collaboration change algebra.
- `ChangeSet`, token slices, document indexes, builders, table planners, event
  frames, root profiles, and section arrays are private machinery.
- `editor.update.history.undo()`/`redo()` is the normal undo API;
  `tx.history.*` exists only inside an atomic update. Yjs exposes no competing
  history API.
- Ordinary Plate behavior is a feature plugin update. A Plite command is
  justified by a real headless, interception, or preview job—not by a generic
  Action abstraction.
- Plate product codecs are inline, inferred plugin declarations and always
  preserve exact `ContentSlice` openness. Plugin identity supplies owner/key.
- Plite DOM keeps flat methods named for user intent. Root facts, input frames,
  composition epochs, caret adapters, and preview labels stay private.
- React rendering is not serialization. No Plate materialization compiler or
  public render-policy callback exists.
- Table JSON uses only camel-case span fields; HTML spelling is translated at
  the codec boundary. Table grid/plans/diagnostics remain private.
- Apps compose toolbar/menu JSX explicitly and own color palettes, recent
  state, words, icons, and placement.

Representative public shapes:

```ts
const value = [
  { type: 'p', children: [{ text: 'Hello' }] },
] satisfies Value;

const MarkdownPlugin = createBasePlugin({
  key: 'markdown',
  codecs: {
    'text/markdown': {
      decode: ({ data }) => decodeMarkdownSlice(data),
      encode: ({ slice }) => encodeMarkdownSlice(slice),
    },
  },
});

editor.plugin(BaseBoldPlugin).update.toggle();
editor.plugin(WritingDirectionPlugin).update.set('rtl');
editor.update.history.undo();
editor.api.dom.scrollIntoView(range);

interface TTableCellElement extends Element {
  id: string;
  colSpan?: number;
  rowSpan?: number;
  size?: number;
}
```

#### Internal architecture

```text
Compiled Plite schema revision
  -> construction/property/group/root indexes
  -> compiled slice fitter
  -> strict persistence identity

Private change kernel
  -> token/index/root-change/mapping/transform/builder/classification modules
  -> public DocumentChange
  -> commit, selection, history, Yjs and DOM consumers

Per-root DOM runtime
  -> private resolved realm facts + generation token
  -> scheduler + observer/repair + mapping/selection
  -> private input decisions + composition epoch
  -> host codecs + clipboard/drop

Plite React
  -> existing runtime-ID rendering and segment plans
  -> no type-name semantic preview classifier
  -> distinct public decoration, annotation, and widget readers
  -> private projection controller, mapped index, and source fault boundary

Compiled Plate model
  -> schema contributions and inferred feature updates
  -> one shortcut dispatcher
  -> inline product format/HTML codecs
  -> ordinary React product rendering

Plate table capability
  -> immutable private TableGrid + typed TableProblem
  -> private TableSelectionView, TableMutationPlan, PreparedTablePaste
  -> existing public table commands
  -> one atomic Plite transaction

Plite history + Yjs
  -> mapped canonical history branches
  -> normal outbound replay lowering
  -> atomic remote history-skip import
  -> Yjs provider/schema/awareness/shared-effect state
```

Internal rules:

- Schema, fitter, Plate model, codec, and shortcut artifacts are immutable and
  keyed by an explicit revision.
- Table grids are cached by immutable table identity in one bounded owner.
- DOM runtime work is invalidated by root generation, never process-global
  browser state.
- Composition is one private epoch machine; a settled final-input tombstone
  prevents double commits.
- Overlay cache and failure state remain private and source-scoped.
- Configuration compilation, codec conflicts, and schema migration fail before
  publication.
- A failed fit, table plan, plugin update, command, or provider operation
  publishes nothing.
- A bad overlay source or shared-effect source cannot block unrelated owners.

### Packet alias reconciliation

There are **36** lane packet aliases: 35 future aliases plus the completed
`PRODUCT Packet 0` planning ledger. The future aliases collapse into **33**
canonical outcomes: **31 executable implementation/internal/proof/docs
packets** and **2 resolved no-execution outcomes**. C09 records that the
existing flat DOM geometry API is already best; C33 rejects generic
localization without product evidence. STATE-P1/P2 share one navigation-proof
item; PRODUCT Packet 7 and PV-07 share one final closure item.

| Canonical | Source packet aliases | Owner | Disposition |
|---|---|---|---|
| C01 Readonly publication | P-DOC-1 | Plite Plan, then Plate adoption | Execute |
| C02 Private change kernel | P-DOC-2 | Plite Plan | Execute |
| C03 Compiled slice fitter | P-DOC-3 | Plite Plan | Execute |
| C04 Inline product codecs | P-DOC-4 | Plate Plan on Plite DOM | Execute |
| C05 Inline HTML node codecs | P-DOC-5 | Plate Plan | Execute |
| C06 Per-root DOM runtime | PV-01 | Plite Plan | Execute |
| C07 Private root facts | PV-02 | Plite Plan | Execute |
| C08 Input/IME kernel | PV-03 | Plite Plan | Execute |
| C09 DOM geometry API keep | PV-06 | Plite Plan | Resolved; no execution |
| C10 Preview classifier deletion | PV-04 | Plite React | Execute |
| C11 Private projection owner cleanup | PV-05 | Plite Plan | Execute as behavior-neutral internal cleanup |
| C12 Navigation proof | STATE-P1 + STATE-P2 | Plite Plan proof | Execute as proof-only |
| C13 History v4 truth | HP-01 | Plite Plan | Execute |
| C14 Collaborative history differential | HP-02 | Plite Plan proof | Execute as deletion gate |
| C15 Yjs history hard cut | HP-03 | Plite Plan | Execute only after C14 |
| C16 Real collaboration product surface | HP-04 | Plate Plan | Execute |
| C17 Executable collaboration proof | HP-05 | linked Plite + Plate Plan | Execute |
| C18 Plugin-update pilot | PRODUCT Packet 1 | Plate Plan | Execute |
| C19 Plugin-update adoption | PRODUCT Packet 2 | Plate Plan | Execute |
| C20 One shortcut dispatcher | PT-01 | Plate Plan on Plite DOM | Execute |
| C21 One input-rule text path | PT-02 | linked Plite DOM + Plate Plan | Execute |
| C22 Explicit toolbar JSX | PRODUCT Packet 3 | Plate UI/registry | Execute |
| C23 Writing direction | PRODUCT Packet 4 | Plate Plan; conditional Plite DOM follow-up | Execute |
| C24 Structural-list rename | PRODUCT Packet 5 | Plate Plan/release | Execute independently |
| C25 Color UI cleanup | PRODUCT Packet 6 | Plate UI/registry | Execute |
| C26 Product UI ownership audit | PT-03 | Plate/apps | Execute; shared a11y update group only if producer count justifies it |
| C27 Canonical TableGrid | TABLE-P1 | Plate Plan | Execute |
| C28 Table mutation planner | TABLE-P2 | Plate Plan | Execute |
| C29 Table selection view | TABLE-P3 | linked Plite proof + Plate Plan | Execute |
| C30 Prepared table ingress | TABLE-P4 | linked Plite + Plate Plan | Execute |
| C31 Table UI/release adoption | TABLE-P5 | Plate Plan | Execute |
| C32 Final proof/docs closure | PRODUCT Packet 7 + PV-07 | linked proof/docs owners | Execute last |
| C33 Localization admission gate | STATE-P3 | application product owner only | Defer; no code |
| Planning ledger | PRODUCT Packet 0 | This plan and coverage manifest | Complete in planning |

### Every Plite Plan packet

The Plite-routed aliases and their canonical destinations are:

1. `P-DOC-1` → C01 readonly publication.
2. `P-DOC-2` → C02 private change kernel.
3. `P-DOC-3` → C03 compiled fitter.
4. `STATE-P1` → C12 deterministic word-boundary proof.
5. `STATE-P2` → C12 native mixed-bidi caret proof.
6. `HP-01` → C13 history v4 truth.
7. `HP-02` → C14 one-owner history differential.
8. `HP-03` → C15 Yjs history deletion.
9. `HP-05` Plite half → C17 provider/collaboration proof.
10. `TABLE-P3` Plite half → C29 generic selection codec/mapping proof.
11. `TABLE-P4` Plite half → C30 slice/fitter/history/Yjs proof.
12. `PV-01` → C06 DOM root runtime.
13. `PV-02` → C07 root capabilities.
14. `PV-03` → C08 input/IME kernel.
15. `PV-04` → C10 preview-classifier deletion.
16. `PV-05` → C11 private projection owner cleanup.
17. `PV-06` → C09 no-execution geometry keep decision.
18. `PV-07` → C32 final Plite proof closure.
19. `PT-02` Plite half → C21 canonical input-command path.

Plite keeps without redesign: structural JSON, schema compiler, transaction
publication, command registry, generic selection protocol, correction
worklist, host-codec protocol, runtime IDs, DOM mapping, scheduler, current
history batch semantics, Yjs projection/provider/awareness/shared effects, and
the existing browser/benchmark infrastructure.

### Every Plate Plan packet

The Plate-routed aliases and their canonical destinations are:

1. `P-DOC-4` → C04 product codec compiler.
2. `P-DOC-5` → C05 compiled HTML node codec.
3. `HP-04` → C16 real collaboration product surface.
4. `HP-05` Plate half → C17 product browser/provider proof.
5. `PRODUCT Packet 1` → C18 plugin-update pilot.
6. `PRODUCT Packet 2` → C19 plugin-update adoption.
7. `PRODUCT Packet 3` → C22 explicit toolbar JSX.
8. `PRODUCT Packet 4` → C23 writing direction.
9. `PRODUCT Packet 5` → C24 structural-list rename.
10. `PRODUCT Packet 6` → C25 color UI.
11. `PRODUCT Packet 7` → C32 product proof/docs closure.
12. `TABLE-P1` → C27 canonical fields and `TableGrid`.
13. `TABLE-P2` → C28 table mutation planner.
14. `TABLE-P3` Plate half → C29 table selection/navigation.
15. `TABLE-P4` Plate half → C30 table paste/drop/clipboard.
16. `TABLE-P5` → C31 table UI/release adoption.
17. `PT-01` → C20 shortcut dispatcher.
18. `PT-02` Plate half → C21 input-rule final-commit path.
19. `PT-03` → C26 product UI ownership audit.

`PRODUCT Packet 0` is planning-only and is closed by the final concept ledger
and manifest. `STATE-P3` is not a Plate-core packet; localization stays
application-owned unless its admission evidence is supplied.

### Every linked cross-owner chain

1. **Readonly adoption:** C01 Plite types → every Plate package, app, fixture,
   codec, table, history, DOM, React, and Yjs consumer.
2. **Change/fitter to product ingress:** C02 private change kernel → C03
   compiled fitter → C04 product codecs → C05 HTML codec → C30 table ingress.
3. **DOM input to product commands:** C06 root runtime → C07 capabilities → C08
   input/IME → C20 shortcuts and C21 input rules.
4. **Preview classification:** C10 deletes Plite React's preview-only type-name
   labels. There is no Plate compiler, caller migration, or cross-owner API.
5. **Projection/product UI ownership:** C11 stays inside Plite React: rename
   the private full-control projection store owner and delete its duplicate
   private entry alias while keeping every root export unchanged. C26 audits
   product UI independently; collaboration, table, placeholder, decoration,
   annotation, and widget consumers keep their existing public lanes.
6. **Navigation/direction:** C12 logical and native bidi proof → C23 Plate
   direction; only a demonstrated generic host gap may create a Plite DOM
   follow-up.
7. **One history owner:** C14 differential proof → C15 Yjs history cut → C16
   Plate collaboration UI → C17 executable provider/browser proof.
8. **Product behavior:** C18 inferred-update pilot → C19 adoption → C22 JSX
   toolbar, C23 direction, C25 color, and table control adoption in C28/C31.
9. **Table architecture:** C27 grid → C28 mutations → C29 selection → C30
   ingress → C31 product UI/release, with Plite proof at C29/C30.
10. **Final closure:** every accepted chain → C32; release claims stop if any
    source deletion, browser, benchmark, manifest, or current-state docs gate
    is not green.

### Complete architecture-value ranking

This ranks every worthwhile canonical change. It is not execution order.

| Rank | Item | Architectural value |
|---:|---|---|
| 1 | C27 canonical `TableGrid` | Replaces the largest live duplication cluster with one diagnosed immutable owner; Wordgard is clearly better here. |
| 2 | C15 one collaborative history owner | Deletes a competing public undo API, private Yjs stack access, split repair, and a dependency pin. |
| 3 | C04 inline slice-native product codecs | Ends Plate's parser/serializer split while making the normal declaration smaller and inferred. |
| 4 | C05 inline HTML node codecs | Replaces order-dependent parsing and dead serializers with one plugin-owned bidirectional claim. |
| 5 | C07 private per-root facts | Fixes iframe, shadow-root, SSR, and realm truth without exporting engine detection as product API. |
| 6 | C30 prepared table ingress | Unifies model/HTML/CSV/TSV paste and drop around one pure source and mutation plan. |
| 7 | C28 table mutation planner | Centralizes correction, row/column, merge/split, IDs, spans, and sizing in focused atomic operations. |
| 8 | C14 collaborative-history differential | Provides the proof warrant for C15; architectural taste alone cannot justify deleting undo. |
| 9 | C18 inferred plugin-update pilot | Proves direct feature portals are the normal product-intent path without a parallel Action system. |
| 10 | C19 plugin-update adoption | Removes raw string mutation and duplicate selectors while keeping commands exceptional. |
| 11 | C16 real collaboration product surface | Replaces a static demo and null cursor overlay with truthful provider-backed adoption. |
| 12 | C17 executable collaboration proof | Closes provider, reconnect, cursor, shared-effect, schema, and one-owner undo claims. |
| 13 | C01 readonly public truth | Makes existing public names match immutable runtime law without a second value taxonomy. |
| 14 | C06 one DOM root runtime | Moves renderer-neutral lifecycle/observer/repair law to its proper private owner. |
| 15 | C08 private input/IME kernel | Makes composition ownership explicit while keeping event/compiler types out of public API. |
| 16 | C20 one shortcut dispatcher | Removes generic product defaults and routes shortcuts to the owning plugin update or justified command. |
| 17 | C29 private table selection view | Deletes overlapping selected-cell caches and puts all geometry on `TableGrid`. |
| 18 | C23 writing direction | Fills a real Plate feature gap without colliding with Plite's traversal `TextDirection`. |
| 19 | C02 private change kernel | Protects `DocumentChange` as the single public algebra and makes internals navigable. |
| 20 | C25 color UI cleanup | Removes full-document scanning and timer focus using ordinary props and feature updates. |
| 21 | C24 structural-list rename | Gives the second list model an honest adjective and deletes the compatibility-era name. |
| 22 | C03 compiled fitter owner | Improves internal cohesion and schema-revision ownership without changing correct call sites. |
| 23 | C12 navigation proof | Adds deterministic donor word cases and real-browser bidi cases without importing donor algorithms. |
| 24 | C21 one input-rule text path | Proves final IME/text commits enter middleware once and deletes a dead callback route. |
| 25 | C31 table UI/release adoption | Carries table truth through sizing, registry, accessibility, browser, docs, and release gates. |
| 26 | C22 explicit toolbar JSX | Colocates repeated catalogs while preserving readable component composition. |
| 27 | C26 product UI ownership audit | Prevents presentation policy from drifting into Plite; a shared a11y update group remains conditional. |
| 28 | C10 preview-classifier deletion | Deletes a lying diagnostic heuristic without inventing a render compiler. |
| 29 | C13 history v4 truth | Cheap but necessary correction of current error/docs claims. |
| 30 | C11 private projection owner cleanup | Removes a private naming collision and thin alias with zero public/runtime change. |
| 31 | C32 final proof/docs closure | Converts all implementation claims into checked owner truth and zero residual references. |

C09 and C33 are deliberately absent. C09 keeps the already-good flat DOM
geometry API; C33 rejects generic localization until two real product
consumers prove locale/fallback/ICU/SSR/accessibility requirements.

### Dependency-ordered execution backlog

#### Wave 0 — establish truth and deletion warrants

1. C13 history v4 truth.
2. C12 navigation proof.
3. C14 collaborative-history differential; start early because it is the
   longest destructive gate.
4. C24 structural-list rename may run independently in a coordinated breaking
   release window.

#### Wave 1 — independent foundations

1. C01 readonly publication.
2. C06 DOM root runtime move with trace-identical behavior.
3. C10 preview-classifier deletion.
4. C11 private projection owner cleanup; root exports and runtime stay byte-for-byte equivalent at the contract boundary.
5. C18 inferred plugin-update pilot.

#### Wave 2 — first dependent owners

1. C02 private change kernel after C01 names stabilize.
2. C07 private root facts after C06.
3. C04 product codec compiler after C01.
4. C19 plugin-update adoption after C18.
5. C27 canonical table grid after C01.
6. C15 Yjs history cut after C14, preferably after C02 has fixed the internal
   change bridge boundary.

#### Wave 3 — compiled consumers

1. C03 compiled fitter after C02.
2. C08 input/IME kernel after C06 and C07.
3. C05 HTML node codec after C04.
4. C20 shortcuts and C21 input-rule bridge after C08 and the C18 pilot.
5. C22 toolbar JSX runs after its duplicated catalogs are enumerated; C23
   writing direction consumes C12 browser proof; C25 color consumes its
   feature-update and focus baselines. None depends on an Action layer.
6. C28 table mutations after C27.
7. C16 collaboration surface after C15 fixes the public undo story.
8. C26 product UI audit after the first product migrations; C11 is independent
   private cleanup and is not an adoption prerequisite.

#### Wave 4 — cross-owner behavior

1. C29 table selection after C27/C28.
2. C30 table ingress after C03, C05, and C27–C29.
3. C17 collaboration proof after C15/C16.

#### Wave 5 — product and release closure

1. C31 table UI/release adoption after C27–C30.
2. C32 final proof/docs/manifest/deletion closure after every accepted packet.
3. C33 remains no-code unless its admission gate is independently accepted.

#### Why value and execution order differ

- C27 ranks first but follows C01 so the new table model is born on final
  readonly JSON types.
- C15 ranks second but cannot precede C14; deleting collaborative undo on
  architectural taste alone would be reckless.
- C04/C05 rank above most foundation cleanup but follow C01 because a new
  product API should not immediately undergo a readonly migration.
- C10 is a small parallel-safe deletion because its only evidenced consumer is
  preview markup; any render/coverage effect stops the packet.
- C30 ranks above C03 but depends on the fitter, codec, grid, mutation, and
  selection owners.
- C31 is low in architectural novelty but must land after all table internals
  because it proves final product adoption.
- C13 is near the bottom by architecture value but belongs first because it is
  cheap current-truth repair.
- C11 ranks near the bottom because it is only a private naming/alias cleanup,
  but it can land in Wave 1 independently because it changes no public export,
  runtime behavior, or downstream caller.

### Largest hard cuts

1. **Yjs split history:** remove `tx.yjs.undo/redo`, controller
   `Y.UndoManager`, private-stack adapter, split-history engine/adapter,
   repair-only markers/helpers, private-stack pin, and stale docs/tests.
   Replacement: Plite history replay through the normal Yjs bridge. Packet:
   C15. Gate: C14 differential plus full package/browser/benchmark proof.
2. **Plate table projections:** remove duplicate span fields, `_cellIndices`,
   adjacent lookup, old grid/merge-grid/find helpers, selection caches,
   whole-table repair clone, repeated occupied matrices, and bypass paste paths.
   Replacement: `TableGrid`, `TableSelectionView`, `TableMutationPlan`,
   `PreparedTablePaste`. Packets: C27–C30. Gate: zero-reference audit plus
   generated, history/Yjs, browser, locality, and retained-memory proof.
3. **Plate parser/serializer split:** remove fragment-array `parser`, forced
   closed wrapping, dead serializer declarations, Markdown's manual codec
   registration, implicit reverse-order HTML registry, and old runtime.
   Replacement: C04/C05 codecs. Gate: all codec consumers migrated, exact slice
   and format round trips, zero old declarations/readers.
4. **Public Plite `ChangeSet`:** remove root export, public docs, `sections`,
   `data`, `fromSections`, and non-internal imports.
   Replacement: public `DocumentChange`, private change bridge. Packet: C02.
   Gate: public import contract plus change/history/Yjs laws and benchmarks.
5. **Global/renderer product policy:** remove process-global UA truth, Plite
   product formatting commands/default hotkeys, and dead input-rule callback.
   Replacement: private C07/C08 owners plus C20/C21 feature routing. Gate: root-fact, input trace, IME,
   shortcut, and Markdown proof.
6. **Render/private projection owner debt:** remove table/list/void type-name
   regexes under C10; under C11 rename the private full-control
   `PliteProjectionStore` to `CompiledProjectionStore` and delete the
   duplicate private `PliteProjectionEntry` thin alias. Keep the public
   decoration, annotation, widget, projection-reader, dirtiness, and package
   export surfaces unchanged. Gate: preview markup and misleading-name
   behavior remain equivalent for C10; exact root/package export snapshot, focused typecheck, and
   unchanged projection/mapped-store/fault tests for C11.
7. **Structural-list old identity:** remove `@platejs/list-classic`,
   `ListPlugin` ambiguity, old routes/imports/docs, and every compatibility
   alias.
   Replacement: `@platejs/list-structural` and `StructuralListPlugin`. Packet:
   C24. Gate: lexical zero plus behavior/codec/package/release proof.
8. **Registry duplication:** remove raw string mutation calls, duplicated
   active/enabled selectors, and duplicate toolbar/turn-into catalogs.
   Replacement: C18/C19 feature updates and C22 explicit JSX. Gate: toolbar, shortcut,
   programmatic, focus, and visual parity.
9. **Color control debt:** remove open-time document scan and 100 ms focus
   timer.
   Replacement: C25 ordinary color/recent props and framework focus.
   Gate: 5,000-block no-traversal plus accessibility/focus/undo proof.
10. **False product/proof claims:** remove static collaboration example, null
    cursor overlay, nonexistent soak command claim, and v3 history claims.
    Replacement: C13/C16/C17. Gate: executable examples/contracts and browser
    artifacts.

### Adoption impact

The 33 canonical outcomes touch **23 adoption buckets**, including downstream
callers:

1. `packages/plite`
2. `packages/plite-history`
3. `packages/yjs`
4. `packages/plite-dom`
5. `packages/plite-react`
6. `packages/plite-hyperscript`
7. `packages/browser`
8. `packages/core`
9. `packages/table`
10. `packages/basic-nodes`
11. `packages/basic-styles`
12. `packages/list`
13. the renamed structural-list package
14. `packages/link`
15. `packages/media`
16. caption/resizable media owners
17. `packages/markdown`
18. `packages/floating`
19. `apps/www` registry, kits, routes, and examples
20. `apps/plite` browser application
21. content docs and package READMEs
22. benchmark, package, release, and proof contracts
23. fixtures, values, DOCX/HTML integrations, AI table inputs, and typed
    downstream consumers

Impact by layer:

- Plite: broad public readonly type adoption; one public API removal
  (`ChangeSet`); internal module ownership changes; DOM/view runtime cleanup.
  C11 is explicitly private-only: no Plite React root/package export,
  Decoration/Annotation/Widget lane, Plate adapter, or downstream caller
  migrates.
- Plate: inferred feature updates plus inline codec declarations; breaking
  structural-list and table JSON names; broad product/registry adoption.
- Yjs: breaking removal of its public undo/redo surface and a large internal
  subsystem; transport semantics remain.
- Apps/docs: explicit toolbar, truthful collaboration, direction/color/table
  examples, and current-state documentation.
- Proof: new deterministic navigation, differential collaboration, table
  property/fuzz, codec round-trip, browser, accessibility, and performance
  rows; existing mature Plite proof remains authoritative.

### Deletion impact

The plan removes or privatizes **40 named responsibility families**. Count one
family once even when multiple files implement it.

| # | Delete/private family | Replacement | Packet | Hard gate |
|---:|---|---|---|---|
| 1 | Mutable publication on existing document/location/snapshot values | Existing `Value`, `EditorDocumentValue`, `InitialValue`, location, snapshot, commit, and slice names become readonly | C01 | No mutable exported publication type, second input taxonomy, or direct state-node write |
| 2 | Root `ChangeSet` export and public docs | `DocumentChange` | C02 | Public import contract rejects `ChangeSet` |
| 3 | Public `ChangeSet.sections`, `.data`, `.fromSections` | Private root-change bridge | C02 | Zero non-internal consumers; Yjs bridge passes |
| 4 | Monolithic duplicate change definitions after module move | Private `core/change/*` owners | C02 | One definition per moved symbol; package graph green |
| 5 | Fit-only helpers/state in `editor-schema.ts` | Compiled fitter | C03 | Only delegation remains; fit laws/benchmarks green |
| 6 | Plate fragment-array parser API | Inline MIME-keyed plugin codec `decode` | C04 | Every parser consumer migrated |
| 7 | `parsers.*.serializer` declarations | Inline plugin codec `encode` / `host.html` | C04/C05 | Zero old declarations/readers |
| 8 | Markdown manual host-codec registration | Inline Markdown plugin codec | C04 | One registration; parse/copy/browser proof |
| 9 | Forced `ContentSlice.closed` parser wrapper | Exact codec-returned slice | C04 | Open-slice round-trip proof |
| 10 | Implicit reverse-order HTML registry/runtime | Compiled claims/order | C05 | Equal conflicts diagnosed; all HTML plugins migrated |
| 11 | Stale history v3 prose/error | Exact v4 owner truth | C13 | Codec/docs contracts |
| 12 | Public `tx.yjs.undo/redo` | Normal `editor.update.history.undo/redo`; `tx.history.*` only for atomic composition | C15 | C14 accepted; public surface/type proof |
| 13 | Controller `Y.UndoManager`, origin, pending repair | Normal replay commit lowering | C15 | C14 all-state equivalence |
| 14 | `undo-manager-adapter` private-stack access | Plite history | C15 | Zero references; package tests |
| 15 | `split-history.ts` | Canonical inverse/rebase laws | C15 | Structural collaborative scenarios pass |
| 16 | `split-history-adapter.ts` | Normal history/Yjs bridge | C15 | Differential and browser proof |
| 17 | Split-repair-only attributes, markers, helpers | Canonical document/change semantics | C15 | Source graph proves no non-history owner |
| 18 | Exact Yjs pin justified by private stacks | Normal dependency policy | C15 | Public Yjs APIs only |
| 19 | Split-history-specific tests/docs/API examples | Seeded canonical collaboration laws | C15/C17 | Retained behavior rows pass |
| 20 | Static collaboration example | Real provider-backed example | C16 | Two-peer product browser proof |
| 21 | Null remote-cursor overlay | Existing Yjs React cursor geometry | C16 | Visible pixels, cleanup, no console errors |
| 22 | Nonexistent production-soak claim | Executable registered soak or honest proof list | C17 | Package contract checks owner truth |
| 23 | Raw registry string-key mutation calls | Feature plugin updates and typed hooks | C19 | UI/shortcut/programmatic same change |
| 24 | Duplicated control active/enabled selectors | Feature-owned toolbar hooks/selectors | C19 | Selector/focus tests |
| 25 | Duplicate toolbar/turn-into catalogs | Colocated explicit JSX | C22 | Order/visual/a11y parity |
| 26 | Open-time full-document color scan | Ordinary `colors` plus optional controlled recent props; host computes document colors | C25 | 5,000-block no-traversal assertion |
| 27 | 100 ms color focus timer | Framework close-focus callback | C25 | Browser focus proof |
| 28 | `list-classic` package/import/route/component names | `list-structural` | C24 | Old-name lexical zero |
| 29 | Structural-package `ListPlugin` ambiguity | `StructuralListPlugin` | C24 | Package API/type proof |
| 30 | Persisted `attributes.colspan/rowspan` | `colSpan`/`rowSpan`; HTML codec translation | C27 | JSON/HTML round trips and zero old fields |
| 31 | Table index/adjacent/grid/merge-grid/find cache owners | `TableGrid` | C27 | One compiler and zero old helper reads |
| 32 | Table selection query/result caches | `TableSelectionView` | C29 | All selection geometry grid-derived |
| 33 | Whole-table repair clone path | Focused mutation/correction plan | C28 | Idempotence/convergence and locality |
| 34 | Repeated occupied/anchor matrices and external span arithmetic | `TableMutationPlan` | C28/C30 | One geometry owner; property/fuzz laws |
| 35 | Legacy table paste/drop/format bypasses | `PreparedTablePaste` | C30 | Every ingress produces one prepared source |
| 36 | Plite product format/block/mark commands and default bold/italic hotkeys | Private host decisions plus Plate plugin updates/justified commands | C08/C20 | Product parity and no public generic leakage |
| 37 | Dead `ApplyInputRules` callback/false installation | One command-middleware text path | C21 | IME/text/input-rule once-only proof |
| 38 | Table/list/void type-name preview regexes and semantic data attribute | No replacement, or one neutral private marker if an exact consumer requires it | C10 | Classifier/caller zero plus unchanged preview/render/coverage proof |
| 39 | Private full-control `PliteProjectionStore` name plus duplicate private `PliteProjectionEntry` thin alias | `CompiledProjectionStore` plus canonical internal `PliteProjectionSlice`; public read-store/entry types remain | C11 | Root and package export snapshots unchanged; internal typecheck and projection/mapped/fault contracts green |
| 40 | Process-global UA/version truth | Private per-root semantic facts | C07 | No public profile plus iframe/shadow/two-window/SSR injection proof |

No current code is deleted for Wordgard phrases, state classes, `TextblockMap`,
or bidi engine because those owners do not exist locally. Their deletion result
is an explicit non-adoption rule.

### Risk and proof matrix

| Change family | Primary risk | Required proof | Browser / platform | Performance / memory | Stop or rollback condition |
|---|---|---|---|---|---|
| C01 readonly publication | Massive type fallout or hidden runtime copy | Type inference corpus, mutation rejection, freeze/alias, history/Yjs round trips | Focused editing/clipboard smoke | N/A unless runtime cloning is introduced | Any consumer must mutate published state |
| C02 change kernel | Circular imports or changed algebra/persistence | Change laws, public surface, history persistence, Yjs bridge | N/A for pure module split | Existing change/history benchmarks | Any JSON/algebra/benchmark divergence |
| C03 fitter | Hidden schema closure dependency or changed repair order | Slice/schema/generated laws, revision invalidation, history/Yjs replay | Clipboard/browser fit rows | Fit/locality/correction benchmarks | Any output or locality regression without accepted semantic reason |
| C04/C05 codecs | Claim conflict, open-depth loss, mark composition regression | Type inference, conflicts/order, strict round trips, Markdown/HTML/model tests | Copy/paste across inline/block/table/code/multi-root; native Chrome only for platform transfer facts | Large payload and allocation gates | Dual registry or ambiguous equal-priority claim remains |
| C06/C07 DOM runtime | Root task/observer leak or wrong realm truth | Root lifecycle, scheduler, mutation repair, private fact injection, SSR | iframe, shadow, multi-root, root replacement | No new retained root/task state | Trace/owner divergence, exported profile, or work surviving destroy |
| C08/C20/C21 input | Double commit, broken IME undo, changed shortcut precedence | Generated event permutations, trace equality, command once-only, shortcut conflicts | Chromium focused IME/shortcut; browser matrix for release claims; raw devices only with Appium artifacts | One listener/dispatcher per root | More than one command/history unit or event-owner drift |
| C10 preview classifier | Hidden dependency on the semantic preview attribute | Focused caller audit, placeholder markup/a11y, misleading-name behavior | Staged-placeholder preview only | No added scan or render wake | Any actual render/coverage/selection effect requires a new source-backed decision |
| C11 private projection owner | Accidental rename of the public read-store type, root export drift, or runtime edit sneaks into a naming packet | Exact root/package export snapshot; internal typecheck; existing projection, mapped-store, source-fault, decoration, annotation, and widget contracts unchanged | N/A: no public or host behavior change | N/A: emitted runtime and metrics behavior must remain unchanged | Any root export/d.ts delta beyond private names, downstream migration, runtime diff, or changed projection result rolls back C11 |
| C12/C23 navigation/direction | Browser bidi policy mistaken for model law | Deterministic word cases, logical movement, HTML direction round trips | Native caret in LTR/RTL across Chromium/Firefox/WebKit | No model bidi scan | Exact platform-specific sequence required where engines differ |
| C13 history truth | Docs/error no longer match runtime | Codec, README, docs contracts | N/A: runtime behavior unchanged | N/A | Runtime version not actually v4 |
| C14/C15 history cut | Lost local intention under offline/concurrent structure | Seeded differential documents, Yjs projection, selections, effects, depths, reconnect | Two-peer undo/redo browser proof | Existing event-bridge budget | Any minimized Plite-only mismatch blocks deletion |
| C16/C17 collaboration | Demo-only proof, leaked provider state, false soak | Provider/schema/awareness/effect package laws and registered artifacts | Two peers, cursor, disconnect/reconnect, schema rejection/recovery | 10k bridge benchmark plus registered soak if claimed | Provider/listener leak or unexecutable claimed proof |
| C18/C19 feature updates | Migration invents a second dispatcher or forces ordinary behavior through commands | Inferred input types, one commit, same `DocumentChange` across callers, command-necessity negative checks | Mounted-root/focus/read-only/browser controls | No second index/dispatcher | Any Action registry/state algebra or unjustified mandatory command appears |
| C22 toolbar JSX | Colocation changes order, overflow, or feature absence | Component order/overflow/feature-absence assertions | Keyboard, names, focus, desktop/mobile captures | Existing component subscriptions only | Data DSL/renderer or package auto-placement appears |
| C24 list rename | Broad breaking-release fallout | Package/source-first tests, codecs, docs/install links, lexical zero | Existing list demos only; no new host claim | N/A: behavior-neutral | Any alias tail or behavior rewrite enters packet |
| C25 color | Focus/selection regression or hidden global state | Ordinary/controlled prop semantics, set/clear undo, ARIA grid | Browser focus/keyboard/screen reader | 5,000-block no traversal | Picker traverses document, timer returns, or package store appears |
| C26 UI ownership | Policy leaks into Plite during cleanup | Public-surface negative assertions and source audit | Existing product rows | N/A | New generic panel/menu/dialog/theme API appears |
| C27–C31 tables | Geometry corruption, ID loss, non-atomic repair, cache retention | Model/property/fuzz, correction convergence, inverse laws, codec/history/Yjs | Pointer/keyboard/IME/a11y/copy/paste/drop/resize matrix | Hot/cold grid, retained memory, sparse/dense and large-paste budgets | Second geometry owner, partial publication, or dual JSON format |
| C32 closure | Green local slices but stale owner truth | All focused gates, source searches, manifest reconciliation, release contracts | Browser matrix only for claims that need it | Only packet-specific registered thresholds | Any unresolved reference, manifest gap, false docs, or missing artifact |

### Final handoff answers

#### 1. What Wordgard is fundamentally better at

Local cohesion and legibility. Its strongest examples are one `TableMap` plus
problem list, explicit rule/keymap ordering, a recognizable fitter, compact
change/history algorithms, and tightly grouped behavior tests. Those are real
advantages and directly motivate C03, C05, C20, C27–C30, and C12/C14 proof.

#### 2. What Plite is fundamentally better at

Structural JSON, multiple roots, canonical immutable transaction publication,
compiled schema identity/reconfiguration, exact slices, one rich change
algebra, root-aware selection, runtime IDs, history persistence, collaboration
adapters, DOM/input ownership, host codecs, browser proof, and large-document
locality. Wordgard has no credible replacement for that substrate.

#### 3. What Plate is fundamentally better at

Product breadth and host adoption: typed plugin schemas, blocks/marks, two list
models, links, media/upload/caption/resize, table sizing and UI, input rules,
React components, registry kits, parsers/renderers, accessibility primitives,
examples, and docs. Its defects are duplicated ownership and inconsistent
entry points, not missing product capability.

#### 4. What only appears better because Wordgard is narrower

Its smaller document/state/view code omits multi-root state, structural JSON
persistence, transactional schema revisions, durable history/effects,
provider/schema/awareness/shared-effect collaboration, partial DOM,
virtualization, shadow roots, React ownership, rich tables, release contracts,
benchmarks, and broad browser proof. Concision bought by omitting those jobs is
not architectural superiority.

#### 5. Complete architecture-value ranking

The complete ranking is the 31-row table above. C27, C15, C04, C05, C07, and
C30 lead. C09 and C33 are resolved no-execution outcomes.

#### 6. Dependency-ordered execution backlog

The six-wave backlog above is authoritative. Proof warrants and foundations
land before destructive cuts or broad Plate adoption; all claims end at C32.

#### 7. Every Plite Plan packet

All 19 Plite-routed aliases/halves are enumerated in “Every Plite Plan packet” and map
to C01–C15, C17, C21, C29–C30, or C32 without an unresolved route.

#### 8. Every Plate Plan packet

All 19 Plate-routed aliases/halves are enumerated in “Every Plate Plan packet”
and map to C04–C05, C16–C26, and C27–C32.

#### 9. Every linked cross-owner packet chain

All ten chains are enumerated above: readonly adoption; change/fitter/codec
ingress; DOM input/product behavior; preview-classifier deletion; private
projection ownership plus independent product UI audit; navigation/direction;
one history owner; feature updates; tables; final closure. C10 and C11 have no
cross-owner adoption.

#### 10. Largest hard cuts

The ten largest cuts are listed above. The biggest are the Yjs history
subsystem, Plate table projection/cache duplication, Plate parser/serializer
duplication, public `ChangeSet`, and renderer/global product policy.

#### 11. Final proposed public architecture

Readonly existing Plite value types; `ContentSlice`; sole public
`DocumentChange`; direct Plite history API; Yjs transport without undo; Plate
feature updates and inline codecs; explicit app JSX; canonical table JSON.
Plite React keeps its existing distinct Decoration, Annotation, Widget,
projection-reader, source-dirtiness, and hook surfaces; no universal overlay
facade is introduced.

#### 12. Final proposed internal architecture

Private change kernel; revision-bound fitter; per-root DOM runtime, realm facts,
and composition epoch; existing React runtime-ID rendering with the preview
classifier deleted; a private `CompiledProjectionStore` over the existing
mapped index and source fault boundary; compiled Plate schema/updates/codecs/
shortcuts; private `TableGrid` → selection/mutation/paste; canonical history
replay through Yjs.

#### 13. Total adoption and deletion impact

- 181 scored concepts collapse into 10 ownership systems.
- 36 source packet aliases comprise one completed planning ledger and 35 future
  aliases; those future aliases collapse into 31 executable packets plus 2
  resolved no-execution outcomes.
- 23 adoption buckets, including downstream consumers, adopt the target.
- 40 named responsibility families are removed or privatized.
- The public breaking surfaces are readonly publication types, public
  `ChangeSet`, Plate parser/HTML codec APIs, Yjs undo/redo, structural-list
  package/plugin names, and table span JSON fields.

#### 14. Why no useful Wordgard mechanism remains unaccounted for

Every lane report maps its assigned Wordgard files, public exports, meaningful
private mechanisms, tests, and proof families to scored concept IDs. META maps
the package/build/demo/generator/browser owners, the absence of donor
performance proof, and exact exclusion reasons for legal, historical, binary,
and release-only files. The
181 rows then collapse into the ten systems above, and every change-worthy
idea maps to one of the 33 canonical outcomes with an owner, dependencies,
adoption, deletion, proof, risk, and stop gate. The remaining donor mechanisms
are explicitly surpassed, rejected, or gated. The final mechanical manifest
reconciliation records zero unmapped exports, private mechanisms, and routes.
