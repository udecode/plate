import { Editor, Transforms } from 'slate';

export const insertMention = (editor: Editor, character: any) => {
  const mention = { type: 'mention', character, children: [{ text: '' }] };
  Transforms.insertNodes(editor, mention);
  Transforms.move(editor);
};
