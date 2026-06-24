/** @jsx jsx */

import { createHyperscript } from '@platejs/plite-hyperscript';

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
