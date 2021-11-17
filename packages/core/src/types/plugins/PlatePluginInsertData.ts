import { PlateEditor } from '../PlateEditor';
import { TDescendant } from '../slate/TDescendant';
import { WithPlatePlugin } from './PlatePlugin';

export type PlatePluginInsertDataOptions = {
  data: string;
  dataTransfer: DataTransfer;
};

export type PlatePluginInsertData<T = {}, P = {}> = {
  /**
   * Format to get data. Example data types are text/plain and text/uri-list.
   */
  format?: string;

  /**
   * Query to skip this plugin.
   */
  query?: (
    editor: PlateEditor<T>,
    plugin: WithPlatePlugin<T, P>,
    options: PlatePluginInsertDataOptions
  ) => boolean;

  /**
   * Deserialize data to fragment
   */
  getFragment?: (
    editor: PlateEditor<T>,
    plugin: WithPlatePlugin<T, P>,
    options: PlatePluginInsertDataOptions
  ) => TDescendant[] | undefined;
};
