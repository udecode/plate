import { useMemo } from 'react';
import { alignValue } from './alignValue';
import { autoformatValue } from './autoformatValue';
import { basicElementsValue } from './basicElementsValue';
import { basicMarksValue } from './basicMarksValue';
import { commentsValue } from './commentsValue';
import { deserializeCsvValue } from './deserializeCsvValue';
import { deserializeDocxValue } from './deserializeDocxValue';
import { deserializeHtmlValue } from './deserializeHtmlValue';
import { deserializeMdValue } from './deserializeMdValue';
import { emojiValue } from './emojiValue';
import { excalidrawValue } from './excalidrawValue';
import { exitBreakValue } from './exitBreakValue';
import { fontValue } from './fontValue';
import { highlightValue } from './highlightValue';
import { horizontalRuleValue } from './horizontalRuleValue';
import { indentListValue } from './indentListValue';
import { indentValue } from './indentValue';
import { lineHeightValue } from './lineHeightValue';
import { linkValue } from './linkValue';
import { mediaValue } from './mediaValue';
import { mentionValue } from './mentionValue';
import { softBreakValue } from './softBreakValue';
import { tabbableValue } from './tabbableValue';
import { tableValue } from './tableValue';

import { settingsStore } from '@/components/context/settings-store';
import { mapNodeId } from '@/plate/demo/mapNodeId';
import { MyValue } from '@/plate/plate.types';

export const usePlaygroundValue = () => {
  const checkedIds = settingsStore.use.checkedIds();

  return useMemo(() => {
    const value = [...basicElementsValue, ...basicMarksValue];

    // if (checkedIds.kbd) value.push(...kbdValue);
    if (checkedIds.color) value.push(...fontValue);
    if (checkedIds.hr) value.push(...horizontalRuleValue);
    if (checkedIds.highlight) value.push(...highlightValue);
    if (checkedIds.table) value.push(...tableValue);
    if (checkedIds.media_embed) value.push(...mediaValue);
    if (checkedIds.a) value.push(...linkValue);
    if (checkedIds.align) value.push(...alignValue);
    if (checkedIds.lineHeight) value.push(...lineHeightValue);
    if (checkedIds.indent) value.push(...indentValue);
    if (checkedIds.softBreak) value.push(...softBreakValue);
    if (checkedIds.exitBreak) value.push(...exitBreakValue);
    if (checkedIds.autoformat) value.push(...autoformatValue);
    if (checkedIds.mention) value.push(...mentionValue);
    if (checkedIds.tabbable) value.push(...tabbableValue);
    if (checkedIds.deserializeMd) value.push(...deserializeMdValue);
    if (checkedIds.deserializeCsv) value.push(...deserializeCsvValue);
    if (checkedIds.deserializeDocx) value.push(...deserializeDocxValue);
    if (checkedIds.excalidraw) value.push(...excalidrawValue);
    if (checkedIds.emoji) value.push(...emojiValue);
    if (checkedIds.listStyleType) value.push(...indentListValue);
    if (checkedIds.comment) value.push(...commentsValue);
    if (checkedIds.deserializeHtml) value.push(...deserializeHtmlValue);
    // if (checkedIds.dragOverCursor) value.push(...cursorOverlayValue);

    value.push();

    return mapNodeId(value) as MyValue;
  }, [checkedIds]);
};
