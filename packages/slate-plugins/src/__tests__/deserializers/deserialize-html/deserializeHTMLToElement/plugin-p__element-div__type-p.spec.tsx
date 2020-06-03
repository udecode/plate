/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { deserializeHTMLToElement } from 'deserializers/deserialize-html/utils';
import { ParagraphPlugin } from 'elements/paragraph';

const el = document.createElement('div');
el.setAttribute('data-slate-type', 'p');

const input = {
  plugins: [ParagraphPlugin({ typeP: 'p' })],
  el,
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
