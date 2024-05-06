import type { Value } from '@udecode/slate';

import { createDocumentNode } from '@udecode/slate-utils';

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
