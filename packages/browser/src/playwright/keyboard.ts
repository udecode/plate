import type { Locator } from '@playwright/test';

type SyntheticKeyInit = {
  altKey: boolean;
  ctrlKey: boolean;
  key: string;
  metaKey: boolean;
  shiftKey: boolean;
  which?: number;
};

export const parseSyntheticShortcut = (
  shortcut: string
): SyntheticKeyInit | null => {
  const parts = shortcut.split('+');
  const key = parts.at(-1);

  if (!key) {
    return null;
  }

  const isMac = process.platform === 'darwin';
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
    which: key.length === 1 ? key.toUpperCase().charCodeAt(0) : undefined,
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
    which:
      shortcut.length === 1 ? shortcut.toUpperCase().charCodeAt(0) : undefined,
  };
};

export const dispatchSyntheticKey = async (
  root: Locator,
  eventInit: SyntheticKeyInit
) => {
  await root.evaluate((element: HTMLElement, eventInit: SyntheticKeyInit) => {
    const createKeyEvent = (type: 'keydown' | 'keyup') =>
      new KeyboardEvent(type, {
        altKey: eventInit.altKey,
        bubbles: true,
        cancelable: true,
        ctrlKey: eventInit.ctrlKey,
        key: eventInit.key,
        metaKey: eventInit.metaKey,
        shiftKey: eventInit.shiftKey,
      });
    const defineKeyCode = (event: KeyboardEvent) => {
      if (eventInit.which == null) {
        return event;
      }

      Object.defineProperty(event, 'keyCode', {
        value: eventInit.which,
      });
      Object.defineProperty(event, 'which', {
        value: eventInit.which,
      });

      return event;
    };

    element.dispatchEvent(defineKeyCode(createKeyEvent('keydown')));
    element.dispatchEvent(defineKeyCode(createKeyEvent('keyup')));
  }, eventInit);
  await root.page().waitForTimeout(0);
};
