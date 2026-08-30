#!/usr/bin/env node
/** biome-ignore-all lint/suspicious/noConsole: Audit generator reports reconciliation. */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../..'
);
const artifactDir = path.join(
  root,
  'docs/plans/artifacts/plate-next-all-package-plugin-audit-v18'
);
const EXPORTED_PLUGIN_SYMBOL_PATTERN = /^[A-Z].*Plugin(?:Base)?$/;

const findings = [];

const add = (
  id,
  severity,
  packageName,
  scope,
  category,
  anchor,
  owners,
  finding,
  next,
  decision = 'repair'
) => {
  const separator = anchor.lastIndexOf(':');

  findings.push({
    anchor,
    category,
    decision,
    finding,
    id,
    line: Number(anchor.slice(separator + 1)) || '',
    next,
    owners,
    package: packageName,
    path: anchor.slice(0, separator),
    scope,
    severity,
  });
};

// Core: descriptor chains are mostly sound; the generic/runtime kernel is not.
add(
  'CORE-01',
  'P0',
  'core',
  'kernel',
  'production-any',
  'packages/core/src/lib/plugin/PluginConfig.ts:30',
  [],
  'Erased plugin/config/context contracts are built from any and infect every package capability.',
  'Replace erased shapes with exact unknown or branded runtime boundaries; add compile-only dependency, api, read, update, and selector inference tests.'
);
add(
  'CORE-02',
  'P0',
  'core',
  'kernel',
  'builder-inference',
  'packages/core/src/lib/plugin/createBasePlugin.ts:951',
  [
    'recreatePlugin',
    'createPlatePlugin',
    'toPlatePlugin',
    'extendedBasePlugin',
  ],
  'Base, Plate, and conversion builders erase implementations and force consumer casts.',
  'Repair builder generics once, then delete every builder/configure consumer cast.'
);
add(
  'CORE-03',
  'P0',
  'core',
  'plugin',
  'optional-plugin-law',
  'packages/core/src/react/plugin/getPlugin.ts:9',
  ['getPlugin'],
  'Missing plugins are replaced by a fabricated descriptor.',
  'Return or require an installed compiled descriptor; optional consumers use a typed portal plus installed.'
);
add(
  'CORE-04',
  'P1',
  'core',
  'kernel',
  'rule-factory-inference',
  'packages/core/src/lib/plugins/input-rules/createRuleFactory.ts:393',
  ['InputRulesPlugin'],
  'The public rule DSL uses conditional any, an erased return, and repeated double casts.',
  'Repair the discriminated factory owner and prove every rule-family inference path.'
);
add(
  'CORE-05',
  'P1',
  'core',
  'react',
  'hook-correctness',
  'packages/core/src/react/plugins/event-editor/useEventEditor.ts:43',
  ['EventEditorPlugin'],
  'id ?? useEditorId() conditionally invokes a React hook.',
  'Always call useEditorId, then choose the supplied id.'
);
add(
  'CORE-06',
  'P1',
  'core',
  'plugin',
  'selector-purity',
  'packages/core/src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.ts:38',
  ['NavigationFeedbackPlugin', 'getPlateCorePlugins'],
  'Selectors resolve mutable path anchors instead of projecting readonly state.',
  'Publish resolved targets during commits and keep selectors field-only.'
);
add(
  'CORE-07',
  'P1',
  'core',
  'kernel',
  'constructor-inference',
  'packages/core/src/lib/editor/withPlite.ts:862',
  ['internalRootDescriptor'],
  'The internal root descriptor and heterogeneous assembly are hidden by AnyBasePlugin and collection casts.',
  'Infer the root descriptor and repair the heterogeneous boundary.'
);
add(
  'CORE-08',
  'P1',
  'core',
  'plugin',
  'html-codec-typing',
  'packages/core/src/lib/plugins/html/HtmlPlugin.ts:867',
  ['HtmlPlugin'],
  'HTML compileRule accepts any and casts the owner portal through never.',
  'Reuse the exact extension callback type and add an honest declaration guard.'
);
add(
  'CORE-09',
  'P1',
  'core',
  'plugin',
  'node-id-contract',
  'packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts:88',
  ['NodeIdPlugin', 'getCorePlugins'],
  'idCreator returns any and the normalizer relies on legacy node.inline structure.',
  'Route ID and schema-free block policy through best-api and make the contract exact.',
  'best-api'
);
add(
  'CORE-10',
  'P1',
  'core',
  'plugin',
  'duplicate-plite-primitives',
  'packages/core/src/lib/plugins/override/OverridePlugin.ts:18',
  ['OverridePlugin'],
  'Override duplicates Plite text guards and string traversal.',
  'Use NodeApi.isText and NodeApi.string; delete the wrappers.'
);
add(
  'CORE-11',
  'P2',
  'core',
  'kernel',
  'fake-token-typing',
  'packages/core/src/lib/plugins/html/HtmlPlugin.ts:112',
  ['HtmlPlugin'],
  'An empty object is cast to a type requiring an HTML content token.',
  'Construct the declared token or use an honest opaque identity.'
);
add(
  'CORE-12',
  'P2',
  'core',
  'plugin',
  'callback-inference',
  'packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts:725',
  ['NodeIdPlugin'],
  'NodeId uses non-null assertions and manual callback annotations to mask weak inference.',
  'Repair store and children inference, then remove assertions and annotations.'
);
add(
  'CORE-13',
  'P2',
  'core',
  'plugin',
  'active-state-boundary',
  'packages/core/src/lib/plugins/input-rules/InputRulesPlugin.ts:38',
  ['InputRulesPlugin'],
  'InputRules keeps a dead editor.read fallback although runtime always supplies active tx.',
  'Require active state and repair contextual match typing.'
);
add(
  'CORE-14',
  'P2',
  'core',
  'react',
  'hook-family-colocation',
  'packages/core/src/react/plugins/event-editor/EventEditorStore.ts:17',
  ['EventEditorPlugin'],
  'EventEditor hooks are split between a store owner and a taxonomy directory.',
  'Keep state/events in the store and merge hooks into useEventEditor.'
);
add(
  'CORE-15',
  'P2',
  'core',
  'topology',
  'utility-ownership',
  'packages/core/src/lib/utils/isType.ts:6',
  [],
  'isType is unused and two pipe helpers have one production owner.',
  'Delete isType and inline the pipe helpers into plateChangeHandlers.'
);
add(
  'CORE-16',
  'P2',
  'core',
  'kernel',
  'configure-inference',
  'packages/core/src/lib/plugins/getCorePlugins.ts:27',
  ['getCorePlugins'],
  'NodeId test defaults need satisfies before terminal configure.',
  'Inline contextually or repair configure inference.'
);
add(
  'CORE-17',
  'P3',
  'core',
  'topology',
  'owner-colocation',
  'packages/core/src/react/plugins/navigation-feedback/types.ts:1',
  ['NavigationFeedbackPlugin'],
  'NavigationFeedback contracts are split only by implementation kind.',
  'Move contracts into NavigationFeedbackPlugin.'
);

