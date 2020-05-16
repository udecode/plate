/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { setPropsToTexts } from 'common/transforms';

const node = (
  <editor>
    <li>
      test
      <p>test</p>test
    </li>
  </editor>
) as any;

const props = {
  bold: true,
};

const output = (
  <editor>
    <li>
      <htext bold>test</htext>
      <p>
        <htext bold>test</htext>
      </p>
      <htext bold>test</htext>
    </li>
  </editor>
) as any;

it('should set props to all text nodes', () => {
  setPropsToTexts(node, props);
  expect(node.children).toEqual(output.children);
});
