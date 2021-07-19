import { TDescendant } from '@udecode/plate-core';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { createDocumentNode } from '../../../utils/index';

const output: TDescendant[] = [
  {
    children: [
      {
        type: ELEMENT_PARAGRAPH,
        children: [{ text: '' }],
      },
    ],
  },
];

it('should be', () => {
  expect(createDocumentNode()).toEqual(output);
});
