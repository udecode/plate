# Package-owned Comments data

Objective:
Consumers fetch database-friendly comment records with document ranges, pass them to the Comments plugin, and persist records with current mapped ranges. The package owns comment data operations, editor binding, subscriptions and cleanup. Copied UI owns presentation.

Goal plan:
docs/plans/2026-09-09-comments-package-data.md

Template:
docs/plans/templates/plate-plan.md (scoped under Task)

Task source:
The user accepted the setup redesign and clarified: consumers store comments with ranges in the database, fetch them and plug them into the plugin; all integration belongs in the package. Task implementation is authorized. This supersedes earlier plans' prohibition on package/data-owner changes.

Completion threshold:
One package contract loads and exports serializable records, maps ranges through edits/history, preserves comment actions and suggestion replies, and handles independent editor instances without consumer anchor effects or copied channels/providers. All live consumers, docs and teaching adopt it; focused package/type/scale proof, generated registry/install proof and affected real-route desktop/narrow checks pass with exact limits recorded.

Verification surface:
platejs/comments package, existing Comments tests/benchmarks, copied Comment/Discussion UI and tests, discussion-demo, editor-ai and discussion-proof routes, comments docs, exported entrypoints and doctrine mirrors. Expand the consumer manifest from live source before deletion.

Constraints:
Current checkout next (verified before mutation). Local implementation and evidence only; no commit, push, PR, external messages, worktree or template edits. Sequential execution follows the user's tool mapping. No Autoreview on next. No second runtime store, public compatibility alias, backend client or invented database schema. Plain ranges belong to the same persisted document revision; runtime handles remain editor-local.

Boundaries:
Plate owns the new comment model/actions and integration; Plite retains native range mapping/history. Copied UI retains styling, avatars, discussion composition and async form presentation. Actual database/network I/O stays application-owned.

Blocked condition:
An unavailable runtime or dependency prevents exact remaining proof after concrete inspection; continue every independent authorized action. Difficulty, old plan constraints and a pending design experiment do not block implementation.

Task state:
- status: done
- current_phase: complete
- next: none; local implementation and verification are complete

Work Checklist:
- [x] Read Poteto Principles in full before implementation. Source: Poteto Mode. Load and record matched leaves at their decision.
- [x] Capture user authority, Task workflow and native goal; existing API review and live sources establish the two-phase setup burden. Source: Task workflow; Autogoal.
- [x] Read the applicable full Feature/Architect, Best API, Plate Plan, Plugin Creator, Plate UI, Testing, Verify Plate and Benchmark methods; persist additional obligations here as they arise.
- [x] Enumerate current package, copied UI, example, proof, docs and export consumers; record owner survival/deletion and API adoption in this plan. Source: Best API bounded manifest and hard-cut gates.
- [x] Choose the normal load/edit/save call shape, database-friendly dates/ranges, async save semantics and per-editor lifetime. Package ownership supersedes copied channel machinery. Source: user correction; Best API/Architect.
- [x] Freeze and run a matched current-owner versus target scale probe before accepting runtime machinery; preserve native correctness, counts, timings/noise, source identity and final rerun. Source: Best API scale gate; Benchmark.
- [x] Implement one canonical package model, actions, mapped-range loading/export and cleanup with inference/JSDoc and focused public-boundary proof. Source: Plugin Creator, Testing, Verify Plate.
- [x] Migrate all live UI/examples/proof consumers, remove copied channel/provider/manual anchor effects, keep feature defaults with copied source and preserve Discussion behavior. Source: Plate UI; user target.
- [x] Adopt public docs and exports; run barrels and registry generators, affected package/app source types and scoped lint, fresh copied install where required. Source: AGENTS.md, Task docs, Verify Plate.
- [x] Repair affected source doctrine, smallest Vision owner and versioned Plate Next doctrine; regenerate mirrors and verify stale teaching is gone without rewriting immutable history or attestations. Source: Best API repair.
- [x] Verify real discussion-demo/editor-ai routes and narrow state, history/range roundtrip and independent editors; rerun final production scale cohorts. Source: Verify Plate; explicit acceptance.
- [x] Reconcile original method checklists, inspect the owned final result, validate this plan, record evidence/limits and mark the native goal complete only after acceptance. Source: Autogoal.

