import type { KeyboardHandler } from '@udecode/plate-core/react';

import { Hotkeys } from '@udecode/plate-core';

export const onKeyDownSingleLine: KeyboardHandler = ({ event }) => {
  if (event.defaultPrevented) return;
  if (Hotkeys.isSplitBlock(event)) {
    event.preventDefault();
  }
};
