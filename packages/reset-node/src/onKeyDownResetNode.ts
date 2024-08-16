import type { KeyboardHandler } from '@udecode/plate-common';

import {
  isCollapsed,
  isHotkey,
  setElements,
  someNode,
} from '@udecode/plate-common';

import type { ResetNodeConfig } from './ResetNodePlugin';

export const SIMULATE_BACKSPACE: any = {
  key: '',
  which: 8,
};

export const onKeyDownResetNode: KeyboardHandler<ResetNodeConfig> = ({
  editor,
  event,
  options: { rules },
}) => {
  if (event.defaultPrevented) return;

  let reset;

  if (!editor.selection) return;
  if (isCollapsed(editor.selection)) {
    rules!.forEach(({ defaultType, hotkey, onReset, predicate, types }) => {
      if (
        hotkey &&
        isHotkey(hotkey, event as any) &&
        predicate(editor as any) &&
        someNode(editor, { match: { type: types } })
      ) {
        event.preventDefault?.();

        setElements(editor, { type: defaultType });

        if (onReset) {
          onReset(editor as any);
        }

        reset = true;
      }
    });
  }

  return reset;
};
