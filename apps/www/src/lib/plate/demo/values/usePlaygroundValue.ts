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
  const checked = settingsStore.use.checkedPlugins();

  return useMemo(() => {
    const value = [...basicElementsValue, ...basicMarksValue];

    if (preset !== 'playground') {
      return value;
    }

    // Marks
    if (checked.color || checked.backgroundColor) value.push(...fontValue);
    if (checked.highlight) value.push(...highlightValue);

    // Inline nodes
    if (checked.a) value.push(...linkValue);
    if (checked.mention) value.push(...mentionValue);
    if (checked.emoji) value.push(...emojiValue);

    // Nodes
    if (checked.align) value.push(...alignValue);
    if (checked.lineHeight) value.push(...lineHeightValue);
    if (checked.indent) value.push(...indentValue);
    if (checked.listStyleType) value.push(...indentListValue);
    if (checked.hr) value.push(...horizontalRuleValue);
    if (checked.list) value.push(...listValue);
    if (checked.img || checked.media_embed) value.push(...mediaValue);
    if (checked.table) value.push(...tableValue);
    if (checked.action_item) value.push(...todoListValue);

    // Functionalities
    if (checked.autoformat) value.push(...autoformatValue);
    if (checked.softBreak) value.push(...softBreakValue);
    if (checked.exitBreak) value.push(...exitBreakValue);
    if (checked.dragOverCursor) value.push(...cursorOverlayValue);
    if (checked.tabbable) value.push(...tabbableValue);
    // if (checkedIds.blockSelection) value.push(...blockSelectionValue);
    // if (checkedIds.combobox) value.push(...comboboxValue);
    // if (checkedIds.dnd) value.push(...dndValue);
    // if (checkedIds.nodeId) value.push(...nodeIdValue);
    // if (checkedIds.normalizeTypes) value.push(...normalizeTypesValue);
    // if (checkedIds.resetNode) value.push(...resetNodeValue);
    // if (checkedIds.selectOnBackspace) value.push(...selectOnBackspaceValue);
    // if (checkedIds.singleLine) value.push(...singleLineValue);

    // Collaboration
    if (checked.comment) value.push(...commentsValue);

    // Deserialization
    // if (checkedIds.deserializeHtml) value.push(...deserializeHtmlValue);
    value.push(...deserializeHtmlValue);
    if (checked.deserializeMd) value.push(...deserializeMdValue);
    if (checked.deserializeDocx) value.push(...deserializeDocxValue);
    if (checked.deserializeCsv) value.push(...deserializeCsvValue);

    // Exceptions
    if (checked.trailingBlock) value.push(...trailingBlockValue);
    if (checked.excalidraw) value.push(...excalidrawValue);

    return mapNodeId(value) as MyValue;
  }, [
    checked.a,
    checked.action_item,
    checked.align,
    checked.autoformat,
    checked.backgroundColor,
    checked.color,
    checked.comment,
    checked.deserializeCsv,
    checked.deserializeDocx,
    checked.deserializeMd,
    checked.dragOverCursor,
    checked.emoji,
    checked.excalidraw,
    checked.exitBreak,
    checked.highlight,
    checked.hr,
    checked.img,
    checked.indent,
    checked.lineHeight,
    checked.list,
    checked.listStyleType,
    checked.media_embed,
    checked.mention,
    checked.softBreak,
    checked.tabbable,
    checked.table,
    checked.trailingBlock,
    preset,
  ]);
};
