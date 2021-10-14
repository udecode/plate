import { InsertNodesOptions } from '@udecode/plate-common';
import { PlatePluginOptions } from '@udecode/plate-core';

export interface CodeBlockPluginOptions extends PlatePluginOptions {
  syntax?: boolean;
  syntaxPopularFirst?: boolean;
  deserializers?: string[];
}

export interface CodeBlockNodeData {
  lang?: string;
}

export interface WithCodeBlockOptions {
  /**
   * Valid children types for code_block, in addition to code_line types.
   */
  // validCodeBlockChildrenTypes?: string[];
}

export interface CodeBlockInsertOptions
  extends Pick<PlatePluginOptions, 'defaultType'> {
  level?: number;
  insertNodesOptions?: Omit<InsertNodesOptions, 'match'>;
}
