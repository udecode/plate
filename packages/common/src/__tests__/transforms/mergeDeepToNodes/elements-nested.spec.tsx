/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { Element } from 'slate';
import { ELEMENT_LI, ELEMENT_PARAGRAPH } from '../../../constants';
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
      filter: ([n]) => Element.isElement(n),
    },
  });
  expect(node).toEqual(output);
});
