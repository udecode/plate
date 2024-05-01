import type { EElementOrText, Value } from '@udecode/slate';

import type { HandlerReturnType } from './DOMHandlers';

export type PlatePluginInsertDataOptions = {
  data: string;
  dataTransfer: DataTransfer;
};

export type PlatePluginInsertData<V extends Value = Value> = {
  /** Format to get data. Example data types are text/plain and text/uri-list. */
  format?: string;

  /** Deserialize data to fragment */
  getFragment?: (
    options: PlatePluginInsertDataOptions
  ) => EElementOrText<V>[] | undefined;

  /**
   * Function called on `editor.insertData` just before `editor.insertFragment`.
   * Default: if the block above the selection is empty and the first fragment
   * node type is not inline, set the selected node type to the first fragment
   * node type.
   *
   * @returns If true, the next handlers will be skipped.
   */
  preInsert?: (
    fragment: EElementOrText<V>[],
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
    fragment: EElementOrText<V>[],
    options: PlatePluginInsertDataOptions
  ) => EElementOrText<V>[];
};
