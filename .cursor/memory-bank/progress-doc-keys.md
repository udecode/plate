# KEYS Migration Progress Document

## Progress Summary

Successfully migrating Plugin.key references throughout the Plate codebase to use centralized KEYS constant from @udecode/plate for better type safety and maintainability.

## Migration Patterns Applied

- **Plugin.key → KEYS.{type}**: `ParagraphPlugin.key` → `KEYS.p`, `HeadingPlugin.key` → `KEYS.h1-h6`
- **Hardcoded strings → KEYS**: `'p'` → `KEYS.p`, `type: 'blockquote'` → `KEYS.blockquote`
- **Component mappings**: `[PluginName.key]: Component` → `[KEYS.type]: Component`
- **Plugin configurations**: Updated `targetPlugins` arrays to use KEYS
- **Import management**: Added KEYS imports, removed unused Plugin imports

## Completed Files

### Apps/WWW (Website)

✅ `apps/www/src/app/(app)/docs/examples/server-side/page.tsx`

### Documentation

✅ `docs/api/core/plate-controller.mdx`
✅ `docs/api/core/plate-controller.cn.mdx`

### AI Package

✅ `packages/ai/src/react/ai-chat/transforms/removeAnchorAIChat.ts`
✅ `packages/ai/src/react/ai-chat/useAIChatHook.ts`
✅ `packages/ai/src/react/ai-chat/withAIChat.ts`

### Alignment Package

✅ `packages/alignment/src/lib/BaseAlignPlugin.ts`

### Autoformat Package

✅ `packages/autoformat/src/lib/transforms/autoformatBlock.ts`

### Block Quote Package

✅ `packages/block-quote/src/lib/withBlockquote.ts`

### Diff Package

✅ `packages/diff/src/internal/transforms/transformDiffTexts.ts`

### Docx Package

✅ `packages/docx/src/lib/DocxPlugin.ts`

### Emoji Package

✅ `packages/emoji/src/lib/BaseEmojiPlugin.ts`

### Font Package

✅ `packages/font/src/lib/transforms/setBlockBackgroundColor.ts`
✅ `packages/font/src/lib/transforms/setFontSize.ts`

### Heading Package

✅ `packages/heading/src/react/HeadingPlugin.tsx`

### Indent Package

✅ `packages/indent/src/lib/BaseIndentPlugin.ts`
✅ `packages/indent/src/lib/BaseTextIndentPlugin.ts`

### Layout Package

✅ `packages/layout/src/lib/transforms/insertColumn.ts`
✅ `packages/layout/src/lib/transforms/insertColumnGroup.ts`
✅ `packages/layout/src/lib/transforms/toggleColumnGroup.ts`
✅ `packages/layout/src/lib/withColumn.ts`
✅ `packages/layout/src/react/onKeyDownColumn.ts`

### Line-height Package

✅ `packages/line-height/src/lib/BaseLineHeightPlugin.ts`
✅ `packages/line-height/src/react/hooks/useLineHeightDropdownMenu.ts`

### List Package

✅ `packages/list/src/lib/normalizers/normalizeListNotIndented.ts`
✅ `packages/list/src/lib/queries/getSiblingList.ts`
✅ `packages/list/src/lib/transforms/setListNode.ts`
✅ `packages/list/src/lib/transforms/setListNodes.ts`
✅ `packages/list/src/lib/transforms/setListSiblingNodes.ts`
✅ `packages/list/src/lib/transforms/toggleList.ts`
✅ `packages/list/src/lib/transforms/toggleListByPath.ts`

### List-classic Package

✅ `packages/list-classic/src/react/hooks/useListToolbarButton.ts`

### Media Package

✅ `packages/media/src/react/image/openImagePreview.ts`
✅ `packages/media/src/react/placeholder/hooks/usePlaceholderElement.ts`
✅ `packages/media/src/react/placeholder/hooks/usePlaceholderPopover.ts`
✅ `packages/media/src/react/placeholder/utils/history.ts`
✅ `packages/media/src/react/placeholder/PlaceholderPlugin.tsx`
✅ `packages/media/src/react/placeholder/type.ts`

### Mention Package

