import { type Path, type TNode, ElementApi } from '@platejs/slate';

import type { SlateEditor } from '../editor';

import { type EditorPlugin, getPluginKey, getPluginKeys } from '../plugin';

export const getInjectMatch = <E extends SlateEditor>(
  editor: E,
  plugin: EditorPlugin
) => {
  return (node: TNode, path: Path) => {
    const {
      inject: {
        excludeBelowPlugins,
        excludePlugins,
        isBlock: _isBlock,
        isElement: _isElement,
        isLeaf,
        maxLevel,
        targetPlugins,
      },
    } = plugin;

    const element = ElementApi.isElement(node) ? node : undefined;

    if (_isElement && !element) return false;
    if (_isBlock && (!element || !editor.api.isBlock(element))) return false;
    if (isLeaf && element) return false;
    if (element?.type) {
      // Exclude plugins
      if (excludePlugins?.includes(getPluginKey(editor, element.type)!)) {
        return false;
      }
      // Target plugins
      if (
        targetPlugins &&
        !targetPlugins.includes(getPluginKey(editor, element.type)!)
      ) {
        return false;
      }
    }
    // Exclude below plugins
    if (excludeBelowPlugins || maxLevel) {
      if (maxLevel && path.length > maxLevel) {
        return false;
      }
      if (excludeBelowPlugins) {
        const excludeTypes = getPluginKeys(editor, excludeBelowPlugins);
        const isBelow = editor.api.above({
          at: path,
          match: (n) =>
            ElementApi.isElement(n) && excludeTypes.includes(n.type),
        });

        if (isBelow) return false;
      }
    }

    return true;
  };
};
