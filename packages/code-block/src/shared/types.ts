import type {
  HotkeyPlugin,
  InsertNodesOptions,
  TElement,
  Value,
} from '@udecode/plate-common';

export interface CodeBlockPlugin extends HotkeyPlugin {
  deserializers?: string[];
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
