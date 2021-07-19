/** @jsx jsx */

import { isElement } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { ELEMENT_LI } from '../../../../../elements/list/src/defaults';
import { ELEMENT_PARAGRAPH } from '../../../../../elements/paragraph/src/defaults';
import { mergeDeepToNodes } from '../../../transforms/index';

jsx;

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
      filter: ([n]) => isElement(n),
    },
  });
  expect(node.children).toEqual(output.children);
});
