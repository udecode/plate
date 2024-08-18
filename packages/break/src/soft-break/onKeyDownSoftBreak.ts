import type { KeyboardHandler } from '@udecode/plate-common/react';

import { getBlockAbove, isHotkey, queryNode } from '@udecode/plate-common';

import type { SoftBreakConfig } from './SoftBreakPlugin';

export const onKeyDownSoftBreak: KeyboardHandler<SoftBreakConfig> = ({
  editor,
  event,
  options: { rules = [] },
}) => {
  if (event.defaultPrevented) return;

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
