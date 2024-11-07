import { useMemo } from 'react';

import type { Value } from '@udecode/slate';

import { settingsStore } from '@/components/context/settings-store';
import { type ValueId, customizerPlugins } from '@/config/customizer-plugins';
import { mapNodeId } from '@/plate/demo/mapNodeId';

import { aiValue } from './aiValue';
import { alignValue } from './alignValue';
import { autoformatValue } from './autoformatValue';
import { basicElementsValue } from './basicElementsValue';
import { basicMarksValue } from './basicMarksValue';
import { blockMenuValue } from './blockMenuValue';
import { blockSelectionValue } from './blockSelectionValue';
import { columnValue } from './columnValue';
import { commentsValue } from './commentsValue';
import { copilotValue } from './copilotValue';
import { cursorOverlayValue } from './cursorOverlayValue';
import { dateValue } from './dateValue';
import { deserializeCsvValue } from './deserializeCsvValue';
import { deserializeDocxValue } from './deserializeDocxValue';
import { deserializeHtmlValue } from './deserializeHtmlValue';
import { deserializeMdValue } from './deserializeMdValue';
import { emojiValue } from './emojiValue';
import { exitBreakValue, trailingBlockValue } from './exitBreakValue';
import { fontValue } from './fontValue';
import { highlightValue } from './highlightValue';
import { horizontalRuleValue } from './horizontalRuleValue';
import { indentListValue } from './indentListValue';
import { indentValue } from './indentValue';
import { kbdValue } from './kbdValue';
import { lineHeightValue } from './lineHeightValue';
import { linkValue } from './linkValue';
import { listValue, todoListValue } from './listValue';
import { mediaValue } from './mediaValue';
import { mentionValue } from './mentionValue';
import { slashCommandValue } from './slashCommandValue';
import { softBreakValue } from './softBreakValue';
import { tabbableValue } from './tabbableValue';
import { tableMergeValue, tableValue } from './tableValue';
import { tocPlaygroundValue } from './tocValue';
import { toggleValue } from './toggleValue';

export const usePlaygroundValue = (id?: ValueId): Value => {
  let valueId = settingsStore.use.valueId();

  if (id) {
    valueId = id;
  }

  const version = settingsStore.use.version();

  return useMemo(() => {
    const enabled = settingsStore.get.checkedPlugins();

    let value: any[] = [...basicElementsValue, ...basicMarksValue];

    if (!version) return value;
    if (valueId === 'tableMerge') {
      return mapNodeId(tableMergeValue);
    }
    if (valueId !== customizerPlugins.playground.id) {
      let newValue = (customizerPlugins as any)[valueId]?.value ?? value;

      if (newValue.length === 0) {
        newValue = value;
      }

      return mapNodeId(newValue);
    }

    value = [{ children: [{ text: 'Playground' }], type: 'h1' }];

    // TOC
    if (enabled.toc) value.push(...tocPlaygroundValue);

    // AI
    value.push({ children: [{ text: 'AI' }], type: 'h1' });

    if (enabled.ai) value.push(...aiValue);
    if (enabled.copilot) value.push(...copilotValue);

    // Standard Markdown nodes
    value.push(
      { children: [{ text: 'Nodes' }], type: 'h1' },
      ...basicElementsValue,
      ...basicMarksValue
    );

    if (enabled.list) value.push(...listValue);
    if (enabled.action_item) value.push(...todoListValue);
    if (enabled.a) value.push(...linkValue);
    if (enabled.hr) value.push(...horizontalRuleValue);
    if (enabled.table) value.push(...tableValue);
    if (enabled.img || enabled.media_embed) value.push(...mediaValue);
    if (enabled.column) value.push(...columnValue);
    if (enabled.mention) value.push(...mentionValue);
    if (enabled.date) value.push(...dateValue);
    if (enabled.emoji) value.push(...emojiValue);
    if (enabled.color || enabled.backgroundColor) value.push(...fontValue);
    if (enabled.highlight) value.push(...highlightValue);
    if (enabled.kbd) value.push(...kbdValue);
    if (enabled.comment) value.push(...commentsValue);

    // Layout and structure
    value.push({ children: [{ text: 'Layout' }], type: 'h1' });

    if (enabled.align) value.push(...alignValue);
    if (enabled.lineHeight) value.push(...lineHeightValue);
    if (enabled.indent) value.push(...indentValue);
    if (enabled.listStyleType) value.push(...indentListValue);
    if (enabled.toggle) value.push(...toggleValue);

    // Functionality
    value.push({ children: [{ text: 'Functionality' }], type: 'h1' });

    if (enabled.slash_command) value.push(...slashCommandValue);
    if (enabled.blockSelection) value.push(...blockSelectionValue);
    if (enabled.blockMenu) value.push(...blockMenuValue);
    if (enabled.autoformat) value.push(...autoformatValue);
    if (enabled.softBreak) value.push(...softBreakValue);
    if (enabled.exitBreak) value.push(...exitBreakValue);
    if (enabled.dragOverCursor) value.push(...cursorOverlayValue);
    if (enabled.tabbable) value.push(...tabbableValue);
    if (enabled.trailingBlock) value.push(...trailingBlockValue);

    // Deserialization
    value.push({ children: [{ text: 'Deserialization' }], type: 'h1' });

    if (enabled.html) value.push(...deserializeHtmlValue);
    if (enabled.markdown) value.push(...deserializeMdValue);
    if (enabled.docx) value.push(...deserializeDocxValue);
    if (enabled.csv) value.push(...deserializeCsvValue);

    return mapNodeId(value);
  }, [valueId, version]);
};
