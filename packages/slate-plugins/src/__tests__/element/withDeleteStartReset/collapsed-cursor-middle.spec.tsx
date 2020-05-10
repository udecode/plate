/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withDeleteStartReset } from 'element';
import { BLOCKQUOTE } from 'elements';
import { Editor } from 'slate';

const input = (
  <editor>
    <blockquote>
      test
      <cursor />
    </blockquote>
  </editor>
) as any;

const output = (
  <editor>
    <blockquote>tes</blockquote>
  </editor>
) as any;

it('should run default deleteBackward', () => {
  const editor = withDeleteStartReset({ types: [BLOCKQUOTE] })(input as Editor);

  editor.deleteBackward('character');

  expect(editor.children).toEqual(output.children);
});
