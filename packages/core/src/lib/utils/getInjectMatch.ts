import type { Path } from 'slate';

import { type TNode, getAboveNode, isBlock, isElement } from '@udecode/slate';
import { findNodePath } from '@udecode/slate-react';

import type { SlateEditor } from '../editor';
import type { EditorPlugin } from '../plugin';

import { getKeyByType, getKeysByTypes } from './getKeysByTypes';

export const getInjectMatch = <E extends SlateEditor>(
  editor: E,
  plugin: EditorPlugin
) => {
  return (node: TNode, _path?: Path) => {
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

    const element = isElement(node) ? node : undefined;

    if (_isElement && element) return false;
    if (_isBlock && (!element || !isBlock(editor, element))) return false;
    if (isLeaf && element) return false;
    if (element?.type) {
      // Exclude plugins
      if (excludePlugins?.includes(getKeyByType(editor, element.type))) {
        if (element?.type === 'table') {
          console.log('excludePlugins', excludePlugins);
        }

        return false;
      }
      // Target plugins
      if (
        targetPlugins &&
        !targetPlugins.includes(getKeyByType(editor, element.type))
      ) {
        return false;
      }
    }
    // Exclude below plugins
    if (excludeBelowPlugins || maxLevel) {
      const path = _path || findNodePath(editor, node);

      if (path) {
        if (maxLevel && path.length > maxLevel) {
          return false;
        }
        if (excludeBelowPlugins) {
          const excludeTypes = getKeysByTypes(editor, excludeBelowPlugins);
          const isBelow = getAboveNode(editor, {
            at: path,
            match: (n) => isElement(n) && excludeTypes.includes(n.type),
          });

          if (isBelow) return false;
        }
      }
    }

    return true;
  };
};
