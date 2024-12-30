import type { Value } from '../interfaces';

import { createDocumentNode } from './createDocumentNode';

const output: Value = [
  {
    children: [
      {
        children: [{ text: '' }],
        type: 'p',
      },
    ],
  } as any,
];

it('should be', () => {
  expect(createDocumentNode()).toEqual(output);
});
