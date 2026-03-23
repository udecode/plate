import { serializeHtml } from 'platejs/static';

import { alignValue } from '@/registry/examples/values/align-value';
import { basicBlocksValue } from '@/registry/examples/values/basic-blocks-value';
import { basicMarksValue } from '@/registry/examples/values/basic-marks-value';
import { dateValue } from '@/registry/examples/values/date-value';
import { fontValue } from '@/registry/examples/values/font-value';
import { indentValue } from '@/registry/examples/values/indent-value';
import { lineHeightValue } from '@/registry/examples/values/line-height-value';
import { linkValue } from '@/registry/examples/values/link-value';
import { listValue } from '@/registry/examples/values/list-value';
import { mentionValue } from '@/registry/examples/values/mention-value';
import { tocPlaygroundValue } from '@/registry/examples/values/toc-value';

import { createStaticEditor } from './create-static-editor';

describe('core static serializeHtml roundtrip', () => {
  it('roundtrips editor values through html deserialization', async () => {
    const editor = createStaticEditor([
      ...basicBlocksValue,
      ...basicMarksValue,
      ...tocPlaygroundValue,
      ...linkValue,
      ...mentionValue,
      ...dateValue,
      ...fontValue,
      ...alignValue,
      ...lineHeightValue,
      ...indentValue,
      ...listValue,
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
      ...mentionValue,
      ...dateValue,
      ...fontValue,
      ...alignValue,
      ...lineHeightValue,
      ...indentValue,
      ...listValue,
    ]);
  });
});
