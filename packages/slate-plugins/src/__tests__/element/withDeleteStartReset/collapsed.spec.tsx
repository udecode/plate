/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withDeleteStartReset } from 'element';
import { BLOCKQUOTE } from 'elements';
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
    </p>
  </editor>
) as any;

it('should set the node to paragraph', () => {
  const editor = withDeleteStartReset({ types: [BLOCKQUOTE] })(input as Editor);

  editor.deleteBackward('character');

  expect(editor.children).toEqual(output.children);
});
