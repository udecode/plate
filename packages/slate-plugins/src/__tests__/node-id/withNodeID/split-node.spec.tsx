/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { idCreatorFixture } from '__tests__/node-id/withNodeID/fixtures';
import { withNodeID } from 'node';
import { Editor, Transforms } from 'slate';
import { withHistory } from 'slate-history';

const input = ((
  <editor>
    <hp>
      tes
      <cursor />t
    </hp>
  </editor>
) as any) as Editor;

const output = (
  <editor>
    <hp>tes</hp>
    <hp id={1}>t</hp>
  </editor>
) as any;

it('should add an id to the new element', () => {
  const editor = withNodeID({
    idCreator: idCreatorFixture,
  })(withHistory(input));

  Transforms.splitNodes(editor);

  editor.undo();
  editor.redo();

  expect(input.children).toEqual(output.children);
});
