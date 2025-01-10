import type { KeyboardHandler } from '@udecode/plate/react';

import { isHotkey } from '@udecode/plate';

import type { ResetNodeConfig } from '../lib/BaseResetNodePlugin';

export const SIMULATE_BACKSPACE: any = {
  key: '',
  which: 8,
};

export const onKeyDownResetNode: KeyboardHandler<ResetNodeConfig> = ({
  editor,
  event,
  getOptions,
}) => {
  const { rules = [] } = getOptions();

  if (event.defaultPrevented) return;

  let reset;

  if (!editor.selection) return;
  if (editor.api.isCollapsed()) {
    rules.forEach(({ defaultType, hotkey, predicate, types, onReset }) => {
      if (
        hotkey &&
        isHotkey(hotkey, event as any) &&
        predicate(editor as any) &&
        editor.api.some({ match: { type: types } })
      ) {
        event.preventDefault?.();

        editor.tf.setNodes({ type: defaultType });

        if (onReset) {
          onReset(editor as any);
        }

        reset = true;
      }
    });
  }

  return reset;
};
