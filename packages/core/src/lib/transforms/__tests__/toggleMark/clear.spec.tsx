/** @jsx jsxt */

import { BoldPlugin, ItalicPlugin } from '@udecode/plate-basic-marks/react';
import { jsxt } from '@udecode/plate-test-utils';
import { toggleMark } from '@udecode/slate-utils';

jsxt;

const input = (
  <editor>
    <hp>
      <htext bold>test</htext>
    </hp>
    <selection>
      <anchor offset={0} path={[0, 0]} />
      <focus offset={4} path={[0, 0]} />
    </selection>
  </editor>
) as any;

const output = (
  <editor>
    <hp>
      <htext italic>test</htext>
      <cursor />
    </hp>
  </editor>
) as any;

it('should be', () => {
  toggleMark(input, { key: ItalicPlugin.key, clear: BoldPlugin.key });
  expect(input.children).toEqual(output.children);
});
