/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { Value } from '../../../../slate/editor/TEditor';
import { PlateEditor } from '../../../../types/PlateEditor';
import { getRangeFromBlockStart } from '../../../queries/index';

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
