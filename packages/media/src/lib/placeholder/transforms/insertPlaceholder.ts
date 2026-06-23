import type { NodeInsertNodesOptions } from '@platejs/slate';
import type { SlateEditor, TPlaceholderElement } from 'platejs';

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
  editor: SlateEditor,
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
  editor: SlateEditor,
  options?: InsertPlaceholderOptions
) => insertPlaceholder(editor, KEYS.img, options);

export const insertVideoPlaceholder = (
  editor: SlateEditor,
  options?: InsertPlaceholderOptions
) => insertPlaceholder(editor, KEYS.video, options);

export const insertAudioPlaceholder = (
  editor: SlateEditor,
  options?: InsertPlaceholderOptions
) => insertPlaceholder(editor, KEYS.audio, options);

export const insertFilePlaceholder = (
  editor: SlateEditor,
  options?: InsertPlaceholderOptions
) => insertPlaceholder(editor, KEYS.file, options);
