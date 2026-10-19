# Wordgard Plite final extraction

Objective:
Rank every remaining Wordgard-to-Plite architecture opportunity; done when all
donor concepts have live verdicts and a checker-clean plan exists.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-07-19-wordgard-plite-final-extraction.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Mode:
- `deep`: the request is exhaustive, follows a completed architecture rewrite,
  and may expose further public breaks, runtime hot paths, or deliberate donor
  rejections that require live source and proof-owner review.

Completion threshold:
- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.
- Every concept in the prior 60-row Wordgard comparison and every additional
  responsibility found in the current donor source is classified as already
  absorbed, Plite-superior keep, intentional reject, evidence-gated defer, or
  ranked executable change. No donor mechanism remains unclassified.
- The final answer gives the full ranked executable list, not only a top five,
  and separately records why all non-executable concepts should not be pulled.

Verification surface:
- Current `../wordgard` source ownership map versus live Plite core, DOM, React,
  history, layout, Yjs, Browser, docs, tests, and benchmark owners.
- Re-audit of the prior 60-row matrix and completed rewrite ledger against live
  post-rewrite source; exact coverage count with zero unmapped concepts.
- Source-backed concept ledger, ranked execution slices, risk/proof matrix, and
  final `check-complete.mjs` pass. No implementation command is claimed as
  planning proof.

Constraints:
- Planning only until the user explicitly accepts this exact plan and invokes
  `plite-plan` against it.
- No public compatibility aliases or runtime shims.
- Plate adopters use Plite mutation primitives directly: one-shot writes use
  `editor.update.*`, grouped or already-transactional writes use the active
  `tx`, and product commands remain scoped to their plugin transaction/API
  namespace. Never add `editor.tf`, `editor.transforms`, or another root
  mutation facade.
- Command-backed one-shot `editor.update.*` methods run the pure command chain;
  the corresponding `tx.*` methods are the primitive composition layer and do
  not redispatch commands. Explicit semantic composition inside an active
  update uses `tx.command(definition, input)`.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.

Boundaries:
- In scope: all architecture/runtime mechanisms in `../wordgard` that could
  improve Plite after the completed canonical-change rewrite, including model,
  transactions, schema, state/config, views, DOM/selection, persistence,
  collaboration, rendering, tests, benchmarks, and dependency shape.
- Source owners: `../wordgard`; `packages/plite*`, `packages/browser`,
  `packages/yjs`, `apps/plite`, current Plite doctrine/docs/tests/benchmarks,
  and only direct Plate adopters challenged by a proposed break.
- Non-goals: implementation; generic comparison with unrelated editors;
  importing Wordgard product UI or class identity; reopening already-proved
  decisions without contradictory live evidence; translating Plite primitives
  into a second root Plate mutation API.
- Direct Plate/collaboration adoption owners: Core/Markdown/Table or other
  exact callers only when a surviving proposal changes their boundary; Yjs is
  always checked for change/history/persistence proposals.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.
- Exclude dependencies, build output, generated registry JSON, logs, and donor
  product/demo assets unless a concept specifically depends on them. Start with
  file/owner counts and capped excerpts; store the exhaustive ledger in this
  plan rather than streaming raw source.

Blocked condition:
- Block only if `../wordgard` is unavailable or a decision-changing mechanism
  cannot be resolved from either repository after three distinct focused
  source/proof attempts. Breadth, disagreement with the old ledger, or a new
  breaking proposal is work, not a blocker.

