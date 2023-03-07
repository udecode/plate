import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { Value } from '@udecode/slate';
import { createDocumentNode } from '@udecode/slate-utils';

const output: Value = [
  {
    children: [
      {
        type: ELEMENT_PARAGRAPH,
        children: [{ text: '' }],
      },
    ],
  } as any,
];

it('should be', () => {
  expect(createDocumentNode()).toEqual(output);
});
