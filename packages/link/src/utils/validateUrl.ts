import {
  type PlateEditor,
  type Value,
  getPluginOptions,
  sanitizeUrl,
} from '@udecode/plate-common/server';

import { ELEMENT_LINK, type LinkPlugin } from '../createLinkPlugin';

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
