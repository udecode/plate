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
import { lineHeightValue } from './lineHeightValue';
import { linkValue } from './linkValue';
import { listValue, todoListValue } from './listValue';
import { mediaValue } from './mediaValue';
import { mentionValue } from './mentionValue';
import { softBreakValue } from './softBreakValue';
import { tabbableValue } from './tabbableValue';
import { tableValue } from './tableValue';

import { settingsStore } from '@/components/context/settings-store';
import { mapNodeId } from '@/plate/demo/mapNodeId';
import { MyValue } from '@/plate/plate.types';

export const usePlaygroundValue = () => {
  const preset = settingsStore.use.value();
  const checkedIds = settingsStore.use.checkedIds();

  return useMemo(() => {
    const value = [...basicElementsValue, ...basicMarksValue];

    if (preset !== 'playground') {
      return value;
    }

    // Marks
    if (checkedIds.color || checkedIds.backgroundColor)
      value.push(...fontValue);
    if (checkedIds.highlight) value.push(...highlightValue);

    // Inline nodes
    if (checkedIds.a) value.push(...linkValue);
    if (checkedIds.mention) value.push(...mentionValue);
    if (checkedIds.emoji) value.push(...emojiValue);

    // Nodes
    if (checkedIds.align) value.push(...alignValue);
    if (checkedIds.lineHeight) value.push(...lineHeightValue);
    if (checkedIds.indent) value.push(...indentValue);
    if (checkedIds.listStyleType) value.push(...indentListValue);
    if (checkedIds.hr) value.push(...horizontalRuleValue);
    if (checkedIds.list) value.push(...listValue);
    if (checkedIds.img || checkedIds.media_embed) value.push(...mediaValue);
    if (checkedIds.table) value.push(...tableValue);
    if (checkedIds.action_item) value.push(...todoListValue);

    // Functionalities
    if (checkedIds.autoformat) value.push(...autoformatValue);
    if (checkedIds.softBreak) value.push(...softBreakValue);
    if (checkedIds.exitBreak) value.push(...exitBreakValue);
    if (checkedIds.dragOverCursor) value.push(...cursorOverlayValue);
    if (checkedIds.tabbable) value.push(...tabbableValue);
    // if (checkedIds.blockSelection) value.push(...blockSelectionValue);
    // if (checkedIds.combobox) value.push(...comboboxValue);
    // if (checkedIds.dnd) value.push(...dndValue);
    // if (checkedIds.nodeId) value.push(...nodeIdValue);
    // if (checkedIds.normalizeTypes) value.push(...normalizeTypesValue);
    // if (checkedIds.resetNode) value.push(...resetNodeValue);
    // if (checkedIds.selectOnBackspace) value.push(...selectOnBackspaceValue);
    // if (checkedIds.singleLine) value.push(...singleLineValue);

    // Collaboration
    if (checkedIds.comment) value.push(...commentsValue);

    // Deserialization
    if (checkedIds.deserializeHtml) value.push(...deserializeHtmlValue);
    if (checkedIds.deserializeDocx) value.push(...deserializeDocxValue);
    if (checkedIds.deserializeMd) value.push(...deserializeMdValue);
    if (checkedIds.deserializeCsv) value.push(...deserializeCsvValue);

    // Exceptions
    if (checkedIds.trailingBlock) value.push(...trailingBlockValue);
    if (checkedIds.excalidraw) value.push(...excalidrawValue);

    return mapNodeId(value) as MyValue;
  }, [
    checkedIds.a,
    checkedIds.action_item,
    checkedIds.align,
    checkedIds.autoformat,
    checkedIds.backgroundColor,
    checkedIds.color,
    checkedIds.comment,
    checkedIds.deserializeCsv,
    checkedIds.deserializeDocx,
    checkedIds.deserializeHtml,
    checkedIds.deserializeMd,
    checkedIds.dragOverCursor,
    checkedIds.emoji,
    checkedIds.excalidraw,
    checkedIds.exitBreak,
    checkedIds.highlight,
    checkedIds.hr,
    checkedIds.img,
    checkedIds.indent,
    checkedIds.lineHeight,
    checkedIds.list,
    checkedIds.listStyleType,
    checkedIds.media_embed,
    checkedIds.mention,
    checkedIds.softBreak,
    checkedIds.tabbable,
    checkedIds.table,
    checkedIds.trailingBlock,
    preset,
  ]);
};
