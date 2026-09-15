# Plate core design and adoption plan

Date: 2026-09-12. Status: complete. Scope: ledger group `plate-core`,
questions `plate-api` and `distribution`. Authority: the user subsequently
requested `$task design plan`, then `go $task`; local implementation and proof
are authorized. Publication remains outside this request. The completed
assessment below remains historical evidence.

Objective:

Give each installed capability one registry owner and one ordinary lookup,
`editor.extension(Descriptor)`. Remove `editor.plugin`, `tx.plugin`, duplicated
Plate installation maps, the redundant `useEditorPlugin` lookup hook and public
`getCorePlugins` construction exports. Preserve inferred authoring, product
stores/schema/rendering and independent package/feature entrypoints.

The [design contract](artifacts/plate-core-api-review/design-contract.md) owns
the selected calls, identity law, lifetime rules, structural alternatives and
module changes. It is part of this plan. The previous review remains below.

## September 14 transaction-access correction

Later registry adoption exposed one false cut in this completed plan. Direct
transaction groups are the best API when a transaction type carries the closed
editor graph, but copied registry components and reusable package callbacks do
not own that graph. Making those callers reconstruct an application-wide union
in `editor-transaction.ts` was worse than descriptor-scoped access.

The corrected target keeps `editor.plugin(Plugin)` as Plate's imperative
product lookup and restores `tx.plugin(Plugin)` as a transaction-bound lookup
through Plite's existing installed descriptor registry. It opens no nested
update and creates no second installation map. Generated application types
continue to expose direct named groups; reusable callbacks use the descriptor
portal, and runtime name strings remain invalid. The historical objective,
checklist and receipts below describe the September 12 implementation and are
superseded only where they require deleting `tx.plugin`.

## Plan state

Primary template: `docs/plans/templates/plite-plan.md`, adapted in this existing
plan because installed capability ownership is the first unresolved substrate
decision. Task retains lifecycle; Best API owns public shape; Plite Plan owns
registry adoption; Plate Plan owns product integration. No second lifecycle.

Planning and authorized local execution are complete. The selected runtime law,
generic enforcement, candidate integration, browser behavior and package
adoption have source-matched evidence. Publication remains outside this task.

Git branch checked: `next`; Autoreview invocation count: 0, not run under branch
policy. The unrelated blocked large-documents native goal remains unchanged.
Its objective cannot be overwritten or falsely completed to start this distinct
task; the existing file plan retains all planning obligations under Autogoal's
conflict protocol.

Completion threshold:

Completion requires a selected public contract, resolved identity and ownership
laws, a paired executable probe, negative type/runtime cases, all seven adoption
slices, doctrine and generated-output adoption, and final source-matched
verification. These are complete; the repository-wide aggregate limitation is
recorded separately from the passing Plate-core proof.

Verification surface:

Planning proof used the actual Plate transaction path, a candidate
reference-index model, source-first declarations and a source-fingerprinted
adoption census. Execution reran the frozen contract on production owners and
added package, browser, release and generated-output proof. The planning
prototype is retained as design evidence rather than substituted for production.

Constraints:

This is the completed local execution authorized by `go $task`; publication is
not authorized. Independent features remain separate: math, emoji and other
feature consumers received only the common lookup migration. Source callback
inference is preserved without caller casts or parameter annotations.

Boundaries:

In scope: Plate-core installed references/portals, their raw registry owner,
relevant author identity/type rules, consumer migration and construction exports.
Out of scope: feature redesigns, wholesale Base/React factory consolidation,
schema/selector protocol replacement, new runtime stores, packages or public
alias machinery, release/push/PR and the separate large-document objective.

Blocked condition:

No Plate-core blocker remains. Raw Android/iOS device and IME behavior was not
claimed because this API migration does not change native input or DOM presence.
The repository aggregate remains red on 29 concurrent authored/playground app
tests; the exact unrelated failures are preserved in the execution receipt.

Work Checklist:

