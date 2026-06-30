import type { LengthConfig } from '../getCorePlugins';

import { createBasePlugin } from '../../plugin';

export const LengthPlugin = createBasePlugin<LengthConfig>({
  key: 'length',
}).extendExtension(({ editor, getOptions }) => ({
  operations: {
    apply({ operation, next }) {
      next(operation);

      const { maxLength } = getOptions();

      if (typeof maxLength !== 'number') return;

      const length = editor.read.text.string([]).length;

      if (length <= maxLength) return;

      editor.update((tx) => {
        tx.text.delete({
          distance: length - maxLength,
          reverse: true,
          unit: 'character',
        });
      });
    },
  },
}));
