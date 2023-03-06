import { createTEditor } from '../../../../../slate/src/createTEditor';
import { getParentNode } from '../../../../../slate/src/interfaces/editor/getParentNode';

it('should be', () => {
  expect(getParentNode(createTEditor(), [0])?.[1]).toEqual([]);
});
