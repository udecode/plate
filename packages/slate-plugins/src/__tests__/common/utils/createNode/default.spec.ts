import { createNode } from 'common/utils';
import { PARAGRAPH } from 'elements/paragraph';
import { Node } from 'slate';

const output: Node = { type: PARAGRAPH, children: [{ text: '' }] };

it('should be', () => {
  expect(createNode()).toEqual(output);
});
