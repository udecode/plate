import { alignValue } from 'www/src/registry/examples/values/align-value';
import { basicBlocksValue } from 'www/src/registry/examples/values/basic-blocks-value';
import { basicMarksValue } from 'www/src/registry/examples/values/basic-marks-value';
import { dateValue } from 'www/src/registry/examples/values/date-value';
import { fontValue } from 'www/src/registry/examples/values/font-value';
import { indentValue } from 'www/src/registry/examples/values/indent-value';
import { lineHeightValue } from 'www/src/registry/examples/values/line-height-value';
import { linkValue } from 'www/src/registry/examples/values/link-value';
import { listValue } from 'www/src/registry/examples/values/list-value';
import { mentionValue } from 'www/src/registry/examples/values/mention-value';
import { tocPlaygroundValue } from 'www/src/registry/examples/values/toc-value';

import { serializeHtml } from '../serializeHtml';
import { createStaticEditor } from './create-static-editor';

describe('deserializePlateStatic', () => {
  it('should deserialize nodes', async () => {
    const editor = createStaticEditor([
      ...basicBlocksValue,
      ...basicMarksValue,
      ...tocPlaygroundValue,
      ...linkValue,
      // ...tableValue,
      // ...equationValue,
      // ...columnValue,
      ...mentionValue,
      ...dateValue,
      ...fontValue,
      // TODO: fix comments
      // ...commentsValue,
      ...alignValue,
      ...lineHeightValue,
      ...indentValue,
      ...listValue,
      // ...mediaValue,
    ]);

    const html = await serializeHtml(editor);

    const nodes = editor.api.html.deserialize({
      collapseWhiteSpace: false,
      element: html,
    });

    expect(nodes).toEqual([
      ...basicBlocksValue,
      ...basicMarksValue,
      ...tocPlaygroundValue,
      ...linkValue,
      // ...tableValue,
      // ...equationValue,
      // ...columnValue,
      ...mentionValue,
      ...dateValue,
      ...fontValue,
      // ...commentsValue,
      ...alignValue,
      ...lineHeightValue,
      ...indentValue,
      ...listValue,
      // ...mediaValue,
    ]);
  });
});
