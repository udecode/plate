/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withNodeID } from 'node-id';
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
    <p id={1 as any}>t</p>
  </editor>
) as any;

const idGenerator = () => 1;

it('should add an id to the new element', () => {
  const editor: Editor = withNodeID({ idGenerator })(input);

  Transforms.splitNodes(editor);

  expect(input.children).toEqual(output.children);
});
