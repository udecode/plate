# Plate Next v18 all-package plugin audit

## Verdict

No: the package plugins do not all follow Plate Next v18. The constructor chains
are usually recognizable, but Core inference, capability ownership, active
transaction use, React family ownership, and one-owner topology still drift.

## Exact coverage

- 58 workspace packages; 37 plugin-bearing.
- 1,377 package source files inventoried.
- 195 primary production expressions: 189 constructors and 6 pure adaptations.
- 180 exported live plugin symbols covered; zero missing.
- 1,090 test-only expressions classified separately.
- 120 findings: 3 P0, 47 P1, 51 P2, 19 P3.
- 71 primary expressions have directly linked drift; clean rows in a drifting package remain deferred rather than falsely attested.

## Repair order

1. Core type kernel, builder inference, and honest optional-plugin lookup.
2. Media shared-factory inference and Selection's transaction/weak-peer/hook ownership.
3. Suggestion nullability, Link and Markdown capability ownership, AI/Table fake casts, and List Classic stale capability capture.
4. Hook/component families in DnD, Toggle, Utils, Selection, Core EventEditor, and package-specific React ownership.
5. P2/P3 one-owner helpers, taxonomy directories, dead aliases, tests, and constants.

## Package verdicts

| Package | Primary | Direct drift | P0 | P1 | P2 | P3 | Verdict |
|---|---:|---:|---:|---:|---:|---:|---|
| ai | 4 | 4 | 0 | 3 | 4 | 0 | blocked-P1 |
| basic-nodes | 33 | 2 | 0 | 0 | 2 | 1 | repair-P2 |
| basic-styles | 16 | 0 | 0 | 0 | 0 | 1 | repair-P3 |
| browser | 0 | 0 | 0 | 0 | 0 | 0 | no-live-plugin-owner |
| callout | 2 | 1 | 0 | 1 | 0 | 0 | blocked-P1 |
| code-block | 6 | 2 | 0 | 1 | 4 | 0 | blocked-P1 |
| code-drawing | 2 | 0 | 0 | 0 | 0 | 0 | source-clean |
| combobox | 0 | 0 | 0 | 0 | 0 | 0 | no-live-plugin-owner |
| comment | 2 | 1 | 0 | 1 | 0 | 0 | blocked-P1 |
| core | 29 | 18 | 3 | 7 | 6 | 1 | blocked-P0 |
| csv | 1 | 0 | 0 | 0 | 0 | 0 | source-clean |
| cursor | 0 | 0 | 0 | 0 | 0 | 0 | no-live-plugin-owner |
| date | 2 | 0 | 0 | 0 | 0 | 0 | source-clean |
| diff | 0 | 0 | 0 | 0 | 0 | 0 | no-live-plugin-owner |
| dnd | 1 | 1 | 0 | 3 | 3 | 0 | blocked-P1 |
| docx | 1 | 0 | 0 | 0 | 0 | 0 | source-clean |
| docx-io | 1 | 1 | 0 | 0 | 1 | 0 | repair-P2 |
| emoji | 4 | 2 | 0 | 0 | 1 | 1 | repair-P2 |
| excalidraw | 2 | 0 | 0 | 0 | 0 | 0 | source-clean |
| find-replace | 1 | 0 | 0 | 0 | 0 | 0 | source-clean |
| floating | 0 | 0 | 0 | 0 | 0 | 0 | no-live-plugin-owner |
| footnote | 6 | 2 | 0 | 2 | 1 | 0 | blocked-P1 |
| indent | 2 | 1 | 0 | 1 | 1 | 0 | blocked-P1 |
| juice | 1 | 0 | 0 | 0 | 0 | 0 | source-clean |
| layout | 4 | 1 | 0 | 0 | 1 | 0 | repair-P2 |
| link | 2 | 2 | 0 | 3 | 3 | 1 | blocked-P1 |
| list | 2 | 2 | 0 | 0 | 2 | 1 | repair-P2 |
| list-classic | 14 | 2 | 0 | 1 | 2 | 1 | blocked-P1 |
| markdown | 1 | 1 | 0 | 2 | 1 | 3 | blocked-P1 |
| math | 4 | 2 | 0 | 1 | 0 | 0 | blocked-P1 |
| media | 14 | 9 | 0 | 1 | 4 | 4 | blocked-P1 |
| mention | 4 | 0 | 0 | 0 | 0 | 0 | source-clean |
| plate | 0 | 0 | 0 | 0 | 0 | 0 | no-live-plugin-owner |
| plate-scripts | 0 | 0 | 0 | 0 | 0 | 0 | no-live-plugin-owner |
| plite | 0 | 0 | 0 | 0 | 0 | 0 | no-live-plugin-owner |
| plite-dom | 0 | 0 | 0 | 0 | 0 | 0 | no-live-plugin-owner |
| plite-history | 0 | 0 | 0 | 0 | 0 | 0 | no-live-plugin-owner |
| plite-hyperscript | 0 | 0 | 0 | 0 | 0 | 0 | no-live-plugin-owner |
| plite-layout | 0 | 0 | 0 | 0 | 0 | 0 | no-live-plugin-owner |
| plite-react | 0 | 0 | 0 | 0 | 0 | 0 | no-live-plugin-owner |
| resizable | 0 | 0 | 0 | 0 | 0 | 0 | no-live-plugin-owner |
| selection | 3 | 3 | 0 | 9 | 5 | 0 | blocked-P1 |
| slash-command | 4 | 0 | 0 | 0 | 0 | 0 | source-clean |
| suggestion | 2 | 1 | 0 | 1 | 3 | 0 | blocked-P1 |
| tabbable | 2 | 2 | 0 | 1 | 1 | 0 | blocked-P1 |
| table | 8 | 2 | 0 | 1 | 3 | 3 | blocked-P1 |
| tag | 3 | 3 | 0 | 2 | 1 | 0 | blocked-P1 |
| test-utils | 0 | 0 | 0 | 0 | 0 | 0 | no-live-plugin-owner |
| toc | 2 | 1 | 0 | 1 | 0 | 1 | blocked-P1 |
| toggle | 2 | 1 | 0 | 3 | 0 | 0 | blocked-P1 |
| udecode/cmdk | 0 | 0 | 0 | 0 | 0 | 0 | no-live-plugin-owner |
| udecode/cn | 0 | 0 | 0 | 0 | 0 | 0 | no-live-plugin-owner |
| udecode/depset | 0 | 0 | 0 | 0 | 0 | 0 | no-live-plugin-owner |
| udecode/react-hotkeys | 0 | 0 | 0 | 0 | 0 | 0 | no-live-plugin-owner |
| udecode/react-utils | 0 | 0 | 0 | 0 | 0 | 0 | no-live-plugin-owner |
| udecode/utils | 0 | 0 | 0 | 0 | 0 | 0 | no-live-plugin-owner |
| utils | 6 | 2 | 0 | 1 | 0 | 1 | blocked-P1 |
| yjs | 2 | 2 | 0 | 1 | 2 | 0 | blocked-P1 |

