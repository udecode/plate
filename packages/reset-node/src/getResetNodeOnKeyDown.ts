import { isCollapsed, setNodes, someNode } from '@udecode/slate-plugins-common';
import { KeyboardHandler, TElement } from '@udecode/slate-plugins-core';
import isHotkey from 'is-hotkey';
import { ResetBlockTypePluginOptions } from './types';

export const SIMULATE_BACKSPACE: KeyboardEventInit = new KeyboardEvent('keydown', { keyCode: 8 }) as any;

export const getResetNodeOnKeyDown = ({
  rules,
}: ResetBlockTypePluginOptions): KeyboardHandler => (editor) => (event) => {
  let reset = false;

  if (editor.selection && isCollapsed(editor.selection)) {
    rules.forEach(({ types, defaultType, hotkey, predicate, onReset }) => {
      if (hotkey && isHotkey(hotkey, event as any)) {
        if (predicate(editor) && someNode(editor, { match: { type: types } })) {
          event.preventDefault();

          setNodes<TElement>(editor, { type: defaultType });

          onReset?.(editor);

          reset = true;
        }
      }
    });
  }

  return reset;
};
