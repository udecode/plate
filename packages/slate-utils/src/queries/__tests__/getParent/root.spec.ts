import { createTEditor, getParentNode } from '@udecode/slate';

it('should be', () => {
  expect(getParentNode(createTEditor(), [])).toEqual(undefined);
});
