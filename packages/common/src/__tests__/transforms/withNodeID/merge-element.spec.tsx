/** @jsx jsx */
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { HistoryEditor } from 'slate-history/dist/history-editor';
import { withNodeId } from '../../../../../node-id/src/useNodeIdPlugin';
import { idCreatorFixture } from './fixtures';

const input = ((
  <editor>
    <hp id={1}>one</hp>
    <hp id={2}>two</hp>
  </editor>
) as any) as Editor;

const output = (
  <editor>
    <hp id={1}>one</hp>
    <hp id={2}>two</hp>
  </editor>
) as any;

it('should recover the ids', () => {
  const editor: HistoryEditor = withNodeId({
    idCreator: idCreatorFixture,
  })(withHistory(input));

  Transforms.mergeNodes(editor, { at: [1] });
  editor.undo();
  editor.redo();
  editor.undo();

  expect(input.children).toEqual(output.children);
});
