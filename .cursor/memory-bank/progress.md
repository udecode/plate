## Migration Task: Update editor.getType() usage

**BREAKING CHANGE**: `editor.getType()` now takes a `pluginKey: string` instead of a `plugin: PlatePlugin`.

**Requirements:**

- Use KEYS from @plate-keys.ts wherever possible
- Change `editor.getType(SomePlugin)` to `editor.getType(KEYS.someKey)` or `editor.getType('someKey')`
- Mark each batch with ✅ when completed

---

✅ /Users/zbeyens/GitHub/udecode/plate/apps/www/src/registry/components/editor/plugins/autoformat-classic-kit.tsx
249,28: match: { type: editor.getType(CodeBlockPlugin) },

✅ /Users/zbeyens/GitHub/udecode/plate/apps/www/src/registry/components/editor/plugins/autoformat-kit.tsx
231,30: match: { type: editor.getType(CodeBlockPlugin) },

✅ /Users/zbeyens/GitHub/udecode/plate/apps/www/src/registry/components/editor/plugins/slash-kit.tsx
16,26: match: { type: editor.getType(CodeBlockPlugin) },

✅ /Users/zbeyens/GitHub/udecode/plate/apps/www/src/registry/ui/block-draggable.tsx
44,17: type: editor.getType(ColumnPlugin),
56,17: type: editor.getType(TablePlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/apps/www/src/registry/ui/link-toolbar.tsx
174,24: match: { type: editor.getType(LinkPlugin) },

✅ /Users/zbeyens/GitHub/udecode/plate/docs/editor-methods.cn.mdx
151,23: const paragraphType = editor.getType(ParagraphPlugin);

✅ /Users/zbeyens/GitHub/udecode/plate/docs/editor-methods.mdx
151,23: const paragraphType = editor.getType(ParagraphPlugin);

✅ /Users/zbeyens/GitHub/udecode/plate/docs/exit-break.cn.mdx
112,17: - **默认值:** `editor.getType(ParagraphPlugin)`

✅ /Users/zbeyens/GitHub/udecode/plate/docs/exit-break.mdx
112,21: - **Default:** `editor.getType(ParagraphPlugin)`

✅ /Users/zbeyens/GitHub/udecode/plate/docs/html.cn.mdx
249,45: type: CodeBlockPlugin.key, // 或 editor.getType(CodeBlockPlugin)
253,21: type: editor.getType(CodeLinePlugin), // 用 editor.getType 更安全
253,58: type: editor.getType(CodeLinePlugin), // 用 editor.getType 更安全

✅ /Users/zbeyens/GitHub/udecode/plate/docs/html.mdx
248,46: type: CodeBlockPlugin.key, // Or editor.getType(CodeBlockPlugin)
252,21: type: editor.getType(CodeLinePlugin), // Use editor.getType for safety
252,60: type: editor.getType(CodeLinePlugin), // Use editor.getType for safety

✅ /Users/zbeyens/GitHub/udecode/plate/docs/plugin.cn.mdx
145,22: node[editor.getType(plugin)] = element.style.textAlign;

✅ /Users/zbeyens/GitHub/udecode/plate/docs/plugin.mdx
146,22: node[editor.getType(plugin)] = element.style.textAlign;

✅ /Users/zbeyens/GitHub/udecode/plate/docs/trailing-block.cn.mdx
112,17: - **默认值:** `editor.getType(ParagraphPlugin)`

✅ /Users/zbeyens/GitHub/udecode/plate/docs/trailing-block.mdx
47,21: - **Default:** `editor.getType(ParagraphPlugin)`

**PACKAGES MIGRATION IN PROGRESS:**

✅ /Users/zbeyens/GitHub/udecode/plate/packages/ai/src/lib/streaming/utils/isSameNode.ts
18,20: node1.type !== editor.getType(BaseParagraphPlugin) ||
19,20: node2.type !== editor.getType(BaseParagraphPlugin)

✅ /Users/zbeyens/GitHub/udecode/plate/packages/alignment/src/lib/BaseAlignPlugin.ts
21,22: node[editor.getType(plugin)] = element.style.textAlign;

✅ /Users/zbeyens/GitHub/udecode/plate/packages/autoformat/src/lib/**tests**/withAutoformat/block/code-block.spec.tsx
76,34: defaultType: editor.getType(BaseParagraphPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/basic-marks/src/react/SubscriptPlugin.tsx
15,21: remove: editor.getType(SuperscriptPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/basic-marks/src/react/SuperscriptPlugin.tsx
15,21: remove: editor.getType(SubscriptPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/callout/src/lib/transforms/insertCallout.ts
22,13: type: editor.getType(BaseCalloutPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/code-block/src/lib/queries/getCodeLineEntry.ts
21,22: match: { type: editor.getType(BaseCodeLinePlugin) },
33,24: match: { type: editor.getType(BaseCodeLinePlugin) },
42,29: codeLineNode.type !== editor.getType(BaseCodeLinePlugin)

✅ /Users/zbeyens/GitHub/udecode/plate/packages/code-block/src/lib/transforms/insertCodeBlock.ts
19,19: node.type === editor.getType(BaseCodeBlockPlugin) ||
20,19: node.type === editor.getType(BaseCodeLinePlugin);
36,13: type: editor.getType(BaseCodeLinePlugin),
44,13: type: editor.getType(BaseCodeBlockPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/code-block/src/lib/transforms/insertCodeLine.ts
12,13: type: editor.getType(BaseCodeLinePlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/code-block/src/lib/transforms/insertEmptyCodeBlock.ts
21,19: defaultType = editor.getType(BaseParagraphPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/code-block/src/lib/transforms/toggleCodeBlock.ts
12,25: const codeBlockType = editor.getType(BaseCodeBlockPlugin);
13,24: const codeLineType = editor.getType(BaseCodeLinePlugin);

✅ /Users/zbeyens/GitHub/udecode/plate/packages/code-block/src/lib/transforms/unwrapCodeBlock.ts
13,25: const codeBlockType = editor.getType(BaseCodeBlockPlugin);
14,23: const defaultType = editor.getType(BaseParagraphPlugin);

✅ /Users/zbeyens/GitHub/udecode/plate/packages/code-block/src/lib/BaseCodeBlockPlugin.ts
56,30: match: { type: editor.getType(BaseCodeLinePlugin) },
72,26: const codeLineType = editor.getType(BaseCodeLinePlugin);

✅ /Users/zbeyens/GitHub/udecode/plate/packages/code-block/src/lib/withInsertDataCodeBlock.ts
14,28: const codeLineType = editor.getType(BaseCodeLinePlugin);

✅ /Users/zbeyens/GitHub/udecode/plate/packages/code-block/src/lib/withInsertFragmentCodeBlock.ts
17,28: const codeLineType = editor.getType(BaseCodeLinePlugin);

✅ /Users/zbeyens/GitHub/udecode/plate/packages/code-block/src/lib/withNormalizeCodeBlock.tsx
18,29: const codeBlockType = editor.getType(BaseCodeBlockPlugin);
19,28: const codeLineType = editor.getType(BaseCodeLinePlugin);

✅ /Users/zbeyens/GitHub/udecode/plate/packages/code-block/src/react/CodeBlockPlugin.tsx
26,31: editor.tf.toggleBlock(editor.getType(plugin));

✅ /Users/zbeyens/GitHub/udecode/plate/packages/code-block/src/react/onKeyDownCodeBlock.ts
22,22: match: { type: editor.getType(BaseCodeLinePlugin) },

✅ /Users/zbeyens/GitHub/udecode/plate/packages/core/src/lib/editor/withSlate.ts
122,3: editor.getType = (pluginKey) => getPluginType(editor, pluginKey);

✅ /Users/zbeyens/GitHub/udecode/plate/packages/core/src/lib/plugin/getSlatePlugin.ts
43,21: keys.map((key) => editor.getType(key));

✅ /Users/zbeyens/GitHub/udecode/plate/packages/core/src/lib/plugins/slate-extension/SlateExtensionPlugin.ts
34,21: type: editor.getType(BaseParagraphPlugin.key),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/core/src/lib/utils/isType.ts
14,37: keys.forEach((\_key) => types.push(editor.getType(\_key)));

✅ /Users/zbeyens/GitHub/udecode/plate/packages/core/src/lib/utils/normalizeDescendantsToDocumentFragment.ts
127,23: const defaultType = editor.getType(defaultElementPlugin.key);

✅ /Users/zbeyens/GitHub/udecode/plate/packages/csv/src/lib/deserializer/utils/deserializeCsv.ts
/Users/zbeyens/GitHub/udecode/plate/packages/csv/src/lib/deserializer/utils/deserializeCsv.ts
60,23: const paragraph = editor.getType(BaseParagraphPlugin);
61,19: const table = editor.getType({ key: 'table' });
62,16: const th = editor.getType({ key: 'th' });
63,16: const tr = editor.getType({ key: 'tr' });
64,16: const td = editor.getType({ key: 'td' });

✅ /Users/zbeyens/GitHub/udecode/plate/packages/date/src/lib/transforms/insertDate.ts
14,15: type: editor.getType(BaseDatePlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/excalidraw/src/lib/transforms/insertExcalidraw.ts
28,13: type: editor.getType(BaseExcalidrawPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/heading/src/lib/transforms/insertToc.ts
12,13: type: editor.getType(BaseTocPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/heading/src/react/HeadingPlugin.tsx
21,37: editor.tf.toggleBlock(editor.getType(plugin));

✅ /Users/zbeyens/GitHub/udecode/plate/packages/layout/src/lib/transforms/insertColumnGroup.ts
35,24: match: { type: editor.getType(BaseColumnPlugin) },

✅ /Users/zbeyens/GitHub/udecode/plate/packages/layout/src/lib/transforms/setColumns.ts
56,15: type: editor.getType(BaseColumnItemPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/layout/src/lib/transforms/toggleColumnGroup.ts
26,20: match: { type: editor.getType(BaseColumnPlugin) },

✅ /Users/zbeyens/GitHub/udecode/plate/packages/layout/src/lib/withColumn.ts
43,30: child.type === editor.getType(BaseColumnItemPlugin)

✅ /Users/zbeyens/GitHub/udecode/plate/packages/line-height/src/lib/BaseLineHeightPlugin.ts
23,20: [editor.getType(plugin)]: element.style.lineHeight,

✅ /Users/zbeyens/GitHub/udecode/plate/packages/link/src/lib/transforms/unwrapLink.ts
20,24: match: { type: editor.getType(BaseLinkPlugin) },
29,24: n.type === editor.getType(BaseLinkPlugin),
40,24: match: { type: editor.getType(BaseLinkPlugin) },
49,24: n.type === editor.getType(BaseLinkPlugin),
60,22: match: { type: editor.getType(BaseLinkPlugin) },

✅ /Users/zbeyens/GitHub/udecode/plate/packages/link/src/lib/transforms/upsertLink.ts
53,20: match: { type: editor.getType(BaseLinkPlugin) },
86,20: match: { type: editor.getType(BaseLinkPlugin) },

✅ /Users/zbeyens/GitHub/udecode/plate/packages/link/src/lib/transforms/upsertLinkText.ts
17,20: match: { type: editor.getType(BaseLinkPlugin) },

✅ /Users/zbeyens/GitHub/udecode/plate/packages/link/src/lib/transforms/wrapLink.ts
21,13: type: editor.getType(BaseLinkPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/link/src/lib/utils/createLinkNode.ts
18,16: const type = editor.getType(BaseLinkPlugin);

✅ /Users/zbeyens/GitHub/udecode/plate/packages/link/src/react/components/FloatingLink/LinkOpenButton.tsx
22,24: match: { type: editor.getType(LinkPlugin) },

/Users/zbeyens/GitHub/udecode/plate/packages/link/src/react/components/FloatingLink/useFloatingLinkEdit.ts
87,24: match: { type: editor.getType(LinkPlugin) },

✅ /Users/zbeyens/GitHub/udecode/plate/packages/link/src/react/components/useLinkToolbarButton.ts
10,24: match: { type: editor.getType(LinkPlugin) },

/Users/zbeyens/GitHub/udecode/plate/packages/link/src/react/utils/triggerFloatingLinkEdit.ts
11,20: match: { type: editor.getType(LinkPlugin) },

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list/src/lib/BaseListPlugin.ts
116,19: type: editor.getType(BaseParagraphPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list-classic/src/lib/normalizers/normalizeListItem.ts
67,5: editor.getType(BaseBulletedListPlugin),
68,5: editor.getType(BaseListItemContentPlugin),
69,5: editor.getType(BaseNumberedListPlugin),
90,15: type: editor.getType(BaseListItemContentPlugin),
103,13: type: editor.getType(BaseListItemContentPlugin),
135,15: type: editor.getType(BaseListItemContentPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list-classic/src/lib/queries/getHighestEmptyList.ts
37,24: match: { type: editor.getType(BaseListItemPlugin) },

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list-classic/src/lib/queries/getListItemEntry.ts
21,18: const liType = editor.getType(BaseListItemPlugin);

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list-classic/src/lib/queries/getListRoot.ts
26,9: editor.getType(BaseBulletedListPlugin),
27,9: editor.getType(BaseNumberedListPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list-classic/src/lib/queries/getListTypes.ts
10,5: editor.getType(BaseNumberedListPlugin),
11,5: editor.getType(BaseBulletedListPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list-classic/src/lib/queries/getTodoListItemEntry.ts
21,20: const todoType = editor.getType(BaseTodoListPlugin);

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list-classic/src/lib/queries/isAcrossListItems.ts
20,20: match: { type: editor.getType(BaseListItemPlugin) },

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list-classic/src/lib/queries/isListNested.ts
9,35: return listParentNode?.type === editor.getType(BaseListItemPlugin);

/Users/zbeyens/GitHub/udecode/plate/packages/list-classic/src/lib/queries/isListNested.ts
9,35: return listParentNode?.type === editor.getType(BaseListItemPlugin);

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list-classic/src/lib/transforms/insertListItem.ts
10,18: const liType = editor.getType(BaseListItemPlugin);
11,19: const licType = editor.getType(BaseListItemContentPlugin);

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list-classic/src/lib/transforms/insertTodoListItem.ts
13,20: const todoType = editor.getType(BaseTodoListPlugin);

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list-classic/src/lib/transforms/moveListItems.ts
32,13: type: editor.getType(BaseListItemContentPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list-classic/src/lib/transforms/moveListItemUp.ts
30,22: match: { type: editor.getType(BaseListItemPlugin) },

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list-classic/src/lib/transforms/removeListItem.ts
62,21: type: editor.getType(BaseListItemContentPlugin),
65,17: type: editor.getType(BaseListItemPlugin),

/Users/zbeyens/GitHub/udecode/plate/packages/list-classic/src/lib/transforms/toggleList.spec.tsx
43,13: type: editor.getType(BulletedListPlugin),
85,13: type: editor.getType(BulletedListPlugin),
123,13: type: editor.getType(BulletedListPlugin),
165,13: type: editor.getType(BulletedListPlugin),
225,13: type: editor.getType(BulletedListPlugin),
281,13: type: editor.getType(BulletedListPlugin),
337,13: type: editor.getType(BulletedListPlugin),
388,13: type: editor.getType(BulletedListPlugin),
447,13: type: editor.getType(BulletedListPlugin),
489,13: type: editor.getType(BulletedListPlugin),
553,13: type: editor.getType(BulletedListPlugin),
590,32: toggleList(editor, { type: editor.getType(NumberedListPlugin) });
635,32: toggleList(editor, { type: editor.getType(NumberedListPlugin) });
682,32: toggleList(editor, { type: editor.getType(NumberedListPlugin) });
733,32: toggleList(editor, { type: editor.getType(NumberedListPlugin) });

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list-classic/src/lib/transforms/toggleList.ts
54,26: match: { type: editor.getType(BaseParagraphPlugin) },
64,19: type: editor.getType(BaseListItemContentPlugin),
70,17: type: editor.getType(BaseListItemPlugin),
91,47: (commonEntry[0] as TElement).type === editor.getType(BaseListItemPlugin)
147,25: { type: editor.getType(BaseListItemContentPlugin) },
154,21: type: editor.getType(BaseListItemPlugin),
169,30: toggleList(editor, { type: editor.getType(BaseBulletedListPlugin) });
172,30: toggleList(editor, { type: editor.getType(BaseNumberedListPlugin) });

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list-classic/src/lib/transforms/unwrapList.ts
43,27: // match: { type: editor.getType(BaseListItemContentPlugin) },
49,22: // { type: editor.getType(BaseParagraphPlugin) },
56,24: match: { type: editor.getType(BaseListItemPlugin) },
64,13: editor.getType(BaseBulletedListPlugin),
65,13: editor.getType(BaseNumberedListPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list-classic/src/lib/withDeleteForwardList.ts
76,20: const liType = editor.getType(BaseListItemPlugin);
153,21: const licType = editor.getType(BaseListItemContentPlugin);

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list-classic/src/lib/withDeleteFragmentList.ts
18,20: match: { type: editor.getType(BaseListItemPlugin) },
42,28: match: { type: editor.getType(BaseListItemPlugin) },

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list-classic/src/lib/withInsertFragmentList.ts
27,24: const listItemType = editor.getType(BaseListItemPlugin);
28,31: const listItemContentType = editor.getType(BaseListItemContentPlugin);

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list-classic/src/lib/withNormalizeList.ts
29,22: const liType = editor.getType(BaseListItemPlugin);
30,23: const licType = editor.getType(BaseListItemContentPlugin);
31,27: const defaultType = editor.getType(BaseParagraphPlugin);
84,23: node.type === editor.getType(BaseListItemPlugin) &&

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list-classic/src/react/hooks/useListToolbarButton.ts
12,40: editor.api.some({ match: { type: editor.getType({ key: nodeType }) } }),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list-classic/src/react/onKeyDownList.ts
41,22: match: { type: editor.getType(BaseListItemPlugin) },

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list-classic/src/react/withDeleteBackwardList.ts
40,46: match: (node) => node.type === editor.getType(BaseListItemPlugin),
62,42: defaultType: editor.getType(BaseParagraphPlugin),
64,37: types: [editor.getType(BaseListItemPlugin)],
93,33: const licType = editor.getType(BaseListItemContentPlugin);

✅ /Users/zbeyens/GitHub/udecode/plate/packages/list-classic/src/react/withInsertBreakList.ts
47,34: defaultType: editor.getType(BaseParagraphPlugin),
48,29: types: [editor.getType(BaseListItemPlugin)],

✅ /Users/zbeyens/GitHub/udecode/plate/packages/markdown/src/lib/deserializer/deserializeMd.ts
99,17: type: editor.getType(BaseParagraphPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/math/src/lib/transforms/insertEquation.ts
16,13: type: editor.getType(BaseEquationPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/math/src/lib/transforms/insertInlineEquation.ts
16,13: type: editor.getType(BaseInlineEquationPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/media/src/lib/image/transforms/insertImage.ts
13,11: type: editor.getType(BaseImagePlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/media/src/lib/media/insertMedia.ts
24,12: type = editor.getType(BaseImagePlugin),
39,16: if (type === editor.getType(BaseImagePlugin)) {

✅ /Users/zbeyens/GitHub/udecode/plate/packages/media/src/lib/media-embed/transforms/insertMediaEmbed.ts
23,13: type: editor.getType(BaseMediaEmbedPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/media/src/lib/placeholder/transforms/insertPlaceholder.ts
22,15: type: editor.getType(BasePlaceholderPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/media/src/react/media/useMediaState.ts
36,17: (type !== editor.getType(BaseVideoPlugin) &&
37,18: type !== editor.getType(BaseMediaEmbedPlugin))

✅ /Users/zbeyens/GitHub/udecode/plate/packages/media/src/react/placeholder/transforms/insertMedia.ts
83,17: type: editor.getType(BasePlaceholderPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/plate-utils/src/lib/plugins/exit-break/transforms/exitBreak.ts
12,19: defaultType = editor.getType(BaseParagraphPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/plate-utils/src/lib/plugins/trailing-block/TrailingBlockPlugin.ts
31,13: type: editor.getType(BaseParagraphPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/plate-utils/src/react/plugins/BlockPlaceholderPlugin.tsx
75,21: (type) => editor.getType({ key: type }) === element.type

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/lib/api/getEmptyCellNode.ts
18,29: (c) => c.type === editor.getType(BaseTableCellHeaderPlugin)
25,9: ? editor.getType(BaseTableCellHeaderPlugin)
26,9: : editor.getType(BaseTableCellPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/lib/api/getEmptyRowNode.ts
21,11: type: editor.getType(BaseTableRowPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/lib/api/getEmptyTableNode.ts
35,11: type: editor.getType(BaseTablePlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/lib/merge/deleteColumn.ts
17,16: const type = editor.getType(BaseTablePlugin);
122,22: match: { type: editor.getType(BaseTableRowPlugin) },

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/lib/merge/insertTableColumn.ts
47,25: if (table?.type === editor.getType(BaseTablePlugin)) {

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/lib/merge/insertTableRow.ts
46,25: if (table?.type === editor.getType(BaseTablePlugin)) {
54,20: match: { type: editor.getType(BaseTableRowPlugin) },
168,15: type: editor.getType(BaseTableRowPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/lib/merge/mergeTableCells.ts
93,38: cellEntries[0][0].type === editor.getType(BaseTableCellHeaderPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/lib/merge/splitTableCell.ts
22,24: const tableRowType = editor.getType(BaseTableRowPlugin);
33,37: header: cellElem.type === editor.getType(BaseTableCellHeaderPlugin),
134,19: type: editor.getType(BaseTableRowPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/lib/queries/getTableAbove.ts
12,13: type: editor.getType(BaseTablePlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/lib/queries/getTableEntries.ts
29,20: match: { type: editor.getType(BaseTableRowPlugin) },
38,20: match: { type: editor.getType(BaseTablePlugin) },

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/lib/transforms/deleteColumn.ts
39,22: match: { type: editor.getType(BaseTableRowPlugin) },

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/lib/transforms/deleteRow.ts
30,22: match: { type: editor.getType(BaseTableRowPlugin) },

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/lib/transforms/deleteTable.ts
7,22: match: { type: editor.getType(BaseTablePlugin) },
11,22: match: { type: editor.getType(BaseTablePlugin) },

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/lib/transforms/insertTable.ts
22,16: const type = editor.getType(BaseTablePlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/lib/transforms/insertTableColumn.ts
42,25: if (table?.type === editor.getType(BaseTablePlugin)) {
94,33: (c) => c.type === editor.getType(BaseTableCellHeaderPlugin)

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/lib/transforms/insertTableRow.ts
49,25: if (table?.type === editor.getType(BaseTablePlugin)) {
57,20: match: { type: editor.getType(BaseTableRowPlugin) },
79,36: n.children[i].type === editor.getType(BaseTableCellHeaderPlugin)
86,11: type: editor.getType(BaseTableRowPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/lib/utils/computeCellIndices.ts
34,22: match: { type: editor.getType(BaseTablePlugin) },

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/lib/withApplyTable.ts
105,11: editor.getType(BaseTableRowPlugin),

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/lib/withNormalizeTable.ts
38,32: child.type === editor.getType(BaseTableRowPlugin)
97,24: if (n.type === editor.getType(BaseTableRowPlugin)) {
122,41: if (parentEntry?.[0].type !== editor.getType(BaseTableRowPlugin)) {

✅ /Users/zbeyens/GitHub/udecode/plate/packages/table/src/lib/withSetFragmentDataTable.ts
63,26: row.type === editor.getType(BaseTableCellHeaderPlugin)
