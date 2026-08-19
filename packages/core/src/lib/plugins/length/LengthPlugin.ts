import type { LengthConfig } from '../getCorePlugins';

import { createTSlatePlugin } from '../../plugin';

export const LengthPlugin = createTSlatePlugin<LengthConfig>({
  key: 'length',
}).overrideEditor(({ editor, getOptions, tf: { apply } }) => {
  // The trim below applies its own operations, which come back through this
  // same `apply`. Without this guard the nested call sees a half-finished
  // document that is still over the limit and starts a second, overlapping
  // delete, invalidating the paths the outer one is still walking.
  let trimming = false;

  return {
    transforms: {
      apply(operation) {
        editor.tf.withoutNormalizing(() => {
          apply(operation);

          if (trimming) return;

          const options = getOptions();

          if (options.maxLength) {
            const length = editor.api.string([]).length;

            // Make sure to remove overflow of text beyond character limit
            if (length > options.maxLength) {
              const overflowLength = length - options.maxLength;

              trimming = true;

              try {
                editor.tf.delete({
                  distance: overflowLength,
                  reverse: true,
                  unit: 'character',
                });
              } finally {
                trimming = false;
              }
            }
          }
        });
      },
    },
  };
});
