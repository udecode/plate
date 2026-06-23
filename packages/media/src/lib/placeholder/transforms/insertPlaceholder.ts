import type { NodeInsertNodesOptions } from '@platejs/plite';
import type { BasePlateEditor, TPlaceholderElement } from 'platejs';

import { KEYS } from 'platejs';

export type InsertPlaceholderOptions =
  NodeInsertNodesOptions<TPlaceholderElement>;

export const createPlaceholderNode = (
  type: string,
  mediaType: string
): TPlaceholderElement => ({
  children: [{ text: '' }],
  mediaType,
  type,
});

export const insertPlaceholder = (
  editor: BasePlateEditor,
  mediaType: string,
  options?: InsertPlaceholderOptions
) => {
  editor.update((tx) => {
    tx.withoutNormalizing(() =>
      tx.nodes.insert<TPlaceholderElement>(
        createPlaceholderNode(editor.getType(KEYS.placeholder), mediaType),
        options
      )
    );
  });
};

export const insertImagePlaceholder = (
  editor: BasePlateEditor,
  options?: InsertPlaceholderOptions
) => insertPlaceholder(editor, KEYS.img, options);

export const insertVideoPlaceholder = (
  editor: BasePlateEditor,
  options?: InsertPlaceholderOptions
) => insertPlaceholder(editor, KEYS.video, options);

export const insertAudioPlaceholder = (
  editor: BasePlateEditor,
  options?: InsertPlaceholderOptions
) => insertPlaceholder(editor, KEYS.audio, options);

export const insertFilePlaceholder = (
  editor: BasePlateEditor,
  options?: InsertPlaceholderOptions
) => insertPlaceholder(editor, KEYS.file, options);
