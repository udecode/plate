import { Editor, Transforms } from 'slate';
import { MENTION, MentionNode, MentionNodeData } from '../types';

export const insertMention = (editor: Editor, mentionable: MentionNodeData) => {
  const mention: MentionNode = {
    type: MENTION,
    children: [{ text: '' }],
    ...mentionable,
  };
  Transforms.insertNodes(editor, mention);
  Transforms.move(editor);
};
