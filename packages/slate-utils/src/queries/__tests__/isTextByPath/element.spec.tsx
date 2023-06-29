/** @jsx jsx */

import { isTextByPath } from '@/packages/slate-utils/src/queries/isTextByPath';
import { PlateEditor } from '@udecode/plate-core/src/types/PlateEditor';
import { jsx } from '@udecode/plate-test-utils';

jsx;

const editor = (
  <editor>
    <hp>test</hp>
  </editor>
) as any as PlateEditor;

const path = [0];

const output = false;

it('should be', () => {
  expect(isTextByPath(editor, path)).toEqual(output);
});
