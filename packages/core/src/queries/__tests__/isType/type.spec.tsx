/** @jsx jsx */
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph/src/createParagraphPlugin';
import { jsx } from '@udecode/plate-test-utils';
import { PlateEditor } from '../../../types/plate/PlateEditor';
import { isType } from '../../isType';

jsx;

const editor = ((
  <editor>
    <hp>test</hp>
  </editor>
) as any) as PlateEditor;

it('should return true when type matches', () => {
  expect(isType(editor, editor.children[0], ELEMENT_PARAGRAPH)).toEqual(true);
});
