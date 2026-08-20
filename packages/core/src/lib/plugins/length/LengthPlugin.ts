import { PathApi, TextApi } from '@platejs/slate';

import type { LengthConfig } from '../getCorePlugins';

import { createTSlatePlugin } from '../../plugin';

export const LengthPlugin = createTSlatePlugin<LengthConfig>({
  key: 'length',
}).overrideEditor(({ editor, getOptions, tf: { apply } }) => {
  let isTrimming = false;
  let shouldTrimAgain = false;

  const deleteOverflow = (distance: number) => {
    const point = editor.selection?.focus;

    if (!point) return;

    const target =
      editor.api.before(point, { distance, unit: 'character' }) ??
      editor.api.start([]);

    if (!target) return;

    if (PathApi.equals(target.path, point.path)) {
      editor.tf.delete({
        at: { anchor: target, focus: point },
      });

      return;
    }

    if (point.offset > 0) {
      editor.tf.delete({
        at: {
          anchor: { offset: 0, path: point.path },
          focus: point,
        },
      });

      return;
    }

    const block = editor.api.block({ at: point });

    if (block && block[1].length === 1 && editor.api.isEmpty(block[0])) {
      editor.tf.removeNodes({ at: block[1] });

      return;
    }

    const previous = editor.api.previous({
      at: point,
      match: TextApi.isText,
    });

    if (previous) {
      editor.tf.select(editor.api.end(previous[1])!);
    }
  };

  return {
    transforms: {
      apply(operation) {
        editor.tf.withoutNormalizing(() => {
          apply(operation);

          const options = getOptions();

          if (!options.maxLength) return;

          if (isTrimming) {
            shouldTrimAgain = true;

            return;
          }

          isTrimming = true;

          try {
            do {
              shouldTrimAgain = false;

              const length = editor.api.string([]).length;
              const overflowLength = length - options.maxLength;

              if (overflowLength <= 0) return;

              deleteOverflow(overflowLength);
            } while (shouldTrimAgain);
          } finally {
            isTrimming = false;
            shouldTrimAgain = false;
          }
        });
      },
    },
  };
});
