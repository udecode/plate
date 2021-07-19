import { getBlockAbove, queryNode } from '@udecode/plate-common';
import { KeyboardHandler } from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import { SoftBreakOnKeyDownOptions } from './types';

export const getSoftBreakOnKeyDown = ({
  rules = [{ hotkey: 'shift+enter' }],
}: SoftBreakOnKeyDownOptions = {}): KeyboardHandler => (editor) => (event) => {
  const entry = getBlockAbove(editor);
  if (!entry) return;

  rules.forEach(({ hotkey, query }) => {
    if (isHotkey(hotkey, event as any) && queryNode(entry, query)) {
      event.preventDefault();

      editor.insertText('\n');
    }
  });
};
