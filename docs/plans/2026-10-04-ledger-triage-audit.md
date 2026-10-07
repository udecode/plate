# Ledger triage audit

Status: closed: all 39 verdicts recorded in 17195da367
Page: https://claude.ai/artifact/LwmSwZHtEPSJbhaYnfUVSY
Playbook: api-review

Every open unit in the review ledger has a fresh verdict: 24 Pursue, 14 Stop and 1 Defer. The audit set is the 39 units that `node tooling/scripts/review-ledger.mjs status` listed as open at `fe0e9599a6` on 2026-10-04. Eleven earlier Pursue verdicts became Stop because their target already landed in source, and two Defers became Stop because the evidence they waited for now exists. Ten Pursue verdicts stand, seven of them re-aimed at a newer gap. The one Defer left is search, which waits on a benchmark. Each Pursue below names its current and proposed call site and one next invocation. No plan, build, panel or commit ran.

## Counts

| Expected | Reviewed | Excluded | Unresolved | Recorded |
| --- | --- | --- | --- | --- |
| 39 | 39 | 0 | 0 | 39 |

Reviewed counts units with a verdict from this audit. Excluded and unresolved are zero because every frozen unit got a verdict, including the two another session is building (autocomplete and markdown). Verdict moves: Pursue to Stop 11, Defer to Stop 2, Defer to Pursue 1, Pursue kept 10, and first reviews 15 (13 Pursue, 1 Stop, 1 Defer).

## Verdicts

Units in ledger queue order. The number is the queue position.

