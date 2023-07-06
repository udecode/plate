import {
  HotkeyPlugin,
  InsertNodesOptions,
  TElement,
  Value,
} from '@udecode/plate-common';

export interface CodeBlockPlugin extends HotkeyPlugin {
  syntax?: boolean;
  syntaxPopularFirst?: boolean;
  deserializers?: string[];
}

export interface TCodeBlockElement extends TElement {
  lang?: string;
}

export interface CodeBlockInsertOptions<V extends Value = Value> {
  defaultType?: string;
  insertNodesOptions?: Omit<InsertNodesOptions<V>, 'match'>;
}
