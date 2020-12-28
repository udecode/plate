/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { Element } from 'slate';
import { mergeDeepToNodes } from '../../../transforms/index';

const node = (<htext>test</htext>) as any;

const props = { a: 1 };

const output = (<htext>test</htext>) as any;

it('should do nothing', () => {
  mergeDeepToNodes({
    node,
    source: props,
    query: {
      filter: ([n]) => Element.isElement(n),
    },
  });
  expect(node).toEqual(output);
});
