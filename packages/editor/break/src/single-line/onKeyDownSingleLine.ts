import { Hotkeys, KeyboardHandlerReturnType } from '@udecode/plate-common';

export const onKeyDownSingleLine = (): KeyboardHandlerReturnType => (event) => {
  if (Hotkeys.isSplitBlock(event)) {
    event.preventDefault();
  }
};
