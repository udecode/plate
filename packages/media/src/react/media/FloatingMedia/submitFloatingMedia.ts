import {
  type PluginConfig,
  type SlateEditor,
  isUrl,
  setNodes,
} from '@udecode/plate-common';
import { focusEditor } from '@udecode/plate-common/react';

import type { MediaPluginOptions, TMediaElement } from '../../../lib/media/types';

import {
  floatingMediaActions,
  floatingMediaSelectors,
} from './floatingMediaStore';

export const submitFloatingMedia = (
  editor: SlateEditor,
  {
    element,
    pluginKey,
  }: {
    element: TMediaElement;
    pluginKey: string;
  }
) => {
  let url = floatingMediaSelectors.url();

  if (url === element.url) {
    floatingMediaActions.reset();

    return true;
  }

  const { isUrl: _isUrl = isUrl, transformUrl } = editor.getOptions<
    PluginConfig<any, MediaPluginOptions>
  >({ key: pluginKey });
  const isValid = _isUrl(url);

  if (!isValid) return;
  if (transformUrl) {
    url = transformUrl(url);
  }

  setNodes<TMediaElement>(editor, {
    url,
  });

  floatingMediaActions.reset();

  focusEditor(editor, editor.selection!);

  return true;
};
