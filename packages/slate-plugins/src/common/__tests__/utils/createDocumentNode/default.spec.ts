import { Node } from 'slate';
import { ELEMENT_PARAGRAPH } from '../../../../elements/paragraph/index';
import { createDocumentNode } from '../../../utils/index';

const output: Node[] = [
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
