/** @jsx jsx */

import { BoldPlugin } from '@udecode/plate-basic-marks/react';
import { jsx } from '@udecode/plate-test-utils';
import { toggleMark } from '@udecode/slate-utils';

jsx;

const input = (
  <editor>
    <hp>test</hp>
    <selection>
      <anchor offset={3} path={[0, 0]} />
      <focus offset={4} path={[0, 0]} />
    </selection>
  </editor>
) as any;

const output = (
  <editor>
    <hp>
      tes
      <htext bold>t</htext>
      <cursor />
    </hp>
  </editor>
) as any;

it('should be', () => {
  toggleMark(input, { key: BoldPlugin.key });
  expect(input.children).toEqual(output.children);
});
