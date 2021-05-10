/** @jsx jsx */
import { insertNodes } from '@udecode/slate-plugins-common';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { withHistory } from 'slate-history';
import { withNodeId } from '../createNodeIdPlugin';
import { idCreatorFixture } from './fixtures';

jsx;

const input = ((
  <editor>
    <hp foo={10}>test</hp>
  </editor>
) as any) as Editor;

const output = (
  <editor>
    <hp foo={10}>test</hp>
    <hp foo={1}>inserted</hp>
    <hp foo={2}>inserted</hp>
  </editor>
) as any;

it('should add an id to the new elements', () => {
  const editor = withNodeId({ idCreator: idCreatorFixture, idKey: 'foo' })(
    withHistory(input)
  );

  insertNodes(
    editor,
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
