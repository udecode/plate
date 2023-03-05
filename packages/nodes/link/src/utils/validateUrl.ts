import {
  getPluginOptions,
  PlateEditor,
  sanitizeUrl,
  Value,
} from '@udecode/plate-core';
import { ELEMENT_LINK, LinkPlugin } from '../createLinkPlugin';

export const validateUrl = <V extends Value>(
  editor: PlateEditor<V>,
  url: string
): boolean => {
  const { allowedSchemes, isUrl } = getPluginOptions<LinkPlugin, V>(
    editor,
    ELEMENT_LINK
  );

  if (isUrl && !isUrl(url)) return false;

  if (
    !sanitizeUrl(url, {
      allowedSchemes,
      permitInvalid: true,
    })
  )
    return false;

  return true;
};
