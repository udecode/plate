import { getPluginType } from '@udecode/slate-plugins-core';
import { Editor, Transforms } from 'slate';
import { ELEMENT_MENTION } from '../defaults';
import { MentionNode, MentionNodeData } from '../types';

export const insertMention = (
  editor: Editor,
  {
    insertSpaceAfterMention,
    data,
  }: {
    data: MentionNodeData;
    insertSpaceAfterMention?: boolean;
  }
) => {
  const mentionNode: MentionNode = {
    type: getPluginType(editor, ELEMENT_MENTION),
    children: [{ text: '' }],
    ...data,
  };

  Transforms.insertNodes(editor, mentionNode);
  Transforms.move(editor);
  if (insertSpaceAfterMention) {
    Transforms.insertText(editor, ' ');
    Transforms.move(editor);
  }
};
