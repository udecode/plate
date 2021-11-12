import { getBlockAbove, queryNode } from '@udecode/plate-common';
import { getPlugin, KeyboardHandler } from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import { KEY_SOFT_BREAK } from './defaults';
import { SoftBreakPlugin } from './types';

export const getSoftBreakOnKeyDown = (): KeyboardHandler => (editor) => (
  event
) => {
  const entry = getBlockAbove(editor);
  if (!entry) return;

  const { rules } = getPlugin<SoftBreakPlugin>(editor, KEY_SOFT_BREAK);

  rules.forEach(({ hotkey, query }) => {
    if (isHotkey(hotkey, event as any) && queryNode(entry, query)) {
      event.preventDefault();

      editor.insertText('\n');
    }
  });
};
