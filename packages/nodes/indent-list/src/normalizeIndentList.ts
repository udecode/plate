import { TEditor, withoutNormalizing } from '@udecode/plate-core';
import { NodeEntry } from 'slate';
import { normalizeIndentListNotIndented } from './normalizers/normalizeIndentListNotIndented';
import { normalizeIndentListStart } from './normalizers/normalizeIndentListStart';
import { IndentListPlugin } from './createIndentListPlugin';

export const normalizeIndentList = (
  editor: TEditor,
  { getSiblingIndentListOptions }: IndentListPlugin = {}
) => {
  const { normalizeNode } = editor;

  return ([node, path]: NodeEntry) => {
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