// Basic packages.
add(
  'BASIC-01',
  'P2',
  'basic-nodes',
  'plugin',
  'configured-type',
  'packages/basic-nodes/src/lib/BaseBlockPlugins.ts:48',
  ['BaseHorizontalRulePlugin'],
  'HorizontalRuleRules writes raw HR/paragraph keys instead of configured types.',
  'Resolve configured types from the plugin context.'
);
add(
  'BASIC-02',
  'P2',
  'basic-nodes',
  'topology',
  'one-owner-context-plumbing',
  'packages/basic-nodes/src/migrations/ScriptV54MigrationPlugin.ts:11',
  ['ScriptV54MigrationPlugin'],
  'Three private recursive helpers thread script.type for one production owner.',
  'Inline them lexically in the migration plugin and remove the cast.'
);
add(
  'BASIC-03',
  'P3',
  'basic-nodes',
  'test',
  'test-construction',
  'packages/basic-nodes/src/migrations/ScriptV54MigrationPlugin.spec.ts:1',
  [],
  'A TestRootPlugin fixture is used by one behavior family.',
  'Inline the fixture in that spec.'
);
add(
  'DND-01',
  'P1',
  'dnd',
  'react',
  'component-cycle',
  'packages/dnd/src/DndPlugin.tsx:1',
  ['DndPlugin'],
  'DndPlugin imports DndScroller while DndScroller imports DndPlugin; a component family also lives in the descriptor.',
  'Move the component family and break the cycle with owner-safe lookup.'
);
add(
  'DND-02',
  'P1',
  'dnd',
  'boundary',
  'semantic-owner',
  'packages/dnd/src/blockSelection.ts:1',
  ['DndPlugin'],
  'Block-selection behavior is owned by DnD; four peers are unused and the only external caller is selectBlockById.',
  'Route the behavior to Selection or Plite through best-api.',
  'best-api'
);
add(
  'DND-03',
  'P2',
  'dnd',
  'topology',
  'one-owner-environment',
  'packages/dnd/src/dndEnvironment.ts:1',
  ['DndPlugin'],
  'Environment helpers have one production consumer.',
  'Colocate them with useDndNode.'
);
add(
  'DND-04',
  'P1',
  'dnd',
  'react',
  'hook-in-plugin',
  'packages/dnd/src/DndPlugin.tsx:107',
  ['DndPlugin'],
  'The descriptor contains a React hook implementation.',
  'Move the callback into the useDndNode hook family.'
);
add(
  'DND-05',
  'P2',
  'dnd',
  'topology',
  'one-owner-helper',
  'packages/dnd/src/useDndNode.ts:261',
  ['DndPlugin'],
  'onDropNode has one production caller.',
  'Inline it in the hook family.'
);
add(
  'DND-06',
  'P2',
  'dnd',
  'topology',
  'one-owner-helper',
  'packages/dnd/src/useDndNode.ts:378',
  ['DndPlugin'],
  'onHoverNode has one production caller.',
  'Inline it in the hook family.'
);
add(
  'MD-01',
  'P1',
  'markdown',
  'api',
  'duplicate-public-helper',
  'packages/markdown/src/lib/serializer/serializeInlineMd.ts:11',
  ['MarkdownPlugin'],
  'serializeInlineMd is a public editor-parameter helper with no production caller.',
  'Route through the sole editor.api.markdown surface or a true standalone runtime; hard-cut the duplicate helper.',
  'best-api'
);
add(
  'MD-06',
  'P1',
  'markdown',
  'plugin',
  'root-api-ownership',
  'packages/markdown/src/lib/MarkdownPlugin.ts:113',
  ['MarkdownPlugin'],
  'MarkdownPlugin publishes its keyed feature service through extension.api, leaving its scoped plugin API empty.',
  'Author deserialize, deserializeInline, and serialize as the Markdown plugin api so keyed projection still exposes editor.api.markdown.*; do not move serialize to editor.read or add another call surface.'
);
add(
  'MD-02',
  'P2',
  'markdown',
  'plugin',
  'optional-plugin-law',
  'packages/markdown/src/lib/internal/markdownConversion.ts:79',
  ['MarkdownPlugin'],
  'Optional plugin discovery uses getPlugin plus throw/catch.',
  'Use a typed portal with installed.'
);
add(
  'MD-03',
  'P3',
  'markdown',
  'exports',
  'internal-export',
  'packages/markdown/src/lib/internal/markdownConversion.ts:1',
  ['MarkdownPlugin'],
  'Internal and test-only conversion helpers are exported.',
  'Keep only the durable runtime/API owners public.'
);
add(
  'MD-04',
  'P3',
  'markdown',
  'topology',
  'taxonomy-directory',
  'packages/markdown/src/lib/deserializer/utils/index.ts:1',
  ['MarkdownPlugin'],
  'Deserializer/rules/root utils are split by implementation taxonomy.',
  'Flatten or colocate with their semantic owners.'
);
add(
  'MD-05',
  'P3',
  'markdown',
  'topology',
  'one-owner-constant',
  'packages/markdown/src/lib/MarkdownPlugin.ts:1',
  ['MarkdownPlugin'],
  'basicMarkdownMarks is exported but owned by one plugin file.',
  'Keep it lexical unless a real external owner appears.'
);

// Styles, lists, and suggestions.
add(
  'STYLE-01',
  'P3',
  'basic-styles',
  'topology',
  'one-use-constant',
  'packages/basic-styles/src/lib/BaseStylePlugins.ts:15',
  [],
  'digitRegex is used once.',
  'Inline it at the parser owner.'
);
add(
  'LISTC-01',
  'P1',
  'legacy-list-model',
  'plugin',
  'stale-capability-capture',
  'packages/platejs/src/features/list/src/lib/BaseListPlugin.ts:1341',
  ['BaseListPlugin'],
  'The final extension captures api during assembly and can retain a pre-publication capability.',
  'Resolve context.api inside runtime callbacks.'
);
add(
  'LISTC-02',
  'P2',
  'legacy-list-model',
  'types',
  'dead-export',
  'packages/platejs/src/features/list/src/lib/BaseListPlugin.ts:1',
  ['BaseListPlugin'],
  'ListPluginTransaction is exported with no consumer.',
  'Delete it.'
);
add(
  'LISTC-03',
  'P2',
  'legacy-list-model',
  'react',
  'callback-only-subscription',
  'packages/platejs/src/features/list/src/react/useTodoListElement.ts:6',
  ['TodoListPlugin'],
  'The hook subscribes to readOnly only to use it in an event callback.',
  'Read editor state inside the event.'
);
add(
  'LISTC-04',
  'P3',
  'legacy-list-model',
  'test',
  'test-family-colocation',
  'packages/platejs/src/features/list/src/react/ListPlugin.spec.tsx:1',
  [],
  'A generic React test file spans multiple hook families.',
  'Split or merge tests by the owning hook family during repair.'
);
add(
  'SUG-01',
  'P1',
  'suggestion',
  'state',
  'nullable-state-lie',
  'packages/suggestion/src/lib/BaseSuggestionPlugin.ts:58',
  ['BaseSuggestionPlugin'],
  'currentUserId is nullable while mutation paths assert it and can persist null.',
  'Choose and enforce a real null policy across every write.'
);
add(
  'SUG-02',
  'P2',
  'suggestion',
  'types',
  'unbound-api-contract',
  'packages/suggestion/src/lib/BaseSuggestionPlugin.ts:553',
  ['BaseSuggestionPlugin'],
  'The API return uses satisfies BaseSuggestionApi instead of being inferred/bound by the builder.',
  'Bind the contract through the callback/generic owner.'
);
add(
  'SUG-03',
  'P2',
  'suggestion',
  'read',
  'narrowing-mismatch',
  'packages/suggestion/src/lib/BaseSuggestionPlugin.ts:553',
  ['BaseSuggestionPlugin'],
  'Read paths rely on casts because dataList and node narrowing disagree.',
  'Repair the read return and narrowing contracts.'
);
add(
  'SUG-04',
  'P2',
  'suggestion',
  'types',
  'fake-narrowing',
  'packages/suggestion/src/lib/BaseSuggestionPlugin.ts:768',
  ['BaseSuggestionPlugin'],
  'Mutation logic relies on casts and non-null assertions instead of proven suggestion identity.',
  'Narrow at ingress and remove the lies.'
);

