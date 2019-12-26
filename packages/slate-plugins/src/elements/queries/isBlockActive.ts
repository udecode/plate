import { Editor } from 'slate';

export const isBlockActive = (editor: Editor, format: string) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format,
    mode: 'all',
  });

  return !!match;
};
