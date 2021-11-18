import { HotkeyPlugin, InsertNodesOptions } from '@udecode/plate-core';

export interface CodeBlockPlugin extends HotkeyPlugin {
  syntax?: boolean;
  syntaxPopularFirst?: boolean;
  deserializers?: string[];
}

export interface CodeBlockNodeData {
  lang?: string;
}

export interface CodeBlockInsertOptions {
  defaultType?: string;
  level?: number;
  insertNodesOptions?: Omit<InsertNodesOptions, 'match'>;
}
