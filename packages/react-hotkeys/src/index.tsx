export { HotkeysProvider, useHotkeysContext } from './internal/HotkeysProvider';
export type {
  HotkeyCallback,
  HotkeysEvent,
  Keys,
  Options as HotkeysOptions,
} from './internal/types';
export { isHotkeyPressed } from './internal/isHotkeyPressed';
export { Key } from './internal/key';

export { default as useRecordHotkeys } from './internal/useRecordHotkeys';
export { default as useHotkeys } from './internal/useHotkeys';
