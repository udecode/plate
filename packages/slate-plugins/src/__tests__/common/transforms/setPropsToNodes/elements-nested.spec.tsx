/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { setPropsToNodes } from 'common/transforms';
import { ListType } from 'elements/list';
import { PARAGRAPH } from 'elements/paragraph';
import { Element } from 'slate';

const node = (
  <hli>
    test
    <hp>test</hp>test
  </hli>
) as any;

const props = { a: 1 };

const output = (
  <element type={ListType.LI} a={1}>
    test
    <element type={PARAGRAPH} a={1}>
      test
    </element>
    test
  </element>
) as any;

it('should set props to all elements', () => {
  setPropsToNodes(node, props, { filter: ([n]) => Element.isElement(n) });
  expect(node).toEqual(output);
});
