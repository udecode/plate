/** @jsx jsx */
import { jsx } from '@udecode/slate-plugins-test-utils';
import { ELEMENT_CODE_BLOCK } from '../../../../../slate-plugins/src/elements/code-block/defaults';
import { toggleWrapNodes } from '../../../transforms/index';

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
    <hcode>
      <hp>
        test
        <cursor />
      </hp>
    </hcode>
  </editor>
) as any;

it('should be', () => {
  toggleWrapNodes(input, ELEMENT_CODE_BLOCK);

  expect(input.children).toEqual(output.children);
});
