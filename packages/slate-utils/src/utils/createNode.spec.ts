import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { TElement } from '@udecode/slate/src/interfaces/element/TElement';
import { createNode } from './createNode';

const output: TElement = { type: ELEMENT_PARAGRAPH, children: [{ text: '' }] };

it('should be', () => {
  expect(createNode()).toEqual(output);
});
