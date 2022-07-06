import { getParentNode } from '../../../slate/editor/getParentNode';
import { createTEditor } from '../../../utils/slate/createTEditor';

it('should be', () => {
  expect(getParentNode(createTEditor(), [0])?.[1]).toEqual([]);
});
