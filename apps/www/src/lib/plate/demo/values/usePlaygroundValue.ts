import { useMemo } from 'react';
import { alignValue } from './alignValue';
import { autoformatValue } from './autoformatValue';
import { basicElementsValue } from './basicElementsValue';
import { basicMarksValue } from './basicMarksValue';
import { commentsValue } from './commentsValue';
import { cursorOverlayValue } from './cursorOverlayValue';
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
import { tableValue } from './tableValue';

import { settingsStore } from '@/components/context/settings-store';
import { settingValues, ValueId } from '@/config/setting-values';
import { mapNodeId } from '@/plate/demo/mapNodeId';
import { MyValue } from '@/types/plate-types';

export const usePlaygroundValue = (id?: ValueId) => {
  let valueId = settingsStore.use.valueId();
  if (id) {
    valueId = id;
  }
  const enabled = settingsStore.use.checkedPlugins();

  return useMemo(() => {
    const value = [...basicElementsValue, ...basicMarksValue];

    if (valueId !== settingValues.playground.id) {
      const newValue = settingValues[valueId].value ?? [];

      if (newValue.length === 0) {
        return mapNodeId(value);
      }
      return mapNodeId(newValue);
    }

    // Marks
    if (enabled.color || enabled.backgroundColor) value.push(...fontValue);
    if (enabled.highlight) value.push(...highlightValue);
    if (enabled.kbd) value.push(...kbdValue);

    // Inline nodes
    if (enabled.a) value.push(...linkValue);
    if (enabled.mention) value.push(...mentionValue);
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
    if (enabled.action_item) value.push(...todoListValue);

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
    if (enabled.deserializeMd) value.push(...deserializeMdValue);
    if (enabled.deserializeDocx) value.push(...deserializeDocxValue);
    if (enabled.deserializeCsv) value.push(...deserializeCsvValue);

    // Exceptions
    if (enabled.trailingBlock) value.push(...trailingBlockValue);
    if (enabled.excalidraw) value.push(...excalidrawValue);

    return mapNodeId(value) as MyValue;
  }, [
    enabled.a,
    enabled.action_item,
    enabled.align,
    enabled.autoformat,
    enabled.backgroundColor,
    enabled.color,
    enabled.comment,
    enabled.deserializeCsv,
    enabled.deserializeDocx,
    enabled.deserializeMd,
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
    enabled.trailingBlock,
    valueId,
  ]);
};
