/** @jsx jsx */

import { ELEMENT_LI } from '@udecode/plate-list/src/createListPlugin';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph/src/createParagraphPlugin';
import { jsx } from '@udecode/plate-test-utils';
import { isElement } from '../../../../../slate-utils/src/slate/element/isElement';
import { mergeDeepToNodes } from '../../../../../slate-utils/src/utils/mergeDeepToNodes';

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
