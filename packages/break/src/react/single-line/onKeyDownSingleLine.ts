import type { KeyboardHandler } from '@udecode/plate/react';

import { Hotkeys } from '@udecode/plate';

export const onKeyDownSingleLine: KeyboardHandler = ({ event }) => {
  if (event.defaultPrevented) return;
  if (Hotkeys.isSplitBlock(event)) {
    event.preventDefault();
  }
};
