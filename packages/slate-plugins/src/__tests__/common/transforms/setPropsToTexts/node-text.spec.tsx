/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { setPropsToTexts } from 'common/transforms';

const node = (<text>test</text>) as any;

const props = {
  bold: true,
};

const output = (<htext bold>test</htext>) as any;

it('should set props to the text node', () => {
  setPropsToTexts(node, props);
  expect(node).toEqual(output);
});
