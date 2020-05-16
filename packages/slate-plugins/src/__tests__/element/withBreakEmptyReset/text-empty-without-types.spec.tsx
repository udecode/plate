/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withBreakEmptyReset } from 'element';
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
    <blockquote>
      <text />
      <cursor />
    </blockquote>
  </editor>
) as any;

it('should be', () => {
  const editor = withBreakEmptyReset({ types: [] })(input as Editor);

  editor.insertBreak();

  expect(editor.children).toEqual(output.children);
});
