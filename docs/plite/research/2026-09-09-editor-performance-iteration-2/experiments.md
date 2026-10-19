# Independent experiments

The largest measured opportunity is full-DOM mount and structural editing. The strongest precisely scoped deletion to test is narrower: stop copying every hidden node key when the virtualization boundary only consumes the endpoint keys. Neither finding justifies replacing the document model, removing React, or adding a second state system.

This is a portfolio of questions, not a cascade of implementation phases. Run one intervention at a time. A failed experiment does not unlock the next design; it changes the ranking. The first iteration's five phases remain historical evidence, with all 65 earlier candidate IDs reconciled in [the candidate ledger](../../../plans/artifacts/2026-09-09-editor-performance-research-iteration-2/prior-candidate-reconciliation.md).

Priority means current value under Best API. Opportunity estimates are judgments about the amount of work that could disappear, not predicted benchmark results. No percentage below is a promised gain. Every performance experiment requires the same source, fixture, enabled features, operation, native/model oracle, build and sampling contract. Run an unmodified control before and after the candidate; retain failure and outlier samples. Reject any improvement that comes from delayed completion or a weaker editing contract.

| ID | Verdict | Priority | Opportunity | Confidence | First decisive question |
| --- | --- | --- | --- | --- | --- |
| E01 | Pursue | P1 | Very high across large documents | High problem; low cause | Where does full-DOM mount spend its additional 474 ms versus ProseKit at 10k? |
| E02 | Pursue | P1 | Very high for structural editing | High problem; low cause | Which model, publication, React and DOM work explains the 10k split and marked-typing gap? |
| E03 | Pursue | P1 | High in code-heavy documents | Medium | Can the highlighter consume a bounded change without rebuilding the complete block? |
| E04 | Pursue | P1 | High for large tables | Medium, from prior exact tests | Which remaining table-selection work survives the adopted coordinate-cache change? |
| E05 | Pursue | P2 | Potentially large background work in diagram documents | High source; export tradeoff open | Can rendering follow preview/export demand without degrading either action? |
| E06 | Defer | — | Potentially high with many subscribed nodes | Medium mechanism; unproven attribution | Is the generic selector adapter material after the current Compiler and fanout controls? |
| E07 | Defer | — | Potentially high during long AI responses | High source; unmeasured route | Does complete Markdown reparse dominate generation-mode preview settlement? |
| E08 | Defer | — | Potentially high in large drawing scenes | High source; unmeasured scene | Is whole-scene serialization material in the actual Excalidraw callback path? |
| E09 | Defer | — | Up to the explicit 100 ms delay in one menu path | High source; unmeasured route | Is actual emoji search cheap enough to remove the debounce safely? |
| E10 | Defer | — | High only with many Find matches | Prior complete experiments failed | Can one owner remove both rescan and match-publication cost? |
| E11 | Defer | — | Conditional allocation/locality gain | Medium | Which current subscribed consumer still performs work proportional to unrelated nodes? |
| E12 | Stop | — | No current hot consumer established | High negative search | Do not build a facet fast path from a microbenchmark without a real hot caller. |
| E13 | Stop | — | Blanket text-storage rewrite loses its premise | Measured probe | Scattered edit-only wins disappear when every edit materializes the full string. |
| E14 | Stop | — | No equal-contract GPU gain established | High source constraints | Do not replace native rich-text layout/input/accessibility with a universal GPU renderer. |
| E15 | Defer | — | Build time; no typing benefit assumed | Current official lead | Is Oxc output equivalent and materially faster for our real package and copied-source builds? |
| E16 | Defer | — | Startup and download only | Medium | Which configured-feature-equivalent consumer bundle retains unnecessary code? |
| E17 | Defer | — | Retained heap and long-session stability | Current owner benchmarks | Which retained object graph grows after history truncation and view teardown? |
| E18 | Defer | — | Geometry bursts and overlay settlement | Medium | Are repeated same-revision geometry reads material after the DOM scheduler? |
| E19 | Pursue | P2 | Removes allocation proportional to unmounted content | High source; tiny target | Can missing-range boundary payloads use endpoint keys without slicing every hidden key? |
| E20 | Defer | — | Potentially high for huge paginated documents | Medium | Is the page-plan full scan material in real forward and backward scrolling? |
| E21 | Defer | — | Paint savings while retaining DOM | Established technique; local parity open | Which content-visibility cohort passes Find, print, selection and overlay behavior? |
| E22 | Defer | — | Very high DOM reduction with a different presentation contract | Current experimental implementation | Does viewport omission remain useful after materialization and native-service costs? |
| E23 | Defer | — | Compiler-friendly virtualizer reads | Medium | Can one immutable window snapshot replace repeated mutable reads without stale geometry? |
| E24 | Pursue | P2 | Correctness coverage; no latency promise | Exact donor proof gap | Does primary pointer entry into a nested editor clear inactive selection before mousedown? |
| E25 | Defer | — | Missing direction/writing-mode product behavior | Current source gap | Which explicit local text-direction contract is required beyond native bidi navigation? |
| E26 | Pursue | P1 | High in documents with many decoration sources | Fresh isolated owner benchmark | Why does provider/bucket setup exceed mount and update budgets while reads and cleanup pass? |

