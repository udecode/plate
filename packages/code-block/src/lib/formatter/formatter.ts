import { JsonFormatter } from './jsonFormatter';

export interface IFormatter {
  format: (code: string) => string;
  validSyntax: (code: string) => boolean;
}

const supportedLanguages = new Set(['json']);

export class Formatter {
  format(code: string, lang?: string) {
    if (!lang || !supportedLanguages.has(lang)) {
      return '';
    }

    switch (lang) {
      case 'json': {
        return new JsonFormatter().format(code);
      }
    }

    return code;
  }

  isLangSupported(lang?: string) {
    return lang && supportedLanguages.has(lang);
  }

  validSyntax(code: string, lang?: string) {
    if (!lang || !supportedLanguages.has(lang)) {
      return false;
    }

    switch (lang) {
      case 'json': {
        return new JsonFormatter().validSyntax(code);
      }
    }
  }
}
