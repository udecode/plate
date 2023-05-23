import { autoformatValue } from '@/plate/autoformat/autoformatValue';
import { mapNodeId } from '@/plate/common/mapNodeId';
import { excalidrawValue } from '@/plate/excalidraw/excalidrawValue';
import { exitBreakValue } from '@/plate/exit-break/exitBreakValue';
import { linkValue } from '@/plate/link/linkValue';
import { mediaValue } from '@/plate/media/mediaValue';
import { mentionValue } from '@/plate/mention/mentionValue';
import { deserializeCsvValue } from '@/plate/serializing-csv/deserializeCsvValue';
import { deserializeDocxValue } from '@/plate/serializing-docx/deserializeDocxValue';
import { deserializeHtmlValue } from '@/plate/serializing-html/deserializeHtmlValue';
import { deserializeMdValue } from '@/plate/serializing-md/deserializeMdValue';
import { softBreakValue } from '@/plate/soft-break/softBreakValue';
import { tableValue } from '@/plate/table/tableValue';

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
  ...tableValue,
  ...linkValue,
  ...mentionValue,
  ...mediaValue,
  ...excalidrawValue,
  ...autoformatValue,
  ...softBreakValue,
  ...exitBreakValue,
  ...deserializeHtmlValue,
  ...deserializeDocxValue,
  ...deserializeMdValue,
  ...deserializeCsvValue,
]);
