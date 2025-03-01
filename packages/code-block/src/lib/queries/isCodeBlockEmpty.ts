import { type SlateEditor, NodeApi } from '@udecode/plate';

import { BaseCodeBlockPlugin } from '../BaseCodeBlockPlugin';

/** Is the selection inside an empty code block */
export const isCodeBlockEmpty = (editor: SlateEditor) => {
  const { selection } = editor;

  if (!selection) return false;

  // Find the code block containing the selection
  const [codeBlock] = editor.api.nodes({
    at: selection,
    match: { type: editor.getType(BaseCodeBlockPlugin) },
  });

  if (!codeBlock) return false;

  const [node] = codeBlock;

  // Check if the code block has no content
  return !NodeApi.string(node);
};
