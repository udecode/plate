/** @jsx jsx */

import { CodeBlockPlugin } from '@udecode/plate-code-block';
import { jsx } from '@udecode/plate-test-utils';
import { toggleWrapNodes } from '@udecode/slate-utils';

jsx;

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

const output = (
  <editor>
    <hcodeblock>
      <hp>
        test
        <cursor />
      </hp>
    </hcodeblock>
  </editor>
) as any;

it('should be', () => {
  toggleWrapNodes(input, CodeBlockPlugin.key);

  expect(input.children).toEqual(output.children);
});
