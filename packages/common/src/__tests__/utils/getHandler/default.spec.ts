import { getHandler } from '../../../utils/index';

it('should be', () => {
  const cb = jest.fn();

  getHandler(cb)();

  expect(cb).toBeCalled();
});
