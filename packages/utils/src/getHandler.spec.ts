import { getHandler } from './getHandler';

it('should be', () => {
  const cb = jest.fn();

  getHandler(cb)();

  expect(cb).toBeCalled();
});

it('should be', () => {
  getHandler(undefined)();

  expect(1).toBe(1);
});
