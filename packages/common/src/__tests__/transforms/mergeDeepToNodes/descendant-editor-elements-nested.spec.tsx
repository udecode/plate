/** @jsx jsx */

import { isDescendant } from '@udecode/slate-plugins-core';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { ELEMENT_LI } from '../../../../../slate-plugins/src/elements/list/defaults';
import { ELEMENT_PARAGRAPH } from '../../../../../slate-plugins/src/elements/paragraph/defaults';
import { mergeDeepToNodes } from '../../../transforms/index';

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
    <element type={ELEMENT_LI} a={1}>
      <htext a={1}>test</htext>
      <element type={ELEMENT_PARAGRAPH} a={1}>
        <htext a={1}>test</htext>
      </element>
      <htext a={1}>test</htext>
    </element>
  </editor>
) as any;

it('should set props to all descendants', () => {
  mergeDeepToNodes({
    node,
    source: props,
    query: {
      filter: ([n]) => isDescendant(n),
    },
  });
  expect(node.children).toEqual(output.children);
});
