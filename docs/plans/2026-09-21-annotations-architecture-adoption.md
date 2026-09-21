---
review_scopes:
  - annotations
review_basis:
  - 2026-09-21-annotations-oss-validation
work_kind: implementation
---

# Annotations architecture adoption

Status: Complete

Objective:
Execute the accepted annotations architecture: make local `drop` terminal,
trim annotation stores to the capabilities each owner needs, bind React indexes
to exact mounted views, replace the mirrored comment demo with two views over
one model, and retain a private mapping kernel only after matched scale proof.

Flow mode:
agent-led implementation after accepted review

Goal plan:
`docs/plans/2026-09-21-annotations-architecture-adoption.md`

Template:
`docs/plans/templates/plite-plan.md`

Mode:

- `deep`: the public break crosses core anchors, Plite React, Plate Comments,
  examples, docs, doctrine and a scale-sensitive private index.

Completion threshold:

- Terminal local `drop` is consistent across ordinary and authored anchors,
  while `nearest` keeps exact local undo recovery.
- React callers receive a read/invalidation store only; headless owners retain
  explicit disposal; diagnostics stay internal; duplicate IDs fail as invalid
  input; explicit `refresh` recovers a corrected source.
- Each mounted view owns its own annotation index and paint adapter over one
  shared target/model, with no generic annotation provider or empty fallback.
- The comment-mode example uses one document model and two independent mounted
  views, with independent focus, focused-pane selection presentation and a
  read-only review pane.
- Retained anchors are allocated and released outside replayable React state
  updaters and survive Strict Mode ownership proof.
- A matched benchmark records the current kernel, private batch/collection
  prototypes and persistent-trie/simple-snapshot comparison. Production keeps
  the current kernel unless a candidate clears the frozen materiality gate.
- Focused package, browser, docs/export and ledger checks pass on final source.

Verification surface:

- Core anchor/history/authored contracts and the public deletion probe.
- Plite annotation, decoration and view-source React contracts plus type tests.
- Managed Chromium journeys for comment mode and persistent annotation anchors.
- Annotation mapping benchmark with retained artifacts and final-source rerun.
- Plite/Plate typechecks, package import smoke, generated barrels/registry where
  affected, docs source parity, workflow-source sync and review-ledger checks.

Constraints:

- `next` may break the API; no compatibility aliases, provider shim or dual
  signature.
- Keep external records, retained targets, exact-view indexes and decoration
  paint as separate owners.
- Keep scalar `anchor.resolve(view)` public. Private benchmark candidates do
  not create `resolveMany`, `RangeSet`, interval-tree or collection API.
- `drop` is a terminal local transient policy, not a convergent persisted CRDT
  target. `nearest` remains the Comments policy.
- Preserve one canonical model and separate mounted-view focus, read-only,
  projection, index and paint state. The model owns one active selection;
  inactive panes do not present it.
- Metrics and source-status diagnostics are private test/benchmark evidence.
- No commit, push, PR, release or external message is authorized.

Boundaries:

- In scope: core anchor deletion/recovery, annotation store/runtime and React
  readers, Plate facade/comments adoption, the two Plite examples and their
  browser contracts, public docs, Plite Vision, affected API workflow doctrine,
  package exports and a private benchmark target.
- Source owners: `packages/plitejs/src/core/anchor.ts`,
  `packages/plitejs/src/annotations/store.ts`, Plite React hooks, Plate Comments,
  app examples/docs, benchmark targets and project-owned rule sources.
- Non-goals: persisted collaborative exact-absence state, public batched anchor
  APIs, merging decorations into annotations, generic widgets/overlays, or
  redesigning Comments records and actions already settled by their review.
- Direct Plate/collaboration adoption owners: Plate Comments consumes the
  headless owned store; collaboration keeps scalar native anchors and gains no
  new persisted deletion guarantee.

Output budget strategy:

- Work owner by owner, retain benchmark/browser evidence under
  `docs/plans/artifacts/annotations-architecture-adoption/`, and summarize only
  decisive results here.

Blocked condition:

