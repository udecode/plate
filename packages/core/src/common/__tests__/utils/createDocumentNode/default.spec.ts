import { ELEMENT_PARAGRAPH } from '../../../../../../elements/paragraph/src/createParagraphPlugin';
import { TDescendant } from '../../../../types/slate/TDescendant';
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
