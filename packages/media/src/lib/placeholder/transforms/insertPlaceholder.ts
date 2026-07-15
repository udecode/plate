import type {
  EditorUpdateTransaction,
  NodeInsertNodesOptions,
} from '@platejs/plite';
import type { TPlaceholderElement } from '@platejs/utils';
import { KEYS } from '@platejs/utils';

export const insertPlaceholder = (
  tx: EditorUpdateTransaction,
  mediaType: string,
  type: string,
  options?: NodeInsertNodesOptions<TPlaceholderElement>
) =>
  tx.nodes.insert<TPlaceholderElement>(
    {
      children: [{ text: '' }],
      mediaType,
      type,
    },
    options
  );

export const insertImagePlaceholder = (
  tx: EditorUpdateTransaction,
  type: string,
  options?: NodeInsertNodesOptions<TPlaceholderElement>
) => insertPlaceholder(tx, KEYS.img, type, options);

export const insertVideoPlaceholder = (
  tx: EditorUpdateTransaction,
  type: string,
  options?: NodeInsertNodesOptions<TPlaceholderElement>
) => insertPlaceholder(tx, KEYS.video, type, options);

export const insertAudioPlaceholder = (
  tx: EditorUpdateTransaction,
  type: string,
  options?: NodeInsertNodesOptions<TPlaceholderElement>
) => insertPlaceholder(tx, KEYS.audio, type, options);

export const insertFilePlaceholder = (
  tx: EditorUpdateTransaction,
  type: string,
  options?: NodeInsertNodesOptions<TPlaceholderElement>
) => insertPlaceholder(tx, KEYS.file, type, options);
