import {
  HotkeyPlugin,
  InsertNodesOptions,
  TElement,
  Value,
} from '@udecode/plate-core';

export interface CodeBlockPlugin extends HotkeyPlugin {
  syntax?: boolean;
  syntaxPopularFirst?: boolean;
  deserializers?: string[];
}

export interface TCodeBlockElement extends TElement {
  lang?: string;
}

export interface CodeBlockInsertOptions<V extends Value> {
  defaultType?: string;
  level?: number;
  insertNodesOptions?: Omit<InsertNodesOptions<V>, 'match'>;
}
