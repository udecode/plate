/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { idCreatorFixture } from '__tests__/node-id/withNodeID/fixtures';
import { withNodeID, withTransforms } from 'node';
import { Editor } from 'slate';
import { withHistory } from 'slate-history';

const input = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

const output = (
  <editor>
    <hp>test</hp>
    <hp id={1}>inserted</hp>
    <hp id={2}>inserted</hp>
  </editor>
) as any;

it('should add an id to the new elements', () => {
  const editor = withNodeID({ idCreator: idCreatorFixture })(
    withTransforms()(withHistory(input))
  );

  editor.insertNodes(
    (
      <fragment>
        <hp>inserted</hp>
        <hp>inserted</hp>
      </fragment>
    ) as any
  );

  editor.undo();
  editor.redo();
  editor.undo();
  editor.redo();

  expect(input.children).toEqual(output.children);
});
