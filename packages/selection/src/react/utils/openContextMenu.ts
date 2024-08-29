import {
  type SlateEditor,
  collapseSelection,
  getAncestorNode,
  getEditorPlugin,
} from '@udecode/plate-common';

import { BlockContextMenuPlugin } from '../BlockContextMenuPlugin';
import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const openContextMenu = (
  editor: SlateEditor,
  e: any,
  selectedId?: string
) => {
  const { api } = getEditorPlugin(editor, BlockSelectionPlugin);
  const blockContextMenu = getEditorPlugin(editor, BlockContextMenuPlugin);

  const id = selectedId ?? getAncestorNode(editor)?.[0].id;

  if (!id) return;

  api.blockSelection.addSelectedRow(id);
  blockContextMenu.api.blockContextMenu.show(editor.id, e);

  collapseSelection(editor);

  return true;
};
