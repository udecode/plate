# KEYS Migration Progress - Documentation Files

## Completed Files:

✅ /Users/zbeyens/GitHub/udecode/plate/docs/api/core/plate-controller.cn.mdx
118,36: activeEditor.tf.toggleMark(BoldPlugin.key);
145,36: activeEditor.tf.toggleMark(BoldPlugin.key);

✅ /Users/zbeyens/GitHub/udecode/plate/docs/api/core/plate-controller.mdx
118,36: activeEditor.tf.toggleMark(BoldPlugin.key);
145,36: activeEditor.tf.toggleMark(BoldPlugin.key);

✅ /Users/zbeyens/GitHub/udecode/plate/docs/api/core/plate-plugin.cn.mdx
70,23: - **默认值:** `[ParagraphPlugin.key]`

✅ /Users/zbeyens/GitHub/udecode/plate/docs/api/core/plate-plugin.mdx
70,27: - **Default:** `[ParagraphPlugin.key]`

✅ /Users/zbeyens/GitHub/udecode/plate/docs/ai.cn.mdx
81,26: BaseParagraphPlugin.key,
83,27: BaseBlockquotePlugin.key,
84,26: BaseCodeBlockPlugin.key,

✅ /Users/zbeyens/GitHub/udecode/plate/docs/ai.mdx
81,26: BaseParagraphPlugin.key,
83,27: BaseBlockquotePlugin.key,
84,26: BaseCodeBlockPlugin.key,

✅ /Users/zbeyens/GitHub/udecode/plate/docs/alignment.mdx
38,20: ParagraphPlugin.key,
39,18: HeadingPlugin.key,

✅ /Users/zbeyens/GitHub/udecode/plate/docs/block-placeholder.mdx
38,34: - Setting `placeholders[ParagraphPlugin.key]` to `'Type something...'` shows this text in empty paragraph blocks
50,17: [ParagraphPlugin.key]: 'Type something...',
51,15: [HeadingPlugin.key]: 'Enter heading...',
52,18: [BlockquotePlugin.key]: 'Enter quote...',
53,17: [CodeBlockPlugin.key]: 'Enter code...',
77,33: - **Default:** `{ [ParagraphPlugin.key]: 'Type something...' }`

✅ /Users/zbeyens/GitHub/udecode/plate/docs/callout.cn.mdx
40,11: [CalloutPlugin.key]: CalloutElement,

✅ /Users/zbeyens/GitHub/udecode/plate/docs/callout.mdx
40,11: [CalloutPlugin.key]: CalloutElement,

✅ /Users/zbeyens/GitHub/udecode/plate/docs/combobox.cn.mdx
55,26: type: ComboboxInputPlugin.key,

✅ /Users/zbeyens/GitHub/udecode/plate/docs/combobox.mdx
52,26: type: ComboboxInputPlugin.key,

