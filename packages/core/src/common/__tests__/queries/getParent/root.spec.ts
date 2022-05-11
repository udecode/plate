import { getParentNode } from '../../../../slate/editor/getParentNode';
import { createTEditor } from '../../../../utils/createTEditor';

it('should be', () => {
  expect(getParentNode(createTEditor(), [])).toEqual(undefined);
});
