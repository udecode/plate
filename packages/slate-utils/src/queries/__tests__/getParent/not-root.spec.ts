import { createTEditor, getParentNode } from '@udecode/slate';

it('should be', () => {
  expect(getParentNode(createTEditor(), [0])?.[1]).toEqual([]);
});