Plite Plan state:
- status: complete
- phase: prove-and-handoff
- next: user review, then execute only if this exact plan is accepted
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Exhaustive post-rewrite comparison, full ranked list, and zero remaining donor opportunity are explicit above |
| Active goal and plan verified | yes | Goal `019f4d13-4361-7bf0-b28b-33494d78a4bd` names this exact plan |
| Current owners read | yes | `VISION.md`, `docs/vision/plite.md`, `docs/plite/agent-start.md`, all 60 prior comparison rows, the donor source inventory, and live Plite/change/schema/state/history/Yjs/DOM/React/release owners were re-read |
| Mode and execution boundary resolved | yes | Deep agent-led plan hardening; planning only until this exact plan is accepted |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports/behavior claims cite live source.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Twenty-three mandatory packets, six conditional gates, one closure packet, and all stop decisions are explicit |
| Fresh source evidence | yes | Recheck decision-changing current claims | Live source contradicted the old closure proof; exact contradictory owners are recorded below |
| Conditional risk and adoption | yes | Complete triggered risk/browser/benchmark/provenance work or give one scoped N/A reason | Collaboration, history, selection, DOM, benchmark, release, Plate adoption, and deletion gates are named per slice |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Proof matrix and exact future commands are below; no implementation result is claimed |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Ranked backlog, dependency order, breaks, and stop decisions are complete |
| Autoreview | no | Run for implementation changes or record planning-only N/A | Planning-only turn; independent live-source red-team and five owner audits supplied the pressure pass |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-19-wordgard-plite-final-extraction.md` | Passed on 2026-07-19 |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Doctrine, donor inventory, old 60-row matrix, old closure proof, and live owners audited | Decide |
| Decide | completed | Twenty-three ranked changes, five gates, and explicit keep/reject/defer decisions resolved | Prove and hand off |
| Prove and hand off | completed | Coverage count, execution slices, proof matrix, and checker-ready handoff prepared | User review |

Decision brief:
- outcome: one exhaustive, post-rewrite verdict and ranked backlog that leaves
  no Wordgard concept unclassified.
- chosen shape: concept-level live-source ledger plus dependency-ordered
  execution slices; absorbed/rejected rows remain visible but do not inflate
  the executable ranking.
- strongest rejected alternative: accepting the 2026-07-18 closure proof as
  current truth. Live source shows intent-first transforms, speculative editor
  mutation, permissive schema fitting, whole-root Yjs import, eager history
  rebasing, and pre-publication registry mutation still exist.
- consequence: the earlier claim that the imperative renderer was the only
  remaining deferral is withdrawn. Correctness bugs rank first; architecture
  deletion follows; optional donor mechanisms remain gated instead of being
  copied for aesthetic parity.

Decision ledger:
| Rank | Grade | Surface and live defect | Target | Owner | Adoption | Proof | Risk | Verdict |
| ---: | :---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | A+ | `setNodeChange` replaces the whole property token and same-node transforms right-bias it (`packages/plite/src/core/document-change.ts:2134`, `:2610`); independent concurrent keys lose intent | First-class versioned JSON property-delta sections for elements and text; distinct keys commute, same-key conflicts are deterministic, set-valued properties have explicit algebra | Plite `DocumentChange` | History, Yjs, serialized changes, classifiers, property transforms | Generated multi-key/set/unset/move/delete/serialize/invert/compose/transform/multi-root/Yjs laws | Public change JSON break and conflict policy | **Pull and repair immediately** |
| 2 | A+ | Yjs shared effects use one append-only array plus numeric cursor (`packages/yjs/src/core/controller.ts:166`, `:528`); a real concurrent probe failed 50/50 | Stable event IDs, exactly-once dedupe, causal association with the document update, relative-position mapping, retryable decode, bounded compaction; delete the numeric-cursor format | `packages/yjs` | State-field/custom effects, providers, persistence fixtures | Concurrent positional effects, duplicates, reconnect, late join, unknown-codec retry, compaction soak | Existing persisted shared-effect arrays require a hard format break | **Pull causal property, keep Yjs** |
| 3 | A+ | Normal transforms create public `EditorIntent`, call `applyIntent`, then `changeFromIntent`; `createTransactionSpec` mutates editor-owned WeakMap state and rolls it back (`public-state.ts:3255-3455`) | Isolated `EditorDraft` plus native `DocumentChangeBuilder`; draft-local roots, selection, fields, effects, annotations, anchors; one frozen publication; zero normal-path intents/replay | Plite transaction kernel | All transforms, corrections, commands, anchors, history, Yjs, DOM/React; direct Plate callers use `editor.update.*` or the active `tx` | Abort/nesting/spec isolation laws, ambient committed-read law, transform corpus, zero `editor.tf`/`editor.transforms`, browser, history/Yjs, transaction benchmark | Largest break; ambient editor reads inside transforms must move to `tx` | **Hard cut** |
| 4 | A+ | Unknown element types pass schema validation and roots have no declared grammar (`editor-schema.ts:532`; `representation.ts:124`) | Closed schema-bound primary/named-root grammar, structural `any/all/not`, explicit defaults, compiled containment/wrapping/validation; schema-less Plite remains permissive | Plite schema; Plate registers product schema | Plate plugin adapter, all element packages, tables, imports, history/Yjs validation | Generated grammar, malformed external values, roots, reconfiguration, default uniqueness, remote rejection | Broad Plate adoption and strictness break | **Pull closed grammar, keep JSON** |
| 5 | A+ | Fitting sees only a parent, wraps each child independently, and discards slice openness; `insert-fragment.ts` carries 1,068 lines of branch logic | Pure `schema.fit(slice, { at, value })` and `tx.slice.replace(slice, { at })`; preserve open context; hard-cut fragment choreography | Plite schema/transforms; plite-dom host codecs | Clipboard, lists, tables, code blocks, media, AI, examples | Wordgard fitter corpus plus generated range/slice laws and browser paste matrix | High behavior risk around tables/lists/voids | **Pull and simplify** |
| 6 | A | Text formatting is arbitrary unregistered JSON while only element properties have specs | Extension-owned text-property specs: validation/equality, targets, cursor inclusion, split/type-change preservation, replace/set merge mode; no Mark classes | Plite schema; Plate mark plugins | Basic marks, comments, suggestions, diff, font/color, links, collab metadata | Invalid target/value, cursor edges, split/type change, set algebra, codecs, packet-1 laws | Plate-wide schema registration | **Pull semantics, reject class ontology** |
| 7 | A | Ordinary writes publish noncanonical leaf runs then repair them at transaction close (`representation.ts:75`; `public-state.ts:5026`) | Construct canonical slices/changes once: merge equal text, normalize empty leaves/inline spacers, fit required content, preserve runtime identity; keep import repair as explicit diagnostics only | Plite change/schema kernel | Direct-change callers, imports, runtime IDs | Every snapshot canonical, idempotence, runtime-ID/selection preservation, normalization benchmark, zero normal repair calls | Malformed direct writes become strict | **Pull construction invariant** |
| 8 | A | Remote Yjs observer discards event detail, rereads the full root, then runs `DocumentChange.between` (`controller.ts:267`, `:788`; `change-bridge.ts:86`) | Translate Yjs event paths/deltas into exact root-scoped changes through a cached mirror; full read/diff only as traced fallback; outbound lowering consumes change sections | `packages/yjs` | Providers, history skip/rebase, anchors, selections | 10k-block sparse edits, distance-independent cost, narrow ranges, all event shapes, concurrency, browser follow-up typing | Yjs structural event coverage and fallback correctness | **Pull incrementality** |
| 9 | A | Selection exposes `affinity`, `goalColumn`, and `marks`, but mapping/DOM/codecs do not enforce them; active marks remain duplicate state | Enforced focus association; collapsed selection marks become pending-insertion-mark truth; strict/versioned kind validation; keep physical vertical goal in root-scoped DOM navigation state | Plite selection protocol; plite-dom/react | History, Yjs, table cell selections, snapshots/commits, Plate | Boundary mapping, stale path rejection, custom kinds, marks through undo/serialization, repeated vertical movement in Chromium/Firefox/WebKit | Inline-boundary and DOM-equivalent caret behavior | **Finish the feature, remove fake fields** |
| 10 | A | Coordinate-to-point and associated point-to-rect logic is absent from plite-dom and duplicated across three React navigation files | One root/target-scoped plite-dom geometry kernel for coordinates to point, point to rect/association, visual lines, grapheme/caret fallback; browser geometry is bidi truth | `packages/plite-dom`, thin React consumers | Event resolution, vertical navigation, partial DOM, coordinate placement | Cross-browser click/arrow/Home/End/vertical/typing matrix including RTL, mixed bidi, zoom, shadow DOM, roots, voids | Browser geometry quirks | **Pull ownership, reject donor bidi tables** |
| 11 | A− | Corrections recollect paths, run one correction, restart, and stringify the whole root for cycle detection (`correct-document.ts:27-152`) | Event-indexed fixed-point worklist seeded from changed ranges, deduped by root/runtime/event/correction; enqueue only newly affected nodes; fingerprint cycles | Plite correction kernel | List/table/layout normalizers | Fixed point, order independence, generated targets, deterministic cycles, multi-root, large-doc benchmark | Scheduler semantic changes | **Pull targeting, improve algorithm** |
| 12 | A− | History is mutable WeakMap/array state; each skipped/remote change eagerly maps every batch and broad catch silently deletes failures (`history-extension.ts:484-540`) | Frozen revisioned branches with pending composed mapping journals, lazy head resolution, atomic restore, explicit obsolete/error classification, readonly public state, configurable `maxDepth` | `packages/plite-history` | React history hook, mutation history, Plate callers, persistence | Eager/lazy equivalence, 100/1,000-depth remote burst, multi-root/effects/selections, serialization with pending maps | Delayed pop latency and transform bases | **Pull lazy branch ownership, keep Plite codecs** |
| 13 | A | React editable behavior threads a large mutable ref bag and roughly 25 runtime arguments across root modules | Private per-mounted-root `EditableDOMRuntime` owning scheduler, input, selection import/export, repair, observers/listeners, anchors, connect/update/destroy; keep public React APIs thin | `packages/plite-react` | Editable root hooks/controllers/tests | IME/mobile/input/selection matrix, remount/leak tests, scheduler diagnostics, unchanged render fanout | Large internal move can regress browser lifecycle | **Pull coherent ownership, reject public monolith** |
| 14 | A− | Extension setup mutates the live registry before revision publication and relies on rollback (`editor-extension.ts:678`, `:828`) | Build/validate a detached immutable candidate registry, atomic swap, explicit activation/deactivation after publication, abort-safe cleanup registration | Plite extension registry | All extensions, slots, schema/effects/facets/commands | Failed prepare/activation, observer revision atomicity, cleanup ordering, reconfiguration | Arbitrary setup side effects cannot be made transactional without a lifecycle contract | **Hard-cut side-effectful configuration** |
| 15 | A− | Pure commands return specs but handlers cannot cleanly augment delegated specs; imperative transform middleware still owns core behavior | Finish `false | TransactionSpec` handlers and explicit base-checked spec composition/apply; command-backed one-shot `editor.update.*` methods dispatch them, active `tx.*` stays primitive, and Plate product commands stay plugin-scoped | Plite command registry; direct Plate/DOM adopters | Core commands and plugins that decorate commands; no root Plate transform facade | Compose/apply/invert, stale-base rejection, delegated augmentation, direct-update versus active-tx dispatch law, one final commit, zero `editor.tf`/`editor.transforms` | Command ordering and inference | **Pull composition law** |
| 16 | A− | Facets have explicit dependencies but cannot depend on state fields; field reads clone object values and fields lack equality | Add field dependencies and per-field revisions, optional `compare`, frozen stable field identity, optional root-scoped dependency descriptors; retain explicit dependency lists | Plite field/facet kernel | State-field/facet extensions | Exact recomputation counts, stable identity, no-op transitions, cycles, roots, reconfiguration | Mutable initial values must be frozen | **Pull field dependency, reject auto tracking** |
| 17 | A− | Custom effect descriptors must be repeated manually in History and Yjs options; only state-field effects are discoverable | Install effect descriptors as extension resources in one keyed registry; collision/version/policy validation; History/Yjs discover it; remove manual option arrays | Plite extension resources, History, Yjs | Custom domain effects and state fields | Automatic history/Yjs round-trip, duplicate/unknown/stale rejection, teardown/reconfigure | Emitting before installation must fail immediately | **Plite-native completion** |
| 18 | A− | Host-codec schema metadata is diagnostic only (`packages/plite-dom/src/plugin/host-codec.ts:55`) | Compile codec targets against element/text-property specs, fail conflicts during config, preserve full slices, and fit parsed content at the actual range | `packages/plite-dom`; Markdown/clipboard hosts | HTML/Markdown/clipboard codecs and Plate plugins | Conflict tests, schema revisions, round-trips, malformed input, paste browser matrix | Host order and legacy parser assumptions | **Make schema linkage real** |
| 19 | A− | Mutation observation is thin and repair is largely Android-specific | Root-scoped DOM integrity observer owned by `EditableDOMRuntime`; ignore tagged React/scheduler/composition writes; convert unauthorized mutations into targeted repair evidence, never model truth | `packages/plite-react` | Editable roots, Grammarly/spellcheck/autocorrect/extensions | Cross-browser external text/attr/child mutations, composition, wrappers, read-only, roots/shadow/partial DOM, no loops | Very high IME and extension risk | **Pull after rank 13** |
| 20 | B+ | Current package checks inspect source/import size and pack listings but do not prove packed built subpaths, declarations, or dead-code elimination | Release-only built/pack/consumer gate for every Plite-family package: import every export, validate declaration/export maps, bare/named bundle DCE, dependency-direction assertions | Release/tooling | Plite, DOM, React, History, layout, Yjs, Browser packages | Packed consumer fixtures, publint/ATTW-equivalent checks, Rollup/esbuild DCE | Build-format variance; never copy donor AST rewrites | **Pull proof discipline** |
| 21 | B | Core word navigation uses a hand-written punctuation classifier and lacks CJK corpus parity | Deterministic Unicode word-boundary profile shared by move/delete/positions; harvest donor CJK tests; DOM remains visual authority; cache block projection only if hot | Plite positions/string | Delete/move/selection commands | CJK/punctuation corpus, forward/back symmetry, Node/browser identity | `Intl.Segmenter(undefined)` is nondeterministic across locale/runtime | **Pull behavior, redesign implementation** |
| 22 | B | No transaction-scoped screen-reader announcement channel | Installed typed announcement effect plus one `aria-live` consumer per logical editor; Plate owns localized messages | Plite effect registry + plite-react host | Commands needing announcements | Repeated messages, multi-root single consumption, undo/redo, read-only/headless | Duplicate/replayed announcements | **Pull small host capability** |
| 23 | B | Architecture docs and the old closure artifact claim completed boundaries contradicted by source; superseded helpers remain | Delete replaced intent/runtime/fitter/repair helpers, repair `VISION.md` and closure artifacts, add behavior-focused guards, run package/browser/benchmark/release closure | All touched owners | All direct callers and docs/examples | Zero old owners after replacement, focused then full checks, docs proof map, browser matrix | Premature deletion before adopters move | **Mandatory truth closure** |

Conditional gates, not permission to pre-build abstractions:

| Candidate | Current decision | Promotion evidence | Stop decision |
| --- | --- | --- | --- |
| Private resolved token cursor over `TreeIndex` | benchmark-gated | Repeated position/range-walk median and p95 beat current indexed queries on large documents without weakening path APIs | Do not expose raw integer positions |
| Stable-ID incrementally mapped overlay source | benchmark-gated | 10k/100k projection, annotation, and widget sources prove full reread/project/diff is a shared bottleneck | Do not create one public mega view-layer API merely from line count |
| Mixed-bidi DOM-absent fallback | browser-policy gate | Hidden/projected/partial-DOM modes have a named requirement and donor vectors pass against Chromium, Firefox, and WebKit computed-direction fixtures | Never port Wordgard's incomplete bidi tables as truth |
| Context-aware history effect inversion | consumer-gated | A real annotation/comment field must restore state indirectly removed by document deletion | Keep simple `invert(value)` until then |
| Imperative non-React renderer | consumer/performance-gated | Named non-React host, parity target, and measured need | Continue deferral; if triggered, build thinly over Plite primitives, never `Tile`/`DocTile` |
| Whole editor-session envelope | consumer-gated | Named replay/SSR/session owner needs document, selection, view state, and history in one atomic format | Keep `EditorDocumentValue`, selection codecs, and History persistence separate |

Original 60-row coverage after live reclassification:

| Verdict | Count | Rows | Meaning |
| --- | ---: | --- | --- |
| Ranked action | 25 | 2, 7-13, 15, 20-21, 23, 25-27, 29, 32, 34, 39, 47-48, 54, 57-59 | Covered by ranks 1-23 above |
| Evidence-gated | 2 | 37, 40 | Existing mapped stores stay; optional indexed mapping needs benchmark proof |
| Already absorbed | 12 | 4, 16-19, 22, 24, 30, 33, 35, 38, 55 | Keep current mechanism, extending it only where a ranked packet requires it |
| Plite-superior keep | 18 | 1, 3, 5-6, 14, 28, 31, 36, 41-46, 49, 52-53, 56 | JSON, paths/anchors/runtime IDs, multi-root, React, browser/input/layout, Plate boundary, fixtures/packages/proof |
| Intentional reject | 2 | 50-51 | Built-in product schema and UI/i18n stay in Plate |
| Defer | 1 | 60 | No imperative non-React consumer or parity target |

Additional donor mechanisms outside the old 60 rows:

| Mechanism | Final verdict |
| --- | --- |
| Transaction extenders/appenders | Reject hidden recursive writes; explicit corrections, effects, and post-commit work have one owner |
| Automatic facet dependency tracking | Reject ambient read tracking; rank 16 completes explicit dependencies |
| `Field.provide`, facet `enables`, global `Prec` wrappers | Reject hidden extension/config expansion without a concrete owner |
| Wall-clock transaction annotations and history join timing | Reject nondeterministic core grouping; keep explicit semantic history policy and host input grouping |
| Scoped keymaps, input rules, smart quotes | Plate-owned, not Plite architecture |
| Themes, menus, dialogs, tooltips, i18n, CSP/style modules | Plate/app-owned |
| Class document/selection/mark model, raw integer public positions | Reject; plain JSON, paths, anchors, and runtime IDs are better |
| Central OT and unconfirmed-update queues | Reject; Yjs owns collaboration while `DocumentChange` owns local algebra |
| DOM shapes in schema, custom-element host, monolithic input/editor view | Reject cross-layer ownership; ranks 10, 13, and 19 borrow only coherent private ownership |
| One public decoration/view mega ontology | Reject; projection, annotation, and widget remain separate public concepts |
| Wordgard release AST rewriting and git-mutating scripts | Reject; rank 20 steals verification, not brittle build magic |
| Product table topology/state machines | Plate-owned; add generated table laws only in a Plate plan |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 0. Lock contradictory baselines | Plite/Yjs/tests/docs | Add intent-preservation property law, concurrent shared-effect regression, and explicit current architecture baselines | Accepted plan | Both correctness failures reproduce; old closure claims marked invalid, not silently reused | Focused Plite/Yjs tests and saved benchmark/probe artifacts |
| 1. Canonical delta correctness | Plite change kernel | Rank 1 property deltas and change JSON version | Slice 0 | Full algebra understands patches; old whole-token property replacement deleted | Generated change laws, history/Yjs serialization/adoption |
| 2. Schema foundation | Plite schema + Plate adapter | Ranks 4 and 6 closed roots, grammar, text-property specs | Slice 0 | External values validate; full Plate schema registered | Schema laws, package adopters, malformed import/Yjs/history cases |
| 3. Native transaction kernel | Plite core | Ranks 3 and 15 draft/builder, intent hard cut, pure command/spec composition | Slices 1-2 | One immutable publication; zero normal-path `EditorIntent`/`applyIntent`/speculative editor swapping; Plate callers use `editor.update.*`, active `tx`, or scoped plugin commands with zero root `editor.tf`/`editor.transforms` | Core transform/atomicity/command tests, direct-adopter static audit, and transaction benchmark |
| 4. Slice and correction rewrite | Plite transforms/schema | Ranks 5, 7, and 11 fitter, construction canonicality, worklist | Slices 2-3 | One slice replace owner; old fragment forest and ordinary representation repair deleted | Fitter corpus, generated correction laws, normalization benchmark |
| 5. Configuration resources | Plite extensions | Ranks 14, 16, and 17 detached revisions, field-aware facets, effect registry | Slice 3 | Atomic registry publication; stable field identity; History/Yjs manual effect arrays gone | Reconfigure/failure/caching/effect round-trip tests |
| 6. Host codecs | plite-dom/Markdown/Plate | Rank 18 schema-bound codecs using intact fitted slices | Slices 2, 4-5 | Codec metadata compiled and conflicts fail early | Round-trips, malformed inputs, paste/browser proof |
| 7. Selection and geometry | Plite/plite-dom/plite-react | Ranks 9, 10, and 21 selection truth, geometry kernel, deterministic words | Slices 3-4 | Association/marks validated; duplicate geometry deleted; Unicode policy fixed | Package laws plus Chromium/Firefox/WebKit navigation and follow-up typing |
| 8. Collaboration | Yjs | Ranks 2 and 8 causal shared effects and event-native changes | Slices 1, 3, 5 | Exactly-once causal effects; routine remote edits avoid whole-root diff | Concurrency/reconnect/late-join/10k sparse benchmark/browser collaboration |
| 9. History | plite-history | Rank 12 immutable lazy branches, atomic restore, `maxDepth` | Slices 1, 3, 5 | No mutable public stacks, eager full-stack rebase, or silent deletion | Equivalence laws, deep remote burst benchmark, persistence, multi-root/effects |
| 10. DOM root runtime | plite-react | Ranks 13, 19, and 22 runtime owner, integrity observer, announcements | Slice 7 | Ref/parameter plumbing and fallback schedulers deleted; one owned lifecycle | Full input/IME/mobile/observer/a11y/browser matrix and leak checks |
| 11. Release and evidence gates | Tooling/benchmarks | Rank 20 and all conditional probes | Stable package APIs from prior slices | Packed artifacts/types/DCE validated; each conditional candidate promoted or explicitly closed from fresh evidence | Pack consumer fixtures, DCE bundles, overlay/cursor/bidi benchmarks as applicable |
| 12. Adoption and truth closure | All direct owners | Rank 23 Plate/Yjs/DOM/React/history callers, exports, docs, examples, deletion | Slices 1-11 | No replaced machinery or false closure claims; no compatibility aliases or competing root mutation facade | Zero `editor.tf`/`editor.transforms` audit, `pnpm check:plite`, focused package tests/typechecks, `pnpm lint:fix`, browser matrix, benchmarks, release gate, plan checker |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Property transforms preserve independent intent | Whole-token replacement and right-bias located; live `{tone}` versus `{align}` probe loses A | Generated multi-key and set-valued algebra laws plus Yjs convergence | specified |
| Shared effects are causally exactly once | Numeric cursor source found; actual controller concurrency probe failed 50/50 | Duplicate/reorder/reconnect/late-join/codec-retry/compaction suite | specified |
| Transactions are genuinely isolated | Spec builder saves, mutates, then restores editor-owned roots/state/effects/index/anchors | Ambient committed-read, abort, nested/spec independence, zero old owners | specified |
| Schema and fitting are closed/contextual | Unknown types pass; current fitter lacks range/ancestor context and drops slice openness | Generated grammar/fitter laws, donor corpus, Plate schema adoption, browser paste | specified |
| Selection has one enforced truth | Public fields are unused; marks duplicated | Strict custom/builtin validation, mapping laws, history/Yjs, cross-browser vertical/RTL | specified |
| Collaboration import cost follows changed region | Remote path reads/diffs whole root | 10k sparse distance-independent median/p95 and narrow changed ranges | specified |
| History rebase cost does not scale per remote commit by full depth | Current code loops all undo/redo batches and silently drops failures | Eager/lazy equivalence and 100/1,000-depth remote burst benchmark | specified |
| DOM ownership is coherent without behavior loss | Geometry/runtime/observer responsibilities are duplicated or threaded | Full package/browser matrix, listener-leak and scheduler diagnostics | specified |
| Published packages are valid and tree-shake | Current source/import/pack-list checks do not consume packed built artifacts | Every public subpath imported from tarball; d.ts/export maps and bare/named DCE pass | specified |
| No donor concept remains unclassified | 60-row coverage totals 60; additional donor mechanisms have explicit verdicts | Closure review re-runs source coverage and plan checker | specified |

Conditional evidence:
- High-risk scenarios: applies. Canonical concurrency, collaboration, schema
  strictness, clipboard, history, IME/mobile, bidi, external DOM mutation,
  multi-root, partial DOM, and extension reconfiguration are named in the
  ledger and slices.
- External research: N/A. The requested donor is the local `../wordgard`
  checkout; decision-changing claims were grounded in donor and live Plite
  source rather than web summaries.
- Issue/PR provenance: N/A. This is an architecture comparison requested from
  local source, not issue-backed maintainer work.
- Browser: required for slices 6, 7, 8, and 10. Use focused Chromium rows while
  iterating and `pnpm check:plite:browser-matrix` only at closure.
- Benchmark: required for transaction, normalization, sparse Yjs import,
  history rebasing, and every conditional promotion.
- Docs: required in slice 12; repair `VISION.md`, public docs/proof maps, and
  supersede the false closure artifact.
- Release: required in slice 11 through packed consumer/type/DCE gates.
- Behavior laws: required before each implementation packet; tests assert
  current behavior and algebra, never removed symbol names.

Findings:
- The 2026-07-18 execution ledger materially overclaims completion. Renaming
  operations to `EditorIntent` and wrapping them in `DocumentChange` did not
  create a native immutable transaction model.
- The most serious newly exposed defect is not architectural taste: concurrent
  distinct-key node property edits converge by dropping one valid edit.
- Yjs shared effects are also a correctness blocker: numeric cursors are not a
  causal or exactly-once checkpoint under concurrent Y.Array ordering.
- Schema, fitting, representation canonicality, and correction scheduling form
  one dependency chain, but they remain separate responsibilities and proof
  packets.
- Plite's React renderer, multi-root model, paths/anchors/runtime IDs, browser
  behavior, Yjs product choice, typed effects/codecs, and explicit facet
  dependency doctrine remain better than Wordgard and should not be rewritten.
- Line count alone does not justify a universal mapped range store. The three
  view adapters have distinct public semantics; only a shared measured mapping
  bottleneck promotes the conditional protocol.

Decisions and tradeoffs:
- Steal properties and ownership rules, not Wordgard's classes or package
  shape.
- Keep public structural paths and JSON; use token positions/cursors only as
  private indexed machinery.
- Keep Yjs and replace its bridge/transport defects; do not add central OT.
- Keep explicit facet dependencies and explicit history grouping; reject
  ambient dependency tracking and wall-clock core behavior.
- Make schema strict only when a schema is installed. Schema-less Plite stays a
  deliberately permissive JSON editor.
- Treat the imperative renderer as a legitimate defer. Building a second
  renderer without a consumer is architecture cosplay.
- Use hard cuts, not compatibility aliases. Each execution slice must delete
  its replaced owner before closure.

Review fixes:
- Independent red-team disproved the prior closure proof and reclassified all
  60 original rows against live source.
- Five owner audits added property-delta, causal-effects, history, selection,
  field/facet, DOM geometry/runtime, Unicode, and release-artifact gaps that
  the old ledger collapsed or missed.
- The proposed mandatory mega mapped-store rewrite was downgraded to a
  benchmark gate: 2,299 adapter lines are not proof of duplicate semantics.
- Generic Wordgard history timing was rejected in favor of Plite's explicit
  semantic grouping; only lazy mapping, immutable publication, and `maxDepth`
  survive.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Broad multi-owner output exceeded the capture budget | 3 | Split searches by owner, cap with `head`, and read exact line windows | Resolved; no decision relies on truncated output |

Verification evidence:
- Prior donor inventory: 74 production files / 22,611 lines and 26 donor test
  files / 5,708 lines were already classified; this pass rechecked every
  decision-changing owner and the full 60-row matrix against current source.
- Independent lanes covered document/schema/change, state/selection/facets/
  history, DOM/view, collaboration/persistence, package/tests, and a red-team
  whole-matrix pass.
- Current source checks confirmed 13 transform files call `applyIntent`, no
  `DocumentChangeBuilder` exists, remote Yjs import uses full-root read/diff,
  and the shared-effect transport uses a numeric cursor.
- Planning verification passed: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-19-wordgard-plite-final-extraction.md`.
- Future implementation proof starts focused with package tests/typechecks,
  then uses `pnpm check:plite`, `pnpm lint:fix`, applicable donor benchmarks,
  and closure-only `pnpm check:plite:browser-matrix`.

