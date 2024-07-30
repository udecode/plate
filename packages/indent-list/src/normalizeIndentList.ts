import {
  type ENodeEntry,
  type TEditor,
  type TElement,
  type Value,
  withoutNormalizing,
} from '@udecode/plate-common/server';

import type { IndentListPluginOptions } from './IndentListPlugin';

import { normalizeIndentListNotIndented } from './normalizers/normalizeIndentListNotIndented';
import { normalizeIndentListStart } from './normalizers/normalizeIndentListStart';

export const normalizeIndentList = <V extends Value>(
  editor: TEditor<V>,
  { getSiblingIndentListOptions }: IndentListPluginOptions = {}
) => {
  const { normalizeNode } = editor;

  return ([node, path]: ENodeEntry<V>) => {
    const normalized = withoutNormalizing(editor, () => {
      if (normalizeIndentListNotIndented(editor, [node, path])) return true;
      if (
        normalizeIndentListStart<TElement, Value>(
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
