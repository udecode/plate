/** @jsx jsx */
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';
import { PlateEditor } from '../../../../../core/src/types/PlateEditor';
import { isType } from '../../../../../plate-utils/src/queries/isType';

jsx;

const editor = ((
  <editor>
    <hp>test</hp>
  </editor>
) as any) as PlateEditor;

it('should return true when type matches', () => {
  expect(isType(editor, editor.children[0], ELEMENT_PARAGRAPH)).toEqual(true);
});
