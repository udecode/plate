import { Editor } from 'slate';

export const isBlockActive = (editor: Editor, format: string) => {
  const [match] = Editor.nodes(editor, {
    match: { type: format },
    mode: 'all',
  });

  return !!match;
};
