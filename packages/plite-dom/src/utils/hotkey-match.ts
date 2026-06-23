import { IS_APPLE } from './environment';

export type HotkeyPlatform = 'apple' | 'other' | 'windows';

export type HotkeyMatchOptions = {
  platform?: HotkeyPlatform;
};

export type HotkeySpec = readonly string[] | string;

export type KeyboardEventLike = {
  altKey?: boolean;
  code?: string;
  ctrlKey?: boolean;
  getModifierState?: (key: 'AltGraph') => boolean;
  key: string;
  metaKey?: boolean;
  shiftKey?: boolean;
};

type HotkeyMatcher = (event: KeyboardEventLike) => boolean;

type ModifierKey = 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey';

type ModifierExpectation = boolean | 'any';

type CompiledHotkey = {
  altKey: ModifierExpectation;
  ctrlKey: ModifierExpectation;
  key: string;
  metaKey: ModifierExpectation;
  shiftKey: ModifierExpectation;
};

const MODIFIER_KEYS: Record<ModifierKey, string> = {
  altKey: 'Alt',
  ctrlKey: 'Control',
  metaKey: 'Meta',
  shiftKey: 'Shift',
};

const KEY_TOKEN_NAMES: Record<string, string> = {
  add: '+',
  backspace: 'Backspace',
  break: 'Pause',
  capslock: 'CapsLock',
  del: 'Delete',
  delete: 'Delete',
  down: 'ArrowDown',
  end: 'End',
  enter: 'Enter',
  esc: 'Escape',
  escape: 'Escape',
  home: 'Home',
  ins: 'Insert',
  insert: 'Insert',
  left: 'ArrowLeft',
  pagedown: 'PageDown',
  pageup: 'PageUp',
  pause: 'Pause',
  return: 'Enter',
  right: 'ArrowRight',
  space: ' ',
  spacebar: ' ',
  tab: 'Tab',
  up: 'ArrowUp',
};

const MODIFIER_TOKEN_NAMES: Record<string, ModifierKey | 'mod'> = {
  alt: 'altKey',
  cmd: 'metaKey',
  command: 'metaKey',
  control: 'ctrlKey',
  ctrl: 'ctrlKey',
  ctl: 'ctrlKey',
  meta: 'metaKey',
  mod: 'mod',
  opt: 'altKey',
  option: 'altKey',
  shift: 'shiftKey',
  win: 'metaKey',
  windows: 'metaKey',
};

const SINGLE_LETTER_RE = /^[a-z]$/i;

const isApplePlatform = (platform: HotkeyPlatform | undefined) =>
  platform ? platform === 'apple' : IS_APPLE;

const resolveModifier = (
  value: string,
  options?: HotkeyMatchOptions
): ModifierKey | undefined => {
  const modifier = MODIFIER_TOKEN_NAMES[value];

  if (!modifier) return;
  if (modifier === 'mod') {
    return isApplePlatform(options?.platform) ? 'metaKey' : 'ctrlKey';
  }

  return modifier;
};

const normalizeKey = (value: string) => {
  const lower = value.toLowerCase();

  return KEY_TOKEN_NAMES[lower] ?? value;
};

const compileHotkey = (
  hotkey: string,
  options?: HotkeyMatchOptions
): CompiledHotkey => {
  const parts = hotkey.replaceAll('++', '+add').split('+');
  const requiredModifierKeys: string[] = [];
  const compiled: CompiledHotkey = {
    altKey: false,
    ctrlKey: false,
    key: '',
    metaKey: false,
    shiftKey: false,
  };

  for (const rawPart of parts) {
    const optional = rawPart.endsWith('?') && rawPart.length > 1;
    const part = optional ? rawPart.slice(0, -1) : rawPart;
    const lower = part.toLowerCase();
    const modifier = resolveModifier(lower, options);

    if (modifier) {
      compiled[modifier] = optional ? 'any' : true;
      if (!optional) {
        requiredModifierKeys.push(MODIFIER_KEYS[modifier]);
      }
      continue;
    }

    if (optional) {
      throw new TypeError(
        `Optional hotkey keys are not supported: "${rawPart}"`
      );
    }

    if (parts.length > 1 && rawPart !== parts.at(-1)) {
      throw new TypeError(`Unknown modifier: "${part}"`);
    }

    if (compiled.key) {
      throw new TypeError(`Hotkey contains more than one key: "${hotkey}"`);
    }

    compiled.key = normalizeKey(part);
  }

  if (!compiled.key) {
    if (requiredModifierKeys.length === 1 && parts.length === 1) {
      compiled.key = requiredModifierKeys[0]!;
      return compiled;
    }

    throw new TypeError(`Hotkey is missing a key: "${hotkey}"`);
  }

  return compiled;
};

