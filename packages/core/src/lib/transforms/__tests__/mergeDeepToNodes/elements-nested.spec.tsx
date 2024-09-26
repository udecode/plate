/** @jsx jsx */

import { ListItemPlugin } from '@udecode/plate-list/react';
import { jsx } from '@udecode/plate-test-utils';
import { isElement } from '@udecode/slate';

import { BaseParagraphPlugin } from '../../../plugins';
import { mergeDeepToNodes } from '../../../utils';

jsx;

const node = (
  <hli>
    test
    <hp>test</hp>test
  </hli>
) as any;

const props = { a: 1 };

const output = (
  <element a={1} type={ListItemPlugin.key}>
    test
    <element a={1} type={BaseParagraphPlugin.key}>
      test
    </element>
    test
  </element>
) as any;

it('should set props to all elements', () => {
  mergeDeepToNodes({
    node,
    query: {
      filter: ([n]) => isElement(n),
    },
    source: props,
  });
  expect(node).toEqual(output);
});
