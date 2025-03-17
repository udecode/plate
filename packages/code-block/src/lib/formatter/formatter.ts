import type { Editor } from '@udecode/plate';

import type { TCodeBlockElement } from '../types';

import { formatJson, isValidJson } from './jsonFormatter';

const supportedLanguages = new Set(['json']);

export const isLangSupported = (lang?: string): boolean =>
  Boolean(lang && supportedLanguages.has(lang));

export const isValidSyntax = (code: string, lang?: string): boolean => {
  if (!isLangSupported(lang)) {
    return false;
  }

  switch (lang) {
    case 'json': {
      return isValidJson(code);
    }
    default: {
      return false;
    }
  }
};

export const formatCodeBlock = (
  editor: Editor,
  {
    element,
  }: {
    element: TCodeBlockElement;
  }
) => {
  const { lang } = element;

  if (!lang || !isLangSupported(lang)) {
    return;
  }

  const code = editor.api.string(element);

  if (isValidSyntax(code, lang)) {
    const formattedCode = formatCode(code, lang);
    editor.tf.insertText(formattedCode, { at: element });
  }
};

const formatCode = (code: string, lang?: string): string => {
  switch (lang) {
    case 'json': {
      return formatJson(code);
    }
    default: {
      return code;
    }
  }
};
