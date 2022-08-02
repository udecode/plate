import {
  getPluginOptions,
  PlateEditor,
  RenderFunction,
  Value,
} from '@udecode/plate-core';
import { MediaPlugin } from './types';

export type EmbedUrlData = {
  url?: string;
  provider?: string;
  id?: string;
  component?: RenderFunction<EmbedUrlData>;
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
): EmbedUrlData => {
  const { rules } = getPluginOptions<MediaPlugin, V>(editor, pluginKey);
  if (!rules) return { url };

  for (const { parser, component } of rules) {
    const parsed = parser(url);
    if (parsed) {
      return { ...parsed, component };
    }
  }

  return { url };
};
