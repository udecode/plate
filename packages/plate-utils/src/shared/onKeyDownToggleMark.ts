import type { KeyboardHandler } from '@udecode/plate-common';

import {
  type ToggleMarkPluginOptions,
  isHotkey,
} from '@udecode/plate-core/server';
import { toggleMark } from '@udecode/slate-utils';

export const onKeyDownToggleMark: KeyboardHandler<ToggleMarkPluginOptions> =
  (editor, { options: { clear, hotkey }, type }) =>
  (e) => {
    if (e.defaultPrevented) return;
    if (!hotkey) return;
    if (isHotkey(hotkey, e as any)) {
      e.preventDefault();

      toggleMark(editor, { clear, key: type as any });
    }
  };
