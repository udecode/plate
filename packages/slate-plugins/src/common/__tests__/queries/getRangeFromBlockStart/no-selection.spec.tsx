/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';
import { getRangeFromBlockStart } from '../../../queries/index';

const input = ((
  <editor>
    <hp>test</hp>
  </editor>
) as any) as Editor;

const output = undefined;

it('should be', () => {
  expect(getRangeFromBlockStart(input)).toEqual(output);
});
