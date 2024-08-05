import {
  type TElement,
  type WithOverride,
  getNode,
  insertElements,
  isElement,
  setElements,
} from '@udecode/plate-common/server';

import type { NormalizeTypesPluginOptions } from './NormalizeTypesPlugin';

export const withNormalizeTypes: WithOverride<NormalizeTypesPluginOptions> = (
  {
    editor,
    plugin: { options: { onError, rules } }
  }
) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = ([currentNode, currentPath]) => {
    if (currentPath.length === 0) {
      const endCurrentNormalizationPass = rules!.some(
        ({ path, strictType, type }) => {
          const node = getNode<TElement>(editor, path);

          if (node) {
            if (strictType && isElement(node) && node.type !== strictType) {
              setElements(
                editor,
                { type: strictType },
                {
                  at: path,
                }
              );

              return true;
            }
          } else {
            try {
              insertElements(
                editor,
                {
                  children: [{ text: '' }],
                  type: strictType ?? type!,
                },
                { at: path }
              );

              return true;
            } catch (error) {
              onError?.(error);
            }
          }

          return false;
        }
      );

      if (endCurrentNormalizationPass) {
        return;
      }
    }

    return normalizeNode([currentNode, currentPath]);
  };

  return editor;
};
