import type { Location } from 'slate';

import { type SlateEditor, unsetNodes } from '@udecode/plate-common';

import { BaseAIPlugin } from '../BaseAIPlugin';

export const removeAIMarks = (
  editor: SlateEditor,
  { at = [] }: { at?: Location } = {}
) => {
  unsetNodes(editor, BaseAIPlugin.key, {
    at,
    match: (n) => (n as any)[BaseAIPlugin.key],
  });
};
