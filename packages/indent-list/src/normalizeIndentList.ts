import {
  type NodeEntryOf,
  type TEditor,
  type TElement,
  withoutNormalizing,
} from '@udecode/plate-common';

import type { IndentListPluginOptions } from './IndentListPlugin';

import { normalizeIndentListNotIndented } from './normalizers/normalizeIndentListNotIndented';
import { normalizeIndentListStart } from './normalizers/normalizeIndentListStart';

export const normalizeIndentList = <E extends TEditor>(
  editor: E,
  { getSiblingIndentListOptions }: IndentListPluginOptions = {}
) => {
  const { normalizeNode } = editor;

  return ([node, path]: NodeEntryOf<E>) => {
    const normalized = withoutNormalizing(editor, () => {
      if (normalizeIndentListNotIndented(editor, [node, path])) return true;
      if (
        normalizeIndentListStart(
          editor,
          [node as TElement, path],
          getSiblingIndentListOptions
        )
      )
        return true;
    });

    if (normalized) return;

    return normalizeNode([node, path]);
  };
};