- [x] Reconstruct prior assessment, active scope and current source owners.
- [x] Compare four structural alternatives and select the strongest justified cut.
- [x] Resolve configured reference, ancestry, sibling rejection, schema identity,
  optional presence, candidate rollback, roots and portal invalidation laws.
- [x] Freeze cohorts, budgets and correctness requirements before measurement.
- [x] Run the paired transaction and reference-index prototypes; preserve results.
- [x] Compile positive/negative portal and direct transaction signature cases.
- [x] Map all affected owner/caller/teaching classes and order adoption/proof.
- [x] Reconcile skill obligations, decision evidence and final planning boundaries.
- [x] Enforce descriptor-compatible ancestry and nominal lookup contracts.
- [x] Make Plite's descriptor registry the only installed authority and project
  Plate product capabilities through the unified portal.
- [x] Migrate current consumers to `editor.extension(Descriptor)` and direct
  transaction groups; delete `editor.plugin`, `tx.plugin` and `useEditorPlugin`.
- [x] Hide core-construction exports and prove independent package boundaries.
- [x] Migrate current docs, registry output, Vision and doctrine; preserve
  immutable migration history.
- [x] Complete package, type, browser, performance, ledger and final-source proof.

| Required design obligation | Source | State / evidence |
| --- | --- | --- |
| Start with jobs/hard laws; test delete, merge, inline, reuse and full replacement | Best API; Redesign from First Principles; current scoped Vision | Complete: design contract's alternatives and job table |
| Compare at least two structural designs, typed calls and invalid calls | Architect; Arena; Poteto multi-phase-plan | Complete: four structural choices and signature proof; main-agent comparison, no independent judge claim |
| Freeze scale/correctness contract before paired runtime prototype | Benchmark methodology, embedded architecture probe | Complete: `probe-contract.json`, paired packets and reference results |
| Trace exact installation, configured family, candidate rollback, schema and portal lifetimes | Plite Plan; Best API authoring/schema rules | Complete: design contract and 11 reference-model guards; production proof explicitly assigned |
| Plan complete consumer, package, docs and doctrine adoption with no compatibility owner | Task workflow; Best API doctrine repair; Plate Plan | Complete: census and slices below |
| Preserve evidence and append decisions in one log | Show Me Your Work | `artifacts/plate-core-api-review/design-decisions.tsv` |
| Inspect final plan, reconcile requirements, validate links and evidence freshness | Task; Technical Writing; Autogoal checklist retention | Complete: planning closeout receipt |

Method sources are `.agents/skills/{task,best-api,plite-plan,plate-plan,architect,
arena,poteto-mode,benchmark,show-me-your-work,technical-writing,autogoal}/SKILL.md`
and their applicable references read during this task. The primary Task source
is `.agents/rules/task/references/workflow.md`. Best API's inference/schema
rules and Benchmark's full methodology governed target selection.

## Execution slices

Start Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt and authority | yes, planning | Objective, constraints and boundaries above |
| Current owners | yes | Source investigation and linked design contract |
| Best API target | yes | Four structural alternatives; one selected owner |
| Runtime scale | yes | Plugin/reference count, ancestry, document size and view lifetime |
| Embedded probe | yes | Frozen contract, actual transaction intervention and reference-index model |
| Mode | standard planning with focused prototypes | No production implementation or publication |

Completion Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Binary readiness | yes | Selected contract and ordered implementation slices |
| Fresh source | yes | Closeout checks measured input hashes and census |
| Semantic public-shape review | yes | Design comparison; sibling counterexample resolved in target; full generic integration is slice 1 |
| Pre-acceptance scale proof | yes | Paired transaction result and reference-index algorithm guards |
| Production rerun | yes | Final production owners pass the frozen reference and transaction contracts in slice 7 |
| Conditional risk/adoption | yes | Root/candidate/type/browser/distribution gates in proof matrix |
| Verification/handoff | yes | `execution-verification.json`, ledger adoption/proof and this completed plan |
| Autoreview | no | Branch is `next`; zero invocations under Task policy |
| Plan checker | yes | Planning closeout receipt records successful structural check |

