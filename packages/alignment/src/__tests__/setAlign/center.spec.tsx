/** @jsx jsx */

import type { SlateEditor } from '@udecode/plate-common';

import { createPlateEditor } from '@udecode/plate-common/react';
import { jsx } from '@udecode/plate-test-utils';

import { AlignPlugin } from '../../shared/AlignPlugin';
import { setAlign } from '../../shared/transforms/index';

jsx;

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any as SlateEditor;

const output = (
  <editor>
    <hp align="center">test</hp>
  </editor>
) as any as SlateEditor;

it('should align center', () => {
  const editor = createPlateEditor({
    editor: input,
    plugins: [AlignPlugin],
  });

  setAlign(editor, { value: 'center' });

  expect(editor.children).toEqual(output.children);
});
