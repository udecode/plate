/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { isDescendant } from 'common/queries';
import { setPropsToNodes } from 'common/transforms';
import { ListType } from 'elements/list';
import { PARAGRAPH } from 'elements/paragraph';

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
