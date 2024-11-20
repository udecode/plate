/** @jsx jsxt */

import { BoldPlugin } from '@udecode/plate-basic-marks/react';
import { jsxt } from '@udecode/plate-test-utils';
import { toggleMark } from '@udecode/slate-utils';

jsxt;

const input = (
  <editor>
    <hp>
      tes
      <htext bold>t</htext>
    </hp>
    <selection>
      <anchor offset={0} path={[0, 1]} />
      <focus offset={1} path={[0, 1]} />
    </selection>
  </editor>
) as any;

const output = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

it('should be', () => {
  toggleMark(input, { key: BoldPlugin.key });
  expect(input.children).toEqual(output.children);
});
