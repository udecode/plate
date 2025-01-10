import type { KeyboardHandler } from '@udecode/plate/react';

import { getPluginTypes, isHotkey } from '@udecode/plate';

import type { CaptionConfig } from '../lib/BaseCaptionPlugin';

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

    const entry = editor.api.block({
      match: { type: types },
    });

    if (!entry) return;

    editor.setOption(CaptionPlugin, 'focusEndPath', entry[1]);
  }
};
