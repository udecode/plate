import type { TDescendant } from '@udecode/slate';

import type { HandlerReturnType } from './DOMHandlers';

export type PlatePluginInsertDataOptions = {
  data: string;
  dataTransfer: DataTransfer;
};

export type PlatePluginInsertData = {
  /** Format to get data. Example data types are text/plain and text/uri-list. */
  format?: string;

  /** Deserialize data to fragment */
  getFragment?: (
    options: PlatePluginInsertDataOptions
  ) => TDescendant[] | undefined;

  /**
   * Function called on `editor.insertData` just before `editor.insertFragment`.
   * Default: if the block above the selection is empty and the first fragment
   * node type is not inline, set the selected node type to the first fragment
   * node type.
   *
   * @returns If true, the next handlers will be skipped.
   */
  preInsert?: (
    fragment: TDescendant[],
    options: PlatePluginInsertDataOptions
  ) => HandlerReturnType;

  // injected

  /** Query to skip this plugin. */
  query?: (options: PlatePluginInsertDataOptions) => boolean;

  /** Transform the inserted data. */
  transformData?: (
    data: string,
    options: { dataTransfer: DataTransfer }
  ) => string;

  /** Transform the fragment to insert. */
  transformFragment?: (
    fragment: TDescendant[],
    options: PlatePluginInsertDataOptions
  ) => TDescendant[];
};
