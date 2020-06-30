import { Node } from 'slate';
import { createNode } from '../../../../common/utils';
import { PARAGRAPH } from '../../../../elements/paragraph';

const output: Node = { type: PARAGRAPH, children: [{ text: '' }] };

it('should be', () => {
  expect(createNode()).toEqual(output);
});
