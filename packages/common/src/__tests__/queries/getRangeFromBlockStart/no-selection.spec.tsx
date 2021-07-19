/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { Editor } from 'slate';
import { getRangeFromBlockStart } from '../../../queries/index';

jsx;

const input = ((
  <editor>
    <hp>test</hp>
  </editor>
) as any) as Editor;

const output = undefined;

it('should be', () => {
  expect(getRangeFromBlockStart(input)).toEqual(output);
});
