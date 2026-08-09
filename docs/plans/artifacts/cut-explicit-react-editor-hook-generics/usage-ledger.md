# Explicit React editor-hook generic usage ledger

Initial audit query:

```sh
rg -n -P '\buseEditor\s*<' packages apps content \
  --glob '*.{ts,tsx,mdx}' \
  --glob '!**/dist/**' \
  --glob '!apps/www/src/__registry__/**' \
  --glob '!apps/www/public/**' \
  --glob '!templates/**'
```

- Initial authored matches: **72**
- Docs: **2**
- Core owner/proof: **5**
- Link: **1**
- Plite React owner/proof: **16**
- Plite examples: **20**
- Registry consumers: **28**
- Resolution: **72 cut, 0 deferred**

| Location | Class | Resolution | Initial source |
|---|---|---|---|
| `content/docs/(guides)/editor.cn.mdx:436` | docs teaching | cut | `export const useMyEditor = () => useEditor<MyEditor>();` |
| `content/docs/(guides)/editor.mdx:462` | docs teaching | cut | `export const useMyEditor = () => useEditor<MyEditor>();` |
| `apps/www/src/app/(app)/examples/plite/_examples/document-state.tsx:102` | Plite example consumer | cut | `const editor = useEditor<DocumentStateEditor>();` |
| `apps/www/src/app/(app)/examples/plite/_examples/images.tsx:224` | Plite example consumer | cut | `const editor = useEditor<CustomEditor>();` |
| `apps/www/src/app/(app)/examples/plite/_examples/images.tsx:266` | Plite example consumer | cut | `const editor = useEditor<CustomEditor>();` |
| `apps/www/src/app/(app)/examples/plite/_examples/hovering-toolbar.tsx:94` | Plite example consumer | cut | `const editor = useEditor<CustomEditor>();` |
| `apps/www/src/app/(app)/examples/plite/_examples/hovering-toolbar.tsx:171` | Plite example consumer | cut | `const editor = useEditor<CustomEditor>();` |
| `apps/www/src/app/(app)/examples/plite/_examples/editable-voids.tsx:233` | Plite example consumer | cut | `const editor = useEditor<CustomEditor>();` |
| `apps/www/src/app/(app)/examples/plite/_examples/check-lists.tsx:157` | Plite example consumer | cut | `const editor = useEditor<CustomEditor>();` |
| `apps/www/src/app/(app)/examples/plite/_examples/code-highlighting.tsx:155` | Plite example consumer | cut | `const editor = useEditor<CustomEditor>();` |
| `apps/www/src/app/(app)/examples/plite/_examples/code-highlighting.tsx:224` | Plite example consumer | cut | `const editor = useEditor<CustomEditor>();` |
| `apps/www/src/app/(app)/examples/plite/_examples/iframe.tsx:134` | Plite example consumer | cut | `const editor = useEditor<CustomEditor>();` |
| `apps/www/src/app/(app)/examples/plite/_examples/synced-blocks.tsx:182` | Plite example consumer | cut | `const editor = useEditor<CustomEditor>();` |
| `apps/www/src/app/(app)/examples/plite/_examples/synced-blocks.tsx:266` | Plite example consumer | cut | `const editor = useEditor<CustomEditor>();` |
| `apps/www/src/app/(app)/examples/plite/_examples/inlines.tsx:523` | Plite example consumer | cut | `const editor = useEditor<CustomEditor>();` |
| `apps/www/src/app/(app)/examples/plite/_examples/inlines.tsx:546` | Plite example consumer | cut | `const editor = useEditor<CustomEditor>();` |
| `apps/www/src/app/(app)/examples/plite/_examples/inlines.tsx:567` | Plite example consumer | cut | `const editor = useEditor<CustomEditor>();` |
| `apps/www/src/app/(app)/examples/plite/_examples/richtext.tsx:611` | Plite example consumer | cut | `const editor = useEditor<RichTextEditor>();` |
| `apps/www/src/app/(app)/examples/plite/_examples/richtext.tsx:631` | Plite example consumer | cut | `const editor = useEditor<RichTextEditor>();` |
| `apps/www/src/app/(app)/examples/plite/_examples/richtext.tsx:653` | Plite example consumer | cut | `const editor = useEditor<RichTextEditor>();` |
| `apps/www/src/app/(app)/examples/plite/_examples/embeds.tsx:93` | Plite example consumer | cut | `const editor = useEditor<CustomEditor>();` |
| `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx:1549` | Plite example consumer | cut | `const editor = useEditor<CustomEditor>();` |
| `apps/www/src/registry/ui/media-image-node.tsx:30` | registry consumer | cut | `const editor = useEditor<PlateEditor<readonly [typeof ImagePlugin]>>();` |
| `apps/www/src/registry/ui/table-toolbar-button.tsx:48` | registry consumer | cut | `const editor = useEditor<PlateEditor<readonly [typeof TablePlugin]>>();` |
| `apps/www/src/registry/ui/table-toolbar-button.tsx:237` | registry consumer | cut | `const editor = useEditor<PlateEditor<readonly [typeof TablePlugin]>>();` |
| `apps/www/src/registry/ui/ai-menu.tsx:68` | registry consumer | cut | `const editor = useEditor<AIMenuEditor>();` |
| `apps/www/src/registry/ui/ai-menu.tsx:610` | registry consumer | cut | `const editor = useEditor<PlateEditor>();` |
| `apps/www/src/registry/ui/ai-menu.tsx:657` | registry consumer | cut | `const editor = useEditor<AIMenuEditor>();` |
| `apps/www/src/registry/ui/footnote-node.tsx:107` | registry consumer | cut | `const editor = useEditor<FootnoteEditor>();` |
| `apps/www/src/registry/ui/footnote-node.tsx:228` | registry consumer | cut | `const editor = useEditor<FootnoteEditor>();` |
| `apps/www/src/registry/ui/footnote-node.tsx:394` | registry consumer | cut | `const editor = useEditor<FootnoteEditor>();` |
| `apps/www/src/registry/ui/media-video-node.tsx:39` | registry consumer | cut | `const editor = useEditor<PlateEditor<readonly [typeof VideoPlugin]>>();` |
| `apps/www/src/registry/ui/media-placeholder-node.tsx:64` | registry consumer | cut | `useEditor<PlateEditor<readonly [typeof PlaceholderPlugin]>>();` |
| `apps/www/src/registry/ui/media-embed-node.tsx:40` | registry consumer | cut | `const editor = useEditor<PlateEditor<readonly [typeof MediaEmbedPlugin]>>();` |
| `apps/www/src/registry/ui/import-toolbar-button.tsx:27` | registry consumer | cut | `useEditor<` |
| `apps/www/src/registry/ui/align-toolbar-button.tsx:51` | registry consumer | cut | `const editor = useEditor<PlateEditor<readonly [typeof TextAlignPlugin]>>();` |
| `apps/www/src/registry/ui/font-size-toolbar-button.tsx:49` | registry consumer | cut | `const editor = useEditor<PlateEditor<readonly [typeof FontSizePlugin]>>();` |
| `apps/www/src/registry/ui/table-node.tsx:187` | registry consumer | cut | `const editor = useEditor<TableNodeEditor>();` |
| `apps/www/src/registry/ui/table-node.tsx:888` | registry consumer | cut | `const editor = useEditor<TableNodeEditor>();` |
| `apps/www/src/registry/ui/table-node.tsx:911` | registry consumer | cut | `const editor = useEditor<TableNodeEditor>();` |
| `apps/www/src/registry/ui/table-node.tsx:1101` | registry consumer | cut | `const editor = useEditor<TableNodeEditor>();` |
| `apps/www/src/registry/ui/table-node.tsx:1184` | registry consumer | cut | `const editor = useEditor<TableNodeEditor>();` |
| `apps/www/src/registry/ui/table-node.tsx:1315` | registry consumer | cut | `const editor = useEditor<TableNodeEditor>();` |
| `apps/www/src/registry/ui/table-node.tsx:1333` | registry consumer | cut | `const editor = useEditor<TableNodeEditor>();` |
| `apps/www/src/registry/ui/export-toolbar-button.tsx:30` | registry consumer | cut | `const editor = useEditor<PlateEditor<readonly [typeof MarkdownPlugin]>>();` |
| `apps/www/src/registry/ui/line-height-toolbar-button.tsx:27` | registry consumer | cut | `const editor = useEditor<PlateEditor<readonly [typeof LineHeightPlugin]>>();` |
| `apps/www/src/registry/ui/block-suggestion.tsx:31` | registry consumer | cut | `const editor = useEditor<PlateEditor<readonly [typeof SuggestionPlugin]>>();` |
| `apps/www/src/registry/ui/block-context-menu.tsx:36` | registry consumer | cut | `useEditor<` |
| `apps/www/src/registry/examples/find-replace-demo.tsx:23` | registry consumer | cut | `const editor = useEditor<MyEditor>();` |
| `apps/www/src/registry/components/editor/use-chat.ts:218` | registry consumer | cut | `const editor = useEditor<ChatEditor>();` |
| `packages/plite-react/src/hooks/use-state-field.ts:68` | Plite React owner/proof | cut | `const editor = useEditor<TEditor>();` |
| `packages/plite-react/src/hooks/android-input-manager/use-android-input-manager.ts:72` | Plite React owner/proof | cut | `const editor = useEditor<ReactRuntimeEditor>();` |
| `packages/plite-react/src/hooks/use-node-selector.tsx:132` | Plite React owner/proof | cut | `const editor = useEditor<ReactRuntimeEditor>();` |
| `packages/plite-react/src/hooks/use-editor-selector.tsx:119` | Plite React owner/proof | cut | `const editor = useEditor<TEditor>();` |
| `packages/link/src/react/useFloatingLink.ts:297` | Link consumer | cut | `const editor = useEditor<PlateEditor<readonly [typeof LinkPlugin]>>();` |
| `packages/plite-react/src/components/editable-rendered-element.tsx:64` | Plite React owner/proof | cut | `const editor = useEditor<ReactRuntimeEditor>();` |
| `packages/plite-react/src/components/editable-text-blocks.tsx:380` | Plite React owner/proof | cut | `const ownerEditor = useEditor<ReactRuntimeEditor>();` |
| `packages/plite-react/src/components/editable-text-blocks.tsx:436` | Plite React owner/proof | cut | `const editor = useEditor<ReactRuntimeEditor>();` |
| `packages/plite-react/src/components/editable.tsx:404` | Plite React owner/proof | cut | `const editor = useEditor<ReactRuntimeEditor>();` |
| `packages/plite-react/src/editable/root-selector-sources.ts:200` | Plite React owner/proof | cut | `const editor = useEditor<ReactRuntimeEditor>();` |
| `packages/plite-react/src/editable/root-selector-sources.ts:220` | Plite React owner/proof | cut | `const editor = useEditor<ReactRuntimeEditor>();` |
| `packages/plite-react/src/editable/root-selector-sources.ts:253` | Plite React owner/proof | cut | `const editor = useEditor<ReactRuntimeEditor>();` |
| `packages/plite-react/src/editable/root-selector-sources.ts:303` | Plite React owner/proof | cut | `const editor = useEditor<ReactRuntimeEditor>();` |
| `packages/plite-react/src/editable/root-selector-sources.ts:335` | Plite React owner/proof | cut | `const editor = useEditor<ReactRuntimeEditor>();` |
| `packages/plite-react/src/editable/root-selector-sources.ts:364` | Plite React owner/proof | cut | `const editor = useEditor<ReactRuntimeEditor>();` |
| `packages/plite-react/test/provider-hooks-contract.tsx:177` | Plite React owner/proof | cut | `const mountedEditor = useEditor<typeof editor>();` |
| `packages/plite-react/test/provider-hooks-contract.tsx:454` | Plite React owner/proof | cut | `const mountedEditor = useEditor<typeof editor>();` |
| `packages/core/src/react/stores/plate/createPlateStore.spec.tsx:142` | Core hook owner/proof | cut | `editor: useEditor<PlateEditor>({ id: 'runtime' }),` |
| `packages/core/src/react/stores/plate/useEditorSelector.ts:25` | Core hook owner/proof | cut | `const editor = useEditor<E>({ id });` |
| `packages/core/src/react/stores/plate/createPlateStore.ts:217` | Core hook owner/proof | cut | `export function useEditor<E>(` |
| `packages/core/src/react/stores/plate/createPlateStore.ts:223` | Core hook owner/proof | cut | `export function useEditor<E = PlateEditor>({` |
| `packages/core/type-tests/editor-default-boundary-contracts.ts:84` | Core hook owner/proof | cut | `type ExactUseEditor = typeof useEditor<ExactInternalPlateEditor>;` |

