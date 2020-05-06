/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { deserializeFragment } from 'deserializers/utils';

const fragment = (
  <fragment>
    <p>
      <txt>test</txt>
    </p>
  </fragment>
);

export const input = {
  el: document.createElement('body'),
  children: fragment,
};

export const run = (value: any) => {
  return deserializeFragment(value);
};

export const output = fragment;
