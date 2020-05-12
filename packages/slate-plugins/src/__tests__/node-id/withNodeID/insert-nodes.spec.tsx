/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withNodeID, withTransforms } from 'node';
import { Editor } from 'slate';

const input = ((
  <editor>
    <p>
      test
      <cursor />
    </p>
  </editor>
) as any) as Editor;

const output = (
  <editor>
    <p>test</p>
    <p id={1 as any}>inserted</p>
    <p id={1 as any}>inserted</p>
  </editor>
) as any;

const idGenerator = () => 1;

it('should add an id to the new elements', () => {
  const editor = withNodeID({ idGenerator })(withTransforms()(input));

  editor.insertNodes(
    (
      <fragment>
        <p>inserted</p>
        <p>inserted</p>
      </fragment>
    ) as any
  );

  expect(input.children).toEqual(output.children);
});
