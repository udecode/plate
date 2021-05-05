/** @jsx jsx */
import { TElement } from '@udecode/slate-plugins-core';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { withHistory } from 'slate-history';
import { withNodeId } from '../../../../../node-id/src/createNodeIdPlugin';
import { insertNodes } from '../../../transforms/insertNodes';
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
    <hp id={2}>inserted</hp>
  </editor>
) as any;

it('should reset the id after inserting the same node with id twice', () => {
  const editor = withNodeId({
    idCreator: idCreatorFixture,
  })(withHistory(input));

  insertNodes<TElement>(
    editor,
    (
      <fragment>
        <hp id={11}>inserted</hp>
      </fragment>
    ) as any
  );

  insertNodes<TElement>(
    editor,
    (
      <fragment>
        <hp id={11}>inserted</hp>
      </fragment>
    ) as any
  );

  expect(input.children).toEqual(output.children);
});