## E01 — full-DOM mount ownership

Current: the common renderer creates the editor, React root, node renderers, view registrations and subscriptions, then mounts all paragraph DOM. The 10k full-DOM p95 is 528.3 ms for Plite and 1,018.5 ms for Plate, against 54.1 ms for ProseKit. The 100-paragraph controls are 38.5, 60.4 and 16.3 ms. This is a scaling problem, not only fixed setup overhead. The measurement includes two animation-frame opportunities; it is not network or first paint.

Strongest target: one view-owned mount traversal should publish canonical node/view registrations once, with only subscriptions that serve a current reader. Test deleting duplicate per-node setup, wrapper stores or reconciliation passes before introducing a cache. The relevant current owners are `react/components/editable-text-blocks.tsx`, `react/components/editable-rendered-element.tsx`, `react/hooks/use-node-selector.tsx`, `react/hooks/use-generic-selector.tsx` and the exact view boundary graph under `packages/plitejs/src`. Plate's feature composition stays a separate measured layer.

Internal flow to test: `canonical document + mounted view → one keyed registration/publication pass → requested React renderers → DOM`. This is a proposed internal direction, not a new public API. Public `createEditor`/React composition and custom renderer contracts remain the control. Removing React entirely would duplicate arbitrary React renderer, portal and native-view ownership; the current evidence does not earn that replacement.

First packet: production uncompiled and compiled mount traces at 100/1k/10k; count node/leaf fibers, selector stores, subscribe calls, layout/insertion effects, model construction and DOM insertion separately. Try one deletion only after its cost is identified. Accept only if the complete-operation reduction exceeds control drift, 20% and 4 ms at 10k, with normal-cohort p95 within 10% or 2 ms of control, whichever is larger. These are acceptance thresholds, not forecasts.

Proof: custom element/leaf renderers, inline inferred callbacks, portals, two views of the same model, duplicate IDs, nested editors, read-only mounts, mount/unmount soak, selection restoration, SSR/hydration where applicable, equal full DOM and final source fingerprints. Primary next owner: `$benchmark` on full-DOM mount attribution; use Plite Plan only after an owning design is supported. No dependency on E02–E25.

## E02 — structural edit publication and rendering

The corrected core comparison adds a separate batch-shaped symptom: at 1,000 blocks, moving a 32-block window takes 140.83 ms p95 in Plite versus 1.18 ms in Slate; removing the window takes 119.28 versus 1.10 ms. A separate complete-final-state replay verifies both outputs, including descendant properties, text, order and selection. These are 51-sample programmatic batches, not single native keystrokes. Separate repeated-transaction publication from work inside each move/remove before selecting an intervention.

The same stronger replay finds different final states for expanded deletion, mixed fragment insertion and wrap/unwrap; those rows receive no speed rank. Establish their intended public operation contract before comparing throughput. Four read-only lanes still lack exact query-output equivalence, so the recorded point-walk timing is not an equivalent-navigation win. These comparison gaps do not prevent independent attribution of the verified move/remove symptom.

Current: native input reaches the canonical transaction, changed-node publication, React render selectors and DOM commit boundary. At 10k, split p95 is 95.7 ms Plite / 139.9 ms Plate / 14.4 ms ProseKit. Bold-then-type is 105.6 / 75.7 / 51.0 ms. A ten-character burst is 225.1 / 107.0 / 84.7 ms; it is not ten independent per-keystroke samples.

Strongest target: keep one canonical structural change and view-scoped dirty-node authority; delete any whole-document read, broad callback walk or redundant React pass that does not serve changed content. `public-state.ts`, `use-node-selector.tsx`, the view graph and `editable-dom-commit-fence.tsx` are current owners. A global scheduler or another event bus loses to eliminating the work at its owner.

