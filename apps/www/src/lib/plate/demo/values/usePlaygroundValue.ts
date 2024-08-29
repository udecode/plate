import { useMemo } from 'react';

import type { MyValue } from '@/types/plate-types';

import { settingsStore } from '@/components/context/settings-store';
import { type ValueId, customizerPlugins } from '@/config/customizer-plugins';
import { mapNodeId } from '@/plate/demo/mapNodeId';

import { alignValue } from './alignValue';
import { autoformatValue } from './autoformatValue';
import { basicElementsValue } from './basicElementsValue';
import { basicMarksValue } from './basicMarksValue';
import { columnValue } from './columnValue';
import { commentsValue } from './commentsValue';
import { cursorOverlayValue } from './cursorOverlayValue';
import { dateValue } from './dateValue';
import { deserializeCsvValue } from './deserializeCsvValue';
import { deserializeDocxValue } from './deserializeDocxValue';
import { deserializeHtmlValue } from './deserializeHtmlValue';
import { deserializeMdValue } from './deserializeMdValue';
import { emojiValue } from './emojiValue';
import { excalidrawValue } from './excalidrawValue';
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
import { softBreakValue } from './softBreakValue';
import { tabbableValue } from './tabbableValue';
import { tableMergeValue, tableValue } from './tableValue';
import { toggleValue } from './toggleValue';

export const usePlaygroundValue = (id?: ValueId): MyValue => {
  let valueId = settingsStore.use.valueId();

  if (id) {
    valueId = id;
  }

  const enabled = settingsStore.use.checkedPlugins();

  return useMemo(() => {
    const value = [...basicElementsValue];

    if (enabled.action_item) value.push(...todoListValue);
    if (enabled.a) value.push(...linkValue);

    value.push(...basicMarksValue);

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
    // Marks
    if (enabled.color || enabled.backgroundColor) value.push(...fontValue);
    if (enabled.highlight) value.push(...highlightValue);
    if (enabled.kbd) value.push(...kbdValue);
    // Inline nodes
    if (enabled.mention) value.push(...mentionValue);
    if (enabled.data) value.push(...dateValue);
    if (enabled.emoji) value.push(...emojiValue);
    // Nodes
    if (enabled.align) value.push(...alignValue);
    if (enabled.lineHeight) value.push(...lineHeightValue);
    if (enabled.indent) value.push(...indentValue);
    if (enabled.listStyleType) value.push(...indentListValue);
    if (enabled.hr) value.push(...horizontalRuleValue);
    if (enabled.list) value.push(...listValue);
    if (enabled.img || enabled.media_embed) value.push(...mediaValue);
    if (enabled.table) value.push(...tableValue);
    if (enabled.column) value.push(...columnValue);
    if (enabled.toggle) value.push(...toggleValue);
    // Functionalities
    if (enabled.autoformat) value.push(...autoformatValue);
    if (enabled.softBreak) value.push(...softBreakValue);
    if (enabled.exitBreak) value.push(...exitBreakValue);
    if (enabled.dragOverCursor) value.push(...cursorOverlayValue);
    if (enabled.tabbable) value.push(...tabbableValue);
    // Collaboration
    if (enabled.comment) value.push(...commentsValue);

    // Deserialization
    value.push(...deserializeHtmlValue);

    if (enabled.markdown) value.push(...deserializeMdValue);
    if (enabled.docx) value.push(...deserializeDocxValue);
    if (enabled.csv) value.push(...deserializeCsvValue);
    // Exceptions
    if (enabled.trailingBlock) value.push(...trailingBlockValue);
    if (enabled.excalidraw) value.push(...excalidrawValue);

    return mapNodeId(value);
  }, [
    enabled.a,
    enabled.action_item,
    enabled.align,
    enabled.autoformat,
    enabled.backgroundColor,
    enabled.color,
    enabled.comment,
    enabled.csv,
    enabled.docx,
    enabled.markdown,
    enabled.dragOverCursor,
    enabled.emoji,
    enabled.excalidraw,
    enabled.exitBreak,
    enabled.highlight,
    enabled.hr,
    enabled.img,
    enabled.indent,
    enabled.kbd,
    enabled.lineHeight,
    enabled.list,
    enabled.listStyleType,
    enabled.media_embed,
    enabled.mention,
    enabled.softBreak,
    enabled.tabbable,
    enabled.table,
    enabled.toggle,
    enabled.trailingBlock,
    enabled.column,
    enabled.data,
    valueId,
  ]);
};
