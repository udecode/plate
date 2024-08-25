import { getEditorString, withoutNormalizing } from '@udecode/slate';

import type { LengthConfig } from '../getCorePlugins';

import { type ExtendEditor, createTSlatePlugin } from '../../plugin';

export const withLength: ExtendEditor<LengthConfig> = ({
  editor,
  getOptions,
}) => {
  const { apply } = editor;

  editor.apply = (operation) => {
    withoutNormalizing(editor, () => {
      apply(operation);

      const options = getOptions();

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

export const LengthPlugin = createTSlatePlugin<LengthConfig>({
  extendEditor: withLength,
  key: 'length',
});
