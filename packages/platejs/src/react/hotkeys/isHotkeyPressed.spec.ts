import {
  isHotkeyPressed,
  isReadonlyArray,
  pushToCurrentlyPressedKeys,
  removeFromCurrentlyPressedKeys,
} from './isHotkeyPressed';

describe('isHotkeyPressed', () => {
  const clearPressedKeys = () => {
    window.dispatchEvent(new Event('blur'));
  };

  beforeEach(clearPressedKeys);
  afterEach(clearPressedKeys);

  it('matches comma-delimited strings and readonly arrays case-insensitively', () => {
    pushToCurrentlyPressedKeys(['CTRL', 'A']);

    expect(isReadonlyArray(['ctrl', 'a'] as const)).toBe(true);
    expect(isReadonlyArray('ctrl+a')).toBe(false);
    expect(isHotkeyPressed('ctrl, a')).toBe(true);
    expect(isHotkeyPressed(['ctrl', 'a'] as const)).toBe(true);
  });

  it('drops stale non-modifier keys while meta is held', () => {
    pushToCurrentlyPressedKeys('x');
    pushToCurrentlyPressedKeys('meta');
    pushToCurrentlyPressedKeys('y');

    expect(isHotkeyPressed('x')).toBe(false);
    expect(isHotkeyPressed('meta, y')).toBe(true);
  });

  it('removes explicit keys and clears everything on meta keyup', () => {
    pushToCurrentlyPressedKeys(['shift', 'z']);
    removeFromCurrentlyPressedKeys(['z']);

    expect(isHotkeyPressed('shift')).toBe(true);
    expect(isHotkeyPressed('z')).toBe(false);

    removeFromCurrentlyPressedKeys('meta');

    expect(isHotkeyPressed('shift')).toBe(false);
  });

  it('tracks keydown and keyup events from the document listeners', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyQ' }));

    expect(isHotkeyPressed('q')).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyQ' }));

    expect(isHotkeyPressed('q')).toBe(false);
  });

  it('ignores synthetic key events that do not expose a code', () => {
    document.dispatchEvent(new Event('keydown'));
    document.dispatchEvent(new Event('keyup'));

    expect(isHotkeyPressed('a')).toBe(false);
  });
});
