import { incrementKey } from '../stores/plate/plate.actions';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';
import { flattenDeepPlugins } from './flattenDeepPlugins';

/**
 * Flatten deep plugins then set editor.plugins and editor.pluginsByKey
 */
export const setPlatePlugins = <T = {}>(
  editor: PlateEditor<T>,
  plugins: PlatePlugin<T>[]
) => {
  editor.plugins = [];
  editor.pluginsByKey = {};

  flattenDeepPlugins(editor, plugins);

  incrementKey('keyPlugins', editor.id);
};
