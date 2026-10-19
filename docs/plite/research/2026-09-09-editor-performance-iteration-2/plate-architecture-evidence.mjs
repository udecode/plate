export const plateEvidence = [
  {
    id: 'plate.ai',
    file: 'useAIChat.ts',
    grades: '3333222',
    owner:
      'One editor-owned chat session serves writable mounted views and delegates edits to AI feature transactions.',
    lifetime:
      'Transport replacement and last-view detach dispose the session, abort requests and unsubscribe SDK callbacks.',
    boundary:
      'Remote transport, preview state and document mutations remain distinct owners.',
    api: 'useAIChat accepts a transport and mounted editable ref; callbacks receive an abort signal.',
    scale:
      'Streaming sync reconstructs assistant text and deserializes the complete generated preview on changed content; cumulative stream length is a specific performance lead.',
    correctness:
      'Stale sessions, read-only views and cancelled streams must not apply late document updates.',
    proof:
      'Source shows cancellation and ownership guards; deterministic stream burst timing and final preview equality remain necessary.',
    falsifier:
      'Compare full preview parsing with bounded incremental delivery using identical chunks; include final complete content and cancellation latency.',
  },
  {
    id: 'plate.basic-nodes',
    file: 'BaseHeadingPlugins.ts',
    grades: '3333322',
    owner:
      'Heading levels are schema-owned element variants with one feature command path.',
    lifetime:
      'Heading properties persist in document nodes; configured rules belong to plugin setup.',
    boundary:
      'React heading components adapt the same headless schema and transforms.',
    api: 'Heading commands use inferred schema type and the canonical transaction.',
    scale:
      'Changing selected block types should scale with selected blocks rather than every heading.',
    correctness:
      'Heading levels, marks and selected content must survive conversion and undo.',
    proof:
      'Basic-node and rich-text journeys supply guards; document-wide heading conversion needs its own timing cell.',
    falsifier:
      'An unrelated-block traversal during a one-block conversion creates actionable locality debt.',
  },
  {
    id: 'plate.basic-styles',
    file: 'BaseStylePlugins.ts',
    grades: '3333222',
    owner:
      'Style plugins own text/block property declarations, parsing and transaction updates.',
    lifetime:
      'Formatting persists in nodes or marks while feature defaults remain configuration state.',
    boundary:
      'CSS input decoding feeds the canonical model rather than becoming a second style store.',
    api: 'Formatting commands expose domain values through inferred plugin updates.',
    scale:
      'Selected-range formatting and HTML style parsing have different growth variables.',
    correctness:
      'Unsupported CSS, unit normalization and multi-block selections must preserve canonical values.',
    proof:
      'Formatting tests and paste journeys are related guards; color/font/indent latency is not represented by bold alone.',
    falsifier:
      'A large-selection style packet must verify every changed mark and include resulting DOM settlement.',
  },
  {
    id: 'plate.callout',
    file: 'BaseCalloutPlugin.ts',
    grades: '3333322',
    owner:
      'The callout schema owns a structured block and its codec properties.',
    lifetime:
      'Callout content is durable document data; rendering follows the mounted component.',
    boundary: 'The React plugin reuses the headless callout definition.',
    api: 'Ordinary block composition expresses callouts without another container runtime.',
    scale:
      'Insertion and conversion scale with affected content; no separate feature index is justified by source alone.',
    correctness:
      'Nested content and round-trip serialization must remain intact.',
    proof:
      'Callout feature cases are available; a normal feature operation still needs complete latency measurement.',
    falsifier:
      'Do not add feature-specific caching without an attributed callout hot path.',
  },
  {
    id: 'plate.code-block',
    file: 'BaseCodeBlockPlugin.ts',
    grades: '3333122',
    owner:
      'The code feature owns canonical code content, line commands and native syntax decorations; CodeMirror is an explicit adapter.',
    lifetime:
      'Highlight output is cached by block text and language; removal or last-observer cleanup releases cached entries.',
    boundary:
      'Syntax rendering is derived view output and must not replace canonical editor text/history.',
    api: 'Native and specialized code views need explicit presentation contracts and identical serialized content.',
    scale:
      'A changed text invalidates full Lowlight parsing before prefix/suffix token identities are reused; incremental syntax is a concrete experiment.',
    correctness:
      'Multiline tokens, language changes, stale asynchronous output, IME and undo must remain exact.',
    proof:
      'The native-code target and highlight oracle exist; prior 10k-line latency is a red baseline rather than proof of a specific cause.',
    falsifier:
      'Retain incremental parsing only with token/selection parity and complete edit-plus-highlight gain, including cold initialization.',
  },
  {
    id: 'plate.code-drawing',
    file: 'renderers.ts',
    grades: '3332222',
    owner:
      'Code-drawing renderers dispatch to Mermaid, Graphviz, Flowchart or an explicit PlantUML server.',
    lifetime:
      'Flowchart temporary DOM is removed in finally; Mermaid initialization is shared; Graphviz instances are constructed per render.',
    boundary:
      'Network-backed diagrams and local rendering are distinct completion contracts.',
    api: 'Language, code and optional PlantUML server choose an explicit renderer.',
    scale:
      'Module load, Graphviz initialization, diagram computation and SVG encoding can dominate different operations.',
    correctness:
      'Stale render delivery, failed network responses and invalid diagrams need visible outcome guards.',
    proof:
      'Renderer source supplies lifecycle evidence; async UI delivery and repeated-render timing need separate proof.',
    falsifier:
      'A resource-reuse probe must prove safe concurrency and disposal before reporting lower setup cost.',
  },
  {
    id: 'plate.combobox',
    file: 'BaseComboboxPlugin.ts',
    grades: '3333222',
    owner:
      'The combobox feature owns trigger matching and edit-only input behavior used by multiple features.',
    lifetime:
      'Trigger state follows the active input range and is cleared through the feature lifecycle.',
    boundary:
      'Suggestion-list presentation stays outside the document matcher.',
    api: 'Shared trigger operations serve mention, emoji and slash features without duplicate matching protocols.',
    scale:
      'Trigger scanning and option filtering must be timed independently from menu rendering.',
    correctness:
      'Selection changes, whitespace rules and composition must not retain an invalid trigger.',
    proof:
      'Combobox-related feature journeys exist; list size and trigger length are unmeasured dimensions.',
    falsifier:
      'A filter optimization that changes item order, keyboard acceptance or IME behavior is rejected.',
  },
  {
    id: 'plate.comments',
    file: 'CommentsPlugin.ts',
    grades: '3333222',
    owner:
      'Comments compose annotation sources, ordered IDs and active-comment state through the substrate annotation store.',
    lifetime:
      'Subscriptions track annotation changes and active state; source order is rebuilt on source changes.',
    boundary:
      'Comment metadata remains an external source while anchors map through canonical document changes.',
    api: 'Source and active-store contracts expose explicit subscriptions and ordered IDs.',
    scale:
      'Ordering, annotation mapping and active-range publication depend on comment count and changed IDs.',
    correctness:
      'Deleted anchors, overlapping comments and external source refresh must produce current active annotations.',
    proof:
      'Annotation and comments journeys are relevant; a dense overlapping-comments packet is still required.',
    falsifier:
      'Benchmark actual ordered-ID rebuilds and active transitions before introducing a new interval index.',
  },
  {
    id: 'plate.compiler',
    file: 'compileEditor.ts',
    grades: '3333222',
    owner:
      'compileEditor delegates to the existing Plate compiler instead of constructing a second editor runtime.',
    lifetime:
      'The compilation result is immutable configuration data with no activated extensions or initial document.',
    boundary:
      'The optional compiler stays separate from ordinary runtime editor creation.',
    api: 'Plugins and optional application schema form the complete public call.',
    scale:
      'Configuration evaluation and schema width affect build-time cost, not per-keystroke execution.',
    correctness:
      'Compiled data must preserve the same configured schema and validators used by runtime creation.',
    proof:
      'Compiler/schema targets exist; optional generated contracts must not become a prerequisite for ordinary consumers.',
    falsifier:
      'Any compilation side effect activating resources or requiring the CLI for ordinary setup contradicts this boundary.',
  },
  {
    id: 'plate.core-plugins',
    file: 'getCorePlugins.ts',
    grades: '3333222',
    owner:
      'Core-plugin assembly composes domain adapters such as history, DOM and element identity.',
    lifetime:
      'Core feature setup follows editor creation and configuration ownership.',
    boundary:
      'Core adapters must reuse substrate owners rather than duplicate their mutable state.',
    api: 'Ordinary editor creation supplies the required core composition.',
    scale:
      'Default feature reachability affects startup; equivalent cohorts must retain equivalent behavior.',
    correctness:
      'Removing a default adapter must not silently remove history, DOM or identity laws.',
    proof:
      'Core plugin contracts and common fixture configuration expose the relevant obligations.',
    falsifier:
      'Only remove a default dependency after proving that its current independent user job is absent or already canonically owned.',
  },
  {
    id: 'plate.csv',
    file: 'CsvPlugin.ts',
    grades: '3333222',
    owner:
      'CSV decoding converts tabular records into canonical table content.',
    lifetime:
      'Parser options belong to feature configuration; decoded cells become document data.',
    boundary: 'CSV is an input codec above the table schema.',
    api: 'The feature exposes explicit CSV conversion instead of requiring callers to manufacture table nodes.',
    scale:
      'Rows, columns and cell bytes determine parse and construction costs.',
    correctness:
      'Quoting, headers, malformed rows and cell content must preserve expected table structure.',
    proof:
      'CSV and table-paste cases provide semantic guards; large-grid parse and full mount clocks are separate.',
    falsifier:
      'A fast parser that truncates rows or defers table construction outside the measured operation cannot pass.',
  },
  {
    id: 'plate.date',
    file: 'BaseDatePlugin.ts',
    grades: '3333322',
    owner:
      'The date feature delegates canonical value normalization to dateValue and inserts schema-owned date nodes.',
    lifetime:
      'The normalized date is durable node data; picker state belongs to UI.',
    boundary: 'Parsing and canonicalization do not depend on a mounted picker.',
    api: 'Insertion accepts a value and rejects invalid normalization before mutation.',
    scale:
      'Date conversion is local; picker mounting and many date nodes are different workloads.',
    correctness:
      'Canonical values and invalid input behavior must survive serialization and timezone boundaries.',
    proof:
      'Date tests and feature journeys exist; locale-specific native picker latency is separate.',
    falsifier:
      'Do not trade canonical value consistency for a microbenchmark of date formatting.',
  },
  {
    id: 'plate.details',
    file: 'BaseDetailsPlugin.ts',
    grades: '3333222',
    owner:
      'The details feature owns structural disclosure content and a separate set of open node keys.',
    lifetime:
      'Open state follows valid node keys; commit handling prunes removed details.',
    boundary:
      'Transient disclosure presentation remains outside durable content shape.',
    api: 'Open/close behavior and structural updates use the existing plugin API and transaction.',
    scale:
      'Pruning open keys and converting selected blocks have separate counts; hidden content does not imply zero DOM work.',
    correctness:
      'Deleting, moving or undoing details must not leave stale open state or lose children.',
    proof:
      'Details and structural journeys are available; hidden-content rendering cost needs a real-route probe.',
    falsifier:
      'Measure mounted hidden content before proposing Activity or lazy mounting, and retain selection/search behavior.',
  },
  {
    id: 'plate.diff',
    file: 'plite-diff.internal.ts',
    grades: '4433423',
    zeroRuntimeProven: true,
    owner:
      'The Plate diff facade directly reexports the canonical Plite diff implementation.',
    lifetime: 'The facade owns no mutable state or additional lifecycle.',
    boundary: 'The two-line reexport preserves substrate ownership.',
    api: 'The facade exposes the same function and options type.',
    scale:
      'There is no independent wrapper computation to optimize; diff algorithm cost belongs to plite.diff.',
    correctness:
      'Behavior is the canonical implementation rather than a parallel Plate algorithm.',
    proof:
      'Direct source read proves the absence of wrapper state; packed reachability remains a package gate.',
    falsifier:
      'A compiled artifact resolving a different implementation would invalidate the direct-adoption assessment.',
  },
  {
    id: 'plate.dnd',
    file: 'useDndPlugin.ts',
    grades: '3333222',
    owner:
      'The DnD feature connects drag behavior and feature-store state to the mounted editor.',
    lifetime:
      'Hooks and effects attach resources to the current editor and release them on replacement.',
    boundary:
      'Drag-handle UI is separate from canonical native cross-editor transfer.',
    api: 'Feature hooks compose with the existing editor and node contexts.',
    scale:
      'Drag state can wake many subscribers; pointer movement and scroll work need continuous traces.',
    correctness:
      'Source/destination identity, cancellation and read-only targets constrain publication changes.',
    proof:
      'DnD journeys and store contracts exist; callback count and render count must not be conflated.',
    falsifier:
      'Keep field-specific routing only with unchanged custom selectors, target transitions and drop outcomes.',
  },
  {
    id: 'plate.docx',
    file: 'DocxPlugin.ts',
    grades: '3333222',
    owner:
      'Word paste cleanup owns CSS/list normalization before canonical HTML decoding; import/export have separate document adapters.',
    lifetime: 'List-sequence maps and parsing state belong to one conversion.',
    boundary:
      'Office conversion sits at the document input/output boundary rather than ordinary typing.',
    api: 'The feature provides conversion paths instead of exposing intermediate Word DOM as editor state.',
    scale:
      'HTML/RTF bytes, list depth, image payloads and generated table cells are independent stress dimensions.',
    correctness:
      'List ordinals, indentation, styles and content must survive cleanup and round trips.',
    proof:
      'DOCX slow tests and HTML paste journeys provide fixtures; external application interoperability is a separate proof boundary.',
    falsifier:
      'Any worker or incremental parser must preserve exact conversion output and include transfer, decode and mount time.',
  },
  {
    id: 'plate.emoji',
    file: 'createEmojiSearch.ts',
    grades: '3333222',
    owner:
      'Emoji search constructs one normalized dataset index and returns deterministic ranked matches.',
    lifetime:
      'The index follows the supplied dataset and is recreated when that dataset changes.',
    boundary:
      'Search computation is independent of the picker component and inserted emoji node.',
    api: 'The search call accepts text and an optional result limit; returned arrays are independent.',
    scale:
      'Each query scans the index and sorts every match before slicing the requested limit.',
    correctness:
      'Exact-ID priority, position ordering and stable ID tie-breaks constrain top-k alternatives.',
    proof:
      'Search contracts are available; realistic dataset/query timing is needed before adding an index or heap.',
    falsifier:
      'A bounded top-k probe must preserve complete ranking for the requested prefix and materially improve picker completion.',
  },
  {
    id: 'plate.excalidraw',
    file: 'useExcalidrawSync.ts',
    grades: '3333222',
    owner:
      'The sync hook coordinates the current canonical node with an explicitly mounted Excalidraw API.',
    lifetime:
      'A layout-effect subscription follows API, editor, namespace and node key; teardown disables and unsubscribes it.',
    boundary:
      'Canvas scene replacement avoids save echoes and clears obsolete canvas undo when document data changes.',
    api: 'Callers supply the lazy namespace and imperative API rather than a second editor document store.',
    scale:
      'Scene changes serialize complete canvas state before equality comparison; large scenes need separate timing from text editing.',
    correctness:
      'Source replacement, referenced files, read-only views and undo ownership must remain exact.',
    proof:
      'The hook contains explicit applying/loading guards; large-scene change and teardown retention need measured evidence.',
    falsifier:
      'Reject serialization batching that loses the final scene, saves a stale source or changes canvas/document undo behavior.',
  },
  {
    id: 'plate.find',
    file: 'BaseFindPlugin.ts',
    grades: '3333122',
    owner:
      'The Find plugin owns query, ordered matches, active index and an anchor-path decoration index.',
    lifetime:
      'An active query is recomputed on every document commit; query state stays outside document history.',
    boundary:
      'Find ranges are derived view output and selection uses the canonical transaction.',
    api: 'Search, move and select expose the complete current literal-search job.',
    scale:
      'Sparse decoration refresh already exists, but search and result-index rebuilding remain document-wide; scan-only wins omit publication cost.',
    correctness:
      'Match order, case folding, UTF-16 endpoints, active selection and undo/remote changes must agree.',
    proof:
      'The first iteration rejected a complete-operation adoption claim despite a faster scoped scan.',
    falsifier:
      'A new attempt must beat complete active-Find editing, including match publication and highlight settlement, with identical results.',
  },
  {
    id: 'plate.footnote',
    file: 'BaseFootnotePlugin.ts',
    grades: '3333222',
    owner:
      'The footnote reader owns definitions, references and maps grouped by reference ID.',
    lifetime:
      'The registry is reused while the root children identity is unchanged and rebuilt after document change.',
    boundary:
      'Footnote structure is canonical document data; lookup maps are derived read state.',
    api: 'Definition/reference queries and updates use one feature namespace.',
    scale:
      'A registry rebuild scans matching nodes and rebuilds maps even after unrelated document changes.',
    correctness:
      'Duplicate/missing references, definition ordering and undo must remain consistent.',
    proof:
      'Footnote contracts and journeys are available; sparse unrelated-edit cost needs an attributed probe.',
    falsifier:
      'Measure registry rebuild frequency under real footnote consumers before adopting changed-node invalidation.',
  },
  {
    id: 'plate.html',
    file: 'HtmlPlugin.ts',
    grades: '3333222',
    owner:
      'The HTML compiler and parser registries own decoding/encoding rules and safe attribute/style handling.',
    lifetime:
      'Compiled artifacts are weakly cached by configuration identity; parse state belongs to a conversion.',
    boundary:
      'Browser DOM input is converted into canonical document data through explicit codec ownership.',
    api: 'HTML serialize/deserialize behavior is configured by plugin codecs rather than ad hoc UI handlers.',
    scale:
      'Rule compilation, DOM traversal, cleanup and resulting editor mount are separate costs.',
    correctness:
      'Unsafe URLs, malformed markup, parser conflicts and round-trip fidelity constrain faster paths.',
    proof:
      'Large HTML and paste corpora exist; minimal fixture capability is not a full HTML feature benchmark.',
    falsifier:
      'A parse speedup that bypasses safety rules or drops unsupported content cannot pass the same correctness oracle.',
  },
  {
    id: 'plate.indent',
    file: 'BaseIndentPlugin.ts',
    grades: '3333322',
    owner:
      'Indent updates operate on selected canonical blocks through the feature transaction.',
    lifetime:
      'Indent values persist in node properties while allowed behavior comes from plugin state.',
    boundary:
      'Indent semantics compose with list rules without moving document mutation into UI.',
    api: 'The feature exposes domain indent updates with inferred schema context.',
    scale:
      'Work should follow selected entries and affected list neighborhoods.',
    correctness:
      'Bounds, mixed blocks, list nesting and undo must preserve valid structure.',
    proof:
      'Indent/list journeys supply behavior guards; large selected ranges need independent timing.',
    falsifier:
      'Unrelated whole-document work for a one-block indent creates a locality experiment.',
  },
  {
    id: 'plate.input-rules',
    file: 'createInputRules.ts',
    grades: '3333222',
    owner:
      'Input-rule construction compiles feature declarations into the canonical input-rule owner.',
    lifetime:
      'Rule definitions follow configuration; matched input and undo grouping belong to one edit.',
    boundary:
      'Rules sit between input intent and feature transactions, not in copied toolbar components.',
    api: 'Declarative rules expose matching and transformation with inferred editor context.',
    scale:
      'Installed rule count, trigger length and failed-match scanning must be measured independently.',
    correctness:
      'Composition, rule undo, escaped triggers and schema constraints forbid aggressive matching shortcuts.',
    proof:
      'Input-rule tests and native journeys are relevant; rule-width timing remains an explicit packet.',
    falsifier:
      'Any faster matcher changing which rule wins or how immediate undo behaves is rejected.',
  },
  {
    id: 'plate.layout',
    file: 'BaseColumnPlugin.ts',
    grades: '3333222',
    owner:
      'Column layout owns canonical column structure and normalized widths.',
    lifetime:
      'Widths and children persist with columns; interactive resizing state stays in mounted UI.',
    boundary:
      'Layout transforms feed the schema rather than storing a separate UI-only document.',
    api: 'Column updates expose structure and width changes through feature commands.',
    scale:
      'Column normalization visits siblings; splitting/merging content has different cost from pointer resize.',
    correctness:
      'Width totals, removed columns and moved child content must remain valid through undo.',
    proof:
      'Column/resize journeys are available; continuous pointer and final layout clocks must both be captured.',
    falsifier:
      'Do not accept a resize win that postpones the final canonical width or loses content on column removal.',
  },
  {
    id: 'plate.link',
    file: 'BaseLinkPlugin.ts',
    grades: '3333222',
    owner:
      'The link feature owns URL policy, inline structure and link transactions.',
    lifetime:
      'URL data is durable; editing popover and selection references are transient view state.',
    boundary:
      'URL validation and canonical link mutation remain available headlessly.',
    api: 'Create/edit/remove behavior uses one link namespace and ordinary selection semantics.',
    scale:
      'URL normalization is local; selected-range wrapping and floating UI geometry are separate costs.',
    correctness:
      'Unsafe URLs, empty links, partial selections and autolink boundaries require exact guards.',
    proof:
      'Link and HTML tests cover overlapping contracts; popup interaction still needs real-route timing.',
    falsifier:
      'A fast autolink path must preserve URL policy, selection and immediate undo.',
  },
  {
    id: 'plate.list',
    file: 'BaseListPlugin.ts',
    grades: '3333222',
    owner:
      'List behavior owns indentation, style and derived ordinals over canonical block structure.',
    lifetime: 'Ordinal caches follow state and immutable element identity.',
    boundary:
      'List semantics remain a headless feature consumed by React rendering.',
    api: 'List transforms expose toggle, nesting and structural commands through the existing plugin.',
    scale:
      'Sibling runs, ordinal lookup, normalization and large selection conversion have different growth costs.',
    correctness:
      'Mixed lists, numbering restarts, split/merge and undo constrain cache invalidation.',
    proof:
      'List corpora and native journeys exist; repeated ordinal reads should be timed against current caches.',
    falsifier:
      'Reject a list index that makes unrelated edits cheap but corrupts restart numbering or moved siblings.',
  },
  {
    id: 'plate.markdown',
    file: 'intrinsicRules.ts',
    grades: '3333222',
    owner:
      'Markdown rules and serializers map feature data through the existing document codec layer.',
    lifetime:
      'Parser configuration belongs to the feature setup; AST and output belong to one conversion.',
    boundary:
      'Markdown conversion is separate from the canonical editing model and from streaming transport.',
    api: 'Serialize/deserialize APIs compose configured rules without requiring application contracts.',
    scale:
      'Whole-document parse, stringify, MDX plugins and repeated stream-prefix parsing are distinct workloads.',
    correctness:
      'Marks, nested blocks, escaping and unsupported constructs require round-trip and expected-loss contracts.',
    proof:
      'CommonMark and Markdown slow corpora provide semantic guards; AI stream previews need a separate complete operation.',
    falsifier:
      'A worker or incremental parse experiment must include transfer and final AST/document equivalence.',
  },
  {
    id: 'plate.math',
    file: 'BaseEquationPlugin.ts',
    grades: '3333222',
    owner:
      'Equation plugins own inline/block mathematical source and input-rule conversion.',
    lifetime:
      'Equation text is durable; rendered output follows the current source and mounted view.',
    boundary:
      'Math rendering and CSS are optional feature reachability above the headless schema.',
    api: 'Equation updates expose source values rather than renderer-internal state.',
    scale:
      'Renderer loading, parse complexity and the count of mounted formulas require separate measurements.',
    correctness:
      'Invalid formulas, escaped triggers and inline/block conversion must preserve editable source.',
    proof:
      'The math CSS export is present in the current public trace; historical missing-export claims need superseding.',
    falsifier:
      'Only current packed reachability or real formula-render latency can reopen the old packaging/performance premise.',
  },
  {
    id: 'plate.media',
    file: 'BaseMediaPlugin.ts',
    grades: '3333222',
    owner:
      'Media features own normalized URLs and canonical media node properties; upload placeholders have their own transient behavior.',
    lifetime:
      'Node data persists while loading, resizing and upload progress follow active requests/views.',
    boundary:
      'External network/media decode time must be distinguished from editor work.',
    api: 'Media insert and update commands validate domain properties through the existing feature API.',
    scale:
      'Many mounted images, large uploads, placeholders and resize geometry are separate operation families.',
    correctness:
      'Cancelled uploads, removed nodes, unsafe URLs and late responses must not write stale data.',
    proof:
      'Image and media journeys exist; a text-only editor benchmark does not cover this lane.',
    falsifier:
      'A mount or upload optimization must preserve final node properties and cancel stale work on deletion.',
  },
  {
    id: 'plate.mention',
    file: 'BaseMentionPlugin.ts',
    grades: '3333222',
    owner:
      'Mention input uses the shared combobox feature and commits a persistent mention node.',
    lifetime:
      'A live target reference belongs to transient trigger input; committed mention data is durable.',
    boundary:
      'Option retrieval and menu UI remain separate from canonical mention insertion.',
    api: 'Mention updates preserve configured schema type and inferred transaction access.',
    scale:
      'Suggestion count, async lookup and menu rendering must be separated from insertion cost.',
    correctness:
      'Cancelled triggers, shifted ranges, composition and late results cannot insert into a stale target.',
    proof:
      'Mention journeys cover input and selection behavior; burst lookup and large menus need explicit timing.',
    falsifier:
      'Reject any cache or async scheduling change that delivers a result to a superseded trigger.',
  },
  {
    id: 'plate.migrations',
    file: 'migratePlateV54CodeBlocks.internal.ts',
    grades: '3333222',
    owner:
      'Migration adapters transform legacy serialized data and map affected text points to canonical content.',
    lifetime: 'Migration maps belong to one source document conversion.',
    boundary:
      'Legacy decoding remains an explicit data boundary rather than a permanent runtime compatibility layer.',
    api: 'Applications invoke an explicit migration path for old documents.',
    scale:
      'Document bytes, roots and code-line counts govern one-time conversion work.',
    correctness:
      'Selection mapping, mark preservation and idempotent migration constrain simplification.',
    proof:
      'Migration and schema-width targets exist; cold import cost is separate from steady editing.',
    falsifier:
      'A faster conversion must preserve all selected serialized fixtures and root/selection mappings.',
  },
  {
    id: 'plate.packaging',
    file: 'core.tsx',
    grades: '3333222',
    owner:
      'Curated Plate entrypoints combine canonical substrate exports with feature composition contracts.',
    lifetime:
      'Reachability belongs to the package artifact and exact build configuration.',
    boundary:
      'Headless, React and optional feature imports must resolve only their declared dependency graph.',
    api: 'Consumers choose documented feature entrypoints rather than internal paths.',
    scale:
      'Bundle size, evaluation work and duplicate dependencies affect startup and must use equivalent feature cohorts.',
    correctness:
      'Runtime exports, declarations and side effects must agree in packed consumer builds.',
    proof:
      'All export entries have source traces; this does not prove production bundling or compiler transformation.',
    falsifier:
      'A packed headless consumer importing React-only work triggers a reachability investigation.',
  },
  {
    id: 'plate.pagination',
    file: 'packages/platejs/src/pagination/react/index.ts',
    grades: '4433423',
    zeroRuntimeProven: true,
    owner: 'Plate pagination directly adopts the Plite pagination entrypoint.',
    lifetime: 'The reexport owns no independent page cache or lifecycle.',
    boundary: 'One substrate pagination owner supplies the React facade.',
    api: 'The public facade exposes the same pagination contract.',
    scale:
      'No additional wrapper work exists; page-plan and rendering cost belong to Plite pagination.',
    correctness:
      'The facade cannot implement a conflicting page-retention policy.',
    proof:
      'The one-line source reexport is direct adoption evidence; package artifact resolution is separate.',
    falsifier:
      'A generated artifact routing to another pagination runtime invalidates this score.',
  },
  {
    id: 'plate.plugin-api',
    file: 'BasePlugin.ts',
    grades: '3333222',
    owner:
      'Plugin definitions describe schema, reads, updates, state, rendering and lifecycle for the canonical compiler.',
    lifetime:
      'Definitions and configuration are distinct from editor-bound runtime state and view resources.',
    boundary:
      'Headless definitions remain separate from React node components and copied UI.',
    api: 'Callback inference, nominal descriptors and extension composition determine real developer usability.',
    scale:
      'Generic width and configuration evaluation are separate from hot editing runtime.',
    correctness:
      'Definition merging must preserve schema claims, update authority and dependency identity.',
    proof:
      'Type and plugin contracts exist; the previous typegraph red requires a fresh source-bound budget receipt.',
    falsifier:
      'An ordinary callback needing explicit transaction annotations or a width budget failure points to the owning public generic.',
  },
  {
    id: 'plate.plugin-runtime',
    file: 'resolvePlugins.ts',
    grades: '3333222',
    owner:
      'resolvePlugins compiles plugin definitions into one installed runtime and store binding set.',
    lifetime:
      'Compiled snapshots and bindings follow configuration identity and editor ownership.',
    boundary:
      'Runtime resolution bridges Plate definitions to Plite extensions rather than maintaining a second editor kernel.',
    api: 'Public plugin descriptors hide compilation and binding internals.',
    scale:
      'Definition snapshotting, merge work and API factory execution must stay off ordinary read/edit paths.',
    correctness:
      'Duplicate names, dependency conflicts, failed setup and reconfiguration must resolve deterministically.',
    proof:
      'Compiler/runtime contracts exist; installation width and held facade behavior need distinct current receipts.',
    falsifier:
      'Trace any repeated definition cloning or factory execution during a warm read before introducing another cache.',
  },
  {
    id: 'plate.react-composition',
    file: 'withPlate.ts',
    grades: '3333222',
    owner:
      'Plate React composition adapts the canonical editor with feature components and view behavior.',
    lifetime:
      'Editor reuse is distinct from mounted provider and component lifetimes.',
    boundary:
      'React configuration must preserve headless runtime authority and exact mounted view binding.',
    api: 'Creation hooks and providers form the normal consumer path.',
    scale:
      'Full example composition, minimal features and multiple editors are different mount cohorts.',
    correctness:
      'Remount, reconfiguration, nested providers and read-only views must retain correct resources and commands.',
    proof:
      'Real example routes complement minimal cross-editor fixtures; compiler labels require exact emitted consumers.',
    falsifier:
      'A minimal fixture mount win cannot support a full-product claim until the actual example composition is replayed.',
  },
  {
    id: 'plate.react-state',
    file: 'usePluginStore.ts',
    grades: '3333222',
    owner:
      'Plugin-store hooks select canonical feature-store fields or named/custom selectors.',
    lifetime:
      'The resolved store follows the installed editor plugin; selector adapters own committed subscription behavior.',
    boundary:
      'React reads feature state instead of maintaining a duplicate local feature store.',
    api: 'Nominal plugin descriptors infer field and selector results and reject name-only objects.',
    scale:
      'The current hook subscribes through the base store; equality can suppress renders while notifications still fan out.',
    correctness:
      'Custom selectors, arguments, equality and store replacement must stay current.',
    proof:
      'Store-selector contracts exist; per-field callback routing requires a dedicated many-consumer trace.',
    falsifier:
      'A keyed subscription cut must preserve arbitrary custom-selector fallback and exact previous/current target transitions.',
  },
  {
    id: 'plate.resizable',
    file: 'Resizable.tsx',
    grades: '3333222',
    owner:
      'The resizable component owns the mounted resize gesture and commits domain dimensions through callbacks.',
    lifetime:
      'Pointer state and geometry belong to the current gesture and element.',
    boundary:
      'Transient resize feedback stays separate from durable node width/height.',
    api: 'A reusable component exposes resize behavior without owning editor structure.',
    scale:
      'Pointer frequency, layout reads and final commit cost need separate continuous and completion measurements.',
    correctness:
      'Units, minimum/maximum bounds, cancellation and owner replacement must preserve valid dimensions.',
    proof:
      'Resize journeys exist; Event Timing alone does not describe pointermove throughput.',
    falsifier:
      'A batching change must preserve the last pointer position and final canonical dimension at gesture completion.',
  },
  {
    id: 'plate.schema-codecs',
    file: 'compilePlateCodecs.ts',
    grades: '3333222',
    owner:
      'Codec compilation owns schema-target claims, ordering and decoder/encoder assembly.',
    lifetime:
      'Compiled codec artifacts belong to configuration, not each paste or render.',
    boundary:
      'Feature codec declarations feed one compiler before reaching substrate schema operations.',
    api: 'Explicit claims and priorities make conflicting behavior a configuration decision.',
    scale:
      'Declaration conflict comparison can grow quadratically at setup; hot conversion should reuse the result.',
    correctness:
      'Ambiguous claims, precedence and round-trip rules must remain deterministic.',
    proof:
      'Codec compiler tests exist; wide configuration timing and actual parser reuse need current evidence.',
    falsifier:
      'Only a measured setup-width problem justifies changing claim indexing; never weaken conflict detection to meet a budget.',
  },
  {
    id: 'plate.slash-command',
    file: 'BaseSlashPlugin.ts',
    grades: '3333322',
    owner:
      'Slash input composes the shared combobox matcher with an edit-only trigger node.',
    lifetime:
      'Trigger text and active menu state are transient and end when a command is accepted or cancelled.',
    boundary: 'The temporary trigger does not become durable document content.',
    api: 'The feature reuses configured combobox behavior and ordinary command execution.',
    scale: 'Menu filtering/rendering and command execution are separate costs.',
    correctness:
      'Cancellation, composition and replacing the trigger range must preserve surrounding content.',
    proof:
      'Slash and combobox journeys are available; real menu options and keyboard interaction need matched timing.',
    falsifier:
      'A menu optimization that changes the selected item or inserts after a stale trigger is rejected.',
  },
  {
    id: 'plate.static',
    file: 'renderStaticHtml.tsx',
    grades: '3333222',
    owner:
      'Static rendering produces HTML through the existing static editor/component pipeline.',
    lifetime:
      'The render result belongs to the supplied document and configuration; no editable view is activated.',
    boundary:
      'Static output remains separate from native interactive editor ownership.',
    api: 'A document and static configuration produce one render result.',
    scale:
      'Document size, feature rendering and server/client execution cost must not be mixed with editable mount timing.',
    correctness:
      'Serialization, attributes and supported feature output must remain deterministic.',
    proof:
      'Static rendering and HTML contracts exist; large static render has its own benchmark surface.',
    falsifier:
      'A static-only result cannot justify faster interactive editing or complete native behavior.',
  },
  {
    id: 'plate.substrate-adoption',
    file: 'plite-history.internal.ts',
    grades: '4433423',
    zeroRuntimeProven: true,
    owner:
      'The history facade directly reexports the canonical Plite history extension and types.',
    lifetime:
      'No Plate-specific undo stack or retention lifecycle is introduced.',
    boundary: 'History ownership remains in the substrate.',
    api: 'The facade preserves the same history state and transaction APIs.',
    scale:
      'There is no independent history algorithm or wrapper work to optimize in this lane.',
    correctness: 'Undo behavior follows the one canonical implementation.',
    proof:
      'The two-line source facade is direct adoption evidence; history behavior is proved under plite.history.',
    falsifier:
      'Any separate writable Plate undo stack would contradict the current direct-adoption claim.',
  },
  {
    id: 'plate.suggestion',
    file: 'BaseSuggestionPlugin.ts',
    grades: '3333222',
    owner:
      'Suggestion tracking owns proposal metadata and feature transforms over canonical document changes.',
    lifetime:
      'Tracking state and untracked-depth guards follow editor transactions; accepted/rejected data is durable content state.',
    boundary:
      'Review presentation consumes suggestion metadata rather than owning another document history.',
    api: 'Suggestion creation, acceptance and rejection use explicit feature operations.',
    scale:
      'Tracked ranges, structural changes and bulk acceptance have different traversal and mapping costs.',
    correctness:
      'Nested untracked edits, deletes, mark changes and remote collaboration must preserve review semantics.',
    proof:
      'Suggestion corpora and review journeys exist; dense tracked changes require a separate timing fixture.',
    falsifier:
      'A faster bulk operation must verify every accepted/rejected span and final undo result.',
  },
  {
    id: 'plate.tabbable',
    file: 'TabbableEffects.internal.tsx',
    grades: '3333222',
    owner:
      'Tabbable effects own mounted DOM navigation resources for embedded controls.',
    lifetime:
      'Pending timers and DOM entries are scoped to the active effect and cleaned up with it.',
    boundary:
      'Tab navigation is a native view concern rather than serialized editor structure.',
    api: 'The feature configures navigation through editor composition.',
    scale:
      'Tabbable entry discovery and pending timers grow with mounted interactive descendants.',
    correctness:
      'Focus order, removed controls, read-only state and nested editors constrain caching.',
    proof:
      'Keyboard and focus journeys exist; assistive-technology traversal is additional proof.',
    falsifier:
      'A cached navigation list that points to removed or hidden controls invalidates the performance proposal.',
  },
  {
    id: 'plate.table',
    file: 'BaseTablePlugin.ts',
    grades: '3333122',
    owner:
      'The table feature owns topology, cell transforms and serialization; native selection/resize adapters consume it.',
    lifetime:
      'Reusable topology must follow immutable table identity while editor/view binding remains current.',
    boundary:
      'Headless grid semantics are distinct from DOM geometry and selected-cell attributes.',
    api: 'Table commands and reads expose canonical cells and selections without caller-owned topology caches.',
    scale:
      'The first iteration improved resize but large cell selection remained slow; topology lookup, DOM selection and publication need separate attribution.',
    correctness:
      'Spans, merged cells, nested content, paste and structural undo forbid a simplistic rectangular cache.',
    proof:
      'Table targets and native journeys exist; Wordgard table-relative maps are a submechanism comparison, not a complete table win.',
    falsifier:
      'A cache must survive text edits, rebind to current roots/views and improve complete selection without changing merged-cell results.',
  },
  {
    id: 'plate.tag',
    file: 'BaseTagPlugin.ts',
    grades: '3333222',
    owner:
      'Tag selection reads canonical tag nodes and updates them through the feature transaction.',
    lifetime:
      'Selected values derive from document content; temporary picker state belongs to UI.',
    boundary: 'Document tags remain separate from option-list rendering.',
    api: 'Selected-item and update methods expose domain values through the existing plugin.',
    scale:
      'Selected-item reads traverse matching nodes and compare sets; tag count and picker option count differ.',
    correctness:
      'Duplicate values, removal and multi-select equality must preserve the intended set.',
    proof:
      'Tag/multi-select cases are available; many-tag read frequency needs an actual consumer trace.',
    falsifier:
      'Only repeated expensive selected-item reads justify a derived cache; set semantics must remain unchanged.',
  },
  {
    id: 'plate.toc',
    file: 'BaseTocPlugin.ts',
    grades: '3333222',
    owner:
      'The TOC read uses canonical heading entries and derives current heading text.',
    lifetime:
      'Output follows current document and heading-query configuration.',
    boundary:
      'Navigation UI consumes derived headings without maintaining another outline truth.',
    api: 'A heading query configures the read through the feature state.',
    scale:
      'Type-indexed heading enumeration still reads every heading string; heading count and update frequency matter.',
    correctness:
      'Order, nested headings, renamed headings and target navigation must remain current.',
    proof:
      'TOC/heading journeys are available; ordinary text edits with many headings need a complete consumer packet.',
    falsifier:
      'A cached outline must invalidate renamed, moved and removed headings and demonstrate actual callback savings.',
  },
  {
    id: 'plate.yjs',
    file: 'YjsPlugin.tsx',
    grades: '3333222',
    owner:
      'The Plate Yjs feature adapts substrate collaboration and remote-cursor reads into decorations.',
    lifetime:
      'Cursor subscriptions and decoration refresh follow the installed collaboration feature and mounted views.',
    boundary:
      'Document convergence remains owned by Plite Yjs; Plate owns the feature presentation adapter.',
    api: 'The plugin exposes collaboration composition while reusing the canonical provider contract.',
    scale:
      'Remote cursor changes map current and previous node keys; peer count and dense cursor rendering are the relevant variables.',
    correctness:
      'Disconnected peers and moved remote selections must refresh both old and new targets.',
    proof:
      'Yjs and cursor journeys provide guards; transport latency and editor-render latency must be reported separately.',
    falsifier:
      'A narrower cursor refresh is invalid if it leaves the previous target decorated or misses provider replacement.',
  },
];
