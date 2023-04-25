import { Hotkeys, KeyboardHandlerReturnType } from '@udecode/plate-common';

export const onKeyDownSingleLine = (): KeyboardHandlerReturnType => (event) => {
  if (event.defaultPrevented) return;

  if (Hotkeys.isSplitBlock(event)) {
    event.preventDefault();
  }
};
