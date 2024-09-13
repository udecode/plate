import type { Hotkey, KeyboardModifiers } from './types';

const reservedModifierKeywords = new Set([
  'alt',
  'control',
  'ctrl',
  'meta',
  'mod',
  'shift',
]);

const mappedKeys: Record<string, string> = {
  AltLeft: 'alt',
  AltRight: 'alt',
  ControlLeft: 'ctrl',
  ControlRight: 'ctrl',
  MetaLeft: 'meta',
  MetaRight: 'meta',
  OSLeft: 'meta',
  OSRight: 'meta',
  ShiftLeft: 'shift',
  ShiftRight: 'shift',
  down: 'arrowdown',
  esc: 'escape',
  left: 'arrowleft',
  return: 'enter',
  right: 'arrowright',
  up: 'arrowup',
};

export function mapKey(key: string): string {
  return (mappedKeys[key.trim()] || key.trim())
    .toLowerCase()
    .replace(/key|digit|numpad/, '');
}

export function isHotkeyModifier(key: string) {
  return reservedModifierKeywords.has(key);
}

export function parseKeysHookInput(keys: string, delimiter = ','): string[] {
  return keys.toLowerCase().split(delimiter);
}

export function parseHotkey(
  hotkey: string,
  splitKey = '+',
  useKey = false,
  description?: string
): Hotkey {
  const keys = hotkey
    .toLocaleLowerCase()
    .split(splitKey)
    .map((k) => mapKey(k));

  const modifiers: KeyboardModifiers = {
    alt: keys.includes('alt'),
    ctrl: keys.includes('ctrl') || keys.includes('control'),
    meta: keys.includes('meta'),
    mod: keys.includes('mod'),
    shift: keys.includes('shift'),
    useKey,
  };

  const singleCharKeys = keys.filter((k) => !reservedModifierKeywords.has(k));

  return {
    ...modifiers,
    keys: singleCharKeys,
    description,
  };
}
