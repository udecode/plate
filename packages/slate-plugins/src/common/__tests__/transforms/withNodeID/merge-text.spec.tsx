/** @jsx jsx */
import { Editor, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { HistoryEditor } from 'slate-history/dist/history-editor';
import { jsx } from '../../../../__test-utils__/jsx';
import { withNodeID } from '../../../plugins/node-id/index';
import { idCreatorFixture } from './fixtures';

const input = ((
  <editor>
    <hp id={10}>
      <htext id={1}>tes</htext>
      <htext id={2}>t</htext>
    </hp>
  </editor>
) as any) as Editor;

const output = (
  <editor>
    <hp id={10}>
      <htext id={1}>tes</htext>
      <htext id={2}>t</htext>
    </hp>
  </editor>
) as any;

it('should recover the ids', () => {
  const editor: HistoryEditor = withNodeID({
    idCreator: idCreatorFixture,
    filterText: false,
  })(withHistory(input));

  Transforms.mergeNodes(editor, { at: [0, 1] });
  editor.undo();

  expect(input.children).toEqual(output.children);
});
