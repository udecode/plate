import type { OverrideEditor, TElement } from 'platejs';

import type { BaseListConfig } from './BaseListPlugin';

import { normalizeListNotIndented } from './normalizers/normalizeListNotIndented';
import { normalizeListStart } from './normalizers/normalizeListStart';

export const withNormalizeList: OverrideEditor<BaseListConfig> = ({
  editor,
  getOptions,
  tf: { normalizeNode },
}) => ({
  transforms: {
    normalizeNode([node, path]) {
      const normalized = editor.tf.withoutNormalizing(() => {
        if (normalizeListNotIndented(editor, [node, path])) return true;
        if (
          normalizeListStart(
            editor,
            [node as TElement, path],
            getOptions().getSiblingListOptions
          )
        )
          return true;
      });

      if (normalized) return;

      return normalizeNode([node, path]);
    },
  },
});
