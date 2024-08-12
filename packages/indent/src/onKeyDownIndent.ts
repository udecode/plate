import type { KeyboardHandler } from '@udecode/plate-common';

import { Hotkeys } from '@udecode/plate-common/react';

import { indent, outdent } from './transforms/index';

export const onKeyDownIndent: KeyboardHandler = ({ editor, event }) => {
  if (event.defaultPrevented) return;
  if (Hotkeys.isTab(editor, event)) {
    event.preventDefault();
    indent(editor);
  }
  if (Hotkeys.isUntab(editor, event)) {
    event.preventDefault();
    outdent(editor);
  }
};
