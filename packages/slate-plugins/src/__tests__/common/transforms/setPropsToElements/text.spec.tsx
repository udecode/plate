/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { setPropsToElements } from 'common/transforms';

const node = (<text>test</text>) as any;

const props = { a: 1 };

const output = (<text>test</text>) as any;

it('should do nothing', () => {
  setPropsToElements(node, props);
  expect(node).toEqual(output);
});
