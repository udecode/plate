/** @jsx jsx */
import { ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block/src/constants';
import { jsx } from '@udecode/plate-test-utils';
import { toggleWrapNodes } from '../../../../../slate-utils/src/transforms';

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
  toggleWrapNodes(input, ELEMENT_CODE_BLOCK);

  expect(input.children).toEqual(output.children);
});
