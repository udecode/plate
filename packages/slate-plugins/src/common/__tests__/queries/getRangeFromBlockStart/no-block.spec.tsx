/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';
import { getRangeFromBlockStart } from '../../../queries/index';

const input = ((
  <editor>
    te
    <cursor />
    st
  </editor>
) as any) as Editor;

it('should be', () => {
  expect(getRangeFromBlockStart(input)).toEqual(undefined);
});
