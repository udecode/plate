import { Hotkeys, KeyboardHandlerReturnType } from '@udecode/plate-core';

export const onKeyDownSingleLine = (): KeyboardHandlerReturnType => (event) => {
  if (Hotkeys.isSplitBlock(event)) {
    event.preventDefault();
  }
};