Phase / pass table:

| Phase | Status | Evidence |
| --- | --- | --- |
| Source and hard-law investigation | complete | Prior assessment plus current source traces |
| Structural design and signatures | complete | Design contract and type prototype |
| Runtime falsification | complete | Frozen contract and paired probe receipts |
| Adoption and planning handoff | complete | Ordered slices, census and closeout receipt |

## Implementation order

All slices are complete in this checkout. No temporary public compatibility API
or second installed registry remains.

| Order / owner | Change | Status / evidence |
| --- | --- | --- |
| 1 — Best API + Plate author types | Enforce capability-preserving ancestry in Base/React `.extend`, native adoption and conversion; infer the unified portal from the existing normalized definition/provider. Add raw presence and nominal-only lookup. | Complete: positive/negative type contracts, configured ancestor access, sibling/foreign rejection and inferred callback contracts pass. |
| 2 — Plite Plan | Add compiled source associations to candidate records and index them by descriptor. Update ordinary and candidate portal guards, availability and replacement/removal handling. | Complete: raw portal, candidate rollback, reinstall, failed activation, root and two-runtime contracts pass. |
| 3 — Plate Plan | Lower descriptor ancestry into that index and build the enriched consumer portal from canonical installation plus the Plate product model. | Complete: author/context/native-adoption/default-core, staged construction, optional store and compiler-detachment tests pass. |
| 4 — Task + Plate UI owners | Migrate consumers, remove `useEditorPlugin`, route store hooks through the surviving portal, replace `tx.plugin(P)` with direct groups and remove duplicate lookup maps. | Complete: current source has zero `editor.plugin`, `tx.plugin`, `useEditorPlugin` or weak descriptor lookups; React/store/root and transaction contracts pass. |
| 5 — Distribution owner | Hide `getCorePlugins` and construction-only root exports; retain private defaults and the CLI nominal predicate. Regenerate barrels and release allowlists. | Complete: exact packed proof passes 4 packages, 86 subpaths, 81 Node imports and 42 optional-peer closures. |
| 6 — Plate Docs + doctrine owners | Migrate current teaching and examples; repair source rules/Vision, append Plate Next doctrine v186, regenerate mirrors and registry. | Complete: docs parity, registry generation, resource parity and doctrine validation pass. Immutable historical migration pages and package attestations remain unchanged. |
| 7 — Verify Plate + Benchmark | Rerun frozen cohorts on final production source, run package/browser proof and browser proof, reconcile ledger adoption/proof separately. | Complete: strict Plite/browser matrix, production probes and live Chrome proof pass; both ledger scopes are adopted/verified. |

Slice 1 rejects incompatible `.extend` overrides and does not register an
ancestor merely because its schema family matches. An incompatible contract is
a new independent descriptor. Existing app-owned same-name replacement
selection stays in the product graph, before reference registration.

## Adoption inventory

[adoption-census.json](artifacts/plate-core-api-review/adoption-census.json)
records 425 files: 2,104 lexical `.plugin(...)` occurrences, including 82 explicit
`tx.plugin(...)` calls, 114 `useEditorPlugin` references and 45 core-construction
symbol references. Counts overlap and are lexical, not promises of 2,104 edits.
The census covers package source/tests, authored registry, `content/docs`, scoped
Vision and rule sources. Generated templates/registry output are derivative.

Important consumer classes: headless Base plugins; React adapters; live/static
EditorKit composition; schema/codecs and property aliases; feature controls and
optional navigation; state subscription hooks; raw extension adoption; CLI
generation/migration validation; compile-only consumers; docs/snippets. Keep
immutable review records, version history and historical plan prose intact.

