import type { Editor, TCodeBlockElement } from 'platejs';

import { resetCodeBlockDecorations } from '../setCodeBlockToDecorations';
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

    // Reset decorations to trigger re-highlighting
    resetCodeBlockDecorations(element);

    // Force the editor to re-render by slightly changing the selection
    // This triggers the decorate function to run again
    const { selection } = editor;
    if (selection) {
      editor.tf.setSelection(selection);
    }
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
