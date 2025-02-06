import type { KeyboardHandler } from '@udecode/plate/react';

import { isHotkey, queryNode } from '@udecode/plate';

import type { ExitBreakConfig } from '../../lib';

import { exitBreak } from '../../lib/exit-break/transforms/exitBreak';

export const onKeyDownExitBreak: KeyboardHandler<ExitBreakConfig> = ({
  editor,
  event,
  getOptions,
}) => {
  const { rules = [] } = getOptions();

  if (event.defaultPrevented) return;

  const entry = editor.api.block();

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
