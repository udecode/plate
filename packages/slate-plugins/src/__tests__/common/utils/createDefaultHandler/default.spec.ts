import { createDefaultHandler } from 'common/utils/createDefaultHandler';

it('should be', () => {
  const cb = jest.fn();

  createDefaultHandler(cb)(new Event(''));

  expect(cb).toBeCalled();
});
