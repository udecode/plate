import { type Node, type Path, ElementApi } from '../../facade';
import {
  getCompiledPlatePlugin,
  getCompiledPlatePluginByType,
  getResolvedPluginTargetBinding,
} from '../../internal/plugin/compilePlateModel';
import type { Editor } from '../editor';
import type { AnyBasePlugin } from '../plugin';

export const getInjectMatch =
  (
    editor: Editor,
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
          const descriptor =
            typeof target === 'string'
              ? getCompiledPlatePlugin(editor, target)
              : target;

          if (!descriptor) return false;
          const portal = editor.plugin(descriptor);
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
            const descriptor =
              typeof target === 'string'
                ? getCompiledPlatePlugin(editor, target)
                : target;

            if (!descriptor) return [];
            const portal = editor.plugin(descriptor);
            if (!portal.installed) return [];

            return [portal.schema.type];
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
