import { getHandler } from 'common/utils';

it('should be', () => {
  const cb = jest.fn();

  getHandler(cb)();

  expect(cb).toBeCalled();
});
