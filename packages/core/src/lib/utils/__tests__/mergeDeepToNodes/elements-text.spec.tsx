/** @jsx jsxt */
import { expect, test as it } from 'bun:test';

import { jsxt } from '@platejs/test-utils';
import { ElementApi } from '@platejs/slate';

import { mergeDeepToNodes } from '../../../utils';

jsxt;

const node = (<htext>test</htext>) as any;

const props = { a: 1 };

const output = (<htext>test</htext>) as any;

it('should do nothing', () => {
  mergeDeepToNodes({
    node,
    query: {
      filter: ([n]) => ElementApi.isElement(n),
    },
    source: props,
  });
  expect(node).toEqual(output);
});
