export const playgroundValueCode = `import { alignValue } from './align/alignValue';
import { autoformatValue } from './autoformat/autoformatValue';
import { basicElementsValue } from './basic-elements/basicElementsValue';
import { basicMarksValue } from './basic-marks/basicMarksValue';
import { mapNodeId } from './common/mapNodeId';
import { excalidrawValue } from './excalidraw/excalidrawValue';
import { exitBreakValue } from './exit-break/exitBreakValue';
import { fontValue } from './font/fontValue';
import { forcedLayoutValue } from './forced-layout/forcedLayoutValue';
import { highlightValue } from './highlight/highlightValue';
import { horizontalRuleValue } from './horizontal-rule/horizontalRuleValue';
import { indentValue } from './indent/indentValue';
import { kbdValue } from './kbd/kbdValue';
import { lineHeightValue } from './line-height/lineHeightValue';
import { linkValue } from './link/linkValue';
import { listValue } from './list/listValue';
import { mediaValue } from './media/mediaValue';
import { mentionValue } from './mention/mentionValue';
import { deserializeCsvValue } from './serializing-csv/deserializeCsvValue';
import { deserializeDocxValue } from './serializing-docx/deserializeDocxValue';
import { deserializeHtmlValue } from './serializing-html/deserializeHtmlValue';
import { deserializeMdValue } from './serializing-md/deserializeMdValue';
import { softBreakValue } from './soft-break/softBreakValue';
import { tableValue } from './table/tableValue';

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
  ...excalidrawValue,
  ...autoformatValue,
  ...softBreakValue,
  ...exitBreakValue,
  ...deserializeHtmlValue,
  ...deserializeDocxValue,
  ...deserializeMdValue,
  ...deserializeCsvValue,
]);
`;

export const playgroundValueFile = {
  '/playgroundValue.tsx': playgroundValueCode,
};