Source families include `withPlite.ts`, `resolvePlugins.ts`, `compilePlateModel.ts`,
`createPluginContext.internal.ts` (Base and React), `mergePlugins.ts`, author
constructors, `BasePlugin.ts`, `PlatePlugin.ts`, `Editor.ts`,
`pluginRuntimeTypes.ts`, compiler witnesses, Plite editor interfaces and registry
publication. The design contract assigns each change to its exact owner.

## Proof matrix for execution

| Surface | Required proof / command lane |
| --- | --- |
| Author/inference | `pnpm --filter platejs typecheck:contracts`; existing Base/Plate type fixtures plus new positive/negative lineage and unified portal cases. Source-first declarations must remain finite and do not expose compiler witnesses. |
| Product runtime | Existing `defineBasePlugin`, `createPluginContext.internal`, `pluginAuthoringContext`, `definePlatePlugin`, `toPlatePlugin` tests, plus the unified optional lookup/store-hook owner tests. No test that merely asserts an old symbol is absent. |
| Neutral runtime | Focused extension-registry, candidate/lifecycle, extension slots, schema identity, view/root, history and transaction tests first. `pnpm check:plite:dev` for iteration; `pnpm check:plite` and `pnpm check:plite:browser-matrix` for final architecture closure. |
| Plate packages | `pnpm turbo typecheck --filter=./packages/platejs --filter=./packages/plitejs`; relevant package tests then final `pnpm check` for this broad public-API migration. Use the affected owner graph during iteration. |
| Public distribution | `pnpm plite:release:packages` on fresh artifacts; exact facade allowlists, declaration brands, static/compiler and every affected optional subpath. Building is appropriate here because the claim is packed artifacts. |
| Browser | Existing `playground-demo` via `/blocks/playground-demo`: heading and mark commands, optional plugin/store controls, type/paste/undo, selection and two-editor independence. Add a focused native-extension adoption/root fixture in existing proof owners if the route cannot express it. Verify the serving checkout and actual available Browser/Chrome controls. |
| Native behavior limits | No DOM-presence or input-engine design change. Chromium/Firefox/WebKit desktop and viewport proof cover migration regressions; raw Android/iOS/IME claims require actual device/OS capability and are not inferred from viewport emulation. |
| Performance | Rerun the frozen transaction and reference contract on production paths; the disposable preload is removed from final proof. Count zero per-update plugin-map visits, constant reference reads, linear registration, allocations and retained entries per descriptor/view. Add lifecycle/root cases to correctness guards. |
| Generated/teaching | `pnpm brl` after export/public-file edits; `pnpm install` after source-rule changes; `pnpm --filter www build:registry` after registry source changes on `next`; Plate Docs' relevant snippet/link proof; ledger refresh/render/check after actual adoption. |

Do not run every broad lane at each slice. Reuse proof whose effective inputs
remain unchanged, and rerun changed owners before closure.

## Doctrine repair

Execution repaired `.agents/rules/best-api.mdc` and its schema/inference
references, plus the relevant Plate UI, Plate Plugin Creator, Plate/Plite Plan, Plate
Docs and Plate Next owners. Current teaching uses one installed registry,
distinct schema/capability identity, compatible ancestry and direct transaction
groups. `docs/vision/plate.md` and `docs/vision/plite.md` carry the same law.

Plate Next doctrine version 186 was appended without rewriting older versions
or pre-attesting packages. `pnpm install`, version validation and generated
resource parity passed. This is a product-contract repair; it did not create a
new general workflow.

## Scale contract and evidence

[Frozen contract](artifacts/plate-core-api-review/probe-contract.json),
[transaction packets](artifacts/plate-core-api-review/transaction-probe-result.json)
and [reference-index results](artifacts/plate-core-api-review/reference-probe-result.json).
The independent axes are installed plugin count, document block count, reference
ancestry depth and editor/view lifetime. Reference closure is iterated at
candidate construction, never at each lookup or update. No global family cache
or document-size-dependent reference index is added.