- Only an unexecutable final-source correctness/browser/benchmark owner, a
  missing required capability, or a source contradiction that changes the
  accepted target can block completion. A slow or losing prototype is a valid
  benchmark result and does not block the baseline architecture.

Plite Plan state:

- phase: complete
- next: none
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | pass | Accepted review plus explicit `go`; active goal preserves implementation and proof scope. |
| Task plan and execution authority verified | pass | User authorized execution after the final OSS validation. |
| Current owners read | pass | Core anchor, authored binding, annotation store/hooks, Plate Comments, examples, tests, docs and workflow doctrine inspected on `next`. |
| Best API target resolved | pass | Review `2026-09-21-annotations-oss-validation`: borrowed resolve-only targets, explicit-store readers, headless disposal, no provider/implicit empty state. |
| Runtime scale applicability resolved | pass | Exact-view store, changed-ID mapping, snapshot publication and mounted-view fan-out are hot repeated work. |
| Pre-acceptance Benchmark probe selected | pass | Frozen contract below; no new production kernel lands before a passing receipt. Current node-key routing remains the default baseline. |
| Mode and execution boundary resolved | pass | Deep implementation; no publication authority. |

Work Checklist:

- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports/behavior claims cite live source and the
      current annotations decision/review.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Scale-sensitive private candidates have matched executable evidence.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Canonical model and exact-view presentation are classified.
- [x] Public breaks and deletion answers cover callers, docs and proof.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional research is consumed from the accepted OSS audit; no second
      editor survey is required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Finish every slice and resolve benchmark candidate verdicts | pass: all slices complete; baseline retained and all private candidates rejected |
