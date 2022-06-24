import { getHandler } from '../../index';

it('should be', () => {
  const cb = jest.fn();

  getHandler(cb)();

  expect(cb).toBeCalled();
});