The transaction comparison used five interleaved process pairs, 25 warmups and
100 measured updates per cohort/packet, same Bun source-first runtime and
fingerprinted effective source. Each packet verified the exact resulting
document. Times are medians of packet medians, in milliseconds per update:

| Cohort | Baseline | Disposable deletion | Plugin-map visits per update |
| --- | ---: | ---: | ---: |
| 8 plugins, 1 block | 0.527 | 0.473 | 18 → 0 |
| 64 plugins, 1 block | 0.608 | 0.572 | 74 → 0 |
| 256 plugins, 1 block | 1.199 | 1.115 | 266 → 0 |
| 8 plugins, 1,000 blocks | 0.758 | 0.703 | 18 → 0 |

All four passed the predeclared timing/noise rule and correctness guards.
This proves the disputed transaction-map deletion is viable; it is not a
browser speed claim. The candidate still pays the other existing transaction
costs, which also grow with plugin count.

The reference probe used real compiled records at 8/64/256/1,024 plugins and an
iterative 256-stage synthetic ancestry. It proved one reference-index read,
linear reference registration, configured/ancestor access, sibling/foreign
rejection, native adoption, optional presence, rollback, stale portal rejection,
unrelated publication survival and two-editor separation. Its timing is
diagnostic: the selected budget for this isolated algorithm is deterministic
work and correctness, not a claim about final construction throughput.

Performance review: applied. Repeated units are plugins/references and portals,
not DOM blocks. No Vercel tactic, React primitive, scheduling or DOM degradation
is proposed. Production acceptance also counts live cache entries, stores and
subscriptions through creation/removal. Browser interaction percentiles, traces,
CWV and RUM are outside this local ownership claim; collect them only for a
later product speed claim. The embedded probe is not a full Benchmark audit.

## Interaction Coverage

- first-interaction: N/A — no browser responsiveness claim in planning.
- settled-interaction: pass — repeated programmatic update correctness in all
  transaction packets; this does not prove trusted input latency.
- route-scope: N/A — owner probes are headless; execution route is specified above.
- reporter-profile: N/A — no reporter browser or profile was supplied.

Verification evidence:

Commands executed from `/Users/zbeyens/git/plate-2`:

| Command | Observed planning result |
| --- | --- |
| `node docs/plans/artifacts/plate-core-api-review/run-probes.mjs` | Pass; 10 process packets, 4 cohorts, 4,000 measured updates with exact document checks. Captures runtime/host/source hashes and raw samples. |
| `bun --preload ./config/plite-source-aliases.ts docs/plans/artifacts/plate-core-api-review/reference-probe.ts` | Pass; 11 semantic guards and the reference-scale rows. Reproduces current same-family sibling lookup accepting an absent method. |
| `pnpm exec tsc -p docs/plans/artifacts/plate-core-api-review/tsconfig.portal-types.json --pretty false` | Pass, exit 0: source-first signature/declaration proof, including optional raw presence and nominal-only lookup. Complete production generic parity remains slice 1. |
| Planning closeout | `planning-closeout.json` records link/evidence freshness and plan structural validation. These do not prove product behavior. |

Harness setup failures were repaired before trusting results: used current
`selection.set`, corrected local module/lockfile paths and imported erased
compiler types from their actual private owners. No product code was changed
to accommodate a harness. Raw successful measurements remain in the receipts.

## Execution closure

Open risks:

- None for the locally authorized Plate-core contract and adoption target.
- The separate authored/playground work keeps the repository aggregate red;
  raw-device behavior and publication remain unclaimed boundaries.

[The execution receipt](artifacts/plate-core-api-review/execution-verification.json)
records final commands, counts, browser interaction and proof limits. The final
production reference probe passes one-index-read, linear-registration and
iterative-ancestry budgets. All transaction cohorts preserve exact document
correctness with zero plugin-map visits per update:

