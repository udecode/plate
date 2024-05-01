/** @jsx jsx */

import { ELEMENT_LI } from '@udecode/plate-list';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';
import { isDescendant } from '@udecode/slate';

import { mergeDeepToNodes } from '../../utils/index';

jsx;

const node = (
  <hli>
    test
    <hp>test</hp>test
  </hli>
) as any;

const props = { a: 1 };

const output = (
  <element type={ELEMENT_LI} a={1}>
    <htext a={1}>test</htext>
    <element type={ELEMENT_PARAGRAPH} a={1}>
      <htext a={1}>test</htext>
    </element>
    <htext a={1}>test</htext>
  </element>
) as any;

it('should set props to all descendants', () => {
  mergeDeepToNodes({
    node,
    source: props,
    query: {
      filter: ([n]) => isDescendant(n),
    },
  });
  expect(node).toEqual(output);
});
