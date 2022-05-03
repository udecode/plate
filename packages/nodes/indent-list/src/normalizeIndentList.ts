import { TEditor, TNodeEntry, withoutNormalizing } from '@udecode/plate-core';
import { normalizeIndentListNotIndented } from './normalizers/normalizeIndentListNotIndented';
import { normalizeIndentListStart } from './normalizers/normalizeIndentListStart';
import { IndentListPlugin } from './createIndentListPlugin';

export const normalizeIndentList = (
  editor: TEditor,
  { getSiblingIndentListOptions }: IndentListPlugin = {}
) => {
  const { normalizeNode } = editor;

  return ([node, path]: TNodeEntry) => {
    const normalized = withoutNormalizing(editor, () => {
      if (normalizeIndentListNotIndented(editor, [node, path])) return true;
      if (
        normalizeIndentListStart(
          editor,
          [node, path],
          getSiblingIndentListOptions
        )
      )
        return true;
    });
    if (normalized) return;

    return normalizeNode([node, path]);
  };
};
