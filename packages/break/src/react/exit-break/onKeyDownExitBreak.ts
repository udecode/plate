import type { KeyboardHandler } from '@udecode/plate-common/react';

import { getBlockAbove, isHotkey, queryNode } from '@udecode/plate-common';

import type { ExitBreakConfig } from '../../lib/exit-break/types';

import { exitBreak } from '../../lib/exit-break/transforms/exitBreak';

export const onKeyDownExitBreak: KeyboardHandler<ExitBreakConfig> = ({
  editor,
  event,
  options: { rules = [] },
}) => {
  if (event.defaultPrevented) return;

  const entry = getBlockAbove(editor);

  if (!entry) return;

  rules.forEach(({ hotkey, ...rule }) => {
    if (
      isHotkey(hotkey, event as any) &&
      queryNode(entry, rule.query) &&
      exitBreak(editor, rule)
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
};
