import { Node } from 'slate';
import { createDocumentNode } from '../../../../common/utils';
import { PARAGRAPH } from '../../../../elements/paragraph';

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
