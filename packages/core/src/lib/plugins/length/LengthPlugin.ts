import { getEditorString, withoutNormalizing } from '@udecode/slate';

import type {
  PluginConfig,
  WithOverride,
} from '../../plugin/types/PlatePlugin';

import { createPlugin } from '../../plugin/createPlugin';

export type LengthConfig = PluginConfig<{
  maxLength: number;
}>;

export const withLength: WithOverride<LengthConfig> = ({
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

export const LengthPlugin = createPlugin<'length', LengthConfig['options']>({
  key: 'length',
  withOverrides: withLength,
});
