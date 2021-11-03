import { getNode } from '@udecode/plate-common';
import { TEditor, TNode } from '@udecode/plate-core';
import { LicSelection } from '../atoms/licSelection';

export const hasLicMark = (
  editor: TEditor,
  licSelection: LicSelection,
  key: string
): unknown => {
  const node = getNode(editor, licSelection.path) as TNode;

  return node[key];
};
