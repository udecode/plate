import { createTEditor } from '../../../createTEditor';

it('should be', () => {
  expect(createTEditor().api.parent([])).toEqual(undefined);
});
