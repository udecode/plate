import { createEditor } from 'slate';
import { getParent } from '../../../queries/getParent';

it('should be', () => {
  expect(getParent(createEditor(), [0])?.[1]).toEqual([]);
});
