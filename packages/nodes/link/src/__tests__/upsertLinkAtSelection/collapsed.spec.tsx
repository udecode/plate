/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { createLinkPlugin } from '../../createLinkPlugin';
import { upsertLinkAtSelection } from '../../transforms/upsertLinkAtSelection';

jsx;

const input = (
  <editor>
    <hp>insert link</hp>
  </editor>
) as any;

const url = 'http://google.com';

const output = (
  <editor>
    <hp>insert link</hp>
  </editor>
) as any;

it('should run default insertText', () => {
  const editor = createPlateEditor({
    editor: input,
    plugins: [createLinkPlugin()],
  });
  upsertLinkAtSelection(editor, { url });

  expect(input.children).toEqual(output.children);
});
