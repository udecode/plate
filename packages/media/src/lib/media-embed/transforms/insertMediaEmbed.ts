import type {
  InsertNodesOptions,
  SlateEditor,
  TMediaEmbedElement,
} from 'platejs';

import { KEYS } from 'platejs';

import { parseMediaUrl } from '../../media/parseMediaUrl';
import { parseTwitterUrl } from '../parseTwitterUrl';
import { parseVideoUrl } from '../parseVideoUrl';

export const insertMediaEmbed = (
  editor: SlateEditor,
  { url = '' }: Partial<TMediaEmbedElement>,
  options: InsertNodesOptions = {}
): void => {
  if (!editor.selection) return;

  const selectionParentEntry = editor.api.parent(editor.selection);

  if (!selectionParentEntry) return;

  const [, path] = selectionParentEntry;
  const normalized = parseMediaUrl(url, {
    urlParsers: [parseTwitterUrl, parseVideoUrl],
  });

  editor.tf.insertNodes<TMediaEmbedElement>(
    {
      children: [{ text: '' }],
      id: normalized?.id,
      provider: normalized?.provider,
      sourceUrl: normalized?.sourceUrl,
      type: editor.getType(KEYS.mediaEmbed),
      url: normalized?.url ?? url,
    },
    {
      at: path,
      nextBlock: true,
      ...(options as any),
    }
  );
};
