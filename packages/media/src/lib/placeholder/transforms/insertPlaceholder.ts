import {
  type InsertNodesOptions,
  type SlateEditor,
  insertNodes,
  withoutNormalizing,
} from '@udecode/plate-common';

import type { TPlaceholderElement } from '../types';

import { AudioPlugin } from '../../AudioPlugin';
import { FilePlugin } from '../../FilePlugin';
import { VideoPlugin } from '../../VideoPlugin';
import { ImagePlugin } from '../../image';
import { PlaceholderPlugin } from '../PlaceholderPlugin';

export const insertPlaceholder = <E extends SlateEditor>(
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

export const insertImagePlaceholder = <E extends SlateEditor>(
  editor: E,
  options?: InsertNodesOptions<E>
) => insertPlaceholder(editor, ImagePlugin.key, options);

export const insertVideoPlaceholder = <E extends SlateEditor>(
  editor: E,
  options?: InsertNodesOptions<E>
) => insertPlaceholder(editor, VideoPlugin.key, options);

export const insertAudioPlaceholder = <E extends SlateEditor>(
  editor: E,
  options?: InsertNodesOptions<E>
) => insertPlaceholder(editor, AudioPlugin.key, options);

export const insertFilePlaceholder = <E extends SlateEditor>(
  editor: E,
  options?: InsertNodesOptions<E>
) => insertPlaceholder(editor, FilePlugin.key, options);