✅ /Users/zbeyens/GitHub/udecode/plate/docs/editor.cn.mdx
118,17: [ParagraphPlugin.key]: CustomParagraphComponent,
119,15: [HeadingPlugin.key]: CustomHeadingComponent,
134,17: [ParagraphPlugin.key]: {
153,15: [HistoryPlugin.key]: false,
217,25: type: typeof ParagraphPlugin.key;
222,21: type: typeof ImagePlugin.key;

✅ /Users/zbeyens/GitHub/udecode/plate/docs/editor.mdx
163,15: [ParagraphPlugin.key]: CustomParagraphComponent,
164,13: [HeadingPlugin.key]: CustomHeadingComponent,
178,17: [ParagraphPlugin.key]: {
197,15: [HistoryPlugin.key]: false,
261,25: type: typeof ParagraphPlugin.key;
266,21: type: typeof ImagePlugin.key;

✅ /Users/zbeyens/GitHub/udecode/plate/docs/equation.cn.mdx
48,12: [EquationPlugin.key]: EquationElement,
49,18: [InlineEquationPlugin.key]: InlineEquationElement,

✅ /Users/zbeyens/GitHub/udecode/plate/docs/equation.mdx
46,12: [EquationPlugin.key]: EquationElement,
47,18: [InlineEquationPlugin.key]: InlineEquationElement,

✅ /Users/zbeyens/GitHub/udecode/plate/docs/excalidraw.cn.mdx
34,43: options: { query: { allow: [ExcalidrawPlugin.key] } },

✅ /Users/zbeyens/GitHub/udecode/plate/docs/excalidraw.mdx
34,43: options: { query: { allow: [ExcalidrawPlugin.key] } },

✅ /Users/zbeyens/GitHub/udecode/plate/docs/horizontal-rule.cn.mdx
38,47: options: { query: { allow: [HorizontalRulePlugin.key] } },
45,31: type: HorizontalRulePlugin.key,
48,52: setNodes(editor, { type: HorizontalRulePlugin.key });
50,30: type: ParagraphPlugin.key,

✅ /Users/zbeyens/GitHub/udecode/plate/docs/horizontal-rule.mdx
38,47: options: { query: { allow: [HorizontalRulePlugin.key] } },
45,31: type: HorizontalRulePlugin.key,
48,52: setNodes(editor, { type: HorizontalRulePlugin.key });
50,30: type: ParagraphPlugin.key,

✅ /Users/zbeyens/GitHub/udecode/plate/docs/kbd.cn.mdx
39,7: [KbdPlugin.key]: KbdLeaf,

✅ /Users/zbeyens/GitHub/udecode/plate/docs/kbd.mdx
39,7: [KbdPlugin.key]: KbdLeaf,

✅ /Users/zbeyens/GitHub/udecode/plate/docs/list-classic.cn.mdx
318,29: - **默认值：** `BulletedListPlugin.key`

✅ /Users/zbeyens/GitHub/udecode/plate/docs/list-classic.mdx
318,33: - **Default:** `BulletedListPlugin.key`

✅ /Users/zbeyens/GitHub/udecode/plate/docs/markdown.cn.mdx
435,15: [CodeBlockPlugin.key]: MyCustomCodeBlockElement,
458,28: type: CodeBlockPlugin.key, // Plate 类型
466,17: [CodeBlockPlugin.key]: { // 假设 key 为 'code_block'
619,115: | `components={{ code: MyCode }}` | 1. **转换**：`MarkdownPlugin > rules > code`。 2. **渲染**：`components: { [CodeBlockPlugin.key]: MyCode }` | `rules` 控制 mdast（`code`）到 Slate（`code_block`）的转换。`components` 控制 Slate 渲染。 |
775,49: `components` 的 key 通常为 Plate 插件 key（如 `ParagraphPlugin.key`、`CodeBlockPlugin.key`）或默认 Slate 类型（如 `p`、`h1`）。
775,71: `components` 的 key 通常为 Plate 插件 key（如 `ParagraphPlugin.key`、`CodeBlockPlugin.key`）或默认 Slate 类型（如 `p`、`h1`）。
790,15: [ParagraphPlugin.key]: ParagraphElement,
791,15: [CodeBlockPlugin.key]: CodeBlockElement,
792,10: [BoldPlugin.key]: withProps(PlateLeaf, { as: 'strong' }),
794,18: // [CodeBlockPlugin.keys.syntax]: CodeLeaf, // 若 CodeBlockPlugin 提供该 key

✅ /Users/zbeyens/GitHub/udecode/plate/docs/markdown.mdx
435,15: [CodeBlockPlugin.key]: MyCustomCodeBlockElement,
436,64: // You might also need to customize components for CodeLinePlugin.key and CodeSyntaxPlugin.key
436,89: // You might also need to customize components for CodeLinePlugin.key and CodeSyntaxPlugin.key
461,28: type: CodeBlockPlugin.key, // Use Plate's type
470,17: [CodeBlockPlugin.key]: { // Assuming CodeBlockPlugin.key is 'code_block'
470,53: [CodeBlockPlugin.key]: { // Assuming CodeBlockPlugin.key is 'code_block'
626,132: | `components={{ code: MyCode }}` | 1. **Conversion**: `MarkdownPlugin > rules > code`. 2. **Rendering**: `components: { [CodeBlockPlugin.key]: MyCode }` | `rules` for mdast (`code`) to Slate (`code_block`). `components` for Slate rendering. |
785,71: Keys in `components` usually match Plate plugin keys (e.g., `ParagraphPlugin.key`, `CodeBlockPlugin.key`) or default Slate types (`p`, `h1`).
785,94: Keys in `components` usually match Plate plugin keys (e.g., `ParagraphPlugin.key`, `CodeBlockPlugin.key`) or default Slate types (`p`, `h1`).
800,15: [ParagraphPlugin.key]: ParagraphElement,
801,15: [CodeBlockPlugin.key]: CodeBlockElement,
802,10: [BoldPlugin.key]: withProps(PlateLeaf, { as: 'strong' }),
804,18: // [CodeBlockPlugin.keys.syntax]: CodeLeaf, // If CodeBlockPlugin provides such a key

✅ /Users/zbeyens/GitHub/udecode/plate/docs/media.cn.mdx
99,22: allow: [ImagePlugin.key, VideoPlugin.key, AudioPlugin.key, FilePlugin.key, MediaEmbedPlugin.key],
99,39: allow: [ImagePlugin.key, VideoPlugin.key, AudioPlugin.key, FilePlugin.key, MediaEmbedPlugin.key],
99,56: allow: [ImagePlugin.key, VideoPlugin.key, AudioPlugin.key, FilePlugin.key, MediaEmbedPlugin.key],
99,72: allow: [ImagePlugin.key, VideoPlugin.key, AudioPlugin.key, FilePlugin.key, MediaEmbedPlugin.key],
99,94: allow: [ImagePlugin.key, VideoPlugin.key, AudioPlugin.key, FilePlugin.key, MediaEmbedPlugin.key],
113,9: [ImagePlugin.key]: ImageElement,
114,9: [VideoPlugin.key]: VideoElement,
115,9: [AudioPlugin.key]: AudioElement,
116,8: [FilePlugin.key]: FileElement,
117,14: [MediaEmbedPlugin.key]: MediaEmbedElement,
118,15: [PlaceholderPlugin.key]: MediaPlaceholderElement,
267,21: mediaType: AudioPlugin.key,
273,20: mediaType: FilePlugin.key,
279,21: mediaType: ImagePlugin.key,
285,20: mediaType: FilePlugin.key,
291,20: mediaType: FilePlugin.key,
297,21: mediaType: VideoPlugin.key,
651,27: - **默认值:** `MediaEmbedPlugin.key`

✅ /Users/zbeyens/GitHub/udecode/plate/docs/media.mdx
99,22: allow: [ImagePlugin.key, VideoPlugin.key, AudioPlugin.key, FilePlugin.key, MediaEmbedPlugin.key],
99,39: allow: [ImagePlugin.key, VideoPlugin.key, AudioPlugin.key, FilePlugin.key, MediaEmbedPlugin.key],
99,56: allow: [ImagePlugin.key, VideoPlugin.key, AudioPlugin.key, FilePlugin.key, MediaEmbedPlugin.key],
99,72: allow: [ImagePlugin.key, VideoPlugin.key, AudioPlugin.key, FilePlugin.key, MediaEmbedPlugin.key],
99,94: allow: [ImagePlugin.key, VideoPlugin.key, AudioPlugin.key, FilePlugin.key, MediaEmbedPlugin.key],
113,9: [ImagePlugin.key]: ImageElement,
114,9: [VideoPlugin.key]: VideoElement,
115,9: [AudioPlugin.key]: AudioElement,
116,8: [FilePlugin.key]: FileElement,
117,14: [MediaEmbedPlugin.key]: MediaEmbedElement,
118,15: [PlaceholderPlugin.key]: PlaceholderElement,
267,21: mediaType: AudioPlugin.key,
273,20: mediaType: FilePlugin.key,
279,21: mediaType: ImagePlugin.key,
285,20: mediaType: FilePlugin.key,
291,20: mediaType: FilePlugin.key,
297,21: mediaType: VideoPlugin.key,
651,31: - **Default:** `MediaEmbedPlugin.key`

✅ /Users/zbeyens/GitHub/udecode/plate/docs/mention.cn.mdx
77,24: - **默认值:** `MentionPlugin.key`

✅ /Users/zbeyens/GitHub/udecode/plate/docs/mention.mdx
75,28: - **Default:** `MentionPlugin.key`

✅ /Users/zbeyens/GitHub/udecode/plate/docs/plugin-components.cn.mdx
93,17: [ParagraphPlugin.key]: ParagraphElement,
94,12: [LinkPlugin.key]: LinkElement,

✅ /Users/zbeyens/GitHub/udecode/plate/docs/plugin-components.mdx
92,15: [ParagraphPlugin.key]: ParagraphElement,
93,10: [LinkPlugin.key]: LinkElement,

✅ /Users/zbeyens/GitHub/udecode/plate/docs/plugin-context.cn.mdx
79,28: console.info('插件键:', plugin.key);

✅ /Users/zbeyens/GitHub/udecode/plate/docs/plugin-context.mdx
79,35: console.info('Plugin key:', plugin.key);

✅ /Users/zbeyens/GitHub/udecode/plate/docs/plugin.cn.mdx
137,30: targetPlugins: [ParagraphPlugin.key],

✅ /Users/zbeyens/GitHub/udecode/plate/docs/plugin.mdx
138,30: targetPlugins: [ParagraphPlugin.key],

✅ /Users/zbeyens/GitHub/udecode/plate/docs/reset-node.cn.mdx
27,21: types: [BlockquotePlugin.key, TodoListPlugin.key],
27,41: types: [BlockquotePlugin.key, TodoListPlugin.key],
28,25: defaultType: ParagraphPlugin.key,
32,20: types: [CodeBlockPlugin.key],
33,25: defaultType: ParagraphPlugin.key,

✅ /Users/zbeyens/GitHub/udecode/plate/docs/reset-node.mdx
27,21: types: [BlockquotePlugin.key, TodoListPlugin.key],
27,41: types: [BlockquotePlugin.key, TodoListPlugin.key],
28,25: defaultType: ParagraphPlugin.key,
32,20: types: [CodeBlockPlugin.key],
33,25: defaultType: ParagraphPlugin.key,

✅ /Users/zbeyens/GitHub/udecode/plate/docs/slash-command.cn.mdx
46,14: [SlashInputPlugin.key]: SlashInputElement,
92,23: type: SlashInputPlugin.key,

✅ /Users/zbeyens/GitHub/udecode/plate/docs/slash-command.mdx
46,14: [SlashInputPlugin.key]: SlashInputElement,
92,23: type: SlashInputPlugin.key,

✅ /Users/zbeyens/GitHub/udecode/plate/docs/soft-break.cn.mdx
32,30: allow: [CodeBlockPlugin.key, BlockquotePlugin.key, TablePlugin.key],
32,52: allow: [CodeBlockPlugin.key, BlockquotePlugin.key, TablePlugin.key],
32,69: allow: [CodeBlockPlugin.key, BlockquotePlugin.key, TablePlugin.key],

✅ /Users/zbeyens/GitHub/udecode/plate/docs/soft-break.mdx
32,30: allow: [CodeBlockPlugin.key, BlockquotePlugin.key, TablePlugin.key],
32,52: allow: [CodeBlockPlugin.key, BlockquotePlugin.key, TablePlugin.key],
32,69: allow: [CodeBlockPlugin.key, BlockquotePlugin.key, TablePlugin.key],

✅ /Users/zbeyens/GitHub/udecode/plate/docs/tabbable.cn.mdx
44,60: const inList = findNode(editor, { match: { type: ListItemPlugin.key } });
45,66: const inCodeBlock = findNode(editor, { match: { type: CodeBlockPlugin.key } });

✅ /Users/zbeyens/GitHub/udecode/plate/docs/tabbable.mdx
44,60: const inList = findNode(editor, { match: { type: ListItemPlugin.key } });
45,66: const inCodeBlock = findNode(editor, { match: { type: CodeBlockPlugin.key } });

✅ /Users/zbeyens/GitHub/udecode/plate/docs/toc.cn.mdx
50,7: [TocPlugin.key]: TocElement,

✅ /Users/zbeyens/GitHub/udecode/plate/docs/toc.mdx
50,7: [TocPlugin.key]: TocElement,

✅ /Users/zbeyens/GitHub/udecode/plate/docs/toggle.mdx
46,40: targetPlugins: ['p', 'h1', TogglePlugin.key],

✅ /Users/zbeyens/GitHub/udecode/plate/docs/unit-testing.cn.mdx
277,30: editor.plugins[AutoformatPlugin.key].handlers.onKeyDown({

✅ /Users/zbeyens/GitHub/udecode/plate/docs/unit-testing.mdx
277,30: editor.plugins[AutoformatPlugin.key].handlers.onKeyDown({

✅ /Users/zbeyens/GitHub/udecode/plate/packages/ai/src/react/ai-chat/transforms/removeAnchorAIChat.ts
14,65: match: (n) => ElementApi.isElement(n) && n.type === AIChatPlugin.key,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/ai/src/react/ai-chat/useAIChatHook.ts
24,27: type: AIChatPlugin.key,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/ai/src/react/ai-chat/withAIChat.ts
70,20: if (node[AIPlugin.key] && !getOptions().open) {

✅ /Users/zbeyens/GitHub/udecode/plate/packages/alignment/src/lib/BaseAlignPlugin.ts
14,34: targetPlugins: [BaseParagraphPlugin.key],

✅ /Users/zbeyens/GitHub/udecode/plate/packages/autoformat/src/lib/transforms/autoformatBlock.ts
28,25: type = BaseParagraphPlugin.key,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/block-quote/src/lib/withBlockquote.ts
12,43: if (prevNode.type === BaseBlockquotePlugin.key) return false;

✅ /Users/zbeyens/GitHub/udecode/plate/packages/code-block/src/lib/deserializer/htmlDeserializerCodeBlock.ts
37,25: type: BaseCodeLinePlugin.key,
42,26: type: BaseCodeBlockPlugin.key,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/code-block/src/lib/BaseCodeBlockPlugin.ts
53,12: [HtmlPlugin.key]: {

✅ /Users/zbeyens/GitHub/udecode/plate/packages/code-block/src/lib/setCodeBlockToDecorations.ts
142,24: [BaseCodeSyntaxPlugin.key]: true,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/comments/src/lib/utils/getCommentKey.ts
3,61: export const getCommentKey = (id: string) => `${BaseCommentsPlugin.key}_${id}`;

✅ /Users/zbeyens/GitHub/udecode/plate/packages/comments/src/lib/utils/getCommentKeyId.ts
4,30: key.replace(`${BaseCommentsPlugin.key}_`, '');

✅ /Users/zbeyens/GitHub/udecode/plate/packages/comments/src/lib/utils/getDraftCommentKey.ts
3,56: export const getDraftCommentKey = () => `${BaseCommentsPlugin.key}_draft`;

✅ /Users/zbeyens/GitHub/udecode/plate/packages/comments/src/lib/utils/isCommentKey.ts
4,33: key.startsWith(`${BaseCommentsPlugin.key}_`);

✅ /Users/zbeyens/GitHub/udecode/plate/packages/comments/src/lib/utils/isCommentText.ts
8,29: return !!node[BaseCommentsPlugin.key];

✅ /Users/zbeyens/GitHub/udecode/plate/packages/comments/src/lib/BaseCommentsPlugin.ts
119,44: editor.tf.removeMark(BaseCommentsPlugin.key);
147,27: BaseCommentsPlugin.key,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/comments/src/lib/withComments.ts
18,26: node[BaseCommentsPlugin.key] &&
22,42: editor.tf.unsetNodes(BaseCommentsPlugin.key, { at: path });

✅ /Users/zbeyens/GitHub/udecode/plate/packages/core/src/internal/plugin/resolvePlugin.ts
100,26: `Invalid plugin '${plugin.key}', you should use createSlatePlugin.`,
106,17: `Plugin ${plugin.key} cannot be both an element and a leaf.`,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/core/src/internal/plugin/resolvePlugins.ts
64,13: name: plugin.key,
111,45: if (!(editor.transforms as any)[plugin.key]) {
112,42: (editor.transforms as any)[plugin.key] = {};
114,45: if (!(plugin.transforms as any)[plugin.key]) {
115,42: (plugin.transforms as any)[plugin.key] = {};
118,46: merge((editor.transforms as any)[plugin.key], newExtensions);
119,46: merge((plugin.transforms as any)[plugin.key], newExtensions);
130,38: if (!(editor.api as any)[plugin.key]) {
131,35: (editor.api as any)[plugin.key] = {};
133,38: if (!(plugin.api as any)[plugin.key]) {
134,35: (plugin.api as any)[plugin.key] = {};
137,39: merge((editor.api as any)[plugin.key], newExtensions);
138,39: merge((plugin.api as any)[plugin.key], newExtensions);
207,17: if (resolvedPlugin.key) {
208,52: const existingPlugin = pluginMap.get(resolvedPlugin.key);
212,19: resolvedPlugin.key,
216,31: pluginMap.set(resolvedPlugin.key, resolvedPlugin);
252,21: if (visited.has(plugin.key)) return;
254,17: visited.add(plugin.key);
263,22: `Plugin "${plugin.key}" depends on missing plugin "${depKey}"`,
283,30: plugins.map((plugin) => [plugin.key, plugin])
371,40: editor.pluginList.map((plugin) => [plugin.key, plugin])

✅ /Users/zbeyens/GitHub/udecode/plate/packages/core/src/lib/editor/withSlate.ts
145,79: `editor.getOption: ${key as string} option is not defined in plugin ${plugin.key}.`,
160,69: `editor.setOption: ${key} option is not defined in plugin ${plugin.key}.`,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/core/src/lib/plugin/BasePlugin.ts
111,27: _ @default [ParagraphPlugin.key]
247,15: _ @default plugin.key

✅ /Users/zbeyens/GitHub/udecode/plate/packages/core/src/lib/plugin/createSlatePlugin.ts
161,19: if (nestedPlugin.key === p.key) {
284,19: if (nestedPlugin.key === p.key) {

✅ /Users/zbeyens/GitHub/udecode/plate/packages/core/src/lib/plugins/html/utils/pluginDeserializeHtml.ts
26,44: rule.validClassName?.includes(`slate-${plugin.key}`)
33,36: validClassName: `slate-${plugin.key}`,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/core/src/lib/plugins/slate-extension/SlateExtensionPlugin.ts
34,49: type: editor.getType(BaseParagraphPlugin.key),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/core/src/lib/plugins/getCorePlugins.ts
48,30: plugins.map((plugin) => [plugin.key, plugin])
53,51: const customPlugin = customPluginsMap.get(corePlugin.key);
57,60: const index = plugins.findIndex((p) => p.key === corePlugin.key);

✅ /Users/zbeyens/GitHub/udecode/plate/packages/core/src/lib/static/**tests**/create-static-editor.ts
178,26: BaseParagraphPlugin.key,
180,22: BaseImagePlugin.key,
181,27: BaseMediaEmbedPlugin.key,
200,13: [BaseAudioPlugin.key]: AudioElementStatic,
201,18: [BaseBlockquotePlugin.key]: BlockquoteElementStatic,
202,12: [BaseBoldPlugin.key]: withProps(SlateLeaf, { as: 'strong' }),
203,17: [BaseCodeBlockPlugin.key]: CodeBlockElementStatic,
204,16: [BaseCodeLinePlugin.key]: CodeLineElementStatic,
205,12: [BaseCodePlugin.key]: CodeLeafStatic,
206,18: [BaseCodeSyntaxPlugin.key]: CodeSyntaxLeafStatic,
207,18: [BaseColumnItemPlugin.key]: ColumnElementStatic,
208,14: [BaseColumnPlugin.key]: ColumnGroupElementStatic,
209,16: [BaseCommentsPlugin.key]: CommentLeafStatic,
210,12: [BaseDatePlugin.key]: DateElementStatic,
211,16: [BaseEquationPlugin.key]: EquationElementStatic,
212,12: [BaseFilePlugin.key]: FileElementStatic,
213,22: [BaseHorizontalRulePlugin.key]: HrElementStatic,
214,13: [BaseImagePlugin.key]: ImageElementStatic,
215,22: [BaseInlineEquationPlugin.key]: InlineEquationElementStatic,
216,14: [BaseItalicPlugin.key]: withProps(SlateLeaf, { as: 'em' }),
217,11: [BaseKbdPlugin.key]: KbdLeafStatic,
218,12: [BaseLinkPlugin.key]: LinkElementStatic,
219,21: // [BaseMediaEmbedPlugin.key]: MediaEmbedElementStatic,
220,15: [BaseMentionPlugin.key]: MentionElementStatic,
221,17: [BaseParagraphPlugin.key]: ParagraphElementStatic,
222,21: [BaseStrikethroughPlugin.key]: withProps(SlateLeaf, { as: 'del' }),
223,17: [BaseSubscriptPlugin.key]: withProps(SlateLeaf, { as: 'sub' }),
224,19: [BaseSuperscriptPlugin.key]: withProps(SlateLeaf, { as: 'sup' }),
225,23: [BaseTableCellHeaderPlugin.key]: TableCellHeaderStaticElement,
226,17: [BaseTableCellPlugin.key]: TableCellElementStatic,
227,13: [BaseTablePlugin.key]: TableElementStatic,
228,16: [BaseTableRowPlugin.key]: TableRowElementStatic,
229,11: [BaseTocPlugin.key]: TocElementStatic,
230,14: [BaseTogglePlugin.key]: ToggleElementStatic,
231,17: [BaseUnderlinePlugin.key]: withProps(SlateLeaf, { as: 'u' }),
232,13: [BaseVideoPlugin.key]: VideoElementStatic,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/diff/src/internal/transforms/transformDiffTexts.ts
68,65: nodesEditor.children = [{ children: texts, type: BaseParagraphPlugin.key }];

✅ /Users/zbeyens/GitHub/udecode/plate/packages/docx/src/lib/DocxPlugin.ts
53,12: [HtmlPlugin.key]: {

✅ /Users/zbeyens/GitHub/udecode/plate/packages/emoji/src/lib/BaseEmojiPlugin.ts
46,27: type: BaseEmojiInputPlugin.key,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/font/src/lib/transforms/setBlockBackgroundColor.ts
11,31: { [BaseFontBackgroundColorPlugin.key]: backgroundColor },

✅ /Users/zbeyens/GitHub/udecode/plate/packages/font/src/lib/transforms/setFontSize.ts
7,18: [BaseFontSizePlugin.key]: fontSize,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/heading/src/react/HeadingPlugin.tsx
21,52: editor.tf.toggleBlock(editor.getType(plugin.key));

✅ /Users/zbeyens/GitHub/udecode/plate/packages/indent/src/lib/BaseIndentPlugin.ts
48,34: targetPlugins: [BaseParagraphPlugin.key],

✅ /Users/zbeyens/GitHub/udecode/plate/packages/indent/src/lib/BaseTextIndentPlugin.ts
28,34: targetPlugins: [BaseParagraphPlugin.key],

✅ /Users/zbeyens/GitHub/udecode/plate/packages/juice/src/lib/JuicePlugin.ts
9,12: [HtmlPlugin.key]: {

✅ /Users/zbeyens/GitHub/udecode/plate/packages/layout/src/lib/transforms/insertColumn.ts
14,27: type: BaseColumnItemPlugin.key,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/layout/src/lib/transforms/insertColumnGroup.ts
26,31: type: BaseColumnItemPlugin.key,
29,25: type: BaseColumnPlugin.key,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/layout/src/lib/transforms/toggleColumnGroup.ts
46,29: type: BaseColumnItemPlugin.key,
49,23: type: BaseColumnPlugin.key,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/layout/src/lib/withColumn.ts
17,65: ElementApi.isElement(n) && n.type === BaseColumnItemPlugin.key,
36,59: if (ElementApi.isElement(n) && n.type === BaseColumnPlugin.key) {
91,63: if (ElementApi.isElement(n) && n.type === BaseColumnItemPlugin.key) {

✅ /Users/zbeyens/GitHub/udecode/plate/packages/layout/src/react/onKeyDownColumn.ts
21,29: if (node.type !== ColumnPlugin.key) return;

✅ /Users/zbeyens/GitHub/udecode/plate/packages/line-height/src/lib/BaseLineHeightPlugin.ts
15,34: targetPlugins: [BaseParagraphPlugin.key],
23,35: [editor.getType(plugin.key)]: element.style.lineHeight,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/line-height/src/react/hooks/useLineHeightDropdownMenu.ts
18,65: values.find((item) => item === entry[0][BaseLineHeightPlugin.key]) ??

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list/src/lib/normalizers/normalizeListNotIndented.ts
6,45: /\*_ Unset listStyle, listStart if BaseIndentPlugin.key is not defined. _/
12,31: !isDefined(node[BaseIndentPlugin.key]) &&

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list/src/lib/queries/getSiblingList.ts
66,44: const indent = (node as any)[BaseIndentPlugin.key] as number;
67,52: const nextIndent = (nextNode as any)[BaseIndentPlugin.key] as number;

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list/src/lib/transforms/setListNode.ts
24,18: [BaseIndentPlugin.key]: newIndent,
47,18: [BaseIndentPlugin.key]: newIndent,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list/src/lib/transforms/setListNodes.ts
26,36: let indent = (node[BaseIndentPlugin.key] as number) ?? 0;

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list/src/lib/transforms/setListSiblingNodes.ts
35,34: indent: node[BaseIndentPlugin.key] as number,
42,34: indent: node[BaseIndentPlugin.key] as number,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list/src/lib/transforms/toggleList.ts
81,43: const indent = node[BaseIndentPlugin.key] as number;
87,30: { [BaseIndentPlugin.key]: indent - 1 },
92,28: [BaseIndentPlugin.key, INDENT_LIST_KEYS.checked],
100,41: // indent: node[BaseIndentPlugin.key],

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list/src/lib/transforms/toggleListByPath.ts
17,18: [BaseIndentPlugin.key]: node.indent ?? 1,
21,26: type: BaseParagraphPlugin.key,
36,17: BaseIndentPlugin.key,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list/src/lib/BaseListPlugin.ts
63,12: [HtmlPlugin.key]: {

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list-classic/src/lib/BaseListPlugin.ts
60,12: [HtmlPlugin.key]: {

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list-classic/src/react/hooks/useListToolbarButton.ts
7,30: nodeType = BaseBulletedListPlugin.key as string,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/media/src/react/image/openImagePreview.ts
11,39: match: (n) => n.type === BaseImagePlugin.key,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/media/src/react/placeholder/hooks/usePlaceholderElement.ts
25,20: BasePlaceholderPlugin.key

✅ /Users/zbeyens/GitHub/udecode/plate/packages/media/src/react/placeholder/hooks/usePlaceholderPopover.ts
24,66: const element = useElement<TPlaceholderElement>(BasePlaceholderPlugin.key);

✅ /Users/zbeyens/GitHub/udecode/plate/packages/media/src/react/placeholder/utils/history.ts
22,24: batch[PlaceholderPlugin.key] &&

✅ /Users/zbeyens/GitHub/udecode/plate/packages/media/src/react/placeholder/PlaceholderPlugin.tsx
55,25: mediaType: AudioPlugin.key,
61,24: mediaType: FilePlugin.key,
67,25: mediaType: ImagePlugin.key,
73,24: mediaType: FilePlugin.key,
79,24: mediaType: FilePlugin.key,
85,25: mediaType: VideoPlugin.key,
98,25: [PlaceholderPlugin.key]: true,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/media/src/react/placeholder/type.ts
31,17: | typeof AudioPlugin.key
32,16: | typeof FilePlugin.key
33,17: | typeof ImagePlugin.key
34,17: | typeof VideoPlugin.key;

✅ /Users/zbeyens/GitHub/udecode/plate/packages/mention/src/lib/BaseMentionPlugin.ts
42,29: type: BaseMentionInputPlugin.key,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/mention/src/lib/getMentionOnSelectItem.ts
13,22: key = BaseMentionPlugin.key,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/plate-utils/src/lib/plugins/delete/DeletePlugin.ts
22,28: allow: [BaseParagraphPlugin.key],

✅ /Users/zbeyens/GitHub/udecode/plate/packages/plate-utils/src/react/plugins/BlockPlaceholderPlugin.tsx
41,19: [ParagraphPlugin.key]: 'Type something...',

✅ /Users/zbeyens/GitHub/udecode/plate/packages/slash-command/src/lib/BaseSlashPlugin.ts
34,27: type: BaseSlashInputPlugin.key,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/suggestion/src/lib/queries/findSuggestionNode.ts
21,60: (n) => TextApi.isText(n) && (n as any)[BaseSuggestionPlugin.key],

✅ /Users/zbeyens/GitHub/udecode/plate/packages/suggestion/src/lib/transforms/acceptSuggestion.ts
38,60: editor.tf.unsetNodes([description.keyId, BaseSuggestionPlugin.key], {

✅ /Users/zbeyens/GitHub/udecode/plate/packages/suggestion/src/lib/transforms/addMarkSuggestion.ts
26,27: if (n[BaseSuggestionPlugin.key]) {
42,24: [BaseSuggestionPlugin.key]: true,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/suggestion/src/lib/transforms/deleteSuggestion.ts
103,27: n[BaseSuggestionPlugin.key] &&
136,55: editor.tf.unsetNodes([BaseSuggestionPlugin.key], {
156,32: [BaseSuggestionPlugin.key]: {

✅ /Users/zbeyens/GitHub/udecode/plate/packages/suggestion/src/lib/transforms/getSuggestionProps.ts
26,20: [BaseSuggestionPlugin.key]: true,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/suggestion/src/lib/transforms/insertFragmentSuggestion.ts
27,30: if (!n[BaseSuggestionPlugin.key]) {
29,27: n[BaseSuggestionPlugin.key] = true;
45,25: n[BaseSuggestionPlugin.key] = {

✅ /Users/zbeyens/GitHub/udecode/plate/packages/suggestion/src/lib/transforms/rejectSuggestion.ts
44,60: editor.tf.unsetNodes([description.keyId, BaseSuggestionPlugin.key], {

✅ /Users/zbeyens/GitHub/udecode/plate/packages/suggestion/src/lib/transforms/removeMarkSuggestion.ts
23,27: if (n[BaseSuggestionPlugin.key]) {
42,24: [BaseSuggestionPlugin.key]: true,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/suggestion/src/lib/transforms/removeNodesSuggestion.ts
20,24: [BaseSuggestionPlugin.key]: {

✅ /Users/zbeyens/GitHub/udecode/plate/packages/suggestion/src/lib/transforms/setSuggestionNodes.ts
44,22: [BaseSuggestionPlugin.key]: true,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/suggestion/src/lib/utils/getSuggestionId.ts
10,44: return key.startsWith(`${BaseSuggestionPlugin.key}_`);
25,41: return keyId.replace(`${BaseSuggestionPlugin.key}_`, '');

✅ /Users/zbeyens/GitHub/udecode/plate/packages/suggestion/src/lib/utils/getSuggestionKeys.ts
12,20: `${BaseSuggestionPlugin.key}_${id}`;
15,35: key.startsWith(`${BaseSuggestionPlugin.key}_`);
28,47: isDefined(key) ? key.split(`${BaseSuggestionPlugin.key}_`)[1] : null;

✅ /Users/zbeyens/GitHub/udecode/plate/packages/suggestion/src/lib/BaseSuggestionPlugin.ts
64,52: return key.startsWith(`${BaseSuggestionPlugin.key}_`);

✅ /Users/zbeyens/GitHub/udecode/plate/packages/suggestion/src/lib/diffToSuggestions.ts
52,54: if (TextApi.isText(node) && node[BaseSuggestionPlugin.key]) {
60,44: if (previousNode?.[BaseSuggestionPlugin.key]) {

✅ /Users/zbeyens/GitHub/udecode/plate/packages/suggestion/src/lib/withSuggestion.ts
58,35: node?.[0][BaseSuggestionPlugin.key] &&
82,49: editor.tf.unsetNodes([BaseSuggestionPlugin.key], {
123,55: if (path.length > 1 || node.type !== ParagraphPlugin.key) {
137,30: [BaseSuggestionPlugin.key]: {
181,28: [BaseSuggestionPlugin.key]: {
201,35: node?.[0][BaseSuggestionPlugin.key] &&
220,30: node[BaseSuggestionPlugin.key] && // Unset suggestion when there is no suggestion id
224,47: editor.tf.unsetNodes([BaseSuggestionPlugin.key, 'suggestionData'], {
232,30: node[BaseSuggestionPlugin.key] &&
239,30: [BaseSuggestionPlugin.key, getSuggestionKeyId(node)!],

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/lib/merge/deleteColumnWhenExpanded.ts
25,42: match: (n) => n.type === BaseTableRowPlugin.key,
30,42: match: (n) => n.type === BaseTableRowPlugin.key,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/lib/transforms/setTableColSize.ts
14,29: match: { type: BaseTablePlugin.key },

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/lib/transforms/setTableMarginLeft.ts
13,29: match: { type: BaseTablePlugin.key },

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/lib/transforms/setTableRowSize.ts
13,29: match: { type: BaseTablePlugin.key },

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/lib/BaseTablePlugin.ts
178,27: // dependencies: [NodeIdPlugin.key],

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/lib/withInsertFragmentTable.ts
158,41: fragment[0].type === BaseTablePlugin.key

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/react/components/TableCellElement/useTableCellElementResizable.ts
60,17: { key: TablePlugin.key }
65,17: { key: TablePlugin.key }

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/react/components/TableCellElement/useTableCellSize.ts
31,20: key: TableRowPlugin.key,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/react/components/TableElement/useTableColSizes.ts
36,17: key: TablePlugin.key,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/react/hooks/useTableMergeState.ts
25,55: (editor) => editor.api.some({ match: { type: TablePlugin.key } }),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/tag/src/lib/isEqualTags.ts
19,29: match: { type: BaseTagPlugin.key },

✅ /Users/zbeyens/GitHub/udecode/plate/packages/tag/src/react/useSelectedItems.ts
12,23: match: { type: TagPlugin.key },

✅ /Users/zbeyens/GitHub/udecode/plate/packages/toggle/src/lib/queries/someToggle.ts
9,42: match: (n) => n.type === BaseTogglePlugin.key,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/toggle/src/lib/BaseTogglePlugin.ts
21,26: type: typeof BaseTogglePlugin.key;

✅ /Users/zbeyens/GitHub/udecode/plate/packages/toggle/src/react/hooks/useToggleToolbarButton.ts
25,37: editor.tf.toggleBlock(TogglePlugin.key);

✅ /Users/zbeyens/GitHub/udecode/plate/packages/toggle/src/react/toggleIndexAtom.ts
24,46: const elementIndent = (element[BaseIndentPlugin.key] as number) || 0;
27,51: element[ListPluginKey] && element[BaseIndentPlugin.key]
40,32: if (element.type === TogglePlugin.key) {

✅ /Users/zbeyens/GitHub/udecode/plate/packages/toggle/src/react/withToggle.ts
54,49: currentBlockEntry[0].type !== BaseTogglePlugin.key
65,43: editor.tf.toggleBlock(BaseTogglePlugin.key);
