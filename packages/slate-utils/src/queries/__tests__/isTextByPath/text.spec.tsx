/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';
import { PlateEditor } from '../../../../../core/src/types/PlateEditor';
import { isTextByPath } from '../../isTextByPath';

jsx;

const editor = ((
  <editor>
    <hp>test</hp>
  </editor>
) as any) as PlateEditor;

const path = [0, 0];

const output = true;

it('should be', () => {
  expect(isTextByPath(editor, path)).toEqual(output);
});
