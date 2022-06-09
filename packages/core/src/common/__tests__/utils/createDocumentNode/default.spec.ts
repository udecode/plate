import { ELEMENT_PARAGRAPH } from '../../../../../../nodes/paragraph/src/createParagraphPlugin';
import { Value } from '../../../../slate/editor/TEditor';
import { createDocumentNode } from '../../../utils/index';

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
