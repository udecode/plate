/** @jsx jsx */

import { isElement } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { mergeDeepToNodes } from '../../../transforms/index';

jsx;

const node = (<htext>test</htext>) as any;

const props = { a: 1 };

const output = (<htext>test</htext>) as any;

it('should do nothing', () => {
  mergeDeepToNodes({
    node,
    source: props,
    query: {
      filter: ([n]) => isElement(n),
    },
  });
  expect(node).toEqual(output);
});
