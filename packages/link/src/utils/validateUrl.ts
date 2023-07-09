import {
  PlateEditor,
  Value,
  getPluginOptions,
  sanitizeUrl,
} from '@udecode/plate-common';

import { ELEMENT_LINK, LinkPlugin } from '../createLinkPlugin';

export const validateUrl = <V extends Value>(
  editor: PlateEditor<V>,
  url: string
): boolean => {
  const { allowedSchemes, isUrl, dangerouslySkipSanitization } =
    getPluginOptions<LinkPlugin, V>(editor, ELEMENT_LINK);

  if (isUrl && !isUrl(url)) return false;

  if (
    !dangerouslySkipSanitization &&
    !sanitizeUrl(url, {
      allowedSchemes,
      permitInvalid: true,
    })
  )
    return false;

  return true;
};
