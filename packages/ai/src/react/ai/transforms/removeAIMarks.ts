import type { PlateEditor } from '@udecode/plate-common/react';

import { getRange, removeMark } from '@udecode/plate-common';

import { AIPlugin } from '../AIPlugin';

export const removeAIMarks = (editor: PlateEditor) => {
  removeMark(editor, {
    key: AIPlugin.key,
    at: getRange(editor, []),
  });
};
