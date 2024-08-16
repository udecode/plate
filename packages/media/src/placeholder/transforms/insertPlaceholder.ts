import {
  type InsertNodesOptions,
  type PlateEditor,
  insertNodes,
  withoutNormalizing,
} from '@udecode/plate-common';

import type { TPlaceholderElement } from '../types';

import { AudioPlugin } from '../../audio';
import { FilePlugin } from '../../file';
import { ImagePlugin } from '../../image';
import { VideoPlugin } from '../../video';
import { PlaceholderPlugin } from '../PlaceholderPlugin';

export const insertPlaceHolder = <E extends PlateEditor>(
  editor: E,
  mediaType: string,
  options?: InsertNodesOptions<E>
) => {
  withoutNormalizing(editor, () =>
    insertNodes<TPlaceholderElement>(
      editor,
      {
        children: [{ text: '' }],
        mediaType,
        type: editor.getType(PlaceholderPlugin),
      },
      options as any
    )
  );
};

export const insertImagePlaceholder = <E extends PlateEditor>(
  editor: E,
  options?: InsertNodesOptions<E>
) => insertPlaceHolder(editor, ImagePlugin.key, options);

export const insertVideoPlaceholder = <E extends PlateEditor>(
  editor: E,
  options?: InsertNodesOptions<E>
) => insertPlaceHolder(editor, VideoPlugin.key, options);

export const insertAudioPlaceholer = <E extends PlateEditor>(
  editor: E,
  options?: InsertNodesOptions<E>
) => insertPlaceHolder(editor, AudioPlugin.key, options);

export const insertFilePlaceholer = <E extends PlateEditor>(
  editor: E,
  options?: InsertNodesOptions<E>
) => insertPlaceHolder(editor, FilePlugin.key, options);
