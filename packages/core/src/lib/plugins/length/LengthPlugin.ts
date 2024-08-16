import { getEditorString, withoutNormalizing } from '@udecode/slate';

import type {
  PluginConfig,
  WithOverride,
} from '../../plugin/types/PlatePlugin';

import { createTPlugin } from '../../plugin/createPlugin';

export type LengthConfig = PluginConfig<
  'length',
  {
    maxLength: number;
  }
>;

export const withLength: WithOverride<LengthConfig> = ({ editor, options }) => {
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

export const LengthPlugin = createTPlugin<LengthConfig>({
  key: 'length',
  withOverrides: withLength,
});
