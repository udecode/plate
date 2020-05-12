/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withNodeID } from 'node';
import { Editor, Transforms } from 'slate';

const input = (
  <editor>
    <p>
      tes
      <cursor />t
    </p>
  </editor>
) as any;

const output = (
  <editor>
    <p>tes</p>
    <p id={1 as any}>
      <text id={1 as any}>t</text>
    </p>
  </editor>
) as any;

const idGenerator = () => 1;

it('should add an id to the new element and text', () => {
  const editor: Editor = withNodeID({ idGenerator, textID: true })(input);

  Transforms.splitNodes(editor);

  expect(input.children).toEqual(output.children);
});
