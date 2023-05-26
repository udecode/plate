import { alignValue } from '@/plate/align/alignValue';
import { autoformatValue } from '@/plate/autoformat/autoformatValue';
import { basicElementsValue } from '@/plate/basic-elements/basicElementsValue';
import { basicMarksValue } from '@/plate/basic-marks/basicMarksValue';
import { commentsValue } from '@/plate/comments/constants';
import { mapNodeId } from '@/plate/common/mapNodeId';
import { cursorOverlayValue } from '@/plate/cursor-overlay/cursorOverlayValue';
import { excalidrawValue } from '@/plate/excalidraw/excalidrawValue';
import { exitBreakValue } from '@/plate/exit-break/exitBreakValue';
import { fontValue } from '@/plate/font/fontValue';
import { forcedLayoutValue } from '@/plate/forced-layout/forcedLayoutValue';
import { highlightValue } from '@/plate/highlight/highlightValue';
import { horizontalRuleValue } from '@/plate/horizontal-rule/horizontalRuleValue';
import { indentValue } from '@/plate/indent/indentValue';
import { kbdValue } from '@/plate/kbd/kbdValue';
import { lineHeightValue } from '@/plate/line-height/lineHeightValue';
import { linkValue } from '@/plate/link/linkValue';
import { listValue } from '@/plate/list/listValue';
import { mediaValue } from '@/plate/media/mediaValue';
import { mentionValue } from '@/plate/mention/mentionValue';
import { deserializeCsvValue } from '@/plate/serializing-csv/deserializeCsvValue';
import { deserializeDocxValue } from '@/plate/serializing-docx/deserializeDocxValue';
import { deserializeHtmlValue } from '@/plate/serializing-html/deserializeHtmlValue';
import { deserializeMdValue } from '@/plate/serializing-md/deserializeMdValue';
import { softBreakValue } from '@/plate/soft-break/softBreakValue';
import { tableValue } from '@/plate/table/tableValue';

export const playgroundValue: any = mapNodeId([
  ...forcedLayoutValue,
  ...basicMarksValue,
  ...kbdValue,
  ...fontValue,
  ...highlightValue,
  ...basicElementsValue,
  ...horizontalRuleValue,
  ...alignValue,
  ...lineHeightValue,
  ...indentValue,
  ...listValue,
  ...tableValue,
  ...linkValue,
  ...mentionValue,
  ...mediaValue,
  ...commentsValue,
  ...excalidrawValue,
  ...autoformatValue,
  ...softBreakValue,
  ...exitBreakValue,
  ...cursorOverlayValue,
  ...deserializeHtmlValue,
  ...deserializeDocxValue,
  ...deserializeMdValue,
  ...deserializeCsvValue,
]);