// AI, code-block, document IO, emoji, footnote, selection, Yjs.
add(
  'AI-01',
  'P1',
  'ai',
  'plugin',
  'constructor-ownership',
  'packages/ai/src/react/ai-chat/AIChatPlugin.ts:191',
  ['AIChatPlugin'],
  'The first extend owns independent API/read/update contributions and needs no earlier capability.',
  'Merge it into createPlatePlugin; retain only the later stage that consumes api.show.'
);
add(
  'AI-02',
  'P1',
  'ai',
  'plugin',
  'constructor-ownership',
  'packages/ai/src/react/copilot/CopilotPlugin.tsx:234',
  ['CopilotPlugin'],
  'The first extend creates API from constructor state only.',
  'Move it into the constructor; keep the later dependency stage.'
);
add(
  'AI-03',
  'P2',
  'ai',
  'topology',
  'one-owner-helper',
  'packages/ai/src/lib/BaseAIPlugin.ts:61',
  ['BaseAIPlugin'],
  'getPreviewRange and its type have one production owner.',
  'Move them into the update lexical owner.'
);
add(
  'AI-04',
  'P2',
  'ai',
  'topology',
  'one-owner-helper',
  'packages/ai/src/react/copilot/CopilotPlugin.tsx:29',
  ['CopilotPlugin'],
  'getNextWord has no production consumer outside Copilot initial state.',
  'Inline the default into typed initialState and test through CopilotPlugin.'
);
add(
  'AI-05',
  'P1',
  'ai',
  'types',
  'fake-table-cast',
  'packages/ai/src/react/ai-chat/AIChatPlugin.ts:767',
  ['AIChatPlugin'],
  'Markdown read assumes every table row child is a table cell without runtime/schema narrowing.',
  'Narrow honestly or repair the Table read capability.'
);
add(
  'AI-06',
  'P2',
  'ai',
  'types',
  'fake-element-cast',
  'packages/ai/src/lib/BaseAIPlugin.ts:316',
  ['BaseAIPlugin'],
  'stripNode returns Descendant and is cast back to Element.',
  'Give the recursive helper an honestly preserved return type.'
);
add(
  'AI-07',
  'P2',
  'ai',
  'react',
  'nested-family-topology',
  'packages/ai/src/react/ai-chat/index.ts:1',
  ['AIChatPlugin', 'AIPlugin', 'CopilotPlugin'],
  'AI React families are hidden behind nested family directories and barrels.',
  'Flatten AIPlugin, AIChatPlugin, useAIChat, and CopilotPlugin under src/react.'
);
add(
  'CODE-01',
  'P1',
  'code-block',
  'types',
  'production-any',
  'packages/code-block/src/lib/BaseCodeBlockPlugin.ts:59',
  ['BaseCodeHighlightPlugin'],
  'Highlight.js grammar boundaries use hljs:any, subst:any, and grammar:any.',
  'Type the real Highlight.js/Lowlight grammar contract.'
);
add(
  'CODE-02',
  'P2',
  'code-block',
  'plugin',
  'constructor-ownership',
  'packages/code-block/src/lib/BaseCodeBlockPlugin.ts:1097',
  ['BaseCodeHighlightPlugin'],
  'The sole extend uses constructor state/editor but no earlier capability.',
  'Move decoration and extension ownership into createBasePlugin.'
);
add(
  'CODE-03',
  'P2',
  'code-block',
  'ownership',
  'duplicated-algorithm',
  'packages/code-block/src/react/CodeBlockPlugin.tsx:24',
  ['CodeHighlightPlugin', 'BaseCodeHighlightPlugin'],
  'React repeats the Base language-change traversal.',
  'Own detection once and reuse it for cache invalidation and React refresh.'
);
add(
  'CODE-04',
  'P2',
  'code-block',
  'types',
  'fake-root-cast',
  'packages/code-block/src/react/CodeBlockPlugin.tsx:45',
  ['CodeHighlightPlugin', 'BaseCodeHighlightPlugin'],
  'Base and React construct pseudo roots and cast them to Element.',
  'Use a typed root lookup or repair the Plite node-root input.'
);
add(
  'CODE-05',
  'P2',
  'code-block',
  'topology',
  'one-owner-helper',
  'packages/code-block/src/lib/BaseCodeBlockPlugin.ts:399',
  ['BaseCodeHighlightPlugin'],
  'Python grammar setup is private glue for one plugin owner.',
  'Move it into the BaseCodeHighlight lexical owner; keep the cross-instance WeakSet.'
);
add(
  'DOCXIO-01',
  'P2',
  'docx-io',
  'topology',
  'taxonomy-directory',
  'packages/docx-io/src/lib/internal/utils/list.ts:1',
  ['DocxIOPlugin'],
  'internal/utils classifies independently reused DOCX helpers.',
  'Flatten those files into internal and keep focused specs.'
);
add(
  'EMOJI-01',
  'P2',
  'emoji',
  'ownership',
  'semantic-owner',
  'packages/emoji/src/lib/BaseEmojiPlugin.ts:34',
  ['BaseEmojiPlugin', 'EmojiPlugin'],
  'The Base descriptor file owns picker UI contracts/defaults and library constants.',
  'Move picker contracts to useEmojiPicker and library limits/defaults to EmojiLibrary.'
);
add(
  'EMOJI-02',
  'P3',
  'emoji',
  'topology',
  'dead-declaration',
  'packages/emoji/src/lib/BaseEmojiPlugin.ts:211',
  ['BaseEmojiPlugin'],
  'NUM_OF_CATEGORIES has no consumer.',
  'Delete it.'
);
add(
  'FOOT-01',
  'P1',
  'footnote',
  'plugin',
  'staged-read-capability',
  'packages/footnote/src/lib/BaseFootnotePlugin.ts:251',
  ['BaseFootnotePlugin'],
  'Update reimplements definitions/references/nextId because read and update share one stage.',
  'Stage read first and consume tx-scoped read in a justified update stage.'
);
add(
  'FOOT-02',
  'P1',
  'footnote',
  'boundary',
  'typed-extension-boundary',
  'packages/footnote/src/lib/BaseFootnotePlugin.ts:300',
  ['BaseFootnotePlugin', 'FootnotePlugin'],
  'Navigation structurally probes tx.navigation and performs synchronous DOM feedback in a Base transaction.',
  'Keep headless selection in Base; use a typed React capability and schedule DOM work after commit.'
);
add(
  'FOOT-03',
  'P2',
  'footnote',
  'test',
  'test-family-colocation',
  'packages/footnote/src/react/FootnotePlugin.spec.ts:30',
  [],
  'The React-named spec mostly tests Base behavior.',
  'Merge Base behavior into the Base spec and retain only the thin React contract.'
);
add(
  'SEL-01',
  'P1',
  'selection',
  'plugin',
  'optional-peer-installation',
  'packages/selection/src/react/BlockMenuPlugin.tsx:58',
  ['BlockMenuPlugin'],
  'A key portal writes BlockSelection state without checking installed.',
  'Keep the cycle-safe key portal but gate store access on installed.'
);
add(
  'SEL-02',
  'P1',
  'selection',
  'plugin',
  'owner-rediscovery',
  'packages/selection/src/react/BlockSelectionPlugin.tsx:238',
  ['BlockSelectionPlugin'],
  'isBlockMenuOpen threads editor, probes Core runtime, and ignores disabled/installed state.',
  'Capture a typed BlockMenu portal and use a lexical installed-aware predicate.'
);
add(
  'SEL-03',
  'P1',
  'selection',
  'plugin',
  'optional-peer-installation',
  'packages/selection/src/react/CursorOverlayPlugin.tsx:70',
  ['CursorOverlayPlugin'],
  'DnD is probed through Core internals and a key portal without installed semantics.',
  'Use a typed weak-peer portal plus installed.'
);
add(
  'SEL-04',
  'P1',
  'selection',
  'transaction',
  'active-transaction',
  'packages/selection/src/react/BlockSelectionPlugin.tsx:1042',
  ['BlockSelectionPlugin'],
  'update.paste calls mutating clipboard insertion outside the active tx.',
  'Add and consume a transaction-bound clipboard ingress capability in Plite DOM.',
  'move-to-plite'
);
add(
  'SEL-05',
  'P1',
  'selection',
  'plugin',
  'current-owner-rediscovery',
  'packages/selection/src/react/BlockSelectionPlugin.tsx:935',
  ['BlockSelectionPlugin'],
  'transformProps rediscovers its own plugin through useEditorPlugin despite already owning the staged API.',
  'Capture and use the staged owner API.'
);
add(
  'SEL-06',
  'P1',
  'selection',
  'react',
  'hook-in-plugin',
  'packages/selection/src/react/CursorOverlayPlugin.tsx:96',
  ['CursorOverlayPlugin'],
  'The descriptor defines hook behavior and passes api.removeCursor into another hook.',
  'Move the callback into flat useCursorOverlay and resolve the owner through a permitted self-cycle portal.'
);
add(
  'SEL-07',
  'P2',
  'selection',
  'react',
  'component-family-colocation',
  'packages/selection/src/react/BlockSelectionPlugin.tsx:45',
  ['BlockSelectionPlugin'],
  'A large portal/component family with hooks lives in the plugin descriptor.',
  'Move it to BlockSelection.tsx.'
);
add(
  'SEL-08',
  'P2',
  'selection',
  'react',
  'hook-family-colocation',
  'packages/selection/src/react/useSelectionArea.ts:46',
  ['BlockSelectionPlugin'],
  'A private subcomponent hook is split from useBlockSelection and receives resolved context.',
  'Merge it into useBlockSelection and resolve the owner inside the family.'
);
add(
  'SEL-09',
  'P2',
  'selection',
  'topology',
  'internal-topology',
  'packages/selection/src/internal/SelectionArea.ts:1',
  ['BlockSelectionPlugin'],
  'One engine file does not justify internal and its public types are detached.',
  'Move flat SelectionArea.ts to the package root and colocate its types.'
);
add(
  'SEL-10',
  'P1',
  'selection',
  'types',
  'production-any',
  'packages/selection/src/internal/SelectionArea.ts:10',
  ['BlockSelectionPlugin'],
  'The selection engine uses any for DOM events, frames, touch, CSS indexing, and method binding.',
  'Type each DOM/event boundary honestly.'
);
add(
  'SEL-11',
  'P1',
  'selection',
  'read',
  'staged-read-capability',
  'packages/selection/src/react/BlockSelectionPlugin.tsx:244',
  ['BlockSelectionPlugin'],
  'Selected-entry reads pass state through helpers and update duplicates the query.',
  'Stage read.getNodes first and consume scoped reads.'
);
add(
  'SEL-12',
  'P1',
  'selection',
  'types',
  'false-id-typing',
  'packages/selection/src/react/BlockSelectionPlugin.tsx:458',
  ['BlockSelectionPlugin'],
  'Truthy IDs are cast to string at multiple ingress points.',
  'Require typeof id === string at every ingress.'
);
add(
  'SEL-13',
  'P2',
  'selection',
  'types',
  'unvalidated-dom-boundary',
  'packages/selection/src/react/BlockSelectionPlugin.tsx:415',
  ['BlockSelectionPlugin'],
  'DOM and clipboard values are cast instead of narrowed.',
  'Use instanceof checks and minimal typed clipboard interfaces.'
);
add(
  'SEL-14',
  'P2',
  'selection',
  'test',
  'test-colocation',
  'packages/selection/src/__tests__/testPlugins.ts:1',
  [],
  'Nine fixture descriptors are owned by one BlockSelection behavior spec.',
  'Merge them into that spec and delete the taxonomy directory.'
);
add(
  'YJS-01',
  'P2',
  'yjs',
  'topology',
  'one-owner-context-helper',
  'packages/yjs/src/core/extension.ts:68',
  ['BaseYjsPlugin'],
  'canonicalizeRootContent has one production caller and casts children three times.',
  'Inline it into extension activation and type children honestly.'
);
add(
  'YJS-02',
  'P1',
  'yjs',
  'types',
  'unsound-generic-default',
  'packages/yjs/src/react/useYjs.ts:136',
  ['YjsPlugin'],
  'A fixed default cursor object is cast to arbitrary caller-selected data.',
  'Overload or require data for custom cursor types.'
);
add(
  'YJS-03',
  'P2',
  'yjs',
  'types',
  'false-optional-cast',
  'packages/yjs/src/react/useYjs.ts:450',
  ['YjsPlugin'],
  'A required Yjs state accessor is cast to pretend optional installation.',
  'Add an honest optional accessor/installed gate or require Yjs.'
);

