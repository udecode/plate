/** @jsx jsx */

import { Editor } from 'slate';
import { withHistory } from 'slate-history';
import { jsx } from '../../../../__test-utils__/jsx';
import { ELEMENT_PARAGRAPH } from '../../../../elements/paragraph/index';
import { withNodeID } from '../../../plugins/node-id/index';
import { idCreatorFixture } from './fixtures';

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
    <hli>
      <hp id={1}>inserted</hp>
    </hli>
  </editor>
) as any;

it('should add an id to the new elements', () => {
  const editor = withNodeID({
    idCreator: idCreatorFixture,
    allow: [ELEMENT_PARAGRAPH],
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
