import {
  type PlateEditor,
  getPluginOptions,
  sanitizeUrl,
} from '@udecode/plate-common';

import { LinkPlugin, type LinkPluginOptions } from '../LinkPlugin';

export const validateUrl = (editor: PlateEditor, url: string): boolean => {
  const { allowedSchemes, dangerouslySkipSanitization, isUrl } =
    getPluginOptions<LinkPluginOptions>(editor, LinkPlugin.key);

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
