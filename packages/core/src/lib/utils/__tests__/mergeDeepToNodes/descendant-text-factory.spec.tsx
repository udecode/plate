/** @jsx jsxt */
import { expect, test as it } from 'bun:test';

import { jsxt } from '@platejs/test-utils';
import { NodeApi } from '@platejs/slate';

import { mergeDeepToNodes } from '../../../utils';

jsxt;

const node = (<htext>test</htext>) as any;

const props = { a: 1 };

const output = (<htext a={1}>test</htext>) as any;

it('should set props to the text node using a factory', () => {
  mergeDeepToNodes({
    node,
    query: { filter: ([n]) => NodeApi.isDescendant(n) },
    source: () => props,
  });
  expect(node).toEqual(output);
});
