/** @jsx jsx */

import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { jsx } from '@udecode/plate-test-utils';
import { toggleWrapNodes } from '@udecode/slate-utils';

jsx;

const input = (
  <editor>
    <hcodeblock>
      <hp>
        test
        <cursor />
      </hp>
    </hcodeblock>
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
  toggleWrapNodes(input, CodeBlockPlugin.key);

  expect(input.children).toEqual(output.children);
});
