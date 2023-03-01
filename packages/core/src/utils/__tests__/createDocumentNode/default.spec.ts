import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph/src/createParagraphPlugin';
import { Value } from '../../../../../slate-utils/src/slate/editor/TEditor';
import { createDocumentNode } from '../../index';

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
