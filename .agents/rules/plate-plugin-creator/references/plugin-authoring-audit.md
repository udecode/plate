# Plugin Authoring Audit

Use these as bounded examples, never as whole-file authority. Core builders,
type tests, and this skill outrank package precedent.

## Contents

- Semantic base and wrapper
- Base-only plugin
- Direct React plugin
- Owner-first production colocation
- React family colocation
- Scoped capabilities and state
- Rejected precedent

## Semantic Base And Thin Wrapper

- [BaseCommentPlugin.ts](../../../../packages/comment/src/lib/BaseCommentPlugin.ts)
- [CommentPlugin.tsx](../../../../packages/comment/src/react/CommentPlugin.tsx)
- [BaseCodeBlockPlugin.ts](../../../../packages/code-block/src/lib/BaseCodeBlockPlugin.ts)
- [CodeBlockPlugin.tsx](../../../../packages/code-block/src/react/CodeBlockPlugin.tsx)

Copy:

- document semantics remain in `src/lib`;
- Plate wrappers add only real React/Plate wiring;
- explicit contract types exist only where the public contract is meaningful.

Do not infer that every base plugin needs a React wrapper.

## Base-Only Plugin

- [HtmlPlugin.ts](../../../../packages/core/src/lib/plugins/html/HtmlPlugin.ts)
- [MarkdownPlugin.ts](../../../../packages/markdown/src/lib/MarkdownPlugin.ts)
- [CsvPlugin.ts](../../../../packages/csv/src/lib/CsvPlugin.ts)

Copy:

- no fake React layer;
- semantic ownership is direct;
- parsers/codecs and their API remain with the semantic owner.

## Direct React Plugin

- [EventEditorPlugin.ts](../../../../packages/core/src/react/plugins/event-editor/EventEditorPlugin.ts)
- [CopilotPlugin.tsx](../../../../packages/ai/src/react/CopilotPlugin.tsx)
- [BlockSelectionPlugin.tsx](../../../../packages/selection/src/react/BlockSelectionPlugin.tsx)

Copy direct `createPlatePlugin` only when the behavior is genuinely hook,
DOM/editor-surface, or React-native. Do not copy explicit types or file
topology without checking current owner law.

## Owner-First Production Colocation

- [BaseSuggestionPlugin.ts](../../../../packages/suggestion/src/lib/BaseSuggestionPlugin.ts)
- [BaseTablePlugin.ts](../../../../packages/table/src/lib/BaseTablePlugin.ts)
- [BaseMediaEmbedPlugin.ts](../../../../packages/media/src/lib/media-embed/BaseMediaEmbedPlugin.ts)
- [BasePlaceholderPlugin.ts](../../../../packages/media/src/lib/placeholder/BasePlaceholderPlugin.ts)

Copy:

- one semantic plugin file owns related queries, transforms, initial state,
  selectors, APIs, reads, updates, normalizers, and corrections;
- file size is not a split signal;
- callers use scoped plugin APIs/updates instead of parallel helper exports.

These are topology examples, not permission to copy every local declaration.
Keep new one-use constants, callbacks, and contract fragments inline when
builder inference can own them.

## React Family Colocation

- [FloatingLink.tsx](../../../../packages/link/src/react/FloatingLink.tsx)
- [useFloatingLink.ts](../../../../packages/link/src/react/useFloatingLink.ts)

Copy:

- one component-family file owns the main component, subcomponents, variants,
  render helpers, and component-local constants;
- one hook-family file owns every related public and private hook, including
  subcomponent-only hooks;
- providers and stores remain separate only for independently owned state or
  lifecycle;
- app wrappers composing that family do not establish another source owner.

Do not copy an editor-accepting helper signature from a family file when plugin
builder context or a scoped API can own the behavior.

## Scoped Capabilities And State

- [MarkdownPlugin.ts](../../../../packages/markdown/src/lib/MarkdownPlugin.ts)
- [BaseTablePlugin.ts](../../../../packages/table/src/lib/BaseTablePlugin.ts)

Copy:

- plugin defaults use `initialState`, live values use the scoped `store`, and
  pure store projections use `selectors`;
- document queries use pure snapshot-bound `read`, document mutation uses
  transaction-bound `update`, non-snapshot plugin services use `api`, and
  Plite-native capabilities stay flat on the plugin root;
- independent contributions stay in the constructor; repeated `.extend()`
  stages require imported/prebuilt adaptation, a constructor-inaccessible
  shared factory, or a real earlier-capability type dependency;
- codec owners destructure `defineCodecs` inline, use
  `defineCodecs(map)` for self/product maps, and use
  `defineCodecs(TargetPlugin, map)` for foreign maps without manual targets;
- Plate authoring objects and callback returns stay plain; context capture
  stays inline, extracted helpers receive domain inputs, and independently
  reusable standalone descriptors use Plite `defineEditorExtension`;
- concrete editors expose `editor.api.<pluginName>`;
- generic package code can use `editor.plugin(Plugin).api`, `.read`, `.update`,
  and `.store`;
- optional generic integrations check `.installed` before any other portal
  access;
- copied registry UI stays generic and never imports a host editor type;
- scoped portal methods use direct verbs instead of repeating the plugin noun.

## React-Only Prop Augmentation

- [BlockSelectionPlugin.tsx](../../../../packages/selection/src/react/BlockSelectionPlugin.tsx)
- [NavigationFeedbackPlugin.ts](../../../../packages/core/src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.ts)

Copy `inject.nodeProps.transformProps` when the exact job is hook-driven prop
augmentation of an already-rendered node. It does not replace components,
render behavior, wrappers, or `useHooks`.

## Rejected Precedent

Do not copy a current or historical file merely because it compiles.

Reject:

- private code defaulted into `internal/`;
- one file per helper, query, transform, subcomponent, hook, or API method;
- explicit plugin export types or casts;
- empty `PluginConfig` aliases;
- manual callback/local/test annotations hiding weak inference;
- editor-locked helpers created only to carry `editor`, resolved `type`,
  `store`, resolved plugin state, or `tx`;
- top-level Plate plugin `config`;
- deleted option accessors or arbitrary plugin fields on the editor root;
- duplicate plugin API and editor-extension API implementations;
- redundant portal nesting such as `table.update.insert.table`;
- direct public `render.node` assignment instead of root `component`;
- direct codec maps, manual codec `target` fields, or a global codec helper
  instead of the callback's context-bound `defineCodecs`;
- `editor.update.*` inside an active transaction;
- broad normalization without a named invariant;
- render subscriptions used only by later callbacks;
- compatibility aliases and forwarding wrappers after owner colocation.

When an example conflicts with these laws, repair the builder/source owner or
choose a cleaner example. “Older style” is not a waiver.
