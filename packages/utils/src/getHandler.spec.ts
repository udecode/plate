import { getHandler } from './getHandler';

it('should be', () => {
  const cb = jest.fn();

  getHandler(cb)();

  expect(cb).toHaveBeenCalled();
});

it('should be', () => {
  getHandler()();

  expect(1).toBe(1);
});
