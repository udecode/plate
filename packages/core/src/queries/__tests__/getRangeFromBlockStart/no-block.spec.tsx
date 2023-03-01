/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { getRangeFromBlockStart } from '../../../../../slate-utils/src/queries';
import { PlateEditor } from '../../../types/plate/PlateEditor';

jsx;

const input = ((
  <editor>
    te
    <cursor />
    st
  </editor>
) as any) as PlateEditor;

it('should be', () => {
  expect(getRangeFromBlockStart(input)).toEqual(undefined);
});
