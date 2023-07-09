import { createTEditor } from '@udecode/slate/src/createTEditor';
import { getParentNode } from '@udecode/slate/src/interfaces/editor/getParentNode';

it('should be', () => {
  expect(getParentNode(createTEditor(), [])).toEqual(undefined);
});
