export type {
  HotkeyCallback,
  HotkeysEvent,
  Options as HotkeysOptions,
  Keys,
} from './internal/types';

export { HotkeysProvider, useHotkeysContext } from './internal/HotkeysProvider';

export { isHotkeyPressed } from './internal/isHotkeyPressed';

export { Key } from './internal/key';

export { default as useHotkeys } from './internal/useHotkeys';

export { default as useRecordHotkeys } from './internal/useRecordHotkeys';
