import type { OverrideEditor, TElement } from '@udecode/plate';

import type { BaseIndentListConfig } from './BaseIndentListPlugin';

import { normalizeIndentListNotIndented } from './normalizers/normalizeIndentListNotIndented';
import { normalizeIndentListStart } from './normalizers/normalizeIndentListStart';

export const withNormalizeIndentList: OverrideEditor<BaseIndentListConfig> = ({
  editor,
  getOptions,
  tf: { normalizeNode },
}) => {
  return {
    transforms: {
      normalizeNode([node, path]) {
        const normalized = editor.tf.withoutNormalizing(() => {
          if (normalizeIndentListNotIndented(editor, [node, path])) return true;
          if (
            normalizeIndentListStart(
              editor,
              [node as TElement, path],
              getOptions().getSiblingIndentListOptions
            )
          )
            return true;
        });

        if (normalized) return;

        return normalizeNode([node, path]);
      },
    },
  };
};