Final handoff prepared:
- Ownership and target API/runtime: ranks 1-23 and slices 0-12 name one primary
  owner and exit condition per responsibility.
- Public breaks and Plate/collaboration adoption: change JSON, schema/text
  specs, selection codecs, readonly history, effect installation, commands,
  codecs, and Yjs formats list direct adopters. Plate mutation adoption maps
  directly to `editor.update.*`, active `tx`, or scoped plugin commands; it
  never creates a root transform facade.
- Applicable browser/benchmark/docs/provenance decisions: resolved under
  Conditional evidence; local-source provenance is sufficient.
- Proof and execution risks: exact algebra, browser, collaboration, history,
  package, and deletion gates are in the proof matrix.
- Execution order and user attention: fix ranks 1-2 first; do not start the
  broad rewrite until this exact plan is explicitly accepted.

Timeline:
- 2026-07-19T20:49:29.071Z Plite Plan created.
- 2026-07-19 Grounded doctrine, donor inventory, prior 60-row matrix, old
  execution ledger, and live Plite/Yjs/DOM/history owners.
- 2026-07-19 Red-team invalidated the old closure proof and found intent-first
  execution, permissive fitting, whole-root Yjs import, and incomplete view/
  configuration ownership.
- 2026-07-19 Owner audits found the concurrent property-loss law and causal
  shared-effects failure; ranking rebuilt around live correctness.
- 2026-07-19 Full coverage, execution slices, stop decisions, and handoff
  prepared; no implementation started.
- 2026-07-19 `check-complete.mjs` passed for this plan.
- 2026-07-20 Clarified the accepted command/adoption boundary after execution
  exposed an invalid interpretation: `editor.tf` and `editor.transforms` are
  forbidden competing root APIs, not Plate adapters.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Prove-and-handoff complete |
| Where am I going? | User review, then exact-plan execution only if accepted |
| What is the goal? | Exhaustively classify every remaining Wordgard mechanism and rank every justified Plite change |
| What have I learned? | The old completion claim is false; 23 mandatory changes remain, led by two correctness failures |
| What have I done? | Reclassified all 60 rows, audited extra donor mechanisms, ranked all work, and specified adoption/proof/deletion |

Open risks:
- The transaction/schema/fitter work is broad enough that executing it as one
  unreviewed mega diff would be reckless; slices and deletion gates are hard
  boundaries even if execution is uninterrupted.
- Change JSON and Yjs shared-effect formats require explicit hard breaks; no
  compatibility aliases or permanent dual formats.
- Browser/mobile/IME and collaboration proof are closure requirements, not
  optional confidence polish.
