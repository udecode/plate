/** @jsx jsx */
import { jsx } from '@udecode/slate-plugins-test-utils';
import { ELEMENT_CODE_BLOCK } from '../../../../../elements/code-block/src/defaults';
import { toggleWrapNodes } from '../../../transforms/index';

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