// Product feature plugins.
add(
  'CALL-01',
  'P1',
  'callout',
  'transaction',
  'browser-io-in-update',
  'packages/callout/src/lib/BaseCalloutPlugin.ts:43',
  ['BaseCalloutPlugin'],
  'Document update reads localStorage inside the transaction.',
  'Resolve the default outside tx and pass a domain value.'
);
add(
  'COMMENT-01',
  'P1',
  'comment',
  'plugin',
  'stale-read-capture',
  'packages/comment/src/lib/BaseCommentPlugin.ts:1',
  ['BaseCommentPlugin'],
  'The update stage consumes a captured read capability instead of tx-scoped read.',
  'Read through the active transaction.'
);
add(
  'INDENT-01',
  'P1',
  'indent',
  'transaction',
  'active-read-bypass',
  'packages/indent/src/lib/BaseIndentPlugin.ts:1',
  ['BaseIndentPlugin'],
  'Update logic reads through editor while an active tx is available.',
  'Use tx-scoped reads.'
);
add(
  'INDENT-02',
  'P2',
  'indent',
  'plugin',
  'constructor-ownership',
  'packages/indent/src/lib/BaseIndentPlugin.ts:1',
  ['BaseIndentPlugin'],
  'An independent shortcut contribution is placed in extend.',
  'Move it into the constructor.'
);
add(
  'LAYOUT-01',
  'P2',
  'layout',
  'plugin',
  'constructor-ownership',
  'packages/layout/src/lib/BaseColumnPlugin.ts:1',
  ['BaseColumnItemPlugin'],
  'An independent column-item shortcut is placed in extend.',
  'Move it into the constructor.'
);
add(
  'LINK-01',
  'P2',
  'link',
  'types',
  'unbound-api-contract',
  'packages/link/src/lib/BaseLinkPlugin.ts:163',
  ['BaseLinkPlugin'],
  'BaseLink API is asserted with satisfies instead of inferred/bound.',
  'Bind the contract through the plugin builder.'
);
add(
  'LINK-02',
  'P1',
  'link',
  'read',
  'supplied-state-bypass',
  'packages/link/src/lib/BaseLinkPlugin.ts:1',
  ['BaseLinkPlugin'],
  'A read contribution uses editor.read instead of its supplied state.',
  'Use the supplied read state.'
);
add(
  'LINK-03',
  'P2',
  'link',
  'transaction',
  'hardcoded-tx-key',
  'packages/link/src/lib/BaseLinkPlugin.ts:571',
  ['BaseLinkPlugin'],
  'The extension hardcodes tx.link instead of the configured plugin key.',
  'Use the inferred scoped capability.'
);
add(
  'LINK-04',
  'P3',
  'link',
  'key',
  'raw-plugin-key',
  'packages/link/src/lib/BaseLinkPlugin.ts:1',
  ['BaseLinkPlugin'],
  'A raw link key bypasses KEYS.link.',
  'Use the canonical key.'
);
add(
  'LINK-05',
  'P1',
  'link',
  'api',
  'document-read-in-api',
  'packages/link/src/react/LinkPlugin.tsx:1',
  ['LinkPlugin'],
  'React trigger APIs query the document.',
  'Move pure document queries to read.'
);
add(
  'LINK-06',
  'P1',
  'link',
  'api',
  'document-mutation-in-api',
  'packages/link/src/react/LinkPlugin.tsx:1',
  ['LinkPlugin'],
  'React submit APIs mutate the document.',
  'Move mutations to update; keep API only for orchestration if needed.'
);
add(
  'LINK-07',
  'P2',
  'link',
  'types',
  'selector-annotation',
  'packages/link/src/react/LinkPlugin.tsx:1',
  ['LinkPlugin'],
  'A selector state parameter is explicitly annotated where inference should own it.',
  'Remove the annotation and repair the owner if inference fails.'
);
add(
  'MATH-01',
  'P1',
  'math',
  'kernel',
  'rule-factory-inference',
  'packages/math/src/lib/BaseEquationPlugin.ts:1',
  ['BaseEquationPlugin', 'BaseInlineEquationPlugin'],
  'Math rule matches require casts because createRuleFactory loses inference.',
  'Fix CORE-04, then remove the consumer casts.',
  'core'
);
add(
  'TAB-01',
  'P1',
  'tabbable',
  'boundary',
  'wrong-semantic-layer',
  'packages/tabbable/src/lib/BaseTabbablePlugin.ts:51',
  ['BaseTabbablePlugin', 'TabbablePlugin'],
  'The Base plugin is DOM-only and has no headless meaning.',
  'Own it directly as a Plate React plugin.'
);
add(
  'TAB-02',
  'P2',
  'tabbable',
  'react',
  'callback-only-subscription',
  'packages/tabbable/src/react/TabbablePlugin.tsx:1',
  ['TabbablePlugin'],
  'React subscribes only to feed event callbacks.',
  'Read inside the callback.'
);
add(
  'TAG-01',
  'P1',
  'tag',
  'read',
  'stale-read-capture',
  'packages/tag/src/lib/BaseTagPlugin.ts:10',
  ['BaseTagPlugin'],
  'The read stage consumes captured read instead of its supplied state group.',
  'Use the supplied read state.'
);
add(
  'TAG-02',
  'P1',
  'tag',
  'api',
  'same-key-composition',
  'packages/tag/src/react/TagPlugin.tsx:13',
  ['TagPlugin', 'MultiSelectPlugin'],
  'Two React descriptors compose the same key as alternative personalities.',
  'Route through best-api before changing the public shape.',
  'best-api'
);
add(
  'TAG-03',
  'P2',
  'tag',
  'types',
  'unsafe-subtype-cast',
  'packages/tag/src/react/useTag.ts:1',
  ['TagPlugin', 'MultiSelectPlugin'],
  'useTag casts subtype/new-item data instead of narrowing or owning a typed factory.',
  'Narrow honestly and bind the item factory.'
);
add(
  'TOC-01',
  'P1',
  'toc',
  'react',
  'missing-subscription',
  'packages/toc/src/react/useToc.ts:1',
  ['TocPlugin'],
  'Render-affecting state is read through store.get without subscription.',
  'Subscribe through the owning store hook.'
);
add(
  'TOC-02',
  'P3',
  'toc',
  'react',
  'dead-dependency',
  'packages/toc/src/react/useToc.ts:1',
  ['TocPlugin'],
  'The hook family resolves an unused editor dependency.',
  'Delete it.'
);
add(
  'TOGGLE-01',
  'P1',
  'toggle',
  'types',
  'initial-state-satisfies',
  'packages/toggle/src/react/TogglePlugin.tsx:20',
  ['TogglePlugin'],
  'Initial state needs satisfies instead of contextual inference.',
  'Repair the owner generic and remove satisfies.'
);
add(
  'TOGGLE-02',
  'P1',
  'toggle',
  'react',
  'hook-in-plugin',
  'packages/toggle/src/react/TogglePlugin.tsx:36',
  ['TogglePlugin'],
  'The descriptor contains a React hook implementation.',
  'Move it into the Toggle hook family.'
);
add(
  'TOGGLE-03',
  'P1',
  'toggle',
  'react',
  'component-family-colocation',
  'packages/toggle/src/react/TogglePlugin.tsx:1',
  ['TogglePlugin'],
  'Visibility renderer/hook behavior is anonymous inside the plugin file.',
  'Move component and hook families to their semantic files.'
);

