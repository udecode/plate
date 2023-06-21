/** @jsx jsx */
import { ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block/src/constants';
import { jsx } from '@udecode/plate-test-utils';

import { toggleWrapNodes } from '@/packages/slate-utils/src/index';

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
  toggleWrapNodes(input, ELEMENT_CODE_BLOCK);

  expect(input.children).toEqual(output.children);
});
