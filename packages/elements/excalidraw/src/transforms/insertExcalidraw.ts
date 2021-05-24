import { getParent, insertNodes } from '@udecode/slate-plugins-common';
import {
  SlatePluginKey,
  SPEditor,
  TElement,
} from '@udecode/slate-plugins-core';
import { ELEMENT_EXCALIDRAW } from '../defaults';
import { ExcalidrawNodeData } from '../types';

export const insertExcalidraw = (
  editor: SPEditor,
  {
    pluginKey = ELEMENT_EXCALIDRAW,
  }: Partial<ExcalidrawNodeData> & SlatePluginKey
): void => {
  if (!editor.selection) return;
  const selectionParentEntry = getParent(editor, editor.selection);
  if (!selectionParentEntry) return;
  const [, path] = selectionParentEntry;
  insertNodes<TElement>(
    editor,
    {
      type: pluginKey,
      children: [{ text: '' }],
    },
    { at: path }
  );
};
