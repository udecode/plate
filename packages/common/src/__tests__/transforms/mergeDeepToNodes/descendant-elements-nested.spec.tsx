/** @jsx jsx */

import { isDescendant } from '@udecode/slate-plugins-core';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { ELEMENT_LI } from '../../../../../elements/list/src/defaults';
import { ELEMENT_PARAGRAPH } from '../../../../../elements/paragraph/src/defaults';
import { mergeDeepToNodes } from '../../../transforms/mergeDeepToNodes';

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
