import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph/src/createParagraphPlugin';
import { TElement } from '../../../../../slate/src/interfaces/element/TElement';
import { createNode } from '../../index';

const output: TElement = { type: ELEMENT_PARAGRAPH, children: [{ text: '' }] };

it('should be', () => {
  expect(createNode()).toEqual(output);
});
