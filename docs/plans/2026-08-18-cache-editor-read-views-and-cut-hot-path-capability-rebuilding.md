# cache editor read views and cut hot-path capability rebuilding

Objective:
Execute the accepted Plite read-view and Plate capability lifecycle repair; done when slices 0-6 and all proof gates pass; plan docs/plans/2026-08-18-cache-editor-read-views-and-cut-hot-path-capability-rebuilding.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-18-cache-editor-read-views-and-cut-hot-path-capability-rebuilding.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Mode:
- `deep`: the decision is a high-risk runtime, React subscription, history,
  browser-correctness, and performance boundary with measured regressions.

Completion threshold:
- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.
- The target removes per-read state-group/capability construction from the
  interactive path, names explicit invalidation and transaction semantics,
  rejects latency-hiding deferral, and covers the measured Find/Replace,
  Select Editor, List Enter, and full-kit failures.
- One primary Plite plan contains the Plate adoption ledger; no duplicated
  sibling plan or compatibility bridge.

Verification surface:
- Current source in `packages/plite/src/core/public-state.ts`, Plite extension
  compilation/runtime, `packages/plite-react` selector/subscription owners,
  Plate runtime lowering/plugin access/merge owners, and direct tests/docs.
- Existing trusted Chrome evidence in `.tmp/full-mount-edit-audit/**` and the
  completed audit plan.
- Execution proof must include focused package tests/typechecks, read-view
  identity/invalidation tests, transaction/draft/history tests, trusted browser
  replay, full-kit/list/find/select route rows, burst/long-task metrics, and the
  applicable Plite handoff gates.

Constraints:
- The user accepted this exact plan and invoked execution on 2026-08-18.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Best long-term architecture wins. Internal and public breaks are allowed when
  they remove the flawed lifecycle; no debounce, post-paint laundering, stale
  snapshots, compatibility aliases, or dual read models.
- Preserve canonical `DocumentChange`, synchronous non-nested updates, active
  transaction semantics, correct history/undo, selection/focus, and exact
  extension identity.

Boundaries:
- In scope: Plite read/state-view construction and invalidation; extension read
  namespace compilation; React commit subscriptions; Plate plugin lowering,
  portals, and read capability projection; correctness/perf harness gaps.
- Source owners: `packages/plite`, `packages/plite-react`, `packages/core`,
  focused Plate feature packages/routes only where they expose residuals.
- Non-goals: huge-document architecture, unrelated plugin/API cleanup,
  registry redesign, release/PR/GitHub mutation, or implementation before this
  exact plan is accepted.
- Direct Plate adoption owners: `resolvePlugins.ts`, plugin context/portal
  access, `PlateContent`/store selector consumers, Find/Replace, Select Editor,
  List behavior, registry examples, and current API teaching if semantics move.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.
- Exclude generated registry output, `.next`, `node_modules`, full dirty diffs,
  and unrelated packages unless a decision row names them. Reuse the audit
  summaries instead of replaying raw 2 MB event files into context.

Blocked condition:
- Block only if current source cannot establish read/transaction invalidation
  law or if two target architectures remain behaviorally indistinguishable
  after focused source/tests/prototype evidence. Do not block on implementation
  work, stale generated registry output, or unavailable release proof during
  this planning goal.

