import { commentsValue } from '@/plate/comments/constants';
import { mapNodeId } from '@/plate/common/mapNodeId';
import { deserializeCsvValue } from '@/plate/serializing-csv/deserializeCsvValue';
import { deserializeDocxValue } from '@/plate/serializing-docx/deserializeDocxValue';
import { deserializeHtmlValue } from '@/plate/serializing-html/deserializeHtmlValue';
import { deserializeMdValue } from '@/plate/serializing-md/deserializeMdValue';

export const playgroundValue: any = mapNodeId([
  // ...forcedLayoutValue,
  // ...basicMarksValue,
  // ...kbdValue,
  // ...fontValue,
  // ...highlightValue,
  // ...basicElementsValue,
  // ...horizontalRuleValue,
  // ...alignValue,
  // ...lineHeightValue,
  // ...indentValue,
  // ...listValue,
  // ...tableValue,
  // ...linkValue,
  // ...mentionValue,
  // ...mediaValue,
  // ...excalidrawValue,
  // ...autoformatValue,
  // ...softBreakValue,
  // ...exitBreakValue,
  ...commentsValue,
  ...deserializeHtmlValue,
  ...deserializeDocxValue,
  ...deserializeMdValue,
  ...deserializeCsvValue,
]);
