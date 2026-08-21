import {
  createCompiledHotkeyMatcher,
  usesAppleDOMHotkeys,
} from '@platejs/plite-dom/internal';
import type { HotkeysEvent } from '@udecode/react-hotkeys';

import type { EditorShortcut } from '../../lib';

export type CompiledPlateShortcut = Readonly<{
  declarationIndex: number;
  id: string;
  keydown: boolean;
  keyup: boolean;
  match: (event: KeyboardEvent) => HotkeysEvent | null;
  pluginIndex: number;
  priority: number;
  shortcut: EditorShortcut;
}>;

type PlateShortcutCompilerInput = Readonly<{
  declarationIndex: number;
  id: string;
  pluginIndex: number;
  shortcut: EditorShortcut;
}>;

const MODIFIER_KEYS = new Set([
  'alt',
  'cmd',
  'command',
  'control',
  'ctrl',
  'ctl',
  'meta',
  'mod',
  'opt',
  'option',
  'shift',
  'win',
  'windows',
]);
const OPTIONAL_MODIFIER_SUFFIX_RE = /\?$/;

const normalizeShortcutKeys = (
  keys: NonNullable<EditorShortcut['keys']>,
  delimiter = ',',
  splitKey = '+'
) => {
  const normalize = (value: string) =>
    (splitKey === '+' ? value : value.split(splitKey).join('+')).trim();

  if (typeof keys === 'string') {
    return keys.split(delimiter).map(normalize).filter(Boolean);
  }
  if (keys.every((key) => Array.isArray(key))) {
    return keys
      .map((combination) => normalize(combination.join('+')))
      .filter(Boolean);
  }

  return (keys as readonly string[])
    .flatMap((value) => value.split(delimiter))
    .map(normalize)
    .filter(Boolean);
};

const createHotkeysEvent = (
  spec: string,
  shortcut: EditorShortcut
): HotkeysEvent => {
  const tokens = spec.toLowerCase().split('+');
  const tokenSet = new Set(
    tokens.map((token) => token.replace(OPTIONAL_MODIFIER_SUFFIX_RE, ''))
  );
  const has = (...values: string[]) =>
    values.some((value) => tokenSet.has(value));

  return Object.freeze({
    alt: has('alt', 'opt', 'option'),
    ctrl: has('control', 'ctrl', 'ctl'),
    description: shortcut.description,
    keys: Object.freeze(
      tokens
        .map((token) => token.replace(OPTIONAL_MODIFIER_SUFFIX_RE, ''))
        .filter((token) => !MODIFIER_KEYS.has(token))
    ),
    meta: has('cmd', 'command', 'meta', 'win', 'windows'),
    mod: has('mod'),
    scopes: shortcut.scopes,
    shift: has('shift'),
    useKey: shortcut.useKey,
  });
};

const compileShortcutMatch = (shortcut: EditorShortcut) => {
  const specs = normalizeShortcutKeys(
    shortcut.keys!,
    shortcut.delimiter,
    shortcut.splitKey
  ).map((spec) => {
    const eventDetails = createHotkeysEvent(spec, shortcut);

    if (spec === '*') {
      return {
        eventDetails,
        matchApple: () => true,
        matchOther: () => true,
      };
    }

    return {
      eventDetails,
      matchApple: createCompiledHotkeyMatcher(spec, {
        ignoreModifiers: shortcut.ignoreModifiers,
        platform: 'apple',
      }),
      matchOther: createCompiledHotkeyMatcher(spec, {
        ignoreModifiers: shortcut.ignoreModifiers,
        platform: 'other',
      }),
    };
  });

  return (event: KeyboardEvent): HotkeysEvent | null => {
    const apple = usesAppleDOMHotkeys(event);

    for (const spec of specs) {
      if ((apple ? spec.matchApple : spec.matchOther)(event)) {
        return spec.eventDetails;
      }
    }

    return null;
  };
};

export const compilePlateShortcuts = (
  shortcuts: readonly PlateShortcutCompilerInput[]
): readonly CompiledPlateShortcut[] =>
  Object.freeze(
    shortcuts
      .filter(({ shortcut }) => shortcut.keys && shortcut.handler)
      .map(({ declarationIndex, id, pluginIndex, shortcut }) => {
        const priority = shortcut.priority ?? 0;

        if (!Number.isFinite(priority)) {
          throw new TypeError(
            `Plate shortcut "${id}" priority must be a finite number.`
          );
        }

        return Object.freeze({
          declarationIndex,
          id,
          keydown:
            shortcut.keydown === undefined
              ? shortcut.keyup !== true
              : shortcut.keydown,
          keyup: shortcut.keyup === true,
          match: compileShortcutMatch(shortcut),
          pluginIndex,
          priority,
          shortcut,
        });
      })
      .sort(
        (left, right) =>
          right.priority - left.priority ||
          left.pluginIndex - right.pluginIndex ||
          left.declarationIndex - right.declarationIndex ||
          left.id.localeCompare(right.id)
      )
  );
