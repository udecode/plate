import type { Location } from 'slate';

import { type SlateEditor, getRange, removeMark } from '@udecode/plate-common';

import { AIPlugin } from '../../react/ai/AIPlugin';

export const removeAIMarks = (
  editor: SlateEditor,
  { at = [] }: { at?: Location } = {}
) => {
  removeMark(editor, {
    key: AIPlugin.key,
    at: getRange(editor, at),
  });
};
