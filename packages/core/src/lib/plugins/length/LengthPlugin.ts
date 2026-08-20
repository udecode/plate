import type { LengthConfig } from '../getCorePlugins';

import { createTSlatePlugin } from '../../plugin';

export const LengthPlugin = createTSlatePlugin<LengthConfig>({
  key: 'length',
}).overrideEditor(({ editor, getOptions, tf: { apply } }) => {
  // The trim applies its own operations, which come back through this same
  // `apply`. Letting them start their own nested trim invalidates the paths
  // the outer delete is still walking, so nested passes are suppressed and
  // the outer one loops instead.
  let trimming = false;

  return {
    transforms: {
      apply(operation) {
        editor.tf.withoutNormalizing(() => {
          apply(operation);

          if (trimming) return;

          const options = getOptions();

          if (!options.maxLength) return;

          trimming = true;

          try {
            // Make sure to remove overflow of text beyond character limit.
            // One pass is not always enough: crossing a block boundary
            // consumes deletion distance without removing a character, so
            // the trim can come up short and has to run again.
            while (true) {
              const length = editor.api.string([]).length;

              if (length <= options.maxLength) break;

              const before = editor.children;

              editor.tf.delete({
                distance: length - options.maxLength,
                reverse: true,
                unit: 'character',
              });

              // The pass changed nothing — stop rather than spin. Progress is
              // structural, not by character count: a pass that only merges
              // away an empty block removes no character but does move the
              // selection closer to the text it still has to trim.
              if (editor.children === before) break;
            }
          } finally {
            trimming = false;
          }
        });
      },
    },
  };
});
