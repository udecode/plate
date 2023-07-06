import { Value } from '@udecode/slate';
import { createDocumentNode } from '@udecode/slate-utils';

const output: Value = [
  {
    children: [
      {
        type: 'p',
        children: [{ text: '' }],
      },
    ],
  } as any,
];

it('should be', () => {
  expect(createDocumentNode()).toEqual(output);
});