✅ `packages/mention/src/lib/BaseMentionPlugin.ts`
✅ `packages/mention/src/lib/getMentionOnSelectItem.ts`

### Slash Command Package

✅ `packages/slash-command/src/lib/BaseSlashPlugin.ts`

### Suggestion Package

✅ `packages/suggestion/src/lib/queries/findSuggestionNode.ts`
✅ `packages/suggestion/src/lib/transforms/acceptSuggestion.ts`
✅ `packages/suggestion/src/lib/transforms/addMarkSuggestion.ts`
✅ `packages/suggestion/src/lib/transforms/deleteSuggestion.ts`
✅ `packages/suggestion/src/lib/transforms/getSuggestionProps.ts`
✅ `packages/suggestion/src/lib/transforms/insertFragmentSuggestion.ts`
✅ `packages/suggestion/src/lib/transforms/rejectSuggestion.ts`
✅ `packages/suggestion/src/lib/transforms/removeMarkSuggestion.ts`
✅ `packages/suggestion/src/lib/transforms/removeNodesSuggestion.ts`
✅ `packages/suggestion/src/lib/transforms/setSuggestionNodes.ts`
✅ `packages/suggestion/src/lib/BaseSuggestionPlugin.ts`
✅ `packages/suggestion/src/lib/utils/getSuggestionId.ts`
✅ `packages/suggestion/src/lib/utils/getSuggestionKeys.ts`
✅ `packages/suggestion/src/lib/diffToSuggestions.ts`
✅ `packages/suggestion/src/lib/withSuggestion.ts`

### Table Package

✅ `packages/table/src/lib/merge/deleteColumnWhenExpanded.ts`
✅ `packages/table/src/lib/transforms/setTableColSize.ts`
✅ `packages/table/src/lib/BaseTablePlugin.ts`
✅ `packages/table/src/lib/transforms/setTableMarginLeft.ts`
✅ `packages/table/src/lib/transforms/setTableRowSize.ts`
✅ `packages/table/src/lib/withInsertFragmentTable.ts`
✅ `packages/table/src/react/components/TableCellElement/useTableCellElementResizable.ts`
✅ `packages/table/src/react/components/TableCellElement/useTableCellSize.ts`
✅ `packages/table/src/react/components/TableElement/useTableColSizes.ts`
✅ `packages/table/src/react/hooks/useTableMergeState.ts`

### Toggle Package

✅ `packages/toggle/src/react/withToggle.ts`
✅ `packages/toggle/src/react/toggleIndexAtom.ts`

### Documentation (Previously Completed - 30+ files)

✅ All documentation files in `/docs` directory
✅ Multiple API references and migration guides

## Migration Summary

**Total Files Completed**: 74+ files across the entire Plate codebase

- Successfully migrated from individual Plugin.key references to centralized KEYS constant system
- Improved type safety and maintainability
- Enhanced developer experience with consistent key usage
- Established unified plugin key management

## Benefits Achieved

- **Centralized key management** through single KEYS constant
- **Type safety improvements** with consistent key usage
- **Better maintainability** with unified key system
- **Developer experience** improvements with autocomplete support
- **Consistency** across entire codebase

## Recent Additions

### Documentation Migration (Latest)

- `docs/api/core/plate-controller.mdx`: Updated `BoldPlugin.key` → `KEYS.bold`, added KEYS import
- `docs/api/core/plate-controller.cn.mdx`: Updated `BoldPlugin.key` → `KEYS.bold`, added KEYS import
- `docs/ai.mdx`: Updated `BaseParagraphPlugin.key` → `KEYS.p`, `BaseBlockquotePlugin.key` → `KEYS.blockquote`, `BaseCodeBlockPlugin.key` → `KEYS.codeBlock`, added KEYS import
- `docs/ai.cn.mdx`: Updated `BaseParagraphPlugin.key` → `KEYS.p`, `BaseBlockquotePlugin.key` → `KEYS.blockquote`, `BaseCodeBlockPlugin.key` → `KEYS.codeBlock`, added KEYS import
- `docs/alignment.cn.mdx`: Updated `ParagraphPlugin.key` → `KEYS.p`, `HeadingPlugin.key` → `KEYS.h1`, added KEYS import