| Cohort | Final median | Baseline | Result |
| --- | ---: | ---: | --- |
| normal | 0.414 ms | 0.527 ms | pass |
| 64-plugin set | 0.490 ms | 0.608 ms | pass |
| 256-plugin set | 0.978 ms | 1.199 ms | pass |
| 1,000-block document | 0.629 ms | 0.758 ms | pass |

The exact `pnpm plite:release:packages` rerun passes runtime/declaration parity,
NodeNext and Bundler declarations, package direction, Node/SSR consumers, DCE,
entrypoint size budgets and every optional-peer closure. Plate's 130 package
test partitions, Plate/Plite typechecks, Plate type contracts, 100 focused raw
portal/synchronous-author tests and all 1,283 Plite React tests pass. The strict
Plite proof and five-project browser matrix passed before the final equivalent
lint/type repairs; production probes, focused owner tests, packed release and
live Chrome proof were rerun on final source.

The browser route loaded from `/Users/zbeyens/git/plate-2/apps/www`. Typing,
undo, redo, Heading 1 to Heading 2, bold and restoration passed. Chrome had no
localhost-origin console error. Browser-extension errors are excluded from the
application claim. Raw device/IME behavior is outside this API migration.

The repository aggregate cleared formatting, type-aware lint and all 94 package
typecheck tasks, then stopped on 29 `apps/www` failures owned by concurrent
native-authored/playground work. They cover authenticated-author fixtures, AI
lifecycle cleanup, removed playground suggestion fixtures and the authored
registry dependency expectation. None fails a Plate-core owner; the exact list
is retained in the execution receipt and `/tmp/plate-core-final-pnpm-test.log` during
this checkout session.

`registerEditorExtensionAlias` and `setEditorExtensionPortalAdapter` remain
`@internal` cross-package compiler bridges. They support root-scoped React view
identity and Plate portal enrichment, are excluded from public API reference
output, and do not create a second installed registry. Presence remains a
lookup snapshot, so callers reacquire a portal after absence or replacement.

Ledger refresh/render/check passes with 790 features, 3,638 files, 61 scopes
and 26 immutable review records. `plate-api` and `distribution` are separately
marked adopted and verified. Plate Next v186 and generated resource parity pass;
the package/test and platejs attestations remain stale for their own later full
Plate Next sync, as required by the no-pre-attestation rule.

Reboot status: implementation and local proof are complete. Publication,
commit, push, PR, release and package attestation remain outside this request.
Do not resume the unrelated native large-document goal or run Autoreview on
`next` from this plan.

## Historical assessment outcome

## Required outcome

Assess both questions from current jobs and hard laws. Compare keeping,
changing, adding, deleting/merging, moving ownership and replacing architecture.
Trace owners and materially different consumers; reconcile relevant earlier
decisions; give every selected question a verdict and one next owner.

The user keeps independent Plate features separate. This audit groups only the
framework contract and its distribution, without reviewing feature behavior.

## Obligations and evidence

- [x] Read prior ledger/history and verify source observations. Source:
  `.agents/skills/best-api-review/SKILL.md` and
  `.agents/rules/task/references/best-api-review.md`.
- [x] Review both questions and representative headless, React, static,
  optional-feature and tooling consumers. Expected questions: 2.
- [x] Compare the strongest hard cut with alternatives before the verdict.
  Source: `.agents/skills/best-api/SKILL.md`,
  `.agents/skills/principle-redesign-from-first-principles/SKILL.md`,
  `VISION.md`, and `docs/vision/common.md`.
- [x] Separate source facts, judgments and proof gaps. Any runtime redesign
  remains provisional without the required executable scale comparison.
- [x] Persist both immutable records, reconcile the current ledger, render and
  validate. Source: `docs/research/schema.md#review-history`.
- [x] Inspect final prose, source references, coverage counts and next-owner
  invocation. Source: `.agents/skills/technical-writing/SKILL.md`.

Task workflow and Poteto investigation apply. Throughput checkpoint: n/a,
read-only investigation. Autoreview is not run on `next`. No runtime or public
documentation changes are authorized; doctrine repair is reported if needed.

