import type {
  NodeInsertNodesOptions,
  BasePlateEditor,
  TMediaEmbedElement,
} from 'platejs';

import { KEYS, PathApi } from 'platejs';

import { parseMediaUrl } from '../../media/parseMediaUrl';
import { parseTwitterUrl } from '../parseTwitterUrl';
import { parseVideoUrl } from '../parseVideoUrl';

type InsertNodesOptions = NonNullable<
  NodeInsertNodesOptions<TMediaEmbedElement>
>;

export const insertMediaEmbed = (
  editor: BasePlateEditor,
  { url = '' }: Partial<TMediaEmbedElement>,
  options: InsertNodesOptions = {}
): void => {
  if (!editor.selection) return;

  const selectionParentEntry = editor.api.parent(editor.selection);

  if (!selectionParentEntry) return;

  const [, path] = selectionParentEntry;
  const at = options.at ?? PathApi.next(path);
  const normalized = parseMediaUrl(url, {
    urlParsers: [parseTwitterUrl, parseVideoUrl],
  });

  editor.update((tx) => {
    tx.nodes.insert<TMediaEmbedElement>(
      {
        children: [{ text: '' }],
        id: normalized?.id,
        provider: normalized?.provider,
        sourceUrl: normalized?.sourceUrl,
        type: editor.getType(KEYS.mediaEmbed),
        url: normalized?.url ?? url,
      },
      {
        ...options,
        at,
      }
    );
  });
};
