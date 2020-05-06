/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { addAttrsToChildren } from 'deserializers/utils';
import { BoldPlugin } from 'marks/bold';

export const input = {
  node: {
    plugins: [BoldPlugin()],
    el: document.createElement('strong'),
    children: (
      <fragment>
        <li>
          <p>test</p>test
        </li>
      </fragment>
    ),
  },
  attrs: {
    bold: true,
  },
};

export const run = (value: any) => {
  addAttrsToChildren(value.node, value.attrs);
  return value.node.children;
};

export const output = (
  <fragment>
    <li>
      <p>
        <txt bold>test</txt>
      </p>
      <txt bold>test</txt>
    </li>
  </fragment>
);
