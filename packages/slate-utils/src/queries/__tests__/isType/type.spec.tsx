/** @jsx jsx */
import { PlateEditor } from '@udecode/plate-core/src/types/PlateEditor';
import { jsx } from '@udecode/plate-test-utils';
import { isType } from '@udecode/plate-utils/src/queries/isType';

jsx;

const editor = (
  <editor>
    <hp>test</hp>
  </editor>
) as any as PlateEditor;

it('should return true when type matches', () => {
  expect(isType(editor, editor.children[0], 'p')).toEqual(true);
});
