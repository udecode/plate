import { createTEditor } from '../../../createTEditor';

it('should be', () => {
  expect(createTEditor().api.parent([0])?.[1]).toEqual([]);
});