First packet: isolate split, join, bold-type, undo and large selection replacement. Capture changed nodes, root-order changes, global and keyed callbacks, React commits, text projection, DOM writes and layout. Compare the current Compiler arms before choosing a renderer intervention. Keep text-only and structural actions separate: a zero-render native character is not proof for a split.

Acceptance: at least 20% p95 reduction in the exact slow action, larger than control drift, while preserving complete settlement, native/model selection and history. Reject when work is moved behind the recorded endpoint. Primary next owner: `$benchmark` on structural edit attribution. Plite owns canonical publication; Plate is dependent only for feature adapters.

## E03 — complete incremental code highlighting

Current: the code feature reads changed block text and parses it before reusing token identities. The first iteration improved native paths but retained a red 10k-line code case. The line-offset scan inspected in the conversion helper is not the typing path and is excluded as a cause.

Strongest target: changed text plus canonical ranges feed one bounded parser/token projection owner. Delete repeated full-text tokenization and duplicate token materialization if an actual incremental grammar can preserve complete output. Use the existing specialized CodeMirror view as the first alternative; it already owns long-text layout but has an omitted-DOM contract. Do not silently remove highlighting above a size threshold.

Public control: current CodeBlockPlugin configuration and language selection. Proposed changes are initially private; no new parser configuration namespace is earned. Required laws: grammar state across edited lines, multiline constructs, language changes, grapheme/UTF-16 offsets, undo/redo, paste, selection, SSR/static output and native/CodeMirror parity. Measure keystroke-to-complete-highlight, parser CPU, DOM update, worker transfer/startup and memory at 100/1k/10k lines. Reject a worker whose complete latency or retained memory exceeds the synchronous control. Primary next owner: `$benchmark` for the current 10k-line code route; Plate owns parsing, Plite owns native projection only if implicated.

## E04 — table selection after the first iteration

Current: table coordinate reuse and resize work were already improved; table selection remained slow. The target is current `BaseTablePlugin` and its topology/coordinate consumers, not replaying the old resize gain.

Strongest target: one canonical table topology owner answers selection and cell-range queries; remove repeated geometry or reconstructed cell maps inside the actual pointer/keyboard selection operation. Public table commands and JSON remain unchanged in the first experiment. Reject memoizing a stale topology or relying on an old table object across merged cells.

Measure native drag selection, shift-arrow extension, merged cells, row/column insertion, paste and undo at multiple table shapes with equal cell counts. Include selected-cell painting and toolbar settlement. Keep resize as a control. Primary next owner: `$benchmark` on table-selection attribution; Plate Plan owns any topology redesign, with Plite only if canonical node/change contracts must change.

## E05 — render diagrams on preview/export demand

Current: `apps/www/src/registry/components/editor/code-drawing.tsx` schedules rendering from code, language and server changes; the effect does not depend on the selected code/preview view. `packages/platejs/src/code-drawing/lib/renderers.ts` creates a Graphviz instance for each render; Mermaid uses a shared initialization, Flowchart cleans temporary DOM, and PlantUML may fetch remotely. The outer effect ignores stale completions but does not cancel remote work.

Proposed owner: the existing CodeDrawingElement effect owns rendering demand and the existing renderer adapter owns reusable engine lifetime. Test withholding background rendering in code-only, inactive blocks; entering preview must render the latest code exactly once. The Export control currently depends on the rendered image even in code view, so blindly adding a `view === 'code'` early return would remove a current job. Compare preview-or-visible-export demand with explicit render-on-export and reject either if export readiness or completion becomes unacceptable. Keep the public CodeDrawingPlugin and serialized element shape. Do not add a preview manager, visibility store or global renderer registry. A cached Graphviz engine is a separate experiment after the demand policy.

Deletion: timer/import/parse/render/network work when neither preview nor export needs the result. Proof: inactive code-only edits perform zero renderer calls; preview activation and PNG export use the latest code; rapid code/language/view changes cannot publish stale SVG; unmount removes timers and temporary DOM; error UI, read-only preview and external-server policy remain correct. Browser timing must include activation to final SVG and click to downloadable PNG, and cancellation must be tested for each adapter. Primary next owner: `$plate-plan` for CodeDrawingElement rendering-demand ownership. This is a bounded private/copied-source experiment, independent of kernel experiments; the export tradeoff remains unresolved.

## E06 — selector snapshots and React Compiler