// Media, Table, List, and Utils.
add(
  'MEDIA-01',
  'P1',
  'media',
  'kernel',
  'inferred-plugin-factory',
  'packages/media/src/lib/BaseMediaPlugin.ts:99',
  [
    'defineMediaPlugin',
    'BaseAudioPlugin',
    'BaseFilePlugin',
    'BaseVideoPlugin',
    'BaseImagePlugin',
    'BaseMediaEmbedPlugin',
  ],
  'defineMediaPlugin fakes a descriptor contract with __config, extend(...never[]), and double casts.',
  'Repair the Core/shared-factory generic; keep the genuine five-descriptor factory.'
);
add(
  'MEDIA-02',
  'P2',
  'media',
  'state',
  'dead-state-and-dependency',
  'packages/media/src/lib/placeholder/BasePlaceholderPlugin.ts:13',
  ['BasePlaceholderPlugin', 'PlaceholderPlugin'],
  'Placeholder rules/state are unused and media dependencies belong only to the React replacement stage.',
  'Delete dead state and move dependencies to PlaceholderPlugin.'
);
add(
  'MEDIA-03',
  'P2',
  'media',
  'plugin',
  'constructor-ownership',
  'packages/media/src/react/placeholder/PlaceholderPlugin.tsx:226',
  ['PlaceholderPlugin'],
  'The first extend adds independent API/selectors from declared store state.',
  'Fold it into toPlatePlugin; retain later update/handler stages.'
);
add(
  'MEDIA-04',
  'P2',
  'media',
  'types',
  'unbound-contracts',
  'packages/media/src/react/placeholder/PlaceholderPlugin.tsx:121',
  ['PlaceholderPlugin'],
  'PlaceholderApi, Selectors, and Updates are exported but neither bound nor consumed.',
  'Delete or bind one real public capability contract.'
);
add(
  'MEDIA-05',
  'P2',
  'media',
  'topology',
  'single-owner-behavior-file',
  'packages/media/src/migrations/MediaV54Migration.internal.ts:141',
  ['MediaV54MigrationPlugin'],
  'A migration algorithm file has one production caller.',
  'Inline it into MediaV54MigrationPlugin and keep proof with the family.'
);
add(
  'MEDIA-06',
  'P3',
  'media',
  'topology',
  'one-use-constant',
  'packages/media/src/lib/image/BaseImagePlugin.ts:242',
  ['BaseImagePlugin'],
  'imageExtensions is referenced once.',
  'Move it into the extension owner.'
);
add(
  'MEDIA-07',
  'P3',
  'media',
  'topology',
  'one-use-helper',
  'packages/media/src/lib/media-embed/BaseMediaEmbedPlugin.ts:29',
  ['BaseMediaEmbedPlugin'],
  'normalizeMediaEmbedWidth has one codec call.',
  'Inline it into decode.'
);
add(
  'MEDIA-08',
  'P3',
  'media',
  'topology',
  'stage-local-machinery',
  'packages/media/src/react/placeholder/PlaceholderPlugin.tsx:28',
  ['PlaceholderPlugin'],
  'Upload error helpers and regex belong only to the update stage.',
  'Move them into that lexical stage.'
);
add(
  'MEDIA-09',
  'P3',
  'media',
  'topology',
  'taxonomy-directory',
  'packages/media/src/react/placeholder/internal/mimeTypes.ts:1',
  ['PlaceholderPlugin'],
  'A large MIME data bank deserves a file, not a one-file internal directory.',
  'Flatten it beside PlaceholderPlugin.'
);
add(
  'TABLE-01',
  'P1',
  'table',
  'types',
  'fake-mutation-typing',
  'packages/table/src/lib/internal/mutation.ts:519',
  ['BaseTablePlugin'],
  'The mutation subsystem uses repeated double casts and never casts to bypass node/tx typing.',
  'Repair mutable clone and transaction generic owners; keep the independent subsystem.'
);
add(
  'TABLE-02',
  'P2',
  'table',
  'transaction',
  'one-use-tx-wrapper',
  'packages/table/src/lib/internal/paste.ts:848',
  ['BaseTablePlugin'],
  'applyPreparedTablePastePlan has one caller and only forwards a plan plus tx.',
  'Inline it at the BaseTable paste owner.'
);
add(
  'TABLE-03',
  'P2',
  'table',
  'react',
  'scoped-read-bypass',
  'packages/table/src/react/useTableElement.ts:164',
  ['TablePlugin'],
  'React hooks rebuild table selection instead of consuming TablePlugin.read.getSelection.',
  'Use the scoped read in both hook families.'
);
add(
  'TABLE-04',
  'P3',
  'table',
  'types',
  'one-use-input-aliases',
  'packages/table/src/lib/BaseTablePlugin.ts:88',
  ['BaseTablePlugin'],
  'Seven private option aliases each serve one API method.',
  'Inline the method input shapes.'
);
add(
  'TABLE-05',
  'P3',
  'table',
  'topology',
  'one-use-csv-machinery',
  'packages/table/src/lib/BaseTablePlugin.ts:441',
  ['BaseTablePlugin'],
  'CSV regex/escape helper serve only writeSelection.',
  'Move them into writeSelection.'
);
add(
  'TABLE-06',
  'P3',
  'table',
  'topology',
  'context-helper',
  'packages/table/src/lib/BaseTablePlugin.ts:111',
  ['BaseTablePlugin'],
  'clampTableSelection ferries plugin type and command state into one owner.',
  'Move it into the final command extension.'
);
add(
  'TABLE-07',
  'P2',
  'table',
  'test',
  'test-inference-hole',
  'packages/table/src/lib/__tests__/getTestTablePlugins.ts:5',
  [],
  'A shared fixture returns any and masks configured plugin inference.',
  'Make the fixture generic or infer its descriptor result.'
);
add(
  'LIST-01',
  'P2',
  'list',
  'boundary',
  'semantic-react-boundary',
  'packages/list/src/lib/BaseListPlugin.tsx:1',
  ['BaseListPlugin', 'ListPlugin'],
  'The semantic Base plugin imports React/JSX while ListPlugin is an empty adapter.',
  'Move live JSX to ListPlugin and bind static renderers explicitly.'
);
add(
  'LIST-02',
  'P2',
  'list',
  'types',
  'dead-alias',
  'packages/list/src/react/ListPlugin.tsx:5',
  ['ListPlugin'],
  'ListConfig aliases BaseListConfig with no consumer.',
  'Delete it.'
);
add(
  'LIST-03',
  'P3',
  'list',
  'react',
  'editor-plumbing',
  'packages/list/src/react/useTodoListElement.ts:6',
  ['ListPlugin'],
  'One hook returns editor only so another hook can mutate.',
  'Resolve editor in the mutation-owning hook.'
);
add(
  'UTIL-01',
  'P1',
  'utils',
  'react',
  'hook-in-plugin',
  'packages/utils/src/react/plugins/BlockPlaceholderPlugin.tsx:60',
  ['BlockPlaceholderPlugin'],
  'Inline transformProps/useHooks bodies call React hooks and suppress hook lint.',
  'Extract useBlockPlaceholder; move independent contribution into the constructor.'
);
add(
  'UTIL-02',
  'P3',
  'utils',
  'topology',
  'one-use-constant',
  'packages/utils/src/lib/plugins/SingleLinePlugin.ts:6',
  ['SingleLinePlugin'],
  'LINE_BREAK is used once.',
  'Keep it lexical in the correction owner.'
);

