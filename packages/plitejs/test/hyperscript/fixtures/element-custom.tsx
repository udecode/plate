/** @jsxRuntime classic */
/** @jsx jsx */

import { createHyperscript } from 'plitejs/hyperscript';

const jsx = createHyperscript({
  elements: {
    paragraph: { type: 'paragraph' },
  },
});

void jsx;

export const input = <paragraph>word</paragraph>;
export const output = {
  type: 'paragraph',
  children: [
    {
      text: 'word',
    },
  ],
};
