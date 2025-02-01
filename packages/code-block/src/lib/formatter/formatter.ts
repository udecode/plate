import { formatJson, isValidJson } from './jsonFormatter';

const supportedLanguages = new Set(['json']);

export const isLangSupported = (lang?: string): boolean =>
  Boolean(lang && supportedLanguages.has(lang));

export const formatCode = (code: string, lang?: string): string => {
  if (!isLangSupported(lang)) {
    return '';
  }

  switch (lang) {
    case 'json': {
      return formatJson(code);
    }
    default: {
      return code;
    }
  }
};

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
