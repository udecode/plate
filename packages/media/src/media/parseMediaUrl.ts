import { getPluginOptions, PlateEditor, Value } from '@udecode/plate-core';
import { MediaPlugin } from './types';

export type EmbedUrlData = {
  url?: string;
  provider?: string;
  id?: string;
};

export const parseMediaUrl = <V extends Value>(
  editor: PlateEditor<V>,
  {
    pluginKey,
    url,
  }: {
    pluginKey: string;
    url: string;
  }
): EmbedUrlData | undefined => {
  const { rules } = getPluginOptions<MediaPlugin, V>(editor, pluginKey);
  if (!rules) return;

  for (const rule of rules) {
    const parsed = rule.parseUrl(url);
    if (parsed) {
      return parsed;
    }
  }
};
