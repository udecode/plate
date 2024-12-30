import type { TElement } from '../interfaces';

import { createNode } from './createNode';

const output: TElement = { children: [{ text: '' }], type: 'p' };

it('should be', () => {
  expect(createNode()).toEqual(output);
});
