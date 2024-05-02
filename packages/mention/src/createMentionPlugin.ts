import { createPluginFactory, removeNodes } from '@udecode/plate-common';

import type { MentionPlugin } from './types';

import { mentionOnKeyDownHandler } from './handlers/mentionOnKeyDownHandler';
import { isSelectionInMentionInput } from './queries/index';
import { withMention } from './withMention';

export const ELEMENT_MENTION = 'mention';

export const ELEMENT_MENTION_INPUT = 'mention_input';

/** Enables support for autocompleting @mentions. */
export const createMentionPlugin = createPluginFactory<MentionPlugin>({
  handlers: {
    onBlur: (editor) => () => {
      // remove mention_input nodes from editor on blur
      removeNodes(editor, {
        at: [],
        match: (n) => n.type === ELEMENT_MENTION_INPUT,
      });
    },
    onKeyDown: mentionOnKeyDownHandler({ query: isSelectionInMentionInput }),
  },
  isElement: true,
  isInline: true,
  isMarkableVoid: true,
  isVoid: true,
  key: ELEMENT_MENTION,
  options: {
    createMentionNode: (item) => ({ value: item.text }),
    trigger: '@',
    triggerPreviousCharPattern: /^\s?$/,
  },
  plugins: [
    {
      isElement: true,
      isInline: true,
      key: ELEMENT_MENTION_INPUT,
    },
  ],
  then: (editor, { key }) => ({
    options: {
      id: key,
    },
  }),
  withOverrides: withMention,
});
