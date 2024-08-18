import {
  type SlateEditor,
  collapseSelection,
  getAncestorNode,
} from '@udecode/plate-common';

import { blockSelectionActions } from '../blockSelectionStore';
import { blockContextMenuActions } from '../context-menu';

export const openContextMenu = (
  editor: SlateEditor,
  e: any,
  selectedId?: string
) => {
  const id = selectedId ?? getAncestorNode(editor)?.[0].id;

  if (!id) return;

  blockSelectionActions.addSelectedRow(id);
  blockContextMenuActions.show(editor.id, e);

  collapseSelection(editor);

  return true;
};
