/** @jsx jsx */

import { isElement } from '@udecode/slate-plugins-core';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { ELEMENT_LI } from '../../../../../elements/list/src/defaults';
import { ELEMENT_PARAGRAPH } from '../../../../../elements/paragraph/src/defaults';
import { mergeDeepToNodes } from '../../../transforms/index';

const node = (
  <hli>
    test
    <hp>test</hp>test
  </hli>
) as any;

const props = { a: 1 };

const output = (
  <element type={ELEMENT_LI} a={1}>
    test
    <element type={ELEMENT_PARAGRAPH} a={1}>
      test
    </element>
    test
  </element>
) as any;

it('should set props to all elements', () => {
  mergeDeepToNodes({
    node,
    source: props,
    query: {
      filter: ([n]) => isElement(n),
    },
  });
  expect(node).toEqual(output);
});