const parseTsv = (value) => {
  const [header, ...lines] = value.trimEnd().split('\n');
  const columns = header.split('\t');

  return lines.map((line) =>
    Object.fromEntries(
      line.split('\t').map((cell, index) => [columns[index], cell])
    )
  );
};

const cleanCell = (value) =>
  String(value ?? '')
    .replaceAll('\t', ' ')
    .replaceAll('\r', ' ')
    .replaceAll('\n', ' ');

const toTsv = (rows, columns) =>
  `${[
    columns.join('\t'),
    ...rows.map((row) =>
      columns.map((column) => cleanCell(row[column])).join('\t')
    ),
  ].join('\n')}\n`;

const constructors = parseTsv(
  await readFile(path.join(artifactDir, 'plugin-manifest.tsv'), 'utf8')
);
const adaptations = parseTsv(
  await readFile(
    path.join(artifactDir, 'plugin-adaptation-manifest.tsv'),
    'utf8'
  )
);
const packages = parseTsv(
  await readFile(path.join(artifactDir, 'package-inventory.tsv'), 'utf8')
);

const productionRows = [
  ...constructors
    .filter((row) => row.scope === 'production')
    .map((row) => ({
      ...row,
      base: '',
      expression_kind: 'constructor',
    })),
  ...adaptations
    .filter((row) => row.scope === 'production')
    .map((row) => ({
      ...row,
      constructor: '',
      contribution_fields: '',
      expression_kind: 'adaptation',
      plugin_key: '',
    })),
].sort(
  (left, right) =>
    left.package.localeCompare(right.package) ||
    left.path.localeCompare(right.path) ||
    Number(left.line) - Number(right.line) ||
    left.owner.localeCompare(right.owner)
);

