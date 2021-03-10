import { InsertNodesOptions } from '@udecode/slate-plugins-common';

export interface WithCodeBlockOptions {
  /**
   * Valid children types for code_block, in addition to code_line types.
   */
  // validCodeBlockChildrenTypes?: string[];
}

export interface CodeBlockInsertOptions {
  defaultType?: string;
  level?: number;
  insertNodesOptions?: Omit<InsertNodesOptions, 'match'>;
}
