import { getHandler } from 'common/utils';

it('should be', () => {
  getHandler(undefined)();

  expect(1).toBe(1);
});
