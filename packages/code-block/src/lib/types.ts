import type { TElement } from '@udecode/plate';
import type { Token, languages, tokenize } from 'prismjs';

export type Prism = {
  Token: typeof Token;
  languages: typeof languages;
  tokenize: typeof tokenize;
};

export interface TCodeBlockElement extends TElement {
  lang?: string;
}
