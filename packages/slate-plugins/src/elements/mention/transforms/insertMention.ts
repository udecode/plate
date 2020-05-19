import { Editor, Transforms } from 'slate';
import { MentionableItem, MentionNode } from '../types';

export const insertMention = (
  editor: Editor,
  mentionable: MentionableItem,
  prefix: string
) => {
  const mention: MentionNode = {
    type: 'mention',
    prefix,
    mentionable,
    children: [{ text: '' }],
  };
  Transforms.insertNodes(editor, mention);
  Transforms.move(editor);
};
