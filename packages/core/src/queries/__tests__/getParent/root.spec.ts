import { getParentNode } from '../../../slate/editor/getParentNode';
import { createTEditor } from '../../../utils/slate/createTEditor';

it('should be', () => {
  expect(getParentNode(createTEditor(), [])).toEqual(undefined);
});