Current `useGenericSelector(selector, equalityFn)` owns a `useSyncExternalStore` version object plus a committed selector/value/error record. It commits the latest inline callbacks after render and intentionally uses `use no memo`. `useNodeSelector` routes node changes and skips already-synchronized text where legal. ProseKit's derived-value hook demonstrates a compiler-observable value, while its `useEditor({update: true})` explicitly cannot make a stable mutable editor reactive.

Strongest alternative: the canonical subscription owner publishes a selected immutable snapshot; one selector adapter consumes that snapshot. Delete the version/committed-value coupling only if the same concurrent-render and callback laws survive. Screen the official `useSyncExternalStoreWithSelector` implementation before inventing another adapter. Public callback inference, optional-store behavior, equality and view routing are hard controls, not incidental signatures to annotate around.

Defer the rewrite until E01/E02 or the canonical fanout target proves this adapter material. Prior Phase 4 selector attempts are negative evidence. Removing `use no memo` merely to increase compile counts is Stop. Required proof includes aborted render, changing inline selector/equality, render errors, changes between render and layout commit, unsubscription, multi-view and published/copied-source compiled consumers. Primary next owner: `$benchmark` for selector allocation and fanout attribution; Best API only if a public contract change is justified.

## E07–E11 — feature work with a decisive missing measurement

- **E07 AI:** `useAIChat.ts` already owns editor sessions, views, cancellation and transport teardown. Generation preview reconstructs assistant text and deserializes growing Markdown. Compare full parse, incrementally retained completed blocks, and a worker on identical streams. Keep final output, partial syntax behavior, abort and last-view destruction. Insertion mode already uses deltas and is a separate control. Defer until the real generation-mode trace establishes cost; Plate's AI owner is next.
- **E08 Excalidraw:** `useExcalidrawSync.ts` serializes the whole scene on callbacks before string equality. Test scene-change identity or the drawing library's canonical revision signal before a parallel dirty model. Preserve external updates, files, echo suppression, history clearing and teardown. A text-editor benchmark says nothing about 10k drawing elements; benchmark that actual scene first. Next owner: Benchmark on Excalidraw scene-change settlement; reject if serialization is immaterial or equal scene changes stop reaching the model.
- **E09 emoji:** `createEmojiSearch.ts` scans and sorts the actual dataset before limiting results; one registry consumer adds 100 ms debounce. Measure the installed dataset, complete menu rendering and selection first. If search is cheap, delete delay before implementing top-k machinery. Keep exact ranking, locale/grapheme behavior, keyboard navigation and IME. The other picker consumer has a different timing path. Next owner: Benchmark on both emoji-menu consumers; reject delay removal if it creates a material input/render regression.
- **E10 Find:** `BaseFindPlugin.ts` rescans on document commits, then publishes all matches. Phase 3's rejected/inconclusive attempts prevent another scan-only success claim. A useful owner would maintain matches from canonical changed blocks and publish only changed rendering payloads. The decisive packet is query/edit-to-all-visible-matches plus count, active match, navigation, replacement and undo, including whole-document replacement. Defer until this complete intervention is designed; no new search namespace is accepted. Next owner: Benchmark on complete Find publication, with a stop when rendering consumes the apparent scan gain.
- **E11 publication:** node-keyed sources, lazy snapshots and several read reductions already exist. Measure actual global subscribers and Plate store readers after the first iteration. Only a demonstrated unrelated callback/serialization fanout earns a field-specific publication change. Facets, annotation overlap indexes and correction precompilation are not substitutes for locating the active caller. Next owner: Benchmark on commit-to-consumer fanout; reject any design that duplicates authority or misses a required subscriber.

## E12–E18 — explicit rejection and narrower follow-ups

