import type { SlateEditor } from '../editor';

/** Get plugin keys by types */
export const getKeysByTypes = (
  editor: SlateEditor,
  types: string[]
): string[] => {
  return Object.values(editor.plugins)
    .filter((plugin) => types.includes(plugin.node.type))
    .map((plugin) => plugin.key);
};

/** Get plugin key by type */
export const getKeyByType = (editor: SlateEditor, type: string): string => {
  const plugin = Object.values(editor.plugins).find(
    (plugin) => plugin.node.type === type
  );

  return plugin?.key ?? type;
};
