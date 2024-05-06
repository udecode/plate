import {
  Hotkeys,
  type KeyboardHandlerReturnType,
} from '@udecode/plate-common/server';

export const onKeyDownSingleLine = (): KeyboardHandlerReturnType => (event) => {
  if (event.defaultPrevented) return;
  if (Hotkeys.isSplitBlock(event)) {
    event.preventDefault();
  }
};
