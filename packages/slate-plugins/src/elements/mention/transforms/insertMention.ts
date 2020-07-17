import { Editor, Transforms } from 'slate';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_MENTION } from '../defaults';
import { MentionNode, MentionNodeData, MentionPluginOptions } from '../types';

export const insertMention = (
  editor: Editor,
  mentionable: MentionNodeData,
  options?: MentionPluginOptions
) => {
  const { mention } = setDefaults(options, DEFAULTS_MENTION);

  const mentionNode: MentionNode = {
    type: mention.type,
    children: [{ text: '' }],
    ...mentionable,
  };
  Transforms.insertNodes(editor, mentionNode);
  Transforms.move(editor);
};
