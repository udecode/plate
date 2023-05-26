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

import { mapNodeId } from '@/plate/demo/mapNodeId';

export const playgroundValue: any = mapNodeId([
  ...basicElementsValue,
  ...basicMarksValue,
  ...kbdValue,
  ...fontValue,
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
  ...excalidrawValue,
]);
