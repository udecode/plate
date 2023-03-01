/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { getRangeFromBlockStart } from '../../../../../slate-utils/src/queries';
import { PlateEditor } from '../../../types/plate/PlateEditor';

jsx;

const input = ((
  <editor>
    <hp>test</hp>
  </editor>
) as any) as PlateEditor;

const output = undefined;

it('should be', () => {
  expect(getRangeFromBlockStart(input)).toEqual(output);
});
