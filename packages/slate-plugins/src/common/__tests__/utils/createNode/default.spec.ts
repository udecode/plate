import { Node } from 'slate';
import { ELEMENT_PARAGRAPH } from '../../../../elements/paragraph/index';
import { createNode } from '../../../utils/index';

const output: Node = { type: ELEMENT_PARAGRAPH, children: [{ text: '' }] };

it('should be', () => {
  expect(createNode()).toEqual(output);
});