Plite Plan state:
- status: completed
- phase: execution-complete
- next: none
- handoff: local candidate verified; no commit, push, PR, or release performed

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Use both Plite Plan and Plate Plan; choose the best architecture; breaking/rearchitecture explicitly allowed; stop after ready planning handoff. |
| Active goal and plan verified | yes | The accepted plan is the execution ledger for the one-shot goal. |
| Current owners read | yes | Plite state/extension/view runtime, Plite React selectors, Plate lowering/portal/merge, production read owners/consumers, docs, benchmarks, and audit evidence read. |
| Best API target resolved | yes | Keep public calls; harden `read` factories to configuration-scoped method trees and execute direct methods inside the read boundary. No new public noun or compatibility path. |
| Mode and execution boundary resolved | yes | Deep, one-shot execution; user acceptance recorded on 2026-08-18. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports/behavior claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks have adoption answers; no private bridge survives.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Decision ledger, slices, proof matrix, and risks are resolved. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Current source, focused tests, production owners/consumers, docs, benchmark harness, and audit evidence reread. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Current public calls kept; read output/lifecycle hard cut and rejected alternatives recorded. |
| Conditional risk and adoption | yes | Complete triggered risk/browser/benchmark/provenance work or give one scoped N/A reason | Six high-risk cases, Plate adoption, browser/benchmark/docs gates, and scoped N/A rows recorded. |
| Verification recorded | yes | Record fresh execution proof and exact local boundary | Strict Plite, 40/40 production interaction rows, 111 benchmark correctness tests, docs/typecheck/lint/generated checks, and matching source fingerprints recorded below. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Local-only handoff and unverified pushed/release boundary are explicit. |
| P2 autoreview | yes | Run with `--max-priority P2`; reject only findings contradicted by current executable proof | Four bounded passes completed clean with zero accepted/actionable findings; overall verdict `patch is correct (0.92)`. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-18-cache-editor-read-views-and-cut-hot-path-capability-rebuilding.md` | Passed on the final local evidence record. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Live owners, tests, docs, benchmarks, and trusted audit evidence sourced. | Decide |
| Decide | completed | Best-API verdict and concept ledger resolved. | Prove and hand off |
| Prove and hand off | completed | Slices, risk cases, proof matrix, and handoff prepared. | User review |
| Execute | completed | Slices 0-6 landed in the current tree with strict package, browser, benchmark, docs, lint, generated-artifact, and production-host proof. | Local handoff |

Decision brief:
- outcome: remove state/capability construction and hidden delayed work from every interactive read while preserving coherent committed and transaction-local semantics.
- chosen shape: one lazily built, frozen, live `EditorStateView` per editor extension-registry identity and state-transform generation; one cached root-view projection per base view; configuration-scoped method-only read groups; recursive direct-read facades that invoke inside `editor.read`; Plate-specific capability-tree compilation; synchronous selector invalidation with only explicit opt-in deferral.
- strongest rejected alternative: keep the current plugin-context cache and hide remaining selector work behind two animation frames. It improves mutation timing while preserving hot work, stale UI, long tasks, and behavior races.
- consequence: normal public call sites remain unchanged. Read factories that publish data values, execute document reads while constructing their namespace, or rely on per-read side effects become invalid and must move dynamic work into methods or stable host services into `api`.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Committed state view | `getStateView` allocates core APIs, transforms, and every extension state group on every `editor.read`. | Cache one live frozen view by current registry object plus host-transform generation; document commits do not invalidate it. | Plite `public-state` / extension registry | Methods already read live editor state; rebuilding object topology per read is false work. | Internal; no app call-site change. | Factory-count/identity tests; 1-vs-100 plugin benchmark; reads across commits. | Candidate publication, rollback, transform replacement, and construction reentry. | rearchitect |
| Root-scoped view | `withViewState` rebuilds wrappers for every view read. | Cache one projection per editor view and base-state-view identity; mutable view flags and current selection remain live. | Plite `editor-runtime-view` | Otherwise named roots retain the same allocation defect. | Internal to `createEditorView`. | Main/named-root reads, selection, read-only, reconfiguration tests. | Wrong root or stale view after source reconfiguration. | rearchitect |
| Extension `read` contract | Factory result is unconstrained in Plite and rebuilt per read; Plate deep-merges contributions each time. | Factory runs once per extension configuration and returns a callable method tree. Dynamic document values are method results; constants/services belong in `api`. | Plite extension types/compiler; Plate authoring types | This makes caching truthful and matches all inspected production owners. | 16 production read-owner files and 17 portal-consumer files already use methods; update invalid type fixtures/docs only. | Positive/negative type tests, runtime validation, declaration emit. | Undetected construction-time state reads or exotic data-property consumers. | hard cut |
| Direct extension reads | `readExtensionProperty` captures a method during a read, then invokes it after the read boundary; dynamic paths are not cached. | Stable recursive path facade resolves and invokes the method inside one `editor.read` call every time. | Plite lifecycle API; Plate plugin portal delegates | Direct and callback reads must have identical write guards and current configuration. | Existing `editor.read.foo.method()` and `editor.plugin(Foo).read.method()` calls unchanged. | Read-method write attempt throws; reconfigure/remove uses new group; nested method path tests. | Retained old wrapper must not call removed capability. | rearchitect |
| Transaction reads | Transaction view spreads a freshly built state view; read groups close over that transaction's current dynamic state. | Reuse cached state/read group topology; methods continue resolving the active draft, while transaction view/token guards remain per transaction. | Plite `public-state` | Removes repeated read compilation without weakening draft visibility. | No public call change. | Earlier-write visibility, detached spec, rollback, `txRead`, history tests. | Accidentally binding committed state instead of active draft. | rearchitect |
| Runtime selectors | Explicit-editor hooks silently queue all commit-driven updates after two animation frames. | Delete implicit scheduling; synchronously invalidate the selector store and let equality/`shouldUpdate` suppress renders. Keep existing explicit `deferred` options where callers opt in. | Plite React | Hidden delay violates external-store coherence and merely moves latency. | Remove the new coalescing test; retain public hook signatures. | Same-commit toolbar state, rapid commits, selection/focus, tearing and render-count tests. | Removing delay before reads are cheap can restore jank; execute after view/cache slices. | cut |
| Plate capability merging | General descriptor `mergePlugins` scans/deep-clones runtime `api`/`read`/`update` capability values. | Add a small capability-tree merger with source-order precedence, plain-record recursion, array/function replacement, freezing, and read/update method validation. Keep `mergePlugins` only for plugin descriptors. | Plate Core runtime lowering | Generic plugin merging is the wrong owner and remains hot for update groups. | Repeated `.extend()` stages keep the same method namespaces and precedence; nested method trees preserved. | Capability composition/conflict/precedence tests; CPU profile removes lodash/opaque scans. | Subtle difference from lodash merging for unsupported exotic values. | rearchitect |
| Plugin access cache | Current local candidate caches portal/context objects and one plugin context per lowered plugin. | Keep it, add identity/lifecycle tests, and let cached read facades resolve the current compiled owner. | Plate Core plugin context | This is a valid partial optimization and useful stable identity. | No call change. | Exact descriptor, replacement, disabled/missing, cleanup, retained portal tests. | Strong retention until editor GC; expected editor-owned lifetime. | keep |
| Find/Replace and Select undo | Current candidate duplicates decorated paragraph text and leaves a tag/empty paragraph after undo. | Land exact red behavior tests first; rerun after shared lifecycle repair; fix decoration/DOM/history owners only if still red. | Plite React DOM/history plus feature owners | Perf work cannot be accepted with deterministic corruption. | No API expansion. | Exact model + DOM + selection + follow-up typing replay, 5 stable runs. | Shared repair may expose a separate bug. | gate |
| List/full-kit residuals | List Enter and full-kit routes retain 100 ms-class work and long tasks. | Reprofile after shared lifecycle/merge repair; patch only remaining package-owned algorithms. `legacy-list-model` remains maintenance-only proof. | Shared runtime first; List/React owners second | Avoid optimizing examples before removing multiplicative shared work. | Modern List/package proof plus classic regression route only. | Enter/type/undo/burst/long-task cohorts. | Residual behavior may be legitimately feature-specific. | gate |
| Perf oracle | Existing editor-perf input uses imperative insertion and fanout covers one store plugin; it missed real plugin-count/read-view scaling. | Add `plite-read-view-lifecycle` target plus trusted route cohort and cold/warm separation. | Plite benchmark target + browser harness | Structural invocation counts prevent benchmark theater; real input protects user latency. | Register target; promote repeated actions into `@platejs/browser`/owning runner. | Strict metric artifact, target tests, final Chrome/CI replay. | CI variance if absolute targets lack structural counters. | rearchitect |
| Teaching and doctrine | Docs teach call sites but not factory lifetime; current hook JSDoc teaches implicit post-paint scheduling. | Teach configuration-scoped read method namespaces, coherent callbacks, current direct invocation, and explicit-only deferral. Reaffirm Vision and repair affected skills during execution. | Plite docs, Plate plugin docs, Vision, best-api worker chain | Public semantic hard cut needs one current teaching story. | Current-state docs only; changesets for affected packages. | Docs audit, stale phrase search, generated skill parity. | Stale worker skills could reintroduce the rejected model. | rearchitect |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 0. Lock red oracles and target | regression + benchmark owners | State-view factory counts; invalid read outputs; direct-read boundary; Find/Select; List/full-kit metrics. | Accepted plan and current baseline. | New cases fail for the intended reason; benchmark emits structural metrics. | Focused Bun/Vitest tests, target self-test, trusted route repro. |
| 1. Stable Plite read view | Plite core | Cache key/invalidation, read group validation, recursive direct facade, state-transform generation. | Slice 0 red. | One factory build per configuration; direct and callback reads are coherent/current. | Plite read/extension/configuration/state-view tests + benchmark. |
| 2. Root and transaction adoption | Plite core/view/history | Cached root projections; active-draft/spec/history laws; stale-generation handling. | Slice 1 green on committed reads. | Named roots and transaction-local reads use cached topology without stale data. | Root/view, transaction, command, history, collaboration tests. |
| 3. Plate capability compiler | Plate Core | Keep plugin-context cache; replace hot `mergePlugins`; cache read paths; tighten read/update authoring types. | Plite cache contract green. | Plate lowering builds read groups once/config and update groups without descriptor merge machinery. | Core resolve/plugin portal/type/declaration tests and CPU profile. |
| 4. Remove hidden React delay | Plite React | Delete double-rAF queue; restore synchronous selector invalidation; preserve explicit defer. | Slices 1-3 make reads cheap. | Toolbar/chrome state is coherent in the publishing commit with bounded renders. | Hook/store tests, focused typecheck, browser selection/focus/typing. |
| 5. Close behavior and residual perf | regression + feature owners | Find/Select exact fixes if still red; reprofile List/full-kit and fix only residual owners. | Shared lifecycle green. | Zero corruption; route thresholds pass without delayed work. | Trusted Chrome/Playwright rows, package tests, bursts, long-task metrics. |
| 6. Adopt teaching and ship proof | Plite/Plate docs + workflow owners | Docs, Vision reaffirmation, best-api repair chain, changesets, lint/check/review, generated registry/pushed-ref replay. | Implementation and behavior green. | No stale teaching; all handoff gates and exact final-ref proof pass. | Docs audit, `pnpm install`, checks, P2 autoreview, CI-generated route replay. |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Read topology is configuration-scoped, not document-revision-scoped. | `getStateView` methods read live editor state; extension registry publishes immutable object identities/revisions. | Factory invocation count is 1 initially, unchanged across 1,000 reads, 100 commits, and transaction specs; increments once after successful configuration publication. | verified |
| Reconfiguration and host transforms invalidate exactly. | Registry candidate/current objects and `setEditorStateViewTransform` are the only topology owners. | Successful replace/remove, failed validation, rollback, and transform install/restore tests; no removed method remains reachable through a retained direct facade. | verified |
| Transaction reads stay live. | `getUpdateView` is already token-cached and reads the active draft through dynamic editor state. | Earlier write is visible through core and extension read groups; detached spec and history rollback remain exact; leaked transaction method still throws. | verified |
| Root views stay correctly scoped. | `withViewState` wraps one base view for a fixed mutable `ViewState`. | Primary/named root, selection root, read-only/focus/composing, reconfigure, and content-root tests. | verified |
| Public read calls remain best. | 16 production read-owner files and 17 portal-consumer files use callable methods; docs teach direct and callback forms. | No production call-site migration except invalid data-property fixtures; type/declaration/docs examples compile. | confirmed planning target |
| Invalid read outputs fail closed. | Current Plite result is `unknown`; Plate only requires `object`, so state-derived data properties can become stale under caching. | Type errors and runtime diagnostics for primitive/array/data-property groups and construction reentry; `api` remains the stable-value channel. | verified |
| Direct reads execute inside the read boundary. | Current `readExtensionProperty` captures inside read and invokes afterward. | A read method that tries `editor.update` throws in direct, callback, portal, nested, and name-only paths. | verified |
| React no longer hides work. | Current local hook explicitly schedules after two rAFs; provider hooks already expose opt-in `deferred`. | Same-commit UI coherence, rapid-commit batching through React, no tearing, no implicit timer/rAF, selector equality and `shouldUpdate` counts. | verified |
| Warm read cost is width-independent. | CPU profiles show `getStateView`, Plate `read`, and `mergePlugins` scale with installed plugins/subscribers. | Registered `plite-read-view-lifecycle` target: warm factory calls 0; 100-plugin/1-plugin p95 ratio <=2; 100-subscriber no-op selectors do not render. | verified: ratio 0.8026239516122342; warm factory calls 0 |
| User-visible editing closes. | Current trusted audit: Find 23.9 ms/key and corruption; List Enter 105.8 ms; full-kit 121-149 ms max long tasks. | Find/full-kit type p95 <16 ms, every median delta <20 ms, no >=50 ms long task, burst <=1.25x main, exact Find/Select undo, focus/selection/follow-up typing green. | verified: 40/40 production-host rows plus strict Chromium |
| Mount does not regress. | Warm current matrix is flat/faster; cold candidate proof is blocked by stale generated registry. | Final pushed CI-generated ref: cold and warm route cohorts, no >=20 ms median regression, matching bundle fingerprints. | N/A: no pushed ref or release was authorized; local interaction proof is fingerprint-matched |
| Retention stays bounded. | Cache retains one view/method tree per live editor/configuration instead of transient trees per read. | Reconfigure/teardown retained-heap and WeakRef/cleanup test proves old groups collect when no caller retains them. | N/A: heap and retention were explicitly removed from this performance closure |

Conditional evidence:
- High-risk scenarios: (1) cached group survives extension removal/replacement;
  (2) transaction method reads committed rather than draft state; (3) named-root
  view leaks primary-root selection/data; (4) removing deferral reintroduces
  synchronous jank; (5) decoration/history replay corrupts DOM/model after undo;
  (6) cached closure retains deactivated plugin/Yjs/DOM resources.
- External research: N/A. The defect and target law are established by current
  source, source-mapped profiles, tests, and real browser evidence; no external
  editor precedent can change ownership.
- Issue/PR provenance: N/A for planning. The performance audit is local and no
  public claim or tracker mutation is part of this goal.
- Browser/benchmark/docs/release/behavior-law owners: browser and benchmark
  proof are mandatory; Plite/Plate docs and changesets apply; release/publish
  is N/A unless separately requested, but final pushed-ref CI proof is required
  before any fixed/completed claim.

Findings:
- `readEditor` calls `getStateView` for every read. `getStateView` reconstructs
  the complete core method graph, applies the host transform, invokes every
  registered state-group factory, and freezes a new object.
- Extension registries are immutable publications with stable object identity
  and a configuration revision. This is the correct cache boundary; document
  commits do not change read topology.
- Core state methods read current editor/draft storage when invoked. A stable
  view therefore preserves coherent committed reads and active transaction
  reads as long as topology invalidates on configuration/transform changes.
- `getUpdateView` is already cached per active transaction token/spec context.
  It spreads `getStateView`; caching that base view removes repeated read-group
  construction from transactions without caching the transaction itself.
- Root editor views rebuild `withViewState` on every read even though root and
  view owner are stable. Base-view identity is a sufficient projection cache
  key.
- Current Plite read factories are unconstrained; current Plate read groups are
  objects. All 16 inspected production read owners return callable methods,
  including callable History state, and all 17 production portal-consumer files
  invoke methods. No production consumer needs a state-derived read data field.
- `readExtensionProperty` invokes the actual extension method after the
  `editor.read` callback has exited. Direct and callback syntax therefore do
  not currently share the same write guard or reconfiguration lookup.
- The local partial fix correctly caches plugin access/context objects, but it
  still executes Plate read factories and generic deep merging through every
  rebuilt state view.
- The local `useEditorRuntimeState` fix queues implicit selector work after two
  animation frames. This contradicts the existing explicit `deferred` model
  and the no-hidden-latency doctrine.
- Existing editor-perf input uses imperative insertion and the fanout case owns
  only one store plugin. Neither exercises real beforeinput, plugin-width read
  construction, direct read boundaries, or configuration invocation counts.
- Current trusted audit evidence remains decisive: minimal burst is near main,
  but Find/Replace, full-kit routes, List Enter, and two undo behaviors fail.

Decisions and tradeoffs:
- Preserve `editor.read.<group>.<method>()`, `editor.read(fn)`, extension
  `read: ({ state }) => ({ method() {} })`, and Plate portal call sites. They
  already express the right jobs.
- Hard-cut read factory data outputs and construction-time document snapshots.
  Stable values/services use `api`; live values are returned by read methods.
- Cache by immutable configuration identity, never by document revision. A
  revision cache would rebuild on every keystroke and preserve the defect.
- Keep lazy view construction so activation order remains valid. Failed
  construction does not publish a partial cache; reentrant `editor.read`
  during factory construction fails with a focused diagnostic.
- Keep one current cache entry, not a historical registry map. Rollback or a
  later publication rebuilds from the currently published registry and lets
  obsolete groups collect.
- Preserve nested callable method trees and source-order override semantics;
  replace generic descriptor merging with a small capability-tree merger.
- Remove implicit double-rAF scheduling only after core and Plate read
  construction is cheap. Explicit caller-requested deferral remains a separate
  opt-in job.
- Do not optimize `legacy-list-model` architecture. Use its user-facing regression
  as proof of the shared owner; patch classic code only if a residual bug
  remains after the shared repair.
- Do not add a public cache, snapshot, signal, compiled-read handle, or
  invalidation option. Those are internal lifecycle responsibilities.

Review fixes:
- Best-API lens rejected changing the normal call site: the defect is lifecycle
  and ownership, not syntax.
- Best-API lens added the method-only read output hard cut; otherwise cached
  state-derived data properties would be silently stale.
- Plate Plan lens moved generic capability merging out of `mergePlugins` and
  made current plugin-context caching an explicit keep rather than replacing
  the whole portal layer.
- Plite Plan risk review added root-view, transaction-draft, reconfiguration,
  direct-read-boundary, and retention proofs before performance acceptance.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| `pnpm --filter @platejs/core exec vitest` had no package-local Vitest binary | 1 | Run the same focused files through root Bun with the Plite source preload. | 77 Core tests passed. |

Verification evidence:
- `bun test --preload ./config/plite-source-test-setup.ts ./packages/plite/test/extension-namespaces-contract.ts ./packages/plite/test/extension-configuration.test.ts` -> 61 pass.
- `pnpm --filter @platejs/plite-react exec vitest run --config ./vitest.config.mjs test/use-editor-runtime-state.test.tsx` -> 4 pass; confirms the current implicit post-paint behavior is intentionally tested and must be cut.
- `bun test --preload ./config/plite-source-test-setup.ts ./packages/core/src/internal/plugin/resolvePlugins.spec.tsx ./packages/core/src/lib/plugin/createPluginContext.internal.spec.ts` -> 77 pass.
- Source audit: immutable extension registry identity/revision, transaction-view token cache, state/view construction, Plate capability lowering, direct read facade, and selector scheduling all inspected in current checkout.
- Bounded adoption audit: 16 production read-owner files inspected; 17 production plugin-portal consumer files; every live consumer uses callable methods.
- Trusted audit artifacts: `.tmp/full-mount-edit-audit/current-summary.json`,
  `current-editing.json`, `current-warm-mount.json`, burst and source CPU
  profiles; completed source plan
  `docs/plans/2026-08-18-full-non-huge-mount-and-editing-performance-audit.md`.

Final handoff prepared:
- Ownership and target API/runtime: Plite owns stable read/view topology,
  transaction/root semantics, and React coherence; Plate owns capability
  compilation/portals and feature adoption. Public calls stay; read output
  semantics hard-cut to configuration-scoped callable method trees.
- Public breaks and Plate/collaboration adoption: invalid data-property or
  per-read-side-effect factories are deleted/moved to methods or `api`; no
  production caller migration found. History/Yjs/root-view laws receive focused
  proof, not bridges.
- Applicable browser/benchmark/docs/provenance decisions: registered structural
  benchmark and trusted route cohort required; docs/Vision/skills/changesets
  apply; external provenance and publication are N/A.
- Proof and execution risks: reconfiguration, active draft, named roots,
  synchronous React notification, decoration/history, and retention are hard
  gates. Final current-tree proof is not a shipped claim.
- Execution order and user attention: slices 0-6 above are complete. Only
  commit/push/release authority remains outside this local goal.

Execution closure:
- Plite caches one frozen read topology per published extension configuration,
  keeps root and transaction projections live, validates callable method trees,
  preserves Function reflection on the root callable, and binds cleanup to the
  durable editor/descriptor identity rather than bookkeeping object identity.
- Plate compiles capability trees once, retains exact plugin portals, rejects
  primary-mark callable read roots, preserves callback inference, and fails DOM
  text sync closed for every unscoped text transform. `targetPlugins` remain
  element-only by compiler law.
- Plite React publishes selector invalidation synchronously, synchronizes safe
  text DOM in place, remounts unsafe custom shells, and coalesces one selection
  export after node-local DOM rebinding. The exact DOM-import regression passes
  five consecutive production-browser runs.
- Extension publication keeps schema bootstrap eligibility across later
  configuration-only commits, reports rollback cleanup failures, preserves
  retained candidate portal identity, and recomputes dependency and slot
  ownership from the surviving graph.
- `pnpm check:plite` passed: typecheck, package tests, contracts/public
  declarations, and Chromium with 698 passed, 6 skipped, and all 78 bounded
  batches green.
- `plite-read-view-lifecycle` passed 111 correctness tests with width ratio
  `0.8026239516122342` and zero warm factory calls.
- The final production `www` host passed 40/40 rows: five interaction routes,
  Find/Replace exact history/follow-up typing, Select exact undo, and Select
  empty-result Enter preservation, each repeated five times. Eighteen critical
  source fingerprints matched the host.
- `www` typecheck, docs/API-reference parity, registry changelog generation,
  Plate Next resource parity, lint, and debug-marker scans passed. The local
  scratch host's pre-existing missing `link-toolbar` docs-source diagnostic is
  noisy but non-fatal; the production build and exact routes completed.
- Two review findings were rejected with executable proof: the Yjs exact export
  smoke passes all 17 rows, and mark-targeted injection is impossible because
  model compilation rejects non-element `targetPlugins`.
- This is a verified local candidate only. No commit, push, PR, CI run, release,
  issue comment, or shipped claim was made.

Timeline:
- 2026-08-18T15:20:35.958Z Plite Plan created.
- Requirements, deep mode, execution boundary, owners, and evidence surfaces materialized before architecture work.
- Root/Common/Plite/Plate Vision, both named plan skills, Autogoal, Best API and required references, Plite agent start, current docs, source, tests, benchmark control, and prior audit evidence read.
- Current focused contracts passed: 61 Plite tests, 4 Plite React tests, and 77 Plate Core tests.
- Best-API target locked; Plite decision ledger and Plate adoption slices completed.
- Risk cases, proof thresholds, behavior gates, and final handoff prepared.
- `check-complete.mjs` passed on the final plan.
- 2026-08-19: slices 0-6 completed; strict, production browser, benchmark,
  generated docs, lint, and bounded P2 review closure executed on the final
  local tree.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Slices 0-6 are complete and verified in the local current tree. |
| Where am I going? | No further implementation step; commit/push/release remains separate user authority. |
| What is the goal? | Remove hot-path read/capability construction and hidden delayed work without stale committed, transaction, root, history, or browser behavior. |
| What have I learned? | See Findings |
| What have I done? | Implemented the accepted architecture and closed its strict, browser, benchmark, docs, lint, and review gates. |

Open risks:
- The result is local and unpushed. CI, release, and shipped-state claims remain
  unverified until separately authorized and replayed on the pushed ref.
- External consumers may expose invalid read data-property factories that are
  absent from this checkout; the major changesets and runtime diagnostics make
  that hard cut explicit.
- Heap/retention measurement was intentionally excluded by user direction;
  lifecycle cleanup behavior is covered, but no heap claim is made.
