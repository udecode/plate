import type { KeyboardHandler } from '@udecode/plate-common/react';

import { Hotkeys } from '@udecode/plate-common';

export const onKeyDownSingleLine: KeyboardHandler = ({ event }) => {
  if (event.defaultPrevented) return;
  if (Hotkeys.isSplitBlock(event)) {
    event.preventDefault();
  }
};