- **E12 Stop facet micro-optimization:** source search found no first-party production facet-read hot caller beyond the facade. The current cache owner remains. No consolation implementation is queued.
- **E13 Stop blanket piece tree:** the disposable VS Code probe measures 200 insert/delete pairs, not editor keystrokes. At 10k lines, scattered edit-only p95 was 4.204 ms for strings and 0.141 ms for the piece tree; adding a full-string read after each pair changed it to 4.555 versus 8.798 ms. Adjacent edits and full reads have different outcomes. Preserve the canonical document representation. A specialized future consumer that never materializes full strings would be a new question, with history, CRLF/UTF-16, memory and serialization proof.
- **E14 Stop universal GPU rich text:** VS Code's GPU path explicitly excludes RTL, very long columns, complex decorations and unsupported CSS. Native rich-text selection, accessibility, IME, print and arbitrary React node views add further jobs. No current equal-contract measurement earns the duplicate architecture.
- **E15 Defer Oxc:** current Sanity guidance identifies an experimental faster transform path. Compare build CPU and equivalent emitted/compiled behavior in a disposable consumer. Keep Babel for unsupported custom JSX cases. This can improve build latency; it is not an editor runtime optimization by itself. Tooling/package-build is next.
- **E16 Defer bundle cuts:** compare identical configured features, including codecs, CSS, runtime commands and copied-source usage. Inspect actual emitted reachability before deleting namespaces or export boundaries. Cold import, parse/evaluate and mount are separate clocks. Next owner: Benchmark with Verify Plate's emitted-consumer checks; reject a smaller bundle that drops configured behavior or merely shifts load to first use.
- **E17 Defer retention redesign:** current history depth, retained-memory, collaboration-readiness and view-lifecycle results own their exact scopes. A heap slope needs an object retaining path after truncation/teardown. Delete that ownership leak or redundant retained value; do not conflate undo data with saved product revisions. Next owner: Benchmark on retained-object paths after cleanup; reject a memory reduction that weakens history or remote-update semantics.
- **E18 Defer geometry coalescing:** current DOM read/write scheduling and layout equality are controls. Count reads by view/root/revision and include overlay settlement. A stale rectangle after scrolling, font/image load or a nested view is an immediate rejection. The DOM geometry owner is next only if repeated current reads are material.

## E19–E23 — virtualization experiments

See [the separate virtualization analysis](virtualization.md). These do not pay down the full-DOM E01/E02 gap by omitting content. E19 is a precise deletion; E20–E23 each have an independent evidence gate.

## E24 — nested inactive-selection timing

ProseKit's virtual-selection tests require clearing the inactive selection before primary mousedown inside a nested editable, while retaining it for secondary click and non-editable controls. Current Plite's inactive-selection owner uses a marked-control policy and focus listeners; the existing example verifies that policy but does not prove the exact before-mousedown transition.

Keep Plite's private exact-view routing. Adapt the portable timing invariant as a focused native browser replay, explicitly separating the product decision about general blur from the nested-pointer law. No second focus coordinator or reference editor API is proposed. Test primary/secondary pointer, nested editable, non-editable toolbar, portals, duplicate model IDs and selection restoration in both views. Primary next owner: `$regression` for the exact nested inactive-selection proof case. This proposal is a proof adaptation; no failing local behavior has yet been established.

## E25 — direction is a product contract

The current feature inventory has no textDirection/writingMode owner. Native bidi movement and explicit document direction are different jobs. A future shape should make direction a normal schema-backed block property under Plate's style/model owner; no global direction engine or duplicated caret state is justified. Preserve serialization, nesting, CSS writing-mode geometry, list/table inheritance and clipboard behavior. Defer priority until the required current product behavior is specified. This gap prevents an all-features superiority claim but does not explain the measured paragraph timings.

## E26 — decoration-manager setup and updates

The registered owner benchmark passed every deterministic subscription, fanout, wrapper and cleanup check, but failed timing guards in the large, stress and pathological cohorts. At 10k nodes/32 sources, production-manager mount p95 was 264.94 ms versus 144.80 ms for the benchmark's per-node/source baseline; update was 2.01 versus 0.82 ms. The manager also reduces subscriptions and removes transient renderer reads, so deleting it wholesale would throw away measured benefits. The source owner is `packages/plitejs/src/react/decoration-source.ts#createPliteDecorationManager`.

Pursue a trace of setup, source reads, attribute compilation, bucket creation and changed-bucket publication. The strongest target is one source-owned compiled representation with no work for absent node/source intersections; remove repeated per-node compilation before adding a second cache. Public decoration-source definitions and source order remain the controls. Required proof: equivalent attributes/wrappers, stable unchanged bucket identity, exactly affected wakes, zero retained observers after destroy, add/remove/reorder source behavior and the complete large-source browser route. Accept only when the exact failed mount/update budgets pass and read locality remains intact. Primary next owner: `$benchmark` on decoration-manager setup/update attribution; Plite Plan owns any representation change. This is a new current result, independent of the broad full-DOM mount attribution.

## Decision after every experiment

Keep an intervention only when its complete operation improves beyond repeated-control drift, the exact native/model/feature contract passes, and no material neighboring action regresses. Revert failed candidates and preserve their measurements. A successful private optimization does not automatically earn a public API. A source-only lead does not become an adopted roadmap item. Re-rank the remaining independent questions using the new causal evidence.
