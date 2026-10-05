# Plugin Authoring Audit

Use these as bounded examples, never as whole-file authority. Plate foundation builders,
type tests, and this skill outrank package precedent.

## Contents

- Semantic base and wrapper
- Base-only plugin
- Direct React plugin
- Owner-first production colocation
- React family colocation
- Scoped capabilities and state
- Rendered prop augmentation

## Semantic Base And Thin Wrapper

- [BaseCodeBlockPlugin.ts](../../../../packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts)
- [CodeBlockPlugin.tsx](../../../../packages/platejs/src/react/features/code-block/CodeBlockPlugin.tsx)

Copy:

- document semantics remain in `src/lib`;
- Plate wrappers add only real React/Plate wiring;
- explicit contract types exist only where the public contract is meaningful.

Do not infer that every base plugin needs a React wrapper.

## Base-Only Plugin

- [HtmlPlugin.ts](../../../../packages/platejs/src/lib/plugins/html/HtmlPlugin.ts)
- [MarkdownPlugin.ts](../../../../packages/platejs/src/markdown/lib/MarkdownPlugin.ts)
- [CsvPlugin.ts](../../../../packages/platejs/src/csv/lib/CsvPlugin.ts)

Copy:

- no fake React layer;
- semantic ownership is direct;
- parsers/mappings and their API remain with the semantic owner; whole-payload
  MIME negotiation uses root `dataTransferFormats`.

## Direct React Plugin

- [CopilotPlugin.tsx](../../../../packages/platejs/src/ai/react/CopilotPlugin.tsx)

Copy direct `definePlugin` only when the behavior is genuinely hook,
DOM/editor-surface, or React-native. Do not copy explicit types or file
topology without checking current owner law.

## Neutral Substrate And Plate Adapter

- [plugin.ts](../../../../packages/plitejs/src/yjs/core/plugin.ts)
- [YjsPlugin.tsx](../../../../packages/platejs/src/yjs/react/YjsPlugin.tsx)

Comments uses [BaseCommentsPlugin.ts](../../../../packages/platejs/src/features/comments/BaseCommentsPlugin.ts)
for records, actions and native ranges. Its React adapter adds click and shortcut
behavior. Applications configure complete records and persist mapped range
snapshots; copied UI does not bind native handles or provide another data owner.

## Owner-First Production Colocation

- [BaseSuggestionPlugin.ts](../../../../packages/platejs/src/features/suggestion/BaseSuggestionPlugin.ts)
- [BaseTablePlugin.ts](../../../../packages/platejs/src/features/table/lib/BaseTablePlugin.ts)
- [BaseMediaEmbedPlugin.ts](../../../../packages/platejs/src/features/media/lib/media-embed/BaseMediaEmbedPlugin.ts)

Copy:

- one semantic plugin file owns related queries, transforms, initial state,
  selectors, APIs, reads, updates, normalizers, and corrections;
- file size is not a split signal;
- callers use scoped plugin APIs/updates instead of parallel helper exports.

These are topology examples, not permission to copy every local declaration.
Keep new one-use constants, callbacks, and contract fragments inline when
builder inference can own them.

## Scoped Capabilities And State

- [MarkdownPlugin.ts](../../../../packages/platejs/src/markdown/lib/MarkdownPlugin.ts)
- [BaseTablePlugin.ts](../../../../packages/platejs/src/features/table/lib/BaseTablePlugin.ts)

Copy their scoped `initialState`, `store`, `selectors`, `read`, `update` and `api`
split and their portal access, which `docs/vision/plate.md` defines.

## Rendered Prop Augmentation

- [BlockPlaceholderPlugin.tsx](../../../../packages/platejs/src/react/utils/BlockPlaceholderPlugin.tsx)
- [NavigationFeedbackPlugin.ts](../../../../packages/platejs/src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.ts)

Their `inject.nodeProps` and `render.useViewElementAttributes` rules are in
`docs/vision/plate.md`.
