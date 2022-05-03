import { createEditor } from 'slate';
import { getParentNode } from '../../../../slate/editor/getParentNode';

it('should be', () => {
  expect(getParentNode(createEditor(), [])).toEqual(undefined);
});
