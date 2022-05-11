import { TElement } from '@udecode/plate-core';

export interface TablePluginOptions {
  header?: boolean;
}

export interface TTableElement extends TElement {
  colSizes?: number[];
}
