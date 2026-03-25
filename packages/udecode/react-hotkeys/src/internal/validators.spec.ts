import { pushToCurrentlyPressedKeys } from './isHotkeyPressed';
import {
  isHotkeyEnabled,
  isHotkeyEnabledOnTag,
  isHotkeyMatchingKeyboardEvent,
  isKeyboardEventTriggeredByInput,
  isScopeActive,
  maybePreventDefault,
} from './validators';

const createKeyboardEvent = (
  overrides: Partial<KeyboardEvent> = {}
): KeyboardEvent =>
  ({
    altKey: false,
    code: 'KeyA',
    ctrlKey: false,
    key: 'a',
    metaKey: false,
    preventDefault: mock(),
    shiftKey: false,
    target: document.createElement('div'),
    ...overrides,
  }) as KeyboardEvent;

describe('validators', () => {
  afterEach(() => {
    window.dispatchEvent(new Event('blur'));
  });

  it('prevents default when configured by flag or callback', () => {
    const event = createKeyboardEvent();
    const hotkey = { keys: ['a'] };

    maybePreventDefault(event, hotkey as any, true);
    maybePreventDefault(event, hotkey as any, () => true);

    expect(event.preventDefault).toHaveBeenCalledTimes(2);
  });

  it('checks enabled state and tag allowlists', () => {
    const inputEvent = createKeyboardEvent({
      target: document.createElement('input'),
    });

    expect(isHotkeyEnabled(inputEvent, { keys: ['a'] } as any)).toBe(true);
    expect(
      isHotkeyEnabled(inputEvent, { keys: ['a'] } as any, () => false)
    ).toBe(false);
    expect(isKeyboardEventTriggeredByInput(inputEvent)).toBe(true);
    expect(isHotkeyEnabledOnTag(inputEvent, ['textarea'])).toBe(false);
    expect(isHotkeyEnabledOnTag(inputEvent, true)).toBe(true);
  });

  it('warns and falls back open when scopes are configured without a provider', () => {
    const warnSpy = spyOn(console, 'warn') as any;

    warnSpy.mockImplementation(() => {});

    expect(isScopeActive([], ['editor'])).toBe(true);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(isScopeActive(['editor'], ['editor'])).toBe(true);
    expect(isScopeActive(['sidebar'], ['editor'])).toBe(false);
    expect(isScopeActive(['*'], ['editor'])).toBe(true);

    warnSpy.mockRestore();
  });

  it('matches keyboard events through produced keys, modifiers, and pressed-key fallback', () => {
    expect(
      isHotkeyMatchingKeyboardEvent(
        createKeyboardEvent({ code: 'Slash', key: '?' }),
        {
          alt: false,
          ctrl: false,
          keys: ['?'],
          meta: false,
          shift: false,
          useKey: true,
        } as any
      )
    ).toBe(true);

    expect(
      isHotkeyMatchingKeyboardEvent(
        createKeyboardEvent({ code: 'KeyK', ctrlKey: true }),
        {
          alt: false,
          ctrl: false,
          keys: ['k'],
          meta: false,
          mod: true,
          shift: false,
        } as any
      )
    ).toBe(true);

    expect(
      isHotkeyMatchingKeyboardEvent(
        createKeyboardEvent({ code: 'KeyA', shiftKey: true }),
        {
          alt: false,
          ctrl: false,
          keys: ['a'],
          meta: false,
          shift: false,
        } as any,
        true
      )
    ).toBe(true);

    pushToCurrentlyPressedKeys(['a', 'b']);

    expect(
      isHotkeyMatchingKeyboardEvent(createKeyboardEvent({ code: 'KeyB' }), {
        alt: false,
        ctrl: false,
        keys: ['a', 'b'],
        meta: false,
        shift: false,
      } as any)
    ).toBe(true);
    expect(
      isHotkeyMatchingKeyboardEvent(createKeyboardEvent({ code: 'KeyC' }), {
        alt: false,
        ctrl: false,
        keys: ['a', 'b'],
        meta: false,
        shift: false,
      } as any)
    ).toBe(false);
  });
});
