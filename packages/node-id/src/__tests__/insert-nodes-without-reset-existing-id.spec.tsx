/** @jsx jsx */
import { insertNodes } from '@udecode/slate-plugins-common';
import { TElement } from '@udecode/slate-plugins-core';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { withHistory } from 'slate-history';
import { withNodeId } from '../createNodeIdPlugin';
import { idCreatorFixture } from './fixtures';

jsx;

const input = ((
  <editor>
    <hp id={10}>
      test
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

const output = (
  <editor>
    <hp id={10}>test</hp>
    <hp id={11}>inserted</hp>
    <hp id={12}>inserted</hp>
  </editor>
) as any;

it('should keep the id', () => {
  const editor = withNodeId({ idCreator: idCreatorFixture })(
    withHistory(input)
  );

  insertNodes<TElement>(
    editor,
    (
      <fragment>
        <hp id={11}>inserted</hp>
        <hp id={12}>inserted</hp>
      </fragment>
    ) as any
  );

  editor.undo();
  editor.redo();
  editor.undo();
  editor.redo();

  expect(input.children).toEqual(output.children);
});
