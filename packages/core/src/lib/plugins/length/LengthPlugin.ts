import type { LengthConfig } from '../getCorePlugins';

import { withLegacyTransformOverride } from '../../../internal/plugin/withLegacyTransformOverride';
import { createTSlatePlugin } from '../../plugin';

export const LengthPlugin = withLegacyTransformOverride(
  createTSlatePlugin<LengthConfig>({
    key: 'length',
  }),
  ({ editor, getOptions, tf }) => {
    const { apply, delete: deleteText, withoutNormalizing } = tf;

    return {
      tf: {
        apply(operation) {
          withoutNormalizing(() => {
            apply(operation);

            const options = getOptions();

            if (options.maxLength) {
              const length = editor.api.string([]).length;

              // Make sure to remove overflow of text beyond character limit
              if (length > options.maxLength) {
                const overflowLength = length - options.maxLength;

                deleteText({
                  distance: overflowLength,
                  reverse: true,
                  unit: 'character',
                });
              }
            }
          });
        },
      },
    };
  }
);
