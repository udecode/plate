import type { BaseEditor } from '@platejs/core';
import type { NodeInsertNodesOptions } from '@platejs/plite';
import type { TMediaEmbedElement } from '@platejs/utils';
import { KEYS } from '@platejs/utils';

import { parseMediaUrl } from '../../media/parseMediaUrl';
import { parseTwitterUrl } from '../parseTwitterUrl';
import { parseVideoUrl } from '../parseVideoUrl';

export const insertMediaEmbed = (
  editor: BaseEditor,
  { url = '' }: Partial<TMediaEmbedElement>,
  options: NodeInsertNodesOptions<TMediaEmbedElement> = {}
): void => {
  if (!editor.read.selection() && options.at === undefined) return;

  const normalized = parseMediaUrl(url, {
    urlParsers: [parseTwitterUrl, parseVideoUrl],
  });

  editor.update.blocks.insertAfter(
    {
      children: [{ text: '' }],
      id: normalized?.id,
      provider: normalized?.provider,
      sourceUrl: normalized?.sourceUrl,
      type: editor.getType(KEYS.mediaEmbed),
      url: normalized?.url ?? url,
    },
    options
  );
};
