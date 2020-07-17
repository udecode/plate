/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';
import { ELEMENT_PARAGRAPH } from '../../../../elements/index';
import { withBreakEmptyReset } from '../../index';

const input = (
  <editor>
    <cursor />
  </editor>
) as any;

const output = (
  <editor>
    <cursor />
  </editor>
) as any;

it('should do nothing', () => {
  const editor = withBreakEmptyReset({ types: [ELEMENT_PARAGRAPH] })(
    input as Editor
  );

  editor.insertBreak();

  expect(editor.children).toEqual(output.children);
});
