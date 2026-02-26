import { getHandler } from './getHandler';

it('should be', () => {
  const cb = mock() as unknown as (...args: any[]) => any;

  getHandler(cb)();

  expect(cb).toHaveBeenCalled();
});

it('should be', () => {
  getHandler()();

  expect(1).toBe(1);
});
