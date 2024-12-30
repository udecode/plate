import { createTEditor } from '../../../createTEditor';
import { getParentNode } from '../../../interfaces';

it('should be', () => {
  expect(getParentNode(createTEditor(), [])).toEqual(undefined);
});
