/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { Editor } from 'slate';
import { getPointBefore } from '../../../../queries/getPointBefore';

jsx;

const input = ((
  <editor>
    <hp>
      find **test
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

const output = {
  offset: 5,
  path: [0, 0],
};

it('should be', () => {
  expect(
    getPointBefore(input, input.selection as any, {
      skipInvalid: true,
      matchString: '**',
    })
  ).toEqual(output);
});
