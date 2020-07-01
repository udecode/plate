import { Node } from 'slate';
import { PARAGRAPH } from '../../../../elements/paragraph/index';
import { createDocumentNode } from '../../../utils/index';

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
