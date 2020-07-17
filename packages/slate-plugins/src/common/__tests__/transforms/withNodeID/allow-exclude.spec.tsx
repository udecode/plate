/** @jsx jsx */

import { Editor } from 'slate';
import { withHistory } from 'slate-history';
import { jsx } from '../../../../__test-utils__/jsx';
import { ELEMENT_LI, ELEMENT_UL } from '../../../../elements/list/defaults';
import { ELEMENT_PARAGRAPH } from '../../../../elements/paragraph/index';
import { withNodeID } from '../../../plugins/node-id/index';
import { idCreatorFixture } from './fixtures';

const input = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

const output = (
  <editor>
    <hp>test</hp>
    <hul id={1}>
      <hli id={2}>
        <hp>inserted</hp>
      </hli>
    </hul>
  </editor>
) as any;

it('should add an id to the new elements', () => {
  const editor = withNodeID({
    idCreator: idCreatorFixture,
    allow: [ELEMENT_UL, ELEMENT_LI, ELEMENT_PARAGRAPH],
    exclude: [ELEMENT_PARAGRAPH],
  })(withHistory(input));

  editor.insertNode(
    (
      <hul>
        <hli>
          <hp>inserted</hp>
        </hli>
      </hul>
    ) as any
  );

  editor.undo();
  editor.redo();

  expect(input.children).toEqual(output.children);
});
