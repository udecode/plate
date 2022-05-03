import { createEditor } from 'slate';
import { getParentNode } from '../../../../slate/editor/getParentNode';

it('should be', () => {
  expect(getParentNode(createEditor(), [0])?.[1]).toEqual([]);
});