## Related selector-carrier audit

Exact editor annotations used to refine a context selector were also cut from:

- `apps/www/src/app/(app)/examples/plite/_examples/hovering-toolbar.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/iframe.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/inlines.tsx` (two calls)
- `packages/plite-react/test/generic-react-editor-contract.tsx`

Internal Plite React selector callbacks may still name `ReactRuntimeEditor`
when that private runtime is the actual provider contract. They do not refine
an installed feature graph.

## Justified generic survivors

| Surface | Decision | Type correlation |
|---|---|---|
| `usePlateEditor` / `usePliteEditor` | keep | Typed constructor options and initial value create the returned editor. |
| `useEditorRuntimeState` / `useEditorViewState` | keep | An explicit editor argument correlates the selector and result. |
| `useEditorPlugin` / `useEditorPluginStore` / `useElement` | keep | An explicit descriptor argument correlates exact plugin or node capabilities. |
| `useEditorSelector<T>` / `useEditorState<T>` | keep result generic only | The generic is the selected result, never an editor refinement. |

## Final invariant

`useEditor()` and `useActiveEditor()` accept no type argument. They return
the guaranteed mounted layer editor. Exact feature capabilities come from
`editor.plugin(Plugin)`, `useEditorPlugin(Plugin)`, or
`editor.extension(Extension)`.

