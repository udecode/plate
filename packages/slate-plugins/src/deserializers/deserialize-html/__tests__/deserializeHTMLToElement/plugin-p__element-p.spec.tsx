/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { ParagraphPlugin } from '../../../../elements/paragraph/ParagraphPlugin';
import { deserializeHTMLToElement } from '../../utils/deserializeHTMLToElement';

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
