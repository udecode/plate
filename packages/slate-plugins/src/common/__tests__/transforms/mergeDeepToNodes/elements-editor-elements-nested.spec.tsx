/** @jsx jsx */

import { Element } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';
import { ELEMENT_LI } from '../../../../elements/list/defaults';
import { ELEMENT_PARAGRAPH } from '../../../../elements/paragraph/index';
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
      test
      <element type={ELEMENT_PARAGRAPH} a={1}>
        test
      </element>
      test
    </element>
  </editor>
) as any;

it('should set props to all elements', () => {
  mergeDeepToNodes({
    node,
    source: props,
    query: {
      filter: ([n]) => Element.isElement(n),
    },
  });
  expect(node.children).toEqual(output.children);
});
