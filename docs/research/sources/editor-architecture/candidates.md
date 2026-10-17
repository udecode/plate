---
title: Editor comparison candidates for Plate and Plite
type: source
status: partial
source_refs:
  - ../../../plite/research/2026-10-13-editor-comparison/README.md
  - current-comparison.md
updated: 2026-10-13
---

# Editor comparison candidates for Plate and Plite

Choose comparison editors by the question. There is no source-backed global winner across engines, ready-made editors, document processors and layout libraries.

The [current comparison](current-comparison.md) and [research run](../../../plite/research/2026-10-13-editor-comparison/README.md) record current repository discovery, pinned local source reads, test inspection, exclusions and freshness limits. These are source findings. No comparative speed, native-input or release-readiness result follows from them.

## What other editors do

| Decision | First comparison sources | What to examine |
| --- | --- | --- |
| Canonical changes, transactions, mapping and DOM ownership | ProseMirror, Lexical, Wordgard, Slate, CKEditor 5 | State authority, change application, selection mapping, reconciliation and composition |
| Extension composition and type inference | Current Lexical Extensions, ProseKit, Tiptap | Dependency identity, typed grouping, configuration, commands and disposal |
| Block storage and collaboration | BlockSuite, Blok, BlockNote, Portable Text | Shared identity, placement, schema admission, local undo and serialization |
| React block-framework ergonomics | BlockNote, Yoopta, ProseKit | Product policy, typed schema, adapters and component lifecycle |
| Structured content and behavior contracts | Portable Text, ProseMirror, CKEditor 5 | Schema applicability, annotations, explicit scenarios and conversion |
| Markdown and hidden syntax | Meowdown, MDXEditor, Milkdown, Vditor | Caret affinity, selected export, syntax deletion and nested code-editor lifecycle |
| Pagination and document fidelity | OpenDoc, SuperDoc's public painter, canvas-editor | Full/windowed equivalence, hydration, fields, fallback behavior and public-source boundaries |
| Preparation versus repeated layout | Pretext, CodeMirror, Premirror as a qualified experiment | Measurement counts, prepared handles, line cursors, mapping and invalidation |
| Input, focus and undo | CodeMirror, Lexical, Wordgard, TinyMCE, RoosterJS, Lexxy | Composition identity, nested transactions, unfocused formatting and typeahead focus |
| Collaboration adapters | Loro ProseMirror, BlockSuite, Blok and Wordgard | Origin, initialization, stable cursors, local undo and concurrent structural edits. Existing y-prosemirror and Lexical Yjs research is historical context until refreshed. |
| Agent edits and provenance | Proof SDK, current editor suggestion/collaboration owners | Stale results, canonical edits, persistence, reconnect and authored-change identity |
| Cross-platform model/view ownership | AppFlowy Editor | Stable identity, transaction selection and Flutter materialization. This is not browser-native proof. |

These are starting sets, not a requirement to read every editor for a small decision. Select the sources that challenge the actual owner or behavior.

## Additions that change the comparison

- **Wordgard adds another independent engine.** Its change sets, mapped effects, central-authority collaboration and composition tests provide a direct runtime comparison outside ProseMirror wrappers.
- **ProseKit and current Lexical expand framework evidence.** Compare their typed composition and dependency lifecycle with Plate's existing owners before inventing another plugin abstraction.
- **BlockSuite and Blok expand collaborative-block evidence.** Compare CRDT storage, placement, origin-filtered undo and convergence tests. AFFiNE is an application of BlockSuite, not another engine.
- **Portable Text is a schema and behavior reference.** Its current tree contains an in-tree editor engine, schema packages and executable behavior specifications. It does not justify replacing Plite's data model or adopting its behavior DSL.
- **Meowdown, MDXEditor and Milkdown add distinct Markdown contracts.** Their value is more precise than a generic claim that they support Markdown.
- **OpenDoc, canvas-editor and public SuperDoc packages expand document-layout evidence.** Each has different correctness, maturity, rendering and source-availability limits.
- **Lexxy and Proof SDK add product evidence.** Lexxy contributes focus and extension lifecycle scenarios over Lexical. Proof SDK contributes agent, provenance and provider/persistence scenarios over Milkdown and ProseMirror.

