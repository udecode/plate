import {
  type PluginConfig,
  type SlateEditor,
  type TMediaElement,
  type WithRequiredKey,
  isUrl,
} from 'platejs';

import type { MediaPluginOptions } from '../../../lib/media/types';

import { parseMediaUrl } from '../../../lib/media/parseMediaUrl';
import { parseTwitterUrl } from '../../../lib/media-embed/parseTwitterUrl';
import { parseVideoUrl } from '../../../lib/media-embed/parseVideoUrl';
import { FloatingMediaStore } from './FloatingMediaStore';

export const submitFloatingMedia = (
  editor: SlateEditor,
  {
    element,
    plugin,
  }: {
    element: TMediaElement;
    plugin: WithRequiredKey;
  }
) => {
  let url = FloatingMediaStore.get('url');

  if (url === element.url) {
    FloatingMediaStore.actions.reset();

    return true;
  }

  const { isUrl: _isUrl = isUrl, transformUrl } =
    editor.getOptions<PluginConfig<any, MediaPluginOptions>>(plugin);
  if (transformUrl) {
    url = transformUrl(url);
  }

  const isValid = _isUrl(url);

  if (!isValid) return;

  const normalized = parseMediaUrl(url, {
    urlParsers: [parseTwitterUrl, parseVideoUrl],
  });

  editor.tf.setNodes<TMediaElement>({
    id: normalized?.id,
    provider: normalized?.provider,
    sourceUrl: normalized?.sourceUrl,
    url: normalized?.url ?? url,
  });

  FloatingMediaStore.actions.reset();

  editor.tf.focus({ at: editor.selection! });

  return true;
};
