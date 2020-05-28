/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { getTextFromBlockStartToAnchor } from 'common/queries';
import { Editor } from 'slate';

const input = ((
  <editor>
    te
    <cursor />
    st
  </editor>
) as any) as Editor;

const output: ReturnType<typeof getTextFromBlockStartToAnchor> = {
  text: 'te',
  range: {
    anchor: { path: [0], offset: 0 },
    focus: { path: [0], offset: 2 },
  },
};

it('should be', () => {
  expect(getTextFromBlockStartToAnchor(input)).toEqual(output);
});
