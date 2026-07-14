import type { BaseEditor, WithRequiredKey } from '@platejs/core';
import type { TMediaElement } from '@platejs/utils';
import { isUrl as defaultIsUrl } from '@udecode/utils';

import type { MediaPluginConfig } from '../../../lib/media/types';

import { parseMediaUrl } from '../../../lib/media/parseMediaUrl';
import { parseTwitterUrl } from '../../../lib/media-embed/parseTwitterUrl';
import { parseVideoUrl } from '../../../lib/media-embed/parseVideoUrl';
import { FloatingMediaStore } from './FloatingMediaStore';

export const submitFloatingMedia = (
  editor: BaseEditor,
  {
    element,
    plugin,
  }: {
    element: TMediaElement;
    plugin: WithRequiredKey<MediaPluginConfig>;
  }
) => {
  let url = FloatingMediaStore.get('url');

  if (url === element.url) {
    FloatingMediaStore.actions.reset();

    return true;
  }

  const { isUrl = defaultIsUrl, transformUrl } = editor
    .plugin(plugin)
    .getOptions();
  if (transformUrl) {
    url = transformUrl(url);
  }

  if (!isUrl(url)) return;

  const normalized = parseMediaUrl(url, {
    urlParsers: [parseTwitterUrl, parseVideoUrl],
  });

  editor.update.nodes.set<TMediaElement>({
    id: normalized?.id,
    provider: normalized?.provider,
    sourceUrl: normalized?.sourceUrl,
    url: normalized?.url ?? url,
  });

  FloatingMediaStore.actions.reset();

  editor.api.dom.focus();

  return true;
};
