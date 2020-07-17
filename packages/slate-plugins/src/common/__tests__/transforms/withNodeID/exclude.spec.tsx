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
    <hli id={1}>
      <hp>inserted</hp>
    </hli>
  </editor>
) as any;

it('should add an id to the new elements', () => {
  const editor = withNodeID({
    idCreator: idCreatorFixture,
    exclude: [ELEMENT_PARAGRAPH],
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

  expect(input.children).toEqual(output.children);
});
