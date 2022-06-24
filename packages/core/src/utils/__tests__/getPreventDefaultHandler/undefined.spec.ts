import { getPreventDefaultHandler } from '../../react/getPreventDefaultHandler';

it('should be', () => {
  const cb = jest.fn();

  getPreventDefaultHandler()(new Event(''));

  expect(cb).not.toBeCalled();
});
