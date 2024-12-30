import { createTEditor } from '../../../createTEditor';
import { getParentNode } from '../../../interfaces';

it('should be', () => {
  expect(getParentNode(createTEditor(), [0])?.[1]).toEqual([]);
});
