/** @jsx jsx */
import { Editor, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { jsx } from '../../../../__test-utils__/jsx';
import { withNodeID } from '../../../plugins/node-id/index';
import { idCreatorFixture } from './fixtures';

const input = ((
  <editor>
    <hp id={10}>
      tes
      <cursor />t
    </hp>
  </editor>
) as any) as Editor;

const output = (
  <editor>
    <hp id={10}>tes</hp>
    <hp id={2}>
      <htext id={1}>t</htext>
    </hp>
  </editor>
) as any;

it('should add an id to the new element and text', () => {
  const editor = withNodeID({
    idCreator: idCreatorFixture,
    filterText: false,
  })(withHistory(input));

  Transforms.splitNodes(editor);

  editor.undo();
  editor.redo();

  expect(input.children).toEqual(output.children);
});
