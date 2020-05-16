/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withNodeID } from 'node';
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
      <p id={1 as any}>
        <htext id={1}>inserted</htext>
      </p>
    </li>
  </editor>
) as any;

const idGenerator = () => 1;

it('should add an id to the new nodes', () => {
  const editor: Editor = withNodeID({ idGenerator, textID: true })(input);

  editor.insertNode(
    (
      <li>
        <p>inserted</p>
      </li>
    ) as any
  );

  expect(input.children).toEqual(output.children);
});