| Fresh source evidence | yes | Reinspect final owners/diff before broad replay | pass: final source/API/teaching sweep followed by strict closure |
| Best API review | yes | Confirm no provider, diagnostic leak, lifecycle leak or second model remains | pass: deleted-surface sweep is clean outside the negative type assertion |
| Pre-acceptance scale proof | yes | Run matched baseline/prototypes under the frozen contract | pass: 1/2/4 views and 1k/10k/100k dense/distributed cohorts |
| Production scale rerun contract | yes | Rerun the winning retained production path with identical cohorts and correctness guard | pass: baseline retained, zero promotions/failures, stable source |
| Conditional risk and adoption | yes | Close React lifetime, two-view browser, docs/doctrine and package boundaries | pass: focused contracts, real browser journeys, generated docs and strict package proof |
| Verification recorded | yes | Record exact final commands/results below | pass: `docs/plans/artifacts/annotations-architecture-adoption/verification.json` |
| Handoff prepared | yes | Summarize ownership, breaks, benchmark verdict and proof | pass: final handoff below |
| P1 autoreview | no | Forbidden on `next`; use source-based implementation review | N/A: current branch is `next` |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-21-annotations-architecture-adoption.md` | pass |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Governing review, decision, live owners and consumers reconciled | Done |
| Decide | complete | Public target locked; private kernel explicitly benchmark-gated | Done |
| Prove and execute | complete | All six slices adopted; strict package/browser and scale proof pass | Done |

Decision brief:

- outcome: one model, exact-view annotation indexes, separate paint and honest
  local deletion semantics.
- chosen shape: scalar borrowed targets; `AnnotationStore` read/invalidation
  capability; an owned headless store with explicit disposal; explicit store
  arguments in React readers; no generic provider.
- strongest rejected alternative: replace central node-key routing with a
  public mapped-range collection/interval tree and let annotations own paint.
- consequence: callers become simpler and lifecycle-safe; private performance
  machinery remains replaceable and must earn retention through evidence.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `drop` range deletion | Ordinary ranges collapse; authored ranges revive after undo | Once a locally available target resolves unavailable under `drop`, it stays unavailable; complete ordinary deletion drops immediately | Plite core/authored binding | One public policy cannot change with installed backend | Core/history/authored tests, saved/restore probe | Projection-specific temporary absence must not poison another view | rearchitect |
| `nearest` recovery | Exact local undo recovery | Keep, scoped to the owning local history | Plite core/history | Comments needs a surviving target | Existing and rerun history/Comments proof | Do not imply remote convergence | keep |
| Borrowed annotation target | Requires `resolve` and `release` | Requires `resolve(view)` only | `plitejs/annotations` | Index borrows identity and never releases it | Type contracts and caller sweep | None | cut |
| Store reader | Reads plus destroy/retry/status/metrics | Reads, subscriptions and explicit refresh only | `AnnotationStore` | React/domain readers do not own disposal or diagnostics | Type/public import smoke | Headless owners still require disposal | rearchitect |
| Headless owner | Same broad store | Owned store extends reader with `destroy` | `createAnnotationStore` | Plate Comments allocates outside React and must clean up | Comments tests/typecheck | Distinguish owner from borrowed reader | keep |
| Recovery | Separate `retry` and `refresh` | `refresh` reactivates a corrected source | Store owner | One explicit invalidation verb is sufficient | Fault-boundary contract | Commit-driven reads stay quarantined until explicit refresh | cut |
| Diagnostics | Public metrics/status | Internal test/benchmark accessor | Plite internal | No product caller; evidence still needs counters | Tests and benchmark harness | Avoid accidental public reexport | move |
| Duplicate IDs | Fault boundary can quarantine them | Synchronous invalid-input error before source resolution quarantine | Annotation input validation | IDs define identity and cannot be treated as a transient source fault | Focused contract | Lazy source invalidity may surface during refresh/commit | rearchitect |
| React provider | Untyped context and implicit empty fallback | Delete; hooks require the typed explicit store | Plite React | Context erases `TData` and missing ownership becomes silent empty state | Type contracts, examples, facade export smoke | Deep application UI may own a typed domain context | cut |
| React store lifetime | Hook exposes owner internals; examples release inside updater | Hook owns activation/disposal; returned runtime object has reader capabilities only; anchors released by explicit effects/events | Plite React and examples | Render/updater replay cannot own retained-resource mutation | Strict Mode and unmount tests | Commit-safe creation must stay inert before activation | rearchitect |
| Comment demo model | Two models, full JSON replacement, selection clearing and mirror anchors | One model, two mounted views and two exact-view indexes over shared anchors | Plite example | Same-document review is a view job | Managed browser journey | Focus and inactive-pane selection presentation must stay isolated | cut |
| Mapping/index kernel | Node-key candidates plus persistent byte trie | Keep baseline unless a private batch/collection or simpler snapshot wins materially | Plite internal | External precedent does not prove a better local owner | Frozen benchmark | Prototype must not leak into API | gate |
| Annotation paint | Store adapted to DecorationSource | Keep separate, deterministic and view-local | Feature/example + Decoration owner | Identity/index and paint have different contracts | Decoration tests/browser | Avoid second paint callback | keep |
| Workflow teaching | Best API, Plite Plan and Vision require provider | Teach explicit-store readers and exact-view ownership | Project rule/Vision owners | Shipping code against stale doctrine guarantees regression | install/sync/source audit | Preserve product-specific detail outside generic method | rearchitect |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Terminal local drop | Plite core/authored | Complete ordinary-range deletion, authored per-view observed terminal latch, saved range behavior | Accepted deletion policy | Ordinary/authored `drop` stay null through local undo/redo; `nearest` unchanged | Focused core/history/authored tests and deletion probe |
| 2. Minimal store API | Plite annotations/React | Resolve-only anchors, reader/owner split, refresh recovery, private metrics, duplicate validation, remove provider | Slice 1 green | Public exports/callers use only owned capabilities | React contracts, type contracts, fault boundary, package smoke |
| 3. Exact-view one-model adoption | Plite examples + Plate Comments | Move hooks inside mounted views; delete mirror model/value sync/selection clear/duplicate anchors | Slice 2 types green | Two panes share one model/target and retain independent mounted state | Comment/persistent browser journeys and Comments tests |
| 4. React ownership | Plite React/examples | Keep dormant hook commit-safe; remove anchor allocation/release from replayable updaters; explicit unmount cleanup | Slice 2 API stable | Strict Mode/unmount leaves no observers or retained anchors | Annotation React contract plus focused browser remount |
| 5. Private kernel benchmark | Benchmark owner | Baseline, private batch prototype, collection prototype, trie/simple snapshot across frozen cohorts | Correct public behavior green | Each candidate gets keep/reject result; only a passing material winner may enter production | Retained JSON artifact, exact command, correctness guard |
| 6. Teaching, generation and closure | Docs/Vision/workflow/Task | Current-only docs, doctrine repair, generated skills/barrels/registry, execution record and ledger reconciliation | Final production path selected | No rejected API remains in current teaching/exports; ledger reports adopted/proved result | Docs parity, `pnpm install`, sync checks, registry build, ledger checks, plan checker |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| `drop` is terminal and `nearest` recovers locally | Current four-cohort probe and source divergence | 107 core/history/authored cases plus broad core/Yjs replay | pass |
| Borrowed targets are resolve-only | Store implementation calls only `resolve` | Types, source sweep and packed import smoke | pass |
| React readers cannot destroy/retry/read diagnostics | Current hook returns broad headless interface | Type tests and runtime property assertion | pass |
| Missing/duplicate store input fails explicitly | Provider currently returns empty; duplicate IDs are quarantined | Hook/store contracts and corrected-source refresh | pass |
| One target resolves in two exact mounted views | Existing headless two-view contract | Migrated 8-case browser journey and exact-view store assertions | pass |
| React cleanup is replay-safe | Current abandoned-render test plus source hazard | Strict Mode/unmount contract and active-anchor assertion | pass |
| Local edits avoid global work where topology permits | Current 1k contract and central node-key routing | Frozen 1k/10k/100k benchmark and final-source rerun | pass: baseline retained |
| Docs and workflows teach the final API | Current contradictions enumerated | Generated mirrors, Plate Next v226, registry/docs/API-reference and source audit | pass |

Scale contract:

- applicability and source evidence: applies to anchor listeners, exact-view
  candidate refresh, stable-ID mapping, immutable snapshot publication,
  subscribers and decoration node buckets.
- user operation, current owner, proposed owner: annotation resolution after a
  local edit/structural change and activation; current owner is central
  changed-NodeKey routing plus `createStableIdMappedSource`; candidates remain
  private grouped resolution, chunked/interval membership and a simple immutable
  snapshot.
- independent scale variables and cohorts: 1/2/4 views; 1k/10k/100k
  annotations; dense in one text node and distributed over at least 1,000 text
  nodes. Operations: one-character local edit, full target deletion, structural
  move, metadata-only refresh, full activation, projection switch when authored,
  remount and unmount. Browser-only scroll/DOM commits use the largest practical
  rendered cohort and remain separate from the headless 100k ceiling.
- frozen absolute/relative budget and noise rule: correctness and deterministic
  work are mandatory. A new kernel is retained only if interleaved packets show
  at least 20% p95 improvement and at least 1 ms absolute improvement in a
  repeated hot operation, or at least 15%/8 MiB retained-memory improvement,
  with no applicable cohort over 10% slower and no extra public/runtime owner.
  Use 3 warmups and at least 9 measured samples; expand to 15 when the verdict
  is within five percentage points of a threshold. Timing inside observed noise
  is inconclusive and loses to the simpler current owner.
- current baseline command/artifact and source identity: new registered
  annotation-view-index target, current checkout HEAD plus fingerprints of the
  store, anchor state, mapped source, benchmark and lockfile; artifact under
  `tmp/` copied to the plan artifact directory.
- target command/artifact or disposable prototype and source identity: the same
  runner selects baseline, grouped/batched, collection and snapshot candidates;
  prototypes stay in benchmark source unless retained.
- deterministic work indicators plus timing result: visited anchor listeners,
  target resolutions, source input visits, changed IDs, dirty node buckets,
  subscriber wakes, snapshot node/entry copies, allocations/heap where stable,
  p50/p95 and operation correctness.
- correctness/native guard: focused annotation/decoration contracts, terminal
  deletion tests and the managed two-view comment journey.
- final production-path rerun owner and exact command: Benchmark reruns the
  registered target after all runtime changes, then Task reruns the same
  correctness commands recorded in this plan.

Conditional evidence:

- High-risk scenarios: (1) temporary invisibility in one projection must not
  terminally drop a target still live in another; (2) Strict Mode render replay
  must not allocate/release live anchors or leave editor subscriptions; (3) a
  read-only view must select and author comments without document writes while
  writer edits update both panes; (4) duplicate IDs must fail without disabling
  later valid explicit refresh; (5) 100k dense annotations may legitimately
  touch all targets in the edited node and must not be mislabeled a global-scan
  regression.
- External research: consumed from
  `docs/plite/research/2026-09-21-annotation-architecture-oss/REPORT.md`; no stale
  decision-critical source remains open.
- Issue/PR provenance: N/A; this is review-ledger work without an issue or PR.
- Browser/Benchmark/docs/release/behavior-law owners: managed Plite Chromium,
  Benchmark, Plate Docs/Plite docs and current doctrine apply; release does not.
- Performance pack, pre-acceptance receipt, and final rerun: applies as frozen
  above. No candidate is production-accepted before a pass.

Findings:

- Changed-node-key routing already bounds stable-source local edits where the
  topology permits it. No grouped, collection or simple-snapshot candidate
  cleared the frozen timing, memory and regression gate, so production keeps
  the simpler current kernel.
- The generic provider had no product consumer that needed untyped context.
  Explicit typed stores cover every live caller and fail when ownership is
  missing instead of returning an empty result.
- Comment mode needs one model and two mounted views. Each view owns its index,
  focus/read-only policy and selection presentation; the model owns one active
  selection and the shared anchors.
- Temporary projection invisibility is not deletion. Authored projections now
  report that cause explicitly so a local `drop` latch fires only on actual
  same-mode deletion.
- Best API, Plite Plan, Plite Vision, public docs and generated reference output
  teach the adopted explicit-store and exact-view ownership.

Decisions and tradeoffs:

- Keep `destroy` only on the headless owned store; React returns a runtime object
  without that property, rather than merely hiding it in TypeScript.
- Keep `refresh` on readers because external mutable sources need explicit
  invalidation; it also reactivates a quarantined source, so `retry` disappears.
- Do not rename `drop` or add `exact`; no current consumer needs recoverable
  absence as a third policy.
- Prefer the existing central routing if benchmark candidates are inconclusive;
  private complexity carries a higher burden than a public no-op.

Review fixes:

- Corrected the review's wording from independent pane selections to one model
  selection with per-view focus and presentation.
- Added explicit projection-unavailability evidence after the broad authored
  partition proved that temporary fragment invisibility could otherwise poison
  a terminal `drop` target.
- Reclassified remote canonical-reconcile and Yjs undo contracts that expected
  resurrection as `nearest` consumers; weakening `drop` would have restored the
  cross-backend inconsistency.
- Kept every mapping/index prototype private and rejected all of them when none
  cleared the frozen materiality gate.
- Repaired a finite `HistoryPlugin` descriptor after the complete website graph
  exposed recursive declaration expansion; runtime behavior remains the native
  Plite history plugin.
- Closed stale upload entrypoint/Turbo, bundle-size and API-reference inventory
  left by the preceding upload migration so the shared strict gates are green.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Terminal authored latch treated projection-hidden content as deleted | 1 | Model unavailability cause instead of adding caller exceptions | Added `unavailable: 'projection'`; 412 authored and 65 Yjs cases pass |
| Remote reconcile and Yjs tests required `drop` resurrection | 2 families | Select the policy matching recoverable-location intent | Switched those anchors to `nearest` and asserted honest replacement mapping |
| Benchmark target omitted the governed source preload | 1 | Use the canonical current-source runner contract | Added `--preload ./config/plite-source-aliases.ts`; target registry passes |
| Downstream website graph exceeded TypeScript instantiation depth for `HistoryPlugin` | 1 | Bound the public descriptor without changing implementation inference | Finite descriptor passes Plate declarations, runtime tests and website integration |
| Shared closure inventories omitted the preceding `platejs/upload` entrypoints and `UploadClient` | 3 contracts | Regenerate from the canonical DAG and classify the public symbol | Entrypoint, Turbo, bundle-size and API-reference checks pass |

Verification evidence:

- `docs/plans/artifacts/annotations-architecture-adoption/verification.json`
  records the exact focused, strict, browser, docs and generation commands.
- `docs/plans/artifacts/annotations-architecture-adoption/annotation-view-index-benchmark.json`
  records the matched benchmark: baseline retained, zero candidate promotions,
  zero correctness failures and stable source identity.
- Focused final source: 107 core anchor/history/authored cases, 68 React
  annotation/decoration cases, 55 Plate Comments cases and 8 managed Chromium
  comment/persistent-anchor journeys all pass.
- Strict closure: `pnpm check:plite` passes package types/tests, public builds,
  256 tooling contracts, 25 benchmark contracts and Chromium with 748 passed,
  7 declared skips across 70 bounded batches.
- Website closure: `pnpm --filter www typecheck` passes editor generation, API
  reference, docs/registry freshness, source parity, Next route generation and
  both website TypeScript graphs. Registry generation is
  `6c5d2465335358d56290594318fb9ce4b10d5776aa6926abfbe3e31a71ae2388`.
- `pnpm brl`, `pnpm entrypoint:turbo:check`, Plate Next v226 validation,
  project-owned workflow mirror generation and `git diff --check` pass.

Final handoff prepared:

- Ownership and target API/runtime: native anchors own retained positions;
  application records own IDs/data; one exact-view store indexes each mounted
  view; Decoration owns paint. React owns activation/disposal, while headless
  callers receive `OwnedAnnotationStore` with explicit `destroy`.
- Public breaks and Plate/collaboration adoption: `AnnotationProvider`, implicit
  empty readers, public status/retry/metrics and borrowed `release` authority are
  removed. `useAnnotation(store, id)` and `useAnnotations(store)` are explicit.
  `drop` is terminal local deletion; `nearest` owns recoverable Comments/Yjs
  locations. No replicated exact-absence guarantee was added.
- Browser/Benchmark/docs/provenance: one-model comment mode and persistent
  anchors pass focused and full Chromium. The private benchmark retains current
  node-key routing. Public docs, registry, Vision, API workflows and Plate Next
  v226 match the implementation.
- Residual proof limits: Firefox/WebKit, physical devices, production deployment
  and cross-peer terminal absence were not claimed. No candidate proved a
  superior kernel, so there is no speculative production complexity.
- Execution order and user attention: complete; no follow-up decision is needed.

Timeline:

- 2026-09-21: User authorized full execution after final OSS validation.
- 2026-09-21: Governing review, live owners, consumers, proof runners and stale
  doctrine reconciled; implementation plan bound to the annotations scope.
- 2026-09-21: Adopted terminal local deletion, the minimal explicit store API,
  exact-view React ownership and the one-model comment example.
- 2026-09-21: Rejected every private mapping replacement under the frozen scale
  contract; retained current node-key routing and passed strict closure.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Complete; implementation and proof are ready for handoff |
| Where am I going? | No remaining execution slice |
| What is the goal? | Execute the accepted annotations architecture with final-source proof |
| What have I learned? | The public cut holds; the existing private mapping kernel wins because no candidate earned replacement |
| What have I done? | Implemented all six slices, repaired shared gate drift and recorded focused, scale and strict proof |

Open risks:

- `drop` remains a local transient lifetime policy; synchronized peers do not
  share a terminal-absence bit.
- Dense same-node edits legitimately visit every target in that node. The
  benchmark rejects a global interval abstraction but does not erase that lower
  bound.
- Browser closure is Chromium-only. Firefox/WebKit and physical-device behavior
  retain their existing project-wide proof status.
