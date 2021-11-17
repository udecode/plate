import { TDescendant } from '../slate/TDescendant';
import { HandlerReturnType } from './DOMHandlers';
import { PlatePluginInsertDataOptions } from './PlatePluginInsertData';

export type PlatePluginInjectedPlugin = {
  /**
   * Disable the plugin if return true.
   */
  isDisabled?: boolean;

  /**
   * Function called on `editor.insertData` just before `editor.insertFragment`.
   * Default: if the block above the selection is empty and the first fragment node type is not inline,
   * set the selected node type to the first fragment node type.
   * @return if true, the next handlers will be skipped.
   */
  preInsert?: (
    fragment: TDescendant[],
    options: PlatePluginInsertDataOptions
  ) => HandlerReturnType;

  /**
   * Transform the inserted data.
   */
  transformData?: (
    data: string,
    options: { dataTransfer: DataTransfer }
  ) => string;

  /**
   * Transform the fragment to insert.
   */
  transformFragment?: (
    fragment: TDescendant[],
    options: PlatePluginInsertDataOptions
  ) => TDescendant[];
};
