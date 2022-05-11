import {
  NNodeEntry,
  TEditor,
  TElement,
  Value,
  withoutNormalizing,
} from '@udecode/plate-core';
import { normalizeIndentListNotIndented } from './normalizers/normalizeIndentListNotIndented';
import { normalizeIndentListStart } from './normalizers/normalizeIndentListStart';
import { IndentListPlugin } from './createIndentListPlugin';

export const normalizeIndentList = <V extends Value>(
  editor: TEditor<V>,
  { getSiblingIndentListOptions }: IndentListPlugin = {}
) => {
  const { normalizeNode } = editor;

  return ([node, path]: NNodeEntry<V>) => {
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
