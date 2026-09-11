# platejs

## 54.0.0-beta.2

### Major Changes

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Expose semantic AI preview cleanup through the AI plugin update group so cross-node cleanup stays owned by the plugin schema.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Use editor-scoped `NodeKey` values for live AI selections, snapshots, and replacement targets. Correlate one request and response with small `blockRef` and table-cell `ref` tokens mapped to local node keys. Persisted IDs remain limited to references that must survive reloads, storage, editor destruction, or another client through `ElementIdPlugin`.

  Publish AI behavior through explicit services, snapshot reads, selectors, and transaction updates. Remove standalone preview, streaming, prompt, comment, suggestion, and Copilot command helpers.

  **Migration:** Use the installed plugin capabilities:

  ```tsx
  const ai = editor.plugin(BaseAIPlugin);
  const aiChat = editor.plugin(AIChatPlugin);
  const copilot = editor.plugin(CopilotPlugin);

  ai.read.hasPreview();
  ai.update.beginPreview();
  ai.api.findTextRangeInBlock({ block, findText });
  aiChat.read.prompt({ prompt: "Improve this" });
  aiChat.update.insertChunk(chunk);
  aiChat.update.insertBelow({ format: "none" });
  aiChat.update.replaceSelection();
  copilot.store.get("isSuggested");
  copilot.update.accept();
  ```

  Use `{tableCellWithRef}` for selected-table prompt context. Table-cell updates use `{ ref, content }`, while comment results use `{ blockRef, content, comment }`. These refs are request-local and do not require `ElementIdPlugin`.

  AI Chat controllers and Markdown services live in `aiChat.api`; document queries live in `aiChat.read`; its mutations live in `aiChat.update`. Mark undo-safe AI batches with `ai.update.markBatch()`. Remove standalone `findTextRangeInBlock` imports.

  Bind the editor with `useAIChat({ editableRef, transport, onData })`. The package owns the stream cursor, generated preview, request cancellation, and writable-view lifetime across views sharing one editor; `AIChatEditor` renders that preview. `insertBelow` and `replaceSelection` read the owned preview and accept formatting options. The copied `ai-menu` owns anchoring, prompts, and product interaction policy. Replace `useChatChunk` with this editor binding.

  Export `AIChatPluginState` and `CopilotPluginState` as the complete mutable state contracts for their descriptors.

  Return focus to the invoking mounted editor when closing AI Chat. Preserve the `focus: false` option and reject anchor removal through a retired view.

  Require explicit Copilot completion transport configuration. Set `completeOptions.api` before triggering a completion; the package does not guess an application route. Export `CopilotCompleteOptions` for that contract.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Remove the Heading, Basic Blocks, and Basic Marks grouping descriptors and package-owned preset arrays. The package exports each Base and React capability plugin independently. Built-in marks expose semantic read and update methods. `ScriptPlugin` represents subscript and superscript through one `script: 'sub' | 'sup'` property. Paragraphs and horizontal rules persist under the canonical plugin identities `paragraph` and `horizontalRule`.

  **Migration:** List the package plugins your editor supports, or install the matching app-owned Plate registry kit.

  ```tsx
  import { H1Plugin, H2Plugin } from "platejs/react";

  const plugins = [H1Plugin, H2Plugin];
  ```

  Replace `SubscriptPlugin` and `SuperscriptPlugin` with `ScriptPlugin`. Toggle the requested position with `editor.update.script.toggle('sub' | 'sup')`. Toggle headings through their generic text-block commands. Toggle blockquotes through `editor.update.blockquote.toggle()`, which owns wrap and unwrap semantics.

  Add the shared v54 document step while loading persisted v53 text marks:

  ```tsx
  import {
    defineDocumentMigrations,
    migratePlateV54,
  } from "platejs/migrations";

  const migrations = defineDocumentMigrations(EditorSchema, {
    steps: { 54: migratePlateV54 },
    unversioned: 53,
  });
  ```

  Replace six heading plugins with one Heading plugin and required level.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Export `TextIndentPluginState` as the complete mutable state contract for `BaseTextIndentPlugin`.

  - Move line-height and alignment mutations to plugin-owned `editor.update.*.set` commands, use `editor.update.nodes.set` and `unset` for text indentation, and expose typed `clear` updates for foreground and background colors
  - Register validated font, alignment, indentation, and line-height properties with schema-owned persisted keys
  - Restrict `textAlign` to `start`, `left`, `center`, `right`, `end`, or `justify`
  - Decode and encode style properties through schema-inferred `codecs: ({ defineCodecs }) => defineCodecs({ 'text/html': ... })` constructor declarations

  **Migration:** Replace `setAlign(editor, value)` with `editor.update.textAlign.set(value)` and `setLineHeight(editor, value)` with `editor.update.lineHeight.set(value)`. Text alignment persists under `textAlign`; configure style targets through `targetPlugins`.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Remove `useCalloutEmojiPicker`. Callout renderers compose `useEmojiPicker` directly with their local popover and node update.

  - Insert callouts through the descriptor's standard `editor.plugin(BaseCalloutPlugin).update.insert(props?, nodeOptions?)` update.
  - Register callout appearance properties and the materialized `💡` icon default in the compiled schema.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Export `CodeHighlightPluginState` as the complete mutable state contract for `BaseCodeHighlightPlugin`.

  Expose code-block queries through `editor.read.codeBlock` and mutations through `editor.update.codeBlock`. Register code-block properties in compiled schemas.

  Preserve compound command targets and make earlier edits visible to later steps in the same transaction.

  Store each code block in one newline-bearing text child. Remove `CodeLinePlugin`, `BaseCodeLinePlugin`, and the `codeLine` element. Replace `CodeSyntaxPlugin` and `BaseCodeSyntaxPlugin` with `CodeHighlightPlugin` and `BaseCodeHighlightPlugin`. The highlighting plugin owns Lowlight state, transient token decorations, and refresh behavior and depends on `CodeBlockPlugin`.

  **Migration:** Remove code-line plugins and components from plugin arrays. Run `migratePlateV54` while loading persisted v53 code blocks. Replace standalone query, formatter, decoration, and transform imports with the installed plugin groups:

  ```tsx
  editor.read.codeBlock.entry();
  editor.read.codeBlock.isEmpty();
  editor.update.codeBlock.format({ element });
  editor.update.codeBlock.insert();
  editor.update.codeBlock.toggle();
  editor.update.codeBlock.resetBlock();
  ```

  Use `insert(input?, nodeOptions?)` for both empty and populated insertion paths. Configure `lowlight` and `defaultLanguage` on `CodeHighlightPlugin`; omit that plugin for unhighlighted code blocks:

  ```tsx
  const plugins = [
    CodeBlockPlugin,
    CodeHighlightPlugin.configure({
      initialState: { defaultLanguage: "typescript", lowlight },
    }),
  ];
  ```

  Store code block language in the `language` property.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Insert code drawings through the descriptor's standard `editor.plugin(BaseCodeDrawingPlugin).update.insert(props?, nodeOptions?)` update. The compiled schema owns the complete default drawing data and versioned inline validation. Persist flat `code`, lowercase `language`, and `view` fields instead of an opaque `data` object with display-label enum values. The plugin also owns its Markdown MDX codec, so code-drawing data round-trips through Markdown without falling through the generic unreachable-node path. The capability name, command namespace, and default persisted element type are all `codeDrawing`. The MDX tag follows the resolved application schema type. Use `PLUGINS.codeDrawing` for the capability name instead of `CODE_DRAWING_KEY`.

  **Migration:** Replace direct `insertCodeDrawing` calls with the installed plugin update. Pass `at` as the second argument for an explicit location. MDX attributes cannot replace code-drawing children or its resolved schema type.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Copy `inline-combobox` for input focus, query state, keyboard navigation, and presentation. `BaseComboboxPlugin` owns cancellation, completion, and guarded history actions using the live input's `NodeKey`.

  - Handle trigger-combobox insertion through the typed `insertText` command
  - Keep transient collaboration metadata on inserted combobox inputs and reject completion from a foreign, removed, or read-only input
  - Remove and replace the input in one transaction through the inferred `onSelect(tx)` callback; cancellation restores literal query text in one undo step
  - Rename `TriggerComboboxPluginOptions` to `TriggerComboboxPluginState`

  **Migration:** Replace `withTriggerCombobox` with `triggerCombobox` in the descriptor's command factory. Mention, slash, emoji, and footnote input descriptors install `BaseComboboxPlugin` automatically.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) –

  - Replace `@platejs/comment` plugins and comment marks with `CommentsPlugin` from `platejs/comments/react` and serializable thread records with document ranges
  - Load fetched records through `initialState.initialThreads` or `api.setThreads` and save mapped records through `api.getThreads` alongside the editor value
  - Export `extractLegacyCommentRanges` from `platejs/migrations` for offline conversion of comment marks into ordered range groups and a sanitized document

  **Migration:** Supply thread records for the same document revision as the editor value:

  ```tsx
  import { CommentsPlugin } from "platejs/comments/react";
  import { createEditor } from "platejs/react";

  const editor = createEditor({
    plugins: [
      CommentsPlugin.configure({
        initialState: { initialThreads, users, currentUserId },
      }),
    ],
    initialValue,
  });

  const value = editor.read.value();
  const threads = editor.plugin(CommentsPlugin).api.getThreads();
  ```

  Run `extractLegacyCommentRanges` before loading persisted documents that contain legacy comment properties.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Consolidate the Plate editor API into `platejs`.

  **Migration:** Replace `@platejs/*` editor dependencies with `platejs`. Import core, basic nodes, basic styles, code block, indent, link, and list APIs from `platejs` or `platejs/react`. Import pagination from `platejs/pagination` or `platejs/pagination/react`. Import other features from `platejs/<feature>` or `platejs/<feature>/react`, and install the optional peers documented by each selected feature.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Return a plain `Editor` from `useEditor`, `useOptionalEditor`, and `useEditorSelector`. Read the Plate store with `usePlateStore`.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Export `CsvPluginState` as the complete mutable state contract for `CsvPlugin`.

  - Move `CsvPlugin` to the Plite plugin runtime with typed CSV deserialization through `editor.api.csv.deserialize`
  - Seed CSV codec behavior through `CsvPlugin.initialState`
  - Use the plugin API as the sole CSV deserialization surface
  - Represent CSV header fields as `tableCell` nodes with `header: true`

  **Migration:** Configure CSV state through `initialState` and use the inferred editor API:

  ```tsx
  CsvPlugin.configure({
    initialState: {
      errorTolerance: 0.1,
      parseOptions: { header: true },
    },
  });

  editor.api.csv.deserialize({ data });
  ```

  Replace direct `deserializeCsv(editor, { data })` calls with `editor.api.csv.deserialize({ data })` or `editor.plugin(CsvPlugin).api.deserialize({ data })`.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Keep refresh scheduling and resize observation inside `useCursorOverlayPositions`; remove the standalone `useRequestReRender` and `useRefreshOnResize` hooks. Keep cursor rendering in copied registry UI and remove the package `CursorOverlay` and `CursorOverlayContent` components.

  Accept the minimal Plite DOM and read capabilities used by cursor geometry helpers, including layered Plate editors, instead of requiring or rebuilding a complete `DOMEditor`. Own generic cursor overlay state, positioning, resize refresh, and minimum-width normalization in `platejs/react`.

  **Migration:** Replace `Editor` annotations used with cursor geometry helpers with `DOMEditor` from `plitejs/dom`. Build custom overlays from `useCursorOverlayPositions` in `platejs/react`.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  - Move date insertion to `editor.update.date.insert(input?, nodeOptions?)`
  - Register date element properties in compiled schemas
  - Persist one required `value` string for canonical dates or authored date text
  - Remove the standalone `insertDate` and unused `isPointNextToNode` helpers

  **Migration:** Replace `insertDate(editor, options)` with `editor.update.date.insert(input?, nodeOptions?)` or `editor.plugin(BaseDatePlugin).update.insert(input?, nodeOptions?)`. Use Plite point and node reads directly for custom adjacency checks.

  Replace Date node `date` / `rawDate` properties with `value` and pass `{ value }` to the insert update.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Keep DnD store selectors, plugin lifecycle hooks, and low-level drag/drop hooks private. The public React surface is `useDraggable` and `useDropLine`.

  Fix cross-editor multi-block drops so every selected block is inserted before the source blocks are removed. Drag items carry the source editor identity plus editor-scoped `NodeKey` values; persisted element IDs are not used for drag state.

  Keep the edge scroller reactive to plugin store state. Preserve plugin API inference in typed component integrations and expose DOM-compatible drag references.

  Configure automatic scrolling with `DndScrollerOptions`; the scroller components and low-level `useDndNode` adapter are package-private.

  Use `key` on element drag items and drop callbacks, `draggingKey` in plugin state, `{ key, line }` for drop targets, and `useDropLine({ key })` for an explicit live node target.

  Remove the standalone `selectBlockById` helper. Table row integrations now keep their selection-and-focus flow in the owning pre-drop handler.

  Remove the exported `getNewDirection` helper.

  Replace `DndConfig` with the complete `DndPluginState` contract.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Use independent DOCX entrypoints for paste, file import, and export.

  Compose the operations needed by the application:

  - `DocxPlugin` from `platejs/docx` owns pasted CSS inlining and Word clipboard normalization.
  - `importDocx(editor, buffer, options)` from `platejs/docx/import` returns decoded nodes, comments, and warnings without inserting them or requiring a plugin.
  - `exportToDocx(value, options)` from `platejs/docx/export` returns a DOCX `Blob`, including caller-provided metadata, styles, bookmarks, and preserved indentation. The application owns downloading or saving it.

  The import entrypoint requires Mammoth; the export entrypoint owns the HTML-to-DOCX conversion dependencies. The paste entrypoint loads neither conversion graph. Juice and Word normalization helpers are private implementation details. Copied import and export toolbars load their DOCX converters on demand.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Keep emoji picker state, category focus, preview, and frequent storage in the copied `emoji-toolbar-button` registry item. Use `createEmojiSearch(data)` from `platejs/emoji` for dataset-scoped search with ordered, independent results. Custom dataset names, IDs, and keywords are matched without case sensitivity.

  Export `EmojiPluginState` as the complete mutable state contract for `BaseEmojiPlugin`.

  Move emoji insertion to `editor.plugin(EmojiPlugin).update.insert`, isolate search state per emoji dataset, clean up picker observers when the menu closes, and register emoji-input properties in compiled schemas. Remove the standalone `insertEmoji` helper.

  Install the emoji input descriptor as a required plugin dependency. Its capability name and persisted element type are both `emojiInput`.

  Always render the frequent section when `showFrequent.value` is enabled, including before category data is populated.

  Keep the package React surface limited to `EmojiPlugin` and `EmojiInputPlugin`. Copy `emoji-toolbar-button` for the complete picker and `emoji` for inline search. Replace `EmojiInputConfig` with `DefinitionOf<typeof BaseEmojiPlugin>`. Search uses the supplied dataset without shared singleton state; grid construction and frequent-item ranking stay in the copied picker.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Use `useExcalidrawSync({ api, excalidraw })` for persisted scene updates, document undo/redo, and stale-write protection. The copied renderer owns dynamic loading, controls, view mode, and dimensions. Canvas viewport and selection changes do not write the document.

  Move the Excalidraw plugin and insertion helper to the Base editor transaction API, load the Excalidraw component once per mount, and register Excalidraw element properties with versioned inline validation in compiled schemas. Store the dynamically imported component without invoking it as a React state updater. Normalize Excalidraw change payloads into JSON-compatible persisted data.

  **Migration:** Replace direct `insertExcalidraw(editor, props, options)` calls with `editor.update.excalidraw.insert(props, options)`. Pass `at` to target the block after which Excalidraw is inserted.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Export `FindReplacePluginState` as the complete mutable state contract for `FindReplacePlugin`.

  Move find-and-replace decoration into `FindReplacePlugin`, remove its React runtime requirement, highlight matches across inline descendants, and register search highlights in compiled schemas. The capability name and persisted decoration property key are both `searchHighlight`.

  **Migration:** Remove `decorateFindReplace` imports. Configure and install `FindReplacePlugin`; it owns decoration directly.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Keep `useVirtualFloating` and reusable geometry in the package. Copy `floating-toolbar` for editor focus, selection, read-only policy, outside clicks, and toolbar positioning.

  Move editor geometry helpers to the minimal Base read and DOM capabilities they consume, so layered editors remain inferred without whole-editor reconstruction. Restrict `useVirtualFloating` to virtual references, prevent toolbar effect loops, and colocate the public geometry family.

  **Migration:** Remove type arguments from `useVirtualFloating`; it always returns a virtual-reference floating result.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Export `FootnotePluginState` as the complete mutable state contract for `BaseFootnotePlugin`.

  Use `BaseFootnotePlugin` / `FootnotePlugin` for footnote references and document-level footnote behavior. Read footnotes through `editor.read.footnote` and mutate them through `editor.update.footnote`, including `editor.update.footnote.insert()`. Footnote insertion accepts feature input first and generic reference placement options second: `insert(input?, nodeOptions?)`. Pass `trigger` in the feature input to remove a matching preceding trigger in the same insertion transaction.

  The plugin requires the matching footnote-input descriptor. Footnote queries, navigation, insertion, definition creation, and duplicate normalization are owned by the plugin instead of exported editor/transaction helper functions. The plugin capability is `footnote`; reference elements persist under the semantic schema type `footnoteReference`.

  Persist one required `ref` on both footnote definitions and references. Rename query and update inputs from `identifier` to `ref`, `identifiers()` to `refs()`, and `nextId()` to `nextRef()`. Markdown codecs continue mapping that field to MDAST `identifier`.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Remove `useIndentButton` and `useOutdentButton`. Toolbar components call the plugin's `increase` and `decrease` updates directly.

  Export `IndentPluginState` as the complete mutable state contract for `BaseIndentPlugin`.

  Move indent commands to `editor.update.indent` and register validated non-negative-integer indentation properties in compiled schemas under each plugin name.

  **Migration:** Replace `setIndent`, `indent`, and `outdent` with `editor.update.indent.change`, `editor.update.indent.increase`, and `editor.update.indent.decrease`. Configure indent targets through the plugin's top-level `targetPlugins` field.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Use `editor.api.navigation.flashTarget({ key, attributes?, duration? })` for temporary element feedback in the calling mounted view, including read-only views. Resolve `key` through `editor.key(path)` and supply classes or styles in `attributes`. Use `editor.api.navigation.clear()` to cancel that view's feedback.

  Replace navigation target selectors, path targets, highlight variants, and the generic `navigate` transform with feature-owned navigation and rendered `data-nav-target`, `data-nav-cycle`, and `data-nav-pulse` attributes. Footnote navigation uses `editor.api.footnote.focusDefinition()` and `focusReference()` from a mounted editor; selection-only transactions use `editor.update.footnote.selectDefinition()` and `selectReference()`.

  Bind plugin API factories to the exact editor or mounted view that exposes them while sharing plugin configuration and stores. Capture the editor inside the `api` factory when a command needs view-specific focus, scrolling, or feedback.

  Allow footnote navigation when `navigationFeedback` is disabled.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Remove the one-consumer `useDebouncePopoverOpen` React hook.

  Own group mutations through `BaseColumnPlugin` and item mutations through `BaseColumnItemPlugin`:

  - `editor.plugin(BaseColumnPlugin).update.insert(input?, nodeOptions?)`
  - `editor.plugin(BaseColumnPlugin).update.setColumns`
  - `editor.plugin(BaseColumnPlugin).update.toggle`
  - `editor.plugin(BaseColumnItemPlugin).update.moveMiddle`
  - `editor.plugin(BaseColumnItemPlugin).update.selectAll`

  The group transaction is available as `editor.update.columnGroup`; item operations are available as `editor.update.column`.

  Remove the standalone column query, transform, resize, and width-helper exports. `BaseColumnPlugin` owns the `columnGroup` schema and installs `BaseColumnItemPlugin`. Group elements persist under `columnGroup`.

  Remove the unused `columnGroup.layout` property. Each child Column remains the sole owner of its persisted `width`.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Keep the package React surface to the `LinkPlugin` descriptor. Copy `link-toolbar` for floating state, inputs, positioning, hotkeys, and toolbar commands. Other copied UI uses that item's app-local `linkPlugin` descriptor.

  Export `BaseLinkPluginState` as the complete mutable state contract for the headless link descriptor.

  Move link behavior to `BaseLinkPlugin`, `LinkPlugin`, and the installed editor API, register link properties in compiled schemas, and use capability name `link` with persisted element type `link`.

  **Migration:** Replace standalone link transforms with `editor.update.link`:

  ```tsx
  editor.update.link.insert(node, options);
  editor.update.link.unwrap(options);
  editor.update.link.upsert(options);
  editor.update.link.upsertText(options);
  editor.update.link.wrap(options);
  ```

  Read URL validation and anchor attributes from `editor.api.link`. Remove `withLink`, `insertLink`, `unwrapLink`, `upsertLink`, `upsertLinkText`, `wrapLink`, `submitFloatingLink`, and `triggerFloatingLink*` imports.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Registry components call list reads and updates directly.

  Export `BaseListPluginState` as the complete mutable state contract for `BaseListPlugin`.

  Expose state-bound list queries through `editor.read.list`, pure list services through `editor.api.list`, and mutations through `editor.update.list`, including sibling traversal, active-state checks, descendant expansion, and location-aware toggle, indent, and outdent updates. Register list and indentation properties in compiled schemas. Clear list start and restart metadata when outdenting a root item.

  **Migration:** Replace raw editor-bound list helpers with the scoped API:

  ```tsx
  editor.read.list.expandItemsWithChildren(entries);
  editor.read.list.isActive("disc");
  editor.read.list.getPrevious(entry);
  editor.read.list.getNext(entry);
  editor.update.list.toggle({ listStyleType: "disc" });
  editor.update.list.indent();
  editor.update.list.outdent();
  ```

  Generic package code can use the same groups through `editor.plugin(ListPlugin).read` and `editor.plugin(ListPlugin).update`. Configure list targets through `targetPlugins`.

  Use `listStart` for conditional numbered-list starts, `listRestart` for forced boundaries, validate both as signed safe integers, and derive display ordinals without persisting them.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Keep stable element renderers independent from sibling path shifts. Element components resolve event-time paths from their element and opt into `usePath()` only when output depends on live position. Plite node refs restore the live runtime path after any external React render so moved text DOM cannot retain stale coordinates. Node wrappers receive `renderPath` as a render-snapshot path for cheap depth and ancestor decisions without a live subscription. Descriptor wrappers can reject ineligible nodes before Plate composes plugin context or mounts their component.

  Derive element payload with `useElementSelector(FooPlugin, node => node.field)` and reactive position with `usePath(path => path.at(-1))`. Element selectors skip path-only updates, while path projections retain custom equality and readonly path inputs. Table cell coordinates subscribe to their table payload, preserving spanning-cell geometry without a global commit query per cell.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Resolve `withBlockId` through `ElementIdPlugin`. Serialization rejects the option when persisted element identity is not installed, and deserialization restores persisted IDs from block wrappers.

  Export `MarkdownPluginState` as the complete mutable state contract for `MarkdownPlugin`.

  - Expose editor-bound conversion only through `editor.api.markdown.{deserialize,deserializeInline,serialize}`
  - Remove the duplicate editor-bound `deserializeMd`, `deserializeInlineMd`, `serializeMd`, `serializeInlineMd`, and `buildRules` exports
  - Return `EditorDocumentValue` from Markdown deserialization and accept the same document shape for serialization
  - Preserve Markdown image alt text as the image `alt` property and the visible direct caption children; preserve rich MDX media content in those children
  - Seed Markdown conversion and rule behavior through `MarkdownPlugin.initialState`
  - Resolve feature codecs directly by their owning plugin name, without reverse name/type translation
  - Name custom MDX element tags with each plugin's resolved application schema type; fixed MDAST, HTML, and MDX syntax remains literal
  - Resolve every generated Plate paragraph through the installed application schema type; use the default `paragraph` identity only when no paragraph plugin is installed
  - Key one-operation decode overrides by installed plugin capability name even when the application schema uses a different persisted element type
  - Keep typed `audio`, `file`, and `video` rule keys in the canonical Markdown node-name union, and reject persisted-tag aliases after a codec claims a decode source
  - Rename the public `PlateType` and `StrictPlateType` format-node unions to `MarkdownNodeName` and `StrictMarkdownNodeName`; remove the exported `mdastToPlate` and `plateToMdast` lookup helpers
  - Use one `tableCell` Plate type for GFM table cells; header semantics stay on the cell's `header` property
  - Round-trip `<sub>` and `<sup>` through one `script: 'sub' | 'sup'` text property
  - Map structural ordered-list starts to forced `listRestart` boundaries and serialize active `listStart` or `listRestart` values as MDAST starts
  - Remove `MarkdownPlugin.parser`, `DeserializeMdOptions.memoize`, and `DeserializeMdOptions.parser`
  - Remove exported conversion internals: `customMdxDeserialize`, `getCustomMark`, `getDeserializerByKey`, `getMergedOptionsDeserialize`, `getMergedOptionsSerialize`, `getSerializerByKey`, `getStyleValue`, `markdownToSlateNodesSafely`, and `unreachable`
  - Remove React peer and runtime dependencies from the base Markdown package

  **Migration:** Install `MarkdownPlugin`, configure Markdown behavior through `initialState`, and use the root Markdown API when reading, replacing, or serializing a document:

  ```tsx
  MarkdownPlugin.configure({
    initialState: {
      remarkPlugins: [remarkGfm],
    },
  });

  const document = editor.api.markdown.deserialize(markdown);

  editor.update.value.replace(document);
  editor.api.markdown.serialize({ value: document });
  ```

  Use `MarkdownNodeName` for custom rule filters. Persisted custom MDX tags must match the configured application schema type before conversion.

  Serialize semantic list fields and one parameterized heading model.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Copy `equation-node` for KaTeX rendering, popover input, and keyboard behavior. The package React surface contains only the equation descriptors.

  Register block and inline equation properties in compiled schemas. The inline equation capability name and persisted element type are both `inlineEquation`.

  Import KaTeX styling explicitly from `platejs/math/katex.css`; headless math imports have no stylesheet side effect.

  Colocate both Base plugins, math rules, static KaTeX rendering, and React descriptors by equation family.

  ```tsx
  editor.plugin(BaseEquationPlugin).update.insert({}, { select: true });
  editor
    .plugin(BaseInlineEquationPlugin)
    .update.insert({ latex }, { select: true });
  ```

  **Migration:** Replace `insertEquation(tx, type, options)` and `insertInlineEquation(tx, type, options)` with the matching scoped plugin update. Domain input is the first argument and generic node placement is the second.

  Persist equation source under required/defaulted `latex` on both block and inline nodes.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Copy the media node renderers, `media-toolbar`, and `media-preview-dialog` for rendering, URL editing, preview state, navigation, scale, translation, and download behavior. Each copied renderer reads its typed element and primitive editor state directly. Remove public media UI stores, providers, monolithic components, and UI-only hooks.

  Export complete `*PluginState` contracts for audio, file, video, image, media embed, and placeholder descriptors.

  - Insert images with `editor.plugin(BaseImagePlugin).update.insert({ url }, options)`
  - Insert embeds with `editor.plugin(BaseMediaEmbedPlugin).update.insert({ url }, options)`
  - Insert headless placeholders with `editor.plugin(BasePlaceholderPlugin).update.insert({ mediaType }, options)`
  - Insert upload placeholders with `editor.plugin(BasePlaceholderPlugin).update.insertMedia(files, options)`
  - Configure `upload(file, { signal, onProgress })` on `BasePlaceholderPlugin`; it owns validation, request lifetime, and guarded replacement of the same live placeholder
  - Start or cancel an existing placeholder's upload with `api.upload(key, file)` or `api.cancelUpload(key)`; subscribe to its progress through `store.get('uploadTask', key)`
  - Insert prompted image and embed URLs through the installed media descriptor's `api.insertUrl(getUrl, options)`; copied UI supplies the prompt
  - Remove the standalone `insertImage`, `insertMedia`, `insertMediaEmbed`, `insertPlaceholder`, and `getUploadingFile` helpers
  - Remove `fileSizeToBytes`, `getMediaType`, `groupFilesByType`, `matchFileType`, `validateFileItem`, and `validateFiles`
  - Pass image uploads to `uploadImage` as data URL strings
  - Upload programmatic image files at the application boundary, then call `editor.plugin(BaseImagePlugin).update.insert({ url }, options)`; remove `editor.insert.imageFromFiles` and `insertImageFromFiles`
  - Remove the `withImage*`, `insertImagePlaceholder`, `setMediaNode`, `mediaStore`, `useMediaController*`, `placeholderStore`, and `usePlaceholder*` store and component-state exports
  - Honor disabled file drops and upload configurations without a file-size limit
  - Keep package upload defaults limit-free; copied `MediaKit` owns concrete file counts and size quotas
  - Target image, embed, and placeholder insertion through exact `at` locations or a live source node through `after`; `replaceEmpty` replaces only an empty writable text block
  - Preserve plugin API inference in typed component integrations and accept arrays when inserting placeholder media
  - Publish pending upload state only after its placeholder transaction commits
  - Expose the `MediaPlugin` union for typed floating-media URL controls
  - Rename `MediaPluginOptions` to `MediaPluginState`
  - Use `PlaceholderPluginState` for the shared upload owner; the React `PlaceholderPlugin` adds DOM input adaptation
  - Register media properties and required direct inline caption children in compiled schemas.
  - Convert legacy v53 media identities, captions, missing URLs, and retired placeholder IDs through the shared `migratePlateV54` application document step.
  - Accept caption strings or inline children as construction input and persist them as direct media children.
  - Split media captions into a following paragraph on Enter without duplicating the media node.
  - Use capability name `mediaEmbed` and persisted element type `mediaEmbed`, persist media alignment as `textAlign`, and preserve relative media widths.
  - Set media widths through the descriptor's standard update: `editor.plugin(ImagePlugin).update.set({ width }, { at: element })`.
  - Preserve standalone media embeds through clipboard sanitization by carrying sanitized URL and normalized width metadata on the owning figure.
  - Persist source image geometry as `naturalWidth` and `naturalHeight`, separate from the user-selected rendered `width`.
  - Persist optional `name` only on File nodes; other media nodes share only URL, rendered width, and direct caption children.
  - Validate intrinsic image dimensions as positive safe integers.

  **Migration:** Remove `@platejs/caption` imports and caption plugin registration. Store captions in each media element's direct children and render that child slot as the caption. Add the shared v54 document step while loading persisted caption properties:

  ```tsx
  import {
    defineDocumentMigrations,
    migratePlateV54,
  } from "platejs/migrations";

  const migrations = defineDocumentMigrations(EditorSchema, {
    steps: { 54: migratePlateV54 },
    unversioned: 53,
  });
  ```

  The same application step handles legacy media identities and captions in one pass.

  Use intrinsic image dimensions and semantic file video providers without upload workflow fields.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Export `MentionPluginState` as the complete mutable state contract for `BaseMentionPlugin`.

  Move mention insertion to `editor.plugin(MentionPlugin).update.insert` and register mention values in compiled schemas. Preserve plugin capability and render-time node-context inference in typed component integrations.

  Install the mention-input descriptor as a required plugin dependency. Its capability name and persisted element type are both `mentionInput`.

  Remove `getMentionOnSelectItem`; selection handlers call the installed plugin update directly. The update accepts only persisted mention data (`ref` and optional `label`) in its first argument and generic node options in its second; combobox search text stays UI-local.

  Use `TMentionItemBase<TRef = string>` to type application mention references.

  **Migration:** Replace Mention node `key` / `value` with required `ref` and optional `label`. Render visible text from `label ?? ref`.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) –

  - Compile plugin tuples with `compileEditor({ plugins, schema })` from `platejs/compiler` to obtain detached, frozen schema and binding facts without activating extensions.
  - Keep generated application type projections under `platejs/compiler`. Access installed features through descriptor portals and mounted editors through the public React hooks.
  - Keep compiler caches, erased definition helpers, React effect hosts and backing stores private.
  - Expose each mounted Editable ref to `slots.wrapRoot` components so feature kits can install their React integration. Bind custom DnD cleanup with `useDndPlugin(editableElement)` from `platejs/dnd/react`.
  - Allow AI retry after a request stops before its first preview chunk, while refusing regeneration when an existing preview cannot be safely restored.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Unify plugin rendering under `component`, `render.attributes`, `render.mark`, and `slots`.

  Remove editor component registries, nested plugin overrides, public render-pipeline helpers, and the competing `render.as`, `render.node`, `render.nodeProps`, mark-render, and structural-render fields. Configure intrinsic tags through `component`, weak peer changes through flat `override[target]`, and structural composition through `slots`.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Use plugin-authored transient decorations and exact mounted-editor geometry for selections, remote cursors, Find, and floating controls.

  `platejs/react` compiles each plugin's `decorate: { read, observe? }` descriptor into Plite decorations. Plugin-store updates invalidate only that plugin's affected nodes. Editable and container sibling components receive only their exact mounted ref.

  `platejs/yjs/react` exposes `useYjsRemoteCursorIds`, `useYjsRemoteCursor`, and `useYjsRemoteCursorGeometry`. Import `YjsPlugin` from the copied `remote-cursor-overlay` file for selection highlights, carets, and labels. The package plugin supplies unstyled selection decorations.

  Use `BaseFindPlugin` from `platejs/find` for query, navigation, and replacement, and install the copied `FindKit` for Find controls and rendering. Use `data-plite-keep-selection-visible` on controls that retain the native inactive selection and `@floating-ui/react` directly for app-owned floating UI. Remote cursor rendering belongs to the copied overlay.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Keep editor behavior with its feature owner and compose application controls from copied registry UI.

  Use public Plate hooks for editor and element subscriptions. Import low-level DOM and rendering contracts directly from `plitejs/dom` or `plitejs/react`; Plate exposes its editor-aware bindings and node primitives. Plugin construction internals, DOM bridges, serializer helpers, and unused UI state wrappers are private.

  Render literal text safely through `renderStaticHtml`: text that resembles HTML remains escaped. Static and live renderers share the underlying Plite node contracts.

  Use `PlateBlockInsertOptions` for feature insertion relative to a live source node. Block actions use the installed heading, list, blockquote, details, columns, table, and media operations, preserving one transaction and undo step. Empty text-block replacement preserves structural and atomic nodes.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Consolidate the Plate foundation and shared utility contracts into `platejs` with one editor API and an exact `plitejs` runtime dependency during beta.

  **Migration:** Replace `@platejs/core`, `@platejs/utils`, `@udecode/utils`, `@udecode/react-utils`, and `@udecode/react-hotkeys` imports with `platejs` or `platejs/react`. Import `useComposedRef` and `useIsomorphicLayoutEffect` from `platejs/react`; keep class-name merging in your app. Replace `createPlateEditor` with `createEditor`, `usePlateEditor` with `useCreateEditor`, and mounted editor reads with `useEditor` or `useOptionalEditor`.

  Bind contextual commands to the selected editable mount, including named roots and views of one document. Use `EditorProvider` to scope controls to an existing editor, and retain that editor while a toolbar interaction is open.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  - Expose the Plite-backed Plate editor and plugin model, including `editor.read`, `editor.update`, sole plugin identity `name`, compiled `schema.element` and `schema.mark`, plugin `initialState`, an editor-local plugin `store`, and inferred plugin-owned `editor.api[name]` and `editor.update` groups; exact generic code uses `editor.plugin(Plugin)` as the sole imperative plugin lookup, while dynamic names resolve through `editor.plugin(name)`; declare Plite capabilities and every prefixless lifecycle/DOM event directly under root `on`, without a nested `extension` or separate `handlers` field
  - Separate plugin capability `name` from persisted element `type` and property `key`. Default omitted schema identities to `name`, expose only the identity owned by each schema plugin, and keep `PLUGINS` capability-only.
  - Name live node identity `key`, persisted element occurrence identity `id`, and persisted associations `ref`.
  - Infer one exact plugin definition from each positional descriptor factory, `defineBasePlugin(name, definition)` or `definePlatePlugin(name, definition)`, use `DefinitionOf<typeof Plugin>` for descriptor contracts, and keep undeclared fields absent from the inferred plugin type
  - Keep object `initialState` beside store-dependent fields; stage factory `initialState` before those fields in a following `.extend()`
  - Export pure schema and plugin builders from `platejs`, React components and hooks from `platejs/react`, and `renderStaticHtml` from `platejs/static`
  - Initialize editors synchronously through `initialValue` or `({ editor }) => Value`, observe edits through `onCommit`, use strict `useEditor`, and use nullable `useOptionalEditor`
  - Accept a primary-root value or complete `EditorDocumentValue`, emit the complete document through Plate `onValueChange`, and render typed interactive or static content-root slots
  - Defer initialization with `skipInitialization: true`, then publish the loaded document with one `editor.update.value.replace(...)` call; application migrations run before installed-plugin preparation and schema fitting
  - Delete `@platejs/autoformat`; declare input rules on the feature plugins that own the resulting behavior
  - Delete `@platejs/caption`; non-void media elements own direct inline caption children, while Plate UI media components render caption and asset-focus states
  - Compose required plugin capabilities through `dependencies`; include optional capabilities and presets directly in consumer plugin arrays
  - Remove recursive child mutation, root-plugin callbacks, topology-capable foreign-plugin patches, and the parallel global plugin enablement map; keep configuration-only weak peers for package plugins that cannot control the editor kit
  - Declare bidirectional product formats and HTML node, mark, and property mappings through a context-bound constructor `codecs: ({ defineCodecs }) => defineCodecs(...)` declaration; keep whole-input HTML `query`, `transformData`, and `transformFragment` hooks on the `'text/html'` codec

  **Migration:** Replace `value` with synchronous `initialValue`, move async loading before editor construction, replace `useEditorRef` with `useEditor`, replace `serializeHtml` with `renderStaticHtml`, and replace autoformat rules with feature-owned `inputRules`. Replace plugin `key` with `name`, flatten native Plite fields from `extension`, and move every lifecycle or DOM callback to prefixless `on` names such as `commit`, `keyDown`, and `paste`. Remove the `PluginConfig` family (`AnyPluginConfig`, `SlatePluginConfig`, and `PlatePluginConfig`) and `InferConfig` usage. Remove `@platejs/caption` imports and caption plugin registration, then store and render captions as the media element's direct children. Configure imported plugin descriptors in the ordinary array. Use `override.plugins[name]` only for package-owned adaptation of an already-installed foreign peer. Declare HTML node, mark, and property mappings through `codecs: ({ defineCodecs }) => defineCodecs({ 'text/html': ... })`, and put whole-input HTML hooks on the `'text/html'` codec.

  Replace `KEYS`, `NODES`, and `STYLE_KEYS` plugin references with `PLUGINS`. Resolve persisted identity through `.type` / `.key` or explicit document literals, and remove every public reverse name/type lookup.

  Persist schema identity beside each durable document. Configure the v54 release step through the application schema migration chain:

  ```tsx
  import {
    defineDocumentMigrations,
    migratePlateV54,
  } from "platejs/migrations";
  import { fingerprint as v53Fingerprint } from "./migrations/v54-upgrade-plate/from";

  const migrations = defineDocumentMigrations(EditorSchema, {
    sourceFingerprints: { 53: v53Fingerprint },
    steps: { 54: migratePlateV54 },
    unversioned: 53,
  });
  ```

  Replace plugin `transformInitialValue` with `prepareDocument` only for permanent installed-plugin invariants.

  For deferred loading:

  ```tsx
  const editor = createPlateEditor({
    migrations,
    plugins,
    schema: EditorSchema,
    skipInitialization: true,
  });
  const persisted = await loadDocument();

  editor.update.value.replace(persisted);
  ```

  Migrate frozen Plate v53 documents through the complete v54 AST contract.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Export `BaseYjsPlugin` and `YjsPluginState` from `platejs/yjs`, and export `YjsPlugin` from `platejs/yjs/react`.

  Translate canonical Plite document changes and shared effects through Yjs with app-owned `YjsProviderLike` adapters. Import remote Yjs events as incremental canonical changes and merge set-valued text properties by value.

  Transport registered shared effects exactly once through versioned records, retry unknown effect codecs after registration, compact acknowledged events safely, and preserve fitted slice changes through reconnect and concurrent edits.

  **Migration:** Import `BaseYjsPlugin` from `platejs/yjs` or `YjsPlugin` from `platejs/yjs/react`, then configure it with the Yjs document and provider adapter from application code. Raw Plite editors import `yjs` from `plitejs/yjs` and install `yjs(options)` through `editor.install(...)`. Import raw React cursor and provider-state hooks from `plitejs/yjs/react`; Plate consumers use `platejs/yjs/react`. Serialized adapter metadata uses `plite:*` keys.

  Encode exact derived or named schema identities in Yjs schema metadata format 2, require every claimed room to carry that identity, and reject older room metadata envelopes.

  Synchronize primary children and named roots as one document, preserve root-qualified awareness selections, and group multi-root commits into one Yjs transaction. Preserve shared character identity across compatible text replacements so remote positions survive canonical history replay.

  Declare collaborative cursor metadata with `yjs({ cursorData: { validate } })`. Infer cursor state and React hook results from that installed descriptor, omit invalid remote metadata, and reject invalid local metadata before publishing it. React cursor overlay hooks preserve exact raw-editor extension-tuple inference and infer layered editors from their state-view provider without rebuilding a raw React editor.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Initialize prepared Plate values during schema publication to avoid an extra live whole-document replacement on mount.

  Remove `withHOC`, `useEditableProps`, `usePlateRootProps`, and the public node-attribute hook. Compose concrete React 19 components directly and receive `ref` as a normal prop.

  Export named `*PluginState` contracts for state-owning Core descriptors, including debug, DOM, navigation feedback, and persisted element IDs. Replace the default `NodeIdPlugin` with opt-in `ElementIdPlugin`. It assigns string IDs to block and inline elements through one `generateId` state option, indexes them across every document root, and never assigns IDs to text nodes. Narrow persisted-ID applicability through the compiled application schema target; document preparation generates and retains IDs only for matching elements. Use `migrateElementIds` before editor creation to fill missing IDs, report duplicates, and canonicalize a legacy property through `sourceKey`. Use editor-scoped `NodeKey` for live node targeting, selection, drag and drop, and temporary UI state; node keys cover text nodes and never enter serialized data. Convert a known runtime key at a persistence boundary through `editor.plugin(ElementIdPlugin).read.id(key)`.

  Infer plugin-local node-property patches from the current plugin plus its required dependencies through a shallow capability graph. Use `nodes.set(props, options)` for typed atomic writes, the exact property handle key for aliases, `unset(key, options)` for removals, and semantic owner updates for prefix or cross-node behavior.

  Rename Plate plugin identity from `key` to `name` across descriptor definitions, inferred contracts, installed descriptors, lookup parameters, transaction groups, targets, and overrides. Declare `definePlatePlugin('foo', definition)`, read `plugin.name`, and pass the plugin descriptor or a dynamic name string to descriptor-aware lookups. Use `name` solely for capability identity. Element plugins expose persisted identity through `schema.type`; primary-mark plugins expose persisted identity through `schema.key`. Behavior and aggregate-property plugins expose no consumer `schema`. Additional property handles stay in author callbacks and compiler APIs. Remove public reverse identity lookup and name/type translation. Publish every installed non-empty plugin API under its inferred plugin name on `editor.api`, while retaining `editor.plugin(FooPlugin).api` as the exact generic portal. Both paths reference the same immutable API object. Reject plugin-name collisions with explicit editor API namespaces. Infer Plate node queries and transforms from plugin descriptors passed through the independent `type` option. Resolve descriptors through final application schema overrides, keep `match` function-only for additional conditions, and remove caller-selected node result generics. Replace `nodes.find<LinkElement>({ match: { type: linkType } })` with `nodes.find({ type: LinkPlugin, match: (link, path) => ... })`. Expose `editor.plugin(Plugin).installed` for optional package integrations. Call the scoped update portal with a transaction policy when an operation needs tagged history or another root update policy: `editor.plugin(Plugin).update(policy).method()`. The scoped call opens one root transaction and preserves its rollback and history behavior. Compose plugin commands inside an active transaction through `tx.plugin(Plugin).method()`. Generated editors retain direct `tx.pluginName.method()` groups. Raw Plite keeps direct extension groups and does not expose a descriptor transaction portal.

  Give default-constructible, schema-compatible text-block descriptors a standard `toggle` update. Text blocks with required construction properties author their own domain-aware command when needed. Configure same-name keyboard shortcuts with keys only; Plate dispatches the plugin update automatically. Structural plugins keep authored toggle commands for wrapping, conversion, or child mutations. Rename the paragraph shortcut from `toggleParagraph` to `toggle`.

  Contextually infer callbacks for contract-declared explicit transaction groups and plugin extension command transactions. Infer every root and scoped update callback from the editor's installed plugin graph; callers cannot augment the transaction contract with a type argument. Keep each input-rule factory's exact editor and rule-family contracts, infer only explicitly declared consumer options, and publish portable declarations while normalizing heterogeneous descriptor storage through an unknown-context rule reference. Infer callback-created plugin state from its return type without erasing constructor `read`, `update`, or other inferred capabilities.

  Require plugin `read` factories to return callable method trees and build each tree once per published plugin configuration.

  Compile API, read, and update capability trees with plain-record composition instead of descriptor merging.

  Keep selection closed to core text and directional exact node values across validation, transactions, persistence, and direct updates. Ordinary editor reads expose a plain active `Range`, every exact range through `selection.ranges()`, and exact selected-node membership through `selection.nodes()`. Plate plugins cannot define selection kinds or own parallel selected-node state. Project installed DOM, React, and plugin capabilities once through the Plate plugin graph. Do not intersect complete DOM or React editor read/update surfaces back onto the resulting Plate editor.

  Infer one exact definition for each Base and React plugin. Remove the `PluginConfig` family, including `AnyPluginConfig`, `SlatePluginConfig`, and `PlatePluginConfig`. Use `DefinitionOf<typeof Plugin>` as the sole public descriptor-definition extractor; remove the `InferConfig` alias. Name exported descriptor contracts `FooDefinition`; reserve `FooConfig` for real domain configuration. Keep fields omitted from an author definition absent from its inferred descriptor type. Keep Core's contextually typed author-source to canonical-lowered aliases internal. Public authoring is one object call that returns one exact descriptor without a caller-supplied generic list. Declare `api` through a factory at every Plite, Base, and React layer, including context-free APIs. Pass one context object rather than positional `editor` and `context` arguments; Base and React add their plugin fields to that same object. Declare Plite capabilities directly on the plugin root, and use one prefixless `on` family for lifecycle and every DOM event. Remove the separate `handlers` surface and names such as `onKeyDown`; use `keyDown`, `paste`, `nodeChange`, and the matching prefixless event names:

  ```tsx
  const AnalyticsPlugin = definePlatePlugin("analytics", {
    on: {
      commit: ({ commit }) => reportCommit(commit),
      keyDown: ({ event }) => reportKey(event.key),
    },
    validate: ({ schema }) => validateAnalyticsSchema(schema),
  });
  ```

  Replace Slate-era Core exports with Plite and Plate-owned names. Delete the dead `isType` wrapper; compare configured element types at the owning call site.

  Replace `pipeInsertDataQuery` with `prepareHtmlParserQuery`, which compiles one resolved plugin query and runs it against an immutable editor state.

  Replace plugin `transformInitialValue` with `prepareDocument` for installed current-schema invariants. Configure application schema upgrades through `defineDocumentMigrations(EditorSchema, { steps })`; Plate runs every required target-version step before plugin preparation and schema fitting for initial and deferred complete-document loads.

  Persist `{ document, schema }` and pass the envelope to `initialValue` or `editor.update.value.replace(...)`. Use `migrateDocument` to run the same chain outside editor publication. Bind each supported historical envelope version to its generated schema fingerprint; use an explicit unversioned floor only for raw documents without identity metadata.

  Remove exported whitespace character aliases in favor of native character literals. Preserve the first matching descendant returned by `someHtmlElement`.

  Keep element-provider updates local to their own node while descriptor-scoped ancestor reads subscribe to the exact owning provider.

  Remove `editor.meta.pluginList`, `editor.meta.isFallback`, `editor.getOptionsStore`, and public plugin `optionsStore` fields. Read installed plugins and editor-local state through `editor.plugin(Plugin)`. Keep callback-only `editor` and `defineCodecs` off the consumer portal.

  Remove parallel plugin lookup APIs: `getBasePlugin`, `getEditorPlugin`, React `getPlugin`, `editor.getPlugin`, `getPluginType(s)`, `getPluginName(s)`, `getPluginByType`, `getContainerTypes`, `editor.getType`, and `editor.getInjectProps`. Use `editor.plugin(Plugin)` for an exact typed portal and `editor.plugin(plugin)` for an erased dynamic or family-agnostic runtime-name portal. Reject weak `{ name }` lookup objects. A missing runtime name reports `installed: false`; name-only portals keep non-optional `schema.type` and `schema.key` getters for package-decoupled code, while missing or wrong-kind access throws. Exact portals publish only their primary element or mark identity. React `useEditorPlugin` accepts the same descriptor-or-name inputs. Read compiled injection data from `editor.plugin(Plugin).inject.nodeProps`. The consumer portal exposes every resolved descriptor field directly beside scoped `api`, `read`, `update`, `store`, and `installed`; it has no nested `plugin` alias. Authoring callback contexts retain `plugin` for the current raw descriptor.

  Pass each render wrapper its owning plugin portal context and forward Plite DOM strategy props through Plate content.

  Preserve decoration rendering without coupling plugin identities to serialized mark names.

  Skip autofocus, input rule, and override work when lifecycle targets are unavailable.

  Preserve selections when application migrations or `prepareDocument` wrap selected text during editor setup and complete `editor.update.value.replace(...)` loads.

  Install typed plugin-object dependencies recursively with deterministic overrides, dependency-first ordering, and graph validation. Remove global plugin `priority`. Independent plugins keep application order; use `dependencies` for installation requirements and resource-local `priority` for competing shortcuts, input rules, or codecs.

  Declare document identity and element behavior through `schema.element`, marks through descriptor-backed `schema.mark`, ordinary node components through root-level `component`, advanced rendering through `render`, and trusted DOM projection through `render.nodeProps`.

  Derive schema identity from compiled plugin semantics when editor creation omits `schema`. Pass `{ id, version }` only for application-named History, Yjs, or migration lineage. Editor factories derive identity when called without a `schema` option.

  Seed one mutable editor-local plugin store through `initialState`. Put every independent author contribution in `defineBasePlugin()` or `definePlatePlugin()`: plugin-owned `api`, `read`, `update`, `selectors`, native Plite capabilities, format `codecs`, and ordinary static fields. Constructor callbacks receive the typed authoring context. Use `.extend()` only for an imported/prebuilt declaration, a shared factory the constructor cannot access, or an earlier-stage type dependency.

  When `initialState` is an object, declare store-dependent fields in the same constructor. When `initialState` is a factory, stage fields that consume its inferred store type in a following `.extend()`:

  ```tsx
  const FeaturePlugin = definePlatePlugin("feature", {
    initialState: ({ editor }) => ({ enabled: editor.read.isEmpty() }),
  }).extend({
    api: ({ store }) => ({
      isEnabled: () => store.get("enabled"),
    }),
  });
  ```

  Move specialized builder contributions into the constructor:

  | Before               | After                                                              |
  | -------------------- | ------------------------------------------------------------------ |
  | `.extendApi()`       | `api`                                                              |
  | `.extendEditorApi()` | `api`                                                              |
  | `.extendSelectors()` | `selectors`                                                        |
  | `.extendTx()`        | `update`                                                           |
  | `.extendTxGroup()`   | `update`                                                           |
  | `.extendExtension()` | the matching root Plite field                                      |
  | `.extendCodecs()`    | `codecs: ({ defineCodecs }) => defineCodecs(...)`                  |
  | `.extendHtmlCodec()` | `codecs: ({ defineCodecs }) => defineCodecs({ 'text/html': ... })` |

  When upgrading from v53, move `.extendTransforms()` and `.extendEditorTransforms()` contributions to `update`. Replace ordinary `render.node` component registration with `.configure({ component: Component })`. Include `component` in that same terminal `.configure()` when other consumer overrides are needed. New Plate descriptors declare `component` directly. Base and Plate descriptors declare root-level `component` directly for static/RSC and live rendering. Base `.extend()` rejects `component`; terminal `.configure({ component: Component })` replaces it. Use `toPlatePlugin()` at the owning React adapter to publish a reusable Plate-layer descriptor or add genuine Plate-only authoring. A terminal consumer does not convert merely to set `component`. Independently reusable raw Plite descriptors use `defineExtension(...)`; Plate-owned capabilities stay on the plugin root. Apply at most one terminal consumer `.configure(...)` call per descriptor: object configuration can set descriptor fields, while contextual configuration can derive initial state, `on` events, foreign-plugin overrides, renderers, and shortcuts. Earlier authoring stages read the configured values, and consumer configuration remains the final override. Read and update live values through `editor.plugin(Plugin).store.get()` and `.store.set(...)`; subscribe in React through `usePluginStore`; its selector `{ id }` option selects another registered editor. Pass the real plugin descriptor to store hooks. A name-only object cannot carry the state or selector contract and is rejected instead of requiring manual generic arguments. Named selectors are pure state-first functions. Remove `getOption`, `getOptions`, `setOption`, `setOptions`, and the option-named React hooks.

  ```tsx
  // Before
  const Plugin = definePlatePlugin("counter", {
    options: { count: 0 },
    selectors: ({ getOptions }) => ({
      doubled: () => getOptions().count * 2,
    }),
  });

  editor.plugin(Plugin).setOption("count", 1);
  const count = usePluginOption(Plugin, "count");

  // After
  const Plugin = definePlatePlugin("counter", {
    initialState: { count: 0 },
    selectors: {
      doubled: (state) => state.count * 2,
    },
  });

  editor.plugin(Plugin).store.set({ count: 1 });
  const count = usePluginStore(Plugin, "count");
  ```

  Declare cross-plugin schema and render targets with the plugin's top-level `targetPlugins` field.

  Register semantic command policy through root `commands: ({ handle, around }) => [...]` factories. Handlers return `false | TransactionSpec`; `handle` provides ordered fallback and `around` wraps or rewrites downstream behavior.

  Resolve shortcut names against the owning plugin's `.update` and `.api` groups. Set `target: 'update' | 'api'` only when both groups define the same name; custom shortcut handlers do not accept `target`.

  Initialize editors synchronously through `initialValue` or `({ editor }) => Value`. Observe published edits through `onCommit({ editor, commit, snapshot })`.

  Make `useEditor()` strict and `useOptionalEditor()` nullable. Resolve rendered elements and paths through descriptor-aware `useElement(FooPlugin)` and `usePath` hooks. Infer component elements with `PlateElementProps<typeof FooPlugin>` and static/RSC elements with `PliteElementProps<typeof BaseFooPlugin>`. Infer live and static text and leaf component props from the same plugin descriptors with `PlateTextProps`, `PlateLeafProps`, `PliteTextProps`, and `PliteLeafProps`. Pass exactly one required plugin descriptor to these component prop aliases. Leaf props include optional transient fields inferred from the owning plugin's `decorate` callback; text props remain persisted-schema-only. Pass plugin descriptors directly to wrapper and element-selector contracts: `RenderNodeWrapper<typeof FooPlugin>`, `RenderStaticNodeWrapper<typeof BaseFooPlugin>`, and `useElementSelector(FooPlugin, selector)` infer their element and plugin context without a manual `DefinitionOf` extraction. Use `RenderElementProps`, `RenderTextProps`, and `RenderLeafProps` for schema-agnostic renderer infrastructure. Remove the parallel `StyledPlate*Props` and `StyledPlite*Props` aliases; pass polymorphic HTML props directly to the matching node primitive. Pass the descriptor instead of a caller-selected element type to `useElement`. Context editor hooks reject caller-only generics and accept no plugin tuple or generated contract. Use `useEditor()` or nullable `useOptionalEditor()` for the mounted editor, resolve exact plugin capabilities through `editor.plugin(FooPlugin)` or `useEditorPlugin(FooPlugin)`, and keep optional generated `Editor` and `Value` types at explicit static boundaries.

  Render static HTML through `renderStaticHtml` from `platejs/static`.

  **Migration:** Read installed plugin APIs from the inferred editor API in app code. Use the scoped portal when generic package code only knows the plugin descriptor:

  ```tsx
  // Before
  editor.getApi(FooPlugin).foo.method();

  // After
  editor.api.foo.method();

  // Generic package code
  editor.plugin(FooPlugin).api.method();

  // Compiled descriptor
  const foo = editor.plugin(FooPlugin);
  foo.name;
  foo.schema.type; // element plugin
  foo.inject.nodeProps;
  foo.render;

  const bold = editor.plugin(BoldPlugin);
  bold.schema.key;
  bold.read.isActive();
  bold.update.toggle();

  // Dynamic runtime name
  const dynamicPlugin = editor.plugin(plugin);

  if (dynamicPlugin.installed) {
    dynamicPlugin.name;
    dynamicPlugin.schema.type; // throws when the installed plugin is not an element
  }
  ```

  Prepare parser queries once, then run them against read-only editor state:

  ```tsx
  const canInsert = prepareHtmlParserQuery(editor, MyPlugin);
  const allowed = editor.read((state) => canInsert(state, options));
  ```

  Rename these exports:

  - `Slate` to `Plite`
  - `SlateRenderElementProps` to `PliteRenderElementProps`
  - `SlateRenderLeafProps` to `PliteRenderLeafProps`
  - `SlateRenderTextProps` to `PliteRenderTextProps`

  Replace dependency names such as `dependencies: ['feature']` with the plugin object, for example `dependencies: [BaseFeaturePlugin]`.

  Replace the overloaded `node` declaration with explicit model and render fields:

  ```tsx
  definePlatePlugin("link", {
    schema: { element: { inline: true } },
  }).configure({ component: LinkElement });
  ```

  Load asynchronous values before editor construction and pass a synchronous `initialValue`:

  ```tsx
  // Before
  createPlateEditor({
    value: () => loadDocument(),
    onReady: ({ editor }) => activateEditor(editor),
  });

  // After
  const initialValue = await loadDocument();
  const editor = createPlateEditor({ initialValue });
  activateEditor(editor);
  ```

  When editor construction cannot wait for the document, skip initialization and publish the loaded value once:

  ```tsx
  const editor = createPlateEditor({ plugins, skipInitialization: true });
  const children = await loadDocument();

  editor.update.value.replace({ children });
  ```

  Use strict provider hooks and provider-owned element paths:

  ```tsx
  // Before
  const editor = useEditorRef();
  const path = useNodePath(element);

  // After
  const editor = useEditor();
  const path = usePath();
  ```

  Replace context-hook editor assertions with descriptor portals:

  ```tsx
  // Before
  const editor = useEditor<PlateEditor<readonly [typeof FooPlugin]>>();

  // After
  const editor = useEditor();
  const foo = editor.plugin(FooPlugin);
  ```

  Rename static HTML rendering:

  ```tsx
  // Before
  import { serializeHtml } from "platejs/static";

  // After
  import { renderStaticHtml } from "platejs/static";
  ```

  Replace `inject.targetPlugins` with top-level `targetPlugins`:

  ```tsx
  definePlatePlugin("align", {
    targetPlugins: [PLUGINS.paragraph],
    inject: { nodeProps: { styleKey: "textAlign" } },
  });
  ```

  Replace `inject.targetPluginToInject` with a typed foreign codec contribution, `codecs: ({ defineCodecs }) => defineCodecs(TargetPlugin, { 'text/html': ... })`, or use `override.plugins[name]` for package-owned adaptation of an installed peer.

  Classify plugin relationships explicitly:

  - Use `dependencies` for required structure and capabilities.
  - Include optional capabilities as ordinary entries in the consumer plugin array.
  - Let an optional enhancement depend on its required base capability; do not make the base capability bundle the enhancement.

  Configure or omit an optional capability through the ordinary plugin array:

  ```tsx
  const plugins = [
    CodeBlockPlugin,
    CodeHighlightPlugin.configure({
      initialState: { lowlight },
    }),
  ];
  ```

  Repeat terminal configurations derived from the same authored plugin when a later consumer layer needs to configure an installed preset. Plate composes them in array order, preserves earlier non-overlapping fields, and lets later defined values win. Unrelated plugins and divergent authoring branches cannot share a name.

  Remove `configurePlugin`, `extendPlugin`, `rootPlugin`, and `override.enabled`. Configure imported target descriptors directly. Package plugins that cannot import a foreign target or control the editor kit may use `override.plugins[name]` to adapt an already-installed peer; missing targets are ignored, topology is immutable, required dependencies cannot be disabled, and target configuration wins.

  Replace `parsers.html.deserializer`, serializer declarations, and injected HTML node-rule projections with schema-inferred `codecs['text/html']` contributions in the constructor callback. Keep whole-input HTML hooks on the same codec:

  ```tsx
  definePlatePlugin("docx", {
    codecs: ({ defineCodecs }) =>
      defineCodecs({
        "text/html": { query, transformData, transformFragment },
      }),
  });

  const BoldPlugin = definePlatePlugin("bold", {
    schema: { mark: property.boolean() },
    codecs: ({ defineCodecs }) =>
      defineCodecs({
        "text/html": {
          decode: () => true,
          encode: ({ value }) => (value ? { tag: "strong" } : null),
          match: [{ tag: ["strong", "b"] }],
        },
      }),
  });
  ```

  Use the flat `PLUGINS` catalog for built-in capability names. Resolve persisted element types and property keys through schema-owning plugin context or the installed plugin's flat `schema.type` / `schema.key`; use explicit persisted literals only for copied registry data and document fixtures. Use typed node fields or semantic plugin methods for additional properties.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Register editor shortcuts on their owning plugin. Copied controls use local DOM input handlers and Floating UI dismissal. Remove the generic React hotkey engine, pressed-key globals, and public scope stores.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Export direct `Resizable` and `ResizeHandle` components with flat props. Remove the component factory, public providers, stores, raw selector hooks, and state-to-props hook pipelines; resize context remains private to the family.

  Move resize components to the current editor hooks and feature-owned commit APIs, add keyboard slider behavior, and restrict relative resize lengths to percentage strings. Resize-handle consumers receive live pointer and keyboard callbacks from their nearest resizable owner.

  Use a neutral zero minimum width and generic `Resize` accessible label in the package. Media registry components own their media-specific limits and label.

  **Migration:** Use percentage strings for relative lengths. The shared pointer lifecycle and length-clamping helpers are private. Pointer cancellation restores the starting width, and keyboard bounds track the current responsive container.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Replace flat Toggle blocks with semantic nested Details and Summary nodes.

  **Migration:** Import `BaseDetailsPlugin` from `platejs/details` and `DetailsPlugin` from `platejs/details/react`. Persist one `details` element whose first child is a `summary` text block and whose remaining children are direct body blocks. Read and update transient disclosure state through `editor.plugin(BaseDetailsPlugin)`.

  Add the v54 document migration when loading persisted v53 Toggle values:

  ```tsx
  import {
    defineDocumentMigrations,
    migratePlateV54,
  } from "platejs/migrations";

  const migrations = defineDocumentMigrations(EditorSchema, {
    steps: { 54: migratePlateV54 },
    unversioned: 53,
  });
  ```

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Use editor node selection for AI block prompts and replacements. Read request ranges and exact directional node membership through the package-owned AI chat context.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Remove `@platejs/selection` integration, expose Plite one-or-many node selection through Plate editors, and add composable `NodeSelectionHighlight` and `NodeSelectionDrag` components. Cache selectable geometry per drag gesture, publish selection only when its exact node set or direction changes, and reuse mounted highlight portals as the selection grows.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Export `CursorOverlayPlugin` from `platejs/react` for editor-selection overlays.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Accept exact one-or-many node selections in list indent, outdent, and toggle transforms.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Remove selection-package re-exports, expose Plite one-or-many node selection from `platejs`, and export composable `NodeSelectionHighlight` and `NodeSelectionDrag` components from `platejs/react`.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Store multi-cell selection in directional core `NodeSelection`. Derive table geometry, merge and split eligibility, borders, and cell background updates through the Table plugin.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Remove block-selection helpers; read selected nodes through the editor selection API.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Apply and validate exact one-or-many node selections from collaboration updates.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Export `SlashPluginState` as the complete mutable state contract for `BaseSlashPlugin`.

  - Expose Slash plugins through the Plite-native plugin contract
  - Register slash-input values in compiled schemas
  - Install the slash-input descriptor as a required plugin dependency
  - Use `slashCommand` and `slashInput` as plugin identities, with transient elements persisted as `slashInput`

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Expose semantic transient-suggestion cleanup through the suggestion plugin update group so aliased properties remain bound to their exact schema handle.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Ignore schema-declared metadata properties when computing suggestion diffs, including configured persisted element-ID keys.

  Export `BaseSuggestionPluginState` as the mutable state contract for suggestion tracking and review.

  Move suggestion queries and mutations to `BaseSuggestionPlugin` and the installed editor API, and register suggestion marks and metadata in compiled schemas with versioned inline validation. Infer `nodes()` and `nodeEntries()` results as descendant entries rather than exposing the editor root through the broad `Node` union.

  Let suggestion leaf components inspect suggestion metadata without receiving the underlying text string.

  **Migration:** Read pure value helpers from `editor.api.suggestion`, snapshot queries from `editor.read.suggestion`, and mutations from `editor.update.suggestion`:

  ```tsx
  const identity = editor.api.suggestion.createIdentity();
  const fragment = editor.api.suggestion.createFragment(input, identity);
  const nextValue = editor
    .plugin(BaseSuggestionPlugin)
    .api.diff(previousValue, value);
  const reviews = editor.read.suggestion.reviews();

  editor.update.suggestion.accept(reviewId);
  editor.update.suggestion.reject(reviewId);
  editor.update.suggestion.setNodes(options);
  ```

  Use `SuggestionUpdatePolicy.skip` for updates that bypass suggestion tracking and `SUGGESTION_TRANSIENT_KEY` for transient metadata. Remove `withSuggestion`, `diffToSuggestions`, and standalone suggestion query, transform, and utility imports.

  Subscribe to current review groups with `useSuggestionReviews()`. Accept and reject resolve the selected ID against the current document, preserving overlapping changes. Copied review cards own labels, date formatting, and active-card state.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Export `TabbablePluginState` as the complete mutable state contract for `BaseTabbablePlugin`.

  Support HTML and SVG tabbables through the snapshot-aware `editor.plugin(TabbablePlugin).read.findDestination(options)` query. Accept `FocusableElement` in custom `TabbableEntry` values and remove the standalone `findTabDestination` helper. Keep `TabbableEffects` as plugin implementation instead of a public component.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Use `useTableSelectionDOM(tableRef)` as the sole package React primitive for a custom table renderer. Compose transient column, row, and margin state, cell layout reads, and pointer handlers in the renderer through `TablePlugin` and Core selector hooks. Replace `useTableSelectionDom` and the old renderer-state hook family with this DOM lifecycle hook and the matching scoped capabilities.

  Derive merge and split eligibility from `editor.plugin(TablePlugin).read.selection()`. The copied `table` owns transient column, row, and margin overrides plus row rendering.

  Export `TablePluginState` as the complete mutable state contract for `BaseTablePlugin`.

  Consolidate pure table factories and schema services into `editor.api.table`, snapshot queries into `editor.read.table`, and mutations into `editor.update.table`. Register validated table structure and properties in the compiled schema, including versioned validation for cell attributes, borders, and column sizes. Store table-cell spans only in numeric `colSpan` and `rowSpan` fields.

  Validate spans as positive safe integers, row heights as positive finite numbers, and border widths as non-negative finite numbers. Represent unknown partial column widths with `null` instead of `0`.

  Repair malformed grids and paste rectangular cell fragments across merged-cell boundaries. Keep paste, drag-and-drop, and compound table commands targeting the intended rows and cells after earlier edits.

  Represent multi-cell pointer drags as directional core `NodeSelection` values, preserve them when clearing cells, and leave same-cell text drags native. Derive rectangular cell geometry through `editor.plugin(TablePlugin).read.selection(at?)`.

  Return live cell entries, anchors, bounds, and table identity from the sole Table selection read. Use core `selection.nodes()` and `selection.contains()` for generic membership. Persisted table element IDs remain ordinary schema data.

  **Migration:** Replace direct table helper imports with the matching scoped capability:

  ```tsx
  editor.api.table.create({ colCount: 3, rowCount: 2 });
  editor.plugin(TablePlugin).read.selection();
  editor.update.table.insert({ colCount: 3, rowCount: 2 });
  editor.update.table.insertColumn();
  editor.update.table.removeRow();
  editor.update.table.merge();
  ```

  Remove `nextBlock` from insertion options. Use `at` for exact placement or `after` for a live source block, with `select` and `replaceEmpty` controlling selection and empty text-block replacement. Implicit insertion places the table after the current containing table.

  Replace persisted `attributes.colspan` and `attributes.rowspan` with `colSpan` and `rowSpan`. HTML import and rendering continue to use lowercase DOM attributes.

  Install table row and cell descriptors through required plugin dependencies. Persist every data or header cell as `tableCell`; set `header: true` for cells that render as `<th>`. `BaseTableCellHeaderPlugin`, `TableCellHeaderPlugin`, `TableCellHeaderElement`, and `TableCellHeaderElementStatic` are not part of the table surface.

  Add the shared v54 document step when loading documents that persisted header cells under the legacy `tableCellHeader` type:

  ```tsx
  import {
    defineDocumentMigrations,
    migratePlateV54,
  } from "platejs/migrations";

  const migrations = defineDocumentMigrations(EditorSchema, {
    steps: { 54: migratePlateV54 },
    unversioned: 53,
  });
  ```

  Replace `editor.api.table.getCellTypes()` with `editor.plugin(TableCellPlugin).schema.type`; tables have one cell element type.

  Use `getCellIndices(cell)` for row and column coordinates and `getAdjacentCell({ deltaCol, deltaRow })` for neighboring cells. Border batch mutation is private to the table command owner; public callers use `setBorderSize` or `toggleBorders`.

  Use exact clipboard slices through `readSlice` and `writeSlice`, and preserve projected row and cell children when exporting directional node selections through the core slice read.

  Use semantic table fields and store column widths only on tables.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Keep tag selection UI in the copied `select-editor` component. The package exports the tag descriptors and scoped semantic capabilities.

  Use `BaseMultiSelectPlugin` for constrained tag pickers and `BaseTagPlugin` for ordinary inline tags that preserve surrounding text. `MultiSelectPlugin` supplies the React adapter for the constrained picker.

  Move tag insertion to `editor.plugin(MultiSelectPlugin).update.insert`, read selected items through `editor.plugin(MultiSelectPlugin).read.getSelectedItems`, and compare values through `editor.plugin(MultiSelectPlugin).read.isEqual`. Run multi-select behavior through Plite transactions, register tag values in compiled schemas, and remove standalone tag query helpers.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Keep TOC interaction controllers in copied renderers. The package exposes heading discovery and insertion instead of renderer-specific hooks.

  Track headings through editor-scoped `NodeKey` values. TOC does not install `ElementIdPlugin` or require persisted element IDs.

  Read headings through `editor.plugin(TocPlugin).read.headings()` and insert a table of contents through `editor.update.toc.insert()`. The plugin owns heading discovery and insertion instead of exported editor/transaction helpers.

  Copy `toc-node` for active-heading observation, scrolling, and navigation feedback.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Fix mark toolbar buttons so mutually exclusive marks are cleared only when enabling the target mark.

  Resolve exit-break targets against earlier writes in the active transaction.

  Keep block-placeholder controllers package-private, remove `_target` and `selectors.placeholder`, and read complete editor text with `useEditorSelector` instead of `useEditorString`. Keep package placeholder copy empty by default; copied kits configure visible placeholder text.

  Treat `inject.nodeProps` transforms and functional `render.attributes` as pure, hook-free per-node callbacks. Author sparse whole-element view attributes through `render.useViewElementAttributes`; Plate keeps keyed publication private.

  Require React and React DOM 19.2 or newer.

  Remove the one-consumer form-input, remove-node-button, mark-toolbar-button, selection-state, and selection-fragment hooks. Keep `useSelectionFragmentProp` at the flat React package root; use `useEditorSelector` with `editor.read.selection` or `editor.read.fragment()` for component-local selection reads.

  Export complete `NormalizeTypesPluginState`, `TrailingBlockPluginState`, and `BlockPlaceholderPluginState` contracts.

  - Base Plate node types on Plite `Element` and `Text`
  - Replace the optional caption property contract with direct inline `TMediaElement.children`; remove `TCaptionElement` and the `caption` node-map entry
  - Rename `TNodeMap` to `NodeMap`
  - Export `SingleBlockPlugin` and `SingleLinePlugin` as independent editor constraints that weakly disable an installed trailing-block peer
  - Expose exit-break commands through the scoped plugin update API
  - Narrow `TrailingBlockPlugin`'s custom `insert` option to a wrapper around the default insertion; it no longer receives an editor or transaction context
  - Use one flat `PLUGINS` catalog for camel-case capability names; resolve persisted element types and property keys separately, and remove `KEYS`, `NODES`, `STYLE_KEYS`, and the redundant `tableCellHeader` capability. Use `docx` for the DOCX paste capability; file import and export are standalone operations
  - Replace the separate subscript and superscript identities with `PLUGINS.script`; represent script text with `TScriptValue` (`'sub' | 'sup'`)
  - Type resizable widths as numeric or relative CSS lengths
  - Persist `TTextAlignProps` under the canonical `textAlign` property

  **Migration:** Replace `TNodeMap` imports with `NodeMap`, import editor node primitives from `platejs`, and type media nodes directly as `TImageElement`, `TAudioElement`, `TFileElement`, `TVideoElement`, or `TMediaEmbedElement`; render each media element's direct children as its caption. Compose `SingleBlockPlugin` or `SingleLinePlugin` alongside `TrailingBlockPlugin`; the constraint leaves a missing peer alone.

  Call exit-break commands through the plugin descriptor:

  ```tsx
  editor.plugin(ExitBreakPlugin).update.insert(options);
  ```

  Capture any required plugin context before configuring a custom trailing-block insertion wrapper:

  ```tsx
  // Before
  insert: (editor, { insert }) => {
    editor.plugin(SuggestionPlugin).api.untracked(insert);
  };

  // After
  insert: (insert) => {
    suggestionApi.untracked(insert);
  };
  ```

  Replace `h1` through `h6` capability names with one heading capability.

