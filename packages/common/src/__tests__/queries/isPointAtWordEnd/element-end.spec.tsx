/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor, Range } from 'slate';
import { isPointAtWordEnd } from '../../../queries/index';

jsx;

const input = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

const at = Range.start(input.selection as Range);

const output = true;

it('should be', () => {
  expect(isPointAtWordEnd(input, { at })).toEqual(output);
});
