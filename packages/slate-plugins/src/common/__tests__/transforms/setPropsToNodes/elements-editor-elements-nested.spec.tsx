/** @jsx jsx */

import { Element } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';
import { ListType } from '../../../../elements/list/index';
import { PARAGRAPH } from '../../../../elements/paragraph/index';
import { setPropsToNodes } from '../../../transforms/index';

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
    <element type={ListType.LI} a={1}>
      test
      <element type={PARAGRAPH} a={1}>
        test
      </element>
      test
    </element>
  </editor>
) as any;

it('should set props to all elements', () => {
  setPropsToNodes(node, props, {
    filter: ([n]) => Element.isElement(n),
  });
  expect(node.children).toEqual(output.children);
});
