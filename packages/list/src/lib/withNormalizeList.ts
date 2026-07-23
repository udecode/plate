import type { BaseEditor, PlateEditorExtension } from '@platejs/core';
import { ElementApi } from '@platejs/plite';

import type { BaseListPluginOptions } from './BaseListPlugin';

import { normalizeListNotIndented } from './normalizers/normalizeListNotIndented';
import { normalizeListStart } from './normalizers/normalizeListStart';

type NormalizeListExtensionContext = {
  editor: BaseEditor;
  getOptions: () => BaseListPluginOptions;
};

export const withNormalizeList = ({
  editor,
  getOptions,
}: NormalizeListExtensionContext): PlateEditorExtension => ({
  corrections: [
    {
      event: 'content',
      correct({ entry, tx }) {
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
      },
    },
  ],
});
