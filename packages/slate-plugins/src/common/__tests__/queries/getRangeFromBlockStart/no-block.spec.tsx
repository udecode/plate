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

const output: ReturnType<typeof getRangeFromBlockStart> = {
  anchor: { path: [0], offset: 0 },
  focus: { path: [0], offset: 2 },
};

it('should be', () => {
  expect(getRangeFromBlockStart(input)).toEqual(output);
});
