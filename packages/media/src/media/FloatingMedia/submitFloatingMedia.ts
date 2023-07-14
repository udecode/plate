import {
  focusEditor,
  getPluginOptions,
  isUrl,
  PlateEditor,
  setNodes,
  Value,
} from '@udecode/plate-common';

import { ELEMENT_MEDIA, MediaPlugin, TMediaElement } from '../types';
import {
  floatingMediaActions,
  floatingMediaSelectors,
} from './floatingMediaStore';

export const submitFloatingMedia = <V extends Value>(
  editor: PlateEditor<V>,
  {
    element,
    pluginKey = ELEMENT_MEDIA,
  }: {
    element: TMediaElement;
    pluginKey?: string;
  }
) => {
  let url = floatingMediaSelectors.url();

  if (url === element.url) {
    floatingMediaActions.reset();
    return true;
  }

  const { isUrl: _isUrl = isUrl, transformUrl } = getPluginOptions<
    MediaPlugin,
    V
  >(editor, pluginKey);
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
