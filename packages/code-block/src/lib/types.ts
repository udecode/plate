import type { TElement } from '@udecode/plate';
import type { languages, Token, tokenize } from 'prismjs';

export type Prism = {
  languages: typeof languages;
  Token: typeof Token;
  tokenize: typeof tokenize;
};

export interface TCodeBlockElement extends TElement {
  lang?: string;
}