const matchModifier = (
  event: KeyboardEventLike,
  key: ModifierKey,
  expected: ModifierExpectation
) => expected === 'any' || Boolean(event[key]) === expected;

const isAscii = (value: string) =>
  value.length === 1 && value.charCodeAt(0) <= 127;

const isSingleLetter = (value: string) => SINGLE_LETTER_RE.test(value);

const matchKey = (event: KeyboardEventLike, expectedKey: string) => {
  const actualKey = event.key;

  if (
    typeof actualKey === 'string' &&
    actualKey.toLowerCase() === expectedKey.toLowerCase()
  ) {
    return true;
  }

  if (!isSingleLetter(expectedKey)) return false;
  if (typeof actualKey === 'string' && isAscii(actualKey)) return false;

  return event.code === `Key${expectedKey.toUpperCase()}`;
};

const isAltGraphEvent = (event: KeyboardEventLike) =>
  typeof event.getModifierState === 'function' &&
  event.getModifierState('AltGraph');

const matchHotkey = (compiled: CompiledHotkey, event: KeyboardEventLike) => {
  if (
    compiled.altKey === true &&
    compiled.ctrlKey === true &&
    isAltGraphEvent(event)
  ) {
    return false;
  }

  return (
    matchModifier(event, 'altKey', compiled.altKey) &&
    matchModifier(event, 'ctrlKey', compiled.ctrlKey) &&
    matchModifier(event, 'metaKey', compiled.metaKey) &&
    matchModifier(event, 'shiftKey', compiled.shiftKey) &&
    matchKey(event, compiled.key)
  );
};

export const createCompiledHotkeyMatcher = (
  hotkey: HotkeySpec,
  options?: HotkeyMatchOptions
): HotkeyMatcher => {
  const compiled = (Array.isArray(hotkey) ? hotkey : [hotkey]).map((value) =>
    compileHotkey(value, options)
  );

  return (event: KeyboardEventLike) =>
    compiled.some((entry) => matchHotkey(entry, event));
};

const MATCHER_CACHE = new Map<string, HotkeyMatcher>();

const getCachedHotkeyMatcher = (
  hotkey: HotkeySpec,
  options?: HotkeyMatchOptions
) => {
  const cacheKey = `${options?.platform ?? 'default'}:${JSON.stringify(hotkey)}`;
  let matcher = MATCHER_CACHE.get(cacheKey);

  if (!matcher) {
    matcher = createCompiledHotkeyMatcher(hotkey, options);
    MATCHER_CACHE.set(cacheKey, matcher);
  }

  return matcher;
};

const isKeyboardEventLike = (value: unknown): value is KeyboardEventLike =>
  typeof value === 'object' && value !== null && 'key' in value;

export function isHotkey(hotkey: HotkeySpec, event: KeyboardEventLike): boolean;
export function isHotkey(
  hotkey: HotkeySpec,
  options: HotkeyMatchOptions,
  event: KeyboardEventLike
): boolean;
export function isHotkey(
  hotkey: HotkeySpec,
  optionsOrEvent?: HotkeyMatchOptions | KeyboardEventLike,
  event?: KeyboardEventLike
): boolean {
  const targetEvent = isKeyboardEventLike(optionsOrEvent)
    ? optionsOrEvent
    : event;
  const options = isKeyboardEventLike(optionsOrEvent)
    ? undefined
    : optionsOrEvent;

  if (!targetEvent) {
    throw new TypeError('isHotkey requires a keyboard event');
  }

  const matcher = getCachedHotkeyMatcher(hotkey, options);

  return matcher(targetEvent);
}
