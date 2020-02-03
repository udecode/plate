import { Editor } from 'slate';

/**
 * Does the selection contain a node of this type
 */
export const isBlockActive = (editor: Editor, format: string) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format,
    mode: 'all',
  });

  return !!match;
};
