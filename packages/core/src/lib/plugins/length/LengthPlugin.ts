import { getEditorString, withoutNormalizing } from '@udecode/slate';

import type { WithOverride } from '../../plugin/types/PlatePlugin';

import { createPlugin } from '../../plugin/createPlugin';

export type LengthPluginOptions = {
  maxLength: number;
};

export const withLength: WithOverride<LengthPluginOptions> = ({
  editor,
  plugin: { options },
}) => {
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

export const LengthPlugin = createPlugin<'length', LengthPluginOptions>({
  key: 'length',
  withOverrides: withLength,
});
