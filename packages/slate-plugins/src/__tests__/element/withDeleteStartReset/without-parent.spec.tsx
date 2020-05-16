/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withDeleteStartReset } from 'element';
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
    <blockquote>
      <text />
    </blockquote>
  </editor>
) as any;

it('should do nothing', () => {
  const editor = withDeleteStartReset({ types: [] })(input as Editor);

  editor.deleteBackward('character');

  expect(editor.children).toEqual(output.children);
});
