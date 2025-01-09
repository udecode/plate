import type { LengthConfig } from '../getCorePlugins';

import { createTSlatePlugin } from '../../plugin';

export const LengthPlugin = createTSlatePlugin<LengthConfig>({
  key: 'length',
}).overrideEditor(({ editor, getOptions, tf: { apply } }) => ({
  transforms: {
    apply(operation) {
      editor.tf.withoutNormalizing(() => {
        apply(operation);

        const options = getOptions();

        if (options.maxLength) {
          const length = editor.api.string([]).length;

          // Make sure to remove overflow of text beyond character limit
          if (length > options.maxLength) {
            const overflowLength = length - options.maxLength;

            editor.tf.delete({
              distance: overflowLength,
              reverse: true,
              unit: 'character',
            });
          }
        }
      });
    },
  },
}));
