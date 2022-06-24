import { getHandler } from '../../../utils/index';

it('should be', () => {
  getHandler(undefined)();

  expect(1).toBe(1);
});
