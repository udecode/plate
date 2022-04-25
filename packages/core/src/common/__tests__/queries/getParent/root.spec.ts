import { createEditor } from 'slate';
import { getParentNodeNode } from '../../../slate/editor/getParentNodeNode';

it('should be', () => {
  expect(getParentNodeNode(createEditor(), [])).toEqual(undefined);
});
