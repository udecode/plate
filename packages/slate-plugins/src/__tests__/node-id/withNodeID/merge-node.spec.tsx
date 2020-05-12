/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withNodeID } from 'node';
import { Editor, Transforms } from 'slate';

const input = (
  <editor>
    <p>
      <text id={1 as any}>tes</text>
      <text id={2 as any}>t</text>
    </p>
  </editor>
) as any;

const output = (
  <editor>
    <p>
      <text id={1 as any}>test</text>
    </p>
  </editor>
) as any;

const idGenerator = () => 1;

it('should merge the text', () => {
  const editor: Editor = withNodeID({ idGenerator })(input);

  Transforms.mergeNodes(editor, { at: [0, 1] });

  expect(input.children).toEqual(output.children);
});
