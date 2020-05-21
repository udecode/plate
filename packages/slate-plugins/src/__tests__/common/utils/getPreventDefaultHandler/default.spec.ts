import { getPreventDefaultHandler } from 'common/utils/getPreventDefaultHandler';

it('should be', () => {
  const cb = jest.fn();

  getPreventDefaultHandler(cb)(new Event(''));

  expect(cb).toBeCalled();
});
