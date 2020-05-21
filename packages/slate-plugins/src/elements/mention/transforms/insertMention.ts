import { Editor, Transforms } from 'slate';
import { MENTION, MentionableItem, MentionNode } from '../types';

export const insertMention = (editor: Editor, mentionable: MentionableItem) => {
  const mention: MentionNode = {
    type: MENTION,
    children: [{ text: '' }],
    ...mentionable,
  };
  Transforms.insertNodes(editor, mention);
  Transforms.move(editor);
};