| # | Unit | Old verdict | New verdict | Reason |
| --- | --- | --- | --- | --- |
| 2 | `reads` | Pursue, unbound work | **Pursue** | Both earlier reads targets landed, but the root editor still publishes two subscriptions for one job. editor.subscribe and editor.subscribeCommit both fire once per published commit with the same commit and snapshot, and they differ only in argument order and phase. |
| 3 | `transactions` | Pursue, unbound work | **Stop** | The synchronous-author repair landed in the one transaction owner and a 28-case regression matrix pins it; every remaining mutation entrance serves a distinct current job. |
| 4 | `state` | Pursue, not adopted | **Stop** | The facet cut is already done, and the surviving split is coherent. Typed state fields persist only through document meta with explicit history and collaboration policy, effects carry transitions, and transient UI stays with its product owner. |
| 4 | `commands` | Pursue, not adopted | **Stop** | The public descriptor build() is already gone. What remains is the minimal contract, opaque descriptors for core editing intents with ordered handle and around interception and prepared continuations, while Plate shortcuts and UI target plugin update and api methods by name. |
| 5 | `large-documents` | Defer | **Stop** | The deferred gates (P0-P4) ran and chose the target, and S1-S6 installed it. Ordinary Editable mounts the complete DOM. Omission comes from an explicit, dedicated VirtualizedEditable or from the pagination virtualize boolean. Pagination no longer routes through the generic virtualizer. No design question remains open, and only the plan's S7 proof closure is outstanding. |
| 6 | `plate-api` | Pursue, unbound work | **Stop** | The open Pursue target is live, with one shared nominal descriptor behind editor.plugin and tx.plugin over Plite's installed owner and YjsPlugin.create/require/map in place of the handwritten factories, and every stronger deletion or replacement lane still loses to that design. |
| 6 | `distribution` | Pursue, unbound work | **Pursue** | The getCorePlugins cut landed, but the same public-export leak is larger one layer down. The plitejs root publishes 16 values that its own JSDoc tags @internal (view, transaction and snapshot transforms, initializePlugins, schema-identity and command-dispatch hooks) plus MAIN_ROOT_KEY. The guarded plitejs/internal bridge already exports all of them, and platejs republishes every one through export * from 'plitejs'. |
| 7 | `geometry` | Pursue, unbound work | **Stop** | The Pursue target landed. The generic Widget target and store carrier is gone, and selection and keyed Yjs cursor owners feed one private exact-Editable range-geometry owner whose rectangles copied UI positions, so no duplicate position store remains to cut. |
| 10 | `collaboration` | Pursue, unbound work | **Stop** | The 2026-09-14 lifetime target is in live source (app-owned Y.Doc, readiness, awareness and provider; one native binding with capability-inferred api.yjs; Plate composes it with no store; no read.yjs or tx.yjs), and no deletion, move or replacement lane beats it. |
| 11 | `documents` | Pursue, unbound work | **Pursue** | The September retained-source and canonical-conversion target is live, but DOCX still ships a hidden Plate envelope (nativeState, authoredTrust, editor/authored.json). The envelope has no production caller and restores only from byte-identical packages. It is a second persistence channel that the hidden-native-payload law forbids and that the September 26 cut already removed from HTML and Markdown. |
| 12 | `external-text` | Pursue, unbound work | **Stop** | The Pursue target landed. The CodeMirror adapter publishes from its dispatchTransactions boundary and applies canonical feedback synchronously with filter: false and no queue, ExternalTextRuntime delivery is monotonic under callback failure, and the public slot and versioned protocol stay unchanged. |
| 14 | `pagination` | Pursue, unbound work | **Pursue** | The Plite view-owned pagination target landed. But platejs/pagination/react re-exports the raw Plite PagedEditable, which bypasses Plate's EditorContent plugin pipeline. So a Plate app that paginates loses every plugin component, handler, shortcut and slot. Plate needs a paged content component routed through EditorContent, as VirtualizedEditorContent already does for virtualization. |
| 15 | `persistence` | Pursue, not adopted | **Stop** | The detached immutable conversion target is adopted at HEAD, and its strongest deletions still lose. One material gap is left, the silent loss of unknown top-level stored fields at migration completion. The model scope's 2026-10-04 Pursue already owns that gap and its build is under way, so a persistence Pursue would duplicate an owner. |
| 16 | `suggestions` | Pursue, unbound work | **Pursue** | The 2026-09-23 direct-delete target landed, but attribution still has two writable current-actor truths (editor.runtime.userId read through Reflect by DefaultAuthoredPlugin, and Comments' currentUserId), and the homepage playground still seeds suggestions by replaying edits under switched identities, which plate.md forbids. |
| 21 | `comments` | Defer | **Stop** | The evidence the Defer named, a native retained-target runtime that passes a frozen cold, changed-state, count-times-depth and retention comparison, now exists and its selected design landed in live source, and no stronger delete or replacement lane survives the hard laws. |
| 25 | `editor-public-naming` | Pursue, unbound work | **Pursue** | The closure audit's residuals are fixed, but the same law broke again in observable string values the census never checked. A documented platejs/react installBrowserHandle() writes element.__pliteBrowserHandle, saved comments carry kind 'plate-comments', every default editor.id is plite-editor-N despite Plate's @default nanoid() JSDoc, and root VISION.md still teaches deleted nouns that AGENTS.md says win over the corrected detail files. |
| 29 | `markdown` | Pursue, not adopted | **Pursue** | The table-cell target is still right and is built, but only in the uncommitted working tree, with a partial execution outcome and two open owner questions. So committed next still refuses a cell holding list paragraphs and cascades that refusal to the row and the table. |
| 34 | `repair-verification-workflow` | Pursue, unbound work | **Stop** | The old target landed when Regression folded into Patch on 2026-09-18 and was then replaced on 2026-10-03 by a simpler shape (pstack's Bug fix playbook with .agents/playbooks/bug-fix.md as the one repair entry and sole failed-fix owner, verify for evidence and an opt-in corpus mode, the Delivery rule keeping publication on the user's word), so nothing materially better remains. |
| 35 | `autocomplete` | Pursue, not adopted | **Pursue** | Ordinary text with one private owner per Editable is still the right owner, and the in-flight Phase 1b Plite typed-text report is the right remaining target because it closes the law-5 string-paste violation and stops Plate reading private Plite commit tags, while the plan's gated Phase 2 host adds core plugin grammar with no measured gain over the repaired owner. |
| 36 | `dnd` | Pursue, not adopted | **Stop** | Committed source adopts the schema-derived landing target. Plite's landAt admits any edge the compiled schema accepts, features keep only vetoes or a List redirect, and copied handles follow isBlockContent and isSelectable. Nothing materially better remains beyond bug findings the plan already owns. |
| 39 | `link` | Pursue, unbound work | **Pursue** | Nothing from the 2026-10-01 Pursue landed (the link package directory hash is unchanged and no parseUrl exists). The live rules still give one URL four different admission answers, and a refused typed autolink swallows the space or Enter. |
| 40 | `mentions` | None | **Stop** | The document already holds exactly what an entity reference needs (a required ref and an optional authored label). Catalog, lookup, filtering and live display already live in copied UI. So no lane removes caller work or a second truth. |
| 41 | `proof` | Defer | **Pursue** | Neither trigger the Defer named exists yet, and neither decides the stronger move. The public schema-1 raw-mobile receipt in @platejs/test/proof has never had a producer, trusts self-declared directAppium and realDevice flags that docs/vision/plite.md calls claims rather than proof, and demands the Appium driver and 16-row matrix the device-lane plan rejected. It should be hard-cut, and raw Android claims should anchor on the device lane. |
| 42 | `tags` | None | **Pursue** | The select editor keeps the selected values in three writable places (document tag nodes, React internalValue or the controlled prop, synced both ways by effects and a setTimeout) and the query in two (document text and the copied cmdk-fork store), and they already disagree on url and duplicate casing. |
| 43 | `basic` | None | **Pursue** | The basic block descriptors are right (one descriptor per capability, heading as one capability with level). But five internal call sites in list, TOC and indent turn the names heading and blockquote into portals through the private getCompiledPlatePlugin lookup, and eighteen format sites fall back to a raw 'paragraph' literal for the always-installed core paragraph, so equal names stay interchangeable where the identity law forbids it. |
| 44 | `canvas` | None | **Pursue** | The architecture is right (void block, JSON scene, package sync hook, copied presentation), but the public value contract contradicts the stored value: ExcalidrawDataState re-exports Excalidraw's runtime ImportedDataState with appState while the node stores state, the persisted width is admitted but never read or written, and the embed's control boundary rests on an undocumented Plite attribute. |
| 45 | `csv` | None | **Pursue** | CsvPlugin claims every text/plain paste first, at priority 20 with no accept gate, so in the official EditorKit prose with commas (even when text/html is present) and plain-text GFM tables become garbled tables, while real CSV ending in a newline, including Plate's own table-copy TSV, is rejected and header text is silently renamed. |
| 46 | `drawing` | None | **Pursue** | A Mermaid diagram already has two document representations, a codeDrawing void whose source is a string property and a code block whose language is mermaid. The codeDrawing entrypoint also carries four mandatory renderer peers, a global mermaid.initialize reset and a public PlantUML default, which belong to application rendering policy. |
| 47 | `footnote` | None | **Pursue** | Footnote identity is modeled correctly as a persisted ref with live NodeKey navigation, but navigation is tied to a selection write and refused in read-only views, and static and HTML output carry no reference-to-definition link, so the identity stops working exactly where readers need it. |
| 48 | `layout` | None | **Pursue** | Block layout properties keep a second value domain and default in render injection config (validNodeValues, defaultNodeValue) beside the schema property. As a result, the editor stores and exports a schema-valid lineHeight outside the kit's preset list but never renders it. The update.set method also decides omission from render config instead of Plite's schema default/omitDefault. |
| 49 | `math` | None | **Pursue** | The math value, delimiters and inline editing compose well. But the headless platejs/math entry statically imports KaTeX only to publish getEquationHtml, a one-line renderToString wrapper that one copied static renderer uses. The entry also publishes a one-line katex.css alias subpath. So every schema, Markdown or server consumer must install the rendering engine. |
| 51 | `styles` | None | **Pursue** | FontWeightPlugin is a second writable truth for boldness. It and BaseBoldPlugin both decode font-weight 700, so an import yields bold and fontWeight together, and turning bold off still renders bold through the inline style. |
| 52 | `callout` | None | **Pursue** | Details re-implements its summary-first grammar with two content corrections, a transfer veto and a throw because its schema could not express it when it landed on 2026-08-30. Plite has owned that exact law as schema.content.prefix since 2026-09-23, so the Plate machinery now duplicates an adequate Plite API. |
| 53 | `emoji` | None | **Pursue** | Every job platejs/emoji publishes (a ':' trigger, inserting native text through a createEmojiNode factory, and searching the emoji-mart catalog) is product composition whose only terminal consumers are copied UI, and current doctrine gives catalogs and filtering to copied controls. |
| 54 | `fixed-toolbar-scroll` | Pursue, unbound work | **Stop** | The Pursue target landed: FixedToolbar is presentational with no editor subscription, ResizeObserver or scroll-padding write, and the copied EditorFrame allocates a toolbar row beside the registered EditorContainer scrollport, so no materially better design remains. |
| 55 | `toc` | None | **Pursue** | TOC finds headings by turning the name 'heading' into a portal through the private getCompiledPlatePlugin lookup, so any same-name plugin counts as the heading owner, and it publishes a function-valued queryHeading store override that has no production consumer and duplicates ordinary read customization. |
| 56 | `date` | None | **Pursue** | The package publishes the display label (English Today, Yesterday and Tomorrow plus a runtime-locale date relative to render time), which is application presentation, and the copied static renderer bakes it into server output. |
| 57 | `search` | None | **Defer** | Ownership is settled, with headless BaseFindPlugin owning query, results, invalidation and paint and each mounted view owning its bar, so the only material open question is whether a full rescan and full match republication on every document commit costs enough at realistic match counts to justify changed-block maintenance, and no benchmark has measured that end to end. |
| 58 | `diff` | Pursue, not adopted | **Pursue** | The old target is already adopted in live source, so the remaining material gap is the API built beyond the current job. A three-way compare and resolveComparison API has no product consumer, and the live-review import shipped as a free function over an erased editor instead of a typed authored write. |

## Pursue queue

The 24 Pursue units in queue order, each with its current and proposed call site and one next invocation. A Pursue does not continue into a plan in this run.

### 1. reads (queue 2)

**Current.** editor.subscribe((snapshot, commit) => save(snapshot)) and editor.subscribeCommit((commit, snapshot) => sync(commit)) are both public on BaseEditor; notifyListeners calls commit listeners, then snapshot listeners, for the same commit; the Plite provider uses editor.subscribe.

**Proposed.** editor.subscribeCommit((commit, snapshot) => save(snapshot)) is the only public subscription (proposed: remove BaseEditor.subscribe and the root SnapshotListener export); the Plite provider keeps its post-commit-listener publication through the private listener-state subscribe phase.

**Next.** `best-api review editor.subscribe and editor.subscribeCommit`

### 2. distribution (queue 6)

**Current.** In any app, import { setEditorTransactionViewTransform, runTrustedUpdate, initializePlugins, MAIN_ROOT_KEY } from 'platejs' resolves through packages/platejs/src/core.tsx:3 (export * from 'plitejs'); Plate's own facade imports the same hooks from the plitejs root (packages/platejs/src/facade.ts:1-49).

**Proposed.** The proposed packages/platejs/src/facade.ts imports { initializePlugins, runTrustedUpdate, setEditorTransactionViewTransform, MAIN_ROOT_KEY, ... } from 'plitejs/internal'. In apps, import { setEditorTransactionViewTransform } from 'platejs' no longer resolves, while import { createEditor, definePlugin, schema } from 'platejs' is unchanged.

**Next.** `plan distribution to export plitejs @internal framework hooks and MAIN_ROOT_KEY only from plitejs/internal, repoint the Plate facade, guard public entrypoints against @internal exports, and reconcile the internal-bridge doctrine`

### 3. documents (queue 11)

**Current.** const result = await exportDocx(editor, { projection: 'review', nativeState: 'attach' }); // writes editor/authored.json. const imported = await importDocx(file, { plugins, authoredTrust: { kind: 'same-application' } }); // the hidden document wins only if every package part is byte-identical

**Proposed.** const result = await exportDocx(editor, { projection: 'review' }); // Word revisions and comments only. const exact = JSON.stringify(projectAuthoredReview(editor.read.value()).review); // canonical authored JSON holds exact Plate review state. const imported = await importDocx(file, { plugins }); // always derived from visible OOXML. Proposed removals: nativeState, authoredTrust, DocxAuthoredTrust, native-data-ignored, editor/authored.json.

**Next.** `hard cut documents to remove DOCX nativeState, authoredTrust and the editor/authored.json envelope with its correspondence digests, and route exact review state to canonical authored JSON (Build playbook with the architecture reference's Hard cut)`

### 4. pagination (queue 14)

**Current.** import { PagedEditable } from 'platejs/pagination/react'; <EditorRoot editor={editor}><PagedEditable ref={editableRef} page={{ margins: 72, preset: 'letter' }} /></EditorRoot> renders the raw Plite editable with no Plate plugin renderers, handlers, shortcuts or slots (the guide imports a nonexistent Plate).

**Proposed.** import { PagedEditorContent, usePageLayout } from 'platejs/pagination/react'; <EditorRoot editor={editor}><PagedEditorContent ref={editableRef} page={{ margins: 72, preset: 'letter' }} pageView={{ gap: 24, mode: 'single' }} renderPage={renderPage} virtualize /></EditorRoot>, implemented as EditorContent with the private editable override set to Plite PagedEditable. The raw PagedEditable stays in plitejs/pagination/react only. The name is Best API's call.

**Next.** `plan pagination to route Plate paged editing through the EditorContent plugin pipeline (a Plate paged content variant beside VirtualizedEditorContent) and repair the Plate pagination guide`

### 5. suggestions (queue 16)

**Current.** createEditor({ plugins: [...SuggestionKit, ...DiscussionKit, CommentsPlugin.configure({ initialState: { currentUserId: user.id, users } })], userId: user.id }); DefaultAuthoredPlugin resolves Reflect.get(editor.runtime, 'userId'); acting as another author means editor.runtime.userId = 'bob' (playground replays proposals this way before hydrating).

**Proposed.** Proposed: createEditor({ plugins: [...SuggestionKit, ...DiscussionKit, CommentsPlugin.configure({ initialState: { users } })], userId: user.id }); authored attribution and Comments read one typed session actor (no currentUserId, no Reflect bridge, no runtime mutation); multi-author fixtures load as initialValue: createAuthoredReviewDocument({ accepted, revisions: [{ id, authorId, createdAt, change }] }).

**Next.** `plan suggestions to give authored attribution and Comments one typed editor-session author identity (deleting the Reflect runtime.userId bridge and the duplicate Comments currentUserId) and to load the playground's multi-author fixture through createAuthoredReviewDocument without actor switching`

### 6. editor-public-naming (queue 25)

**Current.** installBrowserHandle() from 'platejs/react' sets element.__pliteBrowserHandle whose insertData takes { pliteFragment }; createEditor().id === 'plite-editor-1'; editor.plugin(CommentsPlugin).api.toJSON() returns { kind: 'plate-comments', version: 1, ... }; VISION.md teaches <Plite decorations> and editor.extension(Extension).api.

**Proposed.** Proposed: installBrowserHandle() sets a neutral element key (for example __editorBrowserHandle) whose insertData takes { fragment }; createEditor().id follows a neutral documented default; toJSON() returns { kind: 'comments', version: 1, ... }; VISION.md teaches <EditorRoot decorations>, editor.plugin(Plugin).api, PluginTypeProvider and toReactPlugin().

**Next.** `plan editor-public-naming to hard-cut the remaining branded observable values (browser handle key and field, comments JSON kind, plain-text format key, default editor id, @platejs/test env var), correct the stale root VISION nouns, and add a string-literal naming guard`

### 7. markdown (queue 29)

**Current.** In committed code, editor.api.markdown.serialize({ document }) returns ok false when a table cell holds list paragraphs, because the cell markdown.encode refuses and the row and table refuse in turn; main's cell list HTML parses to literal tag text.

**Proposed.** In the working tree, built but not committed, editor.api.markdown.serialize({ document }) returns ok true with the cell on one line of inline list HTML. The table cell mapping is encode: ({ encodeLine, node }) => ({ children: encodeLine(node.children), type: 'tableCell' }), and the table decoder reads each cell with decodeLine(cell.children, marks) (proposed public context members).

**Next.** `execute docs/plans/2026-10-03-markdown-table-cell-blocks.md from its first open gate (Needs you: Round 3 fixes), in the session that owns it`

### 8. autocomplete (queue 35)

**Current.** Copied popup: const box = useCombobox({ activeOptionId, editableRef, onKeyDown, open: shown, plugin }); item click calls box.complete(match, (tx) => onSelect?.(tx)). Owner at HEAD: view.subscribeCommit(commit => readTypedInsertion(commit)) filters private dom-text-input and native-text-input tags, and readPreview maps Plite DOM itself and strips U+FEFF.

**Proposed.** Copied popup call site unchanged. Owner on proposed public Plite calls (built, uncommitted): view.api.react.subscribeTypedText(({ editable, range, text }) => { if (editable === element) onTyped({ caret: RangeApi.end(range), length: text.length }) }) and view.api.dom.textToCaret(RangeApi.end(trigger)). No combobox plugin field, slots.combobox or ComboboxPlugin host.

**Next.** `execute docs/plans/2026-10-03-autocomplete-occurrence-host.md to close Phase 1b and run Phase 3, leaving Phase 2 at its gate`

### 9. link (queue 39)

**Current.** LinkPlugin.configure({ initialState: { isUrl, getUrlHref, transformInput } }); if (editor.plugin(LinkPlugin).api.validateUrl(url)) editor.update.link.upsert({ url }); // space rule apply: tx.selection.set(match.range); if (!tx.link.upsert({ url: match.url })) return;

**Proposed.** // proposed: LinkPlugin.configure({ initialState: { allowedSchemes, parseUrl: (input) => href | undefined } }); const href = editor.plugin(LinkPlugin).api.parseUrl(input); // the same decision upsert, paste, autolink, Markdown and HTML decode use; rule apply: if (!tx.link.upsert({ url: match.url })) return decline();

**Next.** `plan link for one parseUrl destination decision across typed autolink, paste, toolbar, Markdown and HTML, with refusing rules returning decline()`

### 10. proof (queue 41)

**Current.** bun test:mobile-device-proof:raw reads test-results/release-proof/mobile-device-proof.json and passes only receipts that declare directAppium: true, transport appium-android or appium-ios and device.realDevice: true for all 16 RAW_MOBILE_SCENARIOS on both platforms, via validateRawMobileProof from @platejs/test/proof; nothing writes that file. Android soft-keyboard evidence comes from PLATE_DEVICE_WWW_PORT=3000 pnpm --filter plite exec playwright test --config playwright.device.config.ts after node tooling/device/android.mjs doctor, which the gate never reads.

**Proposed.** Proposed: @platejs/test/proof no longer exports RAW_MOBILE_SCENARIOS, validateRawMobileProof, assertRawMobileProof, the RawMobile* types or classifyBrowserMobileTransportProof; package.json drops test:mobile-device-proof and test:mobile-device-proof:raw and tooling/plite/donor/proof/mobile-device-proof.mjs is deleted. A raw Android claim runs only through the device lane (node tooling/device/android.mjs doctor, then pnpm --filter plite exec playwright test --config playwright.device.config.ts) within common.md's emulator claim width; the release-ready raw-mobile lane stays fail-closed until an authorized release claim builds the re-derived lane receipt from 2026-10-02-proof-release-trust.

**Next.** `plan proof to hard-cut the producerless direct-Appium raw-mobile receipt API from @platejs/test/proof and its runner, and anchor raw Android claims on the device lane`

### 11. tags (queue 42)

**Current.** <SelectEditor value={value} onValueChange={setValue} items={ITEMS}> // inside: useState(defaultValue); useEditorSelector(getSelectedItems) -> effect -> setValue + onValueChange; controlled value -> setTimeout(0) -> editor.update({ history: 'skip' }).value.replace(...); EditorRoot onValueChange -> cmdk setSearch(text); MultiSelect on.commit -> second editor.update

**Proposed.** // proposed, same public props: <SelectEditor value={value} onValueChange={setValue} items={ITEMS}> // inside: EditorRoot onValueChange={({ editor }) => emit(editor.plugin(MultiSelectPlugin).read.getSelectedItems())}; the query is the document text; a changed controlled value replaces the document once; query cleanup runs inside the user transaction

**Next.** `plan tags to make the mounted select-editor document the single selected-value and query truth`

### 12. basic (queue 43)

**Current.** Inside platejs: const d = getCompiledPlatePlugin(editor, PLUGINS.heading); const headingType = d ? editor.plugin(d).schema.type : undefined; format code: const paragraphType = registry.type(PLUGINS.paragraph) ?? 'paragraph';

**Proposed.** const heading = editor.plugin(BaseHeadingPlugin); const headingType = heading.installed ? heading.schema.type : undefined; (toc and standard/list declare the standard/basic-nodes edge); format code: const paragraphType = registry.type(BaseParagraphPlugin); // proposed: string for the always-installed core descriptor, no literal fallback

**Next.** `plan basic to resolve heading, blockquote and paragraph identity through nominal descriptors in list, TOC, indent and format code`

### 13. canvas (queue 44)

**Current.** import { BaseExcalidrawPlugin, type ExcalidrawDataState } from 'platejs/excalidraw'; editor.plugin(BaseExcalidrawPlugin).update.insert({ data: { elements, state } }); copied ExcalidrawElement renders <div contentEditable={false} data-editor-root-chrome-ignore='true'> and calls useExcalidrawSync({ api, excalidraw }); a stored width is accepted and ignored.

**Proposed.** Same insert and useExcalidrawSync({ api, excalidraw }); the only public value type is the stored data (proposed: NonNullable<ExcalidrawElement['data']>, named only if a consumer needs it); ExcalidrawDataState and the persisted width are deleted; copied embeds mark a documented Plite embedded-control boundary (name chosen by best-api) instead of relying on the undocumented root-chrome-ignore marker.

**Next.** `best-api review the platejs/excalidraw value and embed contract (ExcalidrawDataState, the persisted width and the data-editor-root-chrome-ignore control boundary)`

### 14. csv (queue 45)

**Current.** EditorKit installs CsvPlugin, which decodes text/plain at priority 20 with no accept; editor.api.csv.deserialize({ data, ...PapaParse ParseConfig }) returns Descendant[] or undefined; CsvPlugin.configure({ initialState: { errorTolerance, parseOptions } }); table, row and cell types resolve by name through getCompiledPlatePlugin(editor, PLUGINS.table).

**Proposed.** Proposed: editor.api.csv.parse(text, { delimiter?, header? }) returns { ok: true, document } or { ok: false } with diagnostics and keeps every field verbatim; CsvPlugin declares dependencies: [BaseTablePlugin], builds cells through Table's cell factory and leaves ragged rows to Table's repair; its DataTransferFormat reads text/csv and text/tab-separated-values exactly, accepts text/plain only without text/html and only for a consistent tab-delimited grid or a configured delimiter, and reports any field it drops.

**Next.** `plan csv to make tabular ingress claim only tabular payloads, keep cells verbatim and parse with diagnostics`

### 15. drawing (queue 46)

**Current.** import { renderCodeDrawing } from 'platejs/code-drawing'; the copied CodeDrawingElement({ plantUmlServer = 'https://www.plantuml.com/plantuml' }) calls renderCodeDrawing(language, code, { plantUmlServer }) and writes editor.update.nodes.set({ code }) on every textarea change; Markdown emits a custom codeDrawing tag.

**Proposed.** editor.plugin(CodeBlockPlugin).update.insert({ language: 'mermaid' }) (existing API) creates the diagram; copied code-block UI previews diagram languages through a registry-owned map such as const diagramRenderers = { mermaid: renderMermaid, graphviz: renderGraphviz } (proposed, copied source), PlantUML renders only through an explicit provider item that takes the app's server, and platejs/code-drawing is deleted.

**Next.** `plan drawing to merge codeDrawing into code-block diagram languages with registry-owned renderers and an explicit PlantUML provider (the minimum target is a headless platejs/code-drawing without renderers)`

### 16. footnote (queue 47)

**Current.** editor.api.footnote.focusDefinition({ ref: '3' }) // selects, focuses, scrolls, flashes; returns false in a read-only view. Static: <sup>[3]</sup> and a definition div without id; no html mapping on BaseFootnotePlugin or BaseFootnoteDefinitionPlugin.

**Proposed.** editor.api.footnote.focusDefinition({ ref: '3' }) // proposed: reveals by scroll and flash in any mounted view, moves the caret only when editable. Static and HTML (proposed mapping): <sup><a href="#fn-3" id="fnref-3">3</a></sup> and a definition with id="fn-3", decoded back to ref '3'.

**Next.** `plan footnote for write-free read-only navigation and GFM-compatible static and HTML anchors`

### 17. layout (queue 48)

**Current.** BaseLineHeightPlugin.configure({ inject: { nodeProps: { defaultNodeValue: 1.5, validNodeValues: [1, 1.2, 1.5, 2, 3] } }, targetPlugins: [PLUGINS.heading, PLUGINS.paragraph] }); editor.plugin(LineHeightPlugin).update.set(2); editor.plugin(ColumnPlugin).update.insert({ columns: 3 }) // ColumnPlugin owns columnGroup

**Proposed.** The lineHeight schema property declares its domain and default with omitDefault (configured through initialState). editor.plugin(LineHeightPlugin).update.set(2) or tx.nodes.set({ lineHeight: 2 }, { match }) canonicalizes through the schema. Inject keeps only the style mapping, and the copied toolbar owns [1, 1.2, 1.5, 2, 3]. For columns, the call becomes editor.plugin(ColumnGroupPlugin).update.insert({ columns: 3 }), with ColumnPlugin naming 'column' (proposed names), and moveMiddle is deleted.

**Next.** `plan layout for a schema-owned value domain and default on block layout properties and for capability-named column descriptors`

### 18. math (queue 49)

**Current.** import { getEquationHtml } from 'platejs/math'; import 'platejs/math/katex.css'; copied EquationElementStatic renders getEquationHtml({ element, options }); importing BaseEquationPlugin for schema or Markdown loads katex.

**Proposed.** import katex from 'katex'; import 'katex/dist/katex.min.css'; copied EquationElementStatic renders katex.renderToString(element.latex, options), like the live element's katex.render; platejs/math exports only the equation descriptors, MathRules and element types, with no katex peer.

**Next.** `plan math rendering ownership to remove getEquationHtml, the katex peer and the platejs/math/katex.css alias so copied renderers import KaTeX directly`

### 19. styles (queue 51)

**Current.** editor.plugin(FontWeightPlugin).update.set('700') and the bold mark both write boldness; HTML or DOCX import of font-weight bold yields { bold: true, fontWeight: 'bold' }; copied font-size-toolbar-button.tsx imports toUnitLess from 'platejs'.

**Proposed.** The bold mark is the sole boldness writer; FontWeightPlugin and PLUGINS.fontWeight are deleted (or restricted to weights bold does not own), so import yields { bold: true } only; toUnitLess becomes a local function in the copied font-size control.

**Next.** `plan styles to make bold the single font-weight truth (hard-cut or narrow FontWeightPlugin) and move toUnitLess into the copied font-size control`

### 20. callout (queue 52)

**Current.** BaseDetailsPlugin schema: content: schema.content.any([schema.content.type('summary').allowed, plugins.blockContent().allowed], { default: { type: 'summary' }, min: 1 }) plus corrections that insert, move or retag summaries; BaseCalloutPlugin persists icon with default '💡' and an unrendered variant.

**Proposed.** Proposed: BaseDetailsPlugin schema: content: schema.content.prefix([{ element: BaseDetailsSummaryPlugin }], plugins.blockContent()); no summary corrections; HTML and Markdown decode construct the summary. Callout: icon: property.string() with no package default; copied CalloutKit supplies the default icon and renders variant or the property is cut.

**Next.** `plan callout to move the details summary grammar onto schema.content.prefix and give copied UI the callout presentation defaults`

### 21. emoji (queue 53)

**Current.** import { createEmojiSearch } from 'platejs/emoji'; import { EmojiPlugin } from 'platejs/emoji/react'; const emojiPlugin = EmojiPlugin.extend({ initialState: { data } }); tx.plugin(emojiPlugin).insert(emoji); // inserts createEmojiNode(emoji)

**Proposed.** // proposed, copied emoji.tsx: const EmojiPlugin = definePlugin('emoji', { editOnly: true, initialState: { trigger: ':', queryPattern } }); // trigger form follows the autocomplete plan; const search = createEmojiSearch(emojiData); // copied; onSelect={(tx) => { tx.text.insert(emoji.skins[0].native); }}

**Next.** `plan emoji to move the emoji plugin, trigger, insertion and search into the copied emoji items and delete platejs/emoji`

### 22. toc (queue 55)

**Current.** TocPlugin.configure({ component: TocElement }); BaseTocPlugin.configure({ initialState: { queryHeading } }); editor.plugin(TocPlugin).read.headings() // { depth, key, title, type }[] via getCompiledPlatePlugin(editor, PLUGINS.heading)

**Proposed.** editor.plugin(TocPlugin).read.headings() // proposed: { key, level, title }[] read from editor.plugin(BaseHeadingPlugin); custom outlines filter in copied UI or replace read.headings in an ordinary .extend() stage; queryHeading and TocPluginState deleted

**Next.** `plan toc to read headings through BaseHeadingPlugin, delete queryHeading and return { key, level, title }`

### 23. date (queue 56)

**Current.** import { getDateDisplayLabel } from 'platejs/date'; {getDateDisplayLabel(element.value)} // in copied date.tsx and date-static.tsx

**Proposed.** // proposed, copied date.tsx and date-static.tsx: const label = formatDateLabel(element.value); // copied function over parseCanonicalDateValue from platejs/date, with the app's locale and relative words; the static item may render an absolute date

**Next.** `clean up platejs/date by moving getDateDisplayLabel into the copied date and date-static items and keeping the value codec in the package`

### 24. diff (queue 58)

**Current.** const comparison = await compare({ before, after, schema: editor.read.schema, signal }); <Diff comparison={comparison} />; const imported = proposeAuthoredComparison(editor, { comparison, groupIds }); plus test-only three-way compare({ base, local, remote, schema }) and resolveComparison({ comparison, baseline, resolutions }).

**Proposed.** Unchanged two-way: const comparison = await compare({ before, after, schema: editor.read.schema, signal }); <Diff comparison={comparison} />. Proposed: const imported = editor.update.authored.<import>({ comparison, groupIds }), typed from the installed authored owner (name settled by best-api; the plan sketched propose({ comparison })). Proposed removal: the three-way compare overload, resolveComparison, the three-way types and the Diff conflict UI until a product consumer exists.

**Next.** `best-api review platejs/diff and platejs/authored comparison import, to cut the unconsumed three-way compare and resolveComparison API and move import onto the typed authored update owner`

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| How a Pursue whose target already landed closes | A Stop review that keeps the landed design | Bind each completed plan with `draft-execution` and keep the Pursue | bind executions |
| Units another session is building | Review them like the rest; both verdicts reaffirm the in-flight target | Exclude autocomplete and markdown from the audit | exclude active |
| Callout and the dnd plan Default on the details grammar | Reverse it, so the callout Pursue names `schema.content.prefix` as the target | Keep the details grammar and its veto, as the dnd plan picked | keep details grammar |
| reads and the June 2026 taste keep of `subscribe` beside `subscribeCommit` | Reopen it and pursue one public commit subscription | Keep both, as the June round approved | keep subscribe |
| Units without a decision page | Record the review only, and let the hub show the missing-decision gap | Create a decision page for each of the 15 first reviews | decision pages |
| Recording while another session leaves `plitejs/react/editable/typed-text` unmapped | Wait for the autocomplete session to map its own file, retrying every 15 minutes | Map that group to the `native` scope here, run `refresh`, then record | map typed-text |

## Open work

- **39 records not yet written.** owner: this audit run. The autocomplete session's untracked packages/plitejs/src/react/editable/typed-text.ts is not mapped in the review index yet, so every validate and record refuses the inventory check. A retry scheduled in this session every 15 minutes redrafts, validates and records each one, then reconciles decision pages, renders and checks. It lives only while this session runs and expires after 7 days; if it dies, rerun the scratch finisher or ask for the records again. Tracked in `docs/plans/2026-10-04-ledger-triage-audit.decisions.tsv`.
- **Fifteen first-review units have no decision page**, so their hubs show a missing-decision gap. owner: the next review or plan of each unit. Tracked by the `node tooling/scripts/review-ledger.mjs lookup <scope>` conflicts.
- **`repair-verification-workflow` names a completed plan as its decision page.** owner: the ledger maintainer. Tracked by its lookup conflicts.
- **The 24 Pursue units stay open** until a plan adopts each target. owner: the repository owner, who picks each unit through `node tooling/scripts/review-ledger.mjs next`. Tracked by `status`.
- **search stays Defer** until its benchmark runs. owner: `benchmark find`. Tracked by `status`.

## Close

39 of 39 verdicts are recorded as the `2026-10-04-<scope>-audit` records committed in 17195da367, and every verdict is final and on this page. Reversals come first. Eleven Pursue verdicts and two Defers closed as Stop on live adoption evidence, and proof moved from Defer to Pursue. Every verdict rests on source and history review. Research ran in twelve read-only Opus subagents, and the lead re-ran at least one decisive citation per unit before accepting its verdict. CSV and markdown cite headless probes from scratch scripts. No test, browser, benchmark or device run backs any verdict, and verdicts that cite uncommitted files from other sessions say so in their proof limits. Counts: 39 units, 39 done, 0 skipped, 0 blocked, 0 open.

## Evidence

- Each unit ran the `best-api-review` audit method with `.agents/playbooks/api-review.md`, framed by its ledger question, its current owners and consumers, the six change lanes and the strongest deletion or replacement.
- Each unit gets one record, `docs/research/review-records/2026-10-04-<scope>-audit.json`, with its requirements, alternatives, reconciliation of earlier records and proof limits.
- The intake `node tooling/scripts/review-ledger.mjs check` already failed, because the live tree has a `plitejs/react/editable/typed-text` inventory group the index does not map. The same check at `HEAD` in a detached worktree fails differently, because the `HEAD` index maps `application/ai-command` and `application/ai-copilot` groups the `HEAD` tree lacks. The live failure comes from another session's uncommitted work, not from this audit.
- The decision trail is `docs/plans/2026-10-04-ledger-triage-audit.decisions.tsv`.

