import type { Editor } from '@udecode/plate';

import type { TCodeBlockElement } from '../../lib';

import {
  isLangSupported as _isLangSupported,
  isValidSyntax as _isValidSyntax,
  formatCode,
} from '../../lib/formatter/formatter';

export const formatCodeBlock = (
  editor: Editor,
  {
    element,
  }: {
    element: TCodeBlockElement;
  }
) => {
  const { lang: language } = element;

  if (!language || !_isLangSupported(language)) {
    return;
  }

  const code = editor.api.string(element);

  if (_isValidSyntax(code, language)) {
    const formattedCode = formatCode(code, language);
    editor.tf.insertText(formattedCode, { at: element });
  }
};

export const isValidSyntax = (code: string, language: string) => {
  return _isValidSyntax(code, language);
};

export const isLangSupported = (element: TCodeBlockElement) => {
  return _isLangSupported(element.lang);
};
