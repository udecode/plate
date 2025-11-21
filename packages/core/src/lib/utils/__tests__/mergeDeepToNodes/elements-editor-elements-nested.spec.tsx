/** @jsx jsxt */
import { expect, test as it } from 'bun:test';

import { ListItemPlugin } from '@platejs/list-classic/react';
import { jsxt } from '@platejs/test-utils';
import { ElementApi } from '@platejs/slate';

import { BaseParagraphPlugin } from '../../../plugins';
import { mergeDeepToNodes } from '../../../utils';

jsxt;

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
    <element a={1} type={ListItemPlugin.key}>
      test
      <element a={1} type={BaseParagraphPlugin.key}>
        test
      </element>
      test
    </element>
  </editor>
) as any;

it('should set props to all elements', () => {
  mergeDeepToNodes({
    node,
    query: {
      filter: ([n]) => ElementApi.isElement(n),
    },
    source: props,
  });
  expect(node.children).toEqual(output.children);
});
