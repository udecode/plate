import type { ExtendPlateEditorExtension } from '@platejs/core';
import { ElementApi } from '@platejs/plite';

import type { BaseListConfig } from './BaseListPlugin';

import { normalizeListNotIndented } from './normalizers/normalizeListNotIndented';
import { normalizeListStart } from './normalizers/normalizeListStart';

export const withNormalizeList: ExtendPlateEditorExtension<BaseListConfig> = ({
  editor,
  getOptions,
}) => ({
  normalizers: {
    node({ entry, next, tx }) {
      if (normalizeListNotIndented(editor, tx, entry)) return;
      if (
        ElementApi.isElement(entry[0]) &&
        normalizeListStart(
          editor,
          tx,
          [entry[0], entry[1]],
          getOptions().getSiblingListOptions
        )
      ) {
        return;
      }

      next();
    },
  },
});
