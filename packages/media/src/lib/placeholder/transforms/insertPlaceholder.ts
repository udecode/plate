import {
  type InsertNodesOptions,
  type SlateEditor,
  insertNodes,
  withoutNormalizing,
} from '@udecode/plate-common';

import type { TPlaceholderElement } from '../types';

import { BaseAudioPlugin } from '../../BaseAudioPlugin';
import { BaseFilePlugin } from '../../BaseFilePlugin';
import { BaseVideoPlugin } from '../../BaseVideoPlugin';
import { BaseImagePlugin } from '../../image';
import { BasePlaceholderPlugin } from '../BasePlaceholderPlugin';

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
        type: editor.getType(BasePlaceholderPlugin),
      },
      options as any
    )
  );
};

export const insertImagePlaceholder = <E extends SlateEditor>(
  editor: E,
  options?: InsertNodesOptions<E>
) => insertPlaceholder(editor, BaseImagePlugin.key, options);

export const insertVideoPlaceholder = <E extends SlateEditor>(
  editor: E,
  options?: InsertNodesOptions<E>
) => insertPlaceholder(editor, BaseVideoPlugin.key, options);

export const insertAudioPlaceholder = <E extends SlateEditor>(
  editor: E,
  options?: InsertNodesOptions<E>
) => insertPlaceholder(editor, BaseAudioPlugin.key, options);

export const insertFilePlaceholder = <E extends SlateEditor>(
  editor: E,
  options?: InsertNodesOptions<E>
) => insertPlaceholder(editor, BaseFilePlugin.key, options);
