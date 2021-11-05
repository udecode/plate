import { getParent, insertNodes } from '@udecode/plate-common';
import { PlateEditor, PlatePluginKey, TElement } from '@udecode/plate-core';
import { ELEMENT_EXCALIDRAW } from '../defaults';
import { ExcalidrawNodeData } from '../types';

export const insertExcalidraw = (
  editor: PlateEditor,
  {
    pluginKey = ELEMENT_EXCALIDRAW,
  }: Partial<ExcalidrawNodeData> & PlatePluginKey
): void => {
  if (!editor.selection) return;

  const selectionParentEntry = getParent(editor, editor.selection);
  if (!selectionParentEntry) return;

  const [, path] = selectionParentEntry;

  insertNodes<TElement<ExcalidrawNodeData>>(
    editor,
    {
      type: pluginKey,
      children: [{ text: '' }],
    },
    { at: path }
  );
};
