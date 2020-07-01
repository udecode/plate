/** @jsx jsx */

import { jsx } from '../../../../__test-utils__/jsx';
import { ListType } from '../../../../elements/list/index';
import { PARAGRAPH } from '../../../../elements/paragraph/index';
import { isDescendant } from '../../../queries/index';
import { setPropsToNodes } from '../../../transforms/index';

const node = (
  <editor>
    <hli>
      test
      <hp>test</hp>test
    </hli>
  </editor>
) as any;

const props = { a: 1 };

const output = (
  <editor>
    <element type={ListType.LI} a={1}>
      <htext a={1}>test</htext>
      <element type={PARAGRAPH} a={1}>
        <htext a={1}>test</htext>
      </element>
      <htext a={1}>test</htext>
    </element>
  </editor>
) as any;

it('should set props to all descendants', () => {
  setPropsToNodes(node, props, {
    filter: ([n]) => isDescendant(n),
  });
  expect(node.children).toEqual(output.children);
});
