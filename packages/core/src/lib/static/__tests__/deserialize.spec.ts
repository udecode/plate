import { alignValue } from 'www/src/registry/default/examples/values/align-value';
import { basicElementsValue } from 'www/src/registry/default/examples/values/basic-elements-value';
import { basicMarksValue } from 'www/src/registry/default/examples/values/basic-marks-value';
import { commentsValue } from 'www/src/registry/default/examples/values/comments-value';
import { dateValue } from 'www/src/registry/default/examples/values/date-value';
import { fontValue } from 'www/src/registry/default/examples/values/font-value';
// import { equationValue } from 'www/src/registry/default/examples/values/equation-value';
import { highlightValue } from 'www/src/registry/default/examples/values/highlight-value';
import { horizontalRuleValue } from 'www/src/registry/default/examples/values/horizontal-rule-value';
import { indentListValue } from 'www/src/registry/default/examples/values/indent-list-value';
import { indentValue } from 'www/src/registry/default/examples/values/indent-value';
import { kbdValue } from 'www/src/registry/default/examples/values/kbd-value';
import { lineHeightValue } from 'www/src/registry/default/examples/values/line-height-value';
import { linkValue } from 'www/src/registry/default/examples/values/link-value';
import { mentionValue } from 'www/src/registry/default/examples/values/mention-value';
import { tocPlaygroundValue } from 'www/src/registry/default/examples/values/toc-value';

import { serializeHtml } from '../serializeHtml';
import { components, createStaticEditor } from './create-static-editor';

describe('deserializePlateStatic', () => {
  it('should deserialize nodes', async () => {
    const editor = createStaticEditor([
      ...basicElementsValue,
      ...basicMarksValue,
      ...tocPlaygroundValue,
      ...linkValue,
      ...horizontalRuleValue,
      // ...tableValue,
      // ...equationValue,
      // ...columnValue,
      ...mentionValue,
      ...dateValue,
      ...fontValue,
      ...highlightValue,
      ...kbdValue,
      // TODO: fix comments
      // ...commentsValue,
      ...alignValue,
      ...lineHeightValue,
      ...indentValue,
      ...indentListValue,
      // ...mediaValue,
    ]);

    const html = await serializeHtml(editor, {
      components: components,
    });

    const nodes = editor.api.html.deserialize({
      collapseWhiteSpace: false,
      element: html,
    });

    expect(nodes).toEqual([
      ...basicElementsValue,
      ...basicMarksValue,
      ...tocPlaygroundValue,
      ...linkValue,
      ...horizontalRuleValue,
      // ...tableValue,
      // ...equationValue,
      // ...columnValue,
      ...mentionValue,
      ...dateValue,
      ...fontValue,
      ...highlightValue,
      ...kbdValue,
      // ...commentsValue,
      ...alignValue,
      ...lineHeightValue,
      ...indentValue,
      ...indentListValue,
      // ...mediaValue,
    ]);
  });
});
