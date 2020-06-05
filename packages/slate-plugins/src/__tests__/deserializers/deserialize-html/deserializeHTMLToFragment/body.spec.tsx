/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { deserializeHTMLToFragment } from 'deserializers/deserialize-html/utils';

const fragment = (
  <fragment>
    <hp>
      <htext>test</htext>
    </hp>
  </fragment>
);

const input = {
  el: document.createElement('body'),
  children: fragment,
} as any;

const output = fragment;

it('should be', () => {
  expect(deserializeHTMLToFragment(input)).toEqual(output);
});
