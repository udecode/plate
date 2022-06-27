import { alignValue } from './align/alignValue';
import { autoformatValue } from './autoformat/autoformatValue';
import { basicElementsValue } from './basic-elements/basicElementsValue';
import { basicMarksValue } from './basic-marks/basicMarksValue';
import { excalidrawValue } from './excalidraw/excalidrawValue';
import { exitBreakValue } from './exit-break/exitBreakValue';
import { fontValue } from './font/fontValue';
import { forcedLayoutValue } from './forced-layout/forcedLayoutValue';
import { highlightValue } from './highlight/highlightValue';
import { horizontalRuleValue } from './horizontal-rule/horizontalRuleValue';
import { imageValue } from './image/imageValue';
import { indentValue } from './indent/indentValue';
import { lineHeightValue } from './line-height/lineHeightValue';
import { linkValue } from './link/linkValue';
import { listValue } from './list/listValue';
import { mediaEmbedValue } from './media-embed/mediaEmbedValue';
import { mentionValue } from './mention/mentionValue';
import { deserializeCsvValue } from './serializing-csv/deserializeCsvValue';
import { deserializeDocxValue } from './serializing-docx/deserializeDocxValue';
import { deserializeHtmlValue } from './serializing-html/deserializeHtmlValue';
import { deserializeMdValue } from './serializing-md/deserializeMdValue';
import { softBreakValue } from './soft-break/softBreakValue';
import { tableValue } from './table/tableValue';
import { getNodesWithRandomId } from './utils';

// TODO: dnd example
export const playgroundValue: any = getNodesWithRandomId([
  ...forcedLayoutValue,
  ...basicMarksValue,
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
  ...imageValue,
  ...mediaEmbedValue,
  ...excalidrawValue,
  ...autoformatValue,
  ...softBreakValue,
  ...exitBreakValue,
  ...deserializeHtmlValue,
  ...deserializeDocxValue,
  ...deserializeMdValue,
  ...deserializeCsvValue,
]);
