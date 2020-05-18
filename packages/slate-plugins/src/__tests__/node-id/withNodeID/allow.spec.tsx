/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { idCreatorFixture } from '__tests__/node-id/withNodeID/fixtures';
import { PARAGRAPH } from 'elements/paragraph';
import { withNodeID } from 'node';
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
    <hli>
      <hp id={1}>inserted</hp>
    </hli>
  </editor>
) as any;

it('should add an id to the new elements', () => {
  const editor = withNodeID({
    idCreator: idCreatorFixture,
    allow: [PARAGRAPH],
  })(withHistory(input));

  editor.insertNode(
    (
      <hli>
        <hp>inserted</hp>
      </hli>
    ) as any
  );

  editor.undo();
  editor.redo();
  editor.undo();
  editor.redo();

  expect(input.children).toEqual(output.children);
});
