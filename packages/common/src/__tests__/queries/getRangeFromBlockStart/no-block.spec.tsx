/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { Editor } from 'slate';
import { getRangeFromBlockStart } from '../../../queries/index';

jsx;

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
