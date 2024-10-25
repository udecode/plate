import type { Path } from 'slate';

import { type SlateEditor, isText, removeNodes } from '@udecode/plate-common';

import { BaseAIPlugin } from '../BaseAIPlugin';

export const removeAINodes = (
  editor: SlateEditor,
  { at = [] }: { at?: Path } = {}
) => {
  removeNodes(editor, {
    at,
    match: (n) => isText(n) && !!n[BaseAIPlugin.key],
  });
};
