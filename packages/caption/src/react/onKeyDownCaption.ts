import type { KeyboardHandler } from '@udecode/plate-common/react';

import { getBlockAbove, getPluginTypes, isHotkey } from '@udecode/plate-common';

import type { CaptionConfig } from '../lib/CaptionPlugin';

import { CaptionPlugin } from './CaptionPlugin';

export const onKeyDownCaption: KeyboardHandler<CaptionConfig> = ({
  editor,
  event,
  getOptions,
}) => {
  if (event.defaultPrevented) return;
  // focus caption from image
  if (isHotkey('down', event)) {
    const types = getPluginTypes(editor, getOptions().plugins!);

    const entry = getBlockAbove(editor, {
      match: { type: types },
    });

    if (!entry) return;

    editor.setOption(CaptionPlugin, 'focusEndPath', entry[1]);
  }
};
