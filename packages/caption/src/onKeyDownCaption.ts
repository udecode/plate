import {
  type KeyboardHandler,
  getBlockAbove,
  getPluginTypes,
  isHotkey,
} from '@udecode/plate-common/server';

import type { CaptionPlugin } from './createCaptionPlugin';

import { captionGlobalStore } from './captionGlobalStore';

export const onKeyDownCaption: KeyboardHandler<CaptionPlugin> =
  (editor, { options }) =>
  (e) => {
    if (e.defaultPrevented) return;
    // focus caption from image
    if (isHotkey('down', e)) {
      const types = getPluginTypes(editor, options.pluginKeys!);

      const entry = getBlockAbove(editor, {
        match: { type: types },
      });

      if (!entry) return;

      captionGlobalStore.set.focusEndCaptionPath(entry[1]);
    }
  };
