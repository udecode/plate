import type { DependencyList } from 'react';

import type {
  HotkeyCallback,
  HotkeysEvent,
  HotkeysOptions,
  HotkeysTrigger,
  Keys,
} from '../../lib/types/Hotkeys';

export type FormTags =
  | 'INPUT'
  | 'input'
  | 'SELECT'
  | 'select'
  | 'TEXTAREA'
  | 'textarea';

export type Hotkey = HotkeysEvent;

export type KeyboardModifiers = {
  alt?: boolean;
  ctrl?: boolean;
  meta?: boolean;
  mod?: boolean;
  shift?: boolean;
  // Custom modifier to listen to the produced key instead of the code
  useKey?: boolean;
};

export type Options = HotkeysOptions;

export type OptionsOrDependencyArray = DependencyList | Options;

export type RefType<T> = T | null;

export type Scopes = readonly string[] | string;

export type Trigger = HotkeysTrigger;

export type { HotkeyCallback, HotkeysEvent, Keys };
