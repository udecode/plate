import {
  type PlateEditor,
  type Value,
  getPluginOptions,
  sanitizeUrl,
} from '@udecode/plate-common/server';

import { ELEMENT_LINK, type LinkPlugin } from '../createLinkPlugin';

/**
 * Check the uri is encoded
 *
 * @param uri String
 */
export const isEncoded = (uri: string): boolean => {
  return uri !== decodeURIComponent(uri);
};

export const validateUrl = <V extends Value>(
  editor: PlateEditor<V>,
  url: string
): boolean => {
  const { allowedSchemes, dangerouslySkipSanitization, isUrl } =
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