### Minor Changes

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Add `useEditorHasSelection(id?)` to subscribe to primary-root text selection presence without rerendering for caret or range movement. Comment and color toolbar controls use this hook.

### Patch Changes

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Preserve semantic list boundaries during Markdown streaming.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Add optional application-owned primary-root grammar while preserving the standard paragraph root when omitted

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Return focus to the editor when arrow navigation exits an inline equation.

  Define block and inline math Markdown conversion on the math plugins.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Fix plain vertical arrow navigation to move directly between table cells without painting an intermediate caret.

  Avoid recalculating table cell coordinates for text-only editor updates.

  Define table Markdown conversion on the table plugins.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Define Markdown codecs beside headings, blockquotes, thematic breaks, and basic marks.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Fix shortcuts acting on stale selections during keyboard input.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Prevent navigation feedback flashes from scrolling back to an unrelated selection

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) –

  - Delete selected block voids without merging following content into them
  - Expose plugin-owned one-shot command groups through `editor.plugin(Plugin).update`
  - Check optional descriptor installation through `editor.plugin(Plugin).installed`
  - Preserve exact dependency, API, read, update, selector, and store inference through plugin construction, conversion, and heterogeneous runtime publication
  - Require standalone resolved-plugin lookup to return an installed descriptor; absent and disabled plugins throw instead of producing a fallback descriptor
  - Infer plugin transaction groups in `createRuleFactory(plugin)`
  - Preserve editor extension state types through `toPlatePlugin`
  - Declare plugin element behavior, marks, properties, and targeted content roots through plugin `schema` contributions compiled by Plite
  - Publish Plate schema installation and an empty primary-root default as one atomic extension migration
  - Author MIME-keyed product codecs through context-bound constructor `codecs: ({ defineCodecs }) => defineCodecs(...)` declarations; infer same-plugin APIs in that callback and compile them to schema-bound exact-slice Plite DOM codecs
  - Provide schema-inferred Markdown node codec contracts directly from `platejs`, with one `defineCodecs` object for every format owned by a plugin
  - Derive element and text property-capability types with `ElementWith` and `TextWith`, including authored aliases, prefixes, defaults, and value domains
  - Treat Plate-owned custom MDX tag names as resolved schema identity while keeping fixed MDAST, HTML, and MDX syntax literal
  - Allow product-specific node codec declarations to target the owning plugin while preserving schema inference
  - Author schema-inferred bidirectional HTML codecs through `codecs: ({ defineCodecs }) => defineCodecs({ 'text/html': ... })` for elements, marks, and targeted properties
  - Project trusted DOM properties explicitly through `render.nodeProps`; remove plugin host attribute allowlists and automatic model-property mirroring
  - Initialize Plate from a primary-root value or complete `EditorDocumentValue`, emit the complete document from `onValueChange`, and render typed interactive or static content-root slots
  - Publish bundled declaration entrypoints with complete type dependencies that resolve under NodeNext
  - Resolve navigation, normalization, and input-rule targets against the active transaction draft
  - Own the default Plate placeholder presentation above Plite's structural DOM
  - Keep inserted inline elements outside the default node-ID policy, including inline void elements inserted beside text
  - Resolve plugin dependencies and conflicts by descriptor, install required dependencies transitively, and expose typed dependency APIs without string capability lookup
  - Declare host clipboard insertion as typed Plite DOM extension contributions
  - Publish static View rendering and Plite DOM strategy contributions under distinct extension identities
  - Compile merge, selectability, and slice-export policy into typed Plite read middleware
  - Avoid reevaluating published plugin schema factories during plugin access
  - Fix `PlateElement` and `PliteElement` composition across descriptor-owned component families
  - Keep ordinary text input native when Plate renderers and command middleware are behaviorally inert
  - Reuse plugin access and compiled decoration contexts so rich editor chrome stays inside frame budgets

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Type dynamic node patches and weak plugin overrides without broad dictionary escape hatches.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Define Markdown span codecs beside font and color style marks.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Respect caller-owned node and preview refs in `useDraggable`.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Preserve cross-editor block drag copy intent and remove source blocks only after the backend confirms a successful move.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Emit semantic list type, marker, and forced restart metadata from DOCX paste.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Keep comment threads attached through destructive text edits and restore their exact ranges through undo and redo

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Define the callout Markdown codec on the callout plugin and derive its custom MDX tag from the resolved callout schema type. Decode the external Markdown paragraph wrapper without requiring a Plate paragraph plugin. Decode its phrasing children directly so a block-producing paragraph codec cannot be silently unwrapped into invalid callout content.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Define fenced code block Markdown conversion on the code block plugin.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Fix AI Markdown streams with nested block content and inline links in previews

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Preserve complete AI edits throughout streaming and restore the original text when discarding suggestions.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Skip Date elements with one arrow key press in either direction.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Prevent column sizing from crashing when editing a block before a table.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Define date MDX conversion on the date plugin and derive its custom tag from the resolved application schema type.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Keep block DnD ownership inside its React DnD adapter so native inline drags reach Plite's move transaction. Compose fitted slice replacement through a detached transaction spec so delete-and-reinsert moves publish atomically. Allow inline mentions to move with native drag-and-drop and serialize through HTML clipboard data.

  Define mention Markdown conversion on the mention plugin. Conditional mention properties cannot replace decoded children or resolved schema identity.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Keep block DnD ownership inside its React DnD adapter so native inline drags reach Plite's move transaction. Compose fitted slice replacement through a detached transaction spec so delete-and-reinsert moves publish atomically. Allow inline mentions to move with native drag-and-drop and serialize through HTML clipboard data.

  Define mention Markdown conversion on the mention plugin. Conditional mention properties cannot replace decoded children or resolved schema identity.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Define footnote reference and definition Markdown conversion on the footnote plugins.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Define column layout MDX conversion on the column plugins. Custom column and column-group tags follow their resolved application schema types. The column group owns width correction, so the column item remains independently installable. The column item declares its paragraph dependency so column creation never reads an uninstalled schema portal. Column MDX attributes cannot replace decoded children or resolved schema type.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Define link Markdown conversion on the link plugin.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) –

  - Preserve exact node inference for built-in Markdown rules while keeping custom rule keys type-safe and open
  - Author Markdown parsing and serialization through one schema-wide `codecs: ({ defineCodecs }) => defineCodecs(...)` constructor declaration over immutable slices
  - Compile Markdown conversion from installed feature plugins and keep per-operation rule overrides local to each call

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Preserve schema-owned element IDs when serializing Markdown block wrappers.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Define indent-list Markdown conversion on the list plugin.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Keep cached code syntax ranges attached to their code block after inserting, removing or moving preceding blocks.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Clear stored selection overlays before primary focus enters a nested editable. Refresh visible selection-overlay geometry after document changes without reviving an overlay removed during the deferred refresh.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Serialize open clipboard fragments without adding block markers outside the selection.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) –

  - Expose Plite external-text adapters through Plate element slots
  - Keep mounted Plate content synchronized with imperative read-only changes
  - Refresh syntax only for changed code blocks and cancel pending refreshes after the last view unmounts
  - Identify native syntax decorations so embedded editors can preserve neutral annotations without duplicate syntax
  - Indent the first empty line of a code block at offset zero

  Use `createCodeMirrorAdapter` from the optional `platejs/code-block/codemirror` entrypoint for ExternalText synchronization, shared history, selection, and guarded composition/language-load lifetime. Install its CodeMirror language, state, and view peers when using this adapter. Copied code-block UI supplies themes, search, language choices, and native CodeMirror commands.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Fix Graphviz rendering in browser module builds.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Align Plate plugin schemas with Plite. Schema publication derives identity internally, element membership uses `blockContent`, schema queries accept plugin descriptors directly, and plugin definitions expose the authored schema without public compiler witnesses. Metadata-aware HTML, node-id, and element-state behavior uses placement roles. Application-owned property targets retain their authored semantic identity when Plate lowers plugin names to persisted element types.

  Expose compiled normal-flow membership through `editor.read.schema.isBlockContent(element)`.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Expose Plite test helpers through `platejs/testing`

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Bound Anchor dispatch, range projection, commit queries, and overlay updates to affected content. Keep composed decoration reads local to the requested node and DOM task scheduling linear in queued tasks. Add the `presence` change query for added and removed node identities without computing path changes.

  Reuse immutable document indexes without rescanning cached roots. Fit incoming Yjs nodes through the existing schema API without opening a detached live-document transaction per node.

  Build snapshot element catalogs only when requested. Apply multi-leaf text changes with one shared-ancestor publication per canonical change.

  Resolve Yjs schema property contexts only within affected regions.

  Map replacement identities through canonical changes without comparing every source node's text with every target node.

  Preserve whole-node deletion and retained sibling identities when canonical changes round-trip through JSON.

  Preserve selected text and direction through formatting splits and merges by retaining characters in canonical changes.

  Construct splits directly from their local close/open boundary without diffing the whole document.

  Read canonical values without revalidating immutable root arrays, and collect slice-owned roots without serializing unrelated document state.

  Avoid model identity lookup when editor DOM is unmounted. Skip copy-property traversal for schemas whose properties all survive copying.

  Ignore deferred content-root focus after a later model or projected selection supersedes it.

  Publish a selected-void cut and its final caret in one transaction.

  Reuse identical endpoint mappings within one change and repeated range projections within an immutable snapshot while preserving independent Anchor values.

  Reuse mapped output membership indexes and unchanged bucket ordering when only projected values change.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Prevent block drags from displaying a text insertion cursor.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Define image, file, audio, video, and embed Markdown conversion on the media plugins. Plate-owned media tags follow their resolved application schema types; fixed Markdown and HTML image syntax stays literal. Parsed MDX properties cannot replace media children, URLs, or resolved schema types; malformed figure input falls through to the Markdown runtime's schema-aware unknown-node handling. Declare Markdown image titles in the Image plugin schema so decoded and encoded titles stay inside the typed persisted contract.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Move Tab and Shift+Tab between table cells with one caret at the destination start while keeping browser focus inside the editor.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Require `platejs@>=54.0.0-beta.1` as a peer dependency.

  Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Require `platejs@>=54.0.0-beta.1` as a peer dependency.

  Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Keep an edited drag source intact while inserting the content captured when the cross-editor drag started.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Keep text-only code block commands from collapsing a node selection to one block.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Run combobox triggers only from a text selection.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Measure every projected range for one-or-many node selections.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Insert footnotes only from a text selection when no explicit location is provided.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Run column text-selection commands only from a text selection.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Run link text commands only from a text selection.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Insert media uploads after the exact selected nodes when no explicit location is provided.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Insert mentions only from a text selection when no explicit location is provided.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Defer text suggestion commands while a node selection is active.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Keep tag text cleanup scoped to text selections.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Define suggestion mark Markdown conversion on the suggestion plugin.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Read table-of-contents depth from the semantic heading level.

  Define table-of-contents MDX conversion on the table-of-contents plugin and derive its custom tag from the resolved application schema type.

