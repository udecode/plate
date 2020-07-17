/** @jsx jsx */
import { jsx } from '../../../../__test-utils__/jsx';
import { ELEMENT_CODE_BLOCK } from '../../../../elements/code-block/index';
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
