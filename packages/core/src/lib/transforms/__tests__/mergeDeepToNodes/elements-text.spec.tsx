/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';
import { isElement } from '@udecode/slate';

import { mergeDeepToNodes } from '../../../utils';

jsxt;

const node = (<htext>test</htext>) as any;

const props = { a: 1 };

const output = (<htext>test</htext>) as any;

it('should do nothing', () => {
  mergeDeepToNodes({
    node,
    query: {
      filter: ([n]) => isElement(n),
    },
    source: props,
  });
  expect(node).toEqual(output);
});
