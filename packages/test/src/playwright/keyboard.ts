import type { Locator } from '@playwright/test';

type SyntheticKeyInit = {
  altKey: boolean;
  code?: string;
  ctrlKey: boolean;
  key: string;
  metaKey: boolean;
  shiftKey: boolean;
  which?: number;
};

const NAMED_KEY_CODES: Partial<Record<string, number>> = {
  ArrowDown: 40,
  ArrowLeft: 37,
  ArrowRight: 39,
  ArrowUp: 38,
  Backspace: 8,
  Delete: 46,
  End: 35,
  Enter: 13,
  Escape: 27,
  Home: 36,
  PageDown: 34,
  PageUp: 33,
  Tab: 9,
};

const keyIdentity = (key: string) => {
  if (key.length === 1) {
    return { which: key.toUpperCase().charCodeAt(0) };
  }

  const which = NAMED_KEY_CODES[key];

  return which === undefined ? {} : { code: key, which };
};

export const parseSyntheticShortcut = (
  shortcut: string,
  platform: NodeJS.Platform
): SyntheticKeyInit | null => {
  const parts = shortcut.split('+');
  const key = parts.at(-1);

  if (!key) {
    return null;
  }

  const isMac = platform === 'darwin';
  const modifiers = new Set(parts.slice(0, -1));

  if (
    !modifiers.has('ControlOrMeta') &&
    !modifiers.has('Control') &&
    !modifiers.has('Meta') &&
    !modifiers.has('Alt') &&
    !modifiers.has('Shift')
  ) {
    return null;
  }

  if (
    shortcut === 'ControlOrMeta+C' ||
    shortcut === 'ControlOrMeta+X' ||
    shortcut === 'ControlOrMeta+V' ||
    shortcut === 'ControlOrMeta+A'
  ) {
    return null;
  }

  return {
    altKey: modifiers.has('Alt'),
    ctrlKey:
      modifiers.has('Control') || (!isMac && modifiers.has('ControlOrMeta')),
    key: key.length === 1 && !modifiers.has('Shift') ? key.toLowerCase() : key,
    metaKey: modifiers.has('Meta') || (isMac && modifiers.has('ControlOrMeta')),
    shiftKey: modifiers.has('Shift'),
    ...keyIdentity(key),
  };
};

export const parsePlainSyntheticKey = (
  shortcut: string
): SyntheticKeyInit | null => {
  if (shortcut.includes('+')) {
    return null;
  }

  return {
    altKey: false,
    ctrlKey: false,
    key: shortcut,
    metaKey: false,
    shiftKey: false,
    ...keyIdentity(shortcut),
  };
};

export const dispatchSyntheticKey = async (
  root: Locator,
  eventInit: SyntheticKeyInit
) => {
  await root.evaluate(
    (element: HTMLElement, innerEventInit: SyntheticKeyInit) => {
      const createKeyEvent = (type: 'keydown' | 'keyup') =>
        new KeyboardEvent(type, {
          altKey: innerEventInit.altKey,
          bubbles: true,
          cancelable: true,
          code: innerEventInit.code,
          ctrlKey: innerEventInit.ctrlKey,
          key: innerEventInit.key,
          metaKey: innerEventInit.metaKey,
          shiftKey: innerEventInit.shiftKey,
        });
      const defineKeyCode = (event: KeyboardEvent) => {
        if (innerEventInit.which == null) {
          return event;
        }

        Object.defineProperty(event, 'keyCode', {
          value: innerEventInit.which,
        });
        Object.defineProperty(event, 'which', {
          value: innerEventInit.which,
        });

        return event;
      };

      element.dispatchEvent(defineKeyCode(createKeyEvent('keydown')));
      element.dispatchEvent(defineKeyCode(createKeyEvent('keyup')));
    },
    eventInit
  );
  await root.page().waitForTimeout(0);
};
