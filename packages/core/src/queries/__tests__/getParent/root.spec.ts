import { getParentNode } from '../../../../../slate-utils/src/slate/editor/getParentNode';
import { createTEditor } from '../../../../../slate-utils/src/utils/createTEditor';

it('should be', () => {
  expect(getParentNode(createTEditor(), [])).toEqual(undefined);
});
