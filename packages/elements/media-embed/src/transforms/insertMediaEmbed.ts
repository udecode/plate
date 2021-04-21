import { getParent, insertNodes } from '@udecode/slate-plugins-common';
import {
  SlatePluginKey,
  SPEditor,
  TElement,
} from '@udecode/slate-plugins-core';
import { ELEMENT_MEDIA_EMBED } from '../defaults';
import { MediaEmbedNodeData } from '../types';

export const insertMediaEmbed = (
  editor: SPEditor,
  {
    url,
    pluginKey = ELEMENT_MEDIA_EMBED,
  }: {
    url: MediaEmbedNodeData;
  } & SlatePluginKey
): void => {
  if (!editor.selection) return;
  const selectionParentEntry = getParent(editor, editor.selection);
  if (!selectionParentEntry) return;
  const [, path] = selectionParentEntry;
  insertNodes<TElement>(
    editor,
    {
      type: pluginKey,
      url,
      children: [{ text: '' }],
    },
    { at: path }
  );
};