## 53.2.1

### Patch Changes

- Updated `@platejs/core`, `@platejs/utils`.

## 53.1.2

### Patch Changes

- Updated `@platejs/core`, `@platejs/utils`.

## 53.0.7

### Patch Changes

- Updated `@platejs/core`, `@platejs/slate`, `@platejs/utils`.

## 53.0.6

### Patch Changes

- Updated `@platejs/core`, `@platejs/utils`.

## 53.0.5

### Patch Changes

- Updated `@platejs/core`, `@platejs/slate`, `@platejs/utils`.

## 53.0.3

### Patch Changes

- Updated `@platejs/utils`.

## 53.0.0

## 52.3.21

### Patch Changes

- Updated `@platejs/core`, `@platejs/slate`, `@platejs/utils`.

## 52.3.16

### Patch Changes

- Updated `@platejs/core`, `@platejs/utils`.

## 52.3.11

### Patch Changes

- [`4af5ea4`](https://github.com/udecode/plate/commit/4af5ea4298c0d15f813edd6322bb99cf0a8aaf85) by [@zbeyens](https://github.com/zbeyens) – Use compatible internal dependency ranges so `platejs` can resolve the current `@platejs/*` package graph without nested stale installs.

## 52.3.9

## 52.3.4

### Patch Changes

- [#4857](https://github.com/udecode/plate/pull/4857) by [@zbeyens](https://github.com/zbeyens) –
  - Update internal `@platejs/*` and `@udecode/*` dependency ranges to workspace references.

## 52.3.3

## 52.3.2

## 52.0.17

## 52.0.15

## 52.0.11

### Patch Changes

- [#4784](https://github.com/udecode/plate/pull/4784) by [@zbeyens](https://github.com/zbeyens) –
  - Fixed "Cannot find module 'react/compiler-runtime'" error for React 18 users

## 52.0.10

## 52.0.8

## 52.0.1

### Patch Changes

- [#4750](https://github.com/udecode/plate/pull/4750) by [@zbeyens](https://github.com/zbeyens) – Add React Compiler support.

## 52.0.0

### Major Changes

- [#4747](https://github.com/udecode/plate/pull/4747) by [@zbeyens](https://github.com/zbeyens) – ESM-only

## 51.1.3

## 51.1.2

### Patch Changes

- [#4732](https://github.com/udecode/plate/pull/4732) by [@zbeyens](https://github.com/zbeyens) – Format code with Biome

## 51.0.0

## 50.3.9

## 50.3.8

## 50.3.7

## 49.2.21

## 49.2.12

## 49.2.11

## 49.2.9

## 49.2.8

## 49.2.6

## 49.2.5

## 49.2.4

## 49.2.3

## 49.1.13

## 49.1.5

## 49.1.4

## 49.1.3

## 49.1.2

## 49.0.19

## 49.0.18

## 49.0.16

## 49.0.15

## 49.0.14

## 49.0.13

## 49.0.11

## 49.0.10

## 49.0.9

## 49.0.6

## 49.0.5

## 49.0.4

## 49.0.3

## 49.0.2

## 49.0.0

### Major Changes

- [#4327](https://github.com/udecode/plate/pull/4327) by [@zbeyens](https://github.com/zbeyens) –
  - Renamed package to `platejs`:
    - Replace all `@udecode/plate/react` with `platejs/react`
    - Replace all `'@udecode/plate'` with `'platejs'`

# @udecode/plate

## 48.0.5

## 48.0.3

## 48.0.1

## 48.0.0

## 47.3.1

## 47.2.7

## 47.2.3

## 47.1.1

## 46.0.10

## 46.0.9

## 46.0.4

## 46.0.2

## 45.0.9

## 45.0.8

## 45.0.7

## 45.0.6

## 45.0.5

## 45.0.2

## 45.0.1

## 44.0.7

## 44.0.1

## 44.0.0

## 43.0.5

## 43.0.4

## 43.0.2

## 43.0.0

## 42.2.5

## 42.2.2

## 42.1.2

## 42.1.1

## 42.0.6

## 42.0.5

## 42.0.4

## 42.0.3

## 42.0.1

## 42.0.0

### Major Changes

- [#3920](https://github.com/udecode/plate/pull/3920) by [@zbeyens](https://github.com/zbeyens) – **This package is now the new common package**, so all plugin packages are being removed. **Migration**:

  - Add the following dependencies:

  ```json
  "@udecode/plate-alignment": "42.0.0",
  "@udecode/plate-autoformat": "42.0.0",
  "@udecode/plate-basic-elements": "42.0.0",
  "@udecode/plate-basic-marks": "42.0.0",
  "@udecode/plate-block-quote": "42.0.0",
  "@udecode/plate-break": "42.0.0",
  "@udecode/plate-code-block": "42.0.0",
  "@udecode/plate-combobox": "42.0.0",
  "@udecode/plate-comments": "42.0.0",
  "@udecode/plate-csv": "42.0.0",
  "@udecode/plate-diff": "42.0.0",
  "@udecode/plate-docx": "42.0.0",
  "@udecode/plate-find-replace": "42.0.0",
  "@udecode/plate-floating": "42.0.0",
  "@udecode/plate-font": "42.0.0",
  "@udecode/plate-heading": "42.0.0",
  "@udecode/plate-highlight": "42.0.0",
  "@udecode/plate-horizontal-rule": "42.0.0",
  "@udecode/plate-indent": "42.0.0",
  "@udecode/plate-indent-list": "42.0.0",
  "@udecode/plate-kbd": "42.0.0",
  "@udecode/plate-layout": "42.0.0",
  "@udecode/plate-line-height": "42.0.0",
  "@udecode/plate-link": "42.0.0",
  "@udecode/plate-list": "42.0.0",
  "@udecode/plate-markdown": "42.0.0",
  "@udecode/plate-media": "42.0.0",
  "@udecode/plate-mention": "42.0.0",
  "@udecode/plate-node-id": "42.0.0",
  "@udecode/plate-normalizers": "42.0.0",
  "@udecode/plate-reset-node": "42.0.0",
  "@udecode/plate-resizable": "42.0.0",
  "@udecode/plate-select": "42.0.0",
  "@udecode/plate-selection": "42.0.0",
  "@udecode/plate-slash-command": "42.0.0",
  "@udecode/plate-suggestion": "42.0.0",
  "@udecode/plate-tabbable": "42.0.0",
  "@udecode/plate-table": "42.0.0",
  "@udecode/plate-toggle": "42.0.0",
  "@udecode/plate-trailing-block": "42.0.0"
  ```

  - Either replace all `@udecode/plate` imports with the individual package imports, or export the following in a new file (e.g. `src/plate.ts`):

  ```ts
  export * from "@udecode/plate-alignment";
  export * from "@udecode/plate-autoformat";
  export * from "@udecode/plate-basic-elements";
  export * from "@udecode/plate-basic-marks";
  export * from "@udecode/plate-block-quote";
  export * from "@udecode/plate-break";
  export * from "@udecode/plate-code-block";
  export * from "@udecode/plate-combobox";
  export * from "@udecode/plate-comments";
  export * from "@udecode/plate-diff";
  export * from "@udecode/plate-find-replace";
  export * from "@udecode/plate-font";
  export * from "@udecode/plate-heading";
  export * from "@udecode/plate-highlight";
  export * from "@udecode/plate-horizontal-rule";
  export * from "@udecode/plate-indent";
  export * from "@udecode/plate-indent-list";
  export * from "@udecode/plate-kbd";
  export * from "@udecode/plate-layout";
  export * from "@udecode/plate-line-height";
  export * from "@udecode/plate-link";
  export * from "@udecode/plate-list";
  export * from "@udecode/plate-media";
  export * from "@udecode/plate-mention";
  export * from "@udecode/plate-node-id";
  export * from "@udecode/plate-normalizers";
  export * from "@udecode/plate-reset-node";
  export * from "@udecode/plate-select";
  export * from "@udecode/plate-csv";
  export * from "@udecode/plate-docx";
  export * from "@udecode/plate-markdown";
  export * from "@udecode/plate-slash-command";
  export * from "@udecode/plate-suggestion";
  export * from "@udecode/plate-tabbable";
  export * from "@udecode/plate-table";
  export * from "@udecode/plate-toggle";
  export * from "@udecode/plate-trailing-block";
  export * from "@udecode/plate-alignment/react";
  export * from "@udecode/plate-autoformat/react";
  export * from "@udecode/plate-basic-elements/react";
  export * from "@udecode/plate-basic-marks/react";
  export * from "@udecode/plate-block-quote/react";
  export * from "@udecode/plate-break/react";
  export * from "@udecode/plate-code-block/react";
  export * from "@udecode/plate-combobox/react";
  export * from "@udecode/plate-comments/react";
  export * from "@udecode/plate-floating";
  export * from "@udecode/plate-font/react";
  export * from "@udecode/plate-heading/react";
  export * from "@udecode/plate-highlight/react";
  export * from "@udecode/plate-layout/react";
  export * from "@udecode/plate-slash-command/react";
  export * from "@udecode/plate-indent/react";
  export * from "@udecode/plate-indent-list/react";
  export * from "@udecode/plate-kbd/react";
  export * from "@udecode/plate-line-height/react";
  export * from "@udecode/plate-link/react";
  export * from "@udecode/plate-list/react";
  export * from "@udecode/plate-media/react";
  export * from "@udecode/plate-reset-node/react";
  export * from "@udecode/plate-selection";
  export * from "@udecode/plate-suggestion/react";
  export * from "@udecode/plate-tabbable/react";
  export * from "@udecode/plate-table/react";
  export * from "@udecode/plate-toggle/react";
  export * from "@udecode/plate-resizable";
  ```

  - Replace all `'@udecode/plate'` and `'@udecode/plate/react'` with `'@/plate'` in your codebase.

# @udecode/plate-common (< 42.0.0)

## 42.0.0

### Major Changes

- [#3920](https://github.com/udecode/plate/pull/3920) by [@zbeyens](https://github.com/zbeyens) – This package is now deprecated and will be renamed to `@udecode/plate`. Migration:

  - Remove `@udecode/plate-common` and install `@udecode/plate`
  - Replace all `'@udecode/plate-common'` with `'@udecode/plate'`,

## 37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - Split build into `@udecode/plate-common` and `@udecode/plate-common/react`.
  - NEW `/react` exports `@udecode/react-hotkeys`

## 33.0.4

### Patch Changes

- [#3199](https://github.com/udecode/plate/pull/3199) by [@zbeyens](https://github.com/zbeyens) – Fix `PlateElementProps` type

## 29.0.0

### Minor Changes

- [#2829](https://github.com/udecode/plate/pull/2829) by [@zbeyens](https://github.com/zbeyens) –
  - re-export `@udecode/react-utils`

### Patch Changes

- [#2829](https://github.com/udecode/plate/pull/2829) by [@zbeyens](https://github.com/zbeyens) –
  - Fix import from RSC

## 24.4.0

### Minor Changes

- [#2675](https://github.com/udecode/plate/pull/2675) by [@zbeyens](https://github.com/zbeyens) – Support slate-react 0.99.0