## Findings

| ID | Priority | Package | Rule | Anchor | Finding | Decision |
|---|---|---|---|---|---|---|
| CORE-01 | P0 | core | production-any | `packages/core/src/lib/plugin/PluginConfig.ts:30` | Erased plugin/config/context contracts are built from any and infect every package capability. | repair: Replace erased shapes with exact unknown or branded runtime boundaries; add compile-only dependency, api, read, update, and selector inference tests. |
| CORE-02 | P0 | core | builder-inference | `packages/core/src/lib/plugin/createBasePlugin.ts:951` | Base, Plate, and conversion builders erase implementations and force consumer casts. | repair: Repair builder generics once, then delete every builder/configure consumer cast. |
| CORE-03 | P0 | core | optional-plugin-law | `packages/core/src/react/plugin/getPlugin.ts:9` | Missing plugins are replaced by a fabricated descriptor. | repair: Return or require an installed compiled descriptor; optional consumers use a typed portal plus installed. |
| AI-01 | P1 | ai | constructor-ownership | `packages/ai/src/react/ai-chat/AIChatPlugin.ts:191` | The first extend owns independent API/read/update contributions and needs no earlier capability. | repair: Merge it into createPlatePlugin; retain only the later stage that consumes api.show. |
| AI-02 | P1 | ai | constructor-ownership | `packages/ai/src/react/copilot/CopilotPlugin.tsx:234` | The first extend creates API from constructor state only. | repair: Move it into the constructor; keep the later dependency stage. |
| AI-05 | P1 | ai | fake-table-cast | `packages/ai/src/react/ai-chat/AIChatPlugin.ts:767` | Markdown read assumes every table row child is a table cell without runtime/schema narrowing. | repair: Narrow honestly or repair the Table read capability. |
| CALL-01 | P1 | callout | browser-io-in-update | `packages/callout/src/lib/BaseCalloutPlugin.ts:43` | Document update reads localStorage inside the transaction. | repair: Resolve the default outside tx and pass a domain value. |
| CODE-01 | P1 | code-block | production-any | `packages/code-block/src/lib/BaseCodeBlockPlugin.ts:59` | Highlight.js grammar boundaries use hljs:any, subst:any, and grammar:any. | repair: Type the real Highlight.js/Lowlight grammar contract. |
| COMMENT-01 | P1 | comment | stale-read-capture | `packages/comment/src/lib/BaseCommentPlugin.ts:1` | The update stage consumes a captured read capability instead of tx-scoped read. | repair: Read through the active transaction. |
| CORE-04 | P1 | core | rule-factory-inference | `packages/core/src/lib/plugins/input-rules/createRuleFactory.ts:393` | The public rule DSL uses conditional any, an erased return, and repeated double casts. | repair: Repair the discriminated factory owner and prove every rule-family inference path. |
| CORE-05 | P1 | core | hook-correctness | `packages/core/src/react/plugins/event-editor/useEventEditor.ts:43` | id ?? useEditorId() conditionally invokes a React hook. | repair: Always call useEditorId, then choose the supplied id. |
| CORE-06 | P1 | core | selector-purity | `packages/core/src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.ts:38` | Selectors resolve mutable path anchors instead of projecting readonly state. | repair: Publish resolved targets during commits and keep selectors field-only. |
| CORE-07 | P1 | core | constructor-inference | `packages/core/src/lib/editor/withPlite.ts:862` | The internal root descriptor and heterogeneous assembly are hidden by AnyBasePlugin and collection casts. | repair: Infer the root descriptor and repair the heterogeneous boundary. |
| CORE-08 | P1 | core | html-codec-typing | `packages/core/src/lib/plugins/html/HtmlPlugin.ts:867` | HTML compileRule accepts any and casts the owner portal through never. | repair: Reuse the exact extension callback type and add an honest declaration guard. |
| CORE-09 | P1 | core | node-id-contract | `packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts:88` | idCreator returns any and the normalizer relies on legacy node.inline structure. | best-api: Route ID and schema-free block policy through best-api and make the contract exact. |
| CORE-10 | P1 | core | duplicate-plite-primitives | `packages/core/src/lib/plugins/override/OverridePlugin.ts:18` | Override duplicates Plite text guards and string traversal. | repair: Use NodeApi.isText and NodeApi.string; delete the wrappers. |
| DND-01 | P1 | dnd | component-cycle | `packages/dnd/src/DndPlugin.tsx:1` | DndPlugin imports DndScroller while DndScroller imports DndPlugin; a component family also lives in the descriptor. | repair: Move the component family and break the cycle with owner-safe lookup. |
| DND-02 | P1 | dnd | semantic-owner | `packages/dnd/src/blockSelection.ts:1` | Block-selection behavior is owned by DnD; four peers are unused and the only external caller is selectBlockById. | best-api: Route the behavior to Selection or Plite through best-api. |
| DND-04 | P1 | dnd | hook-in-plugin | `packages/dnd/src/DndPlugin.tsx:107` | The descriptor contains a React hook implementation. | repair: Move the callback into the useDndNode hook family. |
| FOOT-01 | P1 | footnote | staged-read-capability | `packages/footnote/src/lib/BaseFootnotePlugin.ts:251` | Update reimplements definitions/references/nextId because read and update share one stage. | repair: Stage read first and consume tx-scoped read in a justified update stage. |
| FOOT-02 | P1 | footnote | typed-extension-boundary | `packages/footnote/src/lib/BaseFootnotePlugin.ts:300` | Navigation structurally probes tx.navigation and performs synchronous DOM feedback in a Base transaction. | repair: Keep headless selection in Base; use a typed React capability and schedule DOM work after commit. |
| INDENT-01 | P1 | indent | active-read-bypass | `packages/indent/src/lib/BaseIndentPlugin.ts:1` | Update logic reads through editor while an active tx is available. | repair: Use tx-scoped reads. |
| LINK-02 | P1 | link | supplied-state-bypass | `packages/link/src/lib/BaseLinkPlugin.ts:1` | A read contribution uses editor.read instead of its supplied state. | repair: Use the supplied read state. |
| LINK-05 | P1 | link | document-read-in-api | `packages/link/src/react/LinkPlugin.tsx:1` | React trigger APIs query the document. | repair: Move pure document queries to read. |
| LINK-06 | P1 | link | document-mutation-in-api | `packages/link/src/react/LinkPlugin.tsx:1` | React submit APIs mutate the document. | repair: Move mutations to update; keep API only for orchestration if needed. |
| LISTC-01 | P1 | list-classic | stale-capability-capture | `packages/list-classic/src/lib/BaseListPlugin.ts:1341` | The final extension captures api during assembly and can retain a pre-publication capability. | repair: Resolve context.api inside runtime callbacks. |
| MD-01 | P1 | markdown | duplicate-public-helper | `packages/markdown/src/lib/serializer/serializeInlineMd.ts:11` | serializeInlineMd is a public editor-parameter helper with no production caller. | best-api: Route through the sole editor.api.markdown surface or a true standalone runtime; hard-cut the duplicate helper. |
| MD-06 | P1 | markdown | root-api-ownership | `packages/markdown/src/lib/MarkdownPlugin.ts:113` | MarkdownPlugin publishes its keyed feature service through extension.api, leaving its scoped plugin API empty. | repair: Author deserialize, deserializeInline, and serialize as the Markdown plugin api so keyed projection still exposes editor.api.markdown.*; do not move serialize to editor.read or add another call surface. |
| MATH-01 | P1 | math | rule-factory-inference | `packages/math/src/lib/BaseEquationPlugin.ts:1` | Math rule matches require casts because createRuleFactory loses inference. | core: Fix CORE-04, then remove the consumer casts. |
| MEDIA-01 | P1 | media | inferred-plugin-factory | `packages/media/src/lib/BaseMediaPlugin.ts:99` | defineMediaPlugin fakes a descriptor contract with __config, extend(...never[]), and double casts. | repair: Repair the Core/shared-factory generic; keep the genuine five-descriptor factory. |
| SEL-01 | P1 | selection | optional-peer-installation | `packages/selection/src/react/BlockMenuPlugin.tsx:58` | A key portal writes BlockSelection state without checking installed. | repair: Keep the cycle-safe key portal but gate store access on installed. |
| SEL-02 | P1 | selection | owner-rediscovery | `packages/selection/src/react/BlockSelectionPlugin.tsx:238` | isBlockMenuOpen threads editor, probes Core runtime, and ignores disabled/installed state. | repair: Capture a typed BlockMenu portal and use a lexical installed-aware predicate. |
| SEL-03 | P1 | selection | optional-peer-installation | `packages/selection/src/react/CursorOverlayPlugin.tsx:70` | DnD is probed through Core internals and a key portal without installed semantics. | repair: Use a typed weak-peer portal plus installed. |
| SEL-04 | P1 | selection | active-transaction | `packages/selection/src/react/BlockSelectionPlugin.tsx:1042` | update.paste calls mutating clipboard insertion outside the active tx. | move-to-plite: Add and consume a transaction-bound clipboard ingress capability in Plite DOM. |
| SEL-05 | P1 | selection | current-owner-rediscovery | `packages/selection/src/react/BlockSelectionPlugin.tsx:935` | transformProps rediscovers its own plugin through useEditorPlugin despite already owning the staged API. | repair: Capture and use the staged owner API. |
| SEL-06 | P1 | selection | hook-in-plugin | `packages/selection/src/react/CursorOverlayPlugin.tsx:96` | The descriptor defines hook behavior and passes api.removeCursor into another hook. | repair: Move the callback into flat useCursorOverlay and resolve the owner through a permitted self-cycle portal. |
| SEL-10 | P1 | selection | production-any | `packages/selection/src/internal/SelectionArea.ts:10` | The selection engine uses any for DOM events, frames, touch, CSS indexing, and method binding. | repair: Type each DOM/event boundary honestly. |
| SEL-11 | P1 | selection | staged-read-capability | `packages/selection/src/react/BlockSelectionPlugin.tsx:244` | Selected-entry reads pass state through helpers and update duplicates the query. | repair: Stage read.getNodes first and consume scoped reads. |
| SEL-12 | P1 | selection | false-id-typing | `packages/selection/src/react/BlockSelectionPlugin.tsx:458` | Truthy IDs are cast to string at multiple ingress points. | repair: Require typeof id === string at every ingress. |
| SUG-01 | P1 | suggestion | nullable-state-lie | `packages/suggestion/src/lib/BaseSuggestionPlugin.ts:58` | currentUserId is nullable while mutation paths assert it and can persist null. | repair: Choose and enforce a real null policy across every write. |
| TAB-01 | P1 | tabbable | wrong-semantic-layer | `packages/tabbable/src/lib/BaseTabbablePlugin.ts:51` | The Base plugin is DOM-only and has no headless meaning. | repair: Own it directly as a Plate React plugin. |
| TABLE-01 | P1 | table | fake-mutation-typing | `packages/table/src/lib/internal/mutation.ts:519` | The mutation subsystem uses repeated double casts and never casts to bypass node/tx typing. | repair: Repair mutable clone and transaction generic owners; keep the independent subsystem. |
| TAG-01 | P1 | tag | stale-read-capture | `packages/tag/src/lib/BaseTagPlugin.ts:10` | The read stage consumes captured read instead of its supplied state group. | repair: Use the supplied read state. |
| TAG-02 | P1 | tag | same-key-composition | `packages/tag/src/react/TagPlugin.tsx:13` | Two React descriptors compose the same key as alternative personalities. | best-api: Route through best-api before changing the public shape. |
| TOC-01 | P1 | toc | missing-subscription | `packages/toc/src/react/useToc.ts:1` | Render-affecting state is read through store.get without subscription. | repair: Subscribe through the owning store hook. |
| TOGGLE-01 | P1 | toggle | initial-state-satisfies | `packages/toggle/src/react/TogglePlugin.tsx:20` | Initial state needs satisfies instead of contextual inference. | repair: Repair the owner generic and remove satisfies. |
| TOGGLE-02 | P1 | toggle | hook-in-plugin | `packages/toggle/src/react/TogglePlugin.tsx:36` | The descriptor contains a React hook implementation. | repair: Move it into the Toggle hook family. |
| TOGGLE-03 | P1 | toggle | component-family-colocation | `packages/toggle/src/react/TogglePlugin.tsx:1` | Visibility renderer/hook behavior is anonymous inside the plugin file. | repair: Move component and hook families to their semantic files. |
| UTIL-01 | P1 | utils | hook-in-plugin | `packages/utils/src/react/plugins/BlockPlaceholderPlugin.tsx:60` | Inline transformProps/useHooks bodies call React hooks and suppress hook lint. | repair: Extract useBlockPlaceholder; move independent contribution into the constructor. |
| YJS-02 | P1 | yjs | unsound-generic-default | `packages/yjs/src/react/useYjs.ts:136` | A fixed default cursor object is cast to arbitrary caller-selected data. | repair: Overload or require data for custom cursor types. |
| AI-03 | P2 | ai | one-owner-helper | `packages/ai/src/lib/BaseAIPlugin.ts:61` | getPreviewRange and its type have one production owner. | repair: Move them into the update lexical owner. |
| AI-04 | P2 | ai | one-owner-helper | `packages/ai/src/react/copilot/CopilotPlugin.tsx:29` | getNextWord has no production consumer outside Copilot initial state. | repair: Inline the default into typed initialState and test through CopilotPlugin. |
| AI-06 | P2 | ai | fake-element-cast | `packages/ai/src/lib/BaseAIPlugin.ts:316` | stripNode returns Descendant and is cast back to Element. | repair: Give the recursive helper an honestly preserved return type. |
| AI-07 | P2 | ai | nested-family-topology | `packages/ai/src/react/ai-chat/index.ts:1` | AI React families are hidden behind nested family directories and barrels. | repair: Flatten AIPlugin, AIChatPlugin, useAIChat, and CopilotPlugin under src/react. |
| BASIC-01 | P2 | basic-nodes | configured-type | `packages/basic-nodes/src/lib/BaseBlockPlugins.ts:48` | HorizontalRuleRules writes raw HR/paragraph keys instead of configured types. | repair: Resolve configured types from the plugin context. |
| BASIC-02 | P2 | basic-nodes | one-owner-context-plumbing | `packages/basic-nodes/src/migrations/ScriptV54MigrationPlugin.ts:11` | Three private recursive helpers thread script.type for one production owner. | repair: Inline them lexically in the migration plugin and remove the cast. |
| CODE-02 | P2 | code-block | constructor-ownership | `packages/code-block/src/lib/BaseCodeBlockPlugin.ts:1097` | The sole extend uses constructor state/editor but no earlier capability. | repair: Move decoration and extension ownership into createBasePlugin. |
| CODE-03 | P2 | code-block | duplicated-algorithm | `packages/code-block/src/react/CodeBlockPlugin.tsx:24` | React repeats the Base language-change traversal. | repair: Own detection once and reuse it for cache invalidation and React refresh. |
| CODE-04 | P2 | code-block | fake-root-cast | `packages/code-block/src/react/CodeBlockPlugin.tsx:45` | Base and React construct pseudo roots and cast them to Element. | repair: Use a typed root lookup or repair the Plite node-root input. |
| CODE-05 | P2 | code-block | one-owner-helper | `packages/code-block/src/lib/BaseCodeBlockPlugin.ts:399` | Python grammar setup is private glue for one plugin owner. | repair: Move it into the BaseCodeHighlight lexical owner; keep the cross-instance WeakSet. |
| CORE-11 | P2 | core | fake-token-typing | `packages/core/src/lib/plugins/html/HtmlPlugin.ts:112` | An empty object is cast to a type requiring an HTML content token. | repair: Construct the declared token or use an honest opaque identity. |
| CORE-12 | P2 | core | callback-inference | `packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts:725` | NodeId uses non-null assertions and manual callback annotations to mask weak inference. | repair: Repair store and children inference, then remove assertions and annotations. |
| CORE-13 | P2 | core | active-state-boundary | `packages/core/src/lib/plugins/input-rules/InputRulesPlugin.ts:38` | InputRules keeps a dead editor.read fallback although runtime always supplies active tx. | repair: Require active state and repair contextual match typing. |
| CORE-14 | P2 | core | hook-family-colocation | `packages/core/src/react/plugins/event-editor/EventEditorStore.ts:17` | EventEditor hooks are split between a store owner and a taxonomy directory. | repair: Keep state/events in the store and merge hooks into useEventEditor. |
| CORE-15 | P2 | core | utility-ownership | `packages/core/src/lib/utils/isType.ts:6` | isType is unused and two pipe helpers have one production owner. | repair: Delete isType and inline the pipe helpers into plateChangeHandlers. |
| CORE-16 | P2 | core | configure-inference | `packages/core/src/lib/plugins/getCorePlugins.ts:27` | NodeId test defaults need satisfies before terminal configure. | repair: Inline contextually or repair configure inference. |
| DND-03 | P2 | dnd | one-owner-environment | `packages/dnd/src/dndEnvironment.ts:1` | Environment helpers have one production consumer. | repair: Colocate them with useDndNode. |
| DND-05 | P2 | dnd | one-owner-helper | `packages/dnd/src/useDndNode.ts:261` | onDropNode has one production caller. | repair: Inline it in the hook family. |
| DND-06 | P2 | dnd | one-owner-helper | `packages/dnd/src/useDndNode.ts:378` | onHoverNode has one production caller. | repair: Inline it in the hook family. |
| DOCXIO-01 | P2 | docx-io | taxonomy-directory | `packages/docx-io/src/lib/internal/utils/list.ts:1` | internal/utils classifies independently reused DOCX helpers. | repair: Flatten those files into internal and keep focused specs. |
| EMOJI-01 | P2 | emoji | semantic-owner | `packages/emoji/src/lib/BaseEmojiPlugin.ts:34` | The Base descriptor file owns picker UI contracts/defaults and library constants. | repair: Move picker contracts to useEmojiPicker and library limits/defaults to EmojiLibrary. |
| FOOT-03 | P2 | footnote | test-family-colocation | `packages/footnote/src/react/FootnotePlugin.spec.ts:30` | The React-named spec mostly tests Base behavior. | repair: Merge Base behavior into the Base spec and retain only the thin React contract. |
| INDENT-02 | P2 | indent | constructor-ownership | `packages/indent/src/lib/BaseIndentPlugin.ts:1` | An independent shortcut contribution is placed in extend. | repair: Move it into the constructor. |
| LAYOUT-01 | P2 | layout | constructor-ownership | `packages/layout/src/lib/BaseColumnPlugin.ts:1` | An independent column-item shortcut is placed in extend. | repair: Move it into the constructor. |
| LINK-01 | P2 | link | unbound-api-contract | `packages/link/src/lib/BaseLinkPlugin.ts:163` | BaseLink API is asserted with satisfies instead of inferred/bound. | repair: Bind the contract through the plugin builder. |
| LINK-03 | P2 | link | hardcoded-tx-key | `packages/link/src/lib/BaseLinkPlugin.ts:571` | The extension hardcodes tx.link instead of the configured plugin key. | repair: Use the inferred scoped capability. |
| LINK-07 | P2 | link | selector-annotation | `packages/link/src/react/LinkPlugin.tsx:1` | A selector state parameter is explicitly annotated where inference should own it. | repair: Remove the annotation and repair the owner if inference fails. |
| LIST-01 | P2 | list | semantic-react-boundary | `packages/list/src/lib/BaseListPlugin.tsx:1` | The semantic Base plugin imports React/JSX while ListPlugin is an empty adapter. | repair: Move live JSX to ListPlugin and bind static renderers explicitly. |
| LIST-02 | P2 | list | dead-alias | `packages/list/src/react/ListPlugin.tsx:5` | ListConfig aliases BaseListConfig with no consumer. | repair: Delete it. |
| LISTC-02 | P2 | list-classic | dead-export | `packages/list-classic/src/lib/BaseListPlugin.ts:1` | ListPluginTransaction is exported with no consumer. | repair: Delete it. |
| LISTC-03 | P2 | list-classic | callback-only-subscription | `packages/list-classic/src/react/useTodoListElement.ts:6` | The hook subscribes to readOnly only to use it in an event callback. | repair: Read editor state inside the event. |
| MD-02 | P2 | markdown | optional-plugin-law | `packages/markdown/src/lib/internal/markdownConversion.ts:79` | Optional plugin discovery uses getPlugin plus throw/catch. | repair: Use a typed portal with installed. |
| MEDIA-02 | P2 | media | dead-state-and-dependency | `packages/media/src/lib/placeholder/BasePlaceholderPlugin.ts:13` | Placeholder rules/state are unused and media dependencies belong only to the React replacement stage. | repair: Delete dead state and move dependencies to PlaceholderPlugin. |
| MEDIA-03 | P2 | media | constructor-ownership | `packages/media/src/react/placeholder/PlaceholderPlugin.tsx:226` | The first extend adds independent API/selectors from declared store state. | repair: Fold it into toPlatePlugin; retain later update/handler stages. |
| MEDIA-04 | P2 | media | unbound-contracts | `packages/media/src/react/placeholder/PlaceholderPlugin.tsx:121` | PlaceholderApi, Selectors, and Updates are exported but neither bound nor consumed. | repair: Delete or bind one real public capability contract. |
| MEDIA-05 | P2 | media | single-owner-behavior-file | `packages/media/src/migrations/MediaV54Migration.internal.ts:141` | A migration algorithm file has one production caller. | repair: Inline it into MediaV54MigrationPlugin and keep proof with the family. |
| SEL-07 | P2 | selection | component-family-colocation | `packages/selection/src/react/BlockSelectionPlugin.tsx:45` | A large portal/component family with hooks lives in the plugin descriptor. | repair: Move it to BlockSelection.tsx. |
| SEL-08 | P2 | selection | hook-family-colocation | `packages/selection/src/react/useSelectionArea.ts:46` | A private subcomponent hook is split from useBlockSelection and receives resolved context. | repair: Merge it into useBlockSelection and resolve the owner inside the family. |
| SEL-09 | P2 | selection | internal-topology | `packages/selection/src/internal/SelectionArea.ts:1` | One engine file does not justify internal and its public types are detached. | repair: Move flat SelectionArea.ts to the package root and colocate its types. |
| SEL-13 | P2 | selection | unvalidated-dom-boundary | `packages/selection/src/react/BlockSelectionPlugin.tsx:415` | DOM and clipboard values are cast instead of narrowed. | repair: Use instanceof checks and minimal typed clipboard interfaces. |
| SEL-14 | P2 | selection | test-colocation | `packages/selection/src/__tests__/testPlugins.ts:1` | Nine fixture descriptors are owned by one BlockSelection behavior spec. | repair: Merge them into that spec and delete the taxonomy directory. |
| SUG-02 | P2 | suggestion | unbound-api-contract | `packages/suggestion/src/lib/BaseSuggestionPlugin.ts:553` | The API return uses satisfies BaseSuggestionApi instead of being inferred/bound by the builder. | repair: Bind the contract through the callback/generic owner. |
| SUG-03 | P2 | suggestion | narrowing-mismatch | `packages/suggestion/src/lib/BaseSuggestionPlugin.ts:553` | Read paths rely on casts because dataList and node narrowing disagree. | repair: Repair the read return and narrowing contracts. |
| SUG-04 | P2 | suggestion | fake-narrowing | `packages/suggestion/src/lib/BaseSuggestionPlugin.ts:768` | Mutation logic relies on casts and non-null assertions instead of proven suggestion identity. | repair: Narrow at ingress and remove the lies. |
| TAB-02 | P2 | tabbable | callback-only-subscription | `packages/tabbable/src/react/TabbablePlugin.tsx:1` | React subscribes only to feed event callbacks. | repair: Read inside the callback. |
| TABLE-02 | P2 | table | one-use-tx-wrapper | `packages/table/src/lib/internal/paste.ts:848` | applyPreparedTablePastePlan has one caller and only forwards a plan plus tx. | repair: Inline it at the BaseTable paste owner. |
| TABLE-03 | P2 | table | scoped-read-bypass | `packages/table/src/react/useTableElement.ts:164` | React hooks rebuild table selection instead of consuming TablePlugin.read.getSelection. | repair: Use the scoped read in both hook families. |
| TABLE-07 | P2 | table | test-inference-hole | `packages/table/src/lib/__tests__/getTestTablePlugins.ts:5` | A shared fixture returns any and masks configured plugin inference. | repair: Make the fixture generic or infer its descriptor result. |
| TAG-03 | P2 | tag | unsafe-subtype-cast | `packages/tag/src/react/useTag.ts:1` | useTag casts subtype/new-item data instead of narrowing or owning a typed factory. | repair: Narrow honestly and bind the item factory. |
| YJS-01 | P2 | yjs | one-owner-context-helper | `packages/yjs/src/core/extension.ts:68` | canonicalizeRootContent has one production caller and casts children three times. | repair: Inline it into extension activation and type children honestly. |
| YJS-03 | P2 | yjs | false-optional-cast | `packages/yjs/src/react/useYjs.ts:450` | A required Yjs state accessor is cast to pretend optional installation. | repair: Add an honest optional accessor/installed gate or require Yjs. |
| BASIC-03 | P3 | basic-nodes | test-construction | `packages/basic-nodes/src/migrations/ScriptV54MigrationPlugin.spec.ts:1` | A TestRootPlugin fixture is used by one behavior family. | repair: Inline the fixture in that spec. |
| STYLE-01 | P3 | basic-styles | one-use-constant | `packages/basic-styles/src/lib/BaseStylePlugins.ts:15` | digitRegex is used once. | repair: Inline it at the parser owner. |
| CORE-17 | P3 | core | owner-colocation | `packages/core/src/react/plugins/navigation-feedback/types.ts:1` | NavigationFeedback contracts are split only by implementation kind. | repair: Move contracts into NavigationFeedbackPlugin. |
| EMOJI-02 | P3 | emoji | dead-declaration | `packages/emoji/src/lib/BaseEmojiPlugin.ts:211` | NUM_OF_CATEGORIES has no consumer. | repair: Delete it. |
| LINK-04 | P3 | link | raw-plugin-key | `packages/link/src/lib/BaseLinkPlugin.ts:1` | A raw link key bypasses KEYS.link. | repair: Use the canonical key. |
| LIST-03 | P3 | list | editor-plumbing | `packages/list/src/react/useTodoListElement.ts:6` | One hook returns editor only so another hook can mutate. | repair: Resolve editor in the mutation-owning hook. |
| LISTC-04 | P3 | list-classic | test-family-colocation | `packages/list-classic/src/react/ListPlugin.spec.tsx:1` | A generic React test file spans multiple hook families. | repair: Split or merge tests by the owning hook family during repair. |
| MD-03 | P3 | markdown | internal-export | `packages/markdown/src/lib/internal/markdownConversion.ts:1` | Internal and test-only conversion helpers are exported. | repair: Keep only the durable runtime/API owners public. |
| MD-04 | P3 | markdown | taxonomy-directory | `packages/markdown/src/lib/deserializer/utils/index.ts:1` | Deserializer/rules/root utils are split by implementation taxonomy. | repair: Flatten or colocate with their semantic owners. |
| MD-05 | P3 | markdown | one-owner-constant | `packages/markdown/src/lib/MarkdownPlugin.ts:1` | basicMarkdownMarks is exported but owned by one plugin file. | repair: Keep it lexical unless a real external owner appears. |
| MEDIA-06 | P3 | media | one-use-constant | `packages/media/src/lib/image/BaseImagePlugin.ts:242` | imageExtensions is referenced once. | repair: Move it into the extension owner. |
| MEDIA-07 | P3 | media | one-use-helper | `packages/media/src/lib/media-embed/BaseMediaEmbedPlugin.ts:29` | normalizeMediaEmbedWidth has one codec call. | repair: Inline it into decode. |
| MEDIA-08 | P3 | media | stage-local-machinery | `packages/media/src/react/placeholder/PlaceholderPlugin.tsx:28` | Upload error helpers and regex belong only to the update stage. | repair: Move them into that lexical stage. |
| MEDIA-09 | P3 | media | taxonomy-directory | `packages/media/src/react/placeholder/internal/mimeTypes.ts:1` | A large MIME data bank deserves a file, not a one-file internal directory. | repair: Flatten it beside PlaceholderPlugin. |
| TABLE-04 | P3 | table | one-use-input-aliases | `packages/table/src/lib/BaseTablePlugin.ts:88` | Seven private option aliases each serve one API method. | repair: Inline the method input shapes. |
| TABLE-05 | P3 | table | one-use-csv-machinery | `packages/table/src/lib/BaseTablePlugin.ts:441` | CSV regex/escape helper serve only writeSelection. | repair: Move them into writeSelection. |
| TABLE-06 | P3 | table | context-helper | `packages/table/src/lib/BaseTablePlugin.ts:111` | clampTableSelection ferries plugin type and command state into one owner. | repair: Move it into the final command extension. |
| TOC-02 | P3 | toc | dead-dependency | `packages/toc/src/react/useToc.ts:1` | The hook family resolves an unused editor dependency. | repair: Delete it. |
| UTIL-02 | P3 | utils | one-use-constant | `packages/utils/src/lib/plugins/SingleLinePlugin.ts:6` | LINE_BREAK is used once. | repair: Keep it lexical in the correction owner. |

## Kept boundaries

- Core compiler/publication/store, Base assembly, HTML codec compiler, React
  render pipeline, and static render pipeline are independent infrastructure;
  editor parameters there are not one-owner plugin plumbing.
- DnD getDropPath, Yjs adapter factories, Table applyTableMutationPlan, and
  Table planTableCellDrop are durable algorithm/adapter boundaries.
- Media ImagePreviewStore.extendSelectors is Zustand, not a Plate builder.
- BaseBlockquote's extension and the shipped Core descriptor/configure order
  are structurally justified.
- CSV, Docx, Juice, Code Drawing, Date, Excalidraw, Find Replace, Mention,
  Slash Command, and several thin adapters are source-clean in this review.

## Proof boundary

This is a source-only audit. It makes no runtime, typecheck, browser, or package
attestation claim. No file under `packages/**/src` was changed.
