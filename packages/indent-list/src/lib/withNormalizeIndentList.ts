import {
  type TElement,
  type WithOverride,
  withoutNormalizing,
} from '@udecode/plate-common';

import type { IndentListConfig } from './IndentListPlugin';

import { normalizeIndentListNotIndented } from './normalizers/normalizeIndentListNotIndented';
import { normalizeIndentListStart } from './normalizers/normalizeIndentListStart';

export const withNormalizeIndentList: WithOverride<IndentListConfig> = ({
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
