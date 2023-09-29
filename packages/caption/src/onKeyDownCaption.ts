import {
  getBlockAbove,
  getPluginTypes,
  KeyboardHandler,
} from '@udecode/plate-common';
import { isHotkey } from 'is-hotkey';

import { captionGlobalStore } from './captionGlobalStore';
import { CaptionPlugin } from './createCaptionPlugin';

export const onKeyDownCaption: KeyboardHandler<CaptionPlugin> =
  (editor, { options }) =>
  (e) => {
    if (e.defaultPrevented) return;

    // focus caption from image
    if (isHotkey('down', e)) {
      const types = getPluginTypes(editor, options.pluginKeys);

      const entry = getBlockAbove(editor, {
        match: { type: types },
      });
      if (!entry) return;

      captionGlobalStore.set.focusEndCaptionPath(entry[1]);
    }
  };
