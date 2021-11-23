/**
 * Unique key to store the plugins by key.
 */
export type PluginKey = string;

export interface PlatePluginKey {
  /**
   * Property used by Plate to store the plugins by key in `editor.pluginsByKey`.
   */
  key?: PluginKey;
}
