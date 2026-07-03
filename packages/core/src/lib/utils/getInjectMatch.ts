import { type Node, type Path, ElementApi } from '@platejs/plite';

import type { BaseEditor } from '../editor';

import { type BasePlugin, getPluginKey, getPluginKeys } from '../plugin';

export const getInjectMatch = <E extends BaseEditor>(
  editor: E,
  plugin: Pick<BasePlugin, 'inject'>
) => {
  return (node: Node, path?: Path) => {
    const {
      excludeBelowPlugins,
      excludePlugins,
      isBlock: _isBlock,
      isElement: _isElement,
      isLeaf,
      maxLevel,
      targetPlugins,
    } = plugin.inject ?? {};

    const element = ElementApi.isElement(node) ? node : undefined;

    if (_isElement && !element) return false;
    if (_isBlock && (!element || !editor.read.schema.isBlock(element))) {
      return false;
    }
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
      if (!path) return false;

      if (maxLevel && path.length > maxLevel) {
        return false;
      }
      if (excludeBelowPlugins) {
        const excludeTypes = getPluginKeys(editor, excludeBelowPlugins);
        const isBelow = editor.read.nodes.above({
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
