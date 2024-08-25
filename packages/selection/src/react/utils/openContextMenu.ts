import {
  type SlateEditor,
  collapseSelection,
  getAncestorNode,
  getEditorPlugin,
} from '@udecode/plate-common';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';
import { blockContextMenuActions } from '../context-menu';

export const openContextMenu = (
  editor: SlateEditor,
  e: any,
  selectedId?: string
) => {
  const { api } = getEditorPlugin(editor, BlockSelectionPlugin);

  const id = selectedId ?? getAncestorNode(editor)?.[0].id;

  if (!id) return;

  api.blockSelection.addSelectedRow(id);
  blockContextMenuActions.show(editor.id, e);

  collapseSelection(editor);

  return true;
};
