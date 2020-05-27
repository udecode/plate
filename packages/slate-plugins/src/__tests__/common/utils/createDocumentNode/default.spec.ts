import { createDocumentNode } from 'common/utils';
import { PARAGRAPH } from 'elements/paragraph';
import { Node } from 'slate';

const output: Node[] = [
  {
    children: [
      {
        type: PARAGRAPH,
        children: [{ text: '' }],
      },
    ],
  },
];

it('should be', () => {
  expect(createDocumentNode()).toEqual(output);
});
