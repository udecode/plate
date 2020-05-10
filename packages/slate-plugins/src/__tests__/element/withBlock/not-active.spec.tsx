/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withBlock } from 'element';
import { BLOCKQUOTE } from 'elements';
import { Editor } from 'slate';

const input = (
  <editor>
    <p>
      test
      <cursor />
    </p>
  </editor>
) as any;

const output = (
  <editor>
    <blockquote>
      test
      <cursor />
    </blockquote>
  </editor>
) as any;

it('should be', () => {
  const editor = withBlock()(input as Editor);

  editor.toggleBlock(BLOCKQUOTE);

  expect(editor.children).toEqual(output.children);
});
