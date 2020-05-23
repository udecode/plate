import { getPreventDefaultHandler } from 'common/utils/getPreventDefaultHandler';

it('should be', () => {
  const cb = jest.fn();

  getPreventDefaultHandler()(new Event(''));

  expect(cb).not.toBeCalled();
});
