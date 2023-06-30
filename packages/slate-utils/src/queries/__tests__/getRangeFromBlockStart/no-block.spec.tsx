/** @jsx jsx */

import { getRangeFromBlockStart } from '@/packages/slate-utils/src/queries/index';
import { PlateEditor } from '@udecode/plate-core/src/types/PlateEditor';
import { jsx } from '@udecode/plate-test-utils';

jsx;

const input = (
  <editor>
    te
    <cursor />
    st
  </editor>
) as any as PlateEditor;

it('should be', () => {
  expect(getRangeFromBlockStart(input)).toEqual(undefined);
});
