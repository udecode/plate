import { SlatePluginOptions } from '@udecode/slate-plugins-core';
import { Editor, Transforms } from 'slate';
import { MentionNode, MentionNodeData } from '../types';

export const insertMention = (
  editor: Editor,
  {
    insertSpaceAfterMention,
    data,
  }: {
    data: MentionNodeData;
    insertSpaceAfterMention?: boolean;
  },
  options: SlatePluginOptions
) => {
  const mentionNode: MentionNode = {
    type: options.type,
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
