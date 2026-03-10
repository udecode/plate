import { getHandler } from './getHandler';

describe('getHandler', () => {
  it('calls the callback with the captured arguments', () => {
    const callback = mock<(value: string, count: number) => void>();

    const handler = getHandler(callback as any, 'alpha', 2);
    handler();

    expect(callback).toHaveBeenCalledWith('alpha', 2);
  });

  it('returns a no-op handler when no callback is provided', () => {
    const handler = getHandler(undefined);

    expect(() => handler()).not.toThrow();
  });
});
