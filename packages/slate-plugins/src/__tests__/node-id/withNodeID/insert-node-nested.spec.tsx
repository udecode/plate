/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withNodeID } from 'node-id';
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
    <p>test</p>
    <li id={1 as any}>
      <p id={1 as any}>inserted</p>
    </li>
  </editor>
) as any;

const idGenerator = () => 1;

it('should add an id to the new elements', () => {
  const editor: Editor = withNodeID({ idGenerator })(input);

  editor.insertNode(
    (
      <li>
        <p>inserted</p>
      </li>
    ) as any
  );

  expect(input.children).toEqual(output.children);
});