const linkedFindings = (row) =>
  findings.filter(
    (finding) =>
      finding.package === row.package && finding.owners.includes(row.owner)
  );

const packageFindings = new Map(
  packages.map((item) => [
    item.package,
    findings.filter((finding) => finding.package === item.package),
  ])
);

const severityRank = { P0: 0, P1: 1, P2: 2, P3: 3 };
findings.sort(
  (left, right) =>
    severityRank[left.severity] - severityRank[right.severity] ||
    left.package.localeCompare(right.package) ||
    left.id.localeCompare(right.id)
);

const pluginLedger = productionRows.map((row) => {
  const direct = linkedFindings(row);
  const packageLevel = packageFindings.get(row.package) ?? [];
  const expressionVerdict =
    direct.length > 0
      ? 'drift'
      : packageLevel.length > 0
        ? 'expression-clean; package-deferred'
        : 'source-clean';

  return {
    base: row.base,
    builder: row.constructor,
    configure_count: row.configure_count,
    contribution_fields: row.contribution_fields,
    evidence:
      direct.length > 0
        ? direct.map((finding) => finding.id).join(',')
        : packageLevel.length > 0
          ? 'manual source review; package findings are outside this expression'
          : 'manual source review; no v18 drift found',
    exported: row.exported,
    expression_kind: row.expression_kind,
    extend_count: row.extend_count,
    finding_ids: direct.map((finding) => finding.id).join(','),
    id: row.id,
    line: row.line,
    next:
      direct.length > 0
        ? 'repair linked findings; prove inference/behavior'
        : packageLevel.length > 0
          ? 'keep expression; re-audit after package repair'
          : 'keep',
    owner: row.owner,
    package: row.package,
    path: row.path,
    plugin_key: row.plugin_key,
    verdict: expressionVerdict,
  };
});

const packageLedger = packages.map((row) => {
  const primary = pluginLedger.filter((item) => item.package === row.package);
  const matches = packageFindings.get(row.package) ?? [];
  const counts = Object.fromEntries(
    ['P0', 'P1', 'P2', 'P3'].map((severity) => [
      severity,
      matches.filter((finding) => finding.severity === severity).length,
    ])
  );
  const verdict =
    primary.length === 0
      ? 'no-live-plugin-owner'
      : counts.P0 > 0
        ? 'blocked-P0'
        : counts.P1 > 0
          ? 'blocked-P1'
          : counts.P2 > 0
            ? 'repair-P2'
            : counts.P3 > 0
              ? 'repair-P3'
              : 'source-clean';

  return {
    direct_drift_expressions: primary.filter((item) => item.verdict === 'drift')
      .length,
    exported_live_symbols: new Set(
      primary
        .filter(
          (item) =>
            item.exported === 'yes' &&
            EXPORTED_PLUGIN_SYMBOL_PATTERN.test(item.owner)
        )
        .map((item) => `${item.path}:${item.owner}`)
    ).size,
    finding_ids: matches.map((finding) => finding.id).join(','),
    findings_p0: counts.P0,
    findings_p1: counts.P1,
    findings_p2: counts.P2,
    findings_p3: counts.P3,
    next:
      primary.length === 0
        ? 'none; package is substrate/support/tooling for this audit'
        : matches.length > 0
          ? 'repair by priority; do not attest v18 before proof'
          : 'retain; focused proof before v18 attestation',
    package: row.package,
    primary_expressions: primary.length,
    production_constructor_calls: row.production_plugin_calls,
    production_plugin_adaptations: row.production_plugin_adaptations,
    source_files: row.source_files,
    test_only_expressions:
      Number(row.test_plugin_calls) + Number(row.test_plugin_adaptations),
    verdict,
  };
});

const findingColumns = [
  'id',
  'severity',
  'package',
  'scope',
  'category',
  'path',
  'line',
  'owners',
  'finding',
  'decision',
  'next',
];
await writeFile(
  path.join(artifactDir, 'audit-findings.tsv'),
  toTsv(
    findings.map((finding) => ({
      ...finding,
      owners: finding.owners.join(','),
    })),
    findingColumns
  )
);

const pluginColumns = [
  'id',
  'package',
  'expression_kind',
  'path',
  'line',
  'owner',
  'builder',
  'base',
  'exported',
  'extend_count',
  'configure_count',
  'plugin_key',
  'contribution_fields',
  'verdict',
  'finding_ids',
  'evidence',
  'next',
];
await writeFile(
  path.join(artifactDir, 'plugin-review-ledger.tsv'),
  toTsv(pluginLedger, pluginColumns)
);

