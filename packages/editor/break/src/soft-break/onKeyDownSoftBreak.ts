import {
  getBlockAbove,
  KeyboardHandler,
  queryNode,
  Value,
} from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import { SoftBreakPlugin } from './types';

export const onKeyDownSoftBreak: KeyboardHandler<Value, {}, SoftBreakPlugin> = (
  editor,
  { options: { rules = [] } }
) => (event) => {
  const entry = getBlockAbove(editor);
  if (!entry) return;

  rules.forEach(({ hotkey, query }) => {
    if (isHotkey(hotkey, event as any) && queryNode(entry, query)) {
      event.preventDefault();
      event.stopPropagation();

      editor.insertText('\n');
    }
  });
};
