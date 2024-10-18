import type { PlateEditor } from '@udecode/plate-common/react';

import { isText, removeNodes } from '@udecode/plate-common';

import { AIPlugin } from '../AIPlugin';

export const removeAINodes = (editor: PlateEditor) => {
  removeNodes(editor, {
    at: [],
    match: (n) => isText(n) && !!n[AIPlugin.key],
  });
};
