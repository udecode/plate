import { callOrReturn } from './callOrReturn';

describe('callOrReturn', () => {
  it('returns literal values unchanged', () => {
    expect(callOrReturn('value')).toBe('value');
    expect(callOrReturn({ ok: true })).toEqual({ ok: true });
  });

  it('calls functions with the provided props', () => {
    const fn = mock((a: number, b: number) => a + b);

    expect(callOrReturn(fn, 2, 3)).toBe(5);
    expect(fn).toHaveBeenCalledWith(2, 3);
  });
});
