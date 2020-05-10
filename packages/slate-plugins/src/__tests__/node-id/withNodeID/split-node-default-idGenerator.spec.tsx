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

it('should add a random id to the new element', () => {
  const editor: Editor = withNodeID()(input);

  Transforms.splitNodes(editor);

  expect(input.children[1].id).toBeDefined();
});
