import { InsertNodesOptions } from '@udecode/slate-plugins-common';
import { SlatePluginOptions } from '@udecode/slate-plugins-core';

export interface WithCodeBlockOptions {
  /**
   * Valid children types for code_block, in addition to code_line types.
   */
  // validCodeBlockChildrenTypes?: string[];
}

export interface CodeBlockInsertOptions
  extends Pick<SlatePluginOptions, 'defaultType'> {
  level?: number;
  insertNodesOptions?: Omit<InsertNodesOptions, 'match'>;
}
