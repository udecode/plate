import type { TDescendant } from '@udecode/slate';

import type { HandlerReturnType } from './DOMHandlers';
import type { PlatePluginContext } from './PlatePlugin';

export type PlatePluginInsertDataOptions = {
  data: string;
  dataTransfer: DataTransfer;
};

export type PlatePluginInsertData<O = {}, A = {}, T = {}, S = {}> = {
  /** Format to get data. Example data types are text/plain and text/uri-list. */
  format?: string;

  /** Deserialize data to fragment */
  getFragment?: (
    options: PlatePluginContext<string, O, A, T, S> &
      PlatePluginInsertDataOptions
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
    options: { fragment: TDescendant[] } & PlatePluginContext<
      string,
      O,
      A,
      T,
      S
    > &
      PlatePluginInsertDataOptions
  ) => HandlerReturnType;

  // injected

  /** Query to skip this plugin. */
  query?: (
    options: PlatePluginContext<string, O, A, T, S> &
      PlatePluginInsertDataOptions
  ) => boolean;

  /** Transform the inserted data. */
  transformData?: (
    options: PlatePluginContext<string, O, A, T, S> &
      PlatePluginInsertDataOptions
  ) => string;

  /** Transform the fragment to insert. */
  transformFragment?: (
    options: { fragment: TDescendant[] } & PlatePluginContext<
      string,
      O,
      A,
      T,
      S
    > &
      PlatePluginInsertDataOptions
  ) => TDescendant[];
};
