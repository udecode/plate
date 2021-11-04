/** @jsx jsx */

import { PlateEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
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
