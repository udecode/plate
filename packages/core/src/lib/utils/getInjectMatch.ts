import { type Node, type Path, ElementApi } from '@platejs/plite';

import type { BaseEditor } from '../editor';

import type { AnyBasePlugin } from '../plugin';
import {
  getCompiledPlatePluginName,
  getResolvedPluginTargetBinding,
} from '../../internal/plugin/compilePlateModel';

export const getInjectMatch = <E extends BaseEditor>(
  editor: E,
  plugin: Pick<AnyBasePlugin, 'inject' | 'name' | 'targetPluginNames'>
) => {
  return (node: Node, path?: Path) => {
    const {
      excludeBelowPlugins,
      excludePlugins,
      isBlock: _isBlock,
      isElement: _isElement,
      isLeaf,
      maxLevel,
    } = plugin.inject ?? {};
    const targetBinding = getResolvedPluginTargetBinding(editor, plugin);

    const element = ElementApi.isElement(node) ? node : undefined;

    if (_isElement && !element) return false;
    if (_isBlock && (!element || !editor.read.schema.isBlock(element))) {
      return false;
    }
    if (isLeaf && element) return false;
    if (element?.type) {
      const pluginName = getCompiledPlatePluginName(editor, element.type);

      // Exclude plugins
      if (pluginName && excludePlugins?.includes(pluginName)) {
        return false;
      }
      // Target plugins
      if (
        plugin.targetPluginNames.length > 0 &&
        (!pluginName || !targetBinding.names.includes(pluginName))
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
        const excludeTypes = excludeBelowPlugins.map((name) => {
          const portal = editor.plugin(name);

          return portal.installed ? portal.type : name;
        });
        const isBelow = editor.read.nodes.above({
          at: path,
          match: { type: excludeTypes },
        });

        if (isBelow) return false;
      }
    }

    return true;
  };
};
