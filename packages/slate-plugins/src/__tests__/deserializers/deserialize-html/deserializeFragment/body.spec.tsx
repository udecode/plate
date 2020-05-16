/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { deserializeFragment } from 'deserializers/deserialize-html/utils';

const fragment = (
  <fragment>
    <p>
      <htext>test</htext>
    </p>
  </fragment>
);

const input = {
  el: document.createElement('body'),
  children: fragment,
} as any;

const output = fragment;

it('should be', () => {
  expect(deserializeFragment(input)).toEqual(output);
});
