import { failInvariant } from '../../internal/fail-invariant';
import { usesAppleDOMHotkeys } from './environment';

export type HotkeyPlatform = 'apple' | 'other' | 'windows';

export type HotkeyMatchOptions = {
  ignoreModifiers?: boolean;
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
const SINGLE_DIGIT_RE = /^\d$/;

const isApplePlatform = (platform: HotkeyPlatform | undefined) =>
  platform === 'apple';

const resolveModifier = (
  value: string,
  options?: HotkeyMatchOptions
): ModifierKey | undefined => {
  const modifier = MODIFIER_TOKEN_NAMES[value];

  if (!modifier) return undefined;
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
      compiled.key =
        requiredModifierKeys[0] ??
        failInvariant('Expected value to be defined');
      return compiled;
    }

    throw new TypeError(`Hotkey is missing a key: "${hotkey}"`);
  }

  return compiled;
};

const compileHotkeys = (hotkey: HotkeySpec, options?: HotkeyMatchOptions) =>
  (Array.isArray(hotkey) ? hotkey : [hotkey]).map((value) =>
    compileHotkey(value, options)
  );

const ARIA_MODIFIER_ORDER: readonly ModifierKey[] = [
  'ctrlKey',
  'altKey',
  'shiftKey',
  'metaKey',
];

const ARIA_NAMED_KEYS = new Map(
  Object.values(KEY_TOKEN_NAMES)
    .filter((name) => name.length > 1 && name !== 'CapsLock')
    .map((name) => [name.toLowerCase(), name])
);

const ARIA_CODE_KEYS: Record<string, string> = {
  backquote: '`',
  backslash: '\\',
  bracketleft: '[',
  bracketright: ']',
  comma: ',',
  equal: '=',
  minus: '-',
  period: '.',
  quote: "'",
  semicolon: ';',
  slash: '/',
};

const ARIA_LETTER_OR_DIGIT_CODE_RE = /^(?:key([a-z])|digit(\d))$/;
const ARIA_FUNCTION_KEY_RE = /^f(?:[1-9]|1\d|2[0-4])$/;

const expandOptionalModifiers = (compiled: CompiledHotkey) => {
  let combos = [compiled];

  for (const modifier of ARIA_MODIFIER_ORDER) {
    combos = combos.flatMap((combo) =>
      combo[modifier] === 'any'
        ? [
            { ...combo, [modifier]: false },
            { ...combo, [modifier]: true },
          ]
        : [combo]
    );
  }

  return combos;
};

const ariaKeyName = (key: string, optionOnApple: boolean) => {
  if (SINGLE_LETTER_RE.test(key)) {
    return optionOnApple ? undefined : key.toUpperCase();
  }
  if (key === ' ') {
    return optionOnApple ? undefined : 'Space';
  }

  const lower = key.toLowerCase();
  const code = ARIA_LETTER_OR_DIGIT_CODE_RE.exec(lower);

  if (code) {
    return (code[1] ?? code[2])?.toUpperCase();
  }
  if (ARIA_FUNCTION_KEY_RE.test(lower)) {
    return lower.toUpperCase();
  }

  return ARIA_NAMED_KEYS.get(lower) ?? ARIA_CODE_KEYS[lower];
};

/**
 * Names the combos of a hotkey the way the `aria-keyshortcuts` attribute does,
 * such as `Control+Shift+X`, joined by spaces. Each name is a combo the hotkey
 * matcher matches on a US layout for `platform`. A combo whose key is a literal
 * digit or punctuation character, or a letter or Space with Option on Apple,
 * gets no name. To name a letter, digit or punctuation key, write its code,
 * such as `digit1` or `keyi`.
 * Returns `undefined` when no combo has a name, and throws the matcher's
 * `TypeError` for a hotkey it rejects.
 */
export const ariaKeyShortcuts = (
  hotkey: HotkeySpec,
  options: { platform: HotkeyPlatform }
): string | undefined => {
  const apple = isApplePlatform(options.platform);
  const names = new Set<string>();

  for (const combo of compileHotkeys(hotkey, options).flatMap(
    expandOptionalModifiers
  )) {
    const key = ariaKeyName(combo.key, apple && combo.altKey === true);

    if (key) {
      names.add(
        [
          ...ARIA_MODIFIER_ORDER.filter(
            (modifier) => combo[modifier] === true
          ).map((modifier) => MODIFIER_KEYS[modifier]),
          key,
        ].join('+')
      );
    }
  }

  return names.size > 0 ? [...names].join(' ') : undefined;
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
  const expectedLower = expectedKey.toLowerCase();

  if (
    typeof actualKey === 'string' &&
    actualKey.toLowerCase() === expectedLower
  ) {
    return true;
  }

  if (event.code?.toLowerCase() === expectedLower) return true;
  if (!isSingleLetter(expectedKey)) return false;
  if (typeof actualKey === 'string' && isAscii(actualKey)) return false;

  return event.code === `Key${expectedKey.toUpperCase()}`;
};

// With Command held nothing is typed, yet Option still turns the digit into a
// symbol, such as '¡', or '[' on some layouts.
const matchCommandOptionDigit = (
  event: KeyboardEventLike,
  expectedKey: string
) =>
  Boolean(event.altKey && event.metaKey) &&
  SINGLE_DIGIT_RE.test(expectedKey) &&
  !SINGLE_DIGIT_RE.test(event.key) &&
  event.code === `Digit${expectedKey}`;

const isAltGraphEvent = (event: KeyboardEventLike) =>
  typeof event.getModifierState === 'function' &&
  event.getModifierState('AltGraph');

const matchHotkey = (
  compiled: CompiledHotkey,
  event: KeyboardEventLike,
  ignoreModifiers: boolean
) => {
  if (ignoreModifiers) {
    return matchKey(event, compiled.key);
  }

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
    (matchKey(event, compiled.key) ||
      matchCommandOptionDigit(event, compiled.key))
  );
};

/** Compiles one or more hotkey specs into a reusable event predicate. */
export const createCompiledHotkeyMatcher = (
  hotkey: HotkeySpec,
  options?: HotkeyMatchOptions
): HotkeyMatcher => {
  const compiled = compileHotkeys(hotkey, options);

  return (event: KeyboardEventLike) =>
    compiled.some((entry) =>
      matchHotkey(entry, event, options?.ignoreModifiers ?? false)
    );
};

const MATCHER_CACHE = new Map<string, HotkeyMatcher>();

const getCachedHotkeyMatcher = (
  hotkey: HotkeySpec,
  options?: HotkeyMatchOptions
) => {
  const cacheKey = `${options?.platform ?? 'default'}:${JSON.stringify(
    hotkey
  )}`;
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

  const matcher = getCachedHotkeyMatcher(
    hotkey,
    options ?? {
      platform: usesAppleDOMHotkeys(targetEvent) ? 'apple' : 'other',
    }
  );

  return matcher(targetEvent);
}
