import {
  type PluginConfig,
  type SlateEditor,
  type WithRequiredKey,
  isUrl,
} from '@udecode/plate';

import type {
  MediaPluginOptions,
  TMediaElement,
} from '../../../lib/media/types';

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
  const isValid = _isUrl(url);

  if (!isValid) return;
  if (transformUrl) {
    url = transformUrl(url);
  }

  editor.tf.setNodes<TMediaElement>({
    url,
  });

  FloatingMediaStore.actions.reset();

  editor.tf.focus({ at: editor.selection! });

  return true;
};