Exact source pins and test paths are in the current comparison and the run's read log.

## Freshness corrections

- BlockNote is active. Its default branch had October 13 activity, and v0.55.0 shipped September 22, 2026. Keep its product and schema evidence. Its Tiptap/ProseMirror lineage is still explicit.
- ProseMirror's archived GitHub repositories moved to its canonical host. The current view source was read at an October 6 commit. Archived mirrors do not establish an inactive engine.
- Current Lexical has framework-independent Extensions with dependencies, typed outputs and disposal. A comparison limited to the older React plugin scheme is stale.
- SuperDoc v2's public package depends on proprietary DOCX Engine. Public pagination and painter code is inspectable. The complete current document engine cannot receive a public-source implementation grade.
- Premirror uses an older Pretext signature and contains fallback width calculations. This is a source-level freshness concern against current Pretext, not a reproduced integration failure or a proven leading pagination solution.
- The old edix URL redirects to editate.
- Toast UI Editor and Draft.js are archived in the current GitHub screen. Retain specific historical lessons without treating them as active comparison defaults.
- Meowdown's browser engines with touch emulation do not prove iOS. Vditor's Android user-agent tests and rich-textarea's Chromium CDP tests do not prove native device IME behavior.

## Candidates that remain narrower

Remirror, Umo, wangEditor, Doist Typist, React ProseMirror and other wrappers can answer specific framework or integration questions. They do not provide independent confirmation of an engine they inherit.

Quill remains useful for Delta and local-undo intent. Editor.js remains useful for tool validation and exported block JSON. Neither repository's age settles its value.

ONLYOFFICE, Collabora, LibreOffice, Monaco, Zed, Gutenberg, Trix, Squire, newer DOCX projects and the remaining discovered editors are explicitly screened or discovery-only in the registry. This run does not claim current implementation coverage for those projects.

Keep urql, TanStack DB, VS Code/LSP, EditContext and Open UI as specialist service, projection or platform references when the question requires them. Their older evidence does not make them rich-text editor contenders.

## Evidence retained from earlier research

The following source-pinned findings remain historical specialist evidence. Their current behavior was not replayed in this pass. Reopen them when their source or the consuming requirement changes.

- **edix: an explicit internal clipboard and a DOM-selection adapter.** edix's `internalTransferPlugin` writes the selected fragment as JSON under one app-specific MIME type (default `application/x-editate-editor`) on copy and reads it back on paste, so two editors exchange structure only when they share a schema (`inokawa/edix@528ec15113790a977e35614c3a5f56395d46819e:src/plugins/transfer/internalTransfer.ts:5-31`). `takeSelectionSnapshot` serializes the DOM selection into document positions and keeps its direction (`inokawa/edix@528ec15113790a977e35614c3a5f56395d46819e:src/dom/index.ts:268-306`). Its history plugin starts a new undo entry only after 500 ms without a document change, so it groups edits by time, not by transaction (`inokawa/edix@528ec15113790a977e35614c3a5f56395d46819e:src/plugins/history.ts:9`, `:94-113`). Source: `831f5e5da6a37f7d9095c1a81acc6b3de10bd3ba:docs/analysis/plite-plate-v2-architecture-research.md:74-171`, a 2026-04-03 read that cited older unpinned paths (`src/extensions/copy/internal.ts`, `src/history.ts`); checked at the local clone on 2026-10-08. Limit: source read only, nothing run.

- **use-editable keeps the DOM, not a model, as the source of truth.** It lets the browser mutate the `contenteditable` element and records the mutations with a `MutationObserver` (`FormidableLabs/use-editable@008a0b51a9bc7c9812fe74633b4117bd74477627:src/useEditable.ts:192-194`). On flush it reads the element's text and caret, reverts every queued mutation (restoring old text, reinserting removed nodes, removing added ones) and passes the text and caret position to `onChange`, so React renders the new value (`:345-369`). Undo is a local stack of `[position, text]` snapshots that records a new entry only after 500 ms without one and keeps about 500 entries (`:314-337`), and paste inserts only `text/plain` (`:468-474`). That shape fits small plain-text surfaces only. Source: `831f5e5da6a37f7d9095c1a81acc6b3de10bd3ba:docs/analysis/plite-plate-v2-architecture-research.md:778-885` (2026-04-03, unpinned), checked at the local clone on 2026-10-08. Limit: source read only, nothing run.

