import { insertNodes } from '@udecode/slate-plugins-common';
import {
  getSlatePluginType,
  SlatePluginKey,
  SPEditor,
} from '@udecode/slate-plugins-core';
import { Transforms } from 'slate';
import { ELEMENT_MENTION } from '../defaults';
import { MentionNode, MentionNodeData } from '../types';

export const insertMention = (
  editor: SPEditor,
  {
    insertSpaceAfterMention,
    data,
    pluginKey = ELEMENT_MENTION,
  }: {
    data: MentionNodeData;
    insertSpaceAfterMention?: boolean;
  } & SlatePluginKey
) => {
  const mentionNode: MentionNode = {
    type: getSlatePluginType(editor, pluginKey),
    children: [{ text: '' }],
    ...data,
  };

  insertNodes<MentionNode>(editor, mentionNode);
  Transforms.move(editor);
  if (insertSpaceAfterMention) {
    Transforms.insertText(editor, ' ');
    Transforms.move(editor);
  }
};
