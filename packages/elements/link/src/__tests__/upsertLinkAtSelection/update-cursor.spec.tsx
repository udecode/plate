/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { Transforms } from 'slate';
import { createLinkPlugin, ELEMENT_LINK } from '../../createLinkPlugin';
import { upsertLinkAtSelection } from '../../transforms/upsertLinkAtSelection';

jsx;

const urlInput = 'http://input.com';

const input = (
  <editor>
    <hp>
      insert link
      <element type={ELEMENT_LINK} url={urlInput}>
        here
      </element>
      .
    </hp>
  </editor>
) as any;

const urlOutput = 'http://output.com';

const output = (
  <editor>
    <hp>
      insert link
      <element type={ELEMENT_LINK} url={urlOutput}>
        here
      </element>
      .
    </hp>
  </editor>
) as any;

it('should run default insertText', () => {
  const editor = createPlateEditor({
    editor: input,
    plugins: [createLinkPlugin()],
  });

  const selection = {
    anchor: { path: [0, 1, 0], offset: 1 },
    focus: { path: [0, 1, 0], offset: 1 },
  };
  Transforms.select(editor, selection);

  upsertLinkAtSelection(editor, { url: urlOutput, wrap: true });
  expect(input.children).toEqual(output.children);
});