- **urql's exchange-authoring rules.** These are the part of urql's pipeline worth carrying into a future Plate service pipeline. Exchanges run in the order they are passed: operations flow from the start to the end, and results return through the chain in reverse (`urql-graphql/urql@1eb11fcd68cc13d413f42e34a49c798dd97a7506:docs/advanced/authoring-exchanges.md:47-59`). An exchange that filters for the operations it handles must still forward every other kind, because new operation kinds can appear and a filtered-out operation never reaches the exchanges after it (`:150-189`). Exchanges are ordered synchronous first and asynchronous last, so components can receive cached data on their first mount without rerendering (`:191-211`). Source: `831f5e5da6a37f7d9095c1a81acc6b3de10bd3ba:docs/analysis/plite-plate-v2-architecture-research.md:1289-1343`, a 2026-04-03 read that cited these files unpinned, with urql's core package paths renamed to `platejs` by the slate-to-plite rename; checked at the local clone on 2026-10-08. Limit: no Plate or Plite pipeline uses exchanges; this is pressure for a service layer, not current law.

- **TanStack DB makes derived views incremental.** Live queries compile to a differential-dataflow graph in `@tanstack/db-ivm`, a simplified fork of ElectricSQL's d2ts (`TanStack/db@68366ecaeef6c12a13402b558bd4a68d7519442f:packages/db-ivm/README.md:1-5`, `TanStack/db@68366ecaeef6c12a13402b558bd4a68d7519442f:packages/db/src/query/compiler/index.ts:310`); each collection manages its own indexes (`TanStack/db@68366ecaeef6c12a13402b558bd4a68d7519442f:packages/db/src/collection/indexes.ts:209`); and the React binding subscribes through `useSyncExternalStore` (`TanStack/db@68366ecaeef6c12a13402b558bd4a68d7519442f:packages/react-db/src/useLiveQuery.ts:3`). The 2026-04-03 read judged its optimistic transactions no substitute for editor undo history and placed it as a projection and index layer over editor truth, such as comment or semantic views. Source: `831f5e5da6a37f7d9095c1a81acc6b3de10bd3ba:docs/analysis/plite-plate-v2-architecture-research.md:1119-1228` (unpinned), checked at the local clone on 2026-10-08. Limit: source read only; no Plate code uses it.

- **The four proposals.** The Open UI Richer Text Fields explainer bundles four proposals for native `<input>` and `<textarea>`: an `InputRange()` over a live field value, CSS highlights on those ranges, suggestion or ghost-text APIs on `HTMLInputElement` and `HTMLTextAreaElement`, and a presentational `mask` attribute. As the 2026-04-03 read summarized it, the explainer argues that today's workarounds, such as overlays, injected characters and multiple inputs, break undo and redo, copy and paste and deletion, which native primitives would keep; if they land, many rich-textarea-style surfaces need neither contenteditable nor Plite. Source: `831f5e5da6a37f7d9095c1a81acc6b3de10bd3ba:docs/analysis/plite-plate-v2-architecture-research.md:1666-1773`, which read `site/src/pages/components/richer-text-fields.explainer.mdx` in an unpinned local open-ui clone. Limit: not rechecked since, no `../open-ui` clone remains, and these were proposals, not shipped platform features, when read.

## Selection limits

Star counts and activity route investigation. They do not establish architecture quality, measured speed or correctness. Test source shows a scenario and its oracle, not a passing result in this run.

Before adoption, choose the native Plate or Plite owner and use its actual proof. A runtime change needs the owning design and verification workflow. A scale claim also needs a measured Benchmark packet. The comparison decision (`2e865a0bc4:docs/research/decisions/editor-comparison-set.md`) records what this research accepts and rejects.
