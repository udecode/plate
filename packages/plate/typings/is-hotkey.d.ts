import { KeyboardEvent } from 'react';

declare module 'is-hotkey' {
  function isHotkey(
    hotkey: string | ReadonlyArray<string>,
    event?: KeyboardEvent
  ): boolean;
}
