/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { PARAGRAPH } from 'elements';
import { Editor } from 'slate';
import { withBreakEmptyReset } from '../../../handlers/reset-block-type';

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
  const editor = withBreakEmptyReset({ types: [PARAGRAPH] })(input as Editor);

  editor.insertBreak();

  expect(editor.children).toEqual(output.children);
});
