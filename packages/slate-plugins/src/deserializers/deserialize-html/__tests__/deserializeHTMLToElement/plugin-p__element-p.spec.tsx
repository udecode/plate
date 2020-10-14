/** @jsx jsx */

import { jsx } from '../../../../__test-utils__/jsx';
import { ParagraphPlugin } from '../../../../elements/paragraph/index';
import { deserializeHTMLToElement } from '../../utils/index';

const input = {
  plugins: [ParagraphPlugin({ p: { type: 'p' } })],
  element: document.createElement('p'),
  children: [{ text: 'test' }],
};

const output = (
  <hp>
    <htext>test</htext>
  </hp>
);

it('should be', () => {
  expect(deserializeHTMLToElement(input)).toEqual(output);
});
