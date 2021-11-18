import { ELEMENT_PARAGRAPH } from '../../../../../../elements/paragraph/src/createParagraphPlugin';
import {TElement} from "../../../../types/slate/TElement";
import { createNode } from '../../../utils/index';

const output: TElement = { type: ELEMENT_PARAGRAPH, children: [{ text: '' }] };

it('should be', () => {
  expect(createNode()).toEqual(output);
});
