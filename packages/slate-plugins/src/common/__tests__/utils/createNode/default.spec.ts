import { Node } from 'slate';
import { PARAGRAPH } from '../../../../elements/paragraph/index';
import { createNode } from '../../../utils/index';

const output: Node = { type: PARAGRAPH, children: [{ text: '' }] };

it('should be', () => {
  expect(createNode()).toEqual(output);
});
