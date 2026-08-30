export type HotkeysEvent = {
  keys?: readonly string[];
  description?: string;
  scopes?: readonly string[] | string;
  alt?: boolean;
  ctrl?: boolean;
  meta?: boolean;
  mod?: boolean;
  shift?: boolean;
  useKey?: boolean;
};

export type HotkeyCallback = (
  keyboardEvent: KeyboardEvent,
  hotkeysEvent: HotkeysEvent
) => void;

export type Keys =
  | ReadonlyArray<readonly string[]>
  | readonly string[]
  | string;

export type HotkeysTrigger =
  | ((keyboardEvent: KeyboardEvent, hotkeysEvent: HotkeysEvent) => boolean)
  | boolean;

export type HotkeysOptions = {
  delimiter?: string;
  description?: string;
  document?: Document;
  enabled?: HotkeysTrigger;
  enableOnContentEditable?: boolean;
  enableOnFormTags?:
    | ReadonlyArray<
        'INPUT' | 'SELECT' | 'TEXTAREA' | 'input' | 'select' | 'textarea'
      >
    | boolean;
  ignoreEventWhenPrevented?: boolean;
  ignoreModifiers?: boolean;
  keydown?: boolean;
  keyup?: boolean;
  preventDefault?: HotkeysTrigger;
  scopes?: readonly string[] | string;
  splitKey?: string;
  useKey?: boolean;
  ignoreEventWhen?: (event: KeyboardEvent) => boolean;
};
