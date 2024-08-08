import type { PlateEditor } from '../types/PlateEditor';

/** Get plugin keys by types */
export const getKeysByTypes = (
  editor: PlateEditor,
  types: string[]
): string[] => {
  return Object.values(editor.pluginsByKey)
    .filter((plugin) => types.includes(plugin.type))
    .map((plugin) => plugin.key);
};

/** Get plugin key by type */
export const getKeyByType = (editor: PlateEditor, type: string): string => {
  const plugin = Object.values(editor.pluginsByKey).find(
    (plugin) => plugin.type === type
  );

  return plugin?.key ?? type;
};
