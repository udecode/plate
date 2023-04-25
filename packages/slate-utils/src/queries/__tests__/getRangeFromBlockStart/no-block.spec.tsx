/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { PlateEditor } from '../../../../../core/src/types/PlateEditor';
import { getRangeFromBlockStart } from '../../index';

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
