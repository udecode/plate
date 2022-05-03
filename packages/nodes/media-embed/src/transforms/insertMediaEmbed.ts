import {
  getParentNode,
  insertNodes,
  PlateEditor,
  PlatePluginKey,
  TElement,
  Value,
} from '@udecode/plate-core';
import { ELEMENT_MEDIA_EMBED } from '../createMediaEmbedPlugin';
import { MediaEmbedNodeData } from '../types';

export const insertMediaEmbed = <V extends Value>(
  editor: PlateEditor<V>,
  {
    url = '',
    key = ELEMENT_MEDIA_EMBED,
  }: Partial<MediaEmbedNodeData> & PlatePluginKey
): void => {
  if (!editor.selection) return;
  const selectionParentEntry = getParentNode(editor, editor.selection);
  if (!selectionParentEntry) return;
  const [, path] = selectionParentEntry;
  insertNodes<TElement>(
    editor,
    {
      type: key,
      url,
      children: [{ text: '' }],
    },
    { at: path }
  );
};
