import type { Location } from 'slate';

import { type SlateEditor, unsetNodes } from '@udecode/plate-common';

import { AIPlugin } from '../../react/ai/AIPlugin';

export const removeAIMarks = (
  editor: SlateEditor,
  { at = [] }: { at?: Location } = {}
) => {
  unsetNodes(editor, AIPlugin.key, {
    at,
    match: (n) => (n as any)[AIPlugin.key],
  });
};
