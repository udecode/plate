import { PlatePlugin } from '@udecode/plate-core';
import { ELEMENT_MENTION, ELEMENT_MENTION_INPUT } from './defaults';
import { getMentionDeserialize } from './getMentionDeserialize';
import { moveSelectionByOffset } from './moveSelectionByOffset';
import { isSelectionInMentionInput } from './queries';
import { MentionPluginOptions } from './types';
import { withMention, withMentionInput } from './withMention';

/**
 * Enables support for autocompleting @mentions.
 */
export const createMentionPlugins = (
  options: MentionPluginOptions = {}
): PlatePlugin[] => {
  const { key = ELEMENT_MENTION } = options;

  return [
    {
      key,
      isElement: true,
      isInline: true,
      isVoid: true,
      deserialize: getMentionDeserialize(key),
      withOverrides: withMention(options),
      onKeyDown: (editor) =>
        moveSelectionByOffset(editor, { query: isSelectionInMentionInput }),
    },
    {
      key: ELEMENT_MENTION_INPUT,
      isElement: true,
      isInline: true,
      withOverrides: withMentionInput(options),
    },
  ];
};
