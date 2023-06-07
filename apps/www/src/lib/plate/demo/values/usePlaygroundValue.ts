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
import { exitBreakValue } from './exitBreakValue';
import { fontValue } from './fontValue';
import { highlightValue } from './highlightValue';
import { horizontalRuleValue } from './horizontalRuleValue';
import { indentListValue } from './indentListValue';
import { indentValue } from './indentValue';
import { kbdValue } from './kbdValue';
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

    value.push(...kbdValue);
    if (checkedIds.color) value.push(...fontValue);

    value.push(
      ...highlightValue,
      ...horizontalRuleValue,
      ...alignValue,
      ...lineHeightValue,
      ...indentValue,
      ...indentListValue,
      // ...listValue,
      ...mediaValue,
      ...tableValue,
      ...linkValue,
      ...mentionValue,
      ...emojiValue,
      ...commentsValue,
      ...autoformatValue,
      ...softBreakValue,
      ...exitBreakValue,
      ...tabbableValue,
      ...cursorOverlayValue,
      ...deserializeHtmlValue,
      ...deserializeDocxValue,
      ...deserializeMdValue,
      ...deserializeCsvValue,
      ...excalidrawValue
    );

    return mapNodeId(value) as MyValue;
  }, [checkedIds]);
};
