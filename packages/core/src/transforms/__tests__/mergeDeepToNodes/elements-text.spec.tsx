/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { isElement } from '../../../../../slate/src/interfaces/element/isElement';
import { mergeDeepToNodes } from '../../../../../slate-utils/src/utils/mergeDeepToNodes';

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
