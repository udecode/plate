import { getBlockAbove, queryNode } from '@udecode/plate-common';
import { KeyboardHandler } from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import { SoftBreakPlugin } from './types';

export const getSoftBreakOnKeyDown = (): KeyboardHandler<
  {},
  SoftBreakPlugin
> => (editor, { options: { rules } }) => (event) => {
  const entry = getBlockAbove(editor);
  if (!entry) return;

  rules!.forEach(({ hotkey, query }) => {
    if (isHotkey(hotkey, event as any) && queryNode(entry, query)) {
      event.preventDefault();

      editor.insertText('\n');
    }
  });
};
