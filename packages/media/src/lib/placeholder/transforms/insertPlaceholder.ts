import {
  type InsertNodesOptions,
  type SlateEditor,
  insertNodes,
} from '@udecode/plate-common';

import { BaseAudioPlugin } from '../../BaseAudioPlugin';
import { BaseFilePlugin } from '../../BaseFilePlugin';
import { BaseVideoPlugin } from '../../BaseVideoPlugin';
import { BaseImagePlugin } from '../../image';
import {
  type TPlaceholderElement,
  BasePlaceholderPlugin,
} from '../BasePlaceholderPlugin';

export const insertPlaceholder = (
  editor: SlateEditor,
  mediaType: string,
  options?: InsertNodesOptions
) => {
  editor.tf.withoutNormalizing(() =>
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

export const insertImagePlaceholder = (
  editor: SlateEditor,
  options?: InsertNodesOptions
) => insertPlaceholder(editor, BaseImagePlugin.key, options);

export const insertVideoPlaceholder = (
  editor: SlateEditor,
  options?: InsertNodesOptions
) => insertPlaceholder(editor, BaseVideoPlugin.key, options);

export const insertAudioPlaceholder = (
  editor: SlateEditor,
  options?: InsertNodesOptions
) => insertPlaceholder(editor, BaseAudioPlugin.key, options);

export const insertFilePlaceholder = (
  editor: SlateEditor,
  options?: InsertNodesOptions
) => insertPlaceholder(editor, BaseFilePlugin.key, options);
