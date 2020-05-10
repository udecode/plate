/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { setPropsToDescendants } from 'common/transforms';

const node = (<text>test</text>) as any;

const props = { a: 1 };

const output = (<txt a={1}>test</txt>) as any;

it('should set props to the text node', () => {
  setPropsToDescendants(node, props);
  expect(node).toEqual(output);
});
