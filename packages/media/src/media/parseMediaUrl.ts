import React, { HTMLAttributes } from 'react';
import { getPluginOptions, PlateEditor, Value } from '@udecode/plate-common';

import { MediaPlugin } from './types';

export type EmbedUrlData = {
  url?: string;
  provider?: string;
  id?: string;
  component?: React.FC<EmbedUrlData & HTMLAttributes<HTMLDivElement>>;
};

export const parseMediaUrl = <V extends Value>(
  editor: PlateEditor<V>,
  {
    pluginKey,
    url,
  }: {
    pluginKey: string;
    url?: string;
  }
): EmbedUrlData | undefined => {
  if (!url) return;

  const { rules } = getPluginOptions<MediaPlugin, V>(editor, pluginKey);
  if (!rules) return;

  for (const { parser, component } of rules) {
    const parsed = parser(url);
    if (parsed) {
      return { ...parsed, component };
    }
  }
};
