import type { Path } from 'slate';

import { type SlateEditor, isText, removeNodes } from '@udecode/plate-common';

import { AIPlugin } from '../../react/ai/AIPlugin';

export const removeAINodes = (
  editor: SlateEditor,
  { at = [] }: { at?: Path } = {}
) => {
  removeNodes(editor, {
    at,
    match: (n) => isText(n) && !!n[AIPlugin.key],
  });
};
