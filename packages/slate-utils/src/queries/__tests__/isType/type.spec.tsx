/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';
import { ELEMENT_PARAGRAPH } from 'packages/nodes/paragraph/src/createParagraphPlugin';
import { PlateEditor } from '../../../../../core/src/types/PlateEditor';
import { isType } from '../../../../../utils/src/queries/isType';

jsx;

const editor = ((
  <editor>
    <hp>test</hp>
  </editor>
) as any) as PlateEditor;

it('should return true when type matches', () => {
  expect(isType(editor, editor.children[0], ELEMENT_PARAGRAPH)).toEqual(true);
});
