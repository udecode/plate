/** @jsx jsx */
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { HistoryEditor } from 'slate-history/dist/history-editor';
import { withNodeId } from '../../../../../node-id/src/useNodeIdPlugin';
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
  const editor: HistoryEditor = withNodeId({
    idCreator: idCreatorFixture,
    filterText: false,
  })(withHistory(input));

  Transforms.mergeNodes(editor, { at: [0, 1] });
  editor.undo();

  expect(input.children).toEqual(output.children);
});
