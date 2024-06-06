import { getEditorString, withoutNormalizing } from '@udecode/slate';

import type { WithOverride } from '../types/index';

import { createPluginFactory } from '../utils/createPluginFactory';

export type LengthPlugin = {
  maxLength: number;
};

export const KEY_LENGTH = 'length';

export const withLength: WithOverride<LengthPlugin> = (editor, { options }) => {
  const { apply } = editor;

  editor.apply = (operation) => {
    withoutNormalizing(editor, () => {
      apply(operation);

      if (options.maxLength) {
        const length = getEditorString(editor, []).length;

        // Make sure to remove overflow of text beyond character limit
        if (length > options.maxLength) {
          const overflowLength = length - options.maxLength;

          editor.delete({
            distance: overflowLength,
            reverse: true,
            unit: 'character',
          });
        }
      }
    });
  };

  return editor;
};

export const createLengthPlugin = createPluginFactory<LengthPlugin>({
  key: KEY_LENGTH,
  withOverrides: withLength,
});