const packageColumns = [
  'package',
  'source_files',
  'primary_expressions',
  'exported_live_symbols',
  'production_constructor_calls',
  'production_plugin_adaptations',
  'test_only_expressions',
  'direct_drift_expressions',
  'findings_p0',
  'findings_p1',
  'findings_p2',
  'findings_p3',
  'verdict',
  'finding_ids',
  'next',
];
await writeFile(
  path.join(artifactDir, 'package-review-ledger.tsv'),
  toTsv(packageLedger, packageColumns)
);

const severityCounts = Object.fromEntries(
  ['P0', 'P1', 'P2', 'P3'].map((severity) => [
    severity,
    findings.filter((finding) => finding.severity === severity).length,
  ])
);
const summary = {
  directDriftExpressions: pluginLedger.filter((row) => row.verdict === 'drift')
    .length,
  exportedLiveSymbols: new Set(
    productionRows
      .filter(
        (row) =>
          row.exported === 'yes' &&
          EXPORTED_PLUGIN_SYMBOL_PATTERN.test(row.owner)
      )
      .map((row) => `${row.path}:${row.owner}`)
  ).size,
  findings: findings.length,
  packageCount: packageLedger.length,
  packageVerdicts: Object.fromEntries(
    [...new Set(packageLedger.map((row) => row.verdict))]
      .sort()
      .map((verdict) => [
        verdict,
        packageLedger.filter((row) => row.verdict === verdict).length,
      ])
  ),
  pluginBearingPackages: packageLedger.filter(
    (row) => row.primary_expressions > 0
  ).length,
  primaryExpressions: pluginLedger.length,
  severityCounts,
  sourceFiles: packageLedger.reduce(
    (total, row) => total + Number(row.source_files),
    0
  ),
  testOnlyExpressions: packageLedger.reduce(
    (total, row) => total + Number(row.test_only_expressions),
    0
  ),
};
await writeFile(
  path.join(artifactDir, 'audit-summary.json'),
  `${JSON.stringify(summary, null, 2)}\n`
);

const markdownEscape = (value) => String(value).replaceAll('|', '\\|');
const report = `# Plate Next v18 all-package plugin audit

## Verdict

No: the package plugins do not all follow Plate Next v18. The constructor chains
are usually recognizable, but Core inference, capability ownership, active
transaction use, React family ownership, and one-owner topology still drift.

## Exact coverage

- ${summary.packageCount} workspace packages; ${summary.pluginBearingPackages} plugin-bearing.
- ${summary.sourceFiles.toLocaleString('en-US')} package source files inventoried.
- ${summary.primaryExpressions} primary production expressions: 189 constructors and 6 pure adaptations.
- ${summary.exportedLiveSymbols} exported live plugin symbols covered; zero missing.
- ${summary.testOnlyExpressions.toLocaleString('en-US')} test-only expressions classified separately.
- ${summary.findings} findings: ${severityCounts.P0} P0, ${severityCounts.P1} P1, ${severityCounts.P2} P2, ${severityCounts.P3} P3.
- ${summary.directDriftExpressions} primary expressions have directly linked drift; clean rows in a drifting package remain deferred rather than falsely attested.

## Repair order

1. Core type kernel, builder inference, and honest optional-plugin lookup.
2. Media shared-factory inference and Selection's transaction/weak-peer/hook ownership.
3. Suggestion nullability, Link and Markdown capability ownership, AI/Table fake casts, and Legacy list model stale capability capture.
4. Hook/component families in DnD, Toggle, Utils, Selection, Core EventEditor, and package-specific React ownership.
5. P2/P3 one-owner helpers, taxonomy directories, dead aliases, tests, and constants.

## Package verdicts

| Package | Primary | Direct drift | P0 | P1 | P2 | P3 | Verdict |
|---|---:|---:|---:|---:|---:|---:|---|
${packageLedger
  .map(
    (row) =>
      `| ${row.package} | ${row.primary_expressions} | ${row.direct_drift_expressions} | ${row.findings_p0} | ${row.findings_p1} | ${row.findings_p2} | ${row.findings_p3} | ${row.verdict} |`
  )
  .join('\n')}

## Findings

| ID | Priority | Package | Rule | Anchor | Finding | Decision |
|---|---|---|---|---|---|---|
${findings
  .map(
    (finding) =>
      `| ${finding.id} | ${finding.severity} | ${finding.package} | ${finding.category} | \`${finding.anchor}\` | ${markdownEscape(finding.finding)} | ${finding.decision}: ${markdownEscape(finding.next)} |`
  )
  .join('\n')}

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
attestation claim. No file under \`packages/**/src\` was changed.
`;
await writeFile(path.join(artifactDir, 'audit-report.md'), report);

const linkedIds = new Set(
  pluginLedger.flatMap((row) => row.finding_ids.split(',').filter(Boolean))
);
const unlinkedFindings = findings.filter(
  (finding) => !linkedIds.has(finding.id)
);
const duplicateFindingIds = findings
  .map((finding) => finding.id)
  .filter((id, index, ids) => ids.indexOf(id) !== index);
const rowsMissingEvidence = pluginLedger
  .filter((row) => !row.evidence || !row.next || !row.verdict)
  .map((row) => row.id);
const unexpectedUnlinkedFindingIds = unlinkedFindings
  .filter((finding) => !['kernel', 'test', 'topology'].includes(finding.scope))
  .map((finding) => finding.id);
const manifestVerification = JSON.parse(
  await readFile(path.join(artifactDir, 'manifest-verification.json'), 'utf8')
);
const auditVerification = {
  ...summary,
  duplicateFindingIds: [...new Set(duplicateFindingIds)],
  expectedPackageRows: packages.length,
  expectedPluginRows:
    constructors.filter((row) => row.scope === 'production').length +
    adaptations.filter((row) => row.scope === 'production').length,
  manifestExportedLiveSymbols: manifestVerification.exportedPluginSymbols,
  packageRows: packageLedger.length,
  pluginRows: pluginLedger.length,
  rowsMissingEvidence,
  unexpectedUnlinkedFindingIds,
  unlinkedFindingIds: unlinkedFindings.map((finding) => finding.id),
};

await writeFile(
  path.join(artifactDir, 'audit-verification.json'),
  `${JSON.stringify(auditVerification, null, 2)}\n`
);
console.log(JSON.stringify(auditVerification, null, 2));

if (
  auditVerification.duplicateFindingIds.length > 0 ||
  auditVerification.expectedPackageRows !== auditVerification.packageRows ||
  auditVerification.expectedPluginRows !== auditVerification.pluginRows ||
  auditVerification.exportedLiveSymbols !==
    auditVerification.manifestExportedLiveSymbols ||
  auditVerification.rowsMissingEvidence.length > 0 ||
  auditVerification.unexpectedUnlinkedFindingIds.length > 0
) {
  process.exitCode = 1;
}