Autogoal was applied under the standing request. The native tool rejected a new
goal because this task retains the unfinished, blocked large-documents goal.
That objective and its completion state remain intact; this file retains the
review obligations. This does not block local assessment.

## Decision trail

- Ledger lookup: both questions are unassessed with no direct review records.
  Related Plite-core and facade/package plans are context, not inherited proof.
- Initial target independent of current names: one model/runtime authority,
  inferred framework authoring for product policy, app-owned composition and
  independently consumable dependency entrypoints. Retain additional owners
  only for a current job or hard law.
- Source trace: `createPlateRuntimeExtensions` creates installed extension
  identities and alias/family maps; `withPlite` wraps extension/schema/read/tx
  access; plugin contexts add product store and presentation jobs. Pursue the
  public identity/lookup design, without accepting an unmeasured runtime.
- Counterevidence: React paragraph adapters add shortcuts and React declarations
  carry view hooks/slots. No blanket removal of Base/React authoring or Plate
  product policy is justified. CLI consumers also justify nominal validation.
- Distribution: keep both distributions and independent dependency entrypoints;
  hide `getCorePlugins` and construction-only exports while preserving the same
  automatic defaults. No new package or preset is needed.
- Ledger recording first failed on stale current-source pointers. Reconciled
  the existing large-document docs rename and the independently changed
  suggestion owner/proof paths. Removed four absent suggestion census identities
  without changing its semantic review, adoption or proof status. See
  `artifacts/plate-core-api-review/inventory-reconciliation.json`.

## Result and proof

[Current decision](../research/decisions/plate-core-ownership.md): two expected
questions, two reviewed, zero excluded questions and zero unresolved verdicts.
Both verdicts are Pursue, with the identity contract ranked first. The seven
Plate API and eleven distribution census groups bind source observations; they
are not claims that every symbol or feature behavior was audited.

Commands ran from `/Users/zbeyens/git/plate-2`:

| Command | Observed result |
| --- | --- |
| `bun test packages/platejs/src/lib/plugin/defineBasePlugin.spec.ts packages/platejs/src/lib/plugin/createPluginContext.internal.spec.ts packages/platejs/src/lib/plugin/pluginAuthoringContext.spec.ts` | 38 passed, 0 failed |
| `bun test packages/platejs/src/react/plugin/definePlatePlugin.spec.ts packages/platejs/src/react/plugin/toPlatePlugin.spec.ts` | 18 passed, 0 failed |
| `node --test tooling/scripts/check-plite-release-artifacts.test.mjs` | 20 passed, 0 failed; fixture tests of the runner, not a packed checkout release |
| `node tooling/scripts/review-ledger.mjs record docs/plans/artifacts/plate-core-api-review/plate-api.json` | Recorded immutable initial assessment |
| `node tooling/scripts/review-ledger.mjs record docs/plans/artifacts/plate-core-api-review/distribution.json` | Recorded immutable initial assessment |
| `node tooling/scripts/review-ledger.mjs refresh` | Current source census refreshed; adoption/proof unchanged |
| `node tooling/scripts/review-ledger.mjs render` | Generated current ledger |
| `node tooling/scripts/review-ledger.mjs check` | Passed: 789 features, 3,636 files, 61 scopes, 26 records |

At assessment closeout, no public API, runtime or public teaching was changed. Full typecheck, fresh
packed consumers, browser/native parity, and performance were not proved.
Replacement runtime design remains provisional; the next owner must preserve
configured-family access, foreign-descriptor rejection, type inference, schema
identity and rollback, and run a paired scale comparison before adoption.
Required doctrine repair is documented in the current decision for that later
authorized work. The unrelated blocked large-document goal remains unfinished.

Next action recorded by the assessment (superseded by the design above):
`$best-api design plate-core: one installed capability identity and lookup; retain Plate product policy and truthful package boundaries`
