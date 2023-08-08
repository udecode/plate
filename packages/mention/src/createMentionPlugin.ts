import { createPluginFactory } from '@udecode/plate-common';

import { mentionOnKeyDownHandler } from './handlers/mentionOnKeyDownHandler';
import { isSelectionInMentionInput } from './queries/index';
import { MentionPlugin } from './types';
import { withMention } from './withMention';

export const ELEMENT_MENTION = 'mention';
export const ELEMENT_MENTION_INPUT = 'mention_input';

/**
 * Enables support for autocompleting @mentions.
 */
export const createMentionPlugin = createPluginFactory<MentionPlugin>({
  key: ELEMENT_MENTION,
  isElement: true,
  isInline: true,
  isVoid: true,
  handlers: {
    onKeyDown: mentionOnKeyDownHandler({ query: isSelectionInMentionInput }),
  },
  withOverrides: withMention,
  options: {
    trigger: '@',
    triggerPreviousCharPattern: /^\s?$/,
    createMentionNode: (item) => ({ value: item.text }),
  },
  plugins: [
    {
      key: ELEMENT_MENTION_INPUT,
      isElement: true,
      isInline: true,
    },
  ],
  then: (editor, { key }) => ({
    options: {
      id: key,
    },
  }),
});
