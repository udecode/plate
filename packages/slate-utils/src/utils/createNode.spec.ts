import { TElement } from '@udecode/slate/src/interfaces/element/TElement';

import { createNode } from './createNode';

const output: TElement = { type: 'p', children: [{ text: '' }] };

it('should be', () => {
  expect(createNode()).toEqual(output);
});
