/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withBreakEmptyReset } from 'element';
import { BLOCKQUOTE } from 'elements/blockquote';
import { Editor } from 'slate';

const input = (
  <editor>
    <blockquote>
      <text />
      <cursor />
    </blockquote>
  </editor>
) as any;

const output = (
  <editor>
    <p>
      <text />
      <cursor />
    </p>
  </editor>
) as any;

it('should be', () => {
  const editor = withBreakEmptyReset({ types: [BLOCKQUOTE] })(input as Editor);

  editor.insertBreak();

  expect(editor.children).toEqual(output.children);
});
