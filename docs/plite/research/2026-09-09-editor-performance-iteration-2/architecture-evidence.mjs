// Source assessments for this research iteration. The renderer uses the repository scorer.
export const evidence = [
  {
    id: 'plite.document',
    file: 'representation.ts',
    grades: '3333222',
    owner:
      'Canonical document construction owns text coalescing and structural values; public JSON remains the interchange contract.',
    lifetime:
      'Persistent snapshot identity permits lazy derived indexes to follow a document revision.',
    boundary:
      'The representation stays below React and Plate feature composition.',
    api: 'Node and text reads expose the document contract without requiring a second mutable text buffer.',
    scale:
      'Flattening and coalescing allocate strings during structural construction; a giant leaf is a different workload from many paragraphs.',
    correctness:
      'Any alternative must preserve UTF-16 offsets, mark boundaries, node keys and serialized roots.',
    proof:
      'Current document tests and common paragraph operations exercise different subsets; neither proves a piece-tree replacement.',
    falsifier:
      'A matched large-leaf edit/read/serialize probe with retained-memory evidence can justify a private representation change.',
  },
  {
    id: 'plite.change-algebra',
    file: 'mapping.ts',
    grades: '3333222',
    owner:
      'Canonical change mapping owns position transport; feature adapters should consume it instead of maintaining parallel maps.',
    lifetime:
      'Mappings belong to a change sequence and the roots addressed by that sequence.',
    boundary:
      'Mapping is a substrate contract shared by history, annotations and collaboration.',
    api: 'Association and root semantics must remain explicit at change boundaries.',
    scale:
      'Ambiguous token fallback and repeated mapping composition need attribution by changed size and retained history depth.',
    correctness:
      'Deleted endpoints, root creation/removal and undo recovery forbid a text-only shortcut.',
    proof:
      'Existing change and anchor contracts establish semantic guards; current compressed-representation timing is absent.',
    falsifier:
      'Count normal and fallback mappings in the exact slow operation before changing storage or algorithms.',
  },
  {
    id: 'plite.transactions',
    file: 'public-state.ts',
    grades: '3333232',
    owner:
      'One transaction draft publishes canonical changes, selections, state fields and listener notifications.',
    lifetime:
      'Draft state is isolated until commit; listener snapshots are computed lazily for their consumers.',
    boundary:
      'Publication owns the transition from model mutation to subscribed readers, without a second event-state model.',
    api: 'Read and update facades separate observation from mutation but retain a large internal implementation owner.',
    scale:
      'Notification routing and snapshot construction are distinct costs; full sparse-publication attribution is still required.',
    correctness:
      'Rollback, nested transactions and publication order constrain batching.',
    proof:
      'Transaction contracts and common native guards are available; a global average cannot certify publication locality.',
    falsifier:
      'Instrument changed roots, touched nodes, global callbacks and snapshot builds in a matched subscriber-width run.',
  },
  {
    id: 'plite.reads',
    file: 'editor-read-runtime.ts',
    grades: '3333232',
    owner:
      'The read runtime resolves installed read definitions through the extension registry.',
    lifetime:
      'Read namespaces and their bindings follow editor configuration rather than individual reads.',
    boundary:
      'The substrate read facade supplies both headless and Plate consumers.',
    api: 'Inferred read namespaces keep callers from constructing resolver objects themselves.',
    scale:
      'Warm reads must not rebuild factories as plugin width increases; the canonical target measures this exact law.',
    correctness:
      'Active drafts, reconfiguration and held facades must resolve current values.',
    proof:
      'Read-view lifecycle contracts and the registered width benchmark are precise available guards.',
    falsifier:
      'Any factory call during a warm read or commit, or stale held facade after reconfiguration, lowers this assessment.',
  },
  {
    id: 'plite.facets',
    file: 'facet.ts',
    grades: '3333232',
    owner:
      'Facet combination and dependency invalidation live in one runtime owner.',
    lifetime:
      'Committed and draft caches are separate; document, root, field, selection and schema dependencies have revisions.',
    boundary:
      'Computed configuration stays in the substrate and is consumed through state reads.',
    api: 'Facet providers declare dependencies and comparison behavior without exposing cache invalidation to callers.',
    scale:
      'A repeated read still builds provider and input arrays before returning unchanged output; a same-revision hit is a testable allocation cut.',
    correctness:
      'Dependency cycles, nested drafts, rollback and schema reconfiguration constrain an early return.',
    proof:
      'Field-facet and facet-draft contracts cover cache semantics; consumer hit frequency and allocation savings need fresh measurement.',
    falsifier:
      'Reject an early-return prototype on any dependency or draft mismatch, or if real consumer reads rarely hit it.',
  },
  {
    id: 'plite.extensions',
    file: 'create-editor.ts',
    grades: '3333232',
    owner:
      'Editor creation compiles extension definitions into one installed runtime and bootstraps the schema.',
    lifetime:
      'Extension setup, configuration replacement and editor destruction determine resource ownership.',
    boundary:
      'Feature composition enters the substrate through extensions rather than through React lifecycle side effects.',
    api: 'Typed extension composition is the common setup path; optional generated contracts should remain optional.',
    scale:
      'Creation and reconfiguration grow with extension width and must be timed separately from editing.',
    correctness:
      'Duplicate keys, failed initialization and reconfiguration rollback require one deterministic result.',
    proof:
      'Extension lifecycle and runtime-view contracts exist; package reachability and broad composition need separate receipts.',
    falsifier:
      'A width trace showing repeated compilation during ordinary reads or edits would justify a stronger cut.',
  },
  {
    id: 'plite.commands',
    file: 'command-registry.ts',
    grades: '3333232',
    owner:
      'The command registry compiles command definitions into the canonical transaction owner.',
    lifetime:
      'Compiled commands follow the installed registry; view binding must resolve the current mounted context.',
    boundary:
      'Domain commands remain callable headlessly while native focus is supplied by the view boundary.',
    api: 'Command definitions preserve inferred transaction callbacks and structured availability.',
    scale:
      'Lookup should be independent of document size; command construction belongs to configuration time.',
    correctness:
      'Read-only views, removed mounts and held command references must not route to a different editor.',
    proof:
      'Command routing and multiview tests provide relevant guards; fresh lookup-width timing remains a separate target.',
    falsifier:
      'Any document scan during command lookup or stale view routing changes the verdict.',
  },
  {
    id: 'plite.schema',
    file: 'correction.ts',
    grades: '3333222',
    owner:
      'Schema correction centralizes repair of document structure under the compiled model.',
    lifetime:
      'A correction plan belongs to configuration and the transaction being validated.',
    boundary:
      'Plate compiles feature rules into the substrate schema instead of owning another normalization loop.',
    api: 'Schema definitions express allowed structure and correction policy at setup time.',
    scale:
      'Repeated setup, changed-region discovery and actual repair are separate growth variables.',
    correctness:
      'Repair must converge and preserve content, selection and collaboration transformations.',
    proof:
      'Correction and schema contracts exist; large flattening costs do not alone identify correction setup as their cause.',
    falsifier:
      'Profile repeated rule setup in a failing correction workload before accepting precompilation machinery.',
  },
  {
    id: 'plite.editing-primitives',
    file: 'insert-soft-break.ts',
    grades: '3333232',
    owner:
      'Editing primitives express document operations through the canonical editor transaction.',
    lifetime:
      'Each edit resolves current selection, schema and root state at execution.',
    boundary:
      'The same primitive underlies headless commands and native input adapters.',
    api: 'Small text and structural commands compose without requiring callers to manufacture low-level mutations.',
    scale:
      'Text-local edits, cross-block deletion and whole-document replacement must remain separate timed operations.',
    correctness:
      'Marks, voids, graphemes, bidirectional text and structural selection create distinct behavior laws.',
    proof:
      'The common benchmark covers only part of the full 212-operation catalog; feature and native cases remain explicit.',
    falsifier:
      'A valid human operation that takes a different mutation path must be added as its own proof and timing cell.',
  },
  {
    id: 'plite.selection',
    file: 'anchor-state.ts',
    grades: '3333232',
    owner:
      'Canonical anchor and selection state owns model positions and recovery across changes.',
    lifetime:
      'References track editor changes and release through their owning lifecycle.',
    boundary:
      'Model selection is independent of DOM focus while supplying the native reconciliation boundary.',
    api: 'Range and anchor contracts represent root and association semantics explicitly.',
    scale:
      'Selection mapping cost grows with live references and change complexity, not merely document length.',
    correctness:
      'Undo recovery, deleted endpoints and named roots must retain exact positions.',
    proof:
      'Anchor and selection contracts complement native model/DOM convergence guards.',
    falsifier:
      'Count live anchors and mapping fallbacks for the slow selection operation before replacing the representation.',
  },
  {
    id: 'plite.history',
    file: 'history-merge-policy.ts',
    grades: '3333232',
    owner:
      'History grouping and recovery remain in the existing history owner.',
    lifetime:
      'Undo groups retain only the changes and recovery required for subsequent undo/redo.',
    boundary:
      'History consumes canonical changes and selections without becoming another document model.',
    api: 'History is an extension with ordinary undo/redo commands and explicit policy.',
    scale:
      'The first iteration removed unused recovery work; retained history bytes and remote interleaving still need independent measurement.',
    correctness:
      'Grouping, redo branching, non-null recovery and remote rebasing prohibit indiscriminate laziness.',
    proof:
      'The earlier accepted cut has focused contracts; this iteration must bind current operation timings to current source.',
    falsifier:
      'A current null-recovery path performing the discarded projection reopens the cause; memory growth needs its own retention trace.',
  },
  {
    id: 'plite.input-runtime',
    file: 'runtime-before-input-events.ts',
    grades: '3333232',
    owner:
      'The input runtime chooses the model or native strategy for each browser event.',
    lifetime:
      'Input state belongs to one mounted editable root and its current document.',
    boundary:
      'Trusted browser events enter through a dedicated adapter before committing domain changes.',
    api: 'Consumers configure behavior through editor composition, not through a parallel event bus.',
    scale:
      'Event dispatch, model mutation, DOM reconciliation and settlement require separate clocks.',
    correctness:
      'Cancellation, selection replacement, history input and clipboard ownership must match native intent.',
    proof:
      'Canonical native journeys and trusted common operations are stronger evidence than dispatchEvent simulation.',
    falsifier:
      'A synthetic event reported as native proof, or an input result without native selection/focus convergence, invalidates the row.',
  },
  {
    id: 'plite.composition',
    file: 'runtime-composition-events.ts',
    grades: '3333222',
    owner:
      'Composition state and platform input engines coordinate native composition with model changes.',
    lifetime:
      'Composition belongs to the active mounted root and ends on commit, cancellation or teardown.',
    boundary:
      'Android and browser composition behavior stays inside native adapters.',
    api: 'Composition is an editing behavior rather than an application-owned synchronization protocol.',
    scale:
      'Long composition spans and large edited blocks need real device latency and complete commit clocks.',
    correctness:
      'IME text, cancellation, replacement ranges and concurrent updates are hard laws.',
    proof:
      'Semantic browser cases cannot stand in for raw Android/iOS keyboard artifacts.',
    falsifier:
      'Real IME replay that loses or duplicates composed text blocks any performance adoption touching this owner.',
  },
  {
    id: 'plite.native-selection',
    file: 'selection-reconciler.ts',
    grades: '3333222',
    owner:
      'The selection reconciler connects canonical model selection to the native range in the exact mounted view.',
    lifetime:
      'Selection listeners, composition guards and pending sync work follow the owner Document and root.',
    boundary:
      'DOM selection does not replace model selection or route by an ambiguous editor identifier.',
    api: 'Native selection is consumed through the view-bound editor contract.',
    scale:
      'Repeated document transport and geometry resolution must be counted at 1, 10 and 100 mounted views.',
    correctness:
      'Direction, focus, nested roots, iframes and stale mounts constrain shared transport.',
    proof:
      'Model/native convergence guards exist; browser-family and real device coverage are independent.',
    falsifier:
      'A shared listener prototype that scans all views or changes selection direction is rejected.',
  },
  {
    id: 'plite.dom-adapter',
    file: 'with-dom.ts',
    grades: '3333232',
    owner: 'The DOM adapter owns model-to-DOM identity and native integration.',
    lifetime:
      'Node/element associations belong to mounted DOM and must disappear with it.',
    boundary: 'DOM services remain outside the headless document core.',
    api: 'DOM resolution and focus are available through the bound editor API.',
    scale:
      'Coordinate lookup, descendant search and reconciliation must be attributed separately.',
    correctness:
      'Detached elements, nested editors and foreign Documents must fail or resolve deterministically.',
    proof:
      'DOM identity and browser suites cover this boundary; packed and source-host proof remain distinct.',
    falsifier:
      'A stale association after remount or a cross-editor resolution invalidates lifetime and correctness grades.',
  },
  {
    id: 'plite.dom-coordinates',
    file: 'dom-geometry.ts',
    grades: '3333222',
    owner:
      'The DOM geometry owner resolves native ranges and positions from current layout.',
    lifetime:
      'Geometry is valid for a layout state and its owner window, not for a document revision alone.',
    boundary:
      'Layout reads remain in the DOM layer rather than in canonical model state.',
    api: 'Consumers request geometry through native services without storing durable coordinates.',
    scale:
      'Range measurement, scrolling, wrapping and repeated subscribers can amplify layout work.',
    correctness:
      'Zoom, direction, resize, scrolling and shadow/nested roots can invalidate cached coordinates.',
    proof:
      'Geometry-oriented browser tests exist; forced-layout attribution needs a diagnostic trace.',
    falsifier:
      'Keep a shared geometry snapshot only if it removes duplicate reads and survives all layout invalidations.',
  },
  {
    id: 'plite.dom-scheduling',
    file: 'dom-phase-scheduler.ts',
    grades: '3333222',
    owner:
      'The phase scheduler centralizes DOM preparation and deferred reconciliation work.',
    lifetime:
      'Scheduled callbacks must be cancelled or rendered harmless when their mounted owner is replaced.',
    boundary:
      'Scheduling stays within the DOM adapter and does not delay canonical model truth.',
    api: 'Callers request owned phases instead of inventing independent frame loops.',
    scale:
      'Coalescing can reduce repeated work but must include the final required state in the completion clock.',
    correctness:
      'Order relative to React commit, native selection and composition must remain fixed.',
    proof:
      'Scheduler/integrity contracts and browser settlement are relevant; a short event handler alone is insufficient.',
    falsifier:
      'Any work moved beyond the measured completion boundary invalidates the apparent speedup.',
  },
  {
    id: 'plite.clipboard',
    file: 'runtime-clipboard-events.ts',
    grades: '3333222',
    owner:
      'Clipboard event handling owns native transfer while content-slice logic owns structured interchange.',
    lifetime:
      'Transfer state is scoped to the gesture, source editor and destination operation.',
    boundary:
      'HTML and feature codecs compose above the substrate fragment contract.',
    api: 'Clipboard behavior accepts normal browser transfers and explicit structured slices.',
    scale:
      'Small paste, large rich paste, Office cleanup and serialization must be timed independently.',
    correctness:
      'Cross-root content, marks, malformed inputs and schema mismatch require explicit oracles.',
    proof:
      'Minimal Plite and Slate common fixtures lack rich-HTML configuration; that is fixture coverage, not engine incapability.',
    falsifier:
      'A paste benchmark that drops formatting or bypasses trusted clipboard input cannot win a rich-paste comparison.',
  },
  {
    id: 'plite.drag',
    file: 'cross-editor-drag-session.ts',
    grades: '3333222',
    owner:
      'A drag session carries source ownership across native events and the eventual destination edit.',
    lifetime:
      'The session ends on drop, cancellation, navigation or owner teardown.',
    boundary:
      'Cross-editor transfer is distinct from Plate drag-handle UI and feature-store state.',
    api: 'Destination behavior consumes an owned session rather than trusting global editor IDs.',
    scale:
      'Pointer movement and auto-scroll are continuous work that Event Timing does not fully expose.',
    correctness:
      'Move versus copy, rejected drops and source deletion must stay atomic.',
    proof:
      'Canonical drag journeys provide outcome guards; continuous trace and native device proof remain separate.',
    falsifier:
      'A destination mismatch or leaked cancelled drag rejects batching and scheduling experiments.',
  },
  {
    id: 'plite.multiview',
    file: 'view-boundary-graph-core.ts',
    grades: '3333232',
    owner:
      'The view-boundary graph owns exact mounted-view relationships while the model remains shared.',
    lifetime:
      'Registration belongs to a mount; shared history and plugin state outlive an individual view.',
    boundary:
      'Private view identity handles portals, nested editors and separate Documents without another public identity system.',
    api: 'Commands use the exact provider-bound editor context.',
    scale:
      'View registration, focus routing and selection transport must be measured independently as views grow.',
    correctness:
      'Duplicate public IDs, stale mounts and per-view read-only state must not change command ownership.',
    proof:
      'Recent multiview contracts cover hard ownership cases; performance still needs matched view-count evidence.',
    falsifier:
      'A command reaching a sibling mount or a shared-history undo restoring the wrong focus blocks adoption.',
  },
  {
    id: 'plite.react-subscriptions',
    file: 'use-generic-selector.tsx',
    grades: '3333232',
    owner:
      'The selector adapter owns subscription snapshots and committed selector identity.',
    lifetime:
      'The latest selector becomes visible in layout commit, preserving abandoned-render isolation.',
    boundary:
      'React subscribes to canonical state instead of holding a second writable document.',
    api: 'Node-key and scoped selectors provide explicit locality without manual callback parameter annotations.',
    scale:
      'Selector calls, notifications and renders are separate costs; equality alone does not eliminate fanout.',
    correctness:
      'Store replacement, equality changes, thrown selectors and concurrent rendering constrain adapter merging.',
    proof:
      'Selector contracts are available; use-no-memo is a semantic boundary rather than automatically a compiler defect.',
    falsifier:
      'A purported optimization that exposes an abandoned render selector or misses a scoped change is rejected.',
  },
  {
    id: 'plite.react-components',
    file: 'context.tsx',
    grades: '3333222',
    owner:
      'React contexts connect an exact editor/view to components and hooks.',
    lifetime:
      'Provider values and resources follow mounted composition and explicit editor reuse.',
    boundary:
      'React components consume substrate contracts; they do not own serialized document truth.',
    api: 'Composition provides context and optional explicit owners for reusable consumers.',
    scale:
      'Provider value churn and broad context reads need render and subscription attribution.',
    correctness:
      'Concurrent rendering, nested providers and optional explicit owners must preserve the same editor.',
    proof:
      'Component and context tests exist; hot-function compiler coverage requires emitted-code binding.',
    falsifier:
      'An unrelated provider change rerendering all node consumers is a measurable locality lead, not proof for a new state runtime.',
  },
  {
    id: 'plite.react-commit',
    file: 'editable-dom-commit-fence.tsx',
    grades: '3333232',
    owner:
      'The commit fence brackets React-owned DOM changes with native runtime preparation and completion.',
    lifetime:
      'The fence belongs to a mounted editable boundary and the current React commit.',
    boundary:
      'A class snapshot lifecycle provides a concrete before-mutation boundary where hooks do not supply the same timing.',
    api: 'This remains internal machinery rather than a public lifecycle protocol.',
    scale:
      'The first iteration reduced redundant commit work; structural and text-only paths remain separate controls.',
    correctness:
      'Selection restoration and external-text synchronization must occur on the correct side of React mutation.',
    proof:
      'Focused commit and native structural receipts exist; fresh fingerprints govern reuse.',
    falsifier:
      'Reject a hook-only replacement unless it proves the same before-mutation law and lowers complete operation cost.',
  },
  {
    id: 'plite.text-rendering',
    file: 'external-text-runtime.ts',
    grades: '3333122',
    owner:
      'The external-text runtime retains text DOM while canonical model changes remain authoritative.',
    lifetime:
      'Bindings follow actual text elements and are repaired or released on structural changes.',
    boundary:
      'React owns structure while the native adapter owns the explicitly retained text mutation path.',
    api: 'Applications consume normal editor behavior without a second document representation.',
    scale:
      'Large native code blocks remain a known expensive path; validation, highlighting and DOM writes need separate attribution.',
    correctness:
      'IME, marks, normalization and selection must converge after every retained-DOM update.',
    proof:
      'Prior 10k-line native input remained over budget; this iteration must replay current source before assigning a cause.',
    falsifier:
      'A proposed skip that misses an actual external mutation or changes code-block selection is rejected.',
  },
  {
    id: 'plite.view-sources',
    file: 'view-source.ts',
    grades: '3333222',
    owner:
      'View sources own derived decorations and widgets against canonical changes.',
    lifetime:
      'Source subscriptions and cached outputs follow activation, refresh and teardown.',
    boundary:
      'Derived view output stays separate from persisted document data.',
    api: 'Feature readers publish decorations/widgets through the existing source protocol.',
    scale:
      'Stable IDs and changed-node routing can bound refresh; dense output and full external refresh remain distinct cases.',
    correctness:
      'Removed sources, dirty nodes and externally refreshed data must never leave stale visual output.',
    proof:
      'View-source contracts provide lifecycle guards; interval indexes need a workload showing actual overlap-query cost.',
    falsifier:
      'Do not add an interval tree unless current queries, output density and update cost show a complete-operation win.',
  },
  {
    id: 'plite.annotations',
    file: 'store.ts',
    grades: '3333232',
    owner:
      'The annotation store maps stable IDs to derived ranges and publishes only changed annotation outputs.',
    lifetime:
      'Activation and destroy are idempotent; external refresh and changed nodes control invalidation.',
    boundary:
      'Annotations remain derived from document and feature state rather than a competing document tree.',
    api: 'The store exposes stable annotation access while owning mapping and subscriber cleanup.',
    scale:
      'Dirty-node updates are local; first activation and full external refresh can still scale with all annotations.',
    correctness:
      'Deleted anchors, remote updates and output-free IDs must be reconciled.',
    proof:
      'Annotation mapping and lifecycle contracts exist; density and churn timing need fresh target evidence.',
    falsifier:
      'An interval-index prototype must beat this existing changed-ID path rather than an invented full-scan baseline.',
  },
  {
    id: 'plite.collaboration-document',
    file: 'controller.ts',
    grades: '3333222',
    owner:
      'The Yjs controller coordinates canonical local commits with the shared document bridge.',
    lifetime:
      'Provider replacement, initialization rollback and destruction own listeners and connection resources.',
    boundary:
      'The adapter translates between canonical changes and Yjs without making Yjs the public editor model.',
    api: 'A collaboration extension composes with editor roots and provider policy.',
    scale:
      'A single changed root without content roots has a fast path; multi-root reconciliation and inverse reconstruction remain separate costs.',
    correctness:
      'Origin filtering, named roots, remote selection and initialization failures forbid broad shortcutting.',
    proof:
      'Yjs contract suites exist; replacement latency and retained provider memory require direct current measurement.',
    falsifier:
      'Keep an incremental bridge only after exact multi-root convergence and local/remote interleaving oracles pass.',
  },
  {
    id: 'plite.collaboration-presence',
    file: 'awareness.ts',
    grades: '3333222',
    owner:
      'Awareness translates collaboration presence separately from durable document updates.',
    lifetime:
      'Presence belongs to a connected client/provider and must disappear on disconnect or replacement.',
    boundary:
      'Remote cursors are view state rather than serialized editor nodes.',
    api: 'Relative selection transport is hidden behind the awareness adapter.',
    scale:
      'Peer count, update rate and cursor geometry are the relevant variables.',
    correctness:
      'Foreign roots, disconnected peers and stale relative positions must not render as current presence.',
    proof:
      'Awareness contracts exist; burst and geometry latency need a dedicated peer-width packet.',
    falsifier:
      'A batching proposal that leaves stale disconnected cursors or reorders required state is rejected.',
  },
  {
    id: 'plite.pagination',
    file: 'page-mount-plan.ts',
    grades: '3333222',
    owner:
      'The page-mount plan derives visible and retained pages from layout fragments.',
    lifetime:
      'Plans follow the layout generation and current selected, composing or promoted pages.',
    boundary:
      'Pagination presentation is separate from canonical document structure.',
    api: 'The existing pagination contract owns page retention and native affordance integration.',
    scale:
      'Building page maps and filtering plan items still visits the full page set even when few pages are mounted.',
    correctness:
      'Composition, selection, print and promoted targets must retain the required pages.',
    proof:
      'Pagination journeys are available; total-page scaling and viewport churn must be measured independently.',
    falsifier:
      'A local window plan must preserve retained-page semantics and beat full-plan cost without stale layout.',
  },
  {
    id: 'plite.staged-rendering',
    file: 'editable-root-groups.ts',
    grades: '3333222',
    owner:
      'Root grouping stages initial rendering while retaining visited groups.',
    lifetime:
      'Group identity follows document epoch and root keys; previously revealed groups remain available.',
    boundary:
      'Staging is a presentation policy with a different mount progression from full DOM.',
    api: 'The current DOM strategy selects staging without a parallel virtualization API.',
    scale:
      'Plan-key construction joins root keys and active lookup scans groups; mounted DOM can grow as groups are visited.',
    correctness:
      'Native Find, selection and navigation require requested groups to become available.',
    proof:
      'Huge-document and DOM-coverage journeys exist; long-session retention requires its own memory trace.',
    falsifier:
      'A mount-only win that accumulates full retained DOM during navigation cannot count as a memory virtualization win.',
  },
  {
    id: 'plite.virtualization',
    file: 'use-virtualized-root-plan.ts',
    grades: '3333222',
    owner:
      'The virtualized root plan wraps the existing virtualizer with editor-specific retention.',
    lifetime:
      'Measurements and retained indexes follow the scroll element, layout and mounted root.',
    boundary:
      'Experimental virtualization changes DOM coverage while preserving canonical document ownership.',
    api: 'The explicit experimental strategy carries estimates, overscan and layout requirements.',
    scale:
      'Window planning, measurement invalidation, overscan and churn must be decomposed before replacing the virtualizer.',
    correctness:
      'Selection endpoints, composition, native Find, print, accessibility and scroll anchors constrain the window.',
    proof:
      'Viewport browser rows are useful but cannot certify native device or screen-reader behavior.',
    falsifier:
      'Reject a faster window that drops an active native affordance; compare only within the same DOM-coverage contract.',
  },
  {
    id: 'plite.accessibility',
    file: 'editor-announcement-live-region.tsx',
    grades: '3333222',
    owner:
      'A dedicated live region renders editor announcements from the accessibility owner.',
    lifetime:
      'Announcement presentation follows the mounted editor and its assistive interaction state.',
    boundary: 'Accessibility output is not part of serialized content.',
    api: 'Editor behavior supplies announcements without requiring each feature to create an independent live region.',
    scale:
      'Announcement churn and virtualized content coverage matter more than raw node rendering counts.',
    correctness:
      'Duplicate, stale or missing announcements can break navigation even when DOM text is correct.',
    proof:
      'DOM assertions can verify region structure; actual assistive-technology interaction remains a separate capability gap.',
    falsifier:
      'A VoiceOver/NVDA replay exposing missing navigation or announcements blocks any claim of complete native parity.',
  },
  {
    id: 'plite.diff',
    file: 'computeDiff.ts',
    grades: '3333222',
    owner:
      'The diff implementation computes derived comparison output from document values.',
    lifetime:
      'Diff results belong to the compared revisions and should not outlive either input identity.',
    boundary:
      'Comparison stays outside ordinary edit mutation and collaboration authority.',
    api: 'Diff consumers request a comparison rather than maintaining another writable document.',
    scale:
      'Document size, changed fraction and mark density determine algorithm cost.',
    correctness:
      'Text, marks and structural changes must remain distinguishable in output.',
    proof:
      'Diff contracts establish outcomes; current large-change completion and allocation data remain unmeasured.',
    falsifier:
      'Only a measured large-feature computation with identical diff output can justify worker offload.',
  },
  {
    id: 'plite.public-contracts',
    file: 'editor.ts',
    grades: '3333322',
    typeOnly: true,
    owner:
      'Public editor, transaction, range and transform types describe the canonical substrate owners.',
    lifetime:
      'Types must distinguish committed reads, active transactions and mounted view authority.',
    boundary:
      'Public signatures must match actual source and packed entrypoint reachability.',
    api: 'Callback inference and narrow extension composition are mandatory consumer properties.',
    scale:
      'This surface has type-instantiation cost rather than per-keystroke runtime cost.',
    correctness:
      'A type-valid callback must not grant mutation outside its transaction or bind the wrong extension namespace.',
    proof:
      'Type graph and inference tests are relevant; package compilation is distinct from emitted runtime correctness.',
    falsifier:
      'Type-width budgets or an unannotated real consumer failure require changing the owning generic, not annotating the caller.',
  },
  {
    id: 'plite.packaging',
    file: 'packages/plitejs/src/index.ts',
    grades: '3333322',
    typeOnly: true,
    owner:
      'Source barrels publish substrate, React and optional adapter contracts through explicit entrypoints.',
    lifetime:
      'Exports belong to the package artifact and its exact build inputs.',
    boundary:
      'Headless and React reachability must agree with declared dependencies and side effects.',
    api: 'Consumers choose ordinary entrypoints without generated application contracts.',
    scale:
      'Import graph and bundle startup are the relevant costs; export metadata alone has no editing latency.',
    correctness:
      'Packed types and runtime imports must resolve the same supported surface.',
    proof:
      'All public export entries are inventoried; the AST reexport trace does not certify packed output.',
    falsifier:
      'A headless import reaching React or a packed import resolving stale declarations would trigger a reachability cap.',
  },
  {
    id: 'plite.profiling',
    file: 'profiling.ts',
    grades: '3333222',
    owner:
      'The profiling owner records diagnostic work without becoming a product-state authority.',
    lifetime:
      'Profiling subscriptions and buffers belong to an explicitly enabled diagnostic run.',
    boundary: 'Instrumentation is separate from the uninstrumented timing arm.',
    api: 'Diagnostics should expose attributable phases and counters without changing editing contracts.',
    scale:
      'Event volume, buffer retention and timer calls can perturb the measured operation.',
    correctness:
      'Disabled instrumentation must preserve ordinary behavior and not retain editors.',
    proof:
      'Profiler hooks are source evidence; matched instrumentation-on/off controls are needed for attribution.',
    falsifier:
      'A claimed latency win observed only with different instrumentation or observer work is invalid.',
  },
];
