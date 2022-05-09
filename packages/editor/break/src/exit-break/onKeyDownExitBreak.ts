import {
  getBlockAbove,
  KeyboardHandler,
  queryNode,
  Value,
} from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import { exitBreak } from './transforms/exitBreak';
import { ExitBreakPlugin } from './types';

export const onKeyDownExitBreak: KeyboardHandler<Value, {}, ExitBreakPlugin> = (
  editor,
  { options: { rules = [] } }
) => (event) => {
  const entry = getBlockAbove(editor);
  if (!entry) return;

  rules.forEach(({ hotkey, ...rule }) => {
    if (isHotkey(hotkey, event as any) && queryNode(entry, rule.query)) {
      if (exitBreak(editor, rule)) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  });
};
