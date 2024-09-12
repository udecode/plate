import {
  type ExtendEditor,
  type TElement,
  withoutNormalizing,
} from '@udecode/plate-common';

import type { BaseIndentListConfig } from './BaseIndentListPlugin';

import { normalizeIndentListNotIndented } from './normalizers/normalizeIndentListNotIndented';
import { normalizeIndentListStart } from './normalizers/normalizeIndentListStart';

export const withNormalizeIndentList: ExtendEditor<BaseIndentListConfig> = ({
  editor,
  getOptions,
}) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = ([node, path]) => {
    const normalized = withoutNormalizing(editor, () => {
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
  };

  return editor;
};
