import { type Node, type Path, ElementApi } from '@platejs/plite';

import {
  getCompiledPlatePluginByType,
  getResolvedPluginTargetBinding,
} from '../../internal/plugin/compilePlateModel';
import type { BaseEditor } from '../editor';
import type { AnyBasePlugin } from '../plugin';

export const getInjectMatch =
  (
    editor: BaseEditor,
    plugin: Pick<AnyBasePlugin, 'inject' | 'name' | 'targetPlugins'>
  ) =>
  (node: Node, path?: Path) => {
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

    if (plugin.targetPlugins.length > 0 && !element) return false;
    if (_isElement && !element) return false;
    if (_isBlock && (!element || !editor.read.schema.isBlock(element))) {
      return false;
    }
    if (isLeaf && element) return false;
    if (element?.type) {
      const elementPlugin = getCompiledPlatePluginByType(editor, element.type);

      // Exclude plugins
      if (
        elementPlugin &&
        excludePlugins?.some((target) => {
          const portal = editor.plugin(target);

          return portal.installed && portal.name === elementPlugin.name;
        })
      ) {
        return false;
      }
      // Target plugins
      if (
        plugin.targetPlugins.length > 0 &&
        (!elementPlugin || !targetBinding.names.includes(elementPlugin.name))
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
        const installedExcludePlugins = excludeBelowPlugins.flatMap(
          (target) => {
            const portal = editor.plugin(target);

            if (!portal.installed) return [];

            return [typeof target === 'string' ? portal.schema.type : target];
          }
        );
        const isBelow =
          installedExcludePlugins.length > 0 &&
          editor.read.nodes.above({
            at: path,
            type: installedExcludePlugins,
          });

        if (isBelow) return false;
      }
    }

    return true;
  };