Decisions and tradeoffs:
- Model the Domain will separate serializable thread data from private native handles; private handles cannot be database records.
- Subtract Before You Add removes the public copied channel/provider and host coordination rather than wrapping it in another controller.
- Old proof remains evidence for the old implementation only; no native, performance or browser parity claim transfers automatically.

Execution slices:
1. Package contract and disposable scale probe; decide ownership before mutation.
2. Package implementation and public behavior/type proof.
3. Complete copied/UI/docs adoption and generated outputs.
4. Final package, scale, route and doctrine proof; local handoff.

Throughput checkpoint:
One sequential writer; batch independent reads and checks. Use existing tests and scale harnesses rather than creating a parallel verification inventory. Preserve useful receipts across source-stable checks. No delegated or cross-family review is claimed.

API design and adoption ledger:
| Surface | Current | Proposed target | Owner | Adoption and proof | Verdict |
| --- | --- | --- | --- | --- | --- |
| Thread loading and actions | Copied channel containing native handles | Serializable CommentThread records, native handles private, keyed actions and reads in one semantic Comments plugin | Package Comments | Package lifecycle/roundtrip tests; copied consumers | Accepted by paired owner and production probes |
| Plugin setup | Channel-bound factory plus host effect | Stable BaseCommentsPlugin and live CommentsPlugin; initial records as an explicitly named initialization input, later setThreads/getThreads through the API | Package Comments | Headless and React entrypoints; generic inference and two-editor proof | Accepted by paired owner and production probes |
| UI access | Copied CommentsProvider carrying channel and exact descriptor | Existing Plate provider and installed CommentsPlugin API | Copied Comment/Discussion | Composer, mixed suggestions, AI drafting and optional absence tests | Cut copied provider/channel |
| Positions | App-created native handles | Package-created handles, canonical Annotation projection, JSON range reads and exports | Package Comments over existing Plite | Save/reload after edits, deletion/undo/redo, independent editors | Preserve native law |
| Feature defaults | Host styling, slots and shortcut repeated | Copied feature composition with package-owned begin action | Copied Comment/Discussion | Both demos and copied editor-ai installs | Move |

