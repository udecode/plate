import type {
  HotkeyPlugin,
  InsertNodesOptions,
  TElement,
  Value,
} from '@udecode/plate-common';
import type { Token, languages, tokenize } from 'prismjs';

export type Prism = {
  Token: typeof Token;
  languages: typeof languages;
  tokenize: typeof tokenize;
};

export interface CodeBlockPlugin extends HotkeyPlugin {
  deserializers?: string[];
  prism?: Prism;
  syntax?: boolean;
  syntaxPopularFirst?: boolean;
}

export interface TCodeBlockElement extends TElement {
  lang?: string;
}

export interface CodeBlockInsertOptions<V extends Value = Value> {
  defaultType?: string;
  insertNodesOptions?: Omit<InsertNodesOptions<V>, 'match'>;
}
