import { createPluginFactory, removeNodes } from '@udecode/plate-common';

import { slashOnKeyDownHandler } from './handlers/slashOnKeyDownHandler';
import { isSelectionInSlashInput } from './queries/index';
import { SlashPlugin } from './types';
import { withSlashCommand } from './withSlashCommand';

export const ELEMENT_SLASH_COMMAND = 'slash_command';
export const ELEMENT_SLASH_INPUT = 'slash_input';
/**
 * Enables support for autocompleting /slash_command.
 */

export const createSlashPlugin = createPluginFactory<SlashPlugin>({
  key: ELEMENT_SLASH_COMMAND,
  handlers: {
    onKeyDown: slashOnKeyDownHandler({ query: isSelectionInSlashInput }),
    onBlur: (editor) => () => {
      // remove slash_input nodes from editor on blur
      removeNodes(editor, {
        match: (n) => n.type === ELEMENT_SLASH_INPUT,
        at: [],
      });
    },
  },
  withOverrides: withSlashCommand,
  options: {
    trigger: '/',
    triggerPreviousCharPattern: /^\s?$/,
    createSlashNode: (item) => ({ value: item.text }),
  },
  plugins: [
    {
      key: ELEMENT_SLASH_INPUT,
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