Architect sketch (sequential under the user's tool mapping):
- Ground: source flow is host -> channel records and anchor source -> package annotation/activation -> copied provider/hooks -> Discussion. Live APIs and Sept 5/9 plans establish the rationale: avoid document-owned application persistence and cross-editor handles. The user's current instruction changes the package boundary; it does not change native-handle ownership. No remote historical claims are needed for this local redesign.
- Candidate A: store the full live thread array in the ordinary plugin store; actions replace arrays, selectors find records and every subscription observes each store publication. Small public surface, but payload writes visit unrelated records/subscribers and transient activation can touch the same broad store.
- Candidate B: one package-owned keyed thread model plus the existing annotation projection, with initialization records accepted through the plugin and later writes/reads through its API. Membership and records retain targeted subscriptions; the seed input is explicitly initialization-only so it cannot masquerade as live thread state. Private handles never enter public records. The package owns lifetime; copied source only renders it.
- Criteria: direct JSON load/save; no host anchor/provider protocol; one authoritative live record owner; bounded keyed metadata work; independent model/view lifetimes with native history.
- Both candidates are reviewed against Architect's shallow-module, leakage, temporal-decomposition and pass-through checks. No independent Arena judge is claimed because the user requires sequential execution. Agree has no human checkpoint under the active implementation authority; implementation follows a passing probe. Scrap is triggered if repeated owner/inference workarounds are needed.

Scale contract (frozen before target execution):
- Embedded architecture probe, not a broad Benchmark performance claim. Existing copied channel is the baseline; disposable package-owned input/output model is the target. A plugin-store array is the competing instrument.
- Cohorts: 2, 100, 1000 and 10000 threads; two messages per thread; one long text node; one metadata subscriber per thread; one anchor-source observer. Independent native guard uses two editors and edit/undo/redo/save/reload.
- Actions: load complete records/ranges; edit one existing message; read unchanged membership and another thread; export mapped serializable records; clear and release.
- Deterministic budget: body edit wakes exactly one thread subscriber, zero membership subscribers, zero anchor subscribers/resolutions; one bulk load publication; one handle per range thread; one release per retired handle. No new polling, global metadata scan or per-mounted-view data copy.
- Timing/noise: three interleaved baseline/target packets, two warmups, 20 measured metadata edits per packet; record raw timings and p50/p95, no p99 claim. A metadata regression is material only above both 25% and 1 ms per edit; loading/export only above both 25% and 10 ms at 10000 rows. Preserve inconclusive timings; deterministic/native failures always fail. No general typing-latency claim.
- Identity: hash captured baseline, prototype, fixture, package lock and actual native source imports; record Bun/environment and exact command. Final package reruns the same cohorts/actions and native guard before closure.
- Headless owner probe is decisive for this contract; route mount and trusted editing remain correctness gates in final verification. Main/Slate comparison is N/A for this embedded ownership probe because no comparative product/substrate performance claim is requested.

Method obligations added at design:
- [x] Keep both distinct sketches, selection/graft rationale, actual source flow and exact public imports together here. Source: Feature, Architect/Arena, How, Why (existing explicit plan rationale, no historical claim).
- [x] Preserve the three current high-risk scenarios: stale persisted range after edit; replacement/releases breaking another editor or undo; async rejection losing the draft. Hard cut all old public bindings in the same adoption wave; no compatibility runtime. Source: Plate Plan.
- [x] Package API factory captures the exact command view; data owner is shared only within one editor model. Lifecycle rollback and extension removal release private resources. Source: Plugin Creator, native activate contract.
- [x] Verify native callbacks consuming staged API, dependent access to staged capabilities, and semantic-base versus thin React adaptation. Transaction-stage reuse and supplied-state-query tests are N/A unless implementation introduces those contracts. Source: Plugin Creator.
- [x] Append decision checkpoints through Show Me Your Work's helper and reconcile them against actual actions at handoff; no independent trail review is requested. Source: Show Me Your Work.
- [x] Source imports and API JSDoc remain canonical; no callbacks gain explicit type annotations to hide inference failures. Source: Best API, Plugin Creator.

Design decision:
Candidate B wins. `CommentsPlugin.configure({ initialState: { initialThreads, users, currentUserId } })` accepts fetched records directly; `api.setThreads(records)` replaces data after an explicit refetch; `api.getThreads()` returns current serializable records for saving alongside the matching editor value. `initialThreads` is an honest one-time seed, like the editor's initialValue; it is not the live thread authority. Current records remain private/keyed, not mirrored in the broad plugin store. The existing store owns activeIds/currentUserId/users, while the package data owner retains targeted thread/membership subscriptions. BaseCommentsPlugin owns semantic data/range operations; CommentsPlugin adds only live interactions. No copied channel, explicit provider, public source, handle, or bind method survives.

Pre-acceptance receipt:
- `artifacts/comments-package-data/probe-result.json` passes all 2/100/1000/10000 cohorts and deterministic/native guards. At 10000 rows the keyed target's message-edit p95 is 0.00375 ms versus 0.00383 ms baseline; load p50 42.57/49.77 ms and export p50 6.84/7.40 ms. These are instrument results over the existing owner, not a speed claim or final package proof.
- The broad plugin-store candidate wakes all 10000 subscribers for one metadata edit (2.77 ms observed); the keyed candidate wakes one and leaves anchor/membership work at zero. Reuse the keyed model and native mapping law inside the package, avoiding a new steady-state layer.
- Original `probe-initial-result.json` is retained. It charged JSON parsing only to the target's load and failed the 10000-row timing comparison; corrected measurement parses the identical fetched JSON before both timed operations. The initial editedAt roundtrip also caught a Date leak in the instrument; ISO normalization now covers creation and edit timestamps. Production must prove those contracts directly.
- Exact command: `bun run --preload ./config/plite-source-aliases.ts ./docs/plans/artifacts/comments-package-data/probe.ts`. Bun flag-order attempt only printed help and is not a receipt. Baseline input hashes are in baseline-identity.json; instrument hashes/runtime are in probe-result.json.

Verification evidence:
- Intake: current branch next; create_goal returned an active native goal for this objective.
- Current CommentsPlugin owns annotation/activation but consumes an already-bound source. Copied CommentThread stores native handles; two shipped consumers repeat channel/plugin setup and an anchor-binding effect.

Open risks:
- Persisted ranges need a matching document revision; mapping must retain deletion/undo intent and avoid exporting a false live position.
- Async save rejection must retain composer content and pending anchors.
- Metadata-only edits must not resolve every anchor or repaint editor nodes; large loads and view fan-out need executable proof.
- Existing broader comments browser failures from the prior loading plan are not presumed resolved or pre-existing for this change.


Implementation checkpoint (September 10):
- BaseCommentsPlugin owns serializable records, actions, targeted subscriptions, private anchors and annotation projection. CommentsPlugin is the thin interaction adapter. The copied channel/provider/manual anchor API is removed from live source; demos use complete CommentThread fixtures directly in initialThreads, with CommentKit/DiscussionKit providing presentation defaults.
- Users/currentUserId remain ordinary plugin store fields. Redundant user getter/setter/subscription API methods were cut; copied UI uses usePluginStore and store.set.
- Native initialization runs after publication. Staged readers can see prepared records before range binding, failed activation clears staged records, and invalid initial range binding remains unavailable through every subsequent API read. Plate plugins are fixed after model publication, so a runtime Plate-plugin removal test was invalid; record retirement, rollback, observer detach/remount and independent editor tests cover the actual supported lifetimes.
- Model selection is shared by views of the same document root. Calling-view permission is separate. The React test checks the current selection at each command and the caller's read-only state, not invented independent selections for same-root views.
- Package tests: 20 pass / 129 assertions across Base and React Comments. Copied Comment/Discussion: 12 pass / 71 assertions. AI async comment lifecycle: 8 pass / 60 assertions, including mapped drafts during await and stale-result disposal. These receipts precede final source closure.
- The generated-runtime Comments factory adapter is cut; both new package entrypoints use the ordinary plugin runtime proof. The old React-only annotation facade is deleted. Immutable probe captures remain intact; derived baseline runtime files only relocate the retired pure facade import.
- The first final production probe caught a material setup regression at 10000 records: target 583.24 ms versus baseline 114.73 ms. Keyed edit p95 was 0.00804/0.00487 ms; export 2.07/11.27 ms. The production comparison includes editor construction and initial annotation projection on both sides; the earlier disposable probe measured the data slice only. Thresholds and cohorts are unchanged. Original failure is retained in production-probe-initial-result.json/log.
- CPU profile attributes most setup cost to repeated cloning/freezing of plugin initialState. The scoped foundation repair brands inert, internally owned immutable data so configuration/store snapshots can reuse it. Nominal plugin references, opaque resources, accessor rejection, and editor-local reference canonicalization keep their original paths. Initial Comments records reuse those owned snapshots; live refetches still copy caller data. Existing store/descriptor/source-resolution and Comments suites pass 126 tests / 384 assertions. Final scale rerun pending.
- English and Chinese Comments feature pages have been rewritten around fetched records and load/save. Discussion and AI pages, current source doctrine/Vision/version append, generated API reference/registry and browser/install checks remain unfinished.

Browser repair checkpoint:
- First complete browser run: 11/26 pass, 13 fail, 2 explicit main-deployment comparison skips. No prior browser completion is claimed. Failure logs/screenshots are preserved under artifacts/comments-package-data/browser-first-results with source identity.
- comments:hydrated-input (proof readiness): discussion-proof renders static records on the server; visibility no longer proves a mounted editor. The old openDemo helper allowed native input before React hydration, producing mismatches with text already changed in the DOM. Reuse the existing createPliteBrowserEditorHarness.ready mounted-handle check, preserving real pointer/keyboard actions and all original outcome assertions.
- comments:accept-keeps-comment (Plate copied UI, focus ownership): on /blocks/discussion-demo at 1280 and 390 px, click the overlapping annotation and Accept its suggestion. Expected: suggestion disappears, comment remains open, undo restores suggestion, and follow-up editor input works. Both the existing browser test and in-app Browser reproduce the popup closing. SuggestionDiscussionCard manually focuses the editor after both actions; the outer FloatingPopover already owns closing and focus restoration. Delete those competing focus calls. Red proof uses real clicks and unchanged browser assertions; first-divergence is focus-out dismissal after the action. No substrate change is indicated. Final local proof must repeat this focus case five times without retries on a fresh serving process, including keyboard reachability, viewport bounds and follow-up input.
- These are first diagnosis/red-proof findings during an API implementation, not failures of a previously claimed browser fix. Patch supplies the focused repair method; no new goal or review budget is created.


Final adoption and verification checkpoint:
- The live consumer denominator covers the semantic and React Comments exports; public type contracts and runtime entrypoint proof; copied Comment, Discussion, toolbar/block/context actions, AI menu and chat lifecycle; discussion-demo, editor-ai and discussion-proof; English and Chinese Comment, Discussion and AI docs; generated API reference and registry output. Historical migration documentation and immutable plan/probe captures retain their original contract. The final stale-contract scan finds only content/docs/migration/v48.mdx among current documentation/source search results.
- Exact public imports are `BaseCommentsPlugin`, `CommentThread` and data types from `platejs/comments`, and `CommentsPlugin` from `platejs/comments/react`. Configure `initialState.initialThreads` from fetched records; read `editor.plugin(CommentsPlugin).api.getThreads()` with `editor.read.value()` to save. Explicit refetch uses `api.setThreads(records)`. The native primary-document anchor and annotation owners survive; the copied data channel, provider, source protocol, factory and manual binding effects are deleted. Database transport and copied UI remain independent current jobs.
- All method reads and applicable obligations are reconciled. The full Feature/Architect alternatives and reuse rationale are recorded above. Plugin creation includes staged reads, post-publication initialization, failed initialization/rollback, observer detach/remount and private resource retirement. Dynamic Plate-plugin removal is unsupported by the existing immutable model and is not claimed. Contextual inference remains intact. Same-root view selection is model-owned; command permission is calling-view-owned. Core reference identity, cycles, accessors, opaque resources and immutable caller-data isolation are covered by existing owner tests, with added array-contained reference coverage.
- Final behavior receipt: `artifacts/comments-package-data/behavior-final-closure.log` passes 178 tests, 714 assertions, 11 files. The 21 Comments package/React cases include mapped save/reload/history, atomic invalid replacement, per-editor independence, named-root rejection and asynchronous presentation guards. Final source-first package typechecking passes all 82 tasks in `package-types-closure.log`; full www typechecking passed in `www-types-final-source.log`. Scoped lint passes, including the final immutable-array change.
- Barrels, the 102 entrypoint configs, API-reference generation, and registry generation passed. `registry-complete.log` covers 367 canonical items and 15 overlay families. Current public docs and source rules teach package-owned record loading. Doctrine v180, generated mirrors and all 153 registry changelog events validate; existing immutable doctrine history and package attestations are preserved.
- `browser-closure-full.log` covers the full 26-row Comments browser denominator: 24 pass and 2 explicit external main-deployment comparison skips because no PLATE_MAIN_BASE_URL is supplied. Native typing/history, mixed comments/suggestions, AI draft acceptance/rejection, independent editable/read-only/static documents, mapped persistence, desktop/narrow/touch UI and both language docs pass. `browser-closure-repeat.log` adds five retry-free executions of each of the five focus/keyboard/narrow/touch cases (25 pass). Current-source final replay follows the last private setup optimization; the earlier receipts remain identified as earlier source.
- Fresh copied installation passed all four editor-basic/editor-ai Base-Nova and Radix-Luma consumers, including production builds, source paths and React/React DOM/DnD peer resolution. `copied-consumers-browser.md` records real in-app Browser typing/undo, mixed suggestion acceptance with the comment kept open, successful replies and desktop/narrow inspection. Its observed narrow CSS viewport is 433 px because of the existing browser zoom; the repository tests separately cover exactly 390 CSS px. Final package build revalidation follows the private setup optimization.
- Packed-package proof covers four packages, 84 public subpaths, 79 Node runtime imports, 42 React-free headless entrypoints, one DOM-free SSR case, 41 exact optional-peer closures, NodeNext/Bundler declarations, DCE and exact entrypoint size baselines. The new headless Comments entrypoint adds a measured baseline. The whole-checkout size refresh also includes an existing Footnote React import of NavigationFeedbackPlugin; that separate committed dependency explains its roughly 491 KB bundled increase. No bundle-size improvement is claimed.

Final scale decision:
- The first production load of 583/115 ms exposed repeated immutable setup copies. Retaining owned immutable input and constructing the annotation index from complete records removed most of that work, but repeated later runs still exceeded the frozen threshold. Those failures remain preserved; isolated passing runs were not accepted as closure.
- The decisive final change treats an immutable array as one reuse boundary. Its descendants are still copied and recursively frozen, but do not each need separate reuse tracking. Comments recognizes the owned array at its input boundary. Arrays containing plugin references, functions or opaque resources do not qualify as inert data; editor-local reference resolution and caller isolation remain authoritative. The temporary Map cache and timestamp cache experiments were rejected and are absent from final source.
- The first two consecutive final-candidate runs pass all four original cohorts, all native/deterministic guards and unchanged budgets. At 10000 rows their load p50 values are target/baseline 121.51/113.26 ms and 124.27/106.76 ms. Metadata p95 remains below 0.007 ms, waking one thread subscriber with zero membership or anchor work. Export p50 is about 2 ms versus 6.5-7 ms. This is a scoped ownership/setup acceptance result, not a general typing-latency or platform performance claim. Raw samples and identities are retained in production-probe-array-ownership-result.json and production-probe-array-repeat-result.json; final source fingerprint replay is recorded separately.

Limits:
- Persist plain ranges with the matching primary document revision. Named secondary document roots are rejected. Database writes, collaboration transport and authorization remain application-owned.
- The browser claims cover source-mode www and actual copied production consumers; no external main comparison, Firefox/WebKit matrix, raw mobile device, deployment or release claim is made.
- Work is local and uncommitted; no push, PR, external message or publication was authorized.


Scale sampling refinement, frozen before the final rerun:
The three final-candidate processes produced three packets each. Two process medians passed and one exceeded the threshold, despite unchanged executable source. Across all nine retained packets, load p50 is 122.96 ms target and 107.38 ms baseline; every native/work-count guard passes. The separate copy microprobe shows the WeakMap traversal at 31-44 ms and the temporary Map alternative at 37-50 ms, so WeakMap remains. To resolve small-sample GC/host variance without choosing a favorable process, the next fresh production run uses nine interleaved packets per cohort. Cohorts, operations, warmups, 20 measured edits per packet, baseline implementation, p50/p95 definitions and every absolute/relative acceptance threshold remain unchanged. All nine new packets count; the original three-packet receipts remain available, including the failed replay. No additional source optimization or tolerance change is bundled into this sampling refinement.


Final scale receipt:
`artifacts/comments-package-data/production-probe-nine-packets-result.json` passes all 72 measured setup samples (four cohorts, nine paired packets), all native guards and unchanged deterministic budgets. At 10000 rows: load p50 120.41 ms target / 107.48 ms baseline (+12.0%, +12.94 ms); metadata p95 0.00575/0.00454 ms; export p50 2.03/6.79 ms. Only one metadata subscriber wakes; membership and annotation work stay zero; allocation/release counts match. The final source hashes are included. The expanded sample resolves the small-sample timing gate without discarding the failed three-packet replay or changing its original verdict.


Final source-route replay:
`browser-closure-array-full.log` passes 24 of 26 cases with the same two explicit external main-baseline skips, on PID 43002 serving `/Users/zbeyens/git/plate-2/apps/www` at localhost:3297 from fresh `.next-comments-package-closure` output. `browser-closure-array-identity.json` records 802 inputs; direct readback after the full run finds zero changed fingerprints. The final range/data/core source is also the source in the nine-packet scale receipt.


Final artifact and repeat receipts:
- `packed-package-closure.log` verifies the final packed runtime/declarations, headless/SSR/optional-peer boundaries, DCE and all 84 exports. `entrypoint-size-closure-deltas.json` compares the final measured sizes to the captured pre-task snapshot: headless Comments is 860871 bundled bytes, React Comments adds 7248 bytes, and the already-existing Footnote React dependency accounts for a 490833-byte increase in the whole-checkout refresh.
- `browser-closure-array-repeat.log` passes all 25 retry-free focus/keyboard/narrow/touch repetitions on the final source. This is the same five cases repeated five times, with no weakened assertions or hidden skips.
- Final production scale identity readback matches every recorded source input; source-route identity readback matches all 802 recorded inputs. The earlier three-packet replay remains a failed diagnostic, while the separately declared nine-packet acceptance result is the final receipt.


Local handoff:
The final copied-install replay passes all four Base-Nova/Radix-Luma basic/AI consumers in `create-install-closure.log`; `copied-consumers-closure.json` preserves their final build IDs, source hashes and manifests. The source server and copied-consumer servers are stopped, Browser overrides/tabs from manual proof are restored/closed, and both task-owned copied-install workspaces are removed after preserving evidence. The current repository templates were not edited.

All source-linked work and method checklists above are reconciled. Every decision-log evidence path resolves; its historical partial or failed results remain historical and the final rows identify the actual accepted receipts. No independent agent review is claimed or required on next. Local package/data API, complete consumer/docs adoption, doctrine generation, entrypoint/install proof, actual-route browser proof and the scoped scale gate are complete. No commit, push, PR or publication was performed.
