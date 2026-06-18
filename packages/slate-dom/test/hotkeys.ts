import { Hotkeys, isHotkey, type KeyboardEventLike } from '../src/index';

const event = ({
  altKey = false,
  code = '',
  ctrlKey = false,
  getModifierState,
  key,
  metaKey = false,
  shiftKey = false,
}: {
  altKey?: boolean;
  code?: string;
  ctrlKey?: boolean;
  getModifierState?: (key: string) => boolean;
  key: string;
  metaKey?: boolean;
  shiftKey?: boolean;
}): KeyboardEventLike => ({
  altKey,
  code,
  ctrlKey,
  getModifierState,
  key,
  metaKey,
  shiftKey,
});

describe('slate-dom hotkeys', () => {
  test('keeps Slate Hotkeys matching by semantic key', () => {
    expect(
      Hotkeys.isUndo(event({ code: 'KeyZ', ctrlKey: true, key: 'z' }))
    ).toBe(true);
    expect(
      Hotkeys.isRedo(event({ code: 'KeyY', ctrlKey: true, key: 'y' }))
    ).toBe(true);
    expect(Hotkeys.isSoftBreak(event({ key: 'Enter', shiftKey: true }))).toBe(
      true
    );
    expect(Hotkeys.isSplitBlock(event({ key: 'Enter' }))).toBe(true);
  });

  test('supports optional modifiers used by deletion hotkeys', () => {
    expect(Hotkeys.isDeleteBackward(event({ key: 'Backspace' }))).toBe(true);
    expect(
      Hotkeys.isDeleteBackward(event({ key: 'Backspace', shiftKey: true }))
    ).toBe(true);
    expect(Hotkeys.isDeleteForward(event({ key: 'Delete' }))).toBe(true);
    expect(
      Hotkeys.isDeleteForward(event({ key: 'Delete', shiftKey: true }))
    ).toBe(true);
    expect(
      isHotkey(
        ['ctrl+delete', 'ctrl+d'],
        { platform: 'apple' },
        event({ ctrlKey: true, key: 'd' })
      )
    ).toBe(true);
    expect(
      isHotkey(
        ['ctrl+backspace', 'ctrl+h'],
        { platform: 'apple' },
        event({ ctrlKey: true, key: 'h' })
      )
    ).toBe(true);
    expect(
      isHotkey(
        ['cmd+shift?+delete', 'ctrl+k'],
        { platform: 'apple' },
        event({ ctrlKey: true, key: 'k' })
      )
    ).toBe(true);
  });

  test('treats numpad Enter as a split-block Enter key', () => {
    const numpadEnter = event({ code: 'NumpadEnter', key: 'Enter' });

    expect(Hotkeys.isSplitBlock(numpadEnter)).toBe(true);
    expect(isHotkey('enter', numpadEnter)).toBe(true);
    expect(isHotkey('return', numpadEnter)).toBe(true);
  });

  test('matches Slate-owned word selection extension hotkeys', () => {
    expect(
      Hotkeys.isExtendWordForward(
        event({ ctrlKey: true, key: 'ArrowRight', shiftKey: true })
      )
    ).toBe(true);
    expect(
      Hotkeys.isExtendWordBackward(
        event({ ctrlKey: true, key: 'ArrowLeft', shiftKey: true })
      )
    ).toBe(true);
    if (!/Mac OS X/.test(globalThis.navigator?.userAgent ?? '')) {
      expect(
        Hotkeys.isExtendWordForward(
          event({ altKey: true, key: 'ArrowRight', shiftKey: true })
        )
      ).toBe(false);
    }
    expect(
      isHotkey(
        'opt+shift+right',
        { platform: 'apple' },
        event({ altKey: true, key: 'ArrowRight', shiftKey: true })
      )
    ).toBe(true);
  });

  test('matches Slate-owned line boundary movement hotkeys', () => {
    expect(Hotkeys.isMoveLineBackward(event({ key: 'Home' }))).toBe(true);
    expect(Hotkeys.isMoveLineForward(event({ key: 'End' }))).toBe(true);
    expect(
      isHotkey(
        ['opt+up', 'ctrl+a'],
        { platform: 'apple' },
        event({ ctrlKey: true, key: 'a' })
      )
    ).toBe(true);
    expect(
      isHotkey(
        ['opt+down', 'ctrl+e'],
        { platform: 'apple' },
        event({ ctrlKey: true, key: 'e' })
      )
    ).toBe(true);
  });

  test('matches non-English letter layouts by physical code only when key is non-ASCII', () => {
    expect(
      Hotkeys.isUndo(event({ code: 'KeyZ', ctrlKey: true, key: 'я' }))
    ).toBe(true);
    expect(
      Hotkeys.isUndo(event({ code: 'KeyZ', ctrlKey: true, key: 'Я' }))
    ).toBe(true);
  });

  test('does not treat ASCII remapped layouts as physical-key shortcuts', () => {
    expect(
      Hotkeys.isUndo(event({ code: 'KeyZ', ctrlKey: true, key: 'x' }))
    ).toBe(false);
  });

  test('exposes a generic Slate-owned matcher for example shortcuts', () => {
    expect(isHotkey('mod+`', event({ ctrlKey: true, key: '`' }))).toBe(true);
    expect(isHotkey('left', event({ key: 'ArrowLeft' }))).toBe(true);
    expect(isHotkey('shift?+delete', event({ key: 'Delete' }))).toBe(true);
    expect(
      isHotkey('shift?+delete', event({ key: 'Delete', shiftKey: true }))
    ).toBe(true);
  });

  test('supports direct isHotkey checks without precompiling', () => {
    expect(isHotkey('tab', event({ key: 'Tab' }))).toBe(true);
    expect(isHotkey('tab', event({ key: 'Enter' }))).toBe(false);
    expect(
      isHotkey(
        'ctrl+o',
        { platform: 'apple' },
        event({ ctrlKey: true, key: 'o' })
      )
    ).toBe(true);
    expect(
      isHotkey(
        'mod+s',
        { platform: 'apple' },
        event({ key: 's', metaKey: true })
      )
    ).toBe(true);
  });

  test('matches generic letter shortcuts by semantic key before physical code fallback', () => {
    expect(
      isHotkey('ctrl+x', event({ code: 'KeyB', ctrlKey: true, key: 'x' }))
    ).toBe(true);
    expect(
      isHotkey('ctrl+x', event({ code: 'KeyB', ctrlKey: true, key: 'X' }))
    ).toBe(true);
    expect(
      isHotkey('ctrl+b', event({ code: 'KeyB', ctrlKey: true, key: 'x' }))
    ).toBe(false);
    expect(
      isHotkey('ctrl+z', event({ code: 'KeyZ', ctrlKey: true, key: 'я' }))
    ).toBe(true);
    expect(
      isHotkey('ctrl+z', event({ code: 'KeyZ', ctrlKey: true, key: 'Я' }))
    ).toBe(true);
  });

  test('accepts keyboard event-like objects without nativeEvent', () => {
    expect(isHotkey('enter', { key: 'Enter' })).toBe(true);
    expect(
      isHotkey('mod+b', {
        ctrlKey: true,
        key: 'b',
        nativeEvent: event({ ctrlKey: true, key: 'b' }),
      } as KeyboardEventLike & { nativeEvent: KeyboardEventLike })
    ).toBe(true);
  });

  test('supports canonical key names and multi-hotkey specs', () => {
    expect(isHotkey('cmd+s', event({ key: 's', metaKey: true }))).toBe(true);
    expect(isHotkey('command+s', event({ key: 's', metaKey: true }))).toBe(
      true
    );
    expect(isHotkey('win+s', event({ key: 's', metaKey: true }))).toBe(true);
    expect(isHotkey('windows+s', event({ key: 's', metaKey: true }))).toBe(
      true
    );
    expect(isHotkey('cmd+space', event({ key: ' ', metaKey: true }))).toBe(
      true
    );
    expect(isHotkey('cmd++', event({ key: '+', metaKey: true }))).toBe(true);
    expect(isHotkey('cmd+=', event({ key: '=', metaKey: true }))).toBe(true);
    expect(isHotkey('?', event({ key: '?' }))).toBe(true);
    expect(
      isHotkey('ctrl+return', event({ ctrlKey: true, key: 'Enter' }))
    ).toBe(true);
    expect(
      isHotkey('control+return', event({ ctrlKey: true, key: 'Enter' }))
    ).toBe(true);
    expect(isHotkey('ctl+return', event({ ctrlKey: true, key: 'Enter' }))).toBe(
      true
    );
    expect(isHotkey('opt+esc', event({ altKey: true, key: 'Escape' }))).toBe(
      true
    );
    expect(isHotkey('option+esc', event({ altKey: true, key: 'Escape' }))).toBe(
      true
    );
    expect(isHotkey('del', event({ key: 'Delete' }))).toBe(true);
    expect(isHotkey('ins', event({ key: 'Insert' }))).toBe(true);
    expect(isHotkey('break', event({ key: 'Pause' }))).toBe(true);
    expect(isHotkey('capslock', event({ key: 'CapsLock' }))).toBe(true);
    expect(isHotkey('spacebar', event({ key: ' ' }))).toBe(true);
    expect(isHotkey('f5', event({ key: 'F5' }))).toBe(true);
    expect(isHotkey('pageup', event({ key: 'PageUp' }))).toBe(true);
    expect(isHotkey('pagedown', event({ key: 'PageDown' }))).toBe(true);
    expect(
      isHotkey('meta+alt+ß', event({ altKey: true, key: 'ß', metaKey: true }))
    ).toBe(true);
    expect(
      isHotkey(['meta+a', 'meta+s'], event({ key: 'a', metaKey: true }))
    ).toBe(true);
    expect(
      isHotkey(['meta+a', 'meta+s'], event({ key: 's', metaKey: true }))
    ).toBe(true);
  });

  test('requires exact modifiers unless a modifier is optional', () => {
    expect(
      isHotkey('cmd+s', event({ altKey: true, key: 's', metaKey: true }))
    ).toBe(false);
    expect(isHotkey('a', event({ ctrlKey: true, key: 'a' }))).toBe(false);
    expect(isHotkey('cmd+alt?+s', event({ key: 's', metaKey: true }))).toBe(
      true
    );
    expect(
      isHotkey('cmd+alt?+s', event({ altKey: true, key: 's', metaKey: true }))
    ).toBe(true);
    expect(
      isHotkey(
        'mod?+shift+left',
        { platform: 'other' },
        event({ key: 'ArrowLeft', shiftKey: true })
      )
    ).toBe(true);
    expect(
      isHotkey(
        'mod?+shift+left',
        { platform: 'other' },
        event({ ctrlKey: true, key: 'ArrowLeft', shiftKey: true })
      )
    ).toBe(true);
  });

  test('supports platform-specific mod matching', () => {
    expect(
      isHotkey(
        'mod+s',
        { platform: 'apple' },
        event({ key: 's', metaKey: true })
      )
    ).toBe(true);
    expect(
      isHotkey(
        'mod+s',
        { platform: 'apple' },
        event({ ctrlKey: true, key: 's' })
      )
    ).toBe(false);
    expect(
      isHotkey(
        'mod+s',
        { platform: 'other' },
        event({ ctrlKey: true, key: 's' })
      )
    ).toBe(true);
    expect(
      isHotkey(
        'mod+s',
        { platform: 'other' },
        event({ key: 's', metaKey: true })
      )
    ).toBe(false);
  });

  test('supports modifier-only keydown checks', () => {
    expect(isHotkey('shift', event({ key: 'Shift', shiftKey: true }))).toBe(
      true
    );
    expect(isHotkey('shift', event({ key: 's', shiftKey: true }))).toBe(false);
    expect(isHotkey('meta', event({ key: 'Meta', metaKey: true }))).toBe(true);
    expect(isHotkey('meta', event({ key: 's', metaKey: true }))).toBe(false);
  });

  test('rejects invalid hotkey grammar', () => {
    expect(() => isHotkey('ctrlalt+k', event({ key: 'k' }))).toThrow(
      'Unknown modifier: "ctrlalt"'
    );
  });

  test('does not fire ctrl-alt shortcuts for AltGraph text input', () => {
    expect(
      isHotkey(
        'ctrl+alt+e',
        event({
          altKey: true,
          code: 'KeyE',
          ctrlKey: true,
          getModifierState: (key) => key === 'AltGraph',
          key: '€',
        })
      )
    ).toBe(false);
  });
});
