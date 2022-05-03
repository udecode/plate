import { ELEMENT_PARAGRAPH } from '../../../../../../nodes/paragraph/src/createParagraphPlugin';
import { TDescendant } from '../../../../slate/types/TDescendant';
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
