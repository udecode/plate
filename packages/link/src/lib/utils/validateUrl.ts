import { type SlateEditor, sanitizeUrl } from '@udecode/plate-common';

import { BaseLinkPlugin } from '../BaseLinkPlugin';

export const validateUrl = (editor: SlateEditor, url: string): boolean => {
  const { allowedSchemes, dangerouslySkipSanitization, isUrl } =
    editor.getOptions(BaseLinkPlugin);

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
