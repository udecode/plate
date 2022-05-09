import { ELEMENT_PARAGRAPH } from '../../../../../../nodes/paragraph/src/createParagraphPlugin';
import { TElement } from '../../../../slate/element/TElement';
import { createNode } from '../../../utils/index';

const output: TElement = { type: ELEMENT_PARAGRAPH, children: [{ text: '' }] };

it('should be', () => {
  expect(createNode()).toEqual(output);
});
