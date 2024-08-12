import {
  type PlateEditor,
  getPluginOptions,
  sanitizeUrl,
} from '@udecode/plate-common';

import { ELEMENT_LINK, type LinkPluginOptions } from '../LinkPlugin';

export const validateUrl = (editor: PlateEditor, url: string): boolean => {
  const { allowedSchemes, dangerouslySkipSanitization, isUrl } =
    getPluginOptions<LinkPluginOptions>(editor, ELEMENT_LINK);

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
