/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { ELEMENT_LI } from '../../../../../../elements/list/src/createListPlugin';
import { ELEMENT_PARAGRAPH } from '../../../../../../elements/paragraph/src/createParagraphPlugin';
import { isElement } from '../../../../types/slate/TElement';
import { mergeDeepToNodes } from '../../../../utils/mergeDeepToNodes';

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
