import { usesAppleDOMHotkeys } from './environment';
import { createCompiledHotkeyMatcher } from './hotkey-match';

export type {
  HotkeyMatchOptions,
  HotkeyPlatform,
  HotkeySpec,
  KeyboardEventLike,
} from './hotkey-match';

/**
 * Hotkey mappings for each platform.
 */

const HOTKEYS = {
  compose: ['down', 'left', 'right', 'up', 'backspace', 'enter'],
  moveBackward: 'left',
  moveForward: 'right',
  moveWordBackward: 'ctrl+left',
  moveWordForward: 'ctrl+right',
  deleteBackward: 'shift?+backspace',
  deleteForward: 'shift?+delete',
  extendBackward: 'shift+left',
  extendForward: 'shift+right',
  extendWordBackward: 'ctrl+shift+left',
  extendWordForward: 'ctrl+shift+right',
  moveLineBackward: 'home',
  moveLineForward: 'end',
  insertSoftBreak: 'shift+enter',
  splitBlock: 'enter',
  undo: 'mod+z',
};

const APPLE_HOTKEYS = {
  moveLineBackward: ['opt+up', 'ctrl+a'],
  moveLineForward: ['opt+down', 'ctrl+e'],
  moveWordBackward: 'opt+left',
  moveWordForward: 'opt+right',
  deleteBackward: ['ctrl+backspace', 'ctrl+h'],
  deleteForward: ['ctrl+delete', 'ctrl+d'],
  deleteLineBackward: 'cmd+shift?+backspace',
  deleteLineForward: ['cmd+shift?+delete', 'ctrl+k'],
  deleteWordBackward: 'opt+shift?+backspace',
  deleteWordForward: 'opt+shift?+delete',
  extendLineBackward: 'opt+shift+up',
  extendLineForward: 'opt+shift+down',
  extendWordBackward: 'opt+shift+left',
  extendWordForward: 'opt+shift+right',
  openLine: 'ctrl+o',
  redo: 'cmd+shift+z',
  transposeCharacter: 'ctrl+t',
};

const WINDOWS_HOTKEYS = {
  deleteWordBackward: 'ctrl+shift?+backspace',
  deleteWordForward: 'ctrl+shift?+delete',
  redo: ['ctrl+y', 'ctrl+shift+z'],
};

/**
 * Create a platform-aware hotkey checker.
 */

const create = (key: string) => {
  const generic = HOTKEYS[<keyof typeof HOTKEYS>key];
  const apple = APPLE_HOTKEYS[<keyof typeof APPLE_HOTKEYS>key];
  const windows = WINDOWS_HOTKEYS[<keyof typeof WINDOWS_HOTKEYS>key];
  const isGenericApple = generic
    ? createCompiledHotkeyMatcher(generic, { platform: 'apple' })
    : undefined;
  const isGenericOther = generic
    ? createCompiledHotkeyMatcher(generic, { platform: 'other' })
    : undefined;
  const isApple = apple ? createCompiledHotkeyMatcher(apple) : undefined;
  const isWindows = windows ? createCompiledHotkeyMatcher(windows) : undefined;

  return (event: KeyboardEvent) => {
    const appleHost = usesAppleDOMHotkeys(event);

    if ((appleHost ? isGenericApple : isGenericOther)?.(event)) return true;
    if (appleHost && isApple?.(event)) return true;
    if (!appleHost && isWindows && isWindows(event)) return true;
    return false;
  };
};

/**
 * Hotkeys.
 */

export { isHotkey } from './hotkey-match';

/** Platform-aware hotkey predicates used by Plite DOM editing behavior. */
export const Hotkeys = {
  isCompose: create('compose'),
  isMoveBackward: create('moveBackward'),
  isMoveForward: create('moveForward'),
  isDeleteBackward: create('deleteBackward'),
  isDeleteForward: create('deleteForward'),
  isDeleteLineBackward: create('deleteLineBackward'),
  isDeleteLineForward: create('deleteLineForward'),
  isDeleteWordBackward: create('deleteWordBackward'),
  isDeleteWordForward: create('deleteWordForward'),
  isExtendBackward: create('extendBackward'),
  isExtendForward: create('extendForward'),
  isExtendLineBackward: create('extendLineBackward'),
  isExtendLineForward: create('extendLineForward'),
  isExtendWordBackward: create('extendWordBackward'),
  isExtendWordForward: create('extendWordForward'),
  isMoveLineBackward: create('moveLineBackward'),
  isMoveLineForward: create('moveLineForward'),
  isMoveWordBackward: create('moveWordBackward'),
  isMoveWordForward: create('moveWordForward'),
  isOpenLine: create('openLine'),
  isRedo: create('redo'),
  isSoftBreak: create('insertSoftBreak'),
  isSplitBlock: create('splitBlock'),
  isTransposeCharacter: create('transposeCharacter'),
  isUndo: create('undo'),
};
